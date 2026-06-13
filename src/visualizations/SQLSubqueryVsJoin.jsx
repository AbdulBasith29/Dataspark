import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const USERS = [
  { user_id: "U1", name: "Alice" },
  { user_id: "U2", name: "Bob" },
  { user_id: "U3", name: "Carol" },
  { user_id: "U4", name: "Dave" },
];

const ORDERS = [
  { order_id: "O1", user_id: "U1", amount: 120 },
  { order_id: "O2", user_id: "U1", amount: 80 },
  { order_id: "O3", user_id: "U2", amount: 200 },
  { order_id: "O4", user_id: "U2", amount: 150 },
  { order_id: "O5", user_id: "U3", amount: 50 },
];

const SCENARIOS = [
  {
    id: "correlated",
    label: "Correlated subquery",
    description: "SELECT with a subquery that references each outer user row. Conceptually executes once per row.",
    code: `SELECT\n  u.user_id,\n  (SELECT COUNT(*)\n   FROM orders o\n   WHERE o.user_id = u.user_id -- references outer row\n  ) AS order_count\nFROM users u;`,
    performance: "danger",
    perfNote: "Row-by-row shape — risky on large tables. Some engines can decorrelate it, but don't rely on magic.",
    compute: (users, orders) =>
      users.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        order_count: orders.filter((o) => o.user_id === u.user_id).length,
      })),
    columns: ["user_id", "name", "order_count"],
  },
  {
    id: "set_agg",
    label: "Pre-aggregate + LEFT JOIN",
    description: "Aggregate orders into one-row-per-user first, then join. Set-based and safe at scale.",
    code: `WITH order_counts AS (\n  SELECT user_id, COUNT(*) AS cnt\n  FROM orders\n  GROUP BY user_id\n)\nSELECT\n  u.user_id,\n  u.name,\n  COALESCE(oc.cnt, 0) AS order_count\nFROM users u\nLEFT JOIN order_counts oc\n  ON oc.user_id = u.user_id;`,
    performance: "good",
    perfNote: "Set-based — aggregation runs once on all orders, then one join pass. Scales well.",
    compute: (users, orders) => {
      const counts = {};
      orders.forEach((o) => { counts[o.user_id] = (counts[o.user_id] || 0) + 1; });
      return users.map((u) => ({
        user_id: u.user_id,
        name: u.name,
        order_count: counts[u.user_id] || 0,
      }));
    },
    columns: ["user_id", "name", "order_count"],
  },
  {
    id: "inner_join_raw",
    label: "INNER JOIN raw orders",
    description: "Joining users directly to orders without pre-aggregating. One user row becomes multiple rows.",
    code: `SELECT\n  u.user_id,\n  u.name,\n  o.order_id,\n  o.amount\nFROM users u\nINNER JOIN orders o\n  ON o.user_id = u.user_id;`,
    performance: "warn",
    perfNote: "Fan-out! Users with multiple orders appear multiple times. Dave (no orders) is excluded.",
    compute: (users, orders) => {
      const rows = [];
      users.forEach((u) => {
        orders.filter((o) => o.user_id === u.user_id).forEach((o) => {
          rows.push({ user_id: u.user_id, name: u.name, order_id: o.order_id, amount: o.amount });
        });
      });
      return rows;
    },
    columns: ["user_id", "name", "order_id", "amount"],
  },
  {
    id: "exists",
    label: "EXISTS semi-join",
    description: "Check presence only — returns each matching user exactly once. Cleanest for yes/no presence checks.",
    code: `SELECT u.user_id, u.name\nFROM users u\nWHERE EXISTS (\n  SELECT 1\n  FROM orders o\n  WHERE o.user_id = u.user_id\n);`,
    performance: "good",
    perfNote: "Semi-join — each user appears at most once. No order columns, no fan-out.",
    compute: (users, orders) => {
      const hasOrder = new Set(orders.map((o) => o.user_id));
      return users.filter((u) => hasOrder.has(u.user_id)).map((u) => ({ user_id: u.user_id, name: u.name }));
    },
    columns: ["user_id", "name"],
  },
];

