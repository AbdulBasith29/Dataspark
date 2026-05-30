import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const USERS = [
  { id: 1, email: "alice@example.com", name: "Alice", created_at: "2024-01-03", plan: "pro" },
  { id: 2, email: "bob@corp.io", name: "Bob", created_at: "2024-01-15", plan: "free" },
  { id: 3, email: "carol@startup.co", name: "Carol", created_at: "2024-02-01", plan: "team" },
  { id: 4, email: "dave@example.com", name: "Dave", created_at: "2024-02-14", plan: "free" },
  { id: 5, email: "eve@corp.io", name: "Eve", created_at: "2024-03-05", plan: "pro" },
  { id: 6, email: "frank@startup.co", name: "Frank", created_at: "2024-03-20", plan: "free" },
  { id: 7, email: "grace@example.com", name: "Grace", created_at: "2024-04-02", plan: "team" },
  { id: 8, email: "hank@corp.io", name: "Hank", created_at: "2024-04-18", plan: "pro" },
  { id: 9, email: "iris@startup.co", name: "Iris", created_at: "2024-05-01", plan: "free" },
  { id: 10, email: "jake@example.com", name: "Jake", created_at: "2024-05-22", plan: "team" },
  { id: 11, email: "kate@corp.io", name: "Kate", created_at: "2024-06-07", plan: "pro" },
  { id: 12, email: "leo@startup.co", name: "Leo", created_at: "2024-06-30", plan: "free" },
];

const INDEX_MODES = [
  { id: "none", label: "No Index", color: "#F87171" },
  { id: "btree_email", label: "B-tree on email", color: "#0EA5E9" },
  { id: "composite", label: "Composite (email, created_at)", color: "#10B981" },
];

const TARGET_EMAIL = "grace@example.com";

function getExamCount(mode, query) {
  if (mode === "none") return 12;
  if (mode === "btree_email") return query === "equality" ? 1 : 6;
  return query === "equality" ? 1 : 3;
}

function getHighlightedRows(mode, query) {
  if (mode === "none") {
    return USERS.map((u) => ({ id: u.id, scanned: true, match: u.email === TARGET_EMAIL }));
  }
  if (mode === "btree_email") {
    if (query === "equality") {
      return USERS.map((u) => ({ id: u.id, scanned: u.email === TARGET_EMAIL, match: u.email === TARGET_EMAIL }));
    }
    // range on created_at — email index can't help, engine falls back to partial scan
    const rangeIds = [7, 8, 9, 10, 11, 12];
    return USERS.map((u) => ({ id: u.id, scanned: rangeIds.includes(u.id), match: rangeIds.includes(u.id) }));
  }
  // composite (email, created_at)
  if (query === "equality") {
    return USERS.map((u) => ({ id: u.id, scanned: u.email === TARGET_EMAIL, match: u.email === TARGET_EMAIL }));
  }
  // range with composite: only the rows matching email prefix + date range
  const rangeIds = [7, 8, 9];
  return USERS.map((u) => ({ id: u.id, scanned: rangeIds.includes(u.id), match: rangeIds.includes(u.id) }));
}

const SIDE_NOTES = {
  none: {
    when: "Never intentionally — no index means a full sequential scan on every query.",
    avoid: "Acceptable only on tiny tables (<1 000 rows) or write-only staging tables.",
    details: "The engine reads every row left to right. At 100 M rows this becomes a performance emergency.",
  },
  btree_email: {
    when: "High-cardinality columns used in equality or range filters: email, user_id, order_id, timestamps.",
    avoid: "Low-cardinality columns (boolean flags, status with 3 values) — the optimizer skips the index anyway.",
    details: "B-tree stores values in sorted order. Equality: O(log n). Range scan walks the leaf level. Only useful when selectivity is high.",
  },
  composite: {
    when: "Queries filtering on multiple columns together, especially (leading_col = ?, range_col BETWEEN ? AND ?).",
    avoid: "When queries skip the leading column — a (email, created_at) index cannot help a query filtering only on created_at.",
    details: "Column order matters. Put the equality filter column first, range column second. The engine can only use the index prefix.",
  },
};

const QUIZ = [
  {
    q: "A table has 1 M rows. Column `status` has only 3 distinct values. Should you add a B-tree index on `status`?",
    options: [
      "Yes — indexes always speed up WHERE clauses",
      "No — low cardinality means the optimizer may ignore it and prefer a full scan",
      "Yes — but only if the table has a primary key",
      "No — indexes are only for JOIN columns",
    ],
    answer: 1,
    explanation: "Low-cardinality columns make poor B-tree index candidates. The optimizer often finds a full scan cheaper than random I/O when ~33% of rows match each value.",
  },
  {
    q: "You have a composite index (email, created_at). Which query uses it most efficiently?",
    options: [
      "WHERE created_at > '2024-01-01'",
      "WHERE email = 'alice@example.com' AND created_at > '2024-01-01'",
      "WHERE created_at > '2024-01-01' AND email = 'alice@example.com'",
      "B and C use the index equally",
    ],
    answer: 3,
    explanation: "B and C express the same predicate — the optimizer reorders them. Both use the composite index well because the leading column (email) appears as an equality filter.",
  },
  {
    q: "Which scenario makes adding a new index most costly?",
    options: [
      "Read-heavy analytics table, updated once per day",
      "High-write OLTP table with thousands of inserts per second",
      "A table with 500 rows",
      "A table with a UUID primary key",
    ],
    answer: 1,
    explanation: "Every INSERT, UPDATE, or DELETE must also update all indexes on the table. High-write tables pay this overhead on every write, degrading throughput.",
  },
];

