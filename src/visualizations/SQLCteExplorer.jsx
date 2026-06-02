import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#34D399";
const IND = "#818CF8";
const AMB = "#F59E0B";
const RED = "#F87171";
const CYAN = "#0EA5E9";

// ── Non-recursive CTE chain ──────────────────────────────────────────────────

const CTE_STEPS = [
  {
    id: "raw_orders",
    label: "raw_orders",
    color: CYAN,
    description: "Reads all orders from the source table. No transformation yet — just alias the table into the CTE chain.",
    sql: `raw_orders AS (
  SELECT
    order_date,
    customer_id,
    amount
  FROM orders
  WHERE order_date >= '2025-01-01'
)`,
    sampleRows: [
      { order_date: "2025-01-06", customer_id: "C12", amount: 340 },
      { order_date: "2025-01-06", customer_id: "C07", amount: 190 },
      { order_date: "2025-01-07", customer_id: "C12", amount: 80 },
      { order_date: "2025-01-07", customer_id: "C19", amount: 620 },
      { order_date: "2025-01-08", customer_id: "C07", amount: 440 },
    ],
    cols: ["order_date", "customer_id", "amount"],
  },
  {
    id: "daily_totals",
    label: "daily_totals",
    color: IND,
    description: "Aggregates raw_orders by date. Produces one row per day with total revenue and order count.",
    sql: `daily_totals AS (
  SELECT
    order_date,
    SUM(amount)     AS daily_rev,
    COUNT(*)        AS order_cnt
  FROM raw_orders
  GROUP BY order_date
)`,
    sampleRows: [
      { order_date: "2025-01-06", daily_rev: 530, order_cnt: 2 },
      { order_date: "2025-01-07", daily_rev: 700, order_cnt: 2 },
      { order_date: "2025-01-08", daily_rev: 440, order_cnt: 1 },
    ],
    cols: ["order_date", "daily_rev", "order_cnt"],
  },
  {
    id: "flagged_days",
    label: "flagged_days",
    color: AMB,
    description: "Joins daily_totals with a 7-day moving average to flag days where revenue dipped below 70% of the rolling baseline.",
    sql: `flagged_days AS (
  SELECT
    order_date,
    daily_rev,
    AVG(daily_rev) OVER (
      ORDER BY order_date
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS ma7,
    CASE
      WHEN daily_rev < AVG(daily_rev) OVER (
             ORDER BY order_date
             ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
           ) * 0.70 THEN 'LOW'
      ELSE 'OK'
    END AS status
  FROM daily_totals
)`,
    sampleRows: [
      { order_date: "2025-01-06", daily_rev: 530, ma7: 530, status: "OK" },
      { order_date: "2025-01-07", daily_rev: 700, ma7: 615, status: "OK" },
      { order_date: "2025-01-08", daily_rev: 440, ma7: 557, status: "LOW" },
    ],
    cols: ["order_date", "daily_rev", "ma7", "status"],
  },
];

// ── Recursive CTE ────────────────────────────────────────────────────────────

const ORG_TREE = [
  { id: 1, name: "Alice (CEO)",    manager_id: null,  depth: 0 },
  { id: 2, name: "Bob (VP Eng)",   manager_id: 1,     depth: 1 },
  { id: 3, name: "Carol (VP Mkt)", manager_id: 1,     depth: 1 },
  { id: 4, name: "Dan (SWE)",      manager_id: 2,     depth: 2 },
  { id: 5, name: "Eve (SWE)",      manager_id: 2,     depth: 2 },
  { id: 6, name: "Frank (Mgr)",    manager_id: 3,     depth: 2 },
  { id: 7, name: "Grace (Analyst)",manager_id: 6,     depth: 3 },
];

const RECURSIVE_SQL = `WITH RECURSIVE org_tree AS (
  -- Base case: start from the root employee
  SELECT id, name, manager_id, 0 AS depth
  FROM employees
  WHERE manager_id IS NULL        -- ← root node

  UNION ALL

  -- Recursive step: join each node to its parent
  SELECT e.id, e.name, e.manager_id, t.depth + 1
  FROM employees e
  JOIN org_tree t ON e.manager_id = t.id
)
SELECT * FROM org_tree
ORDER BY depth, id;`;

