import { useEffect, useState } from "react";
import { DS, dsGlassCard } from "../lib/ds-platform-tokens.js";
import { loadLvsDashboardData } from "../lib/lvs-queries.js";

/**
 * Learning Value Score (LVS) dashboard.
 *
 * DATA SOURCING (DS-202)
 * ----------------------
 * Data is sourced through the server-side query layer in `src/lib/lvs-queries.js`.
 * `loadLvsDashboardData()` prefers live aggregation over the Supabase `event_logs`
 * table and transparently falls back to the localStorage mirror (`ds_lvs_events`)
 * written by `trackLvsEvent` in analytics.js. The active source is shown as a
 * badge in the header. Any failure degrades to the friendly empty state.
 */

const SANS = "var(--ds-sans), sans-serif";
const MONO = "var(--ds-mono), monospace";
const LOW = "#FCA5A5";

const LS_KEY = "ds_lvs_events";

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

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

function SourceBadge({ source }) {
  const live = source === "live";
  const color = live ? DS.grn : DS.t3;
  const label = live ? "live" : "local";
  const detail = live ? "Supabase" : "this browser";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        borderRadius: 999,
        padding: "3px 10px",
        background: "rgba(255,255,255,0.02)",
      }}
      title={`Data source: ${detail}`}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
          display: "inline-block",
        }}
      />
      {label} · {detail}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const EMPTY_SUMMARY = {
  totalStarts: 0,
  totalCompletions: 0,
  overallCompletionRate: 0,
  avgConfidenceDelta: null,
  overallCheckPassRate: 0,
};

export default function LvsDashboard() {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("local");
  const [rawCount, setRawCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await loadLvsDashboardData();
        if (!active) return;
        setRows(Array.isArray(data?.rows) ? data.rows : []);
        setSummary(data?.summary || EMPTY_SUMMARY);
        setSource(data?.source === "live" ? "live" : "local");
        setRawCount(Array.isArray(data?.events) ? data.events.length : 0);
      } catch {
        if (!active) return;
        setRows([]);
        setSummary(EMPTY_SUMMARY);
        setSource("local");
        setRawCount(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isEmpty = rows.length === 0;

  // The query layer returns rates as ratios (0–1) and confidence delta as a
  // raw number (or null). The presentation helpers below expect percentages
  // (0–100), so normalize here while keeping the existing visuals intact.
  const totals = {
    lessonsStarted: summary.totalStarts,
    completed: summary.totalCompletions,
    completionRate: (summary.overallCompletionRate || 0) * 100,
    avgConfidenceDelta:
      typeof summary.avgConfidenceDelta === "number" ? summary.avgConfidenceDelta : 0,
    checkPassRate: (summary.overallCheckPassRate || 0) * 100,
  };

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
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: DS.ind,
              }}
            >
              Analytics
            </div>
            {!loading && <SourceBadge source={source} />}
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
              {loading
                ? "Loading learning events…"
                : "No learning events captured yet — complete a lesson to populate the dashboard."}
            </div>
            <div style={{ color: DS.t3, fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}>
              The cards above show placeholder zeros. LVS events are aggregated from
              Supabase when available, falling back to this browser's local mirror.
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
                  rows.map((r) => {
                    const completionPct = (r.completionRate || 0) * 100;
                    const checkPassPct = (r.checkPassRate || 0) * 100;
                    const hasConfidence = typeof r.avgConfidenceDelta === "number";
                    return (
                      <tr key={r.lessonId}>
                        <td style={td}>
                          <div style={{ fontWeight: 700, color: DS.t1 }}>
                            {r.lessonTitle || r.lessonId}
                          </div>
                          {r.lessonTitle && r.lessonTitle !== r.lessonId && (
                            <div style={{ fontFamily: MONO, fontSize: 11, color: DS.dim, marginTop: 3 }}>
                              {r.lessonId}
                            </div>
                          )}
                        </td>
                        <td style={numCell}>{r.starts}</td>
                        <td style={numCell}>{r.completions}</td>
                        <td style={{ ...td, minWidth: 120 }}>
                          <span style={{ color: rateColor(completionPct), fontFamily: MONO, fontSize: 12.5 }}>
                            {fmtPct(completionPct)}
                          </span>
                          <RateBar pct={completionPct} />
                        </td>
                        <td style={{ ...td, minWidth: 120 }}>
                          {r.checkSubmits > 0 ? (
                            <>
                              <span
                                style={{ color: rateColor(checkPassPct), fontFamily: MONO, fontSize: 12.5 }}
                              >
                                {fmtPct(checkPassPct)}
                              </span>
                              <RateBar pct={checkPassPct} />
                            </>
                          ) : (
                            <span style={{ color: DS.dim, fontFamily: MONO, fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...numCell,
                            color: !hasConfidence ? DS.dim : r.avgConfidenceDelta >= 0 ? DS.grn : LOW,
                          }}
                        >
                          {!hasConfidence ? "—" : fmtDelta(r.avgConfidenceDelta)}
                        </td>
                        <td style={numCell}>{r.tutorRecoveries}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ color: DS.dim, fontSize: 11.5, fontFamily: MONO, marginTop: 18 }}>
          source: {source === "live" ? "Supabase event_logs" : `localStorage["${LS_KEY}"]`} ·{" "}
          {rawCount} raw event{rawCount === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
