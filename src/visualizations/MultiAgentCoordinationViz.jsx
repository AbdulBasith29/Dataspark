import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component — TDZ safety) ─────────────────────

const CYAN = "#06B6D4";
const GRN = "#34D399";
const ORG = "#F59E0B";
const RED = "#F87171";
const PURPLE = "#818CF8";
const PANEL_BG = "rgba(2,6,23,0.72)";

const TASKS = [
  { id: "security", label: "Security review", worker: "security-agent", structured: { severity: "high", category: "auth", finding: "JWT secret hardcoded in config" }, natural: "There might be a security issue with how secrets are stored, possibly in config." },
  { id: "tests", label: "Test coverage analysis", worker: "test-agent", structured: { severity: "medium", category: "coverage", finding: "payment_service.py at 41% coverage" }, natural: "Test coverage looks a bit low in a couple of the payment-related files." },
  { id: "docs", label: "Documentation check", worker: "docs-agent", structured: { severity: "low", category: "docs", finding: "3 public functions missing docstrings" }, natural: "Some functions could probably use better comments or docs." },
  { id: "lint", label: "Style & lint", worker: "lint-agent", structured: { severity: "low", category: "style", finding: "12 lines exceed 100 char limit" }, natural: "A handful of lines are pretty long and might want wrapping." },
  { id: "deps", label: "Dependency audit", worker: "deps-agent", structured: { severity: "high", category: "deps", finding: "requests==2.6.0 has known CVE-2018-18074" }, natural: "One of the dependencies seems outdated and could have a vulnerability." },
  { id: "perf", label: "Performance review", worker: "perf-agent", structured: { severity: "medium", category: "perf", finding: "N+1 query in get_order_history()" }, natural: "There's a query pattern that looks like it could be inefficient at scale." },
];

