import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#0EA5E9";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#F87171";
const PURPLE = "#8B5CF6";

const SCENARIOS = [
  {
    id: "no_index",
    label: "No index",
    badge: "Full scan",
    badgeColor: RED,
    description: "No index on orders.customer_id or orders.created_at. The engine reads every row.",
    query: `SELECT customer_id, SUM(amount)
FROM orders
WHERE customer_id = 'C42'
  AND created_at >= '2024-01-01'
GROUP BY customer_id
ORDER BY SUM(amount) DESC
LIMIT 10;`,
    tree: [
      { id: "limit", label: "Limit", detail: "rows=10", cost: 0.28, color: PURPLE, children: ["sort"] },
      { id: "sort", label: "Sort", detail: "ORDER BY sum(amount) DESC", cost: 1.44, color: PURPLE, children: ["agg"] },
      { id: "agg", label: "HashAggregate", detail: "GROUP BY customer_id", cost: 8.62, color: ACCENT, children: ["filter"] },
      { id: "filter", label: "Filter", detail: "customer_id = 'C42' AND created_at >= …", cost: 12.10, color: AMBER, children: ["seqscan"] },
      { id: "seqscan", label: "Seq Scan", detail: "orders — reads ALL rows", cost: 45.00, color: RED, children: [] },
    ],
  },
  {
    id: "single_index",
    label: "Single index on customer_id",
    badge: "Index scan",
    badgeColor: GREEN,
    description: "Index on orders.customer_id eliminates most rows early. created_at still applied as a filter.",
    query: `-- CREATE INDEX idx_orders_cust ON orders(customer_id);

SELECT customer_id, SUM(amount)
FROM orders
WHERE customer_id = 'C42'
  AND created_at >= '2024-01-01'
GROUP BY customer_id
ORDER BY SUM(amount) DESC
LIMIT 10;`,
    tree: [
      { id: "limit", label: "Limit", detail: "rows=10", cost: 0.28, color: PURPLE, children: ["sort"] },
      { id: "sort", label: "Sort", detail: "ORDER BY sum(amount) DESC", cost: 0.62, color: PURPLE, children: ["agg"] },
      { id: "agg", label: "HashAggregate", detail: "GROUP BY customer_id", cost: 1.14, color: ACCENT, children: ["idxscan"] },
      { id: "idxscan", label: "Index Scan", detail: "idx_orders_cust → customer_id='C42'", cost: 2.80, color: GREEN, children: [] },
    ],
  },
  {
    id: "composite_index",
    label: "Composite index (customer_id, created_at)",
    badge: "Index-only",
    badgeColor: GREEN,
    description: "Composite index covers both predicates. The engine can satisfy the WHERE entirely from the index.",
    query: `-- CREATE INDEX idx_orders_cust_date
--   ON orders(customer_id, created_at);

SELECT customer_id, SUM(amount)
FROM orders
WHERE customer_id = 'C42'
  AND created_at >= '2024-01-01'
GROUP BY customer_id
ORDER BY SUM(amount) DESC
LIMIT 10;`,
    tree: [
      { id: "limit", label: "Limit", detail: "rows=10", cost: 0.28, color: PURPLE, children: ["sort"] },
      { id: "sort", label: "Sort", detail: "ORDER BY sum(amount) DESC", cost: 0.40, color: PURPLE, children: ["agg"] },
      { id: "agg", label: "HashAggregate", detail: "GROUP BY customer_id", cost: 0.72, color: ACCENT, children: ["hashjoin"] },
      { id: "hashjoin", label: "Index Only Scan", detail: "idx_orders_cust_date (both predicates hit)", cost: 0.88, color: GREEN, children: [] },
    ],
  },
];

const DRILL_QUESTIONS = [
  {
    id: "q1",
    question: "A query plan shows Seq Scan with cost=12500. Which single change is most likely to reduce that cost?",
    choices: [
      { id: "a", label: "Add ORDER BY to the query", correct: false },
      { id: "b", label: "Create an index on the WHERE predicate column", correct: true },
      { id: "c", label: "Add LIMIT 1000 after the query", correct: false },
      { id: "d", label: "Move the WHERE clause to HAVING", correct: false },
    ],
    explanation: "A Seq Scan reads every row. An index on the filter column lets the engine jump directly to matching rows, turning Seq Scan into Index Scan and dropping cost dramatically.",
  },
  {
    id: "q2",
    question: "You see a Hash Join node with a large inner build cost. What is a Hash Join doing?",
    choices: [
      { id: "a", label: "Scanning an index for exact-match lookups", correct: false },
      { id: "b", label: "Building a hash table from one input and probing it with the other", correct: true },
      { id: "c", label: "Sorting both inputs before merging", correct: false },
      { id: "d", label: "Fetching rows one at a time via a nested loop", correct: false },
    ],
    explanation: "Hash Join loads one relation into a hash table (build phase) then streams the other relation through (probe phase). It scales well when the smaller side fits in memory.",
  },
];

function CostBar({ cost, maxCost }) {
  const pct = Math.min((cost / maxCost) * 100, 100);
  const color = pct > 70 ? RED : pct > 30 ? AMBER : GREEN;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontFamily: "var(--ds-mono), monospace", minWidth: 38, textAlign: "right" }}>{cost.toFixed(2)}</span>
    </div>
  );
}

