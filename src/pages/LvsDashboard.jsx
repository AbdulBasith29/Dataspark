import { useMemo } from "react";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";
import { LVS_EVENT_NAMES } from "../lib/analytics.js";

/**
 * Learning Value Score (LVS) dashboard.
 *
 * DATA SOURCING NOTE
 * ------------------
 * In analytics.js, `safeLogClientEvent` / `trackLvsEvent` persist events ONLY to
 * the Supabase `event_logs` table over the network — there is no local mirror.
 * A dashboard cannot read from Supabase synchronously in-browser without a query,
 * so this page reads defensively from a localStorage sink under `ds_lvs_events`.
 *
 * Integrator TODO (do NOT change here — owned by analytics.js): for this dashboard
 * to populate from real client activity, `trackLvsEvent` should also mirror each
 * event into localStorage["ds_lvs_events"] as a JSON array of:
 *   { eventName, page, metadata, ts }
 * The reader below tolerates several reasonable shapes so it stays robust.
 */

const SANS = "var(--ds-sans), sans-serif";
const MONO = "var(--ds-mono), monospace";
const LOW = "#FCA5A5";

const LS_KEY = "ds_lvs_events";

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

/** Read + parse LVS events from the localStorage sink. Always returns []. */
export function loadEvents() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  let raw;
  try {
    raw = window.localStorage.getItem(LS_KEY);
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

  // Tolerate either a bare array or an object wrapping `{ events: [...] }`.
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.events)
    ? parsed.events
    : [];

  return list.filter((e) => e && typeof e === "object");
}

/** Normalize one event into { eventName, metadata } regardless of shape. */
function normalizeEvent(e) {
  const eventName = e.eventName || e.event_name || e.name || null;
  const metadata = e.metadata || e.meta || {};
  return { eventName, metadata: metadata && typeof metadata === "object" ? metadata : {} };
}

function lessonKeyOf(meta) {
  return meta.lesson_id || meta.lessonId || "(unknown lesson)";
}

function lessonTitleOf(meta) {
  return meta.lesson_title || meta.lessonTitle || null;
}

/**
 * Aggregate raw events into per-lesson rows.
 * Returns array of:
 *   { lessonId, lessonTitle, starts, completions, completionRate,
 *     checkTotal, checkPassed, checkPassRate, confidenceDeltaAvg,
 *     confidenceSamples, tutorRecoveries }
 */
export function aggregateByLesson(events) {
  const map = new Map();

  const ensure = (key, meta) => {
    if (!map.has(key)) {
      map.set(key, {
        lessonId: key,
        lessonTitle: lessonTitleOf(meta),
        starts: 0,
        completions: 0,
        checkTotal: 0,
        checkPassed: 0,
        confidenceDeltaSum: 0,
        confidenceSamples: 0,
        tutorRecoveries: 0,
        _usedTutorInRun: false,
      });
    }
    const row = map.get(key);
    if (!row.lessonTitle && lessonTitleOf(meta)) row.lessonTitle = lessonTitleOf(meta);
    return row;
  };

  for (const rawEvent of events) {
    const { eventName, metadata } = normalizeEvent(rawEvent);
    if (!eventName) continue;
    const key = lessonKeyOf(metadata);
    const row = ensure(key, metadata);

    switch (eventName) {
      case LVS_EVENT_NAMES.lessonStart: {
        row.starts += 1;
        row._usedTutorInRun = false; // reset per-run tutor tracking
        if (metadata.used_tutor === true || metadata.usedTutor === true) {
          row._usedTutorInRun = true;
        }
        break;
      }
      case LVS_EVENT_NAMES.tutorPromptUsed: {
        row._usedTutorInRun = true;
        break;
      }
      case LVS_EVENT_NAMES.checkSubmit: {
        row.checkTotal += 1;
        if (metadata.passed === true) row.checkPassed += 1;
        break;
      }
      case LVS_EVENT_NAMES.lessonComplete: {
        row.completions += 1;
        // Tutor-assisted recovery: this run completed AND the tutor was used.
        const usedTutor =
          row._usedTutorInRun ||
          metadata.used_tutor === true ||
          metadata.usedTutor === true;
        if (usedTutor) row.tutorRecoveries += 1;
        row._usedTutorInRun = false;
        break;
      }
      case LVS_EVENT_NAMES.confidenceDelta: {
        const delta =
          typeof metadata.delta === "number"
            ? metadata.delta
            : typeof metadata.confidence_after === "number" &&
              typeof metadata.confidence_before === "number"
            ? metadata.confidence_after - metadata.confidence_before
            : null;
        if (delta != null) {
          row.confidenceDeltaSum += delta;
          row.confidenceSamples += 1;
        }
        break;
      }
      case LVS_EVENT_NAMES.confidenceRated: {
        // Some pipelines emit before/after on a single rated event.
        if (
          typeof metadata.confidence_after === "number" &&
          typeof metadata.confidence_before === "number"
        ) {
          row.confidenceDeltaSum += metadata.confidence_after - metadata.confidence_before;
          row.confidenceSamples += 1;
        }
        break;
      }
      default:
        break;
    }
  }

  return Array.from(map.values())
    .map((r) => ({
      lessonId: r.lessonId,
      lessonTitle: r.lessonTitle,
      starts: r.starts,
      completions: r.completions,
      completionRate: r.starts > 0 ? (r.completions / r.starts) * 100 : 0,
      checkTotal: r.checkTotal,
      checkPassed: r.checkPassed,
      checkPassRate: r.checkTotal > 0 ? (r.checkPassed / r.checkTotal) * 100 : 0,
      confidenceSamples: r.confidenceSamples,
      confidenceDeltaAvg: r.confidenceSamples > 0 ? r.confidenceDeltaSum / r.confidenceSamples : 0,
      tutorRecoveries: r.tutorRecoveries,
    }))
    .sort((a, b) => b.starts - a.starts || a.lessonId.localeCompare(b.lessonId));
}

