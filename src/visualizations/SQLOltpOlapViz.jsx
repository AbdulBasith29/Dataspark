import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const OLTP_COLOR = "#0EA5E9";
const OLAP_COLOR = "#8B5CF6";

const SCENARIOS = {
  oltp: {
    id: "oltp",
    label: "OLTP Workload",
    subtitle: "Online Transaction Processing",
    color: OLTP_COLOR,
    tagline: "Fast, transactional, row-oriented",
    query: `-- OLTP: single-row INSERT
INSERT INTO orders (order_id, customer_id, product_id, amount, status)
VALUES (98765, 4201, 117, 49.99, 'pending');

-- Immediately visible to concurrent readers
-- Typically commits in < 5 ms`,
    stats: [
      { label: "Rows touched", value: "1", unit: "row" },
      { label: "Latency target", value: "< 5", unit: "ms" },
      { label: "Concurrency", value: "10 k+", unit: "TPS" },
      { label: "Storage model", value: "Row", unit: "store" },
    ],
    characteristics: [
      { key: "Purpose", value: "Record day-to-day business events" },
      { key: "Operations", value: "INSERT, UPDATE, DELETE, point reads" },
      { key: "Storage", value: "Row-oriented (PostgreSQL, MySQL)" },
      { key: "Schema", value: "Highly normalized (3NF) to avoid anomalies" },
      { key: "Indexes", value: "Many, on FK and equality columns" },
      { key: "Transactions", value: "Short ACID transactions, rollback critical" },
      { key: "Reads", value: "Narrow result sets, few rows returned" },
      { key: "Bottleneck", value: "Write throughput, locking, IOPS" },
    ],
    antipattern: {
      label: "OLAP query on an OLTP database",
      sql: `-- Danger: full-scan aggregation on a live OLTP table
SELECT region, SUM(amount) AS revenue
FROM orders                    -- 500 M rows
GROUP BY region;               -- holds locks, blocks writes`,
      note: "Running analytics-style full-table scans on an OLTP database can hold row locks for seconds, block incoming writes, and cause cascading timeouts. Move analytical queries to a warehouse.",
    },
  },
  olap: {
    id: "olap",
    label: "OLAP Workload",
    subtitle: "Online Analytical Processing",
    color: OLAP_COLOR,
    tagline: "Read-heavy, columnar, multi-million row scans",
    query: `-- OLAP: multi-million row aggregate
SELECT
  d.year,
  d.quarter,
  p.category,
  SUM(f.revenue)    AS total_revenue,
  COUNT(DISTINCT f.customer_id) AS unique_buyers
FROM fact_sales f
JOIN dim_date    d ON d.date_id    = f.date_id
JOIN dim_product p ON p.product_id = f.product_id
WHERE d.year = 2024
GROUP BY d.year, d.quarter, p.category
ORDER BY total_revenue DESC;
-- Scans ~200 M rows — that's fine here`,
    stats: [
      { label: "Rows scanned", value: "200 M", unit: "rows" },
      { label: "Latency target", value: "< 30", unit: "sec" },
      { label: "Concurrency", value: "Low", unit: "TPS" },
      { label: "Storage model", value: "Column", unit: "store" },
    ],
    characteristics: [
      { key: "Purpose", value: "Answer business questions over historical data" },
      { key: "Operations", value: "SELECT, GROUP BY, window functions, CTEs" },
      { key: "Storage", value: "Columnar (BigQuery, Redshift, DuckDB)" },
      { key: "Schema", value: "Denormalized star/snowflake for JOIN reduction" },
      { key: "Indexes", value: "Fewer; partitioning + clustering is preferred" },
      { key: "Transactions", value: "Long-running read queries, batch loads" },
      { key: "Reads", value: "Wide scans, many rows, aggregated results" },
      { key: "Bottleneck", value: "I/O bandwidth, CPU for aggregation" },
    ],
    antipattern: {
      label: "OLTP-style point lookups on a warehouse",
      sql: `-- Inefficient in a columnar warehouse
SELECT * FROM fact_sales
WHERE order_id = 98765;
-- Full segment scan to find one row
-- No row-level indexing in most warehouses`,
      note: "Point lookups on columnar warehouses are slow because the engine must scan entire column segments to find one row. Fetch individual records from the OLTP source, not the warehouse.",
    },
  },
};

const COMPARISON_ROWS = [
  { aspect: "Storage model", oltp: "Row-oriented", olap: "Column-oriented" },
  { aspect: "Optimized for", oltp: "Fast writes", olap: "Fast reads / scans" },
  { aspect: "Schema design", oltp: "Normalized (3NF)", olap: "Denormalized (star)" },
  { aspect: "Query type", oltp: "Point reads / writes", olap: "Aggregate scans" },
  { aspect: "Data freshness", oltp: "Real-time (ms)", olap: "Near-real-time (min–hr)" },
  { aspect: "Concurrency", oltp: "Many short transactions", olap: "Few long queries" },
  { aspect: "Examples", oltp: "PostgreSQL, MySQL", olap: "BigQuery, Redshift" },
];

