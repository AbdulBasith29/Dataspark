import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const PURPLE = "#8B5CF6";

const BASE_SALARIES = [42000, 45000, 45000, 52000, 58000, 63000, 71000, 85000];
const OUTLIER_SALARY = 980000;
const NORMAL_ADD = 67000;

function calcStats(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = arr.reduce((s, v) => s + v, 0) / n;
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
  const freq = {};
  arr.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq));
  const modes = Object.entries(freq)
    .filter(([, f]) => f === maxFreq)
    .map(([v]) => Number(v));
  return { mean, median, modes, sorted };
}

function fmtK(v) {
  return "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v.toFixed(0));
}

const WHEN_ROWS = [
  {
    measure: "Mean",
    use: "Symmetric data, no outliers",
    avoid: "Skewed distributions, outliers present",
    example: "Average test scores in a class",
    color: DS.ind,
  },
  {
    measure: "Median",
    use: "Skewed data, outliers present",
    avoid: "When you need algebraic properties",
    example: "Typical household income",
    color: DS.grn,
  },
  {
    measure: "Mode",
    use: "Categorical data, most-common value",
    avoid: "Continuous data (often not unique)",
    example: "Most popular shoe size",
    color: PURPLE,
  },
];

const SYM_DATASET = [40000, 45000, 50000, 55000, 60000, 65000, 70000];
const SKEW_DATASET = [28000, 31000, 33000, 35000, 38000, 42000, 45000, 310000];

