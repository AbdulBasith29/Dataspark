import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const BLUE = "#0EA5E9";
const BLUE_DIM = "rgba(14,165,233,0.15)";
const BLUE_BORDER = "rgba(14,165,233,0.35)";
const GREEN = "#10B981";
const GREEN_DIM = "rgba(16,185,129,0.15)";
const GREEN_BORDER = "rgba(16,185,129,0.35)";
const AMBER = "#F59E0B";
const AMBER_DIM = "rgba(245,158,11,0.15)";
const AMBER_BORDER = "rgba(245,158,11,0.35)";
const RED = "#EF4444";
const RED_DIM = "rgba(239,68,68,0.15)";
const RED_BORDER = "rgba(239,68,68,0.35)";
const GRAY_DIM = "rgba(255,255,255,0.05)";
const GRAY_BORDER = "rgba(255,255,255,0.1)";
const PANEL_BG = "rgba(2,6,23,0.72)";
const CARD_BG = "rgba(255,255,255,0.02)";

const BASELINE_AUC = 0.82;

// Pipeline stage definitions (order matters for progress tracking)
const STAGES = [
  { id: "data", label: "Data Validation", icon: "🗄" },
  { id: "feat", label: "Feature Engineering", icon: "⚙" },
  { id: "train", label: "Model Training", icon: "🧠" },
  { id: "gate", label: "Eval Gate", icon: "🔍", isGate: true },
  { id: "registry", label: "Model Registry", icon: "📦" },
  { id: "deploy", label: "Deploy", icon: "🚀" },
];

// Which stages are "complete" for each pipeline state (by stage id)
const COMPLETED_STAGES = {
  idle: [],
  "running-data": ["data"],
  "running-train": ["data", "feat", "train"],
  "eval-gate": ["data", "feat", "train"],
  promoted: ["data", "feat", "train", "gate", "registry", "deploy"],
  rejected: ["data", "feat", "train"],
};

// Which stage is "active" (currently processing)
const ACTIVE_STAGE = {
  idle: null,
  "running-data": "feat",
  "running-train": "gate",
  "eval-gate": "gate",
  promoted: null,
  rejected: "gate",
};

function getStageStyle(stageId, isGate, pipelineState, score) {
  const completed = COMPLETED_STAGES[pipelineState] || [];
  const active = ACTIVE_STAGE[pipelineState];
  const isCompleted = completed.includes(stageId);
  const isActive = active === stageId;
  const isRejected = pipelineState === "rejected" && stageId === "gate";
  const isPromoted = pipelineState === "promoted" && stageId === "gate";

  if (isRejected) {
    return { bg: RED_DIM, border: RED_BORDER, labelColor: RED };
  }
  if (isPromoted || (isCompleted && !isGate)) {
    return { bg: GREEN_DIM, border: GREEN_BORDER, labelColor: GREEN };
  }
  if (isCompleted && isGate) {
    return { bg: GREEN_DIM, border: GREEN_BORDER, labelColor: GREEN };
  }
  if (isActive && isGate) {
    return { bg: AMBER_DIM, border: AMBER_BORDER, labelColor: AMBER };
  }
  if (isActive) {
    return { bg: BLUE_DIM, border: BLUE_BORDER, labelColor: BLUE };
  }
  // pending
  return { bg: GRAY_DIM, border: GRAY_BORDER, labelColor: "rgba(255,255,255,0.3)" };
}

function stateLabel(pipelineState) {
  const map = {
    idle: "Idle — ready to run",
    "running-data": "Running: Data Validation → Feature Engineering…",
    "running-train": "Running: Model Training complete → Evaluation Gate",
    "eval-gate": "Eval Gate: comparing new model vs baseline",
    promoted: "Pipeline complete — model PROMOTED to registry",
    rejected: "Pipeline complete — model REJECTED (below baseline)",
  };
  return map[pipelineState] || pipelineState;
}

