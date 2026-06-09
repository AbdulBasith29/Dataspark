import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const BLUE = "#0EA5E9";
const PURPLE = "#8B5CF6";
const BLUE_DIM = "rgba(14,165,233,0.15)";
const PURPLE_DIM = "rgba(139,92,246,0.15)";

const CONFIGS = [
  { id: "accuracy",  label: "Accuracy-Optimized" },
  { id: "diversity", label: "Diversity-Optimized" },
  { id: "balanced",  label: "Balanced" },
];

const METRICS = [
  { id: "ndcg",        label: "NDCG@10",       group: "accuracy" },
  { id: "prec",        label: "Precision@10",   group: "accuracy" },
  { id: "coverage",    label: "Coverage",       group: "beyond" },
  { id: "diversity",   label: "Diversity",      group: "beyond" },
  { id: "novelty",     label: "Novelty",        group: "beyond" },
  { id: "serendipity", label: "Serendipity",    group: "beyond" },
];

const SCORES = {
  accuracy:  { ndcg: 92, prec: 88, coverage: 23, diversity: 31, novelty: 28, serendipity: 15 },
  diversity: { ndcg: 71, prec: 65, coverage: 84, diversity: 88, novelty: 79, serendipity: 67 },
  balanced:  { ndcg: 82, prec: 78, coverage: 61, diversity: 65, novelty: 58, serendipity: 42 },
};

const INSIGHTS = {
  accuracy:  "High accuracy but users report 'filter bubble' — all recommendations feel similar after 2 weeks.",
  diversity: "Rich variety but CTR is 18% lower — some recommendations feel too unexpected.",
  balanced:  "Best long-term engagement — users discover new content while staying engaged.",
};

const INSIGHT_ICONS = {
  accuracy:  "⚠",
  diversity: "⚠",
  balanced:  "✓",
};

const INSIGHT_COLORS = {
  accuracy:  "#F59E0B",
  diversity: "#F59E0B",
  balanced:  "#10B981",
};

export default function RecEvalMetricsViz() {
  const [selected, setSelected] = useState("balanced");

  const scores = SCORES[selected];

  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        color: "#e2e8f0",
        maxWidth: 620,
        margin: "0 auto",
        padding: "20px 16px",
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 4, marginTop: 0 }}>
        Recommender Evaluation: Accuracy vs. Beyond-Accuracy
      </h3>
      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 0, marginBottom: 16 }}>
        Switch configurations to see how optimizing for accuracy affects diversity, novelty, and serendipity.
      </p>

      {/* ── Config toggles ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {CONFIGS.map((c) => {
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: `1.5px solid ${active ? BLUE : "rgba(100,116,139,0.35)"}`,
                background: active ? BLUE_DIM : "rgba(255,255,255,0.03)",
                color: active ? BLUE : "#94a3b8",
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ── Group headers ── */}
      <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Accuracy metrics */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: BLUE,
              textTransform: "uppercase",
              marginBottom: 10,
              paddingBottom: 4,
              borderBottom: `1px solid rgba(14,165,233,0.25)`,
            }}
          >
            Accuracy Metrics
          </div>
          {METRICS.filter((m) => m.group === "accuracy").map((m) => (
            <MetricBar
              key={m.id}
              label={m.label}
              value={scores[m.id]}
              color={BLUE}
              dimColor={BLUE_DIM}
            />
          ))}
        </div>

        {/* Beyond-accuracy metrics */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: PURPLE,
              textTransform: "uppercase",
              marginBottom: 10,
              paddingBottom: 4,
              borderBottom: `1px solid rgba(139,92,246,0.25)`,
            }}
          >
            Beyond-Accuracy Metrics
          </div>
          {METRICS.filter((m) => m.group === "beyond").map((m) => (
            <MetricBar
              key={m.id}
              label={m.label}
              value={scores[m.id]}
              color={PURPLE}
              dimColor={PURPLE_DIM}
            />
          ))}
        </div>
      </div>

      {/* ── Radar-style summary dots ── */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: "1px solid rgba(100,116,139,0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 14,
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>SUMMARY</span>
        {METRICS.map((m) => {
          const val = scores[m.id];
          const color = m.group === "accuracy" ? BLUE : PURPLE;
          const tier = val >= 75 ? "HIGH" : val >= 50 ? "MID" : "LOW";
          const tierColor = val >= 75 ? "#10B981" : val >= 50 ? "#F59E0B" : "#EF4444";
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 9, color: "#64748b" }}>{m.label}</span>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  background: `${color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                }}
              >
                {val}
              </span>
              <span style={{ fontSize: 9, color: tierColor, fontWeight: 700 }}>{tier}</span>
            </div>
          );
        })}
      </div>

      {/* ── User experience insight ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${INSIGHT_COLORS[selected]}40`,
          borderLeft: `3px solid ${INSIGHT_COLORS[selected]}`,
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: INSIGHT_COLORS[selected],
            lineHeight: 1.1,
            flexShrink: 0,
          }}
        >
          {INSIGHT_ICONS[selected]}
        </span>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: INSIGHT_COLORS[selected],
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 4,
            }}
          >
            User Experience Insight
          </div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
            {INSIGHTS[selected]}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: single metric bar ──────────────────────────────────
function MetricBar({ label, value, color, dimColor }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>{label}</span>
        <span
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            fontWeight: 700,
            color,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 4,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}
