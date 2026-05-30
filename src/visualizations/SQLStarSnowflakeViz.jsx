import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const FACT_COLOR = "#8B5CF6";
const DIM_COLOR = "#0EA5E9";
const SUB_DIM_COLOR = "#F59E0B";

const STAR_DIMS = [
  {
    id: "dim_product",
    label: "dim_product",
    cols: ["product_id PK", "product_name", "category", "sub_category", "brand", "unit_price"],
    x: "right",
    y: "top",
  },
  {
    id: "dim_customer",
    label: "dim_customer",
    cols: ["customer_id PK", "customer_name", "email", "country", "segment"],
    x: "right",
    y: "bottom",
  },
  {
    id: "dim_date",
    label: "dim_date",
    cols: ["date_id PK", "date", "month", "quarter", "year", "is_weekend"],
    x: "left",
    y: "top",
  },
  {
    id: "dim_store",
    label: "dim_store",
    cols: ["store_id PK", "store_name", "city", "region", "country"],
    x: "left",
    y: "bottom",
  },
];

const FACT_TABLE = {
  label: "fact_sales",
  cols: ["sale_id PK", "product_id FK", "customer_id FK", "date_id FK", "store_id FK", "quantity", "revenue", "discount"],
};

const SNOWFLAKE_PRODUCT_COLS = ["product_id PK", "product_name", "category_id FK", "brand", "unit_price"];
const SNOWFLAKE_CATEGORY_COLS = ["category_id PK", "category", "sub_category"];

const QUERIES = {
  star: {
    label: "Get revenue by product category (Star)",
    sql: `SELECT p.category, SUM(f.revenue)
FROM fact_sales f
JOIN dim_product p ON p.product_id = f.product_id
GROUP BY p.category;`,
    joins: 1,
    note: "1 JOIN — category lives directly on dim_product.",
  },
  snowflake: {
    label: "Get revenue by product category (Snowflake)",
    sql: `SELECT c.category, SUM(f.revenue)
FROM fact_sales f
JOIN dim_product p  ON p.product_id  = f.product_id
JOIN dim_category c ON c.category_id = p.category_id
GROUP BY c.category;`,
    joins: 2,
    note: "2 JOINs — must traverse dim_product then dim_category.",
  },
};

const QUIZ = [
  {
    q: "In a Star Schema a dimension table stores category, sub-category, and brand directly. What is the main trade-off of this design?",
    options: [
      "Faster queries because fewer JOINs, but some data is denormalized and repeated",
      "Slower queries because more JOINs are required",
      "Lower storage because repeated strings are factored out",
      "Better referential integrity because of extra foreign keys",
    ],
    answer: 0,
    explanation: "Star schemas denormalize dimension attributes into flat tables. This reduces JOIN depth (faster analytics) at the cost of data redundancy — the same category name may repeat across many product rows.",
  },
  {
    q: "A Snowflake Schema splits dim_product into dim_product + dim_category. When is this worth the extra JOIN?",
    options: [
      "When query latency is the only concern",
      "When storage is very constrained or category metadata changes frequently and must stay consistent",
      "Always — normalization is always better",
      "Never — snowflake schemas are obsolete",
    ],
    answer: 1,
    explanation: "Snowflake normalization saves storage by eliminating repeated dimension attribute values, and ensures consistency when a category name changes (update one row in dim_category vs many rows in dim_product).",
  },
  {
    q: "A BI tool runs thousands of ad-hoc aggregate queries per hour against a 500 M row fact table. Which schema is usually preferred?",
    options: [
      "Snowflake — more joins are faster in columnar databases",
      "Star — fewer joins keep query plans simpler and more predictable",
      "Third Normal Form — fully normalized is always fastest for analytics",
      "No schema — store everything in JSON blobs",
    ],
    answer: 1,
    explanation: "For high-volume analytics Star schemas are preferred because fewer JOINs produce simpler query plans and more predictable optimizer behavior. Modern columnar warehouses (BigQuery, Redshift, Snowflake) are optimized for this pattern.",
  },
];

function TableBox({ label, cols, color, style: extraStyle = {} }) {
  return (
    <div style={{
      borderRadius: 8,
      border: `1.5px solid ${color}55`,
      background: `${color}0d`,
      overflow: "hidden",
      minWidth: 160,
      ...extraStyle,
    }}>
      <div style={{
        padding: "6px 10px",
        background: `${color}22`,
        borderBottom: `1px solid ${color}33`,
        fontSize: 11,
        fontWeight: 800,
        color,
        fontFamily: "var(--ds-mono), monospace",
        letterSpacing: "0.04em",
      }}>
        {label}
      </div>
      <div style={{ padding: "6px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {cols.map((col) => (
          <div key={col} style={{
            fontSize: 11,
            color: col.includes("FK") ? "#F59E0B" : col.includes("PK") ? DS.grn : DS.t3,
            fontFamily: "var(--ds-mono), monospace",
            lineHeight: 1.5,
          }}>
            {col}
          </div>
        ))}
      </div>
    </div>
  );
}

