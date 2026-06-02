import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component to avoid TDZ crashes) ──────────────
const ACCENT = "#EC4899";

const TABS = [
  { id: "rnn", label: "Vanilla RNN" },
  { id: "lstm", label: "LSTM Gates" },
  { id: "compare", label: "When to Use" },
];

const RNN_STEPS = [
  { t: 1, x: "x₁", h_prev: "h₀=0", h_curr: "h₁", grad: 1.0 },
  { t: 2, x: "x₂", h_prev: "h₁",   h_curr: "h₂", grad: 0.62 },
  { t: 3, x: "x₃", h_prev: "h₂",   h_curr: "h₃", grad: 0.28 },
  { t: 4, x: "x₄", h_prev: "h₃",   h_curr: "h₄", grad: 0.09 },
];

const LSTM_GATES = [
  {
    id: "forget",
    label: "Forget Gate",
    symbol: "f_t",
    formula: "σ(W_f · [h_{t-1}, x_t] + b_f)",
    desc: "Controls how much of the previous cell state C_{t-1} to keep. Near 0 → forget everything. Near 1 → preserve all.",
    color: "rgba(248, 113, 113, 0.85)",
    colorBg: "rgba(248, 113, 113, 0.12)",
  },
  {
    id: "input",
    label: "Input Gate",
    symbol: "i_t",
    formula: "σ(W_i · [h_{t-1}, x_t] + b_i)",
    desc: "Controls how much new candidate information to write into the cell state. Gating the update.",
    color: "rgba(251, 191, 36, 0.85)",
    colorBg: "rgba(251, 191, 36, 0.12)",
  },
  {
    id: "cell",
    label: "Cell Update",
    symbol: "C̃_t",
    formula: "tanh(W_c · [h_{t-1}, x_t] + b_c)",
    desc: "Candidate values to add — the actual new content. Scaled by the input gate before being added to cell state.",
    color: "rgba(52, 211, 153, 0.85)",
    colorBg: "rgba(52, 211, 153, 0.12)",
  },
  {
    id: "output",
    label: "Output Gate",
    symbol: "o_t",
    formula: "σ(W_o · [h_{t-1}, x_t] + b_o)",
    desc: "Controls how much of the cell state flows into the hidden state h_t for the next step and predictions.",
    color: "rgba(129, 140, 248, 0.85)",
    colorBg: "rgba(129, 140, 248, 0.12)",
  },
];

const COMPARE_ROWS = [
  {
    task: "Short text classification (≤50 tokens)",
    rnn: "✓ works",
    lstm: "✓ works",
    transformer: "✓ best",
    rnnColor: DS.grn,
    lstmColor: DS.grn,
    tfColor: DS.grn,
  },
  {
    task: "Long document modeling (500+ tokens)",
    rnn: "✗ vanishing",
    lstm: "~ struggles",
    transformer: "✓ best",
    rnnColor: "rgba(248,113,113,0.85)",
    lstmColor: "rgba(251,191,36,0.85)",
    tfColor: DS.grn,
  },
  {
    task: "Real-time IoT streams (low latency)",
    rnn: "✓ fast",
    lstm: "✓ good",
    transformer: "~ expensive",
    rnnColor: DS.grn,
    lstmColor: DS.grn,
    tfColor: "rgba(251,191,36,0.85)",
  },
  {
    task: "On-device / edge deployment",
    rnn: "✓ small",
    lstm: "✓ compact",
    transformer: "✗ large",
    rnnColor: DS.grn,
    lstmColor: DS.grn,
    tfColor: "rgba(248,113,113,0.85)",
  },
  {
    task: "Parallel training on GPU/TPU",
    rnn: "✗ sequential",
    lstm: "✗ sequential",
    transformer: "✓ parallel",
    rnnColor: "rgba(248,113,113,0.85)",
    lstmColor: "rgba(248,113,113,0.85)",
    tfColor: DS.grn,
  },
  {
    task: "Speech/audio (short frames)",
    rnn: "✓ classic",
    lstm: "✓ classic",
    transformer: "✓ modern",
    rnnColor: DS.grn,
    lstmColor: DS.grn,
    tfColor: DS.grn,
  },
];

