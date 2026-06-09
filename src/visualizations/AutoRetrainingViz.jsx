import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants (declared before component — TDZ safety) ---

const BLUE = "#0EA5E9";
const GREEN = "#34D399";
const YELLOW = "#FBBF24";
const RED = "#F87171";
const DIM = "#475569";

// Pipeline stage definitions
const STAGES = [
  {
    id: "monitor",
    label: "Monitor",
    icon: "◉",
    description: {
      "schedule":    "Routine health check — PSI=0.08, within normal range",
      "drift":       "PSI=0.31 detected on feature age_bucket — threshold 0.25 exceeded",
      "performance": "AUC dropped from 0.871 → 0.823 — below alert threshold of 0.84",
    },
  },
  {
    id: "trigger",
    label: "Trigger",
    icon: "⚡",
    description: {
      "schedule":    "Scheduled retraining job queued at 02:00 UTC (nightly cron)",
      "drift":       "Retraining job queued immediately — drift alert raised",
      "performance": "Retraining job queued — performance SLA breached",
    },
  },
  {
    id: "retrain",
    label: "Retrain",
    icon: "⚙",
    description: {
      "schedule":    "Training on 90-day rolling window, 2.1M rows — full feature set",
      "drift":       "Training on 30-day window (recent data weighted ×2), 0.7M rows",
      "performance": "Training on 90-day window with updated labels, 2.1M rows",
    },
  },
  {
    id: "validate",
    label: "Validate",
    icon: "✔",
    description: {
      "schedule":    "New AUC 0.847 vs champion 0.821 → challenger wins — promote",
      "drift":       "New AUC 0.863 vs champion 0.821 → challenger wins — promote",
      "performance": "New AUC 0.879 vs champion 0.823 → challenger wins — promote",
    },
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: "▶",
    description: {
      "schedule":    "Blue/green swap complete — monitoring resumed at 02:14 UTC",
      "drift":       "Blue/green swap complete — drift counters reset, monitoring resumed",
      "performance": "Blue/green swap complete — SLA restored, monitoring resumed",
    },
  },
];

// Trigger strategy options
const TRIGGERS = [
  { id: "schedule",    label: "Schedule (daily)" },
  { id: "drift",       label: "Drift Detected" },
  { id: "performance", label: "Performance Drop" },
];

// Safety rails
const SAFETY_RAILS = [
  {
    name: "Shadow Mode",
    detail: "New model runs in parallel without serving real traffic — logs predictions for offline evaluation before any promotion.",
  },
  {
    name: "Rollback Trigger",
    detail: "If post-deploy error rate exceeds baseline by 10% within 15 min, traffic is automatically rolled back to champion.",
  },
  {
    name: "Drift Re-check",
    detail: "After deployment, PSI is re-measured on live traffic after 1 hour to confirm the new model is stable in production.",
  },
];

// Champion / challenger data
const CHAMPION = {
  label: "Champion",
  version: "v2.3.1",
  auc: "0.821",
  trained: "90 days ago",
  color: BLUE,
};

const CHALLENGER = {
  label: "Challenger",
  version: "v2.4.0",
  auc: "0.847",
  trained: "just now",
  color: GREEN,
};

// ---- Styles ----

const ROOT_STYLE = {
  background: DS.bg,
  borderRadius: DS.radiusMd,
  padding: "18px 20px 16px",
  fontFamily: "var(--ds-sans), sans-serif",
  color: DS.t1,
  maxWidth: 620,
  margin: "0 auto",
  boxSizing: "border-box",
};

const SECTION_TITLE = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: DS.t3,
  marginBottom: 12,
};

const CARD_STYLE = {
  background: "rgba(255,255,255,0.02)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  padding: "12px 14px",
};

const CODE_PANEL = {
  background: "rgba(2,6,23,0.72)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  padding: "10px 14px",
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 12,
  color: DS.t2,
};

// ---- Sub-components ----

function TriggerButton({ trigger, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: `1px solid ${active ? BLUE : DS.border}`,
        background: active ? `rgba(14,165,233,0.15)` : "rgba(255,255,255,0.02)",
        color: active ? BLUE : DS.t3,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        outline: "none",
        fontFamily: "var(--ds-sans), sans-serif",
        transition: "all 0.15s ease",
        letterSpacing: "0.02em",
      }}
    >
      {trigger.label}
    </button>
  );
}

