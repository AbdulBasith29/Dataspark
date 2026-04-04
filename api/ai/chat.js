const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "anthropic_key_missing" });
  }

  const { system, messages, model, max_tokens } = req.body || {};
  if (!system || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  try {
    const upstream = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
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

    const text =
      data?.content?.map((block) => block?.text || "").join("") ||
      "I couldn't generate a response. Please try again.";

    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: "chat_request_failed" });
  }
}
