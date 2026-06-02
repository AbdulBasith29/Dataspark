import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── constants ────────────────────────────────────────────────────────────────
const ACCENT = "#8B5CF6";

const MATRIX_CELLS = [
  {
    row: 0,
    col: 0,
    truthLabel: "H₀ True",
    decisionLabel: "Fail to Reject H₀",
    name: "Correct Rejection (TN)",
    short: "Correct ✓",
    prob: "1 − α",
    desc: "The null is true and we correctly don't reject it. No error.",
    color: DS.grn,
    bg: "rgba(52,211,153,0.08)",
    border: `${DS.grn}44`,
  },
  {
    row: 0,
    col: 1,
    truthLabel: "H₀ True",
    decisionLabel: "Reject H₀",
    name: "Type I Error (False Positive)",
    short: "Type I (α)",
    prob: "α",
    desc: "The null is true but we reject it. A false alarm. Probability = α (significance level).",
    color: "rgba(248,113,113,0.9)",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.44)",
  },
  {
    row: 1,
    col: 0,
    truthLabel: "H₁ True",
    decisionLabel: "Fail to Reject H₀",
    name: "Type II Error (False Negative)",
    short: "Type II (β)",
    prob: "β",
    desc: "There is a real effect but we miss it. Probability = β. Power = 1 − β.",
    color: "rgba(251,191,36,0.9)",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.4)",
  },
  {
    row: 1,
    col: 1,
    truthLabel: "H₁ True",
    decisionLabel: "Reject H₀",
    name: "Power (Correct Detection)",
    short: "Power (1−β)",
    prob: "1 − β",
    desc: "There is a real effect and we detect it. This is statistical power — the goal.",
    color: ACCENT,
    bg: `${ACCENT}0D`,
    border: `${ACCENT}44`,
  },
];

const SCENARIOS = [
  {
    id: "medical",
    label: "Medical Diagnosis",
    icon: "⚕",
    typeICost: "Unnecessary treatment, patient anxiety, resource waste",
    typeIICost: "Missed disease — potentially fatal",
    recommendation: "Minimize Type II (β). Use higher α (e.g., 0.10) for initial screening. The cost of missing a real disease far exceeds the cost of a false alarm that triggers follow-up tests.",
    idealAlpha: 0.10,
  },
  {
    id: "security",
    label: "Security Detection",
    icon: "🔒",
    typeICost: "False alerts — alert fatigue, wasted analyst time",
    typeIICost: "Missed intrusion — data breach, catastrophic damage",
    recommendation: "Minimize Type II (β). Accept more false positives (higher α) to ensure real threats are caught. Triage false positives afterward.",
    idealAlpha: 0.10,
  },
  {
    id: "marketing",
    label: "Marketing Email",
    icon: "📧",
    typeICost: "Sending a campaign that doesn't actually lift revenue",
    typeIICost: "Not sending a campaign that would have lifted revenue",
    recommendation: "Balance both errors. Use standard α=0.05. The cost of a false positive (wasted send budget) is roughly comparable to a false negative (missed lift opportunity).",
    idealAlpha: 0.05,
  },
];

