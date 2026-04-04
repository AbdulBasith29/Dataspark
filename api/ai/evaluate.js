const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function fallbackEvaluation(rubric = []) {
  const rubricScores = rubric.map((criterion) => ({
    criterion,
    met: false,
    confidence: "low",
  }));
  return {
    score: 0,
    totalScore: "Needs Work",
    rubricScores,
    feedback:
      "AI evaluation is temporarily unavailable. Review the rubric and compare against the model answer.",
  };
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json(fallbackEvaluation(rubric));
  }

  const system = [
    "You are a strict data-science interview evaluator.",
    "Return JSON only. No markdown. No prose outside JSON.",
    'Schema: {"score": number, "totalScore": string, "rubricScores":[{"criterion": string, "met": boolean, "confidence": "low"|"medium"|"high"}], "feedback": string}',
    "Score is 0-100 and should reflect rubric coverage and reasoning quality.",
  ].join(" ");

  const rubricText = rubric.map((r, i) => `${i + 1}. ${r}`).join("\n");
  const userContent = [
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

  try {
    const upstream = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
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
      return res.status(200).json(fallbackEvaluation(rubric));
    }

    const rawText =
      data?.content?.map((block) => block?.text || "").join("") || "";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(200).json(fallbackEvaluation(rubric));
    }

    if (
      typeof parsed?.score !== "number" ||
      !Array.isArray(parsed?.rubricScores) ||
      typeof parsed?.feedback !== "string"
    ) {
      return res.status(200).json(fallbackEvaluation(rubric));
    }

    return res.status(200).json(parsed);
  } catch {
    return res.status(200).json(fallbackEvaluation(rubric));
  }
}
