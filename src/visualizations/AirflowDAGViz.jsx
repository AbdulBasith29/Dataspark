import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#0EA5E9";
const GREEN = "#34D399";
const RED = "#EF4444";

const TASK_DURATIONS = {
  data_validation: "2m 14s",
  model_training: "18m 42s",
  evaluate_model: "4m 07s",
  push_to_registry: "1m 33s",
  deploy: "3m 05s",
};

const TASK_ORDER = [
  "data_validation",
  "model_training",
  "evaluate_model",
  "push_to_registry",
  "deploy",
];

const TASK_LABELS = {
  data_validation: "data_validation",
  model_training: "model_training",
  evaluate_model: "evaluate_model",
  push_to_registry: "push_to_registry",
  deploy: "deploy",
};

const getTaskStates = (runState) => {
  switch (runState) {
    case "idle":
      return {
        data_validation: "idle",
        model_training: "idle",
        evaluate_model: "idle",
        push_to_registry: "idle",
        deploy: "idle",
      };
    case "running":
      return {
        data_validation: "success",
        model_training: "success",
        evaluate_model: "running",
        push_to_registry: "idle",
        deploy: "idle",
      };
    case "failed":
      return {
        data_validation: "success",
        model_training: "success",
        evaluate_model: "failed",
        push_to_registry: "skipped",
        deploy: "skipped",
      };
    case "success":
      return {
        data_validation: "success",
        model_training: "success",
        evaluate_model: "success",
        push_to_registry: "success",
        deploy: "success",
      };
    default:
      return {};
  }
};

const NODE_STYLES = {
  idle: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.65)",
    dot: "rgba(255,255,255,0.3)",
  },
  running: {
    background: "rgba(14,165,233,0.18)",
    border: `1px solid ${ACCENT}`,
    color: ACCENT,
    dot: ACCENT,
  },
  success: {
    background: "rgba(52,211,153,0.15)",
    border: `1px solid ${GREEN}`,
    color: GREEN,
    dot: GREEN,
  },
  failed: {
    background: "rgba(239,68,68,0.18)",
    border: `1px solid ${RED}`,
    color: RED,
    dot: RED,
  },
  skipped: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.25)",
    dot: "rgba(255,255,255,0.15)",
  },
};

const STATE_ICONS = {
  idle: "○",
  running: "◎",
  success: "✓",
  failed: "✗",
  skipped: "—",
};

const BUTTONS = [
  { id: "idle", label: "Reset", color: "rgba(255,255,255,0.55)" },
  { id: "running", label: "Run", color: ACCENT },
  { id: "failed", label: "Fail at Evaluate", color: RED },
  { id: "success", label: "Success", color: GREEN },
];

export default function AirflowDAGViz() {
  const [runState, setRunState] = useState("idle");

  const taskStates = getTaskStates(runState);

  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        background: "rgba(2,6,23,0.72)",
        borderRadius: 12,
        padding: "20px 20px 18px",
        color: "#E2E8F0",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Airflow DAG · ml_training_pipeline
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Directed Acyclic Graph — task execution flow
        </div>
      </div>

      {/* Control buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {BUTTONS.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setRunState(id)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${runState === id ? color : "rgba(255,255,255,0.12)"}`,
              background: runState === id ? `${color}22` : "rgba(255,255,255,0.04)",
              color: runState === id ? color : "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: runState === id ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* DAG Pipeline — horizontal scroll on small screens */}
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            minWidth: 580,
          }}
        >
          {TASK_ORDER.map((taskId, i) => {
            const state = taskStates[taskId];
            const style = NODE_STYLES[state] || NODE_STYLES.idle;
            const isRunning = state === "running";

            return (
              <div
                key={taskId}
                style={{ display: "flex", alignItems: "center", flex: i < TASK_ORDER.length - 1 ? "1 1 auto" : "0 0 auto" }}
              >
                {/* Node */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    flex: "0 0 auto",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 10px 8px",
                      borderRadius: 8,
                      background: style.background,
                      border: style.border,
                      minWidth: 96,
                      textAlign: "center",
                      position: "relative",
                      boxShadow: isRunning ? `0 0 12px ${ACCENT}44` : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {/* Status icon */}
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: style.dot,
                        marginBottom: 4,
                        lineHeight: 1,
                      }}
                    >
                      {STATE_ICONS[state]}
                    </div>
                    {/* Task name */}
                    <div
                      style={{
                        fontFamily: "var(--ds-mono), monospace",
                        fontSize: 9,
                        color: style.color,
                        wordBreak: "break-all",
                        lineHeight: 1.3,
                      }}
                    >
                      {TASK_LABELS[taskId]}
                    </div>
                  </div>
                  {/* Duration */}
                  <div
                    style={{
                      fontSize: 10,
                      color: state === "idle" || state === "skipped"
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.45)",
                      fontFamily: "var(--ds-mono), monospace",
                      transition: "color 0.2s",
                    }}
                  >
                    {state === "running" ? "running…" : state === "idle" || state === "skipped" ? "—" : TASK_DURATIONS[taskId]}
                  </div>
                </div>

                {/* Arrow connector */}
                {i < TASK_ORDER.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingBottom: 24,
                      minWidth: 24,
                    }}
                  >
                    <svg width="100%" height="12" viewBox="0 0 40 12" preserveAspectRatio="none">
                      <line
                        x1="0"
                        y1="6"
                        x2="34"
                        y2="6"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                      />
                      <polygon
                        points="34,3 40,6 34,9"
                        fill="rgba(255,255,255,0.25)"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* State legend */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 20px",
        }}
      >
        {[
          { state: "idle", label: "Idle" },
          { state: "running", label: "Running" },
          { state: "success", label: "Success" },
          { state: "failed", label: "Failed" },
          { state: "skipped", label: "Skipped" },
        ].map(({ state, label }) => {
          const s = NODE_STYLES[state];
          return (
            <div key={state} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: s.background,
                  border: s.border,
                }}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
            </div>
          );
        })}

        {/* Run state indicator */}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--ds-mono), monospace" }}>
          state: <span style={{ color: "rgba(255,255,255,0.6)" }}>{runState}</span>
        </div>
      </div>
    </div>
  );
}
