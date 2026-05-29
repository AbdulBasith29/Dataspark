import { getSupabaseBrowserClient } from "./supabaseClient.js";
import { LVS_EVENT_NAMES, LVS_LOCAL_KEY } from "./analytics.js";

/**
 * Server-side LVS aggregation query layer (DS-202).
 *
 * No React here — these are pure functions plus async Supabase data access.
 * Everything is defensive: data-access helpers return null/[] on failure and
 * never throw, so the dashboard can always fall back gracefully.
 */

const LVS_EVENT_NAME_SET = new Set(Object.values(LVS_EVENT_NAMES));
const SUPABASE_ROW_LIMIT = 5000;

function isLvsEventName(name) {
  return typeof name === "string" && (name.startsWith("lvs_") || LVS_EVENT_NAME_SET.has(name));
}

/**
 * Fetch LVS events from the Supabase `event_logs` table.
 * Returns an array of { event_name, metadata } or null on any failure.
 * Never throws.
 */
export async function fetchLvsEventsFromSupabase() {
  let supabase;
  try {
    supabase = getSupabaseBrowserClient();
  } catch {
    return null;
  }
  if (!supabase) return null;

  try {
    // Preferred path: filter server-side on the LVS product_area marker and
    // order by recency. If the column/order isn't supported, fall back below.
    let data;
    let error;
    try {
      const res = await supabase
        .from("event_logs")
        .select("event_name, metadata")
        .eq("metadata->>product_area", "learning_value_score")
        .order("created_at", { ascending: false })
        .limit(SUPABASE_ROW_LIMIT);
      data = res.data;
      error = res.error;
    } catch {
      error = true;
    }

    if (error || !Array.isArray(data)) {
      // Defensive fallback: pull recent rows without server-side filtering or
      // ordering (in case the metadata filter or created_at column is unknown),
      // then filter by LVS event names in JS.
      let res2;
      try {
        res2 = await supabase
          .from("event_logs")
          .select("event_name, metadata")
          .limit(SUPABASE_ROW_LIMIT);
      } catch {
        return null;
      }
      if (res2.error || !Array.isArray(res2.data)) return null;
      data = res2.data;
    }

    return data
      .filter((r) => r && typeof r === "object" && isLvsEventName(r.event_name))
      .map((r) => ({
        event_name: r.event_name,
        metadata: r.metadata && typeof r.metadata === "object" ? r.metadata : {},
      }));
  } catch {
    return null;
  }
}

/**
 * Read LVS events from the localStorage mirror.
 * Maps the stored { event_name, page, metadata, ts } shape into
 * { event_name, metadata }. Always returns an array.
 */
