import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const PURPLE = "#8B5CF6";

// Precomputed scatter datasets for correlation presets
const SCATTER_PRESETS = {
  strong_pos: {
    label: "Strong positive (r ≈ +0.95)",
    r: 0.95,
    points: [
      [1,2],[2,4],[3,5],[4,7],[5,9],[6,10],[7,12],[8,14],[9,15],[10,17],
      [2,3],[4,6],[6,11],[8,13],[3,4],[7,11],[5,8],[9,16],[1,3],[10,18],
    ],
    color: DS.grn,
    xLabel: "Study hours", yLabel: "Exam score",
  },
  weak_pos: {
    label: "Weak positive (r ≈ +0.40)",
    r: 0.40,
    points: [
      [1,5],[2,3],[3,7],[4,4],[5,8],[6,5],[7,9],[8,6],[9,11],[10,9],
      [2,6],[4,8],[6,4],[8,10],[3,2],[7,7],[5,10],[9,8],[1,7],[10,12],
    ],
    color: DS.ind,
    xLabel: "Coffee cups", yLabel: "Productivity",
  },
  zero: {
    label: "No correlation (r ≈ 0)",
    r: 0.0,
    points: [
      [1,8],[2,2],[3,11],[4,5],[5,9],[6,3],[7,12],[8,6],[9,1],[10,10],
      [2,7],[4,11],[6,2],[8,9],[3,5],[7,3],[5,8],[9,12],[1,4],[10,6],
    ],
    color: DS.t3,
    xLabel: "Shoe size", yLabel: "IQ score",
  },
  strong_neg: {
    label: "Strong negative (r ≈ −0.92)",
    r: -0.92,
    points: [
      [1,18],[2,16],[3,14],[4,13],[5,11],[6,9],[7,8],[8,6],[9,4],[10,2],
      [2,17],[4,12],[6,10],[8,5],[3,15],[7,7],[5,12],[9,3],[1,19],[10,3],
    ],
    color: "#F87171",
    xLabel: "Price ($100s)", yLabel: "Units sold",
  },
};

const SPURIOUS = [
  {
    title: "Ice cream & drowning deaths",
    r: "+0.97",
    x: "Ice cream sales (units/week)",
    y: "Drowning deaths (per week)",
    confound: "Summer temperature — hot weather drives both ice cream sales AND swimming",
    color: "#FB923C",
  },
  {
    title: "Nicolas Cage films & pool drownings",
    r: "+0.87",
    x: "Nicolas Cage films released (per year)",
    y: "Pool drowning deaths (US)",
    confound: "Pure coincidence over a small time window — spurious pattern, no mechanism",
    color: PURPLE,
  },
  {
    title: "Organic food sales & autism diagnoses",
    r: "+0.99",
    x: "US organic food sales ($B/year)",
    y: "Autism diagnoses (per 1000)",
    confound: "Both trends grew over the same period; confounders include improved diagnosis, changing definitions, and population growth",
    color: DS.ind,
  },
];

const CAUSAL_STEPS = [
  { step: "1. Check mechanism", detail: "Is there a plausible biological / physical / economic causal pathway?" },
  { step: "2. Rule out confounders", detail: "Is there a lurking variable that drives both X and Y?" },
  { step: "3. Check temporal order", detail: "Does X always precede Y? Causation requires time ordering." },
  { step: "4. Run an experiment", detail: "Randomized controlled trial (RCT) or natural experiment / IV." },
  { step: "5. Replicate", detail: "Consistent across different populations, time periods, and methods?" },
];

function pearsonR(points) {
  const n = points.length;
  if (n < 2) return 0;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom < 1e-10 ? 0 : num / denom;
}

