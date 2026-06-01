import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#0EA5E9";
const GRN = "#34D399";
const AMB = "#F59E0B";
const RED = "#F87171";
const PRP = "#8B5CF6";

const DAILY_DATA = [
  { date: "2025-01-06", revenue: 1200 },
  { date: "2025-01-07", revenue: 980 },
  { date: "2025-01-08", revenue: 1540 },
  { date: "2025-01-09", revenue: 1120 },
  { date: "2025-01-10", revenue: 1670 },
  { date: "2025-01-11", revenue: 890 },
  { date: "2025-01-12", revenue: 2100 },
  { date: "2025-01-13", revenue: 1430 },
  { date: "2025-01-14", revenue: 1780 },
  { date: "2025-01-15", revenue: 2050 },
];

function computeColumn(rows, mode) {
  return rows.map((row, i) => {
    let value = null;
    if (mode === "lag") {
      value = i > 0 ? rows[i - 1].revenue : null;
    } else if (mode === "lead") {
      value = i < rows.length - 1 ? rows[i + 1].revenue : null;
    } else if (mode === "running_sum") {
      value = rows.slice(0, i + 1).reduce((s, r) => s + r.revenue, 0);
    } else if (mode === "moving_avg") {
      const window = rows.slice(Math.max(0, i - 6), i + 1);
      value = Math.round(window.reduce((s, r) => s + r.revenue, 0) / window.length);
    }
    return { ...row, computed: value };
  });
}

const MODES = [
  { id: "lag",         label: "LAG(1)",            color: ACCENT, colLabel: "prev_day_rev",  expr: "LAG(revenue, 1) OVER (ORDER BY date)" },
  { id: "lead",        label: "LEAD(1)",            color: PRP,   colLabel: "next_day_rev",  expr: "LEAD(revenue, 1) OVER (ORDER BY date)" },
  { id: "running_sum", label: "Running SUM",        color: GRN,   colLabel: "running_total", expr: "SUM(revenue) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)" },
  { id: "moving_avg",  label: "7-day Moving AVG",   color: AMB,   colLabel: "moving_avg_7d", expr: "AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)" },
];

const DRILL = [
  {
    q: "LAG() without an ORDER BY clause in the OVER(...) will cause a SQL error in standard engines.",
    opts: [
      "True — ORDER BY is mandatory inside OVER() for LAG and LEAD",
      "False — ORDER BY is optional; the engine picks its own row order",
      "False — LAG doesn't use OVER() at all",
    ],
    correct: 0,
    exp: "Window functions that navigate rows (LAG, LEAD) and frame-based aggregates (SUM OVER ROWS BETWEEN ...) all require ORDER BY inside OVER() to define which row is 'previous' or 'next'. Without it the result is undefined or an error.",
  },
  {
    q: "A running SUM and a 7-day moving average use different ROWS BETWEEN frames. Which frame gives a rolling 7-day window ending at the current row?",
    opts: [
      "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
      "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING",
    ],
    correct: 1,
    exp: "6 PRECEDING AND CURRENT ROW captures the current row plus the 6 rows before it — exactly 7 rows when enough history exists. UNBOUNDED PRECEDING gives a running total from the very start.",
  },
  {
    q: "What does LAG(revenue, 1) return for the very first row in the partition?",
    opts: [
      "The last row's revenue (it wraps around)",
      "NULL — there is no previous row",
      "Zero, because no prior value exists",
    ],
    correct: 1,
    exp: "LAG returns NULL when there is no preceding row at the requested offset. You can supply a default: LAG(revenue, 1, 0) to substitute 0 instead of NULL.",
  },
];

