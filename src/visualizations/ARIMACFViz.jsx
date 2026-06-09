import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants (declared before component — TDZ safety) ---

const BLUE = "#0EA5E9";
const RED = "#F87171";
const AMBER = "#F59E0B";

const MODEL_TYPES = ["AR(2)", "MA(1)", "ARMA(1,1)"];

// Hardcoded ACF/PACF correlation arrays for lags 0–12
// Lag 0 is always 1.0 for ACF by definition; included for visual anchor
const CORR_DATA = {
  "AR(2)": {
    acf:  [ 1.00,  0.72,  0.58,  0.42,  0.30,  0.21,  0.15,  0.11,  0.07,  0.05,  0.03,  0.02,  0.01],
    pacf: [ 1.00,  0.72,  0.31,  0.04, -0.03,  0.02, -0.01,  0.01,  0.00,  0.01, -0.01,  0.00,  0.01],
    description:
      "PACF cuts off sharply after lag 2 — the two large spikes indicate AR(2). ACF decays gradually (tails off). This pattern tells you: set p = 2, q = 0.",
  },
  "MA(1)": {
    acf:  [ 1.00,  0.68,  0.05,  0.03, -0.02,  0.02,  0.01, -0.01,  0.02,  0.00,  0.01, -0.01,  0.00],
    pacf: [ 1.00,  0.68,  0.39,  0.21,  0.11,  0.06,  0.03,  0.01,  0.01,  0.00, -0.01,  0.01,  0.00],
    description:
      "ACF cuts off after lag 1 — only lag 1 is significant. PACF decays gradually. This pattern tells you: set p = 0, q = 1.",
  },
  "ARMA(1,1)": {
    acf:  [ 1.00,  0.63,  0.42,  0.28,  0.19,  0.13,  0.09,  0.06,  0.04,  0.03,  0.02,  0.01,  0.01],
    pacf: [ 1.00,  0.63,  0.27,  0.12,  0.05,  0.02,  0.01,  0.00,  0.01, -0.01,  0.00,  0.01,  0.00],
    description:
      "Both ACF and PACF decay gradually (neither cuts off). This mixed pattern suggests an ARMA process with both AR and MA components — set p ≥ 1, q ≥ 1.",
  },
};

const SIG_THRESHOLD = 0.2; // ±0.2 significance band

// Chart dimensions (pixels)
const CHART_W = 220;
const CHART_H = 140;
const CHART_PAD = { top: 12, bottom: 24, left: 28, right: 8 };

const INNER_W = CHART_W - CHART_PAD.left - CHART_PAD.right;
const INNER_H = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
const NUM_LAGS = 13; // 0..12
const BAR_SLOT = INNER_W / NUM_LAGS;
const BAR_W = Math.max(BAR_SLOT * 0.55, 4);

// Y pixel: correlation 1.0 → top, -1.0 → bottom
function yPx(corr) {
  // map [-1,1] to [INNER_H, 0]
  return INNER_H * (1 - (corr + 1) / 2);
}

const ZERO_Y = yPx(0);
const SIG_Y_POS = yPx(SIG_THRESHOLD);
const SIG_Y_NEG = yPx(-SIG_THRESHOLD);

// ---- Styles ----

const ROOT_STYLE = {
  background: DS.bg,
  borderRadius: DS.radiusMd,
  padding: "18px 20px 16px",
  fontFamily: "var(--ds-sans), sans-serif",
  color: DS.t1,
  maxWidth: 560,
  margin: "0 auto",
  minHeight: 350,
  boxSizing: "border-box",
};

const TITLE_STYLE = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: DS.t3,
  marginBottom: 14,
};

const TOGGLE_ROW = {
  display: "flex",
  gap: 8,
  marginBottom: 18,
};

function toggleBtn(active) {
  return {
    padding: "5px 14px",
    borderRadius: 6,
    border: `1px solid ${active ? BLUE : DS.border}`,
    background: active ? `${BLUE}22` : "rgba(255,255,255,0.03)",
    color: active ? BLUE : DS.t3,
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    fontFamily: "var(--ds-mono), monospace",
    transition: "all 0.15s ease",
    outline: "none",
  };
}

const CHARTS_ROW = {
  display: "flex",
  gap: 16,
  justifyContent: "center",
  marginBottom: 16,
};

const CHART_WRAP = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
};

