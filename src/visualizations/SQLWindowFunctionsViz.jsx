import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#818CF8";
const GRN = "#34D399";
const AMB = "#F59E0B";
const RED = "#F87171";

const SALES_DATA = [
  { id: 1, salesperson: "Alice",  region: "East", amount: 9200 },
  { id: 2, salesperson: "Bob",    region: "East", amount: 7400 },
  { id: 3, salesperson: "Carol",  region: "West", amount: 8800 },
  { id: 4, salesperson: "Dan",    region: "East", amount: 9200 },
  { id: 5, salesperson: "Eve",    region: "West", amount: 8800 },
  { id: 6, salesperson: "Frank",  region: "West", amount: 6100 },
  { id: 7, salesperson: "Grace",  region: "East", amount: 5500 },
];

function computeRank(rows, partitionKey, fn) {
  const partitioned = {};
  rows.forEach((r) => {
    const k = partitionKey === "none" ? "__all__" : r.region;
    if (!partitioned[k]) partitioned[k] = [];
    partitioned[k].push(r);
  });

  const resultMap = {};
  Object.values(partitioned).forEach((group) => {
    const sorted = [...group].sort((a, b) => b.amount - a.amount);
    let rowNum = 0;
    let rank = 0;
    let denseRank = 0;
    let lastAmount = null;

    sorted.forEach((row) => {
      rowNum++;
      if (row.amount !== lastAmount) {
        rank = rowNum;
        denseRank++;
      }
      lastAmount = row.amount;
      const val = fn === "ROW_NUMBER" ? rowNum : fn === "RANK" ? rank : denseRank;
      resultMap[row.id] = {
        ...row,
        __rank: val,
        __partition: partitionKey === "none" ? "ALL" : row.region,
      };
    });
  });

  return rows.map((r) => resultMap[r.id]);
}

const PARTITION_OPTS = [
  { id: "none",   label: "No partition" },
  { id: "region", label: "PARTITION BY region" },
];

const RANK_FNS = [
  { id: "ROW_NUMBER",  label: "ROW_NUMBER()",  color: ACCENT },
  { id: "RANK",        label: "RANK()",         color: GRN },
  { id: "DENSE_RANK",  label: "DENSE_RANK()",   color: AMB },
];