export function loadLocalLvsEvents() {
  if (typeof window === "undefined" || !window.localStorage) return [];

  let raw;
  try {
    raw = window.localStorage.getItem(LVS_LOCAL_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.events)
      ? parsed.events
      : [];

  return list
    .filter((e) => e && typeof e === "object")
    .map((e) => ({
      event_name: e.event_name || e.eventName || e.name || null,
      metadata: e.metadata && typeof e.metadata === "object" ? e.metadata : {},
    }))
    .filter((e) => e.event_name);
}

function safeNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * PURE. Aggregate raw events into per-lesson rows.
 * Returns array sorted by starts desc, each:
 *   { lessonId, lessonTitle, starts, completions, completionRate,
 *     checkSubmits, checkPasses, checkPassRate, avgConfidenceDelta,
 *     confidenceSamples, tutorRecoveries }
 */
export function aggregateLvsByLesson(events) {
  const list = Array.isArray(events) ? events : [];
  const map = new Map();

  const ensure = (key, meta) => {
    if (!map.has(key)) {
      map.set(key, {
        lessonId: key,
        lessonTitle: (meta && meta.lesson_title) || key,
        starts: 0,
        completions: 0,
        checkSubmits: 0,
        checkPasses: 0,
        confidenceDeltaSum: 0,
        confidenceSamples: 0,
        tutorRecoveries: 0,
      });
    }
    const row = map.get(key);
    if ((!row.lessonTitle || row.lessonTitle === key) && meta && meta.lesson_title) {
      row.lessonTitle = meta.lesson_title;
    }
    return row;
  };

  for (const ev of list) {
    if (!ev || typeof ev !== "object") continue;
    const eventName = ev.event_name;
    if (!eventName) continue;
    const meta = ev.metadata && typeof ev.metadata === "object" ? ev.metadata : {};
    const key = meta.lesson_id || "(unknown lesson)";
    const row = ensure(key, meta);

    switch (eventName) {
      case LVS_EVENT_NAMES.lessonStart:
        row.starts += 1;
        break;
      case LVS_EVENT_NAMES.lessonComplete:
        row.completions += 1;
        if (meta.used_tutor === true) row.tutorRecoveries += 1;
        break;
      case LVS_EVENT_NAMES.checkSubmit:
        row.checkSubmits += 1;
        if (meta.passed === true) row.checkPasses += 1;
        if (meta.used_tutor === true) row.tutorRecoveries += 1;
        break;
      case LVS_EVENT_NAMES.tutorPromptUsed:
        row.tutorRecoveries += 1;
        break;
      default:
        if (meta.used_tutor === true) row.tutorRecoveries += 1;
        break;
    }

    const before = safeNum(meta.confidence_before);
    const after = safeNum(meta.confidence_after);
    if (before != null && after != null) {
      row.confidenceDeltaSum += after - before;
      row.confidenceSamples += 1;
    }
  }

  return Array.from(map.values())
    .map((r) => ({
      lessonId: r.lessonId,
      lessonTitle: r.lessonTitle || r.lessonId,
      starts: r.starts,
      completions: r.completions,
      completionRate: r.starts > 0 ? r.completions / r.starts : 0,
      checkSubmits: r.checkSubmits,
      checkPasses: r.checkPasses,
      checkPassRate: r.checkSubmits > 0 ? r.checkPasses / r.checkSubmits : 0,
      confidenceSamples: r.confidenceSamples,
      avgConfidenceDelta: r.confidenceSamples > 0 ? r.confidenceDeltaSum / r.confidenceSamples : null,
      tutorRecoveries: r.tutorRecoveries,
    }))
    .sort((a, b) => b.starts - a.starts || a.lessonId.localeCompare(b.lessonId));
}

/**
 * PURE. Summarize per-lesson rows into overall totals.
 * Returns: { totalStarts, totalCompletions, overallCompletionRate,
 *            avgConfidenceDelta, overallCheckPassRate }
 */
export function summarizeLvs(rows) {
  const list = Array.isArray(rows) ? rows : [];

  let totalStarts = 0;
  let totalCompletions = 0;
  let totalCheckSubmits = 0;
  let totalCheckPasses = 0;
  let confDeltaSum = 0;
  let confLessonCount = 0;

  for (const r of list) {
    totalStarts += r.starts || 0;
    totalCompletions += r.completions || 0;
    totalCheckSubmits += r.checkSubmits || 0;
    totalCheckPasses += r.checkPasses || 0;
    if (typeof r.avgConfidenceDelta === "number" && Number.isFinite(r.avgConfidenceDelta)) {
      confDeltaSum += r.avgConfidenceDelta;
      confLessonCount += 1;
    }
  }

  return {
    totalStarts,
    totalCompletions,
    overallCompletionRate: totalStarts > 0 ? totalCompletions / totalStarts : 0,
    avgConfidenceDelta: confLessonCount > 0 ? confDeltaSum / confLessonCount : null,
    overallCheckPassRate: totalCheckSubmits > 0 ? totalCheckPasses / totalCheckSubmits : 0,
  };
}

/**
 * Load dashboard data through the query layer: prefer live Supabase data,
 * fall back to the localStorage mirror. Never throws.
 * Returns { source, events, rows, summary }.
 */
export async function loadLvsDashboardData() {
  let events = null;
  let source = "local";

  try {
    const live = await fetchLvsEventsFromSupabase();
    if (Array.isArray(live) && live.length > 0) {
      events = live;
      source = "live";
    }
  } catch {
    // Ignore — fall through to local.
  }

  if (!events) {
    events = loadLocalLvsEvents();
    source = "local";
  }

  const rows = aggregateLvsByLesson(events);
  return {
    source,
    events,
    rows,
    summary: summarizeLvs(rows),
  };
}