// ── component ────────────────────────────────────────────────────────────────
export default function StatTypeErrorsViz() {
  const [alpha, setAlpha] = useState(0.05);
  const [effectSize, setEffectSize] = useState("medium"); // "small" | "medium" | "large"
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [activeTab, setActiveTab] = useState("matrix");

  // approximate beta given alpha and effect size (simplified via power lookup)
  const betaApprox = { small: 0.72, medium: 0.45, large: 0.18 }[effectSize];
  const powerApprox = 1 - betaApprox;

  // tradeoff insight: lowering alpha inflates beta (simplified linear approx)
  const tradeoffBeta = Math.min(0.99, betaApprox + (0.05 - alpha) * 3);
  const tradeoffPower = (1 - tradeoffBeta) * 100;

  const tabStyle = (tab) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${activeTab === tab ? ACCENT : DS.border}`,
    background: activeTab === tab ? `${ACCENT}22` : "transparent",
    color: activeTab === tab ? DS.t1 : DS.t3,
    fontFamily: "var(--ds-mono), monospace",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  });

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenario);

  return (
    <div style={{ color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Type I &amp; Type II Error Explorer
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Click matrix cells, adjust α, explore the tradeoff, and apply error costs to real contexts.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button type="button" style={tabStyle("matrix")} onClick={() => setActiveTab("matrix")}>Decision Matrix</button>
        <button type="button" style={tabStyle("tradeoff")} onClick={() => setActiveTab("tradeoff")}>The Tradeoff</button>
        <button type="button" style={tabStyle("context")} onClick={() => setActiveTab("context")}>Context Matters</button>
      </div>

      {activeTab === "matrix" && (
        <div>
          {/* controls */}
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
              Significance level α = {alpha.toFixed(2)} · Type I error rate
              <input type="range" min={0.01} max={0.20} step={0.01} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: "rgba(248,113,113,0.9)" }} />
            </label>
            <div>
              <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>Effect size (affects β):</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["small", "medium", "large"].map((es) => (
                  <button
                    key={es}
                    type="button"
                    onClick={() => setEffectSize(es)}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 6,
                      border: `1px solid ${effectSize === es ? "rgba(251,191,36,0.7)" : DS.border}`,
                      background: effectSize === es ? "rgba(251,191,36,0.1)" : "transparent",
                      color: effectSize === es ? "rgba(251,191,36,0.95)" : DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {es}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2x2 matrix */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "auto auto",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {/* column headers */}
            <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {["Fail to Reject H₀", "Reject H₀"].map((h) => (
                <div key={h} style={{ textAlign: "center", fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", paddingBottom: 4 }}>
                  {h}
                </div>
              ))}
            </div>
            {/* row 0: H₀ true */}
            {MATRIX_CELLS.filter((c) => c.row === 0).map((cell) => {
              const displayProb = cell.col === 0 ? `${((1 - alpha) * 100).toFixed(0)}%` : `${(alpha * 100).toFixed(0)}%`;
              const isSelected = selectedCell === `${cell.row}-${cell.col}`;
              return (
                <button
                  key={`${cell.row}-${cell.col}`}
                  type="button"
                  onClick={() => setSelectedCell(isSelected ? null : `${cell.row}-${cell.col}`)}
                  style={{
                    background: isSelected ? cell.bg : "rgba(255,255,255,0.02)",
                    border: `2px solid ${isSelected ? cell.color : DS.border}`,
                    borderRadius: 10,
                    padding: "12px 10px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>H₀ True</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cell.color, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>{cell.short}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: cell.color, fontFamily: "var(--ds-mono), monospace" }}>{displayProb}</div>
                </button>
              );
            })}
            {/* row 1: H₁ true */}
            {MATRIX_CELLS.filter((c) => c.row === 1).map((cell) => {
              const displayProb = cell.col === 0 ? `${(betaApprox * 100).toFixed(0)}%` : `${(powerApprox * 100).toFixed(0)}%`;
              const isSelected = selectedCell === `${cell.row}-${cell.col}`;
              return (
                <button
                  key={`${cell.row}-${cell.col}`}
                  type="button"
                  onClick={() => setSelectedCell(isSelected ? null : `${cell.row}-${cell.col}`)}
                  style={{
                    background: isSelected ? cell.bg : "rgba(255,255,255,0.02)",
                    border: `2px solid ${isSelected ? cell.color : DS.border}`,
                    borderRadius: 10,
                    padding: "12px 10px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>H₁ True</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cell.color, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>{cell.short}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: cell.color, fontFamily: "var(--ds-mono), monospace" }}>{displayProb}</div>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10, textAlign: "center" }}>
            Click a cell to learn more · β estimates assume {effectSize} effect size
          </div>

          {/* selected cell detail */}
          {selectedCell && (() => {
            const [r, c] = selectedCell.split("-").map(Number);
            const cell = MATRIX_CELLS.find((x) => x.row === r && x.col === c);
            if (!cell) return null;
            return (
              <div
                style={{
                  background: cell.bg,
                  border: `1px solid ${cell.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: cell.color, marginBottom: 4, fontFamily: "var(--ds-sans), sans-serif" }}>
                  {cell.name}
                </div>
                <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.6, fontFamily: "var(--ds-sans), sans-serif" }}>
                  {cell.desc}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
                  Probability = <span style={{ color: cell.color }}>{cell.prob}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "tradeoff" && (
        <div>
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.7, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 10 }}>
              Changing α directly controls the Type I error rate. But there is a price: <strong style={{ color: "rgba(251,191,36,0.9)" }}>lowering α increases β</strong> (Type II error rate) for any fixed sample size and effect size.
            </div>

            {/* visual tradeoff bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>
                <span>Type I (α) = {(alpha * 100).toFixed(0)}%</span>
                <span style={{ color: "rgba(251,191,36,0.9)" }}>Approx Type II (β) = {(tradeoffBeta * 100).toFixed(0)}%</span>
                <span style={{ color: ACCENT }}>Power = {tradeoffPower.toFixed(0)}%</span>
              </div>
              <div style={{ height: 28, display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${DS.border}` }}>
                <div style={{ width: `${alpha * 100}%`, background: "rgba(248,113,113,0.55)", transition: "width 0.2s" }} />
                <div style={{ width: `${Math.max(0, tradeoffBeta * (1 - alpha)) * 100}%`, background: "rgba(251,191,36,0.4)", transition: "width 0.2s" }} />
                <div style={{ flex: 1, background: `${ACCENT}44` }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 9, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
                <span style={{ color: "rgba(248,113,113,0.8)" }}>■ Type I</span>
                <span style={{ color: "rgba(251,191,36,0.8)" }}>■ Type II</span>
                <span style={{ color: ACCENT }}>■ Power</span>
              </div>
            </div>

            <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
              α = {alpha.toFixed(2)}
              <input type="range" min={0.01} max={0.20} step={0.01} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: "rgba(248,113,113,0.9)" }} />
            </label>
          </div>

          <div
            style={{
              background: `${ACCENT}0D`,
              border: `1px solid ${ACCENT}33`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              lineHeight: 1.7,
            }}
          >
            <div style={{ color: ACCENT, fontWeight: 700, marginBottom: 4 }}>The only real solution to both errors:</div>
            Increase sample size n. More data reduces both α and β simultaneously without forcing a tradeoff. This is why power analysis and pre-registered sample sizes matter.
          </div>
        </div>
      )}

      {activeTab === "context" && (
        <div>
          <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10, lineHeight: 1.55 }}>
            The cost of each error type is domain-specific. This determines which error to prioritize minimizing.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedScenario(s.id === selectedScenario ? null : s.id)}
                style={{
                  background: selectedScenario === s.id ? `${ACCENT}0D` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedScenario === s.id ? ACCENT : DS.border}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: DS.t1,
                  fontFamily: "var(--ds-sans), sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {activeScenario && (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${ACCENT}44`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: DS.t1, marginBottom: 10, fontFamily: "var(--ds-sans), sans-serif" }}>
                {activeScenario.icon} {activeScenario.label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "rgba(248,113,113,0.8)", fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>TYPE I COST (False Alarm)</div>
                  <div style={{ fontSize: 11, color: DS.t2, lineHeight: 1.5 }}>{activeScenario.typeICost}</div>
                </div>
                <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "rgba(251,191,36,0.8)", fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>TYPE II COST (Miss)</div>
                  <div style={{ fontSize: 11, color: DS.t2, lineHeight: 1.5 }}>{activeScenario.typeIICost}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>Recommended approach: </span>
                {activeScenario.recommendation}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t3 }}>
                Suggested α: <span style={{ color: DS.grn }}>{activeScenario.idealAlpha}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