const DRILL = [
  {
    q: "ROW_NUMBER, RANK, and DENSE_RANK all assign the same value when there are no ties.",
    opts: [
      "True — ties are the only thing that changes them",
      "False — ROW_NUMBER always assigns unique integers regardless of ties",
      "False — RANK always skips numbers even without ties",
    ],
    correct: 0,
    exp: "When there are no ties all three functions produce identical sequential integers. The difference only surfaces on tied values.",
  },
  {
    q: "In a partition of 5 rows where rows 2 and 3 share the same amount, RANK() gives them rank 2. What rank does row 4 get?",
    opts: ["3", "4", "5"],
    correct: 1,
    exp: "RANK skips numbers equal to the number of tied rows. Rows 2 & 3 both get rank 2, so the next rank is 4 (skipping 3).",
  },
  {
    q: "DENSE_RANK never leaves gaps between rank values. Why does this matter for pagination or bucket logic?",
    opts: [
      "It makes tie-breaking deterministic",
      "You can safely use DENSE_RANK values as sequential bucket IDs without gaps",
      "DENSE_RANK is always faster than RANK",
    ],
    correct: 1,
    exp: "Because DENSE_RANK never skips integers you can use it to label exactly N distinct tiers without sparse IDs in between.",
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

export default function SQLWindowFunctionsViz() {
  const [partition, setPartition] = useState("none");
  const [rankFn, setRankFn] = useState("ROW_NUMBER");
  const [drill, setDrill] = useState(Array(DRILL.length).fill(null));
  const [revealed, setRevealed] = useState(Array(DRILL.length).fill(false));

  const fnMeta = RANK_FNS.find((f) => f.id === rankFn);
  const ranked = computeRank(SALES_DATA, partition, rankFn);

  const sqlSnippet =
    `SELECT\n  salesperson, region, amount,\n  ${rankFn}() OVER (\n` +
    (partition !== "none" ? `    PARTITION BY region\n` : "") +
    `    ORDER BY amount DESC\n  ) AS rnk\nFROM sales;`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Window Ranking Functions
        </div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Pick a partition strategy and a ranking function. Watch how ties produce different rank values across ROW_NUMBER, RANK, and DENSE_RANK.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>PARTITION BY</div>
          <div style={{ display: "flex", gap: 6 }}>
            {PARTITION_OPTS.map((o) => (
              <OptionButton key={o.id} label={o.label} selected={partition === o.id} color={ACCENT} onClick={() => setPartition(o.id)} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: "0.1em" }}>RANKING FUNCTION</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {RANK_FNS.map((f) => (
              <OptionButton key={f.id} label={f.label} selected={rankFn === f.id} color={f.color} onClick={() => setRankFn(f.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* SQL preview */}
      <pre style={{
        margin: 0,
        padding: "12px 14px",
        borderRadius: 8,
        border: `1px solid ${fnMeta.color}33`,
        background: "rgba(2,6,23,0.72)",
        color: DS.t1,
        fontSize: 12,
        lineHeight: 1.7,
        fontFamily: "var(--ds-mono), monospace",
        overflowX: "auto",
      }}>
        <code>{sqlSnippet}</code>
      </pre>

      {/* Result table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["salesperson", "region", "amount", `${rankFn}() → rnk`].map((col) => {
                const isRank = col.includes("rnk");
                return (
                  <th key={col} style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    color: isRank ? fnMeta.color : DS.dim,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${DS.border}`,
                    background: isRank ? `${fnMeta.color}0a` : "transparent",
                  }}>
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ranked.map((row) => {
              const isTied = ranked.some(
                (r) => r.id !== row.id && r.__rank === row.__rank && r.__partition === row.__partition
              );
              return (
                <tr key={row.id} style={{ borderBottom: `1px solid ${DS.border}22` }}>
                  <td style={{ padding: "8px 12px", color: DS.t2 }}>{row.salesperson}</td>
                  <td style={{ padding: "8px 12px", color: row.region === "East" ? "#0EA5E9" : "#8B5CF6", fontWeight: 600 }}>{row.region}</td>
                  <td style={{ padding: "8px 12px", color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>
                    ${row.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "8px 12px", fontFamily: "var(--ds-mono), monospace", fontWeight: 800, fontSize: 14, color: fnMeta.color, background: `${fnMeta.color}0d` }}>
                    {row.__rank}
                    {isTied && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: AMB, fontWeight: 600 }}>TIE</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tie semantics cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {[
          {
            fn: "ROW_NUMBER()",
            color: ACCENT,
            rule: "Always unique. Ties broken arbitrarily by engine — no two rows share a number.",
            trap: "Non-deterministic on ties. Add a tiebreaker column to ORDER BY for stable results.",
          },
          {
            fn: "RANK()",
            color: GRN,
            rule: "Tied rows share the same rank. The next rank skips as many positions as there were ties.",
            trap: "Gaps in sequence: 1, 2, 2, 4. Rank 3 never appears when two rows tie for 2nd.",
          },
          {
            fn: "DENSE_RANK()",
            color: AMB,
            rule: "Tied rows share the same rank. Next rank is always rank + 1 — no gaps ever.",
            trap: "Use when you need exactly N tiers (e.g., top-3 distinct salary bands) without sparse IDs.",
          },
        ].map(({ fn, color, rule, trap }) => (
          <div key={fn} style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${color}33`, background: `${color}08` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>{fn}</div>
            <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.55, marginBottom: 6 }}>{rule}</div>
            <div style={{ fontSize: 11, color: AMB, lineHeight: 1.5 }}>
              <strong>Interview trap: </strong>{trap}
            </div>
          </div>
        ))}
      </div>

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
                  const borderC = show && correct ? GRN : show && chosen && !correct ? RED : chosen ? ACCENT : DS.border;
                  const bg = show && correct ? `${GRN}18` : show && chosen && !correct ? `${RED}18` : chosen ? `${ACCENT}14` : "transparent";
                  const textC = show && correct ? GRN : show && chosen && !correct ? RED : chosen ? ACCENT : DS.t3;
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
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, background: `${GRN}0d`, border: `1px solid ${GRN}33`, color: DS.t2, fontSize: 12, lineHeight: 1.55 }}>
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
