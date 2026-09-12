import assert from "node:assert/strict";
import { test } from "node:test";
import chat from "../api/ai/chat.js";
import evaluate from "../api/ai/evaluate.js";

const keys = ["SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"];
function response() {
  return {
    code: 200, body: undefined,
    setHeader() {},
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

test("backend configuration fails closed without calling providers", async (t) => {
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("Unexpected network request"); };
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });
  for (const key of keys) delete process.env[key];
  const req = { method: "POST", headers: { authorization: "Bearer arbitrary-token" }, body: { system: "Tutor", messages: [{ role: "user", content: "Hello" }] } };
  for (const env of [
    {},
    { SUPABASE_URL: "https://example.supabase.co" },
    { SUPABASE_SERVICE_ROLE_KEY: "test-key" },
    { SUPABASE_URL: "invalid-url", SUPABASE_SERVICE_ROLE_KEY: "test-key" },
  ]) {
    for (const key of keys) delete process.env[key];
    Object.assign(process.env, env, { ANTHROPIC_API_KEY: "test-ai-key" });
    const res = response();
    await chat(req, res);
    assert.equal(res.code, 503);
    assert.equal(res.body.error, "supabase_not_configured");
  }
  assert.equal(calls, 0);
  const unauthenticated = response();
  await chat({ ...req, headers: {} }, unauthenticated);
  assert.equal(unauthenticated.code, 401);
  for (const key of keys) delete process.env[key];
  const unavailable = response();
  await evaluate({ ...req, body: { questionPrompt: "Question", userAnswer: "Answer", rubric: ["Correct"] } }, unavailable);
  assert.equal(unavailable.code, 503);
  assert.equal(unavailable.body.error, "missing_ai_key");
  assert.equal(unavailable.body.score, undefined);
  const preflight = response();
  await chat({ method: "OPTIONS", headers: {} }, preflight);
  assert.equal(preflight.code, 204);
  assert.equal(calls, 0);
});

test("configured chat rejects invalid identity and preserves authenticated streaming", async (t) => {
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });
  Object.assign(process.env, { SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-service-key", ANTHROPIC_API_KEY: "test-ai-key" });
  let valid = false;
  let providerCalls = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/auth/v1/user")) return Response.json(valid ? { id: "test-user" } : { message: "Invalid JWT" }, { status: valid ? 200 : 401 });
    if (url.includes("/rest/v1/user_subscriptions")) return Response.json({ plan: "free", status: "active" });
    if (url.includes("/rest/v1/chatbot_usage")) return Response.json({ message_count: 0 });
    assert.equal(url, "https://api.anthropic.com/v1/messages");
    providerCalls++;
    return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}\n\n');
  };
  const req = { method: "POST", headers: { authorization: "Bearer test-token" }, body: { system: "Tutor", messages: [{ role: "user", content: "Hello" }] } };
  const rejected = response();
  await chat(req, rejected);
  assert.equal(rejected.code, 401);
  assert.equal(providerCalls, 0);
  valid = true;
  const accepted = response();
  let output = "";
  accepted.writeHead = (code) => { accepted.code = code; };
  accepted.write = (chunk) => { output += chunk; };
  await chat(req, accepted);
  assert.equal(accepted.code, 200);
  assert.match(output, /"delta":"Hello"/);
  assert.match(output, /"remaining":4/);
  assert.equal(providerCalls, 1);
});
