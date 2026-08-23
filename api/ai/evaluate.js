import {
  EVALUATION_TOOL_NAME,
  EVALUATION_INPUT_SCHEMA,
  EVALUATION_GEMINI_SCHEMA,
  EVALUATION_SYSTEM_PROMPT,
  buildEvaluationPrompt,
  normalizeEvaluation,
  degradedEvaluation,
  unavailableEvaluation,
} from "./_evaluation-schema.js";
import { ANTHROPIC_MODEL, GEMINI_MODEL } from "./_models.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const MAX_TOKENS = 1000;

/** One enforced call, then one retry, then degrade. */
const MAX_ATTEMPTS = 2;

const RETRY_NUDGE =
  "\n\nYour previous attempt did not produce a usable evaluation. Return every required field, with score as a number 0-100 and verdict as one of: correct, partial, incorrect.";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Upstream failures used to be swallowed silently, which made a dead API key
 * and a badly-worded rubric look identical from the outside. Log enough to tell
 * them apart without dumping learner answers into the logs.
 */
function logFailure(provider, attempt, reason, detail) {
  const suffix = detail ? ` — ${String(detail).slice(0, 300)}` : "";
  console.error(`[ai/evaluate] ${provider} attempt ${attempt} ${reason}${suffix}`);
}

/** Some models still fence or preface JSON even in JSON mode. */
function parseLooseJson(rawText) {
  if (!rawText) return null;
  let text = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const brace = text.indexOf("{");
  if (brace > 0) text = text.slice(brace);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Claude path: a single tool is offered and `tool_choice` forces it, so the
 * model answers with a schema-validated `input` object instead of prose.
 */
async function callAnthropic(apiKey, { system, userContent }) {
  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: userContent }],
      tools: [
        {
          name: EVALUATION_TOOL_NAME,
          description:
            "Report the graded evaluation of the learner's answer. This is the only way to return a result.",
          input_schema: EVALUATION_INPUT_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: EVALUATION_TOOL_NAME },
    }),
  });

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return {
      ok: false,
      detail: `HTTP ${upstream.status}: ${JSON.stringify(data?.error || data || {})}`,
    };
  }

  const blocks = Array.isArray(data?.content) ? data.content : [];
  const toolUse = blocks.find(
    (block) => block?.type === "tool_use" && block?.name === EVALUATION_TOOL_NAME
  );
  const rawText = blocks
    .filter((block) => block?.type === "text")
    .map((block) => block?.text || "")
    .join("");

  // Forced tool_choice should make the tool block unconditional; fall back to
  // parsing text so an unexpected refusal or truncation still has a chance.
  return { ok: true, payload: toolUse?.input || parseLooseJson(rawText), rawText };
}

/** Gemini path: JSON mode with an explicit responseSchema. */
async function callGemini(apiKey, { system, userContent }) {
  const upstream = await fetch(
    `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
          responseMimeType: "application/json",
          responseSchema: EVALUATION_GEMINI_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return {
      ok: false,
      detail: `HTTP ${upstream.status}: ${JSON.stringify(data?.error || data || {})}`,
    };
  }

  const rawText =
    data?.candidates?.[0]?.content?.parts
      ?.filter((part) => !part?.thought)
      ?.map((part) => part?.text || "")
      .join("") || "";

  return { ok: true, payload: parseLooseJson(rawText), rawText };
}

/**
 * Runs the enforced call, retries once on failure or unusable output, and
 * degrades to whatever prose is available rather than returning nothing.
 */
async function evaluateAnswer({ provider, call, apiKey, system, userContent, rubric }) {
  let lastRawText = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const content = attempt === 1 ? userContent : userContent + RETRY_NUDGE;

    let result;
    try {
      result = await call(apiKey, { system, userContent: content });
    } catch (err) {
      logFailure(provider, attempt, "threw", err?.message);
      continue;
    }

    if (!result.ok) {
      logFailure(provider, attempt, "upstream error", result.detail);
      continue;
    }

    const normalized = normalizeEvaluation(result.payload, rubric);
    if (normalized) return normalized;

    lastRawText = result.rawText || lastRawText;
    logFailure(provider, attempt, "unusable payload", JSON.stringify(result.payload || {}));
  }

  return degradedEvaluation(lastRawText);
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { questionPrompt, userAnswer, rubric } = req.body || {};
  if (!questionPrompt || !userAnswer || !Array.isArray(rubric)) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!anthropicApiKey && !geminiApiKey) {
    logFailure("config", 0, "no provider key configured");
    return res.status(200).json(unavailableEvaluation());
  }

  const evaluation = await evaluateAnswer({
    provider: anthropicApiKey ? "anthropic" : "gemini",
    call: anthropicApiKey ? callAnthropic : callGemini,
    apiKey: anthropicApiKey || geminiApiKey,
    system: EVALUATION_SYSTEM_PROMPT,
    userContent: buildEvaluationPrompt(questionPrompt, userAnswer, rubric),
    rubric,
  });

  return res.status(200).json(evaluation);
}