function PlanNode({ node, maxCost, depth = 0 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingLeft: depth * 20 }}>
      {depth > 0 && (
        <div style={{ width: 2, height: 12, background: `${node.color}44`, marginLeft: 10, marginBottom: 0 }} />
      )}
      <div style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: `1.5px solid ${node.color}44`,
        background: `${node.color}10`,
        marginBottom: 4,
        minWidth: 260,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: node.color, fontFamily: "var(--ds-mono), monospace" }}>{node.label}</span>
          <span style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>cost</span>
        </div>
        <div style={{ fontSize: 11, color: DS.t3, marginBottom: 6, lineHeight: 1.4 }}>{node.detail}</div>
        <CostBar cost={node.cost} maxCost={maxCost} />
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ width: 2, height: 8, background: `${node.color}44`, marginLeft: 10 }} />
      )}
    </div>
  );
}

export default function SQLExplainPlanViz() {
  const [activeId, setActiveId] = useState("no_index");
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillRevealed, setDrillRevealed] = useState({});

  const scenario = SCENARIOS.find((s) => s.id === activeId);
  const maxCost = Math.max(...scenario.tree.map((n) => n.cost));

  function handleDrillPick(qid, cid) {
    if (drillRevealed[qid]) return;
    setDrillAnswers((prev) => ({ ...prev, [qid]: cid }));
  }
  function handleReveal(qid) {
    if (!drillAnswers[qid]) return;
    setDrillRevealed((prev) => ({ ...prev, [qid]: true }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Query Optimization & EXPLAIN Plans
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Pick an index configuration and watch the query plan tree update. Each node shows its estimated cost — higher cost nodes are where the engine spends time.
        </p>
      </div>

      {/* Scenario selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Index configuration</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              style={{
                textAlign: "left",
                padding: "10px 16px",
                borderRadius: 8,
                border: `1.5px solid ${activeId === s.id ? s.badgeColor : `${s.badgeColor}33`}`,
                background: activeId === s.id ? `${s.badgeColor}14` : "rgba(255,255,255,0.02)",
                color: activeId === s.id ? DS.t1 : DS.t2,
                cursor: "pointer",
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</span>
                <span style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: `${s.badgeColor}22`,
                  border: `1px solid ${s.badgeColor}44`,
                  color: s.badgeColor,
                  fontFamily: "var(--ds-mono), monospace",
                  fontWeight: 700,
                }}>
                  {s.badge}
                </span>
              </div>
              <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.4 }}>{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Plan + SQL split */}
      <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Plan tree */}
        <div>
          <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            EXPLAIN plan tree (top = output, bottom = data source)
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {scenario.tree.map((node, depth) => (
              <PlanNode key={node.id} node={node} maxCost={maxCost} depth={depth} />
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { color: GREEN, label: "Low cost" },
              { color: AMBER, label: "Medium cost" },
              { color: RED, label: "High cost" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 11, color: DS.t3 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Query + cost summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>SQL</div>
            <pre style={{
              margin: 0,
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: "rgba(2,6,23,0.72)",
              color: DS.t1,
              fontSize: 12,
              lineHeight: 1.7,
              fontFamily: "var(--ds-mono), monospace",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}>
              <code>{scenario.query}</code>
            </pre>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Node cost summary</div>
            {scenario.tree.map((node) => (
              <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 90, fontSize: 11, fontWeight: 700, color: node.color, fontFamily: "var(--ds-mono), monospace", flexShrink: 0 }}>{node.label}</div>
                <div style={{ flex: 1 }}>
                  <CostBar cost={node.cost} maxCost={maxCost} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>Total estimated cost</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: scenario.badgeColor, fontFamily: "var(--ds-mono), monospace" }}>
                {scenario.tree.reduce((s, n) => s + n.cost, 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ padding: "10px 12px", borderRadius: 6, background: `${scenario.badgeColor}0d`, border: `1px solid ${scenario.badgeColor}33` }}>
            <span style={{ fontSize: 10, color: scenario.badgeColor, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{scenario.badge.toUpperCase()} · </span>
            <span style={{ color: DS.t2, fontSize: 12, lineHeight: 1.55 }}>{scenario.description}</span>
          </div>

          <div style={{ padding: "10px 12px", borderRadius: 6, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Key nodes to know</div>
            {[
              { node: "Seq Scan", meaning: "Reads every row — no index used. Cost scales with table size.", color: RED },
              { node: "Index Scan", meaning: "Follows B-tree to matching rows. Cost scales with selectivity.", color: GREEN },
              { node: "Hash Join", meaning: "Builds hash table on smaller input, probes with larger input.", color: ACCENT },
              { node: "Sort", meaning: "Materializes and sorts rows for ORDER BY or Merge Join.", color: PURPLE },
            ].map(({ node, meaning, color }) => (
              <div key={node} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace" }}>{node}: </span>
                <span style={{ fontSize: 11, color: DS.t3 }}>{meaning}</span>
              </div>
            ))}
          </div>
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
                    else if (picked === c.id && !c.correct) { border = `1.5px solid ${RED}`; bg = `${RED}14`; color = RED; }
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
