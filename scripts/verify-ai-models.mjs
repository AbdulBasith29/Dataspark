#!/usr/bin/env node
/**
 * Confirms the model IDs in api/ai/_models.js are actually live, and that a
 * real evaluation round-trips through the production handler.
 *
 * This exists because claude-sonnet-4-20250514 was retired on 2026-06-15 and
 * nothing in the app noticed: the Claude path 404'd on every call and quietly
 * degraded. Run this after any model change, and before trusting a deploy.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/verify-ai-models.mjs
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/verify-ai-models.mjs --url https://your-preview.vercel.app
 *
 * With --url it also POSTs to that deployment's /api/ai/evaluate, which is the
 * end-to-end check: right model, right key, right env vars, actually deployed.
 *
 * Exit code 0 = every check passed. Non-zero = something is broken.
 */
import { ANTHROPIC_MODEL, GEMINI_MODEL } from "../api/ai/_models.js";

const urlArg = process.argv.indexOf("--url");
const deploymentUrl = urlArg !== -1 ? process.argv[urlArg + 1]?.replace(/\/$/, "") : null;

const anthropicKey = process.env.ANTHROPIC_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

const SAMPLE = {
  questionPrompt:
    "Conversion is up 15% in the treatment group of an A/B test. What would you check before shipping?",
  userAnswer:
    "I'd check whether the result is statistically significant given the sample size, confirm the randomisation actually balanced the two groups, and make sure the test ran long enough to cover a full weekly cycle rather than stopping the moment it looked good.",
  rubric: [
    "Questions statistical significance / sample size",
    "Checks randomisation or sample ratio mismatch",
    "Raises test duration or peeking",
  ],
};

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${detail ? `\n         ${detail}` : ""}`);
}

/** Cheapest possible proof a model ID still exists. */
async function checkAnthropicModelExists() {
  const res = await fetch(`https://api.anthropic.com/v1/models/${ANTHROPIC_MODEL}`, {
    headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
  });
  const body = await res.json().catch(() => null);
  if (res.status === 404) {
    record(`Anthropic model "${ANTHROPIC_MODEL}" exists`, false, "404 — retired or misspelled.");
    return;
  }
  if (!res.ok) {
    record(
      `Anthropic model "${ANTHROPIC_MODEL}" exists`,
      false,
      `HTTP ${res.status}: ${JSON.stringify(body?.error || body)}`
    );
    return;
  }
  record(`Anthropic model "${ANTHROPIC_MODEL}" exists`, true, `display_name: ${body?.display_name}`);
}

async function checkGeminiModelExists() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}?key=${encodeURIComponent(geminiKey)}`
  );
  const body = await res.json().catch(() => null);
  record(
    `Gemini model "${GEMINI_MODEL}" exists`,
    res.ok,
    res.ok ? `displayName: ${body?.displayName}` : `HTTP ${res.status}: ${JSON.stringify(body?.error)}`
  );
}

/**
 * Runs the real handler in-process against the live API — exercises the forced
 * tool call and the normalizer, not just model existence.
 */
async function checkLocalHandler() {
  const handler = (await import("../api/ai/evaluate.js")).default;
  let payload = null;
  const res = {
    setHeader() {},
    status() { return this; },
    json(o) { payload = o; return this; },
    end() { return this; },
  };

  await handler({ method: "POST", body: SAMPLE }, res);

  if (!payload) return record("Handler returned a response", false);
  if (payload.degraded) {
    return record(
      "Handler returns a scored evaluation",
      false,
      `Degraded — the provider call failed. See the [ai/evaluate] logs above.\n         explanation: ${payload.explanation}`
    );
  }

  const scored = typeof payload.score === "number" && payload.score >= 0 && payload.score <= 100;
  const verdictOk = ["correct", "partial", "incorrect"].includes(payload.verdict);
  record(
    "Handler returns a scored evaluation",
    scored && verdictOk && Boolean(payload.explanation),
    `score=${payload.score} verdict=${payload.verdict} gaps=${payload.gaps?.length ?? 0}` +
      `\n         "${String(payload.explanation).slice(0, 140)}"`
  );
}

/** End-to-end against a real deployment: proves the env vars shipped too. */
async function checkDeployment() {
  const endpoint = `${deploymentUrl}/api/ai/evaluate`;
  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SAMPLE),
    });
  } catch (err) {
    return record(`POST ${endpoint}`, false, err?.message);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) return record(`POST ${endpoint}`, false, `HTTP ${res.status}`);
  if (!body || body.degraded) {
    return record(
      `POST ${endpoint} returns a scored evaluation`,
      false,
      body?.degraded
        ? "Deployment degraded — model ID or ANTHROPIC_API_KEY is wrong in that environment's Vercel env vars."
        : "No JSON body."
    );
  }
  record(
    `POST ${endpoint} returns a scored evaluation`,
    typeof body.score === "number" && Boolean(body.verdict),
    `score=${body.score} verdict=${body.verdict}`
  );
}

console.log(`\nConfigured models:\n  Anthropic: ${ANTHROPIC_MODEL}\n  Gemini:    ${GEMINI_MODEL}\n`);

if (!anthropicKey && !geminiKey) {
  console.error("Set ANTHROPIC_API_KEY (and/or GEMINI_API_KEY) to run this check.\n");
  process.exit(2);
}

if (anthropicKey) await checkAnthropicModelExists();
else console.log("  skip  Anthropic checks (ANTHROPIC_API_KEY not set)");

if (geminiKey) await checkGeminiModelExists();
else console.log("  skip  Gemini checks (GEMINI_API_KEY not set)");

await checkLocalHandler();

if (deploymentUrl) await checkDeployment();
else console.log("  skip  deployment check (pass --url https://... to enable)");

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed\n`);
process.exit(failed.length ? 1 : 0);
