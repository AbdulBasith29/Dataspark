// Adaptive tutor-drill engine (DS-201).
//
// Pure utility module (no React). Tracks knowledge-check error patterns in
// localStorage and turns them into tutor-ready drill prompts. All storage
// access is guarded with `typeof window` + try/catch and never throws.
//
// Metadata field naming follows the snake_case-on-the-wire conventions used by
// analytics.js (course_id, lesson_id, ...), but this module's in-memory record
// shape uses the camelCase keys the callers pass in (courseId, lessonId, ...).

/** localStorage key the adaptive-drill engine reads/writes. */
export const ERROR_PROFILE_KEY = "ds_error_profile";

/** Cap the stored profile to the last N records. */
const ERROR_PROFILE_CAP = 200;

function readProfile() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(ERROR_PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProfile(list) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const capped = Array.isArray(list) ? list.slice(-ERROR_PROFILE_CAP) : [];
    window.localStorage.setItem(ERROR_PROFILE_KEY, JSON.stringify(capped));
  } catch {
    // localStorage may be unavailable, full, or disabled — never block UX.
  }
}

/**
 * Append a record of the checks a learner just missed to the stored profile.
 * @param {Object} args
 * @param {string} args.courseId
 * @param {string} args.lessonId
 * @param {string} args.lessonTitle
 * @param {Array<{question: string, chosen: any, correct: any}>} args.wrongChecks
 * @returns {Array} the updated (capped) profile.
 */
export function recordCheckErrors({ courseId, lessonId, lessonTitle, wrongChecks } = {}) {
  const checks = Array.isArray(wrongChecks) ? wrongChecks : [];
  if (checks.length === 0) return getErrorProfile();

  const list = readProfile();
  list.push({
    courseId: courseId || null,
    lessonId: lessonId || null,
    lessonTitle: lessonTitle || null,
    wrongChecks: checks.map((c) => ({
      question: c?.question ?? null,
      chosen: c?.chosen ?? null,
      correct: c?.correct ?? null,
    })),
    ts: Date.now(),
  });

  const capped = list.slice(-ERROR_PROFILE_CAP);
  writeProfile(capped);
  return capped;
}

/** Return the stored error profile array (or [] if none / unavailable). */
export function getErrorProfile() {
  return readProfile();
}

/**
 * Aggregate the error profile by lessonId for a weekly recap.
 * @param {Object} [args]
 * @param {number} [args.limit=5]
 * @returns {Array<{lessonId: string, lessonTitle: string, missCount: number, recentQuestions: string[]}>}
 *   sorted by missCount descending, capped to `limit`.
 */
export function getTopErrorPatterns({ limit = 5 } = {}) {
  const profile = readProfile();
  const byLesson = new Map();

  // Iterate most-recent-first so recentQuestions reflects the latest misses.
  for (let i = profile.length - 1; i >= 0; i -= 1) {
    const rec = profile[i];
    if (!rec) continue;
    const lessonId = rec.lessonId || "unknown";
    const checks = Array.isArray(rec.wrongChecks) ? rec.wrongChecks : [];

    let entry = byLesson.get(lessonId);
    if (!entry) {
      entry = {
        lessonId,
        lessonTitle: rec.lessonTitle || lessonId,
        missCount: 0,
        recentQuestions: [],
      };
      byLesson.set(lessonId, entry);
    }
    // Keep the most recent non-empty title we encounter.
    if (!entry.lessonTitle && rec.lessonTitle) entry.lessonTitle = rec.lessonTitle;

    entry.missCount += checks.length;
    for (const c of checks) {
      const q = c?.question;
      if (q && entry.recentQuestions.length < 5 && !entry.recentQuestions.includes(q)) {
        entry.recentQuestions.push(q);
      }
    }
  }

  const cap = typeof limit === "number" && limit > 0 ? limit : 5;
  return Array.from(byLesson.values())
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, cap);
}

/**
 * Build a single tutor-ready drill prompt the learner can send to the AI tutor.
 * @param {Object} args
 * @param {string} args.lessonTitle
 * @param {Array<{question: string, chosen?: any, correct?: any}>} [args.wrongChecks]
 * @param {Array<{label: string, prompt: string}>} [args.relatedPractice]
 * @returns {string}
 */
export function buildDrillPrompt({ lessonTitle, wrongChecks = [], relatedPractice = [] } = {}) {
  const title = lessonTitle || "this lesson";
  const checks = Array.isArray(wrongChecks) ? wrongChecks : [];

  const concepts = checks
    .map((c) => (c?.question || "").toString().trim())
    .filter(Boolean);

  const lines = [];
  lines.push(
    `I just missed these checks in '${title}'. Give me a 5-minute targeted drill to lock in what I got wrong.`
  );

  if (concepts.length > 0) {
    lines.push("");
    lines.push("Concepts I missed:");
    for (const concept of concepts) {
      lines.push(`- ${concept}`);
    }
  }

  lines.push("");
  lines.push(
    "Please generate a short targeted mini-drill of 3 quick questions focused on exactly these weak spots, then include an answer rubric I can self-check against."
  );

  const related = Array.isArray(relatedPractice)
    ? relatedPractice.filter((p) => p && (p.prompt || p.label))
    : [];
  if (related.length > 0) {
    const pick = related[0];
    const ref = pick.label || pick.prompt;
    lines.push("");
    lines.push(`Also fold in this related practice if it fits: ${ref}.`);
  }

  return lines.join("\n");
}

/**
 * Build a prompt asking the tutor to compile the learner's top error patterns
 * into a focused weekly review plan.
 * @param {Array<{lessonId: string, lessonTitle: string, missCount: number, recentQuestions: string[]}>} patterns
 * @returns {string}
 */
export function buildWeeklyRecapPrompt(patterns) {
  const list = Array.isArray(patterns) ? patterns : [];

  const lines = [];
  lines.push(
    "Here are my top knowledge-check error patterns from the past week. Compile them into a focused review plan that prioritizes my weakest areas."
  );

  if (list.length === 0) {
    lines.push("");
    lines.push(
      "I don't have any recorded misses yet, so suggest a sensible warm-up review plan to keep my skills sharp."
    );
    return lines.join("\n");
  }

  lines.push("");
  lines.push("Error patterns by lesson (most missed first):");
  list.forEach((p, idx) => {
    const title = p?.lessonTitle || p?.lessonId || "Unknown lesson";
    const count = typeof p?.missCount === "number" ? p.missCount : 0;
    lines.push(`${idx + 1}. ${title} — ${count} missed check${count === 1 ? "" : "s"}`);
    const recent = Array.isArray(p?.recentQuestions) ? p.recentQuestions : [];
    for (const q of recent) {
      if (q) lines.push(`   - ${q}`);
    }
  });

  lines.push("");
  lines.push(
    "Give me a prioritized review plan: what to revisit first, a quick targeted drill per weak area, and a suggested order for the week."
  );

  return lines.join("\n");
}
