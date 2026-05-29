import { getSupabaseBrowserClient } from "./supabaseClient.js";

export function emailDomainFromEmail(email) {
  const at = email.lastIndexOf("@");
  if (at === -1) return undefined;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain || undefined;
}

export async function logClientEvent({ eventName, page, metadata }) {
  let supabase;
  try {
    supabase = getSupabaseBrowserClient();
  } catch {
    throw new Error("supabase_unavailable");
  }

  const { error } = await supabase.from("event_logs").insert({
    event_name: eventName,
    page,
    metadata: metadata ?? null,
  });

  if (error) throw error;
}

export async function safeLogClientEvent(payload) {
  try {
    await logClientEvent(payload);
  } catch {
    // Never block UX on analytics failures.
  }
}


export const LVS_EVENT_NAMES = {
  lessonStart: "lvs_lesson_start",
  lessonComplete: "lvs_lesson_complete",
  checkSubmit: "lvs_check_submit",
  tutorPromptUsed: "lvs_tutor_prompt_used",
  weeklyRecapViewed: "lvs_weekly_recap_viewed",
  confidenceRated: "lvs_confidence_rated",
  confidenceDelta: "lvs_confidence_delta",
};

export function buildLvsMetadata({
  courseId,
  lessonId,
  lessonTitle,
  stage,
  score,
  passed,
  confidenceBefore,
  confidenceAfter,
  usedTutor,
  artifact,
} = {}) {
  return {
    category: "engagement",
    product_area: "learning_value_score",
    course_id: courseId || null,
    lesson_id: lessonId || null,
    lesson_title: lessonTitle || null,
    stage: stage || null,
    score: typeof score === "number" ? score : null,
    passed: typeof passed === "boolean" ? passed : null,
    confidence_before: typeof confidenceBefore === "number" ? confidenceBefore : null,
    confidence_after: typeof confidenceAfter === "number" ? confidenceAfter : null,
    used_tutor: typeof usedTutor === "boolean" ? usedTutor : null,
    artifact: artifact || null,
  };
}

/** localStorage key the in-browser LVS dashboard reads from. */
export const LVS_LOCAL_KEY = "ds_lvs_events";
const LVS_LOCAL_CAP = 500;

/**
 * Mirror an LVS event into localStorage so the client-side dashboard
 * (src/pages/LvsDashboard.jsx) has data to render — the Supabase sink is
 * write-only from the browser's perspective. Best-effort, never throws.
 */
export function mirrorLvsEventLocally({ eventName, page, metadata }) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(LVS_LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.events)
        ? parsed.events
        : [];
    list.push({ event_name: eventName, page: page || null, metadata: metadata || null, ts: Date.now() });
    window.localStorage.setItem(LVS_LOCAL_KEY, JSON.stringify(list.slice(-LVS_LOCAL_CAP)));
  } catch {
    // localStorage may be unavailable, full, or disabled — never block UX.
  }
}

export async function trackLvsEvent({ eventName, page, metadata }) {
  const enriched = {
    ...(metadata || {}),
    category: metadata?.category || "engagement",
    product_area: metadata?.product_area || "learning_value_score",
  };
  mirrorLvsEventLocally({ eventName, page, metadata: enriched });
  return safeLogClientEvent({ eventName, page, metadata: enriched });
}

/**
 * Build metadata for a confidence-diagnostics event. Mirrors the shape style
 * of buildLvsMetadata so events stay queryable alongside the rest of LVS.
 */
export function buildConfidenceMetadata({ courseId, lessonId, stage, confidence, correct } = {}) {
  return {
    category: "engagement",
    product_area: "learning_value_score",
    course_id: courseId || null,
    lesson_id: lessonId || null,
    stage: stage || null,
    confidence: typeof confidence === "number" ? confidence : null,
    correct: typeof correct === "boolean" ? correct : null,
  };
}

/**
 * Compare a learner's confidence (1–5) before vs. after seeing the answer.
 *
 * Calibration rule (on the 1–5 scale, midpoint 3):
 *  - High confidence (>= 4) that DROPS after seeing the answer (after < before)
 *    => "overconfident" (they were surer than they should have been).
 *  - Low confidence (<= 2) that RISES after seeing the answer (after > before)
 *    => "underconfident" (they knew it better than they felt).
 *  - Otherwise => "calibrated".
 */
export function computeConfidenceDelta({ before, after } = {}) {
  const b = typeof before === "number" ? before : null;
  const a = typeof after === "number" ? after : null;
  const delta = b != null && a != null ? a - b : null;

  let calibration = "calibrated";
  if (b != null && a != null) {
    if (b >= 4 && a < b) calibration = "overconfident";
    else if (b <= 2 && a > b) calibration = "underconfident";
  }

  return { before: b, after: a, delta, calibration };
}

/** Thin wrapper over the same logging path that trackLvsEvent uses. */
export async function trackConfidence({ eventName, page, metadata }) {
  return trackLvsEvent({ eventName, page, metadata });
}

export function buildPythonProgressArtifacts({ completedLessonIds = [], totalPythonLessons = 0 } = {}) {
  const completed = new Set(completedLessonIds);
  const basics = ["py-b1", "py-b2", "py-b3", "py-b4", "py-b5"];
  const control = ["py-c1", "py-c2", "py-c3", "py-c4", "py-c5"];
  const oop = ["py-o1", "py-o2", "py-o3", "py-o4"];
  const data = ["py-d1", "py-d2", "py-d3", "py-d4", "py-d5"];

  const unlockedSkills = [];
  if (basics.every((id) => completed.has(id))) unlockedSkills.push("Python Core Fluency");
  if (control.every((id) => completed.has(id))) unlockedSkills.push("Control Flow & Function Design");
  if (oop.every((id) => completed.has(id))) unlockedSkills.push("Code Review Ready OOP");
  if (data.every((id) => completed.has(id))) unlockedSkills.push("Data Reliability with Python");

  const readinessMilestones = [];
  if (completed.size >= 5) readinessMilestones.push("Foundations Milestone");
  if (completed.size >= 10) readinessMilestones.push("Interview Simulation Milestone");
  if (completed.size >= Math.max(1, totalPythonLessons - 1)) readinessMilestones.push("Production Readiness Milestone");

  return {
    unlockedSkills,
    readinessMilestones,
    completionRate: totalPythonLessons > 0 ? Math.round((completed.size / totalPythonLessons) * 100) : 0,
  };
}