function JoinCountBadge({ count, color }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 12px",
      borderRadius: 999,
      border: `1px solid ${color}55`,
      background: `${color}14`,
    }}>
      <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "var(--ds-mono), monospace" }}>{count}</span>
      <span style={{ fontSize: 12, color: DS.t3 }}>JOIN{count !== 1 ? "s" : ""} required</span>
    </div>
  );
}

export default function SQLStarSnowflakeViz() {
  const [schema, setSchema] = useState("star");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  const querySide = QUERIES[schema];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Star Schema vs Snowflake Schema
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Toggle between schemas. The fact table stays fixed in the center. Watch how dim_product splits in Snowflake and how the required JOIN count changes.
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "star", label: "Star Schema", color: DIM_COLOR },
          { id: "snowflake", label: "Snowflake Schema", color: SUB_DIM_COLOR },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSchema(s.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1.5px solid ${schema === s.id ? s.color : `${s.color}44`}`,
              background: schema === s.id ? `${s.color}1a` : "rgba(255,255,255,0.03)",
              color: schema === s.id ? s.color : DS.t3,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--ds-mono), monospace",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Schema diagram */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Top row: dim_date | fact | dim_product (star) or dim_product + dim_category (snowflake) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
          {/* Left: dim_date */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <TableBox label="dim_date" cols={STAR_DIMS[2].cols} color={DIM_COLOR} />
          </div>

          {/* Center: fact_sales */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <TableBox label={FACT_TABLE.label} cols={FACT_TABLE.cols} color={FACT_COLOR} style={{ minWidth: 180 }} />
          </div>

          {/* Right: dim_product (star) or dim_product + dim_category (snowflake) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <TableBox
              label="dim_product"
              cols={schema === "star" ? STAR_DIMS[0].cols : SNOWFLAKE_PRODUCT_COLS}
              color={DIM_COLOR}
            />
            {schema === "snowflake" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 2,
                  height: 20,
                  background: `${SUB_DIM_COLOR}55`,
                  marginLeft: 16,
                }} />
                <TableBox label="dim_category" cols={SNOWFLAKE_CATEGORY_COLS} color={SUB_DIM_COLOR} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: dim_store on left, dim_customer on right */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "flex-start" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <TableBox label="dim_store" cols={STAR_DIMS[3].cols} color={DIM_COLOR} />
          </div>
          <div style={{ width: 180 }} />
          <div>
            <TableBox label="dim_customer" cols={STAR_DIMS[1].cols} color={DIM_COLOR} />
          </div>
        </div>
      </div>

      {/* Connection lines note */}
      <div style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: `1px solid ${DS.border}`,
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}>
        {[
          { color: FACT_COLOR, label: "fact_sales (center)" },
          { color: DIM_COLOR, label: "dimension tables (FK → PK)" },
          ...(schema === "snowflake" ? [{ color: SUB_DIM_COLOR, label: "sub-dimension (normalized out)" }] : []),
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Query comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {Object.entries(QUERIES).map(([key, q]) => {
          const isActive = key === schema;
          const qColor = key === "star" ? DIM_COLOR : SUB_DIM_COLOR;
          return (
            <div key={key} style={{
              padding: "14px",
              borderRadius: 10,
              border: `1px solid ${isActive ? `${qColor}55` : DS.border}`,
              background: isActive ? `${qColor}0d` : "rgba(255,255,255,0.02)",
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? qColor : DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
                {key.toUpperCase()} SCHEMA
              </div>
              <JoinCountBadge count={q.joins} color={qColor} />
              <pre style={{
                margin: "10px 0 0",
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
                <code>{q.sql}</code>
              </pre>
              <p style={{ margin: "8px 0 0", color: DS.t3, fontSize: 12, lineHeight: 1.5 }}>{q.note}</p>
            </div>
          );
        })}
      </div>

      {/* Trade-off note */}
      <div style={{
        padding: "12px 16px",
        borderRadius: 8,
        border: `1px solid ${DS.borderStrong}`,
        background: "rgba(99,102,241,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}>
        <div style={{ fontSize: 11, color: DS.ind, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>TRADE-OFF SUMMARY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: DIM_COLOR, marginBottom: 4 }}>Star Schema</div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", color: DS.t3, fontSize: 12, lineHeight: 1.7 }}>
              <li>Fewer JOINs — faster analytics queries</li>
              <li>Simpler query plans for the optimizer</li>
              <li>Denormalized — some data redundancy</li>
              <li>Updates may touch many rows</li>
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: SUB_DIM_COLOR, marginBottom: 4 }}>Snowflake Schema</div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", color: DS.t3, fontSize: 12, lineHeight: 1.7 }}>
              <li>More JOINs — more complex queries</li>
              <li>Normalized — reduced storage, no redundancy</li>
              <li>Consistent updates (change one row)</li>
              <li>Better referential integrity</li>
            </ul>
          </div>
        </div>
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
