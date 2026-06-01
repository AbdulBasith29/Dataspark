import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const PURPLE = "#8B5CF6";

const NORMAL_DATA = [12, 15, 18, 21, 24, 26, 28, 30, 31, 33, 35, 38, 41, 44, 47];
const OUTLIER_DATA = [12, 15, 18, 21, 24, 26, 28, 30, 31, 33, 35, 38, 41, 44, 97];

function quartiles(sorted) {
  const n = sorted.length;
  const median = (arr) => {
    const m = arr.length;
    return m % 2 === 0 ? (arr[m / 2 - 1] + arr[m / 2]) / 2 : arr[Math.floor(m / 2)];
  };
  const q2 = median(sorted);
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = n % 2 === 0 ? sorted.slice(n / 2) : sorted.slice(Math.ceil(n / 2));
  const q1 = median(lowerHalf);
  const q3 = median(upperHalf);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  return { q1, q2, q3, iqr, lowerFence, upperFence };
}

function percentileRank(sorted, value) {
  const below = sorted.filter((v) => v < value).length;
  return Math.round((below / sorted.length) * 100);
}

const PERCENTILE_EXAMPLES = [
  { label: "P10 — Low end", color: "#F87171", desc: "10% of values fall below this point" },
  { label: "P25 (Q1) — First quartile", color: "#FB923C", desc: "Lower fence of the IQR box" },
  { label: "P50 (Q2) — Median", color: DS.grn, desc: "The middle value; robust to outliers" },
  { label: "P75 (Q3) — Third quartile", color: DS.ind, desc: "Upper fence of the IQR box" },
  { label: "P90 — High end", color: PURPLE, desc: "90% of values fall below this point" },
];

