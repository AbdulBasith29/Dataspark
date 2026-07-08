import { createClient } from "@supabase/supabase-js";

// Verifiable certificates.
//   POST /api/certificates          — issue (auth required; lesson must be completed)
//   GET  /api/certificates?id=uuid  — public verification by credential id
//
// Only this route (service role) writes public.certificates, and only for
// lessons in CERTIFIABLE_LESSONS that the user has actually completed — the
// credential can't be forged client-side.

const CERTIFIABLE_LESSONS = {
  "sql-capstone-01": { title: "StreamCore Analytics Challenge", courseId: "sql" },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUser(req, supabase) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Dimensions come from the client's interview-graph artifact; keep them but
// never trust them for anything beyond display, and cap their size.
function sanitizeDimensions(dimensions) {
  if (!Array.isArray(dimensions)) return [];
  return dimensions.slice(0, 12).map((d) => ({
    label: String(d?.label || "").slice(0, 120),
    result: String(d?.result || "").slice(0, 60),
  })).filter((d) => d.label);
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "supabase_not_configured" });

  // ── Public verification ──
  if (req.method === "GET") {
    const id = String(req.query?.id || "");
    if (!UUID_RE.test(id)) return res.status(400).json({ error: "invalid_id" });
    const { data, error } = await supabase
      .from("certificates")
      .select("id, course_id, title, recipient_name, dimensions, issued_at")
      .eq("id", id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: "lookup_failed" });
    if (!data) return res.status(404).json({ error: "not_found" });
    return res.status(200).json({ certificate: data, verified: true });
  }

  // ── Issuance ──
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const user = await getUser(req, supabase);
  if (!user) return res.status(401).json({ error: "auth_required", message: "Sign in to get your certificate." });

  const { lessonId, name, dimensions } = req.body || {};
  const spec = CERTIFIABLE_LESSONS[lessonId];
  if (!spec) return res.status(400).json({ error: "not_certifiable" });

  const recipientName = String(name || "").trim().slice(0, 80);
  if (!recipientName) return res.status(400).json({ error: "name_required", message: "Enter the name for your certificate." });

  // The credential is only issued if the lesson is really completed.
  const { data: done } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!done) {
    return res.status(403).json({ error: "lesson_not_completed", message: "Complete the capstone before claiming the certificate." });
  }

  // One certificate per (user, lesson) — re-claiming returns the existing one.
  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (existing) return res.status(200).json({ id: existing.id, existing: true });

  const { data: created, error } = await supabase
    .from("certificates")
    .insert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: spec.courseId,
      title: spec.title,
      recipient_name: recipientName,
      dimensions: sanitizeDimensions(dimensions),
    })
    .select("id")
    .single();
  if (error) return res.status(500).json({ error: "issue_failed", message: error.message });

  return res.status(200).json({ id: created.id });
}