const QUIZ = [
  {
    q: "Why does columnar storage accelerate analytical aggregations like SUM(revenue) GROUP BY region?",
    options: [
      "Columnar stores read every column for every row, which is faster",
      "The engine reads only the revenue and region columns, skipping unneeded columns entirely",
      "Columnar stores use more memory so they cache everything",
      "GROUP BY is a special instruction that only columnar engines understand",
    ],
    answer: 1,
    explanation: "In columnar storage, each column is stored separately. A SUM(revenue) query reads only the revenue and region column files, skipping all other columns. Row stores must read the full row to extract a single field.",
  },
  {
    q: "An OLTP table with 500 M rows needs a nightly revenue report. What is the recommended approach?",
    options: [
      "Run the GROUP BY directly on the OLTP table after business hours",
      "Add more indexes to the OLTP table to speed up the aggregate",
      "Replicate data to a data warehouse and run analytics there",
      "Use a materialized view on the OLTP database to pre-compute revenue",
    ],
    answer: 2,
    explanation: "Analytical queries on OLTP databases risk locking, degrade write performance, and are slow because row stores are not designed for full-table scans. Replicating to a columnar warehouse separates concerns cleanly.",
  },
  {
    q: "Which characteristic is true of OLAP systems but NOT OLTP systems?",
    options: [
      "Support for ACID transactions",
      "High write throughput (thousands of inserts per second)",
      "Partition pruning and clustering as the primary access optimization",
      "Foreign key constraints enforced by the database engine",
    ],
    answer: 2,
    explanation: "OLAP systems use partitioning (e.g., by year/month) and clustering to minimize data scanned. They typically do not enforce foreign keys or support high-frequency transactional writes.",
  },
];

export default function SQLOltpOlapViz() {
  const [tab, setTab] = useState("oltp");
  const [showAntipattern, setShowAntipattern] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  const scenario = SCENARIOS[tab];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          OLTP vs OLAP
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Switch between workload types to see the query pattern, storage model, and design differences that interviewers expect you to articulate.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {Object.values(SCENARIOS).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setTab(s.id); setShowAntipattern(false); }}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: `1.5px solid ${tab === s.id ? s.color : `${s.color}44`}`,
              background: tab === s.id ? `${s.color}1a` : "rgba(255,255,255,0.03)",
              color: tab === s.id ? s.color : DS.t3,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--ds-mono), monospace",
              transition: "all 0.15s",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <span>{s.label}</span>
            <span style={{ fontSize: 10, fontWeight: 400, color: tab === s.id ? `${s.color}bb` : DS.dim }}>{s.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {scenario.stats.map(({ label, value, unit }) => (
          <div key={label} style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${scenario.color}33`,
            background: `${scenario.color}0a`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: scenario.color, fontFamily: "var(--ds-mono), monospace" }}>{value}</span>
              <span style={{ fontSize: 10, color: DS.t3 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: query + characteristics */}
      <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Query */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Typical query
          </div>
          <pre style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: 8,
            border: `1px solid ${scenario.color}33`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 11,
            lineHeight: 1.7,
            fontFamily: "var(--ds-mono), monospace",
            overflowX: "auto",
          }}>
            <code>{scenario.query}</code>
          </pre>
          <div style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: `${scenario.color}0d`,
            border: `1px solid ${scenario.color}33`,
            fontSize: 12,
            color: scenario.color,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 600,
          }}>
            {scenario.tagline}
          </div>
        </div>

        {/* Characteristics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
            Key characteristics
          </div>
          {scenario.characteristics.map(({ key, value }) => (
            <div key={key} style={{
              display: "flex",
              gap: 8,
              padding: "7px 10px",
              borderRadius: 6,
              border: `1px solid ${DS.border}`,
              background: "rgba(255,255,255,0.02)",
            }}>
              <span style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", minWidth: 90, flexShrink: 0 }}>{key}</span>
              <span style={{ fontSize: 12, color: DS.t2 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-pattern toggle */}
      <div style={{ borderRadius: 8, border: `1px solid ${showAntipattern ? "#F8717155" : DS.border}`, overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => setShowAntipattern(!showAntipattern)}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "12px 14px",
            background: showAntipattern ? "#F871710d" : "rgba(255,255,255,0.02)",
            border: "none",
            color: showAntipattern ? "#F87171" : DS.t2,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--ds-sans), sans-serif",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Anti-pattern: {scenario.antipattern.label}</span>
          <span style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace" }}>{showAntipattern ? "▲" : "▼"}</span>
        </button>
        {showAntipattern && (
          <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <pre style={{
              margin: 0,
              padding: "10px 12px",
              borderRadius: 6,
              border: `1px solid ${DS.border}`,
              background: "rgba(2,6,23,0.72)",
              color: DS.t1,
              fontSize: 11,
              lineHeight: 1.65,
              fontFamily: "var(--ds-mono), monospace",
              overflowX: "auto",
            }}>
              <code>{scenario.antipattern.sql}</code>
            </pre>
            <div style={{ padding: "8px 12px", borderRadius: 6, background: "#F871710d", border: "1px solid #F8717133", color: DS.t2, fontSize: 13, lineHeight: 1.6 }}>
              <strong style={{ color: "#F87171" }}>Why it hurts: </strong>{scenario.antipattern.note}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-side comparison table */}
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
          Side-by-side comparison
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["", "OLTP", "OLAP"].map((h, hi) => (
                <th key={hi} style={{
                  textAlign: hi === 0 ? "left" : "center",
                  padding: "8px 12px",
                  color: hi === 1 ? OLTP_COLOR : hi === 2 ? OLAP_COLOR : DS.dim,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  borderBottom: `1px solid ${DS.border}`,
                  letterSpacing: "0.08em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <td style={{ padding: "8px 12px", color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontSize: 11, borderBottom: `1px solid ${DS.border}`, fontWeight: 600 }}>
                  {row.aspect}
                </td>
                <td style={{ padding: "8px 12px", color: DS.t2, fontSize: 12, borderBottom: `1px solid ${DS.border}`, textAlign: "center" }}>
                  {row.oltp}
                </td>
                <td style={{ padding: "8px 12px", color: DS.t2, fontSize: 12, borderBottom: `1px solid ${DS.border}`, textAlign: "center" }}>
                  {row.olap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick drill */}
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
