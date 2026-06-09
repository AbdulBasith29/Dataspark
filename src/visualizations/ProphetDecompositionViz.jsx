import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Hardcoded data (50 points each, weeks 1-8) ──────────────────────────────
const N = 50;

const TREND_DATA = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1);
  // Linear growth with a changepoint at t=0.4 (slope increases)
  const base = t < 0.4 ? t * 0.6 : 0.24 + (t - 0.4) * 1.3;
  return 0.1 + base * 0.7;
});

const SEASONALITY_DATA = Array.from({ length: N }, (_, i) => {
  // Weekly period: 7 points per "week" in 50 pts → ~7/50 cycles
  return 0.18 * Math.sin((2 * Math.PI * i) / (N / 8));
});

const HOLIDAY_DATA = Array.from({ length: N }, (_, i) => {
  // Spike at ~week 2 (i≈12), dip at ~week 4 (i≈25), spike at ~week 7 (i≈43)
  let v = 0;
  if (Math.abs(i - 12) <= 1) v = 0.25 * (1 - Math.abs(i - 12) * 0.6);
  if (Math.abs(i - 25) <= 1) v = -0.2 * (1 - Math.abs(i - 25) * 0.6);
  if (Math.abs(i - 43) <= 1) v = 0.22 * (1 - Math.abs(i - 43) * 0.6);
  return v;
});

// Seeded pseudo-random noise
const NOISE_DATA = Array.from({ length: N }, (_, i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5;
  return (x - Math.floor(x) - 0.5) * 0.14;
});

const COMPONENT_COLORS = {
  trend: "#0EA5E9",
  seasonality: "#8B5CF6",
  holiday: "#F59E0B",
  noise: "#6B7280",
};

const COMPONENT_LABELS = {
  trend: "Trend",
  seasonality: "Weekly Seasonality",
  holiday: "Holiday Effect",
  noise: "Noise (ε)",
};

const COMPONENT_DATA = {
  trend: TREND_DATA,
  seasonality: SEASONALITY_DATA,
  holiday: HOLIDAY_DATA,
  noise: NOISE_DATA,
};

const COMPONENT_KEYS = ["trend", "seasonality", "holiday", "noise"];

const CHART_W = 460;
const MINI_H = 56;
const COMBINED_H = 80;
const PAD_X = 8;
const PAD_Y = 6;

function toPoints(data, width, height, padX, padY) {
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  return data
    .map((v, i) => {
      const x = padX + (i / (data.length - 1)) * (width - 2 * padX);
      const y = padY + (1 - (v - minV) / range) * (height - 2 * padY);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function MiniChart({ data, color, height = MINI_H }) {
  return (
    <svg
      width={CHART_W}
      height={height}
      style={{ display: "block", overflow: "visible" }}
    >
      <polyline
        points={toPoints(data, CHART_W, height, PAD_X, PAD_Y)}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CombinedChart({ activeKeys, height = COMBINED_H }) {
  const combined = Array.from({ length: N }, (_, i) =>
    COMPONENT_KEYS.filter((k) => activeKeys.includes(k)).reduce(
      (sum, k) => sum + COMPONENT_DATA[k][i],
      0
    )
  );

  if (activeKeys.length === 0) {
    return (
      <svg width={CHART_W} height={height} style={{ display: "block" }}>
        <line
          x1={PAD_X}
          y1={height / 2}
          x2={CHART_W - PAD_X}
          y2={height / 2}
          stroke="#374151"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      </svg>
    );
  }

  return (
    <svg width={CHART_W} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="combGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area fill under combined line */}
      <polygon
        points={
          toPoints(combined, CHART_W, height, PAD_X, PAD_Y) +
          ` ${(CHART_W - PAD_X).toFixed(1)},${height} ${PAD_X},${height}`
        }
        fill="url(#combGrad)"
      />
      <polyline
        points={toPoints(combined, CHART_W, height, PAD_X, PAD_Y)}
        fill="none"
        stroke="#0EA5E9"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProphetDecompositionViz() {
  const [active, setActive] = useState(["trend", "seasonality", "holiday", "noise"]);

  function toggle(key) {
    setActive((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const containerStyle = {
    fontFamily: "var(--ds-sans), sans-serif",
    background: "rgba(2,6,23,0.72)",
    borderRadius: 12,
    border: "1px solid rgba(14,165,233,0.18)",
    padding: "20px 22px",
    maxWidth: 520,
    margin: "0 auto",
    color: "#E2E8F0",
  };

  const sectionCard = {
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "10px 12px",
    marginBottom: 8,
  };

  const weekLabels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

  return (
    <div style={containerStyle}>
      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>
          Prophet Additive Decomposition
        </div>
        <div
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11.5,
            color: "#94A3B8",
            background: "rgba(14,165,233,0.08)",
            borderRadius: 6,
            padding: "5px 10px",
            display: "inline-block",
          }}
        >
          y(t) = trend(t) + seasonality(t) + holiday(t) + ε(t)
        </div>
      </div>

      {/* Toggle buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {COMPONENT_KEYS.map((key) => {
          const on = active.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 11px",
                borderRadius: 20,
                border: `1.5px solid ${on ? COMPONENT_COLORS[key] : "rgba(255,255,255,0.12)"}`,
                background: on
                  ? `${COMPONENT_COLORS[key]}22`
                  : "rgba(255,255,255,0.03)",
                color: on ? COMPONENT_COLORS[key] : "#6B7280",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: on ? COMPONENT_COLORS[key] : "#374151",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {COMPONENT_LABELS[key]}
            </button>
          );
        })}
      </div>

      {/* Combined forecast */}
      <div style={{ ...sectionCard, border: "1px solid rgba(14,165,233,0.28)", marginBottom: 10 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#0EA5E9",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}
        >
          Combined Forecast ŷ(t)
        </div>
        <CombinedChart activeKeys={active} />
      </div>

      {/* Component mini-charts */}
      {COMPONENT_KEYS.map((key) => {
        const on = active.includes(key);
        return (
          <div
            key={key}
            style={{
              ...sectionCard,
              opacity: on ? 1 : 0.35,
              transition: "opacity 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 24,
                  height: 2.5,
                  borderRadius: 2,
                  background: COMPONENT_COLORS[key],
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: COMPONENT_COLORS[key],
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {COMPONENT_LABELS[key]}
              </span>
            </div>
            <MiniChart data={COMPONENT_DATA[key]} color={COMPONENT_COLORS[key]} />
          </div>
        );
      })}

      {/* x-axis week labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "2px 8px 0",
          marginTop: 2,
        }}
      >
        {weekLabels.map((w) => (
          <span
            key={w}
            style={{
              fontSize: 10,
              color: "#475569",
              fontFamily: "var(--ds-mono), monospace",
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "#475569",
          lineHeight: 1.5,
        }}
      >
        Toggle components to see how each contributes to the final forecast.
        Prophet fits each component independently.
      </div>
    </div>
  );
}
