import { createClient } from "@supabase/supabase-js";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const FREE_DAILY_LIMIT = 5; // AI tutor messages per day on the free plan
const PRO_DAILY_LIMIT = 20; // ...and on Pro

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "I couldn't generate a response. Please try again.";
  return parts.map((p) => p?.text || "").join("").trim() || "I couldn't generate a response. Please try again.";
}

// Reads Anthropic's SSE stream and invokes onDelta(text) for each text chunk.
async function streamAnthropicText(body, onDelta) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            onDelta(evt.delta.text);
          }
        } catch {
          // skip malformed chunk
        }
      }
    }
  }
}

function writeNdjson(res, obj) {
  res.write(`${JSON.stringify(obj)}\n`);
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content || "") }],
  }));
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Returns { userId, error } — error is a response-ready object or null
async function authenticateRequest(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { userId: null, error: { status: 401, body: { error: "auth_required", message: "Sign in to use the AI tutor." } } };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // No service role key — skip auth (dev fallback, not for production)
    return { userId: "anonymous", error: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { userId: null, error: { status: 401, body: { error: "invalid_token", message: "Session expired. Please sign in again." } } };
  return { userId: user.id, error: null };
}

// Looks up the user's plan to pick their daily message allowance.
async function getDailyLimit(userId) {
  if (userId === "anonymous") return PRO_DAILY_LIMIT;
  const supabase = getSupabaseAdmin();
  if (!supabase) return PRO_DAILY_LIMIT;
  const { data } = await supabase
    .from("user_subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  const isPro = data?.plan === "pro" && ["active", "trialing"].includes(data?.status);
  return isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
}

// Returns { count, limited } after incrementing usage by 1
async function checkAndIncrementUsage(userId, dailyLimit) {
  if (userId === "anonymous") return { count: 1, limited: false };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { count: 1, limited: false };

  const today = new Date().toISOString().slice(0, 10);

  // Read current count
  const { data } = await supabase
    .from("chatbot_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  const current = data?.message_count ?? 0;
  if (current >= dailyLimit) return { count: current, limited: true };

  // Increment
  await supabase.from("chatbot_usage").upsert(
    { user_id: userId, date: today, message_count: current + 1 },
    { onConflict: "user_id,date" }
  );

  return { count: current + 1, limited: false };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!anthropicApiKey && !geminiApiKey) {
    return res.status(500).json({ error: "missing_ai_key", details: "Set ANTHROPIC_API_KEY or GEMINI_API_KEY" });
  }

  // ── Auth ──
  const { userId, error: authError } = await authenticateRequest(req);
  if (authError) return res.status(authError.status).json(authError.body);

  // ── Rate limit (plan-aware) ──
  const dailyLimit = await getDailyLimit(userId);
  const { count, limited } = await checkAndIncrementUsage(userId, dailyLimit);
  if (limited) {
    const upsell = dailyLimit === FREE_DAILY_LIMIT ? " Upgrade to Pro for more." : "";
    return res.status(429).json({
      error: "rate_limit_exceeded",
      message: `You've reached your ${dailyLimit} message daily limit.${upsell} Come back tomorrow!`,
      limit: dailyLimit,
      used: count,
    });
  }

  const { system, messages, model, max_tokens } = req.body || {};
  if (!system || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  // Include remaining count in response so UI can update
  const remaining = dailyLimit - count;

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
          stream: true,
        }),
      });

      if (!upstream.ok) {
        const data = await upstream.json().catch(() => null);
        return res.status(upstream.status).json({ error: "anthropic_upstream_error", details: data?.error || data || null });
      }

      res.writeHead(200, {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      });
      await streamAnthropicText(upstream.body, (text) => writeNdjson(res, { delta: text }));
      writeNdjson(res, { done: true, remaining });
      return res.end();
    }

    // Gemini fallback has no streaming wired up — emit the full reply as a single chunk
    // so the client's streaming reader handles both providers the same way.
    const geminiModel = typeof model === "string" && model.startsWith("gemini-") ? model : DEFAULT_GEMINI_MODEL;
    const upstream = await fetch(
      `${GEMINI_API_URL}/${geminiModel}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: toGeminiContents(messages),
          generationConfig: { maxOutputTokens: typeof max_tokens === "number" ? max_tokens : 800 },
        }),
      }
    );
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: "gemini_upstream_error", details: data?.error || data || null });

    res.writeHead(200, {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    });
    writeNdjson(res, { delta: extractGeminiText(data) });
    writeNdjson(res, { done: true, remaining });
    return res.end();
  } catch {
    if (!res.headersSent) return res.status(500).json({ error: "chat_request_failed" });
    return res.end();
  }
}
