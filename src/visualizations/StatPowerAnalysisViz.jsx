import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── constants ────────────────────────────────────────────────────────────────
const ACCENT = "#8B5CF6";

// Approximate n per group needed for given d, alpha, power (two-sided t-test).
// Uses the formula n ≈ 2 * ((z_alpha/2 + z_power) / d)^2
// z-values from standard normal
const Z_ALPHA = { 0.01: 2.576, 0.05: 1.96, 0.10: 1.645 };
const Z_POWER = { 0.70: 1.036, 0.80: 1.282, 0.90: 1.645 };

function calcN(d, alphaStr, powerStr) {
  const za = Z_ALPHA[alphaStr] || 1.96;
  const zb = Z_POWER[powerStr] || 1.282;
  if (d <= 0) return Infinity;
  return Math.ceil(2 * Math.pow((za + zb) / d, 2));
}

// power for a given n, d, alpha (two-sided)
function calcPower(n, d, alphaStr) {
  const za = Z_ALPHA[alphaStr] || 1.96;
  const z = (d * Math.sqrt(n / 2)) - za;
  // normal CDF approx (same as in HypothesisTesting.jsx)
  function normCdf(x) {
    const sign = x < 0 ? -1 : 1;
    const t1 = Math.abs(x) / Math.sqrt(2);
    const t2 = 1 / (1 + 0.3275911 * t1);
    const erf =
      1 -
      (((((1.061405429 * t2 - 1.453152027) * t2 + 1.421413741) * t2 - 0.284496736) * t2 + 0.254829592) * t2) *
        Math.exp(-t1 * t1);
    return 0.5 * (1 + sign * erf);
  }
  return normCdf(z);
}

const REAL_WORLD_EXAMPLES = [
  {
    label: "Small effect",
    d: 0.2,
    note: "d = 0.2 → needs ~394 per group for 80% power",
    color: "rgba(251,191,36,0.9)",
    n80: 394,
  },
  {
    label: "Medium effect",
    d: 0.5,
    note: "d = 0.5 → needs ~64 per group for 80% power",
    color: DS.ind,
    n80: 64,
  },
  {
    label: "Large effect",
    d: 0.8,
    note: "d = 0.8 → needs ~26 per group for 80% power",
    color: DS.grn,
    n80: 26,
  },
];

const CHECKLIST_ITEMS = [
  { id: "c1", text: "Pre-register significance threshold α before collecting data" },
  { id: "c2", text: "Determine minimum detectable effect from prior work or domain knowledge" },
  { id: "c3", text: "Calculate required n per group using power analysis" },
  { id: "c4", text: "Commit to a pre-specified stopping rule (no peeking)" },
  { id: "c5", text: "Collect full sample before analyzing results" },
  { id: "c6", text: "Interpret non-significant results as 'inconclusive', not 'no effect'" },
];