// ── Helper styles ────────────────────────────────────────────────────────────
const tabBtnStyle = (active) => ({
  padding: "7px 14px",
  borderRadius: 8,
  border: `1px solid ${active ? ACCENT : DS.border}`,
  background: active ? `${ACCENT}22` : "rgba(255,255,255,0.03)",
  color: active ? ACCENT : DS.t3,
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 11,
  fontWeight: active ? 700 : 400,
  cursor: "pointer",
  transition: "all 0.15s ease",
});

const stepBtnStyle = (active) => ({
  padding: "6px 12px",
  borderRadius: 7,
  border: `1px solid ${active ? ACCENT : DS.border}`,
  background: active ? `${ACCENT}22` : "rgba(255,255,255,0.03)",
  color: active ? DS.t1 : DS.t3,
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 11,
  cursor: "pointer",
});

// ── Sub-components ───────────────────────────────────────────────────────────
function RNNTab() {
  const [step, setStep] = useState(0);
  const current = RNN_STEPS[step];

  return (
    <div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        An RNN unrolled over time. Each step passes its hidden state forward:{" "}
        <span style={{ color: DS.t2 }}>h_t = tanh(W_h · h_(t-1) + W_x · x_t)</span>. Step through to see how gradients fade.
      </p>

      {/* Step selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {RNN_STEPS.map((s, i) => (
          <button key={s.t} type="button" onClick={() => setStep(i)} style={stepBtnStyle(step === i)}>
            t = {s.t}
          </button>
        ))}
      </div>

      {/* Unrolled diagram */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflowX: "auto",
        padding: "16px 8px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: `1px solid ${DS.border}`,
        marginBottom: 20,
      }}>
        {RNN_STEPS.map((s, i) => {
          const isActive = i === step;
          const isPast = i < step;
          return (
            <div key={s.t} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {/* Arrow from left */}
              {i > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44 }}>
                  <div style={{
                    fontSize: 9,
                    color: DS.t3,
                    fontFamily: "var(--ds-mono), monospace",
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                  }}>
                    {s.h_prev}
                  </div>
                  <div style={{
                    width: 40,
                    height: 2,
                    background: isPast || isActive
                      ? `linear-gradient(90deg, rgba(236,72,153,0.7), rgba(236,72,153,0.4))`
                      : DS.border,
                    borderRadius: 1,
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute",
                      right: -4,
                      top: -4,
                      width: 0,
                      height: 0,
                      borderTop: "5px solid transparent",
                      borderBottom: "5px solid transparent",
                      borderLeft: `6px solid ${isPast || isActive ? ACCENT : DS.dim}`,
                    }} />
                  </div>
                </div>
              )}

              {/* RNN cell */}
              <div style={{
                width: 88,
                padding: "12px 8px",
                borderRadius: 10,
                border: `1.5px solid ${isActive ? ACCENT : isPast ? "rgba(236,72,153,0.35)" : DS.border}`,
                background: isActive ? `${ACCENT}18` : isPast ? "rgba(236,72,153,0.06)" : "rgba(255,255,255,0.03)",
                textAlign: "center",
                flexShrink: 0,
              }}>
                <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>
                  {s.x} ↓
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? DS.t1 : DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                }}>
                  RNN
                </div>
                <div style={{ fontSize: 9, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginTop: 4 }}>
                  t={s.t}
                </div>
                <div style={{
                  marginTop: 6,
                  fontSize: 10,
                  color: isActive ? ACCENT : DS.dim,
                  fontFamily: "var(--ds-mono), monospace",
                  fontWeight: 600,
                }}>
                  → {s.h_curr}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vanishing gradient bars */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: `1px solid ${DS.border}`,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DS.t2, fontFamily: "var(--ds-mono), monospace", marginBottom: 12 }}>
          Gradient magnitude flowing back from t=4 → t=1 (vanishing gradient)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...RNN_STEPS].reverse().map((s) => {
            const isHighlighted = s.t - 1 <= step;
            return (
              <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28,
                  fontSize: 10,
                  color: DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                  flexShrink: 0,
                  textAlign: "right",
                }}>
                  t={s.t}
                </div>
                <div style={{
                  flex: 1,
                  height: 14,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${s.grad * 100}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: isHighlighted
                      ? `rgba(236, 72, 153, ${0.3 + s.grad * 0.6})`
                      : "rgba(71, 85, 105, 0.4)",
                    transition: "background 0.3s ease",
                  }} />
                </div>
                <div style={{
                  width: 42,
                  fontSize: 10,
                  color: isHighlighted ? ACCENT : DS.dim,
                  fontFamily: "var(--ds-mono), monospace",
                  textAlign: "right",
                  flexShrink: 0,
                }}>
                  {(s.grad * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
          Tanh derivative max is 1.0, but each backprop step multiplies by weight times derivative. Over 100 steps,{" "}
          <span style={{ color: "rgba(248,113,113,0.9)" }}>gradient approaches 0 exponentially</span>. LSTM solves this with its cell state highway.
        </div>
      </div>

      {/* Active step detail */}
      <div style={{
        padding: "12px 16px",
        borderRadius: 10,
        border: `1px solid ${ACCENT}44`,
        background: `${ACCENT}0e`,
      }}>
        <div style={{ fontSize: 11, color: ACCENT, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 4 }}>
          t={current.t}: h_{current.t} = tanh(W_h · {current.h_prev} + W_x · {current.x})
        </div>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
          Hidden state carries a compressed summary of all prior inputs. Context from early steps{" "}
          {step >= 2 ? <span style={{ color: "rgba(248,113,113,0.9)" }}>is largely lost by now</span> : "is still relatively fresh"}.
        </div>
      </div>
    </div>
  );
}

function LSTMTab() {
  const [mode, setMode] = useState("remember");
  const [activeGate, setActiveGate] = useState(null);

  const forgetVal = mode === "forget" ? 0.05 : 0.92;
  const inputVal = mode === "forget" ? 0.8 : 0.6;

  return (
    <div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        LSTM adds a <span style={{ color: DS.t2 }}>cell state C_t</span> — a memory highway that bypasses recurrent multiplications. Three gates control information flow. Click a gate to inspect it.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setMode("remember")}
          style={{
            padding: "6px 12px",
            borderRadius: 7,
            border: `1px solid ${mode === "remember" ? DS.grn : DS.border}`,
            color: mode === "remember" ? DS.grn : DS.t3,
            background: mode === "remember" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Remember mode (f_t ≈ 1)
        </button>
        <button
          type="button"
          onClick={() => setMode("forget")}
          style={{
            padding: "6px 12px",
            borderRadius: 7,
            border: `1px solid ${mode === "forget" ? "rgba(248,113,113,0.85)" : DS.border}`,
            color: mode === "forget" ? "rgba(248,113,113,0.9)" : DS.t3,
            background: mode === "forget" ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.03)",
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Forget mode (f_t ≈ 0)
        </button>
      </div>

      {/* Cell state flow */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${DS.border}`,
        borderRadius: 12,
        padding: "16px 16px 12px",
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
          Cell state highway: C_t = f_t ⊙ C_(t-1) + i_t ⊙ C̃_t
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* C_{t-1} */}
          <div style={{
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(129,140,248,0.15)",
            border: `1px solid rgba(129,140,248,0.3)`,
            fontSize: 11,
            color: DS.t2,
            fontFamily: "var(--ds-mono), monospace",
            whiteSpace: "nowrap",
          }}>
            C_(t-1)
          </div>

          {/* Multiply by forget gate */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `2px solid rgba(248,113,113,0.6)`,
            background: `rgba(248,113,113, ${mode === "forget" ? 0.22 : 0.08})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            flexShrink: 0,
            transition: "background 0.3s ease",
          }}>
            ×
          </div>
          <div style={{
            fontSize: 10,
            color: "rgba(248,113,113,0.85)",
            fontFamily: "var(--ds-mono), monospace",
          }}>
            f_t={forgetVal.toFixed(2)}
          </div>

          {/* Add */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `2px solid ${DS.border}`,
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: DS.t2,
            flexShrink: 0,
          }}>
            +
          </div>

          {/* Input × cell candidate */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `2px solid rgba(251,191,36,0.6)`,
            background: "rgba(251,191,36,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            flexShrink: 0,
          }}>
            ×
          </div>

          <div style={{
            fontSize: 10,
            color: "rgba(251,191,36,0.85)",
            fontFamily: "var(--ds-mono), monospace",
          }}>
            i_t={inputVal.toFixed(2)}
          </div>

          {/* Result */}
          <div style={{ flexShrink: 0, marginLeft: 4 }}>
            <div style={{
              padding: "8px 10px",
              borderRadius: 8,
              background: mode === "forget" ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.15)",
              border: `1px solid ${mode === "forget" ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.4)"}`,
              fontSize: 11,
              color: mode === "forget" ? "rgba(248,113,113,0.9)" : DS.grn,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              whiteSpace: "nowrap",
              transition: "all 0.3s ease",
            }}>
              C_t {mode === "forget" ? "≈ 0 (cleared)" : "≈ C_(t-1) (preserved)"}
            </div>
          </div>
        </div>
      </div>

      {/* Gate cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {LSTM_GATES.map((gate) => {
          const isActive = activeGate === gate.id;
          return (
            <button
              key={gate.id}
              type="button"
              onClick={() => setActiveGate(isActive ? null : gate.id)}
              style={{
                padding: "12px",
                borderRadius: 10,
                border: `1.5px solid ${isActive ? gate.color : DS.border}`,
                background: isActive ? gate.colorBg : "rgba(255,255,255,0.02)",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: gate.color,
                fontFamily: "var(--ds-mono), monospace",
                marginBottom: 3,
              }}>
                {gate.symbol}  {gate.label}
              </div>
              <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.4 }}>
                {gate.formula}
              </div>
              {isActive && (
                <div style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: DS.t2,
                  fontFamily: "var(--ds-sans), sans-serif",
                  lineHeight: 1.5,
                }}>
                  {gate.desc}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{
        padding: "10px 14px",
        borderRadius: 9,
        background: "rgba(52,211,153,0.06)",
        border: `1px solid rgba(52,211,153,0.2)`,
        fontSize: 11,
        color: DS.t3,
        fontFamily: "var(--ds-sans), sans-serif",
        lineHeight: 1.5,
      }}>
        Key insight: the cell state flows through <span style={{ color: DS.grn }}>additive connections</span>, not multiplicative, so gradients can flow across hundreds of steps without vanishing.
      </div>
    </div>
  );
}

function CompareTab() {
  return (
    <div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        Picking the right architecture depends on sequence length, compute budget, and latency requirements.
      </p>

      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: 8,
        marginBottom: 8,
      }}>
        {["Task", "RNN", "LSTM", "Transformer"].map((h) => (
          <div key={h} style={{
            fontSize: 10,
            fontWeight: 700,
            color: DS.t3,
            fontFamily: "var(--ds-mono), monospace",
            textAlign: h === "Task" ? "left" : "center",
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {COMPARE_ROWS.map((row, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 8,
          padding: "10px 0",
          borderTop: `1px solid ${DS.border}`,
          alignItems: "start",
        }}>
          <div style={{ fontSize: 11, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.4 }}>
            {row.task}
          </div>
          {[
            { text: row.rnn, color: row.rnnColor },
            { text: row.lstm, color: row.lstmColor },
            { text: row.transformer, color: row.tfColor },
          ].map((cell, j) => (
            <div key={j} style={{
              fontSize: 10,
              color: cell.color,
              fontFamily: "var(--ds-mono), monospace",
              textAlign: "center",
              lineHeight: 1.4,
            }}>
              {cell.text}
            </div>
          ))}
        </div>
      ))}

      <div style={{
        marginTop: 16,
        padding: "12px 14px",
        borderRadius: 10,
        background: `${ACCENT}0e`,
        border: `1px solid ${ACCENT}33`,
        fontSize: 11,
        color: DS.t3,
        fontFamily: "var(--ds-sans), sans-serif",
        lineHeight: 1.55,
      }}>
        <span style={{ color: ACCENT, fontWeight: 700 }}>Rule of thumb:</span> sequence ≤100 tokens with tight latency/compute → LSTM. Long sequences, high accuracy needed, training compute available → Transformer.
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function DLRNNLSTMViz() {
  const [activeTab, setActiveTab] = useState("rnn");

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        RNNs &amp; LSTMs: Sequence Modeling
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Explore how recurrent networks carry state across time, why vanilla RNNs fail on long sequences, and how LSTM gates solve it.
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={tabBtnStyle(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "rnn" && <RNNTab />}
      {activeTab === "lstm" && <LSTMTab />}
      {activeTab === "compare" && <CompareTab />}
    </div>
  );
}
