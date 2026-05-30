import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#8B5CF6";
const GREEN = "#10B981";
const BLUE = "#0EA5E9";
const AMBER = "#F59E0B";

const FACT_ROWS = [
  { month: "Jan", product: "Widget", revenue: 1200 },
  { month: "Jan", product: "Gadget", revenue: 800 },
  { month: "Jan", product: "Donut", revenue: 300 },
  { month: "Feb", product: "Widget", revenue: 1500 },
  { month: "Feb", product: "Gadget", revenue: 950 },
  { month: "Feb", product: "Donut", revenue: 420 },
  { month: "Mar", product: "Widget", revenue: 1100 },
  { month: "Mar", product: "Gadget", revenue: 870 },
  { month: "Mar", product: "Donut", revenue: 510 },
];

const PRODUCTS = ["Widget", "Gadget", "Donut"];
const MONTHS = ["Jan", "Feb", "Mar"];

function buildWide() {
  return MONTHS.map((m) => {
    const row = { month: m };
    PRODUCTS.forEach((p) => {
      const found = FACT_ROWS.find((r) => r.month === m && r.product === p);
      row[p] = found ? found.revenue : 0;
    });
    return row;
  });
}

const WIDE_ROWS = buildWide();

const CASE_SQL = `SELECT
  month,
  SUM(CASE WHEN product = 'Widget' THEN revenue ELSE 0 END) AS Widget,
  SUM(CASE WHEN product = 'Gadget' THEN revenue ELSE 0 END) AS Gadget,
  SUM(CASE WHEN product = 'Donut'  THEN revenue ELSE 0 END) AS Donut
FROM sales
GROUP BY month
ORDER BY month;`;

const PIVOT_SQL = `-- SQL Server / Azure Synapse syntax
SELECT month, [Widget], [Gadget], [Donut]
FROM sales
PIVOT (
  SUM(revenue)
  FOR product IN ([Widget], [Gadget], [Donut])
) AS pvt
ORDER BY month;

-- BigQuery syntax
SELECT *
FROM sales
PIVOT (SUM(revenue) FOR product IN ('Widget','Gadget','Donut'));`;

const DRILL_QUESTIONS = [
  {
    id: "q1",
    question: "Which approach works in every major SQL dialect (PostgreSQL, MySQL, SQLite, Snowflake, BigQuery)?",
    choices: [
      { id: "a", label: "PIVOT keyword syntax", correct: false },
      { id: "b", label: "SUM(CASE WHEN ...) conditional aggregation", correct: true },
      { id: "c", label: "CROSSTAB() function", correct: false },
      { id: "d", label: "UNPIVOT keyword syntax", correct: false },
    ],
    explanation: "Conditional aggregation with CASE is standard SQL and runs everywhere. PIVOT is dialect-specific (SQL Server, BigQuery, Snowflake have it; PostgreSQL does not).",
  },
  {
    id: "q2",
    question: "You need to pivot a column with 200 distinct values that change weekly. Which approach is most practical?",
    choices: [
      { id: "a", label: "Hard-code all 200 values in PIVOT ... IN(...)", correct: false },
      { id: "b", label: "Dynamic SQL that builds the CASE list at runtime", correct: true },
      { id: "c", label: "Add an index to the product column", correct: false },
      { id: "d", label: "Use a VIEW with 200 CASE columns", correct: false },
    ],
    explanation: "Both PIVOT and CASE require static column lists. When values are dynamic, you need dynamic SQL (or a reporting layer like Looker/Power BI) to generate the expressions at runtime.",
  },
];