export default function StatMeanMedianModeViz() {
  const [addOutlier, setAddOutlier] = useState(false);
  const [activeTab, setActiveTab] = useState("explorer");

  const dataset = addOutlier
    ? [...BASE_SALARIES, OUTLIER_SALARY]
    : [...BASE_SALARIES, NORMAL_ADD];

  const { mean, median, modes, sorted } = calcStats(dataset);
  const maxVal = sorted[sorted.length - 1];

  const symStats = calcStats(SYM_DATASET);
  const skewStats = calcStats(SKEW_DATASET);

  const tabBtnStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? PURPLE : DS.border}`,
    background: active ? `${PURPLE}22` : "transparent",
    color: active ? PURPLE : DS.t3,
    fontSize: 12,
    fontFamily: "var(--ds-mono), monospace",
    cursor: "pointer",
    transition: "all 0.18s",
  });

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Mean, Median & Mode — Interactive Explorer
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Toggle a CEO-level outlier into the salary dataset and watch how mean, median, and mode respond differently.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button style={tabBtnStyle(activeTab === "explorer")} onClick={() => setActiveTab("explorer")}>Dataset Explorer</button>
        <button style={tabBtnStyle(activeTab === "skew")} onClick={() => setActiveTab("skew")}>Symmetric vs Skewed</button>
        <button style={tabBtnStyle(activeTab === "guide")} onClick={() => setActiveTab("guide")}>When to Use Which</button>
      </div>

      {activeTab === "explorer" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>Add to dataset:</span>
            <button
              onClick={() => setAddOutlier(false)}
              style={{
                padding: "5px 12px", borderRadius: 7, border: `1px solid ${!addOutlier ? DS.grn : DS.border}`,
                background: !addOutlier ? `${DS.grn}20` : "transparent", color: !addOutlier ? DS.grn : DS.t3,
                fontSize: 12, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
              }}
            >
              Normal employee ($67k)
            </button>
            <button
              onClick={() => setAddOutlier(true)}
              style={{
                padding: "5px 12px", borderRadius: 7, border: `1px solid ${addOutlier ? "#F87171" : DS.border}`,
                background: addOutlier ? "rgba(248,113,113,0.15)" : "transparent", color: addOutlier ? "#F87171" : DS.t3,
                fontSize: 12, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
              }}
            >
              CEO outlier ($980k)
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${DS.border}`, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
              Salary dataset ({dataset.length} employees) — sorted ascending
            </div>
            {sorted.map((v, i) => {
              const pct = (v / maxVal) * 100;
              const isOutlier = v === OUTLIER_SALARY;
              const isMode = modes.includes(v);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", width: 64, textAlign: "right", flexShrink: 0 }}>
                    {fmtK(v)}
                  </span>
                  <div style={{ flex: 1, background: DS.border, borderRadius: 3, height: 16, position: "relative" }}>
                    <div
                      style={{
                        width: `${pct}%`, height: "100%", borderRadius: 3,
                        background: isOutlier ? "rgba(248,113,113,0.7)" : isMode ? `${PURPLE}99` : `${DS.ind}88`,
                        transition: "width 0.35s ease",
                      }}
                    />
                  </div>
                  {isMode && (
                    <span style={{ fontSize: 10, color: PURPLE, fontFamily: "var(--ds-mono), monospace", width: 36 }}>mode</span>
                  )}
                  {isOutlier && (
                    <span style={{ fontSize: 10, color: "#F87171", fontFamily: "var(--ds-mono), monospace", width: 36 }}>outlier</span>
                  )}
                  {!isMode && !isOutlier && <span style={{ width: 36 }} />}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Mean", value: fmtK(mean), color: DS.ind, note: addOutlier ? "Heavily distorted" : "Close to median" },
              { label: "Median", value: fmtK(median), color: DS.grn, note: addOutlier ? "Stable — robust" : "Represents center well" },
              { label: "Mode", value: modes.map(fmtK).join(", "), color: PURPLE, note: "Most frequent salary" },
            ].map(({ label, value, color, note }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>{note}</div>
              </div>
            ))}
          </div>

          {addOutlier && (
            <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#FCA5A5", fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
              <strong>Key insight:</strong> The CEO's $980k salary pulled the mean from ~$57k to {fmtK(mean)}, making "average pay" deeply misleading. The median barely moved. For skewed salary data, <strong>median is the honest summary</strong>.
            </div>
          )}
        </div>
      )}

      {activeTab === "skew" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Symmetric distribution", data: SYM_DATASET, stats: symStats, color: DS.grn, note: "Mean ≈ Median — either works" },
              { label: "Right-skewed distribution", data: SKEW_DATASET, stats: skewStats, color: "#F87171", note: "Mean > Median — prefer median" },
            ].map(({ label, data, stats, color, note }) => {
              const maxV = Math.max(...data);
              return (
                <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 10, fontFamily: "var(--ds-mono), monospace" }}>{label}</div>
                  {[...data].sort((a, b) => a - b).map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", width: 52, textAlign: "right" }}>{fmtK(v)}</span>
                      <div style={{ flex: 1, background: DS.border, borderRadius: 2, height: 12 }}>
                        <div style={{ width: `${(v / maxV) * 100}%`, height: "100%", borderRadius: 2, background: `${color}66` }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 11, color: DS.ind, fontFamily: "var(--ds-mono), monospace" }}>mean={fmtK(stats.mean)}</span>
                    <span style={{ fontSize: 11, color: DS.grn, fontFamily: "var(--ds-mono), monospace" }}>med={fmtK(stats.median)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif", marginTop: 6 }}>{note}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, background: `${PURPLE}15`, border: `1px solid ${PURPLE}44`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: DS.t2, lineHeight: 1.55, fontFamily: "var(--ds-sans), sans-serif" }}>
            <strong style={{ color: PURPLE }}>Rule of thumb:</strong> If the mean and median differ by more than ~20% of the standard deviation, the distribution is meaningfully skewed and median is usually the better representative.
          </div>
        </div>
      )}

      {activeTab === "guide" && (
        <div>
          <div style={{ display: "grid", gap: 10 }}>
            {WHEN_ROWS.map(({ measure, use, avoid, example, color }) => (
              <div key={measure} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace", minWidth: 56 }}>{measure}</span>
                  <span style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif" }}>{example}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace", marginBottom: 3 }}>USE WHEN</div>
                    <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>{use}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#F87171", fontFamily: "var(--ds-mono), monospace", marginBottom: 3 }}>AVOID WHEN</div>
                    <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>{avoid}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: "rgba(2,6,23,0.72)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2, lineHeight: 1.9 }}>
            <span style={{ color: DS.dim }}># Quick decision flowchart</span><br />
            Is your data categorical? {"→"} <span style={{ color: PURPLE }}>Mode</span><br />
            Is there a clear outlier or heavy skew? {"→"} <span style={{ color: DS.grn }}>Median</span><br />
            Is your distribution symmetric, no outliers? {"→"} <span style={{ color: DS.ind }}>Mean</span><br />
            Need to compute variance or regression? {"→"} <span style={{ color: DS.ind }}>Mean</span> (algebraically convenient)
          </div>
        </div>
      )}
    </div>
  );
}
