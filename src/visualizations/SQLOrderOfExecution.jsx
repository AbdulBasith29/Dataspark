import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const STAGES = [
  {
    id: "from",
    clause: "FROM / JOIN",
    color: "#0EA5E9",
    description: "Identify source tables and compute the cartesian product, then apply JOIN conditions.",
    example: "FROM orders o\nJOIN customers c ON c.id = o.customer_id",
    note: "All rows exist here — no filters yet.",
  },
  {
    id: "where",
    clause: "WHERE",
    color: "#8B5CF6",
    description: "Filter individual rows. SELECT aliases do not exist yet — this is the most common interview trap.",
    example: "WHERE o.status = 'completed'\n  AND o.amount > 100",
    note: "Cannot reference SELECT aliases here.",
  },
  {
    id: "groupby",
    clause: "GROUP BY",
    color: "#F59E0B",
    description: "Collapse filtered rows into buckets. Each output row represents one bucket value.",
    example: "GROUP BY c.region, DATE_TRUNC('month', o.created_at)",
    note: "Output grain changes here — now one row per group.",
  },
  {
    id: "having",
    clause: "HAVING",
    color: "#EC4899",
    description: "Filter groups using aggregate expressions. This is WHERE for buckets — row columns may be ambiguous.",
    example: "HAVING SUM(o.amount) > 10000\n  AND COUNT(*) >= 5",
    note: "Use this for aggregate conditions, not row conditions.",
  },
  {
    id: "select",
    clause: "SELECT",
    color: "#10B981",
    description: "Compute output columns and assign aliases. Aliases created here are visible to ORDER BY in most dialects.",
    example: "SELECT\n  c.region,\n  SUM(o.amount) AS revenue,\n  COUNT(*) AS orders",
    note: "Aliases are born here — not earlier.",
  },
  {
    id: "orderby",
    clause: "ORDER BY / LIMIT",
    color: "#6366F1",
    description: "Sort the result and optionally limit rows. Most dialects allow SELECT aliases here.",
    example: "ORDER BY revenue DESC\nLIMIT 10",
    note: "Sorting and pagination happen last.",
  },
];

const QUIZ = [
  {
    q: "Which clause runs immediately after FROM/JOIN?",
    options: ["SELECT", "WHERE", "HAVING", "GROUP BY"],
    answer: 1,
    explanation: "WHERE filters individual rows right after the tables are joined — before any grouping or aggregation.",
  },
  {
    q: "You write: SELECT amount * 0.1 AS fee FROM orders WHERE fee > 5. What happens?",
    options: [
      "Works fine — SQL is smart enough",
      "Error: fee alias doesn't exist when WHERE runs",
      "fee defaults to 0 in WHERE",
      "Only works without AS",
    ],
    answer: 1,
    explanation: "WHERE executes before SELECT, so the alias 'fee' has not been created yet. Use a subquery/CTE to filter on derived expressions.",
  },
  {
    q: "Which clause should filter groups after aggregation?",
    options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"],
    answer: 2,
    explanation: "HAVING filters grouped buckets. WHERE can't reference aggregate functions like SUM() because grouping hasn't happened yet.",
  },
];

export default function SQLOrderOfExecution() {
  const [active, setActive] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  const activeStage = active !== null ? STAGES[active] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          SQL Logical Execution Order
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Click each clause to see what it does and when it runs. The order your eyes read SQL is not the order the engine evaluates it.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {STAGES.map((stage, i) => (
          <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setActive(active === i ? null : i)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: `1.5px solid ${active === i ? stage.color : `${stage.color}44`}`,
                background: active === i ? `${stage.color}22` : "rgba(255,255,255,0.03)",
                color: active === i ? stage.color : DS.t2,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--ds-mono), monospace",
                transition: "all 0.15s",
              }}
            >
              {i + 1}. {stage.clause}
            </button>
            {i < STAGES.length - 1 && (
              <span style={{ color: DS.dim, fontSize: 14, fontWeight: 700 }}>→</span>
            )}
          </div>
        ))}
      </div>

      {activeStage && (
        <div style={{
          padding: "16px 18px",
          borderRadius: 10,
          border: `1px solid ${activeStage.color}44`,
          background: `${activeStage.color}0d`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: activeStage.color }}>{activeStage.clause}</div>
          <p style={{ margin: 0, color: DS.t2, fontSize: 14, lineHeight: 1.65 }}>{activeStage.description}</p>
          <pre style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 12,
            lineHeight: 1.65,
            fontFamily: "var(--ds-mono), monospace",
            overflowX: "auto",
          }}>
            <code>{activeStage.example}</code>
          </pre>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 6,
            background: `${activeStage.color}14`,
            border: `1px solid ${activeStage.color}33`,
          }}>
            <span style={{ color: activeStage.color, fontSize: 11, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, whiteSpace: "nowrap" }}>NOTE</span>
            <span style={{ color: DS.t2, fontSize: 13 }}>{activeStage.note}</span>
          </div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 20 }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
          Quick drill — 3 questions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {QUIZ.map((q, qi) => (
            <div key={qi} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ color: DS.t1, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{q.q}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const revealed = quizRevealed[qi];
                  const isCorrect = oi === q.answer;
                  let borderColor = DS.border;
                  let bg = "rgba(255,255,255,0.02)";
                  if (selected && !revealed) { borderColor = "#0EA5E955"; bg = "#0EA5E912"; }
                  if (revealed && isCorrect) { borderColor = `${DS.grn}55`; bg = `${DS.grn}10`; }
                  if (revealed && selected && !isCorrect) { borderColor = "#F8717155"; bg = "#F8717110"; }
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => !revealed && setQuizAnswers((a) => ({ ...a, [qi]: oi }))}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: `1px solid ${borderColor}`,
                        background: bg,
                        color: DS.t2,
                        fontSize: 13,
                        cursor: revealed ? "default" : "pointer",
                        fontFamily: "var(--ds-sans), sans-serif",
                      }}
                    >
                      <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.dim, marginRight: 8 }}>{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {quizAnswers[qi] !== undefined && !quizRevealed[qi] && (
                <button
                  type="button"
                  onClick={() => setQuizRevealed((r) => ({ ...r, [qi]: true }))}
                  style={{ alignSelf: "flex-start", background: "transparent", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "5px 10px", color: DS.t3, fontSize: 11, cursor: "pointer", fontFamily: "var(--ds-mono), monospace" }}
                >
                  Check answer
                </button>
              )}
              {quizRevealed[qi] && (
                <div style={{ padding: "10px 12px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, color: DS.t2, fontSize: 13, lineHeight: 1.6 }}>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