function StageNode({ stage, index, activeStep, triggerKey }) {
  const isActive = index === activeStep;
  const isDone = index < activeStep;
  const isPending = index > activeStep;

  const nodeColor = isActive ? BLUE : isDone ? GREEN : DIM;
  const borderColor = isActive ? BLUE : isDone ? GREEN : DS.border;
  const bgColor = isActive
    ? "rgba(14,165,233,0.12)"
    : isDone
    ? "rgba(52,211,153,0.08)"
    : "rgba(255,255,255,0.02)";

  const description = stage.description[triggerKey] || "";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
      {/* Node circle + connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: nodeColor,
          fontWeight: 700,
          transition: "all 0.25s ease",
          boxShadow: isActive ? `0 0 0 3px rgba(14,165,233,0.2)` : "none",
        }}>
          {isDone ? "✓" : stage.icon}
        </div>
        {/* Connector line — skip for last */}
        {index < STAGES.length - 1 && (
          <div style={{
            width: 2,
            height: 16,
            background: isDone ? GREEN : DS.border,
            marginTop: 2,
            transition: "background 0.25s ease",
          }} />
        )}
      </div>

      {/* Stage label + description */}
      <div style={{
        flex: 1,
        paddingTop: 6,
        paddingBottom: index < STAGES.length - 1 ? 0 : 0,
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: isActive ? BLUE : isDone ? GREEN : DS.t3,
          marginBottom: isActive ? 4 : 0,
          transition: "color 0.25s ease",
        }}>
          {stage.label}
        </div>
        {isActive && (
          <div style={{
            ...CODE_PANEL,
            padding: "7px 10px",
            fontSize: 11,
            color: DS.t2,
            marginTop: 2,
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

function ModelCard({ model, winner }) {
  return (
    <div style={{
      ...CARD_STYLE,
      flex: 1,
      minWidth: 120,
      borderColor: winner ? model.color + "55" : DS.border,
      background: winner ? `${model.color}0d` : "rgba(255,255,255,0.02)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: model.color, marginBottom: 6, letterSpacing: "0.04em" }}>
        {model.label}
        {winner && (
          <span style={{ marginLeft: 6, fontSize: 10, color: GREEN }}>▲ wins</span>
        )}
      </div>
      <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t2, marginBottom: 3 }}>
        {model.version}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <span style={{ color: DS.t3 }}>AUC</span>
        <span style={{ color: model.color, fontWeight: 700, fontFamily: "var(--ds-mono), monospace" }}>{model.auc}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 3 }}>
        <span style={{ color: DS.t3 }}>Trained</span>
        <span style={{ color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>{model.trained}</span>
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function AutoRetrainingViz() {
  const [activeTrigger, setActiveTrigger] = useState("schedule");
  const [activeStep, setActiveStep] = useState(0);

  function handleTriggerChange(id) {
    setActiveTrigger(id);
    setActiveStep(0);
  }

  function handleNext() {
    setActiveStep((s) => Math.min(s + 1, STAGES.length - 1));
  }

  function handleReset() {
    setActiveStep(0);
  }

  const isFinished = activeStep === STAGES.length - 1;

  return (
    <div style={ROOT_STYLE}>
      <div style={SECTION_TITLE}>Automated Retraining Pipeline Simulator</div>

      {/* Trigger strategy selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, marginBottom: 6, fontFamily: "var(--ds-mono), monospace" }}>
          Trigger strategy:
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TRIGGERS.map((t) => (
            <TriggerButton
              key={t.id}
              trigger={t}
              active={activeTrigger === t.id}
              onClick={() => handleTriggerChange(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Pipeline stages */}
      <div style={{ ...CARD_STYLE, marginBottom: 12 }}>
        {STAGES.map((stage, i) => (
          <StageNode
            key={stage.id}
            stage={stage}
            index={i}
            activeStep={activeStep}
            triggerKey={activeTrigger}
          />
        ))}

        {/* Step controls */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <button
            onClick={handleNext}
            disabled={isFinished}
            style={{
              padding: "7px 18px",
              borderRadius: 6,
              border: `1px solid ${isFinished ? DS.border : BLUE}`,
              background: isFinished ? "rgba(255,255,255,0.02)" : `rgba(14,165,233,0.15)`,
              color: isFinished ? DS.t3 : BLUE,
              fontSize: 12,
              fontWeight: 700,
              cursor: isFinished ? "default" : "pointer",
              outline: "none",
              fontFamily: "var(--ds-sans), sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            {isFinished ? "Pipeline Complete" : "Next Stage →"}
          </button>
          {activeStep > 0 && (
            <button
              onClick={handleReset}
              style={{
                padding: "7px 14px",
                borderRadius: 6,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.02)",
                color: DS.t3,
                fontSize: 12,
                cursor: "pointer",
                outline: "none",
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              Reset
            </button>
          )}
          <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            Stage {activeStep + 1} / {STAGES.length}
          </span>
        </div>
      </div>

      {/* Champion / Challenger */}
      <div style={{ ...SECTION_TITLE, marginTop: 4 }}>Champion / Challenger</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <ModelCard model={CHAMPION} winner={false} />
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DS.t3,
          fontSize: 18,
          flexShrink: 0,
          paddingTop: 4,
        }}>
          vs
        </div>
        <ModelCard model={CHALLENGER} winner={true} />
      </div>

      {/* Safety rails */}
      <div style={{ ...SECTION_TITLE, marginTop: 4 }}>Safety Rails</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {SAFETY_RAILS.map((rail) => (
          <div
            key={rail.name}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 12,
            }}
          >
            <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
            <span>
              <span style={{ color: DS.t1, fontWeight: 700, fontFamily: "var(--ds-mono), monospace" }}>
                {rail.name}:{" "}
              </span>
              <span style={{ color: DS.t2, lineHeight: 1.5 }}>{rail.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
