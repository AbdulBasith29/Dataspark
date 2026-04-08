import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const U = 4;
const I = 5;
const raw = [
  [4, null, 3, 5, null],
  [null, 5, 4, null, 2],
  [3, 4, null, 5, null],
  [5, null, 4, null, 3],
];

function globalMean(m) {
  let s = 0;
  let c = 0;
  m.forEach((row) =>
    row.forEach((v) => {
      if (v != null) {
        s += v;
        c++;
      }
    })
  );
  return c ? s / c : 0;
}

function rowMeans(m) {
  return m.map((row) => {
    const vals = row.filter((v) => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
}

function colMeans(m) {
  return Array.from({ length: I }, (_, j) => {
    const vals = [];
    for (let i = 0; i < U; i++) if (m[i][j] != null) vals.push(m[i][j]);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
}

function predictBaseline(m, ui, ii, g, rm, cm) {
  if (m[ui][ii] != null) return m[ui][ii];
  return g + (rm[ui] - g) + (cm[ii] - g);
}

export default function RecSysCollaborativeFiltering() {
  const [focusU, setFocusU] = useState(0);
  const [focusI, setFocusI] = useState(1);

  const g = useMemo(() => globalMean(raw), []);
  const rm = useMemo(() => rowMeans(raw), []);
  const cm = useMemo(() => colMeans(raw), []);

  const pred =
    raw[focusU][focusI] == null ? predictBaseline(raw, focusU, focusI, g, rm, cm) : raw[focusU][focusI];

  const cellBg = (u, i) => {
    const v = raw[u][i];
    if (v != null) {
      const t = (v - 1) / 4;
      return `rgba(129, 140, 248, ${0.15 + 0.55 * t})`;
    }
    if (u === focusU && i === focusI) return "rgba(251, 191, 36, 0.2)";
    return "rgba(255,255,255,0.03)";
  };

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        User-item matrix and a simple baseline fill
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Collaborative filtering learns from overlaps in who rated what. A common interview baseline is mu + b_user + b_item (global mean plus row and column offsets). Pick a missing cell to see the closed-form guess.
      </p>

      <div style={{ overflowX: "auto", border: `1px solid ${DS.border}`, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "var(--ds-mono), monospace", fontSize: 12, minWidth: 360 }}>
          <thead>
            <tr>
              <th style={{ padding: 8, color: DS.dim, textAlign: "left" }} />
              {Array.from({ length: I }, (_, i) => (
                <th key={i} style={{ padding: 8, color: DS.t3, borderBottom: `1px solid ${DS.border}` }}>
                  item {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {raw.map((row, u) => (
              <tr key={u}>
                <td style={{ padding: 8, color: DS.t3, borderRight: `1px solid ${DS.border}`, whiteSpace: "nowrap" }}>
                  user {u + 1}
                </td>
                {row.map((v, i) => (
                  <td
                    key={i}
                    style={{
                      padding: 10,
                      textAlign: "center",
                      border: `1px solid ${DS.border}`,
                      background: cellBg(u, i),
                      color: v != null ? DS.t1 : DS.dim,
                      fontStyle: v == null ? "italic" : "normal",
                      cursor: v == null ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (v == null) {
                        setFocusU(u);
                        setFocusI(i);
                      }
                    }}
                  >
                    {v == null ? "?" : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.7 }}>
        <div>Global mean mu = {g.toFixed(3)}</div>
        <div>
          Focused missing cell: user {focusU + 1}, item {focusI + 1} &rarr; baseline prediction = {typeof pred === "number" && raw[focusU][focusI] == null ? pred.toFixed(2) : String(pred)}
        </div>
        <div style={{ color: DS.t3, marginTop: 6 }}>
          Formula: mu + (row_mean - mu) + (col_mean - mu). Click another &quot;?&quot; to refocus.
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Matrix factorization and neural CF go further by learning low-rank latent factors. Cold-start users/items still need content features or popularity fallbacks.
      </p>
    </div>
  );
}