export default function StatCorrelationViz() {
  const [presetKey, setPresetKey] = useState("strong_pos");
  const [activeTab, setActiveTab] = useState("scatter");
  const [spuriousIdx, setSpuriousIdx] = useState(0);

  const preset = SCATTER_PRESETS[presetKey];
  const computedR = pearsonR(preset.points);

  const W = 300, H = 220;
  const pad = 32;
  const plotW = W - pad * 2;
  const plotH = H - pad * 2;
  const xs = preset.points.map((p) => p[0]);
  const ys = preset.points.map((p) => p[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const tx = (x) => pad + ((x - xMin) / (xMax - xMin)) * plotW;
  const ty = (y) => pad + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  // Regression line
  const n = preset.points.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sx2 = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sx2 += (xs[i] - mx) ** 2; }
  const slope = sx2 < 1e-10 ? 0 : sxy / sx2;
  const intercept = my - slope * mx;
  const regY = (x) => slope * x + intercept;

  const tabBtnStyle = (active) => ({
    padding: "6px 14px", borderRadius: 8,
    border: `1px solid ${active ? PURPLE : DS.border}`,
    background: active ? `${PURPLE}22` : "transparent",
    color: active ? PURPLE : DS.t3,
    fontSize: 12, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
  });

  const rColor = (r) => r > 0.6 ? DS.grn : r < -0.6 ? "#F87171" : r > 0.2 ? DS.ind : r < -0.2 ? "#FB923C" : DS.t3;

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Correlation vs Causation — Visual Explorer
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        See Pearson r live, explore spurious correlations, and learn the framework for establishing causation.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button style={tabBtnStyle(activeTab === "scatter")} onClick={() => setActiveTab("scatter")}>Scatter Plot</button>
        <button style={tabBtnStyle(activeTab === "spurious")} onClick={() => setActiveTab("spurious")}>Spurious Correlations</button>
        <button style={tabBtnStyle(activeTab === "causation")} onClick={() => setActiveTab("causation")}>Establishing Causation</button>
      </div>

      {activeTab === "scatter" && (
        <div>
          {/* Preset selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.entries(SCATTER_PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setPresetKey(key)}
                style={{
                  padding: "5px 10px", borderRadius: 7,
                  border: `1px solid ${presetKey === key ? p.color : DS.border}`,
                  background: presetKey === key ? `${p.color}20` : "transparent",
                  color: presetKey === key ? p.color : DS.t3,
                  fontSize: 11, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
                }}
              >
                {key.replace("_", " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start" }}>
            {/* SVG scatter plot */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 12, padding: 8 }}>
              <svg width={W} height={H} style={{ display: "block" }}>
                {/* Axes */}
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={DS.border} strokeWidth={1} />
                <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={DS.border} strokeWidth={1} />
                {/* Axis labels */}
                <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={9} fill={DS.t3} fontFamily="var(--ds-mono), monospace">{preset.xLabel}</text>
                <text x={10} y={H / 2} textAnchor="middle" fontSize={9} fill={DS.t3} fontFamily="var(--ds-mono), monospace" transform={`rotate(-90, 10, ${H / 2})`}>{preset.yLabel}</text>
                {/* Regression line */}
                {Math.abs(computedR) > 0.1 && (
                  <line
                    x1={tx(xMin)} y1={ty(regY(xMin))}
                    x2={tx(xMax)} y2={ty(regY(xMax))}
                    stroke={preset.color} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.6}
                  />
                )}
                {/* Points */}
                {preset.points.map(([x, y], i) => (
                  <circle key={i} cx={tx(x)} cy={ty(y)} r={5} fill={preset.color} opacity={0.75} />
                ))}
              </svg>
            </div>

            {/* Stats panel */}
            <div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Pearson r (computed)</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: rColor(computedR), fontFamily: "var(--ds-mono), monospace" }}>
                  {computedR >= 0 ? "+" : ""}{computedR.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: DS.t3, marginTop: 4, fontFamily: "var(--ds-sans), sans-serif" }}>{preset.label}</div>
              </div>

              <div style={{ background: "rgba(2,6,23,0.72)", borderRadius: 10, padding: "10px 12px", fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t2, lineHeight: 1.8 }}>
                <span style={{ color: DS.dim }}># Interpreting |r|</span><br />
                <span style={{ color: DS.grn }}>0.8–1.0</span> Strong<br />
                <span style={{ color: DS.ind }}>0.5–0.8</span> Moderate<br />
                <span style={{ color: DS.t3 }}>0.2–0.5</span> Weak<br />
                <span style={{ color: DS.dim }}>0.0–0.2</span> Negligible
              </div>

              <div style={{ marginTop: 10, background: `${PURPLE}15`, border: `1px solid ${PURPLE}33`, borderRadius: 10, padding: "10px 12px", fontSize: 11, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
                <strong style={{ color: PURPLE }}>Remember:</strong> r measures linear association only. A perfect non-linear relationship can have r = 0.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "spurious" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {SPURIOUS.map((s, i) => (
              <button
                key={i}
                onClick={() => setSpuriousIdx(i)}
                style={{
                  padding: "5px 10px", borderRadius: 7,
                  border: `1px solid ${spuriousIdx === i ? s.color : DS.border}`,
                  background: spuriousIdx === i ? `${s.color}20` : "transparent",
                  color: spuriousIdx === i ? s.color : DS.t3,
                  fontSize: 11, fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
                }}
              >
                Example {i + 1}
              </button>
            ))}
          </div>

          {(() => {
            const s = SPURIOUS[spuriousIdx];
            return (
              <div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginBottom: 10, fontFamily: "var(--ds-sans), sans-serif" }}>{s.title}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>X</div>
                      <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>{s.x}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "var(--ds-mono), monospace" }}>r = {s.r}</div>
                      <div style={{ fontSize: 10, color: DS.t3, marginTop: 2 }}>correlation</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>Y</div>
                      <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>{s.y}</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: "#F87171", fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>ACTUAL EXPLANATION (NOT causation)</div>
                    <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>{s.confound}</div>
                  </div>
                </div>

                <div style={{ background: `${PURPLE}15`, border: `1px solid ${PURPLE}44`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: DS.t2, lineHeight: 1.55, fontFamily: "var(--ds-sans), sans-serif" }}>
                  <strong style={{ color: PURPLE }}>The lesson:</strong> High correlation is a hypothesis generator, not a conclusion. Every correlation demands the question: "Is there a confounding variable, reverse causation, or pure coincidence at play?"
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "causation" && (
        <div>
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {CAUSAL_STEPS.map(({ step, detail }) => (
              <div key={step} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ background: `${PURPLE}22`, border: `1px solid ${PURPLE}55`, borderRadius: 6, padding: "4px 8px", fontSize: 11, color: PURPLE, fontFamily: "var(--ds-mono), monospace", flexShrink: 0, whiteSpace: "nowrap" }}>{step}</div>
                <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>{detail}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(2,6,23,0.72)", borderRadius: 10, padding: "12px 16px", fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2, lineHeight: 1.9 }}>
            <span style={{ color: DS.dim }}># I see correlation — what next?</span><br />
            <span style={{ color: DS.grn }}>Report r + CI</span> — don't just say "strong correlation"<br />
            <span style={{ color: DS.ind }}>Identify confounders</span> — domain knowledge is key here<br />
            <span style={{ color: PURPLE }}>Propose an experiment</span> — A/B test or natural experiment<br />
            <span style={{ color: "#FB923C" }}>Check directionality</span> — could Y cause X instead?<br />
            <span style={{ color: DS.t3 }}>Don't ship features</span> on correlation alone — measure causally
          </div>
          <div style={{ marginTop: 10, background: `${DS.grn}15`, border: `1px solid ${DS.grn}44`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: DS.t2, lineHeight: 1.5, fontFamily: "var(--ds-sans), sans-serif" }}>
            <strong style={{ color: DS.grn }}>Gold standard:</strong> RCTs establish causation by randomly assigning treatment, making X and Y independent of all confounders. When RCTs are infeasible, instrumental variables and difference-in-differences are the next best options.
          </div>
        </div>
      )}
    </div>
  );
}
