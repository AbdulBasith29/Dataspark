import { isValidEvaluation, EVALUATION_UNAVAILABLE } from "../../src/lib/evaluation-contract.js";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}


function buildEvaluationPrompt(questionPrompt, userAnswer, rubric) {
  const rubricText = rubric.map((r, i) => `${i + 1}. ${r}`).join("\n");
  return [
    "Evaluate this answer against the rubric.",
    "",
    "QUESTION:",
    questionPrompt,
    "",
    "RUBRIC:",
    rubricText,
    "",
    "ANSWER:",
    userAnswer,
  ].join("\n");
}

function parseEvaluationJson(rawText) {
  // Strip leading/trailing code fences (Gemini sometimes wraps JSON).
  let text = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  // If thinking tokens appear before the JSON object, jump to the first '{'.
  const brace = text.indexOf("{");
  if (brace > 0) text = text.slice(brace);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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
    return res.status(503).json(EVALUATION_UNAVAILABLE);
  }

  const system = [
    "You are a strict data-science interview evaluator.",
    "Return JSON only. No markdown. No prose outside JSON.",
    'Schema: {"score": number, "totalScore": string, "rubricScores":[{"criterion": string, "met": boolean, "confidence": "low"|"medium"|"high"}], "feedback": string}',
    "Score is 0-100 and should reflect rubric coverage and reasoning quality.",
  ].join(" ");

  const userContent = buildEvaluationPrompt(questionPrompt, userAnswer, rubric);

  try {
    if (anthropicApiKey) {
      const upstream = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        signal: AbortSignal.timeout(25000),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 700,
          system,
          messages: [{ role: "user", content: userContent }],
        }),
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        return res.status(503).json(EVALUATION_UNAVAILABLE);
      }

      const rawText =
        data?.content?.map((block) => block?.text || "").join("") || "";
      const parsed = parseEvaluationJson(rawText);
      if (!isValidEvaluation(parsed)) {
        return res.status(503).json(EVALUATION_UNAVAILABLE);
      }
      return res.status(200).json(parsed);
    }

    const upstream = await fetch(
      `${GEMINI_API_URL}/${DEFAULT_GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        geminiApiKey
      )}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(25000),
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }],
          },
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: {
            maxOutputTokens: 700,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(503).json(EVALUATION_UNAVAILABLE);
    }
    // Filter out thinking tokens (thought:true parts) before joining text.
    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.filter((part) => !part?.thought)
        ?.map((part) => part?.text || "")
        .join("") || "";
    const parsed = parseEvaluationJson(rawText);
    if (!isValidEvaluation(parsed)) {
      return res.status(503).json(EVALUATION_UNAVAILABLE);
    }
    return res.status(200).json(parsed);
  } catch {
    return res.status(503).json(EVALUATION_UNAVAILABLE);
  }
}
