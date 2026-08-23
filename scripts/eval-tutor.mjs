#!/usr/bin/env node
/**
 * Regression harness for the AI tutor's evaluator.
 *
 * Runs every labeled case in eval-tutor-cases.mjs through the real
 * api/ai/evaluate.js handler and grades the grader against hand-labeled ground
 * truth. No prompt, schema or model change should ship without running this
 * and comparing against a saved baseline.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... npm run eval:tutor
 *   npm run eval:tutor -- --save-baseline evals/baseline.json
 *   npm run eval:tutor -- --baseline evals/baseline.json     # compare + gate
 *
 * Flags
 *   --filter <substr>      only cases whose id or topic contains substr
 *   --concurrency <n>      parallel requests (default 4)
 *   --baseline <path>      compare against a saved run, non-zero exit on regression
 *   --save-baseline <path> write this run's summary for future comparison
 *   --json <path>          write full per-case results
 *   --verbose              print the evaluator's explanation for each case
 *
 * This costs one model call per case (plus retries). It is not free — run it
 * deliberately, not in a watch loop.
 */
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { CASES } from "./eval-tutor-cases.mjs";
import { ANTHROPIC_MODEL, GEMINI_MODEL } from "../api/ai/_models.js";

// ---------------------------------------------------------------- args

