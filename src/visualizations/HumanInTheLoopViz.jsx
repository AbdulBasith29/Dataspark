import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const GREEN = "#34D399";
const AMBER = "#FBBF24";
const RED = "#F87171";
const PURPLE = "#A78BFA";

// Pipeline stages where a checkpoint can be placed
const PIPELINE_STEPS = [
  { id: "input", label: "User Request", fixed: true },
  { id: "preGen", label: "Pre-Generation", checkpointId: "preGen" },
  { id: "generation", label: "LLM Generation", fixed: true },
  { id: "postGen", label: "Post-Generation", checkpointId: "postGen" },
  { id: "confidence", label: "Confidence Gate", checkpointId: "confidence" },
  { id: "action", label: "Action Executed", fixed: true },
  { id: "feedback", label: "Feedback Loop", checkpointId: "feedback" },
];

const CHECKPOINTS = {
  none: {
    label: "No Checkpoint",
    description: "Fully automated — the model's output goes straight to action with no human involvement.",
    metrics: { latency: 95, cost: 90, errorCatch: 10, trust: 20 },
  },
  preGen: {
    label: "Pre-Generation Approval",
    description: "A human approves the request/plan BEFORE the model generates anything (e.g. approving a prompt template or scope of action).",
    metrics: { latency: 35, cost: 55, errorCatch: 55, trust: 65 },
    note: "Catches bad requests early — cheapest place to stop a mistake — but cannot catch generation-time errors like hallucination.",
  },
  postGen: {
    label: "Post-Generation Review",
    description: "A human reviews the model's full output before it takes effect — the classic 'review queue' pattern.",
    metrics: { latency: 25, cost: 35, errorCatch: 90, trust: 85 },
    note: "Maximum safety, maximum bottleneck. Every single output waits on a human — throughput suffers most here.",
  },
  confidence: {
    label: "Escalation on Low Confidence",
    description: "Most outputs auto-process; only low-confidence predictions route to a human (confidence-gated automation).",
    metrics: { latency: 75, cost: 70, errorCatch: 70, trust: 70 },
    note: "Balances throughput and safety. Threshold tuning is critical — too high lets bad outputs slip through unreviewed.",
  },
  feedback: {
    label: "Feedback Loop to Retrain",
    description: "No pre-action checkpoint — humans correct/rate outputs after the fact, and corrections feed back into retraining.",
    metrics: { latency: 90, cost: 75, errorCatch: 30, trust: 45 },
    note: "Improves the model over time but provides zero protection against the CURRENT error — it's a flywheel, not a safety net.",
  },
};

const METRIC_DEFS = [
  { id: "latency", label: "Latency", goodDirection: "high", color: CYAN, unit: "faster →" },
  { id: "cost", label: "Cost Efficiency", goodDirection: "high", color: PURPLE, unit: "cheaper →" },
  { id: "errorCatch", label: "Error-Catch Rate", goodDirection: "high", color: GREEN, unit: "safer →" },
  { id: "trust", label: "User Trust", goodDirection: "high", color: AMBER, unit: "higher →" },
];

function metricColor(value) {
  if (value >= 70) return GREEN;
  if (value >= 40) return AMBER;
  return RED;
}

