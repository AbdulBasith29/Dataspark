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

export async function trackLvsEvent({ eventName, page, metadata }) {
  return safeLogClientEvent({
    eventName,
    page,
    metadata: {
      ...(metadata || {}),
      category: metadata?.category || "engagement",
      product_area: metadata?.product_area || "learning_value_score",
    },
  });
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