function flag(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

const filter = flag("filter");
const concurrency = Math.max(1, Number(flag("concurrency", 4)) || 4);
const baselinePath = flag("baseline");
const saveBaselinePath = flag("save-baseline");
const jsonPath = flag("json");
const verbose = hasFlag("verbose");

/** Regression tolerance — noise below this is not treated as a failure. */
const REGRESSION_TOLERANCE = 0.03;

// ------------------------------------------------------------- grading

const VERDICT_ORDER = { incorrect: 0, partial: 1, correct: 2 };

function gapText(result) {
  return (Array.isArray(result.gaps) ? result.gaps : []).join(" | ").toLowerCase();
}

/** A concept counts as surfaced if any of its accepted phrasings appears. */
function conceptPresent(haystack, alternatives) {
  return alternatives.some((alt) => haystack.includes(alt.toLowerCase()));
}

/** Did it find the gaps that are genuinely there? */
function scoreGapRecall(result, expected) {
  const required = expected.requiredGaps || [];
  if (required.length === 0) return { score: 1, found: 0, total: 0, missed: [] };
  const text = gapText(result);
  const missed = required.filter((alts) => !conceptPresent(text, alts));
  return {
    score: (required.length - missed.length) / required.length,
    found: required.length - missed.length,
    total: required.length,
    missed: missed.map((alts) => alts[0]),
  };
}

/**
 * Did it invent gaps? Flagging something the learner actually covered is the
 * failure mode that erodes trust fastest, so it is scored separately.
 */
function scoreGapPrecision(result, expected) {
  const forbidden = expected.forbiddenGaps || [];
  if (forbidden.length === 0) return { score: 1, falsePositives: [] };
  const text = gapText(result);
  const hits = forbidden.filter((term) => text.includes(term.toLowerCase()));
  return {
    score: (forbidden.length - hits.length) / forbidden.length,
    falsePositives: hits,
  };
}

/** Is the number in the right band? Partial credit as it drifts out. */
function scoreCalibration(result, expected) {
  const [min, max] = expected.scoreRange;
  const s = result.score;
  if (typeof s !== "number") return { score: 0, inBand: false, distance: null };
  if (s >= min && s <= max) return { score: 1, inBand: true, distance: 0 };
  const distance = s < min ? min - s : s - max;
  return { score: Math.max(0, 1 - distance / 25), inBand: false, distance };
}

function scoreRubric(result, expected) {
  const truth = expected.rubricMet || [];
  const got = Array.isArray(result.rubricScores) ? result.rubricScores : [];
  if (truth.length === 0) return { score: 1, matched: 0, total: 0 };
  if (got.length !== truth.length) {
    return { score: 0, matched: 0, total: truth.length, lengthMismatch: true };
  }
  const matched = truth.filter((t, i) => got[i].met === t).length;
  return { score: matched / truth.length, matched, total: truth.length };
}

/**
 * A hint should appear when the answer has room to grow, stay away when the
 * answer is complete, and never just hand over the answer.
 */
function scoreHint(result, expected) {
  const hint = (result.follow_up_hint || "").toLowerCase();
  const present = hint.length > 0;
  const leaked = (expected.hintMustNotLeak || []).filter((p) => hint.includes(p.toLowerCase()));

  if (leaked.length) return { score: 0, note: "leaks the answer", leaked };
  if (expected.hint === "required") {
    return present ? { score: 1, note: "" } : { score: 0, note: "missing hint" };
  }
  if (expected.hint === "none") {
    // Not a hard failure — a gentle extension prompt on a correct answer is
    // defensible, just not what we asked for.
    return present ? { score: 0.5, note: "hint on a complete answer" } : { score: 1, note: "" };
  }
  return { score: 1, note: "" };
}

const WEIGHTS = { verdict: 0.3, calibration: 0.15, gapRecall: 0.25, gapPrecision: 0.15, rubric: 0.1, hint: 0.05 };

function gradeCase(testCase, result) {
  const { expected } = testCase;

  const verdictMatch = result.verdict === expected.verdict;
  const severity =
    verdictMatch || !result.verdict
      ? 0
      : Math.abs(VERDICT_ORDER[result.verdict] - VERDICT_ORDER[expected.verdict]);

  const calibration = scoreCalibration(result, expected);
  const gapRecall = scoreGapRecall(result, expected);
  const gapPrecision = scoreGapPrecision(result, expected);
  const rubric = scoreRubric(result, expected);
  const hint = scoreHint(result, expected);

  const composite =
    WEIGHTS.verdict * (verdictMatch ? 1 : 0) +
    WEIGHTS.calibration * calibration.score +
    WEIGHTS.gapRecall * gapRecall.score +
    WEIGHTS.gapPrecision * gapPrecision.score +
    WEIGHTS.rubric * rubric.score +
    WEIGHTS.hint * hint.score;

  // A case only passes if the headline judgement AND the gaps are right.
  const passed =
    verdictMatch && gapRecall.score === 1 && gapPrecision.score === 1 && calibration.inBand;

  return {
    id: testCase.id,
    topic: testCase.topic,
    expectedVerdict: expected.verdict,
    gotVerdict: result.verdict,
    verdictMatch,
    severity,
    gotScore: result.score,
    expectedRange: expected.scoreRange,
    calibration,
    gapRecall,
    gapPrecision,
    rubric,
    hint,
    composite,
    passed,
    degraded: result.degraded === true,
    explanation: result.explanation,
  };
}

// --------------------------------------------------------------- running

async function runCase(testCase, handler) {
  let payload = null;
  const res = {
    setHeader() {},
    status() { return this; },
    json(o) { payload = o; return this; },
    end() { return this; },
  };

  try {
    await handler(
      {
        method: "POST",
        body: {
          questionPrompt: testCase.questionPrompt,
          userAnswer: testCase.userAnswer,
          rubric: testCase.rubric,
        },
      },
      res
    );
  } catch (err) {
    return { id: testCase.id, topic: testCase.topic, error: err?.message || String(err), passed: false, composite: 0 };
  }

  if (!payload) {
    return { id: testCase.id, topic: testCase.topic, error: "no response", passed: false, composite: 0 };
  }
  return gradeCase(testCase, payload);
}

async function runAll(cases, handler) {
  const results = new Array(cases.length);
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < cases.length) {
      const i = cursor++;
      results[i] = await runCase(cases[i], handler);
      done += 1;
      process.stderr.write(`\r  running… ${done}/${cases.length}   `);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, cases.length) }, worker));
  process.stderr.write("\r" + " ".repeat(30) + "\r");
  return results;
}

// --------------------------------------------------------------- reporting

function pct(n) {
  return `${(n * 100).toFixed(1)}%`;
}

function pad(s, w) {
  const str = String(s);
  return str.length >= w ? str.slice(0, w) : str + " ".repeat(w - str.length);
}

function padLeft(s, w) {
  const str = String(s);
  return str.length >= w ? str : " ".repeat(w - str.length) + str;
}

