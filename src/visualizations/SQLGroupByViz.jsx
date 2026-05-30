import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#F59E0B";

const RAW_ROWS = [
  { customer_id: "C1", customer_name: "Alice", region: "West", amount: 120, refund: null },
  { customer_id: "C1", customer_name: "Alice", region: "West", amount: 80, refund: 20 },
  { customer_id: "C2", customer_name: "Bob", region: "East", amount: 200, refund: null },
  { customer_id: "C3", customer_name: "Carol", region: "West", amount: 50, refund: 10 },
  { customer_id: "C2", customer_name: "Bob", region: "East", amount: 150, refund: null },
  { customer_id: "C3", customer_name: "Carol", region: "West", amount: 90, refund: null },
];

function groupData(rows, key) {
  const groups = {};
  rows.forEach((r) => {
    const k = r[key];
    if (!groups[k]) groups[k] = [];
    groups[k].push(r);
  });
  return groups;
}

const COUNT_MODES = [
  { id: "star", label: "COUNT(*)", fn: (rows) => rows.length },
  { id: "one", label: "COUNT(1)", fn: (rows) => rows.length },
  { id: "col", label: "COUNT(refund)", fn: (rows) => rows.filter((r) => r.refund !== null).length },
];

const GROUP_KEYS = [
  { id: "customer_id", label: "customer_id" },
  { id: "region", label: "region" },
];

export default function SQLGroupByViz() {
  const [groupKey, setGroupKey] = useState("customer_id");
  const [countMode, setCountMode] = useState("star");
  const [step, setStep] = useState("raw");

  const groups = groupData(RAW_ROWS, groupKey);
  const selectedCount = COUNT_MODES.find((m) => m.id === countMode);

  const aggregated = Object.entries(groups).map(([key, rows]) => ({
    key,
    rows,
    count: selectedCount.fn(rows),
    sum: rows.reduce((s, r) => s + r.amount, 0),
    avg: Math.round(rows.reduce((s, r) => s + r.amount, 0) / rows.length),
  }));

  const REGION_COLOR = { West: "#8B5CF6", East: "#0EA5E9" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          GROUP BY Visualizer
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Watch raw rows collapse into buckets. Toggle the GROUP BY key and observe how COUNT(*), COUNT(1), and COUNT(column) differ when NULLs exist.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>GROUP BY</div>
          <div style={{ display: "flex", gap: 6 }}>
            {GROUP_KEYS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setGroupKey(k.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1.5px solid ${groupKey === k.id ? ACCENT : `${ACCENT}44`}`,
                  background: groupKey === k.id ? `${ACCENT}22` : "rgba(255,255,255,0.03)",
                  color: groupKey === k.id ? ACCENT : DS.t3,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>COUNT EXPRESSION</div>
          <div style={{ display: "flex", gap: 6 }}>
            {COUNT_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setCountMode(m.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1.5px solid ${countMode === m.id ? "#10B981" : "#10B98144"}`,
                  background: countMode === m.id ? "#10B98122" : "rgba(255,255,255,0.03)",
                  color: countMode === m.id ? "#10B981" : DS.t3,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>VIEW</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["raw", "grouped"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1.5px solid ${step === s ? "#6366F1" : "#6366F144"}`,
                  background: step === s ? "#6366F122" : "rgba(255,255,255,0.03)",
                  color: step === s ? "#6366F1" : DS.t3,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--ds-mono), monospace",
                  textTransform: "capitalize",
                }}
              >
                {s === "raw" ? "Raw rows" : "Aggregated"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {step === "raw" ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["customer_id", "customer_name", "region", "amount", "refund"].map((col) => (
                  <th key={col} style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    color: col === groupKey ? ACCENT : DS.dim,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${DS.border}`,
                  }}>
                    {col}{col === groupKey ? " ← GROUP BY" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RAW_ROWS.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                  {["customer_id", "customer_name", "region", "amount", "refund"].map((col) => (
                    <td key={col} style={{
                      padding: "8px 12px",
                      color: row[col] === null ? "#F59E0B" : DS.t2,
                      fontFamily: col === "amount" || col === "refund" ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
                      fontWeight: col === groupKey ? 700 : 400,
                      background: col === groupKey ? `${ACCENT}08` : "transparent",
                    }}>
                      {row[col] === null ? "NULL" : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            {RAW_ROWS.length} rows · NULL refund values highlighted in amber
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {aggregated.map(({ key, rows, count, sum, avg }) => {
            const groupColor = groupKey === "region" ? (REGION_COLOR[key] || ACCENT) : ACCENT;
            return (
              <div key={key} style={{
                padding: "14px 16px",
                borderRadius: 10,
                border: `1px solid ${groupColor}33`,
                background: `${groupColor}08`,
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>
                      {groupKey} =
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: groupColor }}>{key}</div>
                    <div style={{ fontSize: 11, color: DS.t3, marginTop: 2 }}>{rows.length} source row{rows.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[
                      { label: selectedCount.label, val: count, accent: "#10B981", note: countMode === "col" && count < rows.length ? `(${rows.length - count} NULL skipped)` : "" },
                      { label: "SUM(amount)", val: sum, accent: "#0EA5E9" },
                      { label: "AVG(amount)", val: avg, accent: "#8B5CF6" },
                    ].map(({ label, val, accent, note }) => (
                      <div key={label} style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.08em" }}>{label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "var(--ds-mono), monospace" }}>{val}</div>
                        {note && <div style={{ fontSize: 10, color: "#F59E0B" }}>{note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {rows.map((r, ri) => (
                    <div key={ri} style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${DS.border}`,
                      color: DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                    }}>
                      ${r.amount}{r.refund === null ? " · refund=NULL" : ` · refund=$${r.refund}`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {countMode === "col" && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#F59E0B0d", border: "1px solid #F59E0B33", color: "#F59E0B", fontSize: 13, lineHeight: 1.6 }}>
              <strong>COUNT(refund)</strong> skips NULL values — this is why COUNT(column) and COUNT(*) can return different numbers for the same group.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