const PERF_COLOR = { good: "#10B981", warn: "#F59E0B", danger: "#F87171" };
const PERF_LABEL = { good: "Scales well", warn: "Fan-out risk", danger: "Row-by-row risk" };

export default function SQLSubqueryVsJoin() {
  const [active, setActive] = useState("correlated");

  const scenario = SCENARIOS.find((s) => s.id === active);
  const result = scenario.compute(USERS, ORDERS);
  const perfColor = PERF_COLOR[scenario.performance];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Subqueries vs Joins · Live Comparison
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Pick a query pattern and see the actual result rows. Notice how fan-out and presence-check semantics change the output.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {SCENARIOS.map((s) => {
          const c = PERF_COLOR[s.performance];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1.5px solid ${active === s.id ? c : `${c}33`}`,
                background: active === s.id ? `${c}14` : "rgba(255,255,255,0.02)",
                color: active === s.id ? DS.t1 : DS.t2,
                cursor: "pointer",
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</span>
                <span style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: `${c}22`,
                  border: `1px solid ${c}44`,
                  color: c,
                  fontFamily: "var(--ds-mono), monospace",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}>
                  {PERF_LABEL[s.performance]}
                </span>
              </div>
              <div style={{ fontSize: 11, color: DS.t3, marginTop: 4, lineHeight: 1.4 }}>{s.description}</div>
            </button>
          );
        })}
      </div>

      <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
          }}>
            <code>{scenario.code}</code>
          </pre>

          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: `${perfColor}0d`, border: `1px solid ${perfColor}33` }}>
            <span style={{ fontSize: 10, color: perfColor, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{PERF_LABEL[scenario.performance].toUpperCase()} · </span>
            <span style={{ color: DS.t2, fontSize: 13, lineHeight: 1.55 }}>{scenario.perfNote}</span>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>RESULT</div>
            <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{result.length} row{result.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${DS.border}`, background: "rgba(2,6,23,0.5)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {scenario.columns.map((col) => (
                    <th key={col} style={{
                      padding: "8px 10px",
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
                {result.map((row, i) => {
                  const prevUserId = i > 0 ? result[i - 1].user_id : null;
                  const isDuplicate = prevUserId === row.user_id;
                  return (
                    <tr key={i} style={{
                      borderBottom: `1px solid ${DS.border}22`,
                      background: isDuplicate ? "#F59E0B08" : "transparent",
                    }}>
                      {scenario.columns.map((col) => (
                        <td key={col} style={{
                          padding: "7px 10px",
                          color: isDuplicate && col === "user_id" ? "#F59E0B" : DS.t2,
                          fontFamily: "var(--ds-mono), monospace",
                        }}>
                          {row[col] !== undefined ? String(row[col]) : ""}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {scenario.id === "inner_join_raw" && result.some((_, i) => i > 0 && result[i].user_id === result[i - 1].user_id) && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#F59E0B", lineHeight: 1.5 }}>
              ↑ Amber rows = same user appearing multiple times due to join fan-out
            </div>
          )}
          {scenario.id === "set_agg" && (
            <div style={{ marginTop: 8, fontSize: 12, color: DS.grn, lineHeight: 1.5 }}>
              ↑ Dave (no orders) still appears with order_count = 0 thanks to LEFT JOIN
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Decision guide</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {[
            { need: "Count per user (scalable)", answer: "Pre-aggregate + LEFT JOIN", color: "#10B981" },
            { need: "Check if user has any orders", answer: "EXISTS semi-join", color: "#10B981" },
            { need: "Need order columns too", answer: "INNER/LEFT JOIN (watch grain)", color: "#F59E0B" },
            { need: "Correlated SELECT subquery", answer: "Refactor when table grows", color: "#F87171" },
          ].map(({ need, answer, color }) => (
            <div key={need} style={{ padding: "10px 12px", borderRadius: 6, border: `1px solid ${color}22`, background: `${color}08` }}>
              <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>{need}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace" }}>→ {answer}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