// ── component ────────────────────────────────────────────────────────────────
export default function StatPowerAnalysisViz() {
  const [d, setD] = useState(0.5);
  const [alphaStr, setAlphaStr] = useState("0.05");
  const [powerStr, setPowerStr] = useState("0.80");
  const [activeTab, setActiveTab] = useState("calculator");
  const [checkedItems, setCheckedItems] = useState(new Set());

  const requiredN = calcN(d, alphaStr, powerStr);

  // power curve data: power vs n for chosen d and alpha
  const powerCurveData = useMemo(() => {
    const points = [];
    const nMax = Math.min(requiredN * 2.5, 600);
    const step = Math.max(1, Math.floor(nMax / 60));
    for (let n = 2; n <= nMax; n += step) {
      points.push({ n, power: calcPower(n, d, alphaStr) });
    }
    return points;
  }, [d, alphaStr, requiredN]);

  const tabStyle = (tab) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${activeTab === tab ? ACCENT : DS.border}`,
    background: activeTab === tab ? `${ACCENT}22` : "transparent",
    color: activeTab === tab ? DS.t1 : DS.t3,
    fontFamily: "var(--ds-mono), monospace",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  });

  function toggleCheck(id) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // SVG power curve dimensions
  const svgW = 360;
  const svgH = 160;
  const padL = 36;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const nMax = powerCurveData.length > 0 ? powerCurveData[powerCurveData.length - 1].n : 100;
  const tx = (n) => padL + (n / nMax) * plotW;
  const ty = (p) => padT + (1 - p) * plotH;

  const pathD = powerCurveData
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${tx(pt.n).toFixed(1)} ${ty(pt.power).toFixed(1)}`)
    .join(" ");

  const targetPowerNum = parseFloat(powerStr);

  return (
    <div style={{ color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Power Analysis &amp; Sample Size
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Calculate required n, explore the power curve, and see why underpowered studies mislead.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button type="button" style={tabStyle("calculator")} onClick={() => setActiveTab("calculator")}>Calculator</button>
        <button type="button" style={tabStyle("examples")} onClick={() => setActiveTab("examples")}>Real-World</button>
        <button type="button" style={tabStyle("checklist")} onClick={() => setActiveTab("checklist")}>Checklist</button>
      </div>

      {activeTab === "calculator" && (
        <div>
          {/* required n callout */}
          <div
            style={{
              background: `${ACCENT}0D`,
              border: `1px solid ${ACCENT}44`,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>
              Required n per group
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: ACCENT, fontFamily: "var(--ds-mono), monospace" }}>
              {requiredN > 9999 ? ">9999" : requiredN}
            </div>
            <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginTop: 2 }}>
              d={d.toFixed(2)} · α={alphaStr} · power={powerStr}
            </div>
          </div>

          {/* power curve SVG */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: 10,
              padding: "10px 8px",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, textAlign: "center" }}>
              Power vs n (d={d.toFixed(2)}, α={alphaStr})
            </div>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", display: "block" }}>
              {/* grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((p) => (
                <g key={p}>
                  <line x1={padL} x2={svgW - padR} y1={ty(p)} y2={ty(p)} stroke={DS.border} strokeWidth={0.5} />
                  <text x={padL - 4} y={ty(p) + 3} fill={DS.t3} fontSize={8} textAnchor="end" fontFamily="var(--ds-mono), monospace">
                    {(p * 100).toFixed(0)}%
                  </text>
                </g>
              ))}
              {/* target power line */}
              <line
                x1={padL}
                x2={svgW - padR}
                y1={ty(targetPowerNum)}
                y2={ty(targetPowerNum)}
                stroke={DS.grn}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text x={svgW - padR + 2} y={ty(targetPowerNum) + 3} fill={DS.grn} fontSize={8} fontFamily="var(--ds-mono), monospace">
                {powerStr}
              </text>
              {/* power curve */}
              {pathD && (
                <path d={pathD} fill="none" stroke={ACCENT} strokeWidth={2} />
              )}
              {/* required n marker */}
              {requiredN <= nMax && (
                <g>
                  <line
                    x1={tx(requiredN)}
                    x2={tx(requiredN)}
                    y1={padT}
                    y2={padT + plotH}
                    stroke={ACCENT}
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                  <text x={tx(requiredN)} y={padT + plotH + 16} fill={ACCENT} fontSize={8} textAnchor="middle" fontFamily="var(--ds-mono), monospace">
                    n={requiredN}
                  </text>
                </g>
              )}
              {/* x-axis label */}
              <text x={padL + plotW / 2} y={svgH} fill={DS.t3} fontSize={8} textAnchor="middle" fontFamily="var(--ds-mono), monospace">
                n per group
              </text>
            </svg>
          </div>

          {/* controls */}
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
              Cohen&apos;s d (effect size) = {d.toFixed(2)}
              <input type="range" min={0.1} max={1.0} step={0.05} value={d} onChange={(e) => setD(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: ACCENT }} />
            </label>
            <div>
              <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Significance α:</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["0.01", "0.05", "0.10"].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAlphaStr(a)}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 6,
                      border: `1px solid ${alphaStr === a ? "rgba(248,113,113,0.7)" : DS.border}`,
                      background: alphaStr === a ? "rgba(248,113,113,0.1)" : "transparent",
                      color: alphaStr === a ? "rgba(252,165,165,1)" : DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Target power:</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["0.70", "0.80", "0.90"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPowerStr(p)}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 6,
                      border: `1px solid ${powerStr === p ? `${DS.grn}77` : DS.border}`,
                      background: powerStr === p ? `${DS.grn}11` : "transparent",
                      color: powerStr === p ? DS.grn : DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* what is power */}
          <div
            style={{
              marginTop: 14,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              color: DS.t3,
              fontFamily: "var(--ds-sans), sans-serif",
              lineHeight: 1.65,
            }}
          >
            <span style={{ color: DS.t1, fontWeight: 600 }}>What is power?</span>
            {" "}Power (1−β) is the probability of detecting a real effect when one truly exists. At 80% power: if the true effect is d={d.toFixed(2)}, you will correctly detect it in ~80% of repeated experiments. The other ~20% produce false negatives (p≥α despite a real effect).
          </div>
        </div>
      )}

      {activeTab === "examples" && (
        <div>
          <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 12, lineHeight: 1.55 }}>
            Real sample size requirements at 80% power, α=0.05 (two-sided t-test):
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {REAL_WORLD_EXAMPLES.map((ex) => (
              <div
                key={ex.label}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${DS.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    background: `${ex.color}15`,
                    border: `1px solid ${ex.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, color: ex.color, fontFamily: "var(--ds-mono), monospace" }}>{ex.n80}</div>
                  <div style={{ fontSize: 8, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>per grp</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ex.color, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>{ex.label} (d={ex.d})</div>
                  <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.5 }}>{ex.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(252,165,165,1)", marginBottom: 6, fontFamily: "var(--ds-sans), sans-serif" }}>
              Underpowered studies waste resources
            </div>
            <div style={{ fontSize: 11, color: DS.t2, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
              A study expecting a small effect (d=0.2) run with only n=50 per group has ~17% power — it will miss the effect 83% of the time. The "no effect found" conclusion is scientifically unreliable. Always calculate n <em>before</em> running the study.
            </div>
            <div style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t3 }}>
              Power at n=50, d=0.2, α=0.05: ~{(calcPower(50, 0.2, "0.05") * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {activeTab === "checklist" && (
        <div>
          <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 12, lineHeight: 1.55 }}>
            Study design checklist — run through this before any experiment:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {CHECKLIST_ITEMS.map((item) => {
              const checked = checkedItems.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    background: checked ? `${DS.grn}0D` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${checked ? `${DS.grn}55` : DS.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${checked ? DS.grn : DS.dim}`,
                      background: checked ? DS.grn : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#020617" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: checked ? DS.t1 : DS.t2, lineHeight: 1.5, fontFamily: "var(--ds-sans), sans-serif" }}>
                    {item.text}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", textAlign: "center" }}>
            {checkedItems.size}/{CHECKLIST_ITEMS.length} completed
            {checkedItems.size === CHECKLIST_ITEMS.length && (
              <span style={{ color: DS.grn, marginLeft: 8 }}>· Study design is rigorous ✓</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