export default function StatPercentileIQRViz() {
  const [useOutlier, setUseOutlier] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeTab, setActiveTab] = useState("boxplot");

  const data = useOutlier ? OUTLIER_DATA : NORMAL_DATA;
  const sorted = [...data].sort((a, b) => a - b);
  const { q1, q2, q3, iqr, lowerFence, upperFence } = quartiles(sorted);

  const minVal = Math.min(...sorted);
  const maxVal = Math.max(...sorted);
  const plotMin = Math.min(minVal, lowerFence) - 4;
  const plotMax = Math.max(maxVal, upperFence) + 4;
  const plotRange = plotMax - plotMin;

  const toPercent = (v) => ((v - plotMin) / plotRange) * 100;

  const isOutlier = (v) => v < lowerFence || v > upperFence;
  const whiskerLo = sorted.find((v) => v >= lowerFence) ?? minVal;
  const whiskerHi = [...sorted].reverse().find((v) => v <= upperFence) ?? maxVal;

  const tabBtnStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? PURPLE : DS.border}`,
    background: active ? `${PURPLE}22` : "transparent",
    color: active ? PURPLE : DS.t3,
    fontSize: 12,
    fontFamily: "var(--ds-mono), monospace",
    cursor: "pointer",
  });

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Percentiles, IQR & Outlier Detection
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Explore quartiles, the interquartile range, and Tukey fence outlier detection on a live dataset.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button style={tabBtnStyle(activeTab === "boxplot")} onClick={() => setActiveTab("boxplot")}>Box Plot</button>
        <button style={tabBtnStyle(activeTab === "values")} onClick={() => setActiveTab("values")}>Value Inspector</button>
        <button style={tabBtnStyle(activeTab === "concepts")} onClick={() => setActiveTab("concepts")}>Concepts</button>
      </div>

      {/* Dataset toggle — shown in all tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>Dataset:</span>
        <button
          onClick={() => setUseOutlier(false)}
          style={{
            padding: "5px 12px", borderRadius: 7, border: `1px solid ${!useOutlier ? DS.grn : DS.border}`,
            background: !useOutlier ? `${DS.grn}20` : "transparent", color: !useOutlier ? DS.grn : DS.t3,
            fontSize: 12, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
          }}
        >
          Normal (no outliers)
        </button>
        <button
          onClick={() => setUseOutlier(true)}
          style={{
            padding: "5px 12px", borderRadius: 7, border: `1px solid ${useOutlier ? "#F87171" : DS.border}`,
            background: useOutlier ? "rgba(248,113,113,0.15)" : "transparent", color: useOutlier ? "#F87171" : DS.t3,
            fontSize: 12, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
          }}
        >
          With extreme outlier (97)
        </button>
      </div>

      {activeTab === "boxplot" && (
        <div>
          {/* Stats summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
            {[
              { label: "Q1", value: q1, color: "#FB923C" },
              { label: "Q2 (Median)", value: q2, color: DS.grn },
              { label: "Q3", value: q3, color: DS.ind },
              { label: "IQR = Q3 - Q1", value: iqr.toFixed(1), color: PURPLE, raw: true },
            ].map(({ label, value, color, raw }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace" }}>{raw ? value : value.toFixed(1)}</div>
              </div>
            ))}
          </div>

          {/* Box plot */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 12, padding: "24px 20px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 16 }}>Box plot (Tukey style)</div>
            <div style={{ position: "relative", height: 80 }}>
              {/* Axis line */}
              <div style={{ position: "absolute", top: 52, left: 0, right: 0, height: 1, background: DS.border }} />

              {/* Lower fence dotted line */}
              <div style={{
                position: "absolute", top: 20, left: `${toPercent(lowerFence)}%`,
                width: 1, height: 40, background: "#F87171", opacity: 0.6,
                borderLeft: "1px dashed #F87171",
              }} />
              <div style={{ position: "absolute", top: 8, left: `${toPercent(lowerFence)}%`, transform: "translateX(-50%)", fontSize: 9, color: "#F87171", fontFamily: "var(--ds-mono), monospace", whiteSpace: "nowrap" }}>
                fence={lowerFence.toFixed(0)}
              </div>

              {/* Upper fence dotted line */}
              <div style={{
                position: "absolute", top: 20, left: `${toPercent(upperFence)}%`,
                width: 1, height: 40, background: "#F87171", opacity: 0.6,
                borderLeft: "1px dashed #F87171",
              }} />
              <div style={{ position: "absolute", top: 8, left: `${toPercent(upperFence)}%`, transform: "translateX(-50%)", fontSize: 9, color: "#F87171", fontFamily: "var(--ds-mono), monospace", whiteSpace: "nowrap" }}>
                fence={upperFence.toFixed(0)}
              </div>

              {/* Whisker lo */}
              <div style={{ position: "absolute", top: 36, left: `${toPercent(whiskerLo)}%`, width: `${toPercent(q1) - toPercent(whiskerLo)}%`, height: 2, background: DS.t3 }} />
              <div style={{ position: "absolute", top: 28, left: `${toPercent(whiskerLo)}%`, width: 1, height: 18, background: DS.t3 }} />

              {/* IQR box */}
              <div style={{
                position: "absolute", top: 24,
                left: `${toPercent(q1)}%`,
                width: `${toPercent(q3) - toPercent(q1)}%`,
                height: 28,
                background: `${PURPLE}30`,
                border: `1px solid ${PURPLE}88`,
                borderRadius: 3,
              }} />

              {/* Median line */}
              <div style={{
                position: "absolute", top: 24,
                left: `${toPercent(q2)}%`,
                width: 2, height: 28,
                background: DS.grn,
              }} />

              {/* Whisker hi */}
              <div style={{ position: "absolute", top: 36, left: `${toPercent(q3)}%`, width: `${toPercent(whiskerHi) - toPercent(q3)}%`, height: 2, background: DS.t3 }} />
              <div style={{ position: "absolute", top: 28, left: `${toPercent(whiskerHi)}%`, width: 1, height: 18, background: DS.t3 }} />

              {/* Data points */}
              {sorted.map((v, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute", top: 44,
                    left: `${toPercent(v)}%`,
                    width: 8, height: 8, borderRadius: "50%",
                    background: isOutlier(v) ? "#F87171" : `${DS.ind}cc`,
                    transform: "translateX(-4px)",
                    border: isOutlier(v) ? "1px solid #EF4444" : "none",
                    zIndex: 2,
                  }}
                  title={`Value: ${v}`}
                />
              ))}

              {/* Q labels */}
              <div style={{ position: "absolute", top: 60, left: `${toPercent(q1)}%`, transform: "translateX(-50%)", fontSize: 9, color: "#FB923C", fontFamily: "var(--ds-mono), monospace" }}>Q1={q1}</div>
              <div style={{ position: "absolute", top: 60, left: `${toPercent(q2)}%`, transform: "translateX(-50%)", fontSize: 9, color: DS.grn, fontFamily: "var(--ds-mono), monospace" }}>Q2={q2}</div>
              <div style={{ position: "absolute", top: 60, left: `${toPercent(q3)}%`, transform: "translateX(-50%)", fontSize: 9, color: DS.ind, fontFamily: "var(--ds-mono), monospace" }}>Q3={q3}</div>
            </div>
          </div>

          {/* Fence calculation */}
          <div style={{ background: "rgba(2,6,23,0.72)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2, lineHeight: 1.9 }}>
            <span style={{ color: DS.dim }}># Tukey fence calculation</span><br />
            IQR = Q3 - Q1 = {q3} - {q1} = <span style={{ color: PURPLE }}>{iqr.toFixed(1)}</span><br />
            Lower fence = Q1 - 1.5 × IQR = {q1} - {(1.5 * iqr).toFixed(1)} = <span style={{ color: "#F87171" }}>{lowerFence.toFixed(1)}</span><br />
            Upper fence = Q3 + 1.5 × IQR = {q3} + {(1.5 * iqr).toFixed(1)} = <span style={{ color: "#F87171" }}>{upperFence.toFixed(1)}</span><br />
            <span style={{ color: DS.dim }}># Points outside fences are flagged as outliers</span>
          </div>

          {useOutlier && (
            <div style={{ marginTop: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#FCA5A5", fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
              <strong>Outlier detected:</strong> Value 97 exceeds the upper fence of {upperFence.toFixed(1)}. By Tukey's rule it is flagged as an outlier. Note that IQR itself barely changed — it is resistant to outliers by design.
            </div>
          )}
        </div>
      )}

      {activeTab === "values" && (
        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 12 }}>
              Sorted values — hover for percentile rank
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sorted.map((v, i) => {
                const pRank = percentileRank(sorted, v);
                const inQ1 = v <= q1;
                const inIQR = v > q1 && v <= q3;
                const inQ3 = v > q3 && !isOutlier(v);
                const out = isOutlier(v);
                const isQ2 = v === q2;
                const boxColor = out ? "#F87171" : isQ2 ? DS.grn : inQ1 ? "#FB923C" : inIQR ? `${PURPLE}cc` : inQ3 ? DS.ind : DS.t3;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      padding: "8px 12px", borderRadius: 8,
                      border: `1px solid ${hoveredIdx === i ? boxColor : DS.border}`,
                      background: hoveredIdx === i ? `${boxColor}20` : "rgba(255,255,255,0.02)",
                      color: boxColor,
                      fontSize: 13, fontWeight: 600,
                      fontFamily: "var(--ds-mono), monospace",
                      cursor: "default",
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                  >
                    {v}
                    {hoveredIdx === i && (
                      <div style={{
                        position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
                        background: "rgba(6,8,20,0.95)", border: `1px solid ${DS.border}`, borderRadius: 7,
                        padding: "6px 10px", fontSize: 10, color: DS.t2, whiteSpace: "nowrap", zIndex: 10,
                        fontFamily: "var(--ds-mono), monospace",
                      }}>
                        P{pRank} · {out ? "OUTLIER" : isQ2 ? "Median" : inQ1 ? "Q1 zone" : inIQR ? "IQR zone" : "Q3 zone"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Lower fence", value: lowerFence.toFixed(1), color: "#F87171" },
              { label: "Upper fence", value: upperFence.toFixed(1), color: "#F87171" },
              { label: "Outliers", value: sorted.filter(isOutlier).length.toString(), color: sorted.filter(isOutlier).length > 0 ? "#F87171" : DS.grn },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "concepts" && (
        <div>
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {PERCENTILE_EXAMPLES.map(({ label, color, desc }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 36, borderRadius: 3, background: color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(2,6,23,0.72)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2, lineHeight: 1.9 }}>
            <span style={{ color: DS.dim }}># Real-world applications</span><br />
            <span style={{ color: PURPLE }}>P90 response time</span>: "90% of requests complete under 850ms"<br />
            <span style={{ color: DS.grn }}>Median salary</span>: More representative than mean for skewed pay<br />
            <span style={{ color: "#FB923C" }}>IQR for anomaly detection</span>: Robust because it ignores the tails<br />
            <span style={{ color: DS.ind }}>Growth percentiles</span>: "Your child is in the 75th percentile for height"
          </div>
        </div>
      )}
    </div>
  );
}