function summarize(results) {
  const graded = results.filter((r) => !r.error);
  const n = graded.length || 1;
  const mean = (fn) => graded.reduce((sum, r) => sum + fn(r), 0) / n;

  return {
    model: ANTHROPIC_MODEL,
    geminiModel: GEMINI_MODEL,
    timestamp: new Date().toISOString(),
    cases: results.length,
    errors: results.filter((r) => r.error).length,
    degraded: graded.filter((r) => r.degraded).length,
    passRate: graded.filter((r) => r.passed).length / n,
    verdictAccuracy: mean((r) => (r.verdictMatch ? 1 : 0)),
    severeVerdictErrors: graded.filter((r) => r.severity === 2).length,
    calibration: mean((r) => r.calibration.score),
    inBand: graded.filter((r) => r.calibration.inBand).length / n,
    gapRecall: mean((r) => r.gapRecall.score),
    gapPrecision: mean((r) => r.gapPrecision.score),
    rubricAccuracy: mean((r) => r.rubric.score),
    hintQuality: mean((r) => r.hint.score),
    composite: mean((r) => r.composite),
  };
}

function printCaseTable(results) {
  const W = [30, 16, 10, 10, 9, 9, 7, 6];
  const header =
    pad("case", W[0]) + pad("topic", W[1]) + pad("expected", W[2]) + pad("got", W[3]) +
    padLeft("score", W[4]) + padLeft("gaps", W[5]) + padLeft("comp", W[6]) + padLeft("", W[7]);
  console.log("\n" + header);
  console.log("-".repeat(header.length));

  for (const r of results) {
    if (r.error) {
      console.log(pad(r.id, W[0]) + pad(r.topic || "", W[1]) + `ERROR: ${r.error}`);
      continue;
    }
    const scoreCell = `${r.gotScore ?? "—"}/[${r.expectedRange[0]}-${r.expectedRange[1]}]`;
    const gapCell = r.gapRecall.total ? `${r.gapRecall.found}/${r.gapRecall.total}` : "—";
    console.log(
      pad(r.id, W[0]) +
      pad(r.topic, W[1]) +
      pad(r.expectedVerdict, W[2]) +
      pad(r.gotVerdict ?? "—", W[3]) +
      padLeft(scoreCell, W[4]) +
      padLeft(gapCell, W[5]) +
      padLeft(r.composite.toFixed(2), W[6]) +
      padLeft(r.passed ? "  ok" : "  ✗", W[7])
    );

    const notes = [];
    if (!r.verdictMatch && r.severity === 2) notes.push("SEVERE verdict flip");
    if (r.gapRecall.missed.length) notes.push(`missed gaps: ${r.gapRecall.missed.join(", ")}`);
    if (r.gapPrecision.falsePositives.length)
      notes.push(`invented gaps: ${r.gapPrecision.falsePositives.join(", ")}`);
    if (r.hint.note) notes.push(`hint: ${r.hint.note}`);
    if (r.rubric.lengthMismatch) notes.push("rubricScores length mismatch");
    if (r.degraded) notes.push("DEGRADED — provider call failed");
    for (const note of notes) console.log(pad("", W[0]) + `  ↳ ${note}`);
    if (verbose && r.explanation) console.log(pad("", W[0]) + `  ↳ "${r.explanation}"`);
  }
}

function printTopicTable(results) {
  const byTopic = new Map();
  for (const r of results.filter((x) => !x.error)) {
    if (!byTopic.has(r.topic)) byTopic.set(r.topic, []);
    byTopic.get(r.topic).push(r);
  }
  console.log("\nBy topic");
  console.log("-".repeat(52));
  for (const [topic, rows] of [...byTopic].sort()) {
    const passed = rows.filter((r) => r.passed).length;
    const comp = rows.reduce((s, r) => s + r.composite, 0) / rows.length;
    console.log(
      pad(topic, 22) + padLeft(`${passed}/${rows.length} pass`, 14) + padLeft(`composite ${comp.toFixed(2)}`, 16)
    );
  }
}

function printSummary(s) {
  console.log("\nSummary");
  console.log("-".repeat(52));
  const rows = [
    ["cases", `${s.cases}${s.errors ? ` (${s.errors} errored)` : ""}`],
    ["pass rate", pct(s.passRate)],
    ["verdict accuracy", pct(s.verdictAccuracy)],
    ["severe verdict flips", `${s.severeVerdictErrors}`],
    ["score in expected band", pct(s.inBand)],
    ["gap recall", pct(s.gapRecall)],
    ["gap precision", pct(s.gapPrecision)],
    ["rubric accuracy", pct(s.rubricAccuracy)],
    ["hint quality", pct(s.hintQuality)],
    ["composite", s.composite.toFixed(3)],
  ];
  for (const [k, v] of rows) console.log(pad(k, 26) + padLeft(v, 12));
  if (s.degraded) {
    console.log(`\n  ${s.degraded} case(s) came back DEGRADED — the provider call failed.`);
    console.log("  These numbers measure the fallback path, not the model. Fix that first.");
  }
}

