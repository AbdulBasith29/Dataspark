import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const VALS = ["TRUE", "FALSE", "NULL"];
const COLOR = { TRUE: "#10B981", FALSE: "#F87171", NULL: "#F59E0B", UNKNOWN: "#F59E0B" };

function triAnd(a, b) {
  if (a === "FALSE" || b === "FALSE") return "FALSE";
  if (a === "NULL" || b === "NULL") return "NULL";
  return "TRUE";
}

function triOr(a, b) {
  if (a === "TRUE" || b === "TRUE") return "TRUE";
  if (a === "NULL" || b === "NULL") return "NULL";
  return "FALSE";
}

function triNot(a) {
  if (a === "TRUE") return "FALSE";
  if (a === "FALSE") return "TRUE";
  return "NULL";
}

const NULL_TRAPS = [
  {
    title: "NOT IN with a NULL in the list",
    code: "SELECT * FROM customers\nWHERE id NOT IN (1, 2, NULL);",
    explanation: "Every comparison 'id NOT IN (1, 2, NULL)' evaluates (id <> 1) AND (id <> 2) AND (id <> NULL). Since id <> NULL is UNKNOWN, the whole AND is UNKNOWN. WHERE drops UNKNOWN rows — result is empty.",
    fix: "Use NOT EXISTS with a correlated subquery to safely handle nullable keys.",
  },
  {
    title: "CASE without ELSE",
    code: "CASE\n  WHEN plan = 'pro' THEN 1\n  WHEN plan = 'team' THEN 1\nEND AS paid_flag",
    explanation: "Any row where plan is neither 'pro' nor 'team' — including NULL plan — falls through all WHEN branches. Without ELSE, SQL returns NULL for these rows.",
    fix: "Add ELSE 0 to make the fallback explicit and aggregation-safe.",
  },
  {
    title: "Equality check on NULL",
    code: "WHERE cancelled_at = NULL  -- always UNKNOWN\nWHERE cancelled_at IS NULL -- correct",
    explanation: "NULL = NULL evaluates to UNKNOWN, not TRUE. You cannot use = to test for NULL. IS NULL / IS NOT NULL are the correct predicates.",
    fix: "Always use IS NULL or IS NOT NULL, never = NULL.",
  },
];

function ValButton({ val, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: `1.5px solid ${selected ? COLOR[val] : `${COLOR[val]}44`}`,
        background: selected ? `${COLOR[val]}22` : "rgba(255,255,255,0.03)",
        color: selected ? COLOR[val] : DS.t3,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "var(--ds-mono), monospace",
      }}
    >
      {val}
    </button>
  );
}

function ResultPill({ val }) {
  const label = val === "NULL" ? "UNKNOWN / NULL" : val;
  return (
    <span style={{
      padding: "4px 12px",
      borderRadius: 999,
      background: `${COLOR[val]}22`,
      border: `1px solid ${COLOR[val]}55`,
      color: COLOR[val],
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "var(--ds-mono), monospace",
    }}>
      {label}
    </span>
  );
}

export default function SQLNullLogic() {
  const [left, setLeft] = useState("TRUE");
  const [right, setRight] = useState("NULL");
  const [activeTrap, setActiveTrap] = useState(null);

  const andResult = triAnd(left, right);
  const orResult = triOr(left, right);
  const notLeft = triNot(left);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Three-Valued Logic Playground
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          SQL predicates evaluate to TRUE, FALSE, or UNKNOWN (NULL). WHERE only keeps TRUE rows.
          Toggle the operand values and observe how NULL propagates.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>LEFT OPERAND (A)</div>
          <div style={{ display: "flex", gap: 6 }}>
            {VALS.map((v) => <ValButton key={v} val={v} selected={left === v} onClick={() => setLeft(v)} />)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>RIGHT OPERAND (B)</div>
          <div style={{ display: "flex", gap: 6 }}>
            {VALS.map((v) => <ValButton key={v} val={v} selected={right === v} onClick={() => setRight(v)} />)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "A AND B", result: andResult },
          { label: "A OR B", result: orResult },
          { label: "NOT A", result: notLeft },
        ].map(({ label, result }) => (
          <div key={label} style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: `1px solid ${COLOR[result]}33`,
            background: `${COLOR[result]}0d`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>{label}</div>
            <ResultPill val={result} />
            {result === "NULL" && (
              <div style={{ fontSize: 11, color: "#F59E0B", lineHeight: 1.5 }}>
                WHERE drops this row — UNKNOWN ≠ TRUE
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 20 }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          Common NULL Traps
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NULL_TRAPS.map((trap, i) => (
            <div key={i} style={{ borderRadius: 8, border: `1px solid ${activeTrap === i ? "#F59E0B55" : DS.border}`, overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setActiveTrap(activeTrap === i ? null : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  background: activeTrap === i ? "#F59E0B0d" : "rgba(255,255,255,0.02)",
                  border: "none",
                  color: activeTrap === i ? "#F59E0B" : DS.t2,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--ds-sans), sans-serif",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {trap.title}
                <span style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace" }}>{activeTrap === i ? "▲" : "▼"}</span>
              </button>
              {activeTrap === i && (
                <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <pre style={{
                    margin: 0,
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: `1px solid ${DS.border}`,
                    background: "rgba(2,6,23,0.72)",
                    color: DS.t1,
                    fontSize: 12,
                    lineHeight: 1.65,
                    fontFamily: "var(--ds-mono), monospace",
                    overflowX: "auto",
                  }}>
                    <code>{trap.code}</code>
                  </pre>
                  <p style={{ margin: 0, color: DS.t2, fontSize: 13, lineHeight: 1.65 }}>{trap.explanation}</p>
                  <div style={{ padding: "8px 12px", borderRadius: 6, background: `${DS.grn}0d`, border: `1px solid ${DS.grn}33`, color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>
                    <strong style={{ color: DS.grn }}>Fix: </strong>{trap.fix}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
