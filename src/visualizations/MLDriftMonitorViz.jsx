import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#0EA5E9";
const ORANGE = "#F97316";
const GREEN = "#34D399";
const YELLOW = "#FBBF24";
const RED = "#EF4444";

const FEATURES = {
  transaction_amount: {
    label: "transaction_amount",
    psi: 0.31,
    training: [4, 9, 16, 22, 20, 14, 8, 4, 2, 1],
    production: [2, 4, 8, 12, 14, 18, 18, 12, 7, 5],
  },
  session_duration: {
    label: "session_duration",
    psi: 0.12,
    training: [3, 8, 14, 20, 22, 16, 10, 5, 1, 1],
    production: [2, 6, 11, 17, 20, 18, 13, 8, 3, 2],
  },
  user_age: {
    label: "user_age",
    psi: 0.05,
    training: [5, 10, 15, 20, 19, 14, 9, 5, 2, 1],
    production: [5, 11, 15, 19, 19, 14, 9, 5, 2, 1],
  },
};

const PSI_STATUS = (psi) => {
  if (psi < 0.1) return { label: "Stable ✓", color: GREEN };
  if (psi <= 0.2) return { label: "Warning ⚠", color: YELLOW };
  return { label: "Retrain Signal !", color: RED };
};

const BIN_LABELS = ["0–10", "10–20", "20–30", "30–40", "40–50", "50–60", "60–70", "70–80", "80–90", "90–100"];

export default function MLDriftMonitorViz() {
  const [selectedFeature, setSelectedFeature] = useState("transaction_amount");

  const feature = FEATURES[selectedFeature];
  const status = PSI_STATUS(feature.psi);

  const maxVal = Math.max(...feature.training, ...feature.production);

  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        background: "rgba(2,6,23,0.72)",
        borderRadius: 12,
        padding: "20px 20px 16px",
        color: "#E2E8F0",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          Data Drift Monitor
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Compare training vs production distributions to detect drift
        </div>
      </div>

      {/* Feature selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.keys(FEATURES).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedFeature(key)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: `1px solid ${selectedFeature === key ? ACCENT : "rgba(255,255,255,0.15)"}`,
              background: selectedFeature === key ? `rgba(14,165,233,0.18)` : "rgba(255,255,255,0.04)",
              color: selectedFeature === key ? ACCENT : "rgba(255,255,255,0.6)",
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* PSI badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          padding: "8px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${status.color}44`,
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginRight: 6 }}>PSI Score</span>
          <span
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 18,
              fontWeight: 700,
              color: status.color,
            }}
          >
            {feature.psi.toFixed(2)}
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            padding: "3px 10px",
            borderRadius: 20,
            background: `${status.color}22`,
            border: `1px solid ${status.color}66`,
            fontSize: 12,
            fontWeight: 600,
            color: status.color,
          }}
        >
          {status.label}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        {[
          { color: ACCENT, label: "Training" },
          { color: ORANGE, label: "Production" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, opacity: 0.8 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 8,
          padding: "12px 10px 6px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 100 }}>
          {feature.training.map((trainVal, i) => {
            const prodVal = feature.production[i];
            const trainH = (trainVal / maxVal) * 90;
            const prodH = (prodVal / maxVal) * 90;
            return (
              <div
                key={i}
                style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 1, justifyContent: "center" }}
              >
                <div
                  style={{
                    width: "45%",
                    height: trainH,
                    background: ACCENT,
                    opacity: 0.75,
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
                <div
                  style={{
                    width: "45%",
                    height: prodH,
                    background: ORANGE,
                    opacity: 0.75,
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* X-axis labels (sample) */}
        <div style={{ display: "flex", marginTop: 4 }}>
          {BIN_LABELS.map((lbl, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 8,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "var(--ds-mono), monospace",
                overflow: "hidden",
              }}
            >
              {i % 3 === 0 ? lbl.split("–")[0] : ""}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
          Percentile bins (%)
        </div>
      </div>

      {/* PSI formula */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          borderRadius: 8,
          padding: "10px 14px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          PSI Formula
        </div>
        <div
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.02em",
          }}
        >
          PSI = Σ (Actual% − Expected%) × ln(Actual% / Expected%)
        </div>
        <div style={{ marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { range: "PSI < 0.10", label: "Stable", color: GREEN },
            { range: "0.10 – 0.20", label: "Warning", color: YELLOW },
            { range: "PSI > 0.20", label: "Retrain", color: RED },
          ].map(({ range, label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "var(--ds-mono), monospace" }}>
                {range} → {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