const MAX_WORKER_OPTIONS = [1, 2, 3, 4];
const FAILING_TASK_ID = "deps";

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function severityColor(sev) {
  if (sev === "high") return RED;
  if (sev === "medium") return ORG;
  return DS.t3;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, color }) {
  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: color || DS.t3,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function WorkerCard({ task, status }) {
  // status: "pending" | "running" | "done" | "failed"
  const isFailed = status === "failed";
  const isDone = status === "done";
  const color = isFailed ? RED : isDone ? GRN : status === "running" ? CYAN : DS.dim;
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        border: `1.5px solid ${status === "pending" ? DS.border : color}`,
        background: status === "pending" ? "rgba(255,255,255,0.02)" : `${color}14`,
        borderRadius: DS.radiusSm,
        padding: "10px 12px",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11.5, fontWeight: 700, color, marginBottom: 4 }}>
        {task.worker}
      </div>
      <div style={{ fontSize: 11.5, color: DS.t3, marginBottom: 6 }}>{task.label}</div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color,
        }}
      >
        {status === "pending" && "queued"}
        {status === "running" && "running…"}
        {status === "done" && "✓ done"}
        {status === "failed" && "✕ timeout"}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function MultiAgentCoordinationViz() {
  const [maxWorkers, setMaxWorkers] = useState(2);
  const [structured, setStructured] = useState(true);
  const [failureEnabled, setFailureEnabled] = useState(false);
  const [wave, setWave] = useState(-1); // -1 = not started, N = waves completed so far
  const [synthesized, setSynthesized] = useState(false);

  const waves = chunk(TASKS, maxWorkers);
  const totalWaves = waves.length;

  function taskStatus(taskId, taskWaveIndex) {
    if (wave < taskWaveIndex) return "pending";
    if (failureEnabled && taskId === FAILING_TASK_ID) return "failed";
    return "done";
  }

  function runFanOut() {
    setWave(0);
    setSynthesized(false);
  }

  function stepWave() {
    if (wave < totalWaves - 1) {
      setWave(wave + 1);
    } else if (!synthesized) {
      setSynthesized(true);
    }
  }

  function reset() {
    setWave(-1);
    setSynthesized(false);
  }

  const succeededTasks = TASKS.filter((t) => !(failureEnabled && t.id === FAILING_TASK_ID));
  const allWavesDone = wave === totalWaves - 1;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DS.t1, letterSpacing: "-0.3px" }}>
          Fan-Out / Fan-In Orchestration
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Dispatch 6 review tasks to a bounded worker pool, then watch the synthesis agent merge results.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between",
          background: PANEL_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "12px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: DS.t3, fontWeight: 600 }}>max_workers</span>
          <div style={{ display: "flex", gap: 4 }}>
            {MAX_WORKER_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setMaxWorkers(n);
                  reset();
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: DS.radiusSm,
                  border: `1.5px solid ${maxWorkers === n ? CYAN : DS.border}`,
                  background: maxWorkers === n ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.02)",
                  color: maxWorkers === n ? CYAN : DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setStructured((s) => !s);
            reset();
          }}
          style={{
            padding: "7px 14px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${structured ? GRN : ORG}`,
            background: structured ? "rgba(52,211,153,0.14)" : "rgba(245,158,11,0.14)",
            color: structured ? GRN : ORG,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {structured ? "structured JSON output" : "natural-language output"}
        </button>

        <button
          onClick={() => {
            setFailureEnabled((f) => !f);
            reset();
          }}
          style={{
            padding: "7px 14px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${failureEnabled ? RED : DS.border}`,
            background: failureEnabled ? "rgba(248,113,113,0.14)" : "rgba(255,255,255,0.02)",
            color: failureEnabled ? RED : DS.t3,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {failureEnabled ? "✓ deps-agent will time out" : "simulate worker failure"}
        </button>
      </div>

      {/* Orchestrator */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <div
          style={{
            padding: "8px 18px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${wave >= 0 ? PURPLE : DS.border}`,
            background: wave >= 0 ? "rgba(129,140,248,0.16)" : "rgba(255,255,255,0.03)",
            color: wave >= 0 ? PURPLE : DS.t3,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          Orchestrator
        </div>
      </div>

      {/* Waves */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusLg,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <SectionLabel color={CYAN}>
          {wave < 0 ? `${totalWaves} wave(s) queued — press Run Fan-Out` : `Wave ${Math.min(wave + 1, totalWaves)} of ${totalWaves}`}
        </SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {waves.map((waveTasks, wIdx) => (
            <div key={wIdx} style={{ display: "flex", gap: 8, opacity: wave < 0 ? 0.45 : 1 }}>
              {waveTasks.map((t) => (
                <WorkerCard key={t.id} task={t} status={wave < 0 ? "pending" : taskStatus(t.id, wIdx)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Step controls */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
        {wave < 0 ? (
          <button
            onClick={runFanOut}
            style={{
              padding: "9px 20px",
              borderRadius: DS.radiusSm,
              border: `1.5px solid ${CYAN}`,
              background: "rgba(6,182,212,0.16)",
              color: CYAN,
              fontFamily: "var(--ds-sans), sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none",
            }}
          >
            Run Fan-Out
          </button>
        ) : (
          <>
            <button
              onClick={stepWave}
              disabled={allWavesDone && synthesized}
              style={{
                padding: "9px 20px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${allWavesDone && synthesized ? DS.border : CYAN}`,
                background: allWavesDone && synthesized ? "rgba(255,255,255,0.02)" : "rgba(6,182,212,0.16)",
                color: allWavesDone && synthesized ? DS.dim : CYAN,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                fontWeight: 700,
                cursor: allWavesDone && synthesized ? "default" : "pointer",
                outline: "none",
              }}
            >
              {!allWavesDone ? "Step → next wave" : !synthesized ? "Step → run synthesis" : "Complete"}
            </button>
            <button
              onClick={reset}
              style={{
                padding: "9px 16px",
                borderRadius: DS.radiusSm,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.02)",
                color: DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                cursor: "pointer",
                outline: "none",
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Synthesis */}
      {synthesized && (
        <div>
          <SectionLabel color={structured ? GRN : ORG}>Synthesis Agent — fan-in result</SectionLabel>
          <div
            style={{
              background: PANEL_BG,
              border: `1px solid ${structured ? "rgba(52,211,153,0.35)" : "rgba(245,158,11,0.35)"}`,
              borderRadius: DS.radiusMd,
              padding: "14px 16px",
              marginBottom: 14,
            }}
          >
            {failureEnabled && (
              <div style={{ marginBottom: 10, fontSize: 12.5, color: RED, fontWeight: 600 }}>
                ⚠ deps-agent timed out — proceeding with {succeededTasks.length}/{TASKS.length} partial results (per-worker timeout, no full-batch abort).
              </div>
            )}
            {structured ? (
              <>
                <div style={{ fontSize: 12.5, color: GRN, fontWeight: 600, marginBottom: 8 }}>
                  ✓ {succeededTasks.length}/{succeededTasks.length} structured payloads parsed successfully
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {succeededTasks.map((t) => (
                    <div key={t.id} style={{ display: "flex", gap: 8, alignItems: "baseline", fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>
                      <span style={{ color: severityColor(t.structured.severity), fontWeight: 700, width: 56, flexShrink: 0 }}>
                        [{t.structured.severity}]
                      </span>
                      <span style={{ color: DS.t2 }}>{t.structured.finding}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12.5, color: ORG, fontWeight: 600, marginBottom: 8 }}>
                  ⚠ Free-text responses — synthesis agent cannot reliably count or rank findings
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {succeededTasks.map((t) => (
                    <div key={t.id} style={{ fontSize: 12.5, color: DS.t3, fontStyle: "italic" }}>
                      "{t.natural}"
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: DS.t3 }}>
                  Best-effort summary: "There are several possible issues across security, tests, and dependencies, severity unclear."
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