export default function SQLIndexingViz() {
  const [mode, setMode] = useState("none");
  const [query, setQuery] = useState("equality");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  const activeMode = INDEX_MODES.find((m) => m.id === mode);
  const rows = getHighlightedRows(mode, query);
  const examined = getExamCount(mode, query);
  const note = SIDE_NOTES[mode];

  const queryLabel = query === "equality"
    ? `WHERE email = '${TARGET_EMAIL}'`
    : `WHERE created_at >= '2024-04-01'`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Indexing Strategies
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Toggle the index type and the query pattern. Highlighted rows show which rows the engine must examine.
        </p>
      </div>

      {/* Index mode controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INDEX_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: `1.5px solid ${mode === m.id ? m.color : `${m.color}44`}`,
                background: mode === m.id ? `${m.color}1a` : "rgba(255,255,255,0.03)",
                color: mode === m.id ? m.color : DS.t3,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--ds-mono), monospace",
                transition: "all 0.15s",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "equality", label: "Equality  (email = ?)" },
            { id: "range", label: "Range  (created_at >=)" },
          ].map((qOpt) => (
            <button
              key={qOpt.id}
              type="button"
              onClick={() => setQuery(qOpt.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1.5px solid ${query === qOpt.id ? DS.ind : DS.border}`,
                background: query === qOpt.id ? `${DS.ind}14` : "rgba(255,255,255,0.02)",
                color: query === qOpt.id ? DS.ind : DS.t3,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--ds-mono), monospace",
                transition: "all 0.15s",
              }}
            >
              {qOpt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query display */}
      <pre style={{
        margin: 0,
        padding: "10px 14px",
        borderRadius: 8,
        border: `1px solid ${DS.border}`,
        background: "rgba(2,6,23,0.72)",
        color: DS.t1,
        fontSize: 12,
        fontFamily: "var(--ds-mono), monospace",
        lineHeight: 1.6,
        overflowX: "auto",
      }}>
        <code>{`SELECT * FROM users\n${queryLabel};`}</code>
      </pre>

      {/* Scan cost badge + progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: `1px solid ${activeMode.color}55`,
          background: `${activeMode.color}14`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: activeMode.color, fontFamily: "var(--ds-mono), monospace" }}>{examined}</span>
          <span style={{ fontSize: 12, color: DS.t3, lineHeight: 1.4 }}>
            row{examined !== 1 ? "s" : ""} examined<br />
            <span style={{ color: DS.dim, fontSize: 11 }}>of 12 total</span>
          </span>
        </div>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: DS.border, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(examined / 12) * 100}%`,
            background: activeMode.color,
            borderRadius: 4,
            transition: "width 0.4s ease",
          }} />
        </div>
        <span style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", whiteSpace: "nowrap" }}>
          {Math.round((examined / 12) * 100)}% scanned
        </span>
      </div>

      {/* Table + side panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 250px", gap: 16, alignItems: "start" }}>
        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["id", "email", "name", "created_at", "plan"].map((col, ci) => (
                  <th key={col} style={{
                    textAlign: "left",
                    padding: "6px 10px",
                    color: DS.dim,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    borderBottom: `1px solid ${DS.border}`,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    {col}
                    {col === "email" && (mode === "btree_email" || mode === "composite") && (
                      <span style={{ marginLeft: 4, color: activeMode.color, fontSize: 9, fontWeight: 800 }}>▲IDX</span>
                    )}
                    {col === "created_at" && mode === "composite" && (
                      <span style={{ marginLeft: 4, color: activeMode.color, fontSize: 9, fontWeight: 800 }}>▲IDX</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USERS.map((user) => {
                const rowInfo = rows.find((r) => r.id === user.id);
                const isScanned = rowInfo?.scanned;
                const isMatch = rowInfo?.match;
                return (
                  <tr
                    key={user.id}
                    style={{
                      background: isMatch
                        ? `${activeMode.color}18`
                        : isScanned
                          ? "rgba(255,255,255,0.03)"
                          : "transparent",
                      opacity: isScanned || mode === "none" ? 1 : 0.28,
                      transition: "all 0.3s",
                    }}
                  >
                    {[String(user.id), user.email, user.name, user.created_at, user.plan].map((val, vi) => (
                      <td key={vi} style={{
                        padding: "6px 10px",
                        color: isMatch ? DS.t1 : isScanned ? DS.t2 : DS.t3,
                        fontFamily: vi === 0 || vi === 3 ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
                        borderBottom: `1px solid ${DS.border}`,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}>
                        {vi === 0 && isScanned && (
                          <span style={{ marginRight: 5, fontSize: 10, color: isMatch ? activeMode.color : DS.dim }}>
                            {isMatch ? "✓" : "·"}
                          </span>
                        )}
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            padding: "14px",
            borderRadius: 10,
            border: `1px solid ${activeMode.color}44`,
            background: `${activeMode.color}0a`,
          }}>
            <div style={{ fontSize: 10, color: activeMode.color, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
              {activeMode.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 4 }}>USE WHEN</div>
                <p style={{ margin: 0, color: DS.t2, fontSize: 12, lineHeight: 1.6 }}>{note.when}</p>
              </div>
              <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 10, color: "#F87171", fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 4 }}>AVOID WHEN</div>
                <p style={{ margin: 0, color: DS.t2, fontSize: 12, lineHeight: 1.6 }}>{note.avoid}</p>
              </div>
              <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 10 }}>
                <p style={{ margin: 0, color: DS.t3, fontSize: 11, lineHeight: 1.6, fontStyle: "italic" }}>{note.details}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { color: activeMode.color, label: "Match (returned)" },
              { color: DS.t3, label: "Scanned (examined)" },
              { color: DS.dim, label: "Skipped (not examined)" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: DS.t3 }}>{label}</span>
              </div>
            ))}
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
