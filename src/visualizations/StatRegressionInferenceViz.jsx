import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6";
const ACCENT_LT = "#A78BFA";
const GREEN = "#34D399";
const AMBER = "#F59E0B";
const RED = "#F87171";

// SVG geometry
const W = 460;
const H = 300;
const PAD_L = 46;
const PAD_R = 18;
const PAD_T = 18;
const PAD_B = 38;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

// Domain for axes (hours studied → exam score-style framing for research students)
const X_MIN = 0;
const X_MAX = 10;
const Y_MIN = 0;
const Y_MAX = 100;

// Fixed sample dataset: x = hours of sleep, y = anxiety score (research framing)
// Designed so the least-squares line is ~ y = 30 + 5x with realistic scatter.
const DATA = [
  { x: 1, y: 38 },
  { x: 1.5, y: 30 },
  { x: 2, y: 44 },
  { x: 2.5, y: 36 },
  { x: 3, y: 52 },
  { x: 3.5, y: 41 },
  { x: 4, y: 55 },
  { x: 4.5, y: 47 },
  { x: 5, y: 60 },
  { x: 5.5, y: 50 },
  { x: 6, y: 66 },
  { x: 6.5, y: 58 },
  { x: 7, y: 70 },
  { x: 7.5, y: 63 },
  { x: 8, y: 75 },
  { x: 8.5, y: 72 },
  { x: 9, y: 79 },
  { x: 9.5, y: 71 },
];

const N = DATA.length;

// --- Ordinary least squares computed once at module load (deterministic) ---
function ols(points) {
  const n = points.length;
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const p of points) {
    sxy += (p.x - meanX) * (p.y - meanY);
    sxx += (p.x - meanX) ** 2;
    syy += (p.y - meanY) ** 2;
  }
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  // Residual sum of squares
  let ssRes = 0;
  for (const p of points) {
    const pred = intercept + slope * p.x;
    ssRes += (p.y - pred) ** 2;
  }
  const ssTot = syy;
  const r2 = 1 - ssRes / ssTot;
  const k = 1; // one predictor
  const adjR2 = 1 - (1 - r2) * ((n - 1) / (n - k - 1));
  // Standard error of the slope
  const dfResid = n - 2;
  const mse = ssRes / dfResid;
  const seSlope = Math.sqrt(mse / sxx);
  const tStat = slope / seSlope;
  return { slope, intercept, r2, adjR2, seSlope, tStat, meanX, meanY, sxx, mse, dfResid };
}

const FIT = ols(DATA);

// Rough two-sided p-value from a t-statistic (good enough for display at this df).
// Uses a normal approximation tail bound, then a small df correction.
function approxPValue(t, df) {
  const z = Math.abs(t);
  // Normal tail via erfc approximation (Abramowitz & Stegun 7.1.26)
  const erfc = (x) => {
    const tt = 1 / (1 + 0.3275911 * x);
    const y =
      tt *
      (0.254829592 +
        tt * (-0.284496736 + tt * (1.421413741 + tt * (-1.453152027 + tt * 1.061405429))));
    return y * Math.exp(-x * x);
  };
  let p = erfc(z / Math.SQRT2); // two-sided normal p
  // crude inflation for finite df (t has heavier tails)
  p *= 1 + 1.5 / df;
  return Math.min(1, Math.max(0, p));
}

const FIT_P = approxPValue(FIT.tStat, FIT.dfResid);

// Coordinate transforms
const sx = (x) => PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
const sy = (y) => PAD_T + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

// Slider ranges for the manual fit
const SLOPE_MIN = -2;
const SLOPE_MAX = 12;
const INT_MIN = 0;
const INT_MAX = 60;

const panelBg = "rgba(2,6,23,0.72)";
const cardBg = "rgba(255,255,255,0.02)";

function fmt(n, d = 2) {
  return Number(n).toFixed(d);
}

function fmtP(p) {
  if (p < 0.001) return "< 0.001";
  return p.toFixed(3);
}

// --- Component ---------------------------------------------------------------

