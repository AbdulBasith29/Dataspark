import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6";
const ACCENT_LT = "#A78BFA";
const AMBER = "#F59E0B";
const GREEN = "#34D399";
const RED = "#F87171";

const PANEL = "rgba(2,6,23,0.72)";
const CARD = "rgba(255,255,255,0.02)";

// Fixed group colors (up to 4 groups)
const GROUP_COLORS = [ACCENT_LT, GREEN, AMBER, "#60A5FA"];
const GROUP_LABELS = ["A", "B", "C", "D"];

// Mean / spread adjustment steppers
const MEAN_STEP = 4;
const SPREAD_STEP = 1;
const MEAN_MIN = 20;
const MEAN_MAX = 90;
const SPREAD_MIN = 2;
const SPREAD_MAX = 18;
const N_PER_GROUP = 20; // assumed sample size per group for df / MS math

// Initial one-way state: 3 groups, separated means, moderate spread
const INITIAL_GROUPS = [
  { mean: 45, spread: 8 },
  { mean: 55, spread: 8 },
  { mean: 65, spread: 8 },
];

// Tukey critical-difference scaling factor (approximate q for α=0.05).
// We use a simple conceptual threshold: a pair "differs" if the gap between
// means exceeds a critical difference driven by within-group spread.
const TUKEY_Q = 3.5;

// SVG geometry
const SVG_W = 460;
const SVG_H = 170;
const AXIS_MIN = 10;
const AXIS_MAX = 100;

// Factorial 2x2 base cell means (rows = FactorA levels, cols = FactorB levels)
// Two presets toggled by the "interaction" switch.
const FACTORIAL_PRESETS = {
  parallel: {
    label: "No interaction (parallel)",
    // A1B1, A1B2 / A2B1, A2B2
    cells: [
      [40, 55],
      [55, 70],
    ],
  },
  crossing: {
    label: "Interaction (crossing)",
    cells: [
      [40, 65],
      [65, 40],
    ],
  },
};

// --- Pure helpers (declared before component) ---

function gaussian(x, mean, spread) {
  const z = (x - mean) / spread;
  return Math.exp(-0.5 * z * z);
}

function computeAnova(groups) {
  const k = groups.length;
  const n = N_PER_GROUP;
  const N = k * n;
  const grand = groups.reduce((s, g) => s + g.mean, 0) / k;

  // Between-group sum of squares: n * Σ (groupMean - grand)^2
  const ssBetween = n * groups.reduce((s, g) => s + (g.mean - grand) ** 2, 0);
  // Within-group sum of squares: Σ (n-1) * variance, variance ≈ spread^2
  const ssWithin = groups.reduce((s, g) => s + (n - 1) * g.spread ** 2, 0);

  const dfBetween = k - 1;
  const dfWithin = N - k;

  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const F = msWithin > 0 ? msBetween / msWithin : 0;

  const ssTotal = ssBetween + ssWithin;
  const etaSq = ssTotal > 0 ? ssBetween / ssTotal : 0;

  return {
    k,
    n,
    N,
    grand,
    ssBetween,
    ssWithin,
    ssTotal,
    dfBetween,
    dfWithin,
    msBetween,
    msWithin,
    F,
    etaSq,
  };
}

// Approximate F critical value for α=0.05 by (df1, df2). Small lookup is
// enough for a conceptual "significant?" verdict.
function fCritApprox(df1, df2) {
  // Rough values for common small df1 with df2 around 50-80.
  const table = { 1: 4.0, 2: 3.15, 3: 2.75, 4: 2.5 };
  return table[df1] || 2.5;
}