const COMPARED = [
  "passRate", "verdictAccuracy", "calibration", "gapRecall",
  "gapPrecision", "rubricAccuracy", "hintQuality", "composite",
];

function compareToBaseline(current, baseline) {
  console.log("\nVersus baseline");
  console.log("-".repeat(64));
  console.log(`  baseline: ${baseline.timestamp}  model: ${baseline.model}`);
  if (baseline.model !== current.model) {
    console.log(`  NOTE: model changed (${baseline.model} → ${current.model}).`);
  }
  console.log("");

  const regressions = [];
  for (const key of COMPARED) {
    const before = baseline[key];
    const after = current[key];
    if (typeof before !== "number" || typeof after !== "number") continue;
    const delta = after - before;
    const arrow = delta > 0.0001 ? "▲" : delta < -0.0001 ? "▼" : "=";
    console.log(
      pad(key, 22) + padLeft(before.toFixed(3), 9) + padLeft(after.toFixed(3), 9) +
      padLeft(`${arrow} ${delta >= 0 ? "+" : ""}${delta.toFixed(3)}`, 14)
    );
    if (delta < -REGRESSION_TOLERANCE) regressions.push(`${key} ${delta.toFixed(3)}`);
  }

  const severeDelta = current.severeVerdictErrors - baseline.severeVerdictErrors;
  console.log(
    pad("severeVerdictErrors", 22) + padLeft(baseline.severeVerdictErrors, 9) +
    padLeft(current.severeVerdictErrors, 9) + padLeft(`${severeDelta >= 0 ? "+" : ""}${severeDelta}`, 14)
  );
  if (severeDelta > 0) regressions.push(`severeVerdictErrors +${severeDelta}`);

  return regressions;
}

// ------------------------------------------------------------------- main

if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
  console.error(
    "\nNo provider key set — every case would exercise the fallback path and the\n" +
    "numbers would measure nothing. Set ANTHROPIC_API_KEY (or GEMINI_API_KEY).\n\n" +
    "Confirm the configured model is live first:  npm run verify:models\n"
  );
  process.exit(2);
}

const selected = filter
  ? CASES.filter((c) => c.id.includes(filter) || c.topic.toLowerCase().includes(filter.toLowerCase()))
  : CASES;

if (selected.length === 0) {
  console.error(`No cases match --filter ${filter}`);
  process.exit(2);
}

console.log(`\nEvaluating ${selected.length} cases against ${ANTHROPIC_MODEL} (concurrency ${concurrency})`);

const handler = (await import("../api/ai/evaluate.js")).default;
const results = await runAll(selected, handler);
const summary = summarize(results);

printCaseTable(results);
printTopicTable(results);
printSummary(summary);

let regressions = [];
if (baselinePath) {
  try {
    regressions = compareToBaseline(summary, JSON.parse(readFileSync(baselinePath, "utf8")));
  } catch (err) {
    console.error(`\nCould not read baseline at ${baselinePath}: ${err.message}`);
    process.exit(2);
  }
}

if (jsonPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify({ summary, results }, null, 2));
  console.log(`\nFull results → ${jsonPath}`);
}

if (saveBaselinePath) {
  if (summary.degraded > 0) {
    console.error(
      "\nRefusing to save a baseline: some cases degraded, so this run measures the\n" +
      "fallback path rather than the model. Fix the provider call and re-run.\n"
    );
    process.exit(2);
  }
  mkdirSync(dirname(saveBaselinePath), { recursive: true });
  writeFileSync(saveBaselinePath, JSON.stringify(summary, null, 2));
  console.log(`\nBaseline saved → ${saveBaselinePath}`);
}

if (regressions.length) {
  console.error(`\nREGRESSION against baseline (tolerance ${REGRESSION_TOLERANCE}):`);
  for (const r of regressions) console.error(`  - ${r}`);
  console.error("");
  process.exit(1);
}

console.log("");
process.exit(summary.errors > 0 ? 1 : 0);