const NON_RECURSIVE_SQL = `WITH raw_orders AS (
  SELECT order_date, customer_id, amount
  FROM orders
  WHERE order_date >= '2025-01-01'
),
daily_totals AS (
  SELECT order_date,
         SUM(amount) AS daily_rev,
         COUNT(*)    AS order_cnt
  FROM raw_orders
  GROUP BY order_date
),
flagged_days AS (
  SELECT order_date, daily_rev,
         CASE
           WHEN daily_rev < AVG(daily_rev) OVER (
                  ORDER BY order_date
                  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
                ) * 0.70 THEN 'LOW'
           ELSE 'OK'
         END AS status
  FROM daily_totals
)
SELECT * FROM flagged_days
WHERE status = 'LOW';`;

// ── Drill ────────────────────────────────────────────────────────────────────

const DRILL = [
  {
    q: "In a recursive CTE, the UNION ALL connects the base case to the recursive step. Why must the recursive step reference the CTE name itself?",
    opts: [
      "To trigger the recursion — each iteration feeds its output back as the input for the next join",
      "Because UNION ALL requires two identically named sources",
      "To prevent the optimizer from rewriting it as a JOIN",
    ],
    correct: 0,
    exp: "The recursive step JOIN org_tree t makes the engine re-execute using the previous iteration's result set. This continues until no new rows are added — the termination condition.",
  },
  {
    q: "A CTE defined earlier in the WITH clause can be referenced by CTEs defined later in the same WITH clause. True or false?",
    opts: [
      "True — CTEs are materialized in order and available to subsequent CTEs",
      "False — each CTE is evaluated independently and cannot reference siblings",
      "True only in PostgreSQL, not in standard SQL",
    ],
    correct: 0,
    exp: "Standard SQL (and all major engines: Postgres, BigQuery, Snowflake, etc.) allow later CTEs to reference earlier ones in the same WITH clause. This is the basis for building step-by-step transformation chains.",
  },
  {
    q: "What happens if a recursive CTE's recursive step never produces an empty result set?",
    opts: [
      "The query returns a partial result after 1000 rows",
      "Infinite recursion — the engine will eventually hit a max-recursion limit and error",
      "The base case automatically terminates the loop after one pass",
    ],
    correct: 1,
    exp: "Missing or incorrect termination logic causes infinite recursion. Engines enforce a recursion depth limit (e.g., 100 in SQL Server) and raise an error. Always ensure the recursive step eventually produces no new rows.",
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

const DEPTH_INDENT = [0, 20, 40, 60];
const DEPTH_COLOR = [ACCENT, IND, AMB, RED];

export default function SQLCteExplorer() {
  const [tab, setTab] = useState("chain");
  const [activeStep, setActiveStep] = useState(0);
  const [drill, setDrill] = useState(Array(DRILL.length).fill(null));
  const [revealed, setRevealed] = useState(Array(DRILL.length).fill(false));

  const step = CTE_STEPS[activeStep];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          CTE Explorer
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          CTEs let you name and reuse intermediate result sets within a single query. Explore a 3-step transformation chain, then compare non-recursive vs recursive CTEs.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { id: "chain", label: "CTE Chain" },
          { id: "recursive", label: "Recursive CTE" },
        ].map((t) => (
          <OptionButton key={t.id} label={t.label} selected={tab === t.id} color={ACCENT} onClick={() => setTab(t.id)} />
        ))}
      </div>

      {tab === "chain" && (
        <>
          {/* Step selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>CLICK A CTE STEP</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {CTE_STEPS.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <OptionButton label={s.label} selected={activeStep === i} color={s.color} onClick={() => setActiveStep(i)} />
                  {i < CTE_STEPS.length - 1 && (
                    <span style={{ color: DS.dim, fontSize: 14 }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step detail */}
          <div style={{ padding: "16px", borderRadius: 10, border: `1px solid ${step.color}33`, background: `${step.color}06` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: step.color, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
              {step.label}
            </div>
            <p style={{ margin: "0 0 12px", color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>{step.description}</p>
            <pre style={{
              margin: "0 0 14px",
              padding: "10px 12px",
              borderRadius: 6,
              border: `1px solid ${step.color}22`,
              background: "rgba(2,6,23,0.72)",
              color: DS.t1,
              fontSize: 12,
              lineHeight: 1.7,
              fontFamily: "var(--ds-mono), monospace",
              overflowX: "auto",
            }}>
              <code>{step.sql}</code>
            </pre>

            {/* Sample output */}
            <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
              SAMPLE OUTPUT (first {step.sampleRows.length} rows)
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {step.cols.map((col) => (
                      <th key={col} style={{
                        padding: "6px 10px",
                        textAlign: "left",
                        color: DS.dim,
                        fontFamily: "var(--ds-mono), monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${DS.border}`,
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.sampleRows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                      {step.cols.map((col) => (
                        <td key={col} style={{
                          padding: "6px 10px",
                          color: col === "status" && row[col] === "LOW" ? RED : DS.t2,
                          fontFamily: "var(--ds-mono), monospace",
                          fontWeight: col === "status" ? 700 : 400,
                        }}>
                          {row[col] !== null && row[col] !== undefined
                            ? typeof row[col] === "number" && col !== "order_cnt" && col !== "depth"
                              ? col === "ma7"
                                ? row[col].toFixed(0)
                                : `$${row[col].toLocaleString()}`
                              : String(row[col])
                            : "NULL"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full SQL view */}
          <div style={{ borderRadius: 8, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${DS.border}`, fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>
              FULL QUERY (WITH ... SELECT)
            </div>
            <pre style={{
              margin: 0,
              padding: "12px 14px",
              background: "rgba(2,6,23,0.72)",
              color: DS.t1,
              fontSize: 11,
              lineHeight: 1.7,
              fontFamily: "var(--ds-mono), monospace",
              overflowX: "auto",
            }}>
              <code>{NON_RECURSIVE_SQL}</code>
            </pre>
          </div>
        </>
      )}

      {tab === "recursive" && (
        <>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: `${AMB}0d`, border: `1px solid ${AMB}33`, color: AMB, fontSize: 12, lineHeight: 1.6 }}>
            <strong>Recursive CTEs</strong> use <code style={{ fontFamily: "var(--ds-mono), monospace" }}>UNION ALL</code> to join a base case (anchor) with a recursive step that references the CTE itself. They stop when the recursive step returns zero rows.
          </div>

          <pre style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: 8,
            border: `1px solid ${IND}33`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 12,
            lineHeight: 1.7,
            fontFamily: "var(--ds-mono), monospace",
            overflowX: "auto",
          }}>
            <code>{RECURSIVE_SQL}</code>
          </pre>

          {/* Org tree */}
          <div>
            <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>
              RESULT — org_tree hierarchy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {ORG_TREE.map((node) => (
                <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: DEPTH_INDENT[node.depth] || 0 }}>
                  <span style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", width: 20 }}>
                    {node.depth > 0 ? "└─" : ""}
                  </span>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: `1px solid ${DEPTH_COLOR[node.depth] || DS.border}44`,
                    background: `${DEPTH_COLOR[node.depth] || DS.border}0a`,
                    fontSize: 12,
                    color: DEPTH_COLOR[node.depth] || DS.t2,
                    fontFamily: "var(--ds-mono), monospace",
                    fontWeight: 600,
                  }}>
                    {node.name}
                  </div>
                  <span style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
                    depth={node.depth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Non-recursive CTE", color: ACCENT, notes: ["Named intermediate results", "Referenced by later CTEs or final SELECT", "No self-reference", "May or may not be materialized (engine decides)"] },
              { label: "Recursive CTE", color: IND, notes: ["Base case (anchor) UNION ALL recursive step", "Recursive step references the CTE itself", "Terminates when recursive step returns 0 rows", "Requires WITH RECURSIVE keyword (Postgres, SQLite)"] },
            ].map(({ label, color, notes }) => (
              <div key={label} style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${color}33`, background: `${color}06` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>{label}</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                  {notes.map((n) => (
                    <li key={n} style={{ fontSize: 12, color: DS.t3, lineHeight: 1.5 }}>{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

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
                  const borderC = show && correct ? ACCENT : show && chosen && !correct ? RED : chosen ? IND : DS.border;
                  const bg = show && correct ? `${ACCENT}18` : show && chosen && !correct ? `${RED}18` : chosen ? `${IND}14` : "transparent";
                  const textC = show && correct ? ACCENT : show && chosen && !correct ? RED : chosen ? IND : DS.t3;
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
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, background: `${ACCENT}0d`, border: `1px solid ${ACCENT}33`, color: DS.t2, fontSize: 12, lineHeight: 1.55 }}>
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
