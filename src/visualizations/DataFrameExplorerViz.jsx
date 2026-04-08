import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

// Sample DataFrame: 8 rows of order data
const DF = [
  { idx: 0, user_id: "u1", amount: 120.5,  status: "completed", region: "US" },
  { idx: 1, user_id: "u2", amount: 45.0,   status: "pending",   region: "EU" },
  { idx: 2, user_id: "u1", amount: 980.0,  status: "completed", region: "US" },
  { idx: 3, user_id: "u3", amount: 33.75,  status: "cancelled", region: "APAC" },
  { idx: 4, user_id: "u2", amount: 210.0,  status: "completed", region: "EU" },
  { idx: 5, user_id: "u4", amount: 75.5,   status: "pending",   region: "US" },
  { idx: 6, user_id: "u3", amount: 540.0,  status: "completed", region: "APAC" },
  { idx: 7, user_id: "u4", amount: 18.0,   status: "cancelled", region: "EU" },
];
const COLS = ["user_id", "amount", "status", "region"];

const OPERATIONS = [
  {
    id: "col-select",
    label: `df["amount"]`,
    desc: "Select a single column → returns a Series",
    run: () => DF.map(r => ({ idx: r.idx, amount: r.amount })),
    cols: ["amount"],
  },
  {
    id: "multi-col",
    label: `df[["user_id","amount"]]`,
    desc: "Select multiple columns → returns a DataFrame",
    run: () => DF.map(r => ({ idx: r.idx, user_id: r.user_id, amount: r.amount })),
    cols: ["user_id", "amount"],
  },
  {
    id: "iloc",
    label: `df.iloc[2:5]`,
    desc: "iloc: rows by integer position, end is exclusive (like Python slices)",
    run: () => DF.slice(2, 5),
    cols: COLS,
  },
  {
    id: "loc",
    label: `df.loc[1:3]`,
    desc: "loc: rows by label — end is INCLUSIVE (unlike iloc!)",
    run: () => DF.slice(1, 4),
    cols: COLS,
  },
  {
    id: "bool-filter",
    label: `df[df["amount"] > 100]`,
    desc: "Boolean indexing: keep only rows where amount > 100",
    run: () => DF.filter(r => r.amount > 100),
    cols: COLS,
  },
  {
    id: "multi-filter",
    label: `df[(df["status"]=="completed") & (df["amount"]>200)]`,
    desc: "Multiple conditions: use & for AND, | for OR — wrap each in ()",
    run: () => DF.filter(r => r.status === "completed" && r.amount > 200),
    cols: COLS,
  },
];

export default function DataFrameExplorerViz() {
  const [activeOp, setActiveOp] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const result = activeOp ? activeOp.run() : DF;
  const resultCols = activeOp ? activeOp.cols : COLS;
  const highlightRows = activeOp ? new Set(result.map(r => r.idx)) : null;

  const cellStyle = (isHeader, highlighted) => ({
    padding: "6px 10px",
    borderBottom: `1px solid ${DS.border}`,
    borderRight: `1px solid ${DS.border}`,
    ...MONO,
    color: isHeader ? DS.ind : (highlighted ? DS.t1 : DS.t3),
    background: isHeader ? "rgba(129,140,248,0.08)" : (highlighted ? "rgba(255,255,255,0.04)" : "transparent"),
    fontWeight: isHeader ? 700 : 400,
    fontSize: isHeader ? 11 : 12,
    textAlign: "right",
    whiteSpace: "nowrap",
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Pandas DataFrame explorer
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        Click an operation — see which rows and columns it returns (highlighted).
      </p>

      {/* Operation buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {OPERATIONS.map(op => {
          const active = activeOp?.id === op.id;
          return (
            <button key={op.id} type="button"
              onClick={() => setActiveOp(active ? null : op)}
              style={{
                background: active ? DS.indB : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? DS.ind : DS.border}`,
                borderRadius: 6, padding: "6px 12px",
                color: active ? "#fff" : DS.t2,
                ...MONO, cursor: "pointer", fontWeight: active ? 700 : 400,
              }}>
              {op.label}
            </button>
          );
        })}
        <button type="button"
          onClick={() => { setActiveOp(null); }}
          style={{ background: "transparent", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "6px 12px", color: DS.t3, ...MONO, cursor: "pointer" }}>
          reset
        </button>
      </div>

      {/* Description */}
      {activeOp && (
        <div style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2, marginBottom: 14, lineHeight: 1.6 }}>
          <span style={{ color: DS.ind, fontWeight: 700 }}>{activeOp.label}</span>
          <br />
          {activeOp.desc}
          <span style={{ color: DS.grn, marginLeft: 10 }}>→ {result.length} row{result.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* DataFrame table */}
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${DS.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <td style={{ ...cellStyle(true, false), color: DS.t3, fontWeight: 400, fontSize: 10 }}>idx</td>
              {resultCols.map(col => (
                <td key={col} style={cellStyle(true, false)}>{col}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {DF.map(row => {
              const included = !highlightRows || highlightRows.has(row.idx);
              return (
                <tr key={row.idx} style={{ opacity: included ? 1 : 0.25 }}>
                  <td style={{ ...cellStyle(false, included), color: DS.t3, fontSize: 11 }}>{row.idx}</td>
                  {resultCols.map(col => (
                    <td key={col} style={cellStyle(false, included)}>
                      {col === "amount"
                        ? `$${row[col].toFixed(2)}`
                        : row[col]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* loc vs iloc callout */}
      <div style={{ marginTop: 14, ...MONO, fontSize: 11, color: DS.t3, lineHeight: 1.6 }}>
        ◈ <strong style={{ color: DS.t2 }}>loc vs iloc:</strong> loc uses labels (end inclusive), iloc uses positions (end exclusive). Try both above to see the difference on rows 1-3.
      </div>
    </div>
  );
}
