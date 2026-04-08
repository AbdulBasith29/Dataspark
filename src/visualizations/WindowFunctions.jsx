import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ROWS = [
  { user_id: 101, order_day: "2025-01-02", line_revenue: 40 },
  { user_id: 101, order_day: "2025-01-02", line_revenue: 12 },
  { user_id: 101, order_day: "2025-01-09", line_revenue: 8 },
  { user_id: 202, order_day: "2025-01-03", line_revenue: 55 },
  { user_id: 202, order_day: "2025-01-04", line_revenue: 20 },
  { user_id: 202, order_day: "2025-01-08", line_revenue: 11 },
];

const MODES = ["ROW_NUMBER", "RANK", "DENSE_RANK", "running_sum", "LAG"];

const ide = {
  surface: "rgba(13, 17, 23, 0.95)",
  headerBg: "rgba(22, 27, 34, 0.98)",
  grid: "rgba(255,255,255,0.08)",
  mono: "var(--ds-mono), 'JetBrains Mono', ui-monospace, monospace",
};

function sortKey(a, b) {
  if (a.user_id !== b.user_id) return a.user_id - b.user_id;
  if (a.order_day !== b.order_day) return a.order_day.localeCompare(b.order_day);
  return a.line_revenue - b.line_revenue;
}

function computeWindowed(mode) {
  const byUser = {};
  for (const r of ROWS) {
    (byUser[r.user_id] ||= []).push({ ...r });
  }
  const out = [];
  for (const uid of Object.keys(byUser).sort((a, b) => +a - +b)) {
    const g = byUser[uid].sort(sortKey);
    let rn = 0;
    let prevDay = null;
    let runStart = 1;
    let dense = 0;
    let running = 0;
    let prevRev = null;
    for (const r of g) {
      rn++;
      if (r.order_day !== prevDay) {
        runStart = rn;
        dense++;
        prevDay = r.order_day;
      }
      running += r.line_revenue;
      let val;
      if (mode === "ROW_NUMBER") val = rn;
      else if (mode === "RANK") val = runStart;
      else if (mode === "DENSE_RANK") val = dense;
      else if (mode === "running_sum") val = running;
      else val = prevRev;
      out.push({
        ...r,
        window_val: val,
        _rn: rn,
        _uid: uid,
      });
      prevRev = r.line_revenue;
    }
  }
  out.sort(sortKey);
  return out;
}

function sqlFor(mode) {
  const base = `SELECT
  user_id,
  order_day,
  line_revenue`;
  const over = `OVER (
  PARTITION BY user_id
  ORDER BY order_day, line_revenue
)`;
  if (mode === "ROW_NUMBER") return `${base},\n  ROW_NUMBER() ${over} AS rn\nFROM fct_orders;`;
  if (mode === "RANK") return `${base},\n  RANK() ${over} AS rnk\nFROM fct_orders;`;
  if (mode === "DENSE_RANK") return `${base},\n  DENSE_RANK() ${over} AS drnk\nFROM fct_orders;`;
  if (mode === "running_sum")
    return `${base},\n  SUM(line_revenue) ${over}\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  AS rev_cum\nFROM fct_orders;`;
  return `${base},\n  LAG(line_revenue, 1) ${over} AS prev_rev\nFROM fct_orders;`;
}

function NullCell() {
  return (
    <span style={{ color: DS.dim, fontStyle: "italic", fontWeight: 400 }}>NULL</span>
  );
}