function OptionButton({ label, selected, color, onClick }) {
  const c = color || ACCENT;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: `1.5px solid ${selected ? c : `${c}44`}`,
        background: selected ? `${c}22` : "rgba(255,255,255,0.03)",
        color: selected ? c : DS.t3,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "var(--ds-mono), monospace",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export default function SQLLagLeadViz() {
  const [mode, setMode] = useState("lag");
  const [drill, setDrill] = useState(Array(DRILL.length).fill(null));
  const [revealed, setRevealed] = useState(Array(DRILL.length).fill(false));

  const modeMeta = MODES.find((m) => m.id === mode);
  const rows = computeColumn(DAILY_DATA, mode);

  const sqlSnippet =
    `SELECT\n  date,\n  revenue,\n  ${modeMeta.expr}\n    AS ${modeMeta.colLabel}\nFROM daily_revenue\nORDER BY date;`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          LAG, LEAD & Running Calculations
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Select a computed column to see how the window frame shifts across the daily revenue timeline. ORDER BY inside OVER() is always required.
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>COMPUTED COLUMN</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MODES.map((m) => (
            <OptionButton key={m.id} label={m.label} selected={mode === m.id} color={m.color} onClick={() => setMode(m.id)} />
          ))}
        </div>
      </div>

      {/* SQL preview */}
      <pre style={{
        margin: 0,
        padding: "12px 14px",
        borderRadius: 8,
        border: `1px solid ${modeMeta.color}33`,
        background: "rgba(2,6,23,0.72)",
        color: DS.t1,
        fontSize: 12,
        lineHeight: 1.7,
        fontFamily: "var(--ds-mono), monospace",
        overflowX: "auto",
      }}>
        <code>{sqlSnippet}</code>
      </pre>

      {/* ORDER BY warning banner */}
      <div style={{ padding: "10px 14px", borderRadius: 8, background: `${AMB}0d`, border: `1px solid ${AMB}33`, color: AMB, fontSize: 12, lineHeight: 1.6 }}>
        <strong>Mandatory: </strong>
        All window functions that depend on row order (LAG, LEAD, ROWS BETWEEN frames) require{" "}
        <span style={{ fontFamily: "var(--ds-mono), monospace" }}>ORDER BY</span> inside{" "}
        <span style={{ fontFamily: "var(--ds-mono), monospace" }}>OVER()</span>.
        Omitting it produces undefined or engine-error behavior.
      </div>

      {/* Result table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["date", "revenue", modeMeta.colLabel].map((col) => {
                const isComputed = col === modeMeta.colLabel;
                return (
                  <th key={col} style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    color: isComputed ? modeMeta.color : DS.dim,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${DS.border}`,
                    background: isComputed ? `${modeMeta.color}0a` : "transparent",
                  }}>
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isNull = row.computed === null;
              const prevRev = i > 0 ? rows[i - 1].revenue : null;
              const trend =
                mode === "lag" && !isNull
                  ? row.revenue > row.computed
                    ? "up"
                    : row.revenue < row.computed
                    ? "down"
                    : "flat"
                  : null;
              return (
                <tr key={row.date} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                  <td style={{ padding: "8px 12px", color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{row.date}</td>
                  <td style={{ padding: "8px 12px", color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>
                    ${row.revenue.toLocaleString()}
                  </td>
                  <td style={{
                    padding: "8px 12px",
                    fontFamily: "var(--ds-mono), monospace",
                    fontWeight: isNull ? 400 : 700,
                    color: isNull ? DS.dim : modeMeta.color,
                    background: `${modeMeta.color}0d`,
                  }}>
                    {isNull ? "NULL" : (
                      <>
                        ${row.computed.toLocaleString()}
                        {trend === "up" && <span style={{ marginLeft: 6, color: GRN, fontSize: 11 }}>▲</span>}
                        {trend === "down" && <span style={{ marginLeft: 6, color: RED, fontSize: 11 }}>▼</span>}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 8, fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
          {rows.filter((r) => r.computed === null).length} NULL row(s) at window boundary
        </div>
      </div>

      {/* Frame explanation */}
      <div style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${modeMeta.color}22`, background: `${modeMeta.color}06` }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>
          HOW THE FRAME WORKS
        </div>
        {mode === "lag" && (
          <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: modeMeta.color }}>LAG(n)</strong> looks back n rows in the ORDER BY sequence. The first row has no predecessor, so it returns NULL. Use the third argument to supply a default: <code style={{ fontFamily: "var(--ds-mono), monospace", color: DS.t2 }}>LAG(revenue, 1, 0)</code>.
          </p>
        )}
        {mode === "lead" && (
          <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: modeMeta.color }}>LEAD(n)</strong> looks forward n rows. The last row has no successor — it returns NULL. Useful for computing "days until next event" or "next quarter projection."
          </p>
        )}
        {mode === "running_sum" && (
          <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: modeMeta.color }}>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</strong> grows the frame from the very first row up to the current row — producing a cumulative running total.
          </p>
        )}
        {mode === "moving_avg" && (
          <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: modeMeta.color }}>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</strong> caps the frame at 7 rows (current + 6 before). Early rows use a shorter window — the first row averages over only itself.
          </p>
        )}
      </div>

      {/* Drill */}
      <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 20 }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          Quick Drill
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DRILL.map((q, qi) => (
            <div key={qi} style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 13, color: DS.t2, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>
                Q{qi + 1}. {q.q}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.opts.map((opt, oi) => {
                  const chosen = drill[qi] === oi;
                  const correct = oi === q.correct;
                  const show = revealed[qi];
                  const borderC = show && correct ? GRN : show && chosen && !correct ? RED : chosen ? ACCENT : DS.border;
                  const bg = show && correct ? `${GRN}18` : show && chosen && !correct ? `${RED}18` : chosen ? `${ACCENT}14` : "transparent";
                  const textC = show && correct ? GRN : show && chosen && !correct ? RED : chosen ? ACCENT : DS.t3;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => {
                        if (revealed[qi]) return;
                        const next = [...drill];
                        next[qi] = oi;
                        setDrill(next);
                      }}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: `1px solid ${borderC}`,
                        background: bg,
                        color: textC,
                        fontSize: 12,
                        cursor: revealed[qi] ? "default" : "pointer",
                        fontFamily: "var(--ds-sans), sans-serif",
                        lineHeight: 1.5,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {drill[qi] !== null && !revealed[qi] && (
                <button
                  type="button"
                  onClick={() => { const n = [...revealed]; n[qi] = true; setRevealed(n); }}
                  style={{
                    marginTop: 8,
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: `1px solid ${ACCENT}55`,
                    background: `${ACCENT}14`,
                    color: ACCENT,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "var(--ds-mono), monospace",
                    fontWeight: 700,
                  }}
                >
                  Check answer
                </button>
              )}
              {revealed[qi] && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, background: `${GRN}0d`, border: `1px solid ${GRN}33`, color: DS.t2, fontSize: 12, lineHeight: 1.55 }}>
                  {q.exp}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