function rateColor(pct) {
  if (pct >= 70) return DS.grn;
  if (pct >= 40) return DS.ind;
  return LOW;
}

function fmtPct(pct) {
  return `${Math.round(pct)}%`;
}

function fmtDelta(n) {
  if (n === 0) return "0.0";
  const v = Math.round(n * 10) / 10;
  return v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
}

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */

function RateBar({ pct }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: rateColor(pct),
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={dsGlassCard({
        padding: "16px 18px",
        borderRadius: DS.radiusMd,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      })}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: DS.t3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 26,
          fontWeight: 800,
          color: accent || DS.t1,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LvsDashboard() {
  const events = useMemo(() => loadEvents(), []);
  const rows = useMemo(() => aggregateByLesson(events), [events]);

  const isEmpty = rows.length === 0;

  const totals = useMemo(() => {
    let starts = 0;
    let completions = 0;
    let checkTotal = 0;
    let checkPassed = 0;
    let confidenceDeltaSum = 0;
    let confidenceSamples = 0;
    for (const r of rows) {
      starts += r.starts;
      completions += r.completions;
      checkTotal += r.checkTotal;
      checkPassed += r.checkPassed;
      confidenceDeltaSum += r.confidenceDeltaAvg * r.confidenceSamples;
      confidenceSamples += r.confidenceSamples;
    }
    return {
      lessonsStarted: starts,
      completed: completions,
      completionRate: starts > 0 ? (completions / starts) * 100 : 0,
      avgConfidenceDelta: confidenceSamples > 0 ? confidenceDeltaSum / confidenceSamples : 0,
      checkPassRate: checkTotal > 0 ? (checkPassed / checkTotal) * 100 : 0,
    };
  }, [rows]);

  const th = {
    textAlign: "left",
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: DS.t3,
    fontWeight: 600,
    padding: "10px 12px",
    borderBottom: `1px solid ${DS.border}`,
    whiteSpace: "nowrap",
  };
  const td = {
    fontFamily: SANS,
    fontSize: 13,
    color: DS.t2,
    padding: "12px",
    borderBottom: `1px solid ${DS.border}`,
    verticalAlign: "top",
  };
  const numCell = { ...td, textAlign: "right", fontFamily: MONO };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DS.bg,
        color: DS.t1,
        fontFamily: SANS,
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: DS.ind,
              marginBottom: 10,
            }}
          >
            Analytics
          </div>
          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 900,
              letterSpacing: "-1px",
              margin: 0,
            }}
          >
            Learning Value Score
          </h1>
          <p style={{ color: DS.t3, fontSize: 14.5, lineHeight: 1.6, marginTop: 10, maxWidth: 640 }}>
            Per-lesson signal on whether learners start, finish, pass knowledge checks, grow in
            confidence, and recover with tutor help — the real value the platform delivers.
          </p>
        </header>

        {/* Summary stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <StatCard label="Lessons Started" value={totals.lessonsStarted} />
          <StatCard label="Lessons Completed" value={totals.completed} />
          <StatCard
            label="Completion Rate"
            value={fmtPct(totals.completionRate)}
            accent={rateColor(totals.completionRate)}
          />
          <StatCard
            label="Avg Confidence Δ"
            value={fmtDelta(totals.avgConfidenceDelta)}
            accent={totals.avgConfidenceDelta >= 0 ? DS.grn : LOW}
          />
          <StatCard
            label="Check Pass Rate"
            value={fmtPct(totals.checkPassRate)}
            accent={rateColor(totals.checkPassRate)}
          />
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div
            style={dsGlassCard({
              padding: "20px 22px",
              borderRadius: DS.radiusMd,
              marginBottom: 22,
              borderColor: DS.borderStrong,
            })}
          >
            <div style={{ color: DS.t2, fontSize: 14, fontWeight: 600 }}>
              No learning events captured yet — complete a lesson to populate the dashboard.
            </div>
            <div style={{ color: DS.t3, fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}>
              The cards above show placeholder zeros. Once LVS events are mirrored into
              local storage, this page aggregates them per lesson automatically.
            </div>
          </div>
        )}

        {/* Per-lesson breakdown */}
        <section
          style={dsGlassCard({
            padding: 0,
            borderRadius: DS.radiusLg,
            overflow: "hidden",
          })}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: `1px solid ${DS.border}`,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" }}>
              Per-lesson breakdown
            </div>
            <div style={{ color: DS.t3, fontSize: 12.5, marginTop: 4 }}>
              Aggregated by lesson id across all captured events.
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={th}>Lesson</th>
                  <th style={{ ...th, textAlign: "right" }}>Starts</th>
                  <th style={{ ...th, textAlign: "right" }}>Completes</th>
                  <th style={th}>Completion</th>
                  <th style={th}>Check pass</th>
                  <th style={{ ...th, textAlign: "right" }}>Avg conf Δ</th>
                  <th style={{ ...th, textAlign: "right" }}>Tutor recoveries</th>
                </tr>
              </thead>
              <tbody>
                {isEmpty ? (
                  <tr>
                    <td style={{ ...td, color: DS.dim }}>
                      <span style={{ fontFamily: MONO }}>(example)</span> lesson-001
                    </td>
                    <td style={numCell}>0</td>
                    <td style={numCell}>0</td>
                    <td style={td}>
                      <span style={{ color: DS.dim }}>0%</span>
                      <RateBar pct={0} />
                    </td>
                    <td style={td}>
                      <span style={{ color: DS.dim }}>0%</span>
                      <RateBar pct={0} />
                    </td>
                    <td style={numCell}>0.0</td>
                    <td style={numCell}>0</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.lessonId}>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: DS.t1 }}>
                          {r.lessonTitle || r.lessonId}
                        </div>
                        {r.lessonTitle && (
                          <div style={{ fontFamily: MONO, fontSize: 11, color: DS.dim, marginTop: 3 }}>
                            {r.lessonId}
                          </div>
                        )}
                      </td>
                      <td style={numCell}>{r.starts}</td>
                      <td style={numCell}>{r.completions}</td>
                      <td style={{ ...td, minWidth: 120 }}>
                        <span style={{ color: rateColor(r.completionRate), fontFamily: MONO, fontSize: 12.5 }}>
                          {fmtPct(r.completionRate)}
                        </span>
                        <RateBar pct={r.completionRate} />
                      </td>
                      <td style={{ ...td, minWidth: 120 }}>
                        {r.checkTotal > 0 ? (
                          <>
                            <span
                              style={{ color: rateColor(r.checkPassRate), fontFamily: MONO, fontSize: 12.5 }}
                            >
                              {fmtPct(r.checkPassRate)}
                            </span>
                            <RateBar pct={r.checkPassRate} />
                          </>
                        ) : (
                          <span style={{ color: DS.dim, fontFamily: MONO, fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td
                        style={{
                          ...numCell,
                          color: r.confidenceSamples === 0 ? DS.dim : r.confidenceDeltaAvg >= 0 ? DS.grn : LOW,
                        }}
                      >
                        {r.confidenceSamples === 0 ? "—" : fmtDelta(r.confidenceDeltaAvg)}
                      </td>
                      <td style={numCell}>{r.tutorRecoveries}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ color: DS.dim, fontSize: 11.5, fontFamily: MONO, marginTop: 18 }}>
          source: localStorage["{LS_KEY}"] · {events.length} raw event{events.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
