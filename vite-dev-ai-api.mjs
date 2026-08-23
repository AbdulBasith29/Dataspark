/**
 * Dev-only handler so `npm run dev` can serve /api/ai/chat without Vercel.
 * Uses ANTHROPIC_API_KEY or GEMINI_API_KEY from .env (loaded in vite.config).
 *
 * /api/ai/evaluate is deliberately NOT here — it runs the real api/ai/evaluate.js
 * via vite-dev-vercel-api.mjs, so the evaluation contract can't drift between
 * dev and prod. This file previously kept a second copy that already had.
 */
import { ANTHROPIC_MODEL, GEMINI_MODEL } from "./api/ai/_models.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
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

export function devAiApiPlugin({ anthropicApiKey = "", geminiApiKey = "" } = {}) {
  return {
    name: "dev-ai-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || "").split("?")[0];

        if (req.method === "OPTIONS" && url.startsWith("/api/ai/")) {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === "POST" && url === "/api/ai/chat") {
          if (!anthropicApiKey && !geminiApiKey) {
            sendJson(res, 500, {
              error: "missing_ai_key",
              details: "Set ANTHROPIC_API_KEY or GEMINI_API_KEY",
            });
            return;
          }
          let body;
          try {
            body = await readJsonBody(req);
          } catch {
            sendJson(res, 400, { error: "invalid_json" });
            return;
          }
          const { system, messages, model, max_tokens } = body || {};
          if (!system || !Array.isArray(messages) || messages.length === 0) {
            sendJson(res, 400, { error: "invalid_payload" });
            return;
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
                  model: model || ANTHROPIC_MODEL,
                  max_tokens: typeof max_tokens === "number" ? max_tokens : 800,
                  system,
                  messages,
                }),
              });
              const data = await upstream.json();
              if (!upstream.ok) {
                sendJson(res, upstream.status, {
                  error: "anthropic_upstream_error",
                  details: data?.error || data || null,
                });
                return;
              }
              sendJson(res, 200, { text: extractAnthropicText(data) });
              return;
            }

            const geminiModel =
              typeof model === "string" && model.startsWith("gemini-")
                ? model
                : GEMINI_MODEL;
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
                    maxOutputTokens:
                      typeof max_tokens === "number" ? max_tokens : 800,
                  },
                }),
              }
            );
            const data = await upstream.json();
            if (!upstream.ok) {
              sendJson(res, upstream.status, {
                error: "gemini_upstream_error",
                details: data?.error || data || null,
              });
              return;
            }
            sendJson(res, 200, { text: extractGeminiText(data) });
          } catch {
            sendJson(res, 500, { error: "chat_request_failed" });
          }
          return;
        }

        next();
      });
    },
  };
}