export default function SQLPivotViz() {
  const [tab, setTab] = useState("case");
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillRevealed, setDrillRevealed] = useState({});

  function handleDrillPick(qid, cid) {
    if (drillRevealed[qid]) return;
    setDrillAnswers((prev) => ({ ...prev, [qid]: cid }));
  }

  function handleReveal(qid) {
    if (!drillAnswers[qid]) return;
    setDrillRevealed((prev) => ({ ...prev, [qid]: true }));
  }

  const PRODUCT_COLOR = { Widget: BLUE, Gadget: GREEN, Donut: AMBER };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          PIVOT, UNPIVOT & Conditional Aggregation
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Start with a narrow fact table (month, product, revenue) and build the wide pivot result two ways: portable CASE-based aggregation and dialect-specific PIVOT syntax.
        </p>
      </div>

      {/* Source fact table */}
      <div>
        <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Source: sales (narrow fact table)
        </div>
        <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${DS.border}`, background: "rgba(2,6,23,0.5)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["month", "product", "revenue"].map((col) => (
                  <th key={col} style={{
                    padding: "8px 14px",
                    textAlign: "left",
                    color: DS.dim,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${DS.border}`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACT_ROWS.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                  <td style={{ padding: "6px 14px", color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>{row.month}</td>
                  <td style={{ padding: "6px 14px", fontWeight: 700, color: PRODUCT_COLOR[row.product], fontFamily: "var(--ds-mono), monospace" }}>{row.product}</td>
                  <td style={{ padding: "6px 14px", color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          9 rows · 3 months x 3 products
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "case", label: "Conditional Aggregation (CASE)" },
          { id: "pivot", label: "PIVOT Syntax" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: `1.5px solid ${tab === t.id ? ACCENT : `${ACCENT}44`}`,
              background: tab === t.id ? `${ACCENT}1a` : "rgba(255,255,255,0.02)",
              color: tab === t.id ? ACCENT : DS.t3,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>SQL</div>
          <pre style={{
            margin: 0,
            padding: "14px 16px",
            borderRadius: 8,
            border: `1px solid ${tab === "case" ? `${ACCENT}44` : `${BLUE}44`}`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 12,
            lineHeight: 1.75,
            fontFamily: "var(--ds-mono), monospace",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}>
            <code>{tab === "case" ? CASE_SQL : PIVOT_SQL}</code>
          </pre>

          {tab === "case" && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 6, background: `${GREEN}0d`, border: `1px solid ${GREEN}33` }}>
              <span style={{ fontSize: 10, color: GREEN, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>PORTABLE · </span>
              <span style={{ color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>Works in any SQL dialect. The CASE expression returns revenue for the matching product and 0 otherwise; SUM collapses it per month.</span>
            </div>
          )}
          {tab === "pivot" && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 6, background: `${AMBER}0d`, border: `1px solid ${AMBER}33` }}>
              <span style={{ fontSize: 10, color: AMBER, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>DIALECT-SPECIFIC · </span>
              <span style={{ color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>PIVOT is supported in SQL Server, Azure Synapse, BigQuery, Snowflake. PostgreSQL, MySQL, and SQLite do not have native PIVOT — use CASE there.</span>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>RESULT (wide table)</div>
          <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${DS.border}`, background: "rgba(2,6,23,0.5)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["month", ...PRODUCTS].map((col) => (
                    <th key={col} style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: PRODUCTS.includes(col) ? PRODUCT_COLOR[col] : DS.dim,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      borderBottom: `1px solid ${DS.border}`,
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WIDE_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                    <td style={{ padding: "7px 12px", color: DS.t2, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{row.month}</td>
                    {PRODUCTS.map((p) => (
                      <td key={p} style={{ padding: "7px 12px", color: PRODUCT_COLOR[p], fontFamily: "var(--ds-mono), monospace" }}>{row[p]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: DS.t3, lineHeight: 1.5 }}>
            3 rows · one column per product · same result from both approaches
          </div>

          {tab === "case" && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}` }}>
              <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>HOW EACH CELL IS BUILT</div>
              <div style={{ fontSize: 12, color: DS.t3, lineHeight: 1.6 }}>
                For Widget / Jan: SUM picks up 1200 (product=Widget) and 0+0 for the other rows in Jan's group.
                The CASE acts as a per-row selector; SUM collapses the group.
              </div>
            </div>
          )}
          {tab === "pivot" && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}` }}>
              <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>STATIC vs DYNAMIC PIVOT</div>
              <div style={{ fontSize: 12, color: DS.t3, lineHeight: 1.6 }}>
                Both PIVOT and CASE require you to list column values statically. For dynamic value sets, generate the column list with dynamic SQL or push pivoting to a BI layer.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portability summary */}
      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Portability at a glance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {[
            { approach: "SUM(CASE WHEN ...)", portability: "Universal", color: GREEN, note: "PostgreSQL, MySQL, SQLite, Snowflake, BigQuery, SQL Server" },
            { approach: "PIVOT keyword", portability: "Dialect-specific", color: AMBER, note: "SQL Server, Azure Synapse, BigQuery, Snowflake (not Postgres/MySQL)" },
            { approach: "CROSSTAB()", portability: "PostgreSQL only", color: "#F87171", note: "Requires tablefunc extension; not portable at all" },
            { approach: "Dynamic SQL", portability: "Engine-specific", color: AMBER, note: "EXECUTE/sp_executesql for runtime column lists when values vary" },
          ].map(({ approach, portability, color, note }) => (
            <div key={approach} style={{ padding: "10px 12px", borderRadius: 6, border: `1px solid ${color}22`, background: `${color}08` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>{approach}</div>
              <div style={{ fontSize: 10, color: DS.dim, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>{portability.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.4 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Drill */}
      <div style={{ padding: "16px 18px", borderRadius: 10, border: `1px solid ${ACCENT}33`, background: `${ACCENT}08` }}>
        <div style={{ fontSize: 11, color: ACCENT, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Quick Drill</div>
        {DRILL_QUESTIONS.map((q) => {
          const picked = drillAnswers[q.id];
          const revealed = drillRevealed[q.id];
          return (
            <div key={q.id} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: DS.t1, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.choices.map((c) => {
                  let border = `1.5px solid ${DS.border}`;
                  let bg = "rgba(255,255,255,0.02)";
                  let color = DS.t2;
                  if (picked === c.id && !revealed) { border = `1.5px solid ${ACCENT}`; bg = `${ACCENT}14`; color = ACCENT; }
                  if (revealed) {
                    if (c.correct) { border = `1.5px solid ${GREEN}`; bg = `${GREEN}14`; color = GREEN; }
                    else if (picked === c.id && !c.correct) { border = `1.5px solid #F87171`; bg = "#F8717114"; color = "#F87171"; }
                  }
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleDrillPick(q.id, c.id)}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border,
                        background: bg,
                        color,
                        fontSize: 12,
                        cursor: revealed ? "default" : "pointer",
                        fontFamily: "var(--ds-sans), sans-serif",
                      }}
                    >
                      <strong>{c.id.toUpperCase()}.</strong> {c.label}
                    </button>
                  );
                })}
              </div>
              {picked && !revealed && (
                <button
                  type="button"
                  onClick={() => handleReveal(q.id)}
                  style={{ marginTop: 8, padding: "6px 14px", borderRadius: 6, border: `1px solid ${ACCENT}44`, background: `${ACCENT}14`, color: ACCENT, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--ds-sans), sans-serif" }}
                >
                  Check answer
                </button>
              )}
              {revealed && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, background: `${GREEN}0d`, border: `1px solid ${GREEN}33`, color: DS.t2, fontSize: 12, lineHeight: 1.55 }}>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
