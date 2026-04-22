const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function extractAnthropicText(data) {
  return (
    data?.content?.map((block) => block?.text || "").join("") ||
    "I couldn't generate a response. Please try again."
  );
}

function extractGeminiText(data) {
  const candidates = data?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return "I couldn't generate a response. Please try again.";
  }
  const first = candidates[0];
  const parts = first?.content?.parts;
  if (!Array.isArray(parts)) {
    return "I couldn't generate a response. Please try again.";
  }
  const text = parts.map((p) => p?.text || "").join("").trim();
  return text || "I couldn't generate a response. Please try again.";
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content || "") }],
  }));
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!anthropicApiKey && !geminiApiKey) {
    return res
      .status(500)
      .json({ error: "missing_ai_key", details: "Set ANTHROPIC_API_KEY or GEMINI_API_KEY" });
  }

  const { system, messages, model, max_tokens } = req.body || {};
  if (!system || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  try {
    if (anthropicApiKey) {
      const upstream = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
          system,
          messages,
        }),
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        return res.status(upstream.status).json({
          error: "anthropic_upstream_error",
          details: data?.error || data || null,
        });
      }
      return res.status(200).json({ text: extractAnthropicText(data) });
    }

    const geminiModel =
      typeof model === "string" && model.startsWith("gemini-")
        ? model
        : DEFAULT_GEMINI_MODEL;
    const upstream = await fetch(
      `${GEMINI_API_URL}/${geminiModel}:generateContent?key=${encodeURIComponent(
        geminiApiKey
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }],
          },
          contents: toGeminiContents(messages),
          generationConfig: {
            maxOutputTokens: typeof max_tokens === "number" ? max_tokens : 800,
          },
        }),
      }
    );

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "gemini_upstream_error",
        details: data?.error || data || null,
      });
    }
    return res.status(200).json({ text: extractGeminiText(data) });
  } catch {
    return res.status(500).json({ error: "chat_request_failed" });
  }
}