export default function HumanInTheLoopViz() {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("none");

  const config = CHECKPOINTS[selectedCheckpoint];

  const stepCheckpointMap = useMemo(() => {
    const map = {};
    PIPELINE_STEPS.forEach((step) => {
      if (step.checkpointId) {
        map[step.checkpointId] = step.id;
      }
    });
    return map;
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: DS.t1,
            letterSpacing: "-0.3px",
          }}
        >
          Place the Human Checkpoint
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Choose where in the pipeline a human gets involved — and watch the metric trade-offs shift.
        </p>
      </div>

      {/* Pipeline diagram */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "18px 14px",
          marginBottom: 16,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 14,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          LLM Product Pipeline
        </div>
        <div style={{ display: "flex", alignItems: "center", minWidth: 600 }}>
          {PIPELINE_STEPS.map((step, i) => {
            const isCheckpointSlot = Boolean(step.checkpointId);
            const isActiveCheckpoint = isCheckpointSlot && selectedCheckpoint === step.checkpointId;
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div
                  onClick={() => isCheckpointSlot && setSelectedCheckpoint(step.checkpointId)}
                  style={{
                    flex: 1,
                    minWidth: 78,
                    textAlign: "center",
                    padding: "10px 6px",
                    borderRadius: DS.radiusSm,
                    cursor: isCheckpointSlot ? "pointer" : "default",
                    border: isActiveCheckpoint
                      ? `1.5px solid ${AMBER}`
                      : isCheckpointSlot
                      ? `1.5px dashed ${DS.border}`
                      : `1.5px solid ${DS.border}`,
                    background: isActiveCheckpoint
                      ? "rgba(251,191,36,0.15)"
                      : isCheckpointSlot
                      ? "rgba(255,255,255,0.015)"
                      : "rgba(255,255,255,0.04)",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                >
                  {isActiveCheckpoint && (
                    <div
                      style={{
                        position: "absolute",
                        top: -10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 14,
                      }}
                    >
                      🧑
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: isCheckpointSlot ? 600 : 500,
                      color: isActiveCheckpoint ? AMBER : isCheckpointSlot ? DS.t2 : DS.t3,
                      lineHeight: "14px",
                    }}
                  >
                    {step.label}
                  </div>
                  {isCheckpointSlot && (
                    <div style={{ fontSize: 9, color: DS.t3, marginTop: 2 }}>
                      {isActiveCheckpoint ? "checkpoint here" : "click to place"}
                    </div>
                  )}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div style={{ width: 14, height: 1.5, background: DS.border, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkpoint selector pills (also clickable, mirrors diagram) */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {Object.entries(CHECKPOINTS).map(([id, cp]) => {
          const active = id === selectedCheckpoint;
          return (
            <button
              key={id}
              onClick={() => setSelectedCheckpoint(id)}
              style={{
                padding: "7px 14px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                color: active ? CYAN : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {cp.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div
        style={{
          background: CYAN_DIM,
          border: `1px solid rgba(6,182,212,0.25)`,
          borderRadius: DS.radiusMd,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: DS.t2,
          textAlign: "center",
        }}
      >
        {config.description}
      </div>

      {/* Metrics panel */}
      <div
        style={{
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 12,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ fontSize: 11, color: DS.t3, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Simulated Metric Tradeoffs
        </div>
        {METRIC_DEFS.map((metric) => {
          const value = config.metrics[metric.id];
          return (
            <div key={metric.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, color: DS.t2, fontWeight: 500 }}>{metric.label}</span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontFamily: "var(--ds-mono), monospace",
                    fontWeight: 700,
                    color: metricColor(value),
                  }}
                >
                  {value}
                  <span style={{ color: DS.t3, fontWeight: 400 }}> / 100</span>
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${value}%`,
                    background: metricColor(value),
                    borderRadius: 99,
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      {config.note && (
        <div
          style={{
            fontSize: 12.5,
            color: DS.t2,
            padding: "10px 14px",
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.22)",
            borderRadius: DS.radiusMd,
            marginBottom: 12,
            lineHeight: "18px",
          }}
        >
          <span style={{ color: AMBER, fontWeight: 600 }}>Design note: </span>
          {config.note}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          fontSize: 12,
          color: DS.t3,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: DS.radiusMd,
          border: `1px solid ${DS.border}`,
          lineHeight: "18px",
        }}
      >
        Notice the tension: Post-Generation Review maximizes error-catch rate and trust but
        tanks latency and cost efficiency — the classic review-queue bottleneck. Confidence-gated
        escalation is usually the best production default because it spends human attention only
        where the model is least certain.
      </div>
    </div>
  );
}