export default function StatRegressionInferenceViz() {
  const [mode, setMode] = useState("fit"); // "fit" = adjust line | "ls" = least-squares
  const [slope, setSlope] = useState(3);
  const [intercept, setIntercept] = useState(35);
  const [showResiduals, setShowResiduals] = useState(true);
  const [showBand, setShowBand] = useState(false);
  const [secondPredictor, setSecondPredictor] = useState(false);

  // Which line is currently displayed
  const usingLS = mode === "ls";
  const b1 = usingLS ? FIT.slope : slope;
  const b0 = usingLS ? FIT.intercept : intercept;

  // Sum of squared residuals for the *displayed* line
  let ssResDisplayed = 0;
  for (const p of DATA) {
    const pred = b0 + b1 * p.x;
    ssResDisplayed += (p.y - pred) ** 2;
  }
  const isOptimal = Math.abs(ssResDisplayed - FIT.mse * FIT.dfResid) < 1;

  // Line endpoints
  const x0 = X_MIN;
  const x1 = X_MAX;
  const lineY0 = b0 + b1 * x0;
  const lineY1 = b0 + b1 * x1;

  // Confidence band: widen away from mean x (schematic, scaled by SE)
  const bandPoints = [];
  const bandHalf = (x) => {
    const t = 1.96; // ~95%
    const widthAtMean = t * Math.sqrt(FIT.mse / N);
    const spread = 1 + ((x - FIT.meanX) ** 2) / FIT.sxx;
    return widthAtMean * Math.sqrt(spread) * 1.6; // visual scale
  };
  const STEP = (X_MAX - X_MIN) / 30;
  for (let x = X_MIN; x <= X_MAX + 0.001; x += STEP) {
    bandPoints.push({ x, hi: b0 + b1 * x + bandHalf(x), lo: b0 + b1 * x - bandHalf(x) });
  }
  const bandPath =
    "M " +
    bandPoints.map((p) => `${fmt(sx(p.x), 1)} ${fmt(sy(p.hi), 1)}`).join(" L ") +
    " L " +
    bandPoints
      .slice()
      .reverse()
      .map((p) => `${fmt(sx(p.x), 1)} ${fmt(sy(p.lo), 1)}`)
      .join(" L ") +
    " Z";

  const labelStyle = {
    fontSize: 10,
    fontFamily: "var(--ds-mono), monospace",
    color: DS.t3,
  };

  const btn = (active, color) => ({
    padding: "5px 12px",
    borderRadius: 7,
    border: `1px solid ${active ? color : DS.border}`,
    background: active ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
    color: active ? color : DS.t3,
    fontSize: 11,
    fontFamily: "var(--ds-mono), monospace",
    cursor: "pointer",
    fontWeight: active ? 700 : 400,
    transition: "all 0.15s",
  });

  // Axis ticks
  const xTicks = [0, 2, 4, 6, 8, 10];
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Regression for Inference
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        Fit a line to explain how a predictor relates to an outcome. We care about
        <em> interpreting the coefficient</em> (its size, sign, and significance) — not predicting new points.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button type="button" style={btn(mode === "fit", ACCENT)} onClick={() => setMode("fit")}>
          Adjust the line yourself
        </button>
        <button type="button" style={btn(mode === "ls", GREEN)} onClick={() => setMode("ls")}>
          Show least-squares fit
        </button>
      </div>

      {/* Scatter plot */}
      <div
        style={{
          background: panelBg,
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Axes */}
          <line x1={PAD_L} y1={sy(Y_MIN)} x2={sx(X_MAX)} y2={sy(Y_MIN)} stroke={DS.border} strokeWidth="1" />
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={sy(Y_MIN)} stroke={DS.border} strokeWidth="1" />

          {/* Gridlines + ticks */}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={PAD_L} y1={sy(t)} x2={sx(X_MAX)} y2={sy(t)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={PAD_L - 8} y={sy(t) + 3} textAnchor="end" fill={DS.dim} fontSize="9" fontFamily="var(--ds-mono), monospace">
                {t}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={`x${t}`} x={sx(t)} y={sy(Y_MIN) + 14} textAnchor="middle" fill={DS.dim} fontSize="9" fontFamily="var(--ds-mono), monospace">
              {t}
            </text>
          ))}
          <text x={(PAD_L + sx(X_MAX)) / 2} y={H - 4} textAnchor="middle" fill={DS.t3} fontSize="10" fontFamily="var(--ds-mono), monospace">
            X₁ = hours of sleep
          </text>
          <text
            x={12}
            y={(PAD_T + sy(Y_MIN)) / 2}
            textAnchor="middle"
            fill={DS.t3}
            fontSize="10"
            fontFamily="var(--ds-mono), monospace"
            transform={`rotate(-90 12 ${(PAD_T + sy(Y_MIN)) / 2})`}
          >
            Y = wellbeing score
          </text>

          {/* Confidence band */}
          {showBand && (
            <path d={bandPath} fill="rgba(139,92,246,0.14)" stroke="none" />
          )}

          {/* Residual segments */}
          {showResiduals &&
            DATA.map((p, i) => {
              const pred = b0 + b1 * p.x;
              return (
                <line
                  key={`r${i}`}
                  x1={sx(p.x)}
                  y1={sy(p.y)}
                  x2={sx(p.x)}
                  y2={sy(pred)}
                  stroke={p.y >= pred ? AMBER : RED}
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                  opacity="0.7"
                />
              );
            })}

          {/* Fitted line */}
          <line
            x1={sx(x0)}
            y1={sy(lineY0)}
            x2={sx(x1)}
            y2={sy(lineY1)}
            stroke={usingLS ? GREEN : ACCENT}
            strokeWidth="2.4"
          />

          {/* Data points */}
          {DATA.map((p, i) => (
            <circle key={`p${i}`} cx={sx(p.x)} cy={sy(p.y)} r="4" fill={ACCENT_LT} stroke={panelBg} strokeWidth="1" />
          ))}
        </svg>

        {/* Toggles under plot */}
        <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={showResiduals} onChange={(e) => setShowResiduals(e.target.checked)} />
            Show residuals (vertical distances)
          </label>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={showBand} onChange={(e) => setShowBand(e.target.checked)} />
            Show 95% confidence band
          </label>
        </div>
      </div>

      {/* Sliders (only in manual fit mode) */}
      {mode === "fit" && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${DS.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 12,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>Slope β₁ (change in Y per +1 hour sleep)</span>
              <span style={{ color: ACCENT, fontWeight: 700 }}>{fmt(slope)}</span>
            </div>
            <input
              type="range"
              min={SLOPE_MIN}
              max={SLOPE_MAX}
              step={0.1}
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: ACCENT }}
            />
          </div>
          <div>
            <div style={{ ...labelStyle, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>Intercept β₀ (predicted Y at X = 0)</span>
              <span style={{ color: ACCENT, fontWeight: 700 }}>{fmt(intercept)}</span>
            </div>
            <input
              type="range"
              min={INT_MIN}
              max={INT_MAX}
              step={0.5}
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: ACCENT }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              color: isOptimal ? GREEN : DS.t3,
              lineHeight: 1.5,
            }}
          >
            Your line's residual sum of squares: <strong style={{ color: isOptimal ? GREEN : DS.t1 }}>{fmt(ssResDisplayed, 1)}</strong>
            {"  "}
            {isOptimal
              ? "— this is the minimum. You found the least-squares line."
              : `— least-squares minimum is ${fmt(FIT.mse * FIT.dfResid, 1)}. Lower is a better fit.`}
          </div>
        </div>
      )}

      {/* Regression output table — the inference payload */}
      <div
        style={{
          background: panelBg,
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 12,
        }}
      >
        <div style={{ ...labelStyle, marginBottom: 8, color: DS.t2, fontWeight: 700 }}>
          Regression output {usingLS ? "(least-squares fit)" : "(your line)"}
        </div>
        <div
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 14,
            color: usingLS ? GREEN : ACCENT,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 10,
          }}
        >
          Ŷ = {fmt(b0)} + {fmt(b1)}·X₁{secondPredictor ? "  + 3.10·X₂" : ""}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11, fontFamily: "var(--ds-mono), monospace" }}>
            <thead>
              <tr>
                {["Term", "Coef (β)", "Std. error", "t", "p-value"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 8px",
                      borderBottom: `1px solid ${DS.border}`,
                      color: DS.t3,
                      textAlign: h === "Term" ? "left" : "right",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px", color: DS.t2, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>Intercept</td>
                <td style={{ padding: "6px 8px", color: DS.t1, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{fmt(b0)}</td>
                <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>3.9</td>
                <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{fmt(b0 / 3.9, 1)}</td>
                <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>—</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 8px", color: DS.t2, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>X₁ (sleep)</td>
                <td style={{ padding: "6px 8px", color: usingLS ? GREEN : ACCENT, fontWeight: 700, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{fmt(b1)}</td>
                <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{fmt(FIT.seSlope)}</td>
                <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{fmt(b1 / FIT.seSlope, 1)}</td>
                <td
                  style={{
                    padding: "6px 8px",
                    textAlign: "right",
                    fontWeight: 700,
                    color: approxPValue(b1 / FIT.seSlope, FIT.dfResid) < 0.05 ? GREEN : AMBER,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {fmtP(approxPValue(b1 / FIT.seSlope, FIT.dfResid))}
                </td>
              </tr>
              {secondPredictor && (
                <tr>
                  <td style={{ padding: "6px 8px", color: DS.t2, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>X₂ (exercise)</td>
                  <td style={{ padding: "6px 8px", color: ACCENT_LT, fontWeight: 700, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>3.10</td>
                  <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>1.22</td>
                  <td style={{ padding: "6px 8px", color: DS.t3, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>2.5</td>
                  <td style={{ padding: "6px 8px", color: GREEN, fontWeight: 700, textAlign: "right", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>0.024</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Fit statistics */}
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {[
            { k: "R²", v: fmt(FIT.r2, 3), note: "variance in Y explained" },
            { k: "Adjusted R²", v: fmt(FIT.adjR2, 3), note: "penalised for predictors" },
            { k: "SE(β₁)", v: fmt(FIT.seSlope), note: "uncertainty in slope" },
            { k: "df residual", v: String(FIT.dfResid), note: "n − k − 1" },
          ].map((s) => (
            <div
              key={s.k}
              style={{
                flex: "1 1 90px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{s.k}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT_LT, fontFamily: "var(--ds-mono), monospace" }}>{s.v}</div>
              <div style={{ fontSize: 9, color: DS.dim }}>{s.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Second predictor toggle + interpretation */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${secondPredictor ? "rgba(139,92,246,0.3)" : DS.border}`,
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 12,
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: secondPredictor ? 10 : 0 }}>
          <input type="checkbox" checked={secondPredictor} onChange={(e) => setSecondPredictor(e.target.checked)} />
          <span style={{ fontSize: 12, fontWeight: 700, color: DS.t2 }}>
            Add a second predictor X₂ (weekly exercise) → multiple regression
          </span>
        </label>
        {secondPredictor && (
          <p style={{ fontSize: 12, color: DS.t2, lineHeight: 1.6, margin: 0 }}>
            Now β₁ = <strong style={{ color: ACCENT }}>{fmt(b1)}</strong> is the effect of an extra hour of
            sleep on wellbeing <em>holding exercise constant</em> — the slope <em>among people with the same
            exercise level</em>. Multiple regression lets you isolate the unique contribution of each predictor.
            If sleep and exercise were correlated, omitting X₂ would let β₁ absorb part of exercise's effect
            (omitted-variable bias). "Controlling for X₂" means we are comparing like with like.
          </p>
        )}
      </div>

      <p style={{ fontSize: 11, color: DS.dim, lineHeight: 1.6, fontFamily: "var(--ds-sans), sans-serif" }}>
        Inference tip: report β with its standard error and p-value, then interpret it in plain units —
        "each extra hour of sleep is associated with a {fmt(FIT.slope, 1)}-point higher wellbeing score,
        holding exercise constant (p {fmtP(FIT_P)})." Statistical significance answers <em>is the effect
        distinguishable from zero?</em>, not <em>is the effect large or important?</em>
      </p>
    </div>
  );
}