export default function WindowFunctions() {
  const [mode, setMode] = useState("ROW_NUMBER");
  const [hoverIdx, setHoverIdx] = useState(null);

  const result = useMemo(() => computeWindowed(mode), [mode]);
  const sql = useMemo(() => sqlFor(mode), [mode]);

  const colTitle =
    mode === "ROW_NUMBER"
      ? "rn"
      : mode === "RANK"
        ? "rnk"
        : mode === "DENSE_RANK"
          ? "drnk"
          : mode === "running_sum"
            ? "rev_cum"
            : "prev_rev";

  const hoverUid = hoverIdx !== null ? result[hoverIdx]?.user_id : null;

  const th = (isKey) => ({
    textAlign: "left",
    padding: "8px 10px",
    color: isKey ? DS.ind : DS.t3,
    fontWeight: 600,
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${ide.grid}`,
    borderRight: `1px solid ${ide.grid}`,
    fontFamily: ide.mono,
    whiteSpace: "nowrap",
  });

  const td = () => ({
    padding: "7px 10px",
    borderBottom: `1px solid ${ide.grid}`,
    borderRight: `1px solid ${ide.grid}`,
    color: DS.t1,
    fontFamily: ide.mono,
    fontSize: 11,
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 6 }}>
        Window frame: partition + order
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: ide.mono, lineHeight: 1.6, marginBottom: 14 }}>
        Source is a fact table keyed by <code style={{ color: DS.ind }}>user_id</code> with two lines on the same calendar day (ties). Compare{" "}
        <strong style={{ color: DS.t2 }}>ROW_NUMBER</strong> vs <strong style={{ color: DS.t2 }}>RANK</strong> vs <strong style={{ color: DS.t2 }}>DENSE_RANK</strong>, then see a running sum and{" "}
        <strong style={{ color: DS.t2 }}>LAG</strong> for prior row revenue inside each partition.
      </p>

      <div
        style={{
          border: `1px solid ${ide.grid}`,
          borderRadius: 8,
          overflow: "hidden",
          background: ide.surface,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${ide.grid}`,
            background: ide.headerBg,
            fontFamily: ide.mono,
            fontSize: 11,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: DS.ind, fontWeight: 600 }}>fct_orders</span>
          <span style={{ color: DS.dim, fontSize: 10 }}>prod.commerce.fct_orders</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
            <thead>
              <tr style={{ background: ide.headerBg }}>
                <th style={th(true)}>user_id</th>
                <th style={th(false)}>order_day</th>
                <th style={th(false)}>line_revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...ROWS].sort(sortKey).map((r, i) => (
                <tr
                  key={i}
                  style={{
                    background: hoverUid != null && r.user_id === hoverUid ? "rgba(129, 140, 248, 0.12)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    transition: "background 0.12s ease",
                  }}
                >
                  <td style={{ ...td(), fontVariantNumeric: "tabular-nums" }}>{r.user_id}</td>
                  <td style={td()}>{r.order_day}</td>
                  <td style={{ ...td(), textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.line_revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: ide.mono, fontWeight: 600 }}>Window function</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          aria-label="Window function"
          style={{
            background: ide.surface,
            borderRadius: 6,
            border: `1px solid ${ide.grid}`,
            padding: "8px 12px",
            color: DS.t1,
            fontSize: 12,
            fontFamily: ide.mono,
            outline: "none",
            minWidth: 200,
          }}
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <pre
        style={{
          margin: "0 0 14px",
          padding: "12px 14px",
          fontFamily: ide.mono,
          fontSize: 11,
          lineHeight: 1.55,
          color: DS.t2,
          background: "rgba(0,0,0,0.35)",
          border: `1px solid ${ide.grid}`,
          borderRadius: 8,
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        {sql}
      </pre>

      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontFamily: ide.mono, fontWeight: 700, letterSpacing: "0.14em", color: DS.grn }}>RESULT SET</span>
        <span style={{ fontSize: 11, color: DS.dim, fontFamily: ide.mono }}>Hover a row to highlight its partition</span>
      </div>

      <div style={{ border: `1px solid ${ide.grid}`, borderRadius: 8, overflow: "auto", background: ide.surface, maxHeight: 320 }}>
        <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontFamily: ide.mono, fontSize: 11 }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, background: ide.headerBg, zIndex: 1, boxShadow: `0 1px 0 ${ide.grid}` }}>
              <th style={th(false)}>#</th>
              <th style={th(true)}>user_id</th>
              <th style={th(false)}>order_day</th>
              <th style={th(false)}>line_revenue</th>
              <th style={{ ...th(false), boxShadow: `inset 0 -2px 0 ${DS.grn}99` }}>{colTitle}</th>
            </tr>
          </thead>
          <tbody>
            {result.map((row, idx) => (
              <tr
                key={idx}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  outline: hoverIdx === idx ? `1px solid ${DS.ind}55` : "none",
                  outlineOffset: -1,
                  cursor: "default",
                }}
              >
                <td style={{ ...td(), color: DS.dim, fontSize: 10 }}>{idx + 1}</td>
                <td style={{ ...td(), fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{row.user_id}</td>
                <td style={td()}>{row.order_day}</td>
                <td style={{ ...td(), textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.line_revenue}</td>
                <td style={{ ...td(), textAlign: "right", fontVariantNumeric: "tabular-nums", background: "rgba(52, 211, 153, 0.06)" }}>
                  {mode === "LAG" && row.window_val == null ? <NullCell /> : row.window_val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        <strong style={{ color: DS.t2 }}>ROW_NUMBER</strong> is unique; <strong style={{ color: DS.t2 }}>RANK</strong> leaves gaps after ties; <strong style={{ color: DS.t2 }}>DENSE_RANK</strong> does not. Framing clauses (
        <code style={{ color: DS.ind }}>ROWS/RANGE</code>) change which neighbors feed aggregates like <code style={{ color: DS.ind }}>SUM</code> — interview favorite.
      </p>
    </div>
  );
}
