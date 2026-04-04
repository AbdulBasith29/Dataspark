/**
 * Dev-only handlers so `npm run dev` can serve /api/ai/* without Vercel.
 * Uses ANTHROPIC_API_KEY from .env (loaded in vite.config).
 */
const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

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

export function devAiApiPlugin(apiKey) {
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
          if (!apiKey) {
            sendJson(res, 500, { error: "anthropic_key_missing" });
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
              sendJson(res, upstream.status, {
                error: "anthropic_upstream_error",
                details: data?.error || data || null,
              });
              return;
            }
            const text =
              data?.content?.map((block) => block?.text || "").join("") ||
              "I couldn't generate a response. Please try again.";
            sendJson(res, 200, { text });
          } catch {
            sendJson(res, 500, { error: "chat_request_failed" });
          }
          return;
        }

        if (req.method === "POST" && url === "/api/ai/evaluate") {
          let body;
          try {
            body = await readJsonBody(req);
          } catch {
            sendJson(res, 400, { error: "invalid_json" });
            return;
          }
          const { questionPrompt, userAnswer, rubric } = body || {};
          if (!questionPrompt || !userAnswer || !Array.isArray(rubric)) {
            sendJson(res, 400, { error: "invalid_payload" });
            return;
          }
          if (!apiKey) {
            sendJson(res, 200, fallbackEvaluation(rubric));
            return;
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
          ].join("");
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
              sendJson(res, 200, fallbackEvaluation(rubric));
              return;
            }
            const rawText =
              data?.content?.map((block) => block?.text || "").join("") || "";
            let parsed;
            try {
              parsed = JSON.parse(rawText);
            } catch {
              sendJson(res, 200, fallbackEvaluation(rubric));
              return;
            }
            if (
              typeof parsed?.score !== "number" ||
              !Array.isArray(parsed?.rubricScores) ||
              typeof parsed?.feedback !== "string"
            ) {
              sendJson(res, 200, fallbackEvaluation(rubric));
              return;
            }
            sendJson(res, 200, parsed);
          } catch {
            sendJson(res, 200, fallbackEvaluation(rubric));
          }
          return;
        }

        next();
      });
    },
  };
}