function xToPx(x) {
  return ((x - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * (SVG_W - 20) + 10;
}

// --- Component ---

export default function StatAnovaViz() {
  const [mode, setMode] = useState("oneway"); // "oneway" | "factorial"
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [factorialPreset, setFactorialPreset] = useState("parallel");

  const anova = computeAnova(groups);
  const fCrit = fCritApprox(anova.dfBetween, anova.dfWithin);
  const significant = anova.F > fCrit;

  // Critical difference for Tukey: scales with pooled within-group spread.
  const pooledSpread = Math.sqrt(anova.msWithin);
  const critDiff = (TUKEY_Q * pooledSpread) / Math.sqrt(N_PER_GROUP);

  const adjustMean = (i, delta) => {
    setGroups((prev) =>
      prev.map((g, idx) =>
        idx === i
          ? { ...g, mean: Math.max(MEAN_MIN, Math.min(MEAN_MAX, g.mean + delta)) }
          : g
      )
    );
  };
  const adjustSpread = (i, delta) => {
    setGroups((prev) =>
      prev.map((g, idx) =>
        idx === i
          ? { ...g, spread: Math.max(SPREAD_MIN, Math.min(SPREAD_MAX, g.spread + delta)) }
          : g
      )
    );
  };
  const addGroup = () => {
    if (groups.length >= 4) return;
    setGroups((prev) => [...prev, { mean: 60, spread: 8 }]);
  };
  const removeGroup = () => {
    if (groups.length <= 3) return;
    setGroups((prev) => prev.slice(0, -1));
  };

  // SVG curves
  const samples = 80;
  const curves = groups.map((g, gi) => {
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const x = AXIS_MIN + (i / samples) * (AXIS_MAX - AXIS_MIN);
      const y = gaussian(x, g.mean, g.spread);
      pts.push([xToPx(x), SVG_H - 24 - y * (SVG_H - 50)]);
    }
    return { gi, pts, mean: g.mean };
  });
  const grandPx = xToPx(anova.grand);

  const preset = FACTORIAL_PRESETS[factorialPreset];

  // Factorial line plot geometry: x = Factor B level (1,2), two lines = Factor A levels
  const factX = (col) => 90 + col * 230;
  const factY = (val) => 130 - ((val - 30) / 50) * 100;

  const labelCss = {
    fontSize: 11,
    fontFamily: "var(--ds-mono), monospace",
    color: DS.t3,
  };

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        ANOVA: Variance Decomposition Lab
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        Adjust group means and spread to see how the F-ratio = MS_between / MS_within
        responds. Toggle to a 2×2 factorial design to read main effects and interaction.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "oneway", label: "One-way ANOVA" },
          { id: "factorial", label: "Factorial (2×2)" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: `1px solid ${mode === m.id ? ACCENT : DS.border}`,
              background: mode === m.id ? "rgba(139,92,246,0.14)" : CARD,
              color: mode === m.id ? ACCENT_LT : DS.t3,
              fontSize: 12,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: mode === m.id ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "oneway" && (
        <>
          {/* Group steppers */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {groups.map((g, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 130px",
                  background: CARD,
                  border: `1px solid ${DS.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: GROUP_COLORS[i],
                    marginBottom: 8,
                    fontFamily: "var(--ds-mono), monospace",
                  }}
                >
                  Group {GROUP_LABELS[i]}
                </div>

                <div style={labelCss}>Mean: {g.mean}</div>
                <div style={{ display: "flex", gap: 6, margin: "4px 0 8px" }}>
                  <Stepper onClick={() => adjustMean(i, -MEAN_STEP)} symbol="−" />
                  <Stepper onClick={() => adjustMean(i, MEAN_STEP)} symbol="+" />
                </div>

                <div style={labelCss}>Spread (SD): {g.spread}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <Stepper onClick={() => adjustSpread(i, -SPREAD_STEP)} symbol="−" />
                  <Stepper onClick={() => adjustSpread(i, SPREAD_STEP)} symbol="+" />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <SmallBtn onClick={addGroup} disabled={groups.length >= 4} label="+ Add group" />
            <SmallBtn
              onClick={removeGroup}
              disabled={groups.length <= 3}
              label="− Remove group"
            />
          </div>

          {/* SVG distributions */}
          <div
            style={{
              background: PANEL,
              border: `1px solid ${DS.border}`,
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: "block" }}>
              {/* grand mean line (between-group reference) */}
              <line
                x1={grandPx}
                y1={10}
                x2={grandPx}
                y2={SVG_H - 24}
                stroke={DS.dim}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={grandPx + 4} y={20} fill={DS.dim} fontSize="9" fontFamily="monospace">
                grand mean
              </text>

              {curves.map((c) => {
                const d = c.pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
                const col = GROUP_COLORS[c.gi];
                return (
                  <g key={c.gi}>
                    <path d={d} fill="none" stroke={col} strokeWidth="2" opacity="0.9" />
                    <line
                      x1={xToPx(c.mean)}
                      y1={SVG_H - 24}
                      x2={xToPx(c.mean)}
                      y2={SVG_H - 34}
                      stroke={col}
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* axis */}
              <line
                x1={10}
                y1={SVG_H - 24}
                x2={SVG_W - 10}
                y2={SVG_H - 24}
                stroke={DS.border}
                strokeWidth="1"
              />
            </svg>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                fontSize: 10,
                fontFamily: "var(--ds-mono), monospace",
                color: DS.t3,
                marginTop: 4,
              }}
            >
              {groups.map((g, i) => (
                <span key={i} style={{ color: GROUP_COLORS[i] }}>
                  ■ Group {GROUP_LABELS[i]} (μ={g.mean}, sd={g.spread})
                </span>
              ))}
            </div>
          </div>

          {/* F-ratio readout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <StatBox
              label="Between-group"
              lines={[
                `SS = ${anova.ssBetween.toFixed(0)}`,
                `df = ${anova.dfBetween}`,
                `MS = ${anova.msBetween.toFixed(1)}`,
              ]}
              color={ACCENT_LT}
            />
            <StatBox
              label="Within-group"
              lines={[
                `SS = ${anova.ssWithin.toFixed(0)}`,
                `df = ${anova.dfWithin}`,
                `MS = ${anova.msWithin.toFixed(1)}`,
              ]}
              color={DS.t3}
            />
            <StatBox
              label="η² (effect size)"
              lines={[
                `${(anova.etaSq * 100).toFixed(1)}%`,
                "of variance",
                "explained by group",
              ]}
              color={anova.etaSq > 0.14 ? GREEN : AMBER}
            />
          </div>

          <div
            style={{
              background: significant ? "rgba(52,211,153,0.08)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${significant ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontFamily: "var(--ds-mono), monospace",
                color: significant ? GREEN : AMBER,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              F({anova.dfBetween}, {anova.dfWithin}) = {anova.F.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.55 }}>
              F_crit ≈ {fCrit.toFixed(2)} at α = 0.05.{" "}
              {significant ? (
                <strong style={{ color: GREEN }}>
                  Significant — reject H₀ (at least one group mean differs). Run a post-hoc test.
                </strong>
              ) : (
                <strong style={{ color: AMBER }}>
                  Not significant — between-group variance is small relative to within-group noise.
                </strong>
              )}
            </div>
          </div>

          {/* Tukey HSD grid */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${DS.border}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: DS.t2,
                marginBottom: 4,
              }}
            >
              Tukey HSD pairwise comparisons
            </div>
            <div style={{ fontSize: 11, color: DS.t3, marginBottom: 10, lineHeight: 1.5 }}>
              Critical difference ≈ {critDiff.toFixed(1)}. A pair is flagged as differing when the
              gap between group means exceeds this threshold (controls family-wise error).
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  fontSize: 11,
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: "5px 9px", color: DS.dim }}></th>
                    {groups.map((g, j) => (
                      <th key={j} style={{ padding: "5px 9px", color: GROUP_COLORS[j] }}>
                        {GROUP_LABELS[j]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((gi, i) => (
                    <tr key={i}>
                      <td style={{ padding: "5px 9px", color: GROUP_COLORS[i], fontWeight: 700 }}>
                        {GROUP_LABELS[i]}
                      </td>
                      {groups.map((gj, j) => {
                        if (i === j)
                          return (
                            <td
                              key={j}
                              style={{
                                padding: "5px 9px",
                                color: DS.dim,
                                textAlign: "center",
                              }}
                            >
                              —
                            </td>
                          );
                        const gap = Math.abs(groups[i].mean - groups[j].mean);
                        const differs = gap > critDiff;
                        return (
                          <td
                            key={j}
                            style={{
                              padding: "5px 9px",
                              textAlign: "center",
                              color: differs ? GREEN : DS.dim,
                              background: differs ? "rgba(52,211,153,0.12)" : "transparent",
                              fontWeight: differs ? 700 : 400,
                            }}
                            title={`|Δ| = ${gap.toFixed(0)}`}
                          >
                            {differs ? "✓" : "·"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 10, color: DS.dim, marginTop: 8 }}>
              ✓ = pair differs significantly · · = no significant difference
            </div>
          </div>
        </>
      )}

      {mode === "factorial" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.entries(FACTORIAL_PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFactorialPreset(key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1px solid ${factorialPreset === key ? ACCENT : DS.border}`,
                  background: factorialPreset === key ? "rgba(139,92,246,0.14)" : CARD,
                  color: factorialPreset === key ? ACCENT_LT : DS.t3,
                  fontSize: 11,
                  fontFamily: "var(--ds-mono), monospace",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div
            style={{
              background: PANEL,
              border: `1px solid ${DS.border}`,
              borderRadius: 12,
              padding: 12,
              marginBottom: 14,
            }}
          >
            <svg width="100%" viewBox="0 0 460 160" style={{ display: "block" }}>
              {/* axes */}
              <line x1={70} y1={20} x2={70} y2={130} stroke={DS.border} strokeWidth="1" />
              <line x1={70} y1={130} x2={400} y2={130} stroke={DS.border} strokeWidth="1" />
              <text x={90} y={148} fill={DS.t3} fontSize="10" fontFamily="monospace">
                Factor B = Low
              </text>
              <text x={300} y={148} fill={DS.t3} fontSize="10" fontFamily="monospace">
                Factor B = High
              </text>
              <text
                x={20}
                y={75}
                fill={DS.t3}
                fontSize="10"
                fontFamily="monospace"
                transform="rotate(-90 20 75)"
              >
                Outcome mean
              </text>

              {/* two lines = Factor A levels */}
              {[0, 1].map((row) => {
                const col = row === 0 ? ACCENT_LT : GREEN;
                const v0 = preset.cells[row][0];
                const v1 = preset.cells[row][1];
                return (
                  <g key={row}>
                    <line
                      x1={factX(0)}
                      y1={factY(v0)}
                      x2={factX(1)}
                      y2={factY(v1)}
                      stroke={col}
                      strokeWidth="2.5"
                    />
                    <circle cx={factX(0)} cy={factY(v0)} r="4" fill={col} />
                    <circle cx={factX(1)} cy={factY(v1)} r="4" fill={col} />
                    <text
                      x={factX(1) + 8}
                      y={factY(v1) + 4}
                      fill={col}
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      A{row + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              background: CARD,
              border: `1px solid ${DS.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT_LT, marginBottom: 6 }}>
              {factorialPreset === "parallel"
                ? "Parallel lines → no interaction"
                : "Crossing lines → significant interaction"}
            </div>
            <p style={{ fontSize: 12, color: DS.t2, lineHeight: 1.6, margin: 0 }}>
              {factorialPreset === "parallel" ? (
                <>
                  Both lines rise by the same amount from Low → High. The effect of Factor B is the
                  same regardless of Factor A's level. You can interpret each{" "}
                  <strong style={{ color: DS.t1 }}>main effect</strong> independently: Factor A
                  (gap between the two lines) and Factor B (overall upward slope).
                </>
              ) : (
                <>
                  The lines cross: Factor B raises the outcome for A1 but lowers it for A2. The
                  effect of one factor <strong style={{ color: DS.t1 }}>depends</strong> on the
                  level of the other. When a significant interaction is present, main effects can be{" "}
                  <strong style={{ color: RED }}>misleading</strong> — interpret the interaction
                  first.
                </>
              )}
            </p>
          </div>
        </>
      )}

      <p
        style={{
          fontSize: 11,
          color: DS.dim,
          lineHeight: 1.6,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        Interview tip: A significant F only says <em>at least one</em> group differs — always
        follow with a post-hoc test (Tukey HSD) and report effect size (η²). In factorial designs,
        check the interaction before interpreting main effects.
      </p>
    </div>
  );
}

// --- Small presentational helpers (after main component is fine — they are
//     referenced via JSX at render time, not at module-eval time) ---

function Stepper({ onClick, symbol }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 30,
        height: 26,
        borderRadius: 6,
        border: `1px solid ${DS.border}`,
        background: "rgba(139,92,246,0.10)",
        color: ACCENT_LT,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {symbol}
    </button>
  );
}

function SmallBtn({ onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 13px",
        borderRadius: 8,
        border: `1px solid ${DS.border}`,
        background: disabled ? "rgba(255,255,255,0.02)" : CARD,
        color: disabled ? DS.dim : DS.t3,
        fontSize: 11,
        fontFamily: "var(--ds-mono), monospace",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function StatBox({ label, lines, color }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${DS.border}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: DS.dim,
          fontFamily: "var(--ds-mono), monospace",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            fontSize: i === 0 ? 15 : 11,
            fontWeight: i === 0 ? 700 : 400,
            color: i === 0 ? color : DS.t3,
            fontFamily: "var(--ds-mono), monospace",
            lineHeight: 1.5,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}