const CHART_LABEL = {
  fontSize: 11,
  fontWeight: 700,
  color: DS.t3,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const INTERP_BOX = {
  background: "rgba(2,6,23,0.72)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  padding: "10px 14px",
  fontSize: 12,
  color: DS.t2,
  lineHeight: 1.6,
};

const INTERP_HEADER = {
  fontSize: 10,
  fontWeight: 700,
  color: BLUE,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: 4,
};

// ---- Sub-component: SVG chart ----

function CorrChart({ values }) {
  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      style={{ overflow: "visible", display: "block" }}
    >
      <g transform={`translate(${CHART_PAD.left},${CHART_PAD.top})`}>
        {/* Y-axis line */}
        <line
          x1={0} y1={0} x2={0} y2={INNER_H}
          stroke={DS.border}
          strokeWidth={1}
        />
        {/* Zero baseline */}
        <line
          x1={0} y1={ZERO_Y} x2={INNER_W} y2={ZERO_Y}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />
        {/* Significance threshold lines (dashed blue) */}
        <line
          x1={0} y1={SIG_Y_POS} x2={INNER_W} y2={SIG_Y_POS}
          stroke={BLUE}
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.7}
        />
        <line
          x1={0} y1={SIG_Y_NEG} x2={INNER_W} y2={SIG_Y_NEG}
          stroke={BLUE}
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.7}
        />
        {/* Y-axis labels */}
        {[1, 0.5, 0, -0.5, -1].map((v) => (
          <text
            key={v}
            x={-4}
            y={yPx(v) + 3.5}
            textAnchor="end"
            fontSize={8}
            fill={DS.dim}
            fontFamily="var(--ds-mono), monospace"
          >
            {v === 0 ? "0" : v.toFixed(1)}
          </text>
        ))}
        {/* Bars */}
        {values.map((corr, lag) => {
          const cx = lag * BAR_SLOT + BAR_SLOT / 2;
          const barColor = corr >= 0 ? BLUE : RED;
          const barTop = corr >= 0 ? yPx(corr) : ZERO_Y;
          const barH = Math.abs(yPx(corr) - ZERO_Y);
          return (
            <g key={lag}>
              <rect
                x={cx - BAR_W / 2}
                y={barTop}
                width={BAR_W}
                height={Math.max(barH, 1)}
                fill={barColor}
                opacity={Math.abs(corr) > SIG_THRESHOLD ? 0.92 : 0.38}
                rx={1}
              />
              {/* X-axis tick label */}
              <text
                x={cx}
                y={INNER_H + 14}
                textAnchor="middle"
                fontSize={7.5}
                fill={DS.dim}
                fontFamily="var(--ds-mono), monospace"
              >
                {lag}
              </text>
            </g>
          );
        })}
        {/* X-axis bottom line */}
        <line
          x1={0} y1={INNER_H} x2={INNER_W} y2={INNER_H}
          stroke={DS.border}
          strokeWidth={1}
        />
        {/* "Lag" label */}
        <text
          x={INNER_W / 2}
          y={INNER_H + 23}
          textAnchor="middle"
          fontSize={8}
          fill={DS.dim}
          fontFamily="var(--ds-mono), monospace"
        >
          Lag
        </text>
      </g>
    </svg>
  );
}

// ---- Component ----

export default function ARIMACFViz() {
  const [modelType, setModelType] = useState("AR(2)");

  const data = CORR_DATA[modelType];

  return (
    <div style={ROOT_STYLE}>
      <div style={TITLE_STYLE}>ACF &amp; PACF — Pattern Identification</div>

      {/* Model toggle */}
      <div style={TOGGLE_ROW}>
        {MODEL_TYPES.map((m) => (
          <button
            key={m}
            style={toggleBtn(modelType === m)}
            onClick={() => setModelType(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div style={CHARTS_ROW}>
        <div style={CHART_WRAP}>
          <span style={CHART_LABEL}>ACF (Auto-Correlation)</span>
          <CorrChart values={data.acf} />
        </div>
        <div style={CHART_WRAP}>
          <span style={CHART_LABEL}>PACF (Partial Auto-Correlation)</span>
          <CorrChart values={data.pacf} />
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 16,
        justifyContent: "center",
        marginBottom: 12,
        fontSize: 10,
        color: DS.t3,
        fontFamily: "var(--ds-mono), monospace",
      }}>
        <span>
          <span style={{ color: BLUE, fontWeight: 700 }}>■</span> Positive corr
        </span>
        <span>
          <span style={{ color: RED, fontWeight: 700 }}>■</span> Negative corr
        </span>
        <span>
          <span style={{
            display: "inline-block",
            width: 16,
            height: 1,
            borderTop: `1px dashed ${BLUE}`,
            verticalAlign: "middle",
            marginRight: 3,
          }} />
          ±0.2 significance
        </span>
      </div>

      {/* Interpretation */}
      <div style={INTERP_BOX}>
        <div style={INTERP_HEADER}>Interpretation — {modelType}</div>
        {data.description}
      </div>
    </div>
  );
}
