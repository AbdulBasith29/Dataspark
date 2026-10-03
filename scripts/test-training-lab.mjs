import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import handler from "../api/ai/evaluate.js";
import { devAiApiPlugin } from "../vite-dev-ai-api.mjs";
import { isValidEvaluation } from "../src/lib/evaluation-contract.js";
import { requestAssessment, savePracticeScore } from "../src/lib/practice-attempt.js";
import { SQL_QUESTIONS } from "../src/data/questions-sql.js";
import { runPracticeQuery, getPracticeDatabase } from "../src/lib/practice-sql-engine.js";

const question = SQL_QUESTIONS.find(q => q.id === "sqq3");
const valid = { score: 0, totalScore: "Needs Work", feedback: "The submitted SQL does not answer the question.", rubricScores: question.rubric.map(criterion => ({ criterion, met: false, confidence: "high" })) };
const originalFetch = globalThis.fetch;
const originalKeys = [process.env.ANTHROPIC_API_KEY, process.env.GEMINI_API_KEY];
afterEach(() => {
  globalThis.fetch = originalFetch;
  ["ANTHROPIC_API_KEY", "GEMINI_API_KEY"].forEach((key, i) => { if (originalKeys[i] === undefined) delete process.env[key]; else process.env[key] = originalKeys[i]; });
});
async function hosted() {
  let status, body;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { body = value; return this; }, end() {} };
  await handler({ method: "POST", body: { questionPrompt: question.prompt, userAnswer: "SELECT 1", rubric: question.rubric } }, res);
  return { status, body };
}
test("missing provider configuration returns unavailable without a score", async () => {
  delete process.env.ANTHROPIC_API_KEY; delete process.env.GEMINI_API_KEY;
  const result = await hosted();
  assert.equal(result.status, 503); assert.equal(result.body.score, undefined);
});
test("both providers reject service errors and malformed assessments", async () => {
  for (const provider of ["ANTHROPIC_API_KEY", "GEMINI_API_KEY"]) {
    delete process.env.ANTHROPIC_API_KEY; delete process.env.GEMINI_API_KEY; process.env[provider] = "test-only";
    for (const response of [{ ok: false, json: async () => ({}) }, { ok: true, json: async () => ({ content: [{ text: "{}" }], candidates: [{ content: { parts: [{ text: "{}" }] } }] }) }]) {
      globalThis.fetch = async () => response;
      const result = await hosted(); assert.equal(result.status, 503); assert.equal(result.body.score, undefined);
    }
    globalThis.fetch = async () => { throw new Error("timeout"); };
    assert.equal((await hosted()).status, 503);
  }
});
test("a genuine zero grade is accepted for both providers", async () => {
  for (const provider of ["ANTHROPIC_API_KEY", "GEMINI_API_KEY"]) {
    delete process.env.ANTHROPIC_API_KEY; delete process.env.GEMINI_API_KEY; process.env[provider] = "test-only";
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ content: [{ text: JSON.stringify(valid) }], candidates: [{ content: { parts: [{ text: JSON.stringify(valid) }] } }] }) });
    const result = await hosted(); assert.equal(result.status, 200); assert.equal(result.body.score, 0);
  }
});
test("contract rejects bad score ranges and malformed rubric values", () => {
  for (const score of [-1, 101, Infinity, NaN, "85"]) assert.equal(isValidEvaluation({ ...valid, score }), false);
  assert.equal(isValidEvaluation({ ...valid, rubricScores: [{ criterion: "test", met: "yes", confidence: "high" }] }), false);
  assert.equal(isValidEvaluation(valid), true);
});
test("browser rejects successful HTTP with invalid assessment payload", async () => {
  await assert.rejects(requestAssessment(question, "SELECT 1", { transport: async () => ({ ok: true, json: async () => ({ score: 0 }) }) }), /unavailable/);
});
test("local development also returns unavailable, not a fallback grade", async () => {
  let middleware;
  devAiApiPlugin().configureServer({ middlewares: { use(fn) { middleware = fn; } } });
  const req = new EventEmitter(); req.method = "POST"; req.url = "/api/ai/evaluate";
  let payload;
  const res = { setHeader() {}, end(value) { payload = JSON.parse(value); } };
  const pending = middleware(req, res, () => assert.fail("unexpected next"));
  req.emit("data", Buffer.from(JSON.stringify({ questionPrompt: "Task", userAnswer: "SELECT 1", rubric: ["Criterion"] }))); req.emit("end");
  await pending;
  assert.equal(res.statusCode, 503); assert.equal(payload.score, undefined);
});
function client({ readError = null, writeError = null, best = 90 } = {}) {
  const writes = [];
  return { writes, from() { return {
    select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: { score: best }, error: readError }; },
    async upsert(row) { writes.push(row); return { error: writeError }; },
  }; } };
}
test("save awaits acknowledgement and never replaces an existing better score", async () => {
  const db = client(); assert.equal(await savePracticeScore(db, "user", "sqq3", 65), 90); assert.equal(db.writes[0].score, 90);
  await assert.rejects(savePracticeScore(client({ writeError: {} }), "user", "sqq3", 65), /not saved/);
  const unreadable = client({ readError: {} }); await assert.rejects(savePracticeScore(unreadable, "user", "sqq3", 65), /read/); assert.equal(unreadable.writes.length, 0);
  await assert.rejects(savePracticeScore(db, null, "sqq3", 65), /Sign in/);
});
test("real PostgreSQL model matches; errors recover and queued runs stay isolated", async () => {
  await assert.rejects(runPracticeQuery("SELECT missing_column FROM funnel_events", question.modelAnswer, false));
  const [matched, different] = await Promise.all([
    runPracticeQuery(question.modelAnswer, question.modelAnswer, true),
    runPracticeQuery("SELECT city FROM funnel_events LIMIT 1", question.modelAnswer, true),
  ]);
  assert.equal(matched.comparison, "match"); assert.equal(matched.result.rows.length, 3);
  assert.equal(different.comparison, "mismatch"); assert.equal(different.expected.rows.length, 3);
  await (await getPracticeDatabase()).close();
});