export default function MLCICDPipelineViz() {
  const [pipelineState, setPipelineState] = useState("idle");
  const [newModelScore, setNewModelScore] = useState(null);

  function runPass() {
    setNewModelScore(0.87);
    setPipelineState("running-data");
    // Simulate progression through states without async:
    // We use a chain of requestAnimationFrame-style steps via state flags.
    // Since no async allowed, we show the gate immediately and let user advance.
    // Actually: we'll jump to eval-gate after two "phases":
    // running-data → running-train → eval-gate → promoted
    // We'll use a simple counter approach via re-render triggers.
    // For a clean UX without useEffect, we'll advance on button click.
    // Instead: jump straight to eval-gate (all prior stages shown as done).
    setPipelineState("eval-gate");
    setNewModelScore(0.87);
  }

  function runFail() {
    setNewModelScore(0.78);
    setPipelineState("eval-gate");
  }

  function decide() {
    if (newModelScore === null) return;
    if (newModelScore >= BASELINE_AUC) {
      setPipelineState("promoted");
    } else {
      setPipelineState("rejected");
    }
  }

  function reset() {
    setPipelineState("idle");
    setNewModelScore(null);
  }

  const isPass = newModelScore !== null && newModelScore >= BASELINE_AUC;
  const showGateDetail =
    pipelineState === "eval-gate" ||
    pipelineState === "promoted" ||
    pipelineState === "rejected";

  return (
    <div
      style={{
        background: PANEL_BG,
        borderRadius: 14,
        padding: "20px 22px 24px",
        fontFamily: "var(--ds-sans), sans-serif",
        color: "#E2E8F0",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: BLUE,
            letterSpacing: 0.3,
            marginBottom: 4,
          }}
        >
          ML CI/CD Pipeline — Evaluation Gate
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Trigger a pipeline run and observe how the evaluation gate promotes or rejects a new model
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <CtrlButton
          onClick={runPass}
          color={GREEN}
          dimColor={GREEN_DIM}
          borderColor={GREEN_BORDER}
          disabled={pipelineState !== "idle"}
        >
          Run Pipeline (score 0.87 — pass)
        </CtrlButton>
        <CtrlButton
          onClick={runFail}
          color={RED}
          dimColor={RED_DIM}
          borderColor={RED_BORDER}
          disabled={pipelineState !== "idle"}
        >
          Run Pipeline (score 0.78 — fail)
        </CtrlButton>
        <CtrlButton
          onClick={reset}
          color="rgba(255,255,255,0.5)"
          dimColor={GRAY_DIM}
          borderColor={GRAY_BORDER}
          disabled={false}
        >
          Reset
        </CtrlButton>
      </div>

      {/* Status bar */}
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          marginBottom: 16,
          fontStyle: "italic",
        }}
      >
        Status: {stateLabel(pipelineState)}
      </div>

      {/* Pipeline stages — horizontal flow */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {STAGES.map((stage, idx) => {
          const styleVals = getStageStyle(stage.id, stage.isGate, pipelineState, newModelScore);
          const isLast = idx === STAGES.length - 1;
          return (
            <div key={stage.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <StageBox
                stage={stage}
                bg={styleVals.bg}
                border={styleVals.border}
                labelColor={styleVals.labelColor}
              />
              {!isLast && (
                <Arrow
                  active={
                    COMPLETED_STAGES[pipelineState]?.includes(stage.id) ||
                    pipelineState === "promoted"
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Evaluation Gate detail card */}
      {showGateDetail && (
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${
              pipelineState === "rejected"
                ? RED_BORDER
                : pipelineState === "promoted"
                ? GREEN_BORDER
                : AMBER_BORDER
            }`,
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: AMBER,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            Evaluation Gate — AUC Comparison
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
            <Metric label="Baseline AUC (prod)" value={BASELINE_AUC.toFixed(2)} color={BLUE} />
            <Metric
              label="New Model AUC"
              value={newModelScore !== null ? newModelScore.toFixed(2) : "—"}
              color={isPass ? GREEN : RED}
            />
            <Metric
              label="Delta"
              value={
                newModelScore !== null
                  ? `${isPass ? "+" : ""}${(newModelScore - BASELINE_AUC).toFixed(2)}`
                  : "—"
              }
              color={isPass ? GREEN : RED}
            />
          </div>

          {/* AUC visual bar */}
          <AucBar baseline={BASELINE_AUC} newScore={newModelScore} />

          {/* Decision */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
            {pipelineState === "eval-gate" && (
              <button
                onClick={decide}
                style={{
                  background: AMBER_DIM,
                  border: `1px solid ${AMBER_BORDER}`,
                  borderRadius: 8,
                  color: AMBER,
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.3,
                }}
              >
                Apply Gate Decision
              </button>
            )}
            {pipelineState === "promoted" && (
              <DecisionBadge pass={true} newModelScore={newModelScore} />
            )}
            {pipelineState === "rejected" && (
              <DecisionBadge pass={false} newModelScore={newModelScore} />
            )}
          </div>
        </div>
      )}

      {/* Outcome summary */}
      {(pipelineState === "promoted" || pipelineState === "rejected") && (
        <div
          style={{
            padding: "10px 14px",
            background: pipelineState === "promoted" ? GREEN_DIM : RED_DIM,
            border: `1px solid ${pipelineState === "promoted" ? GREEN_BORDER : RED_BORDER}`,
            borderRadius: 8,
            fontSize: 12,
            color: pipelineState === "promoted" ? GREEN : RED,
            fontWeight: 600,
          }}
        >
          {pipelineState === "promoted"
            ? "Model versioned in registry and deployed to production serving."
            : "Model blocked at gate — production model unchanged. Investigate features or hyperparameters."}
        </div>
      )}
    </div>
  );
}

function StageBox({ stage, bg, border, labelColor }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "10px 12px",
        minWidth: stage.isGate ? 100 : 88,
        textAlign: "center",
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 4 }}>{stage.icon}</div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: labelColor,
          letterSpacing: 0.3,
          lineHeight: 1.3,
          transition: "color 0.25s",
        }}
      >
        {stage.label}
      </div>
    </div>
  );
}

function Arrow({ active }) {
  return (
    <div
      style={{
        width: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? GREEN : "rgba(255,255,255,0.15)",
        fontSize: 14,
        fontWeight: 700,
        flexShrink: 0,
        transition: "color 0.25s",
      }}
    >
      →
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 22,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AucBar({ baseline, newScore }) {
  const maxVal = 1.0;
  const baselinePct = (baseline / maxVal) * 100;
  const newPct = newScore !== null ? (newScore / maxVal) * 100 : 0;
  const isPass = newScore !== null && newScore >= baseline;

  return (
    <div style={{ position: "relative" }}>
      {/* Track */}
      <div
        style={{
          height: 20,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* New model bar */}
        {newScore !== null && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${newPct}%`,
              height: "100%",
              background: isPass ? `${GREEN}55` : `${RED}55`,
              borderRadius: 10,
              transition: "width 0.4s",
            }}
          />
        )}
        {/* Baseline marker */}
        <div
          style={{
            position: "absolute",
            left: `${baselinePct}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: AMBER,
          }}
        />
      </div>
      {/* Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        <span>0.0</span>
        <span style={{ color: AMBER }}>baseline 0.82</span>
        <span>1.0</span>
      </div>
    </div>
  );
}

function DecisionBadge({ pass, newModelScore }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: pass ? GREEN_DIM : RED_DIM,
        border: `1px solid ${pass ? GREEN_BORDER : RED_BORDER}`,
        borderRadius: 8,
        padding: "7px 16px",
      }}
    >
      <span style={{ fontSize: 16 }}>{pass ? "✓" : "✗"}</span>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: pass ? GREEN : RED,
            letterSpacing: 0.3,
          }}
        >
          Decision: {pass ? "PROMOTE" : "REJECT"}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          {pass
            ? `${newModelScore} ≥ baseline ${BASELINE_AUC}`
            : `${newModelScore} < baseline ${BASELINE_AUC}`}
        </div>
      </div>
    </div>
  );
}

function CtrlButton({ onClick, color, dimColor, borderColor, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "rgba(255,255,255,0.03)" : dimColor,
        border: `1px solid ${disabled ? "rgba(255,255,255,0.08)" : borderColor}`,
        borderRadius: 8,
        color: disabled ? "rgba(255,255,255,0.25)" : color,
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </button>
  );
}
