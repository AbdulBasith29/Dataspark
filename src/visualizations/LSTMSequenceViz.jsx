import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Accent & palette constants (declared before component — TDZ safety) ───────
const BLU = "#0EA5E9";
const BLU_DIM = "rgba(14,165,233,0.18)";
const BLU_GLOW = "rgba(14,165,233,0.55)";
const RED_DIM = "rgba(248,113,113,0.85)";
const GRN_DIM = "rgba(52,211,153,0.85)";

// ── Gate definitions ──────────────────────────────────────────────────────────
const GATES = [
  {
    id: "forget",
    label: "Forget Gate",
    formula: "f_t = σ(W_f · [h_{t-1}, x_t] + b_f)",
    explanation:
      "Decides what fraction of the previous cell state C_{t-1} to keep. A value near 0 erases old memory; near 1 preserves it completely. This is the LSTM's selective forgetting mechanism.",
    analogy:
      'Like starting a new chapter in a book — you let go of irrelevant plot details from earlier chapters so they don\'t clutter your understanding of the new story.',
    gateCircles: ["forget"],
  },
  {
    id: "input",
    label: "Input Gate",
    formula: "i_t = σ(W_i · [h_{t-1}, x_t] + b_i)",
    explanation:
      "Decides how much new information to write into the cell state. Works together with the tanh candidate layer to produce the actual values to store. It's the network's admission filter for new memories.",
    analogy:
      'Like a journal editor deciding which new events are worth writing down — not every observation makes it into the memory log.',
    gateCircles: ["input", "candidate"],
  },
  {
    id: "cell",
    label: "Cell State Update",
    formula:
      "C_t = f_t ⊙ C_{t-1} + i_t ⊙ tanh(W_C · [h_{t-1}, x_t] + b_C)",
    explanation:
      "The actual update step: scale old cell state by the forget gate, then add the gated new candidate. The cell state is the \"conveyor belt\" — additions are additive, so gradients flow without vanishing.",
    analogy:
      'Like a running ledger: erase old entries proportionally (f_t) then add new ones (i_t × candidate). The ledger itself travels forward unchanged except for these controlled edits.',
    gateCircles: ["forget", "input", "candidate"],
  },
  {
    id: "output",
    label: "Output Gate",
    formula: "o_t = σ(W_o · [h_{t-1}, x_t] + b_o)   h_t = o_t ⊙ tanh(C_t)",
    explanation:
      "Decides what part of the cell state to expose as the hidden state h_t. The cell state is filtered through tanh (−1 to 1) then masked by this gate. h_t is what gets passed to the next step and used for predictions.",
    analogy:
      'Like a briefing officer summarising a classified file — the full record exists internally, but only a curated portion is shared with the outside world at each step.',
    gateCircles: ["output"],
  },
];

// ── Comparison table rows ─────────────────────────────────────────────────────
const COMPARE_ROWS = [
  {
    property: "Vanishing gradient",
    rnn: "✗  Severe — multiplied through tanh each step",
    lstm: "✓  Cell state highway: additive updates keep gradients alive",
    rnnColor: RED_DIM,
    lstmColor: GRN_DIM,
  },
  {
    property: "Long-range memory",
    rnn: "✗  Context fades after ~10–20 steps",
    lstm: "✓  Explicit memory cell preserves relevant context 100+ steps",
    rnnColor: RED_DIM,
    lstmColor: GRN_DIM,
  },
  {
    property: "Training stability",
    rnn: "✗  Gradient explosion / vanishing common",
    lstm: "✓  Gated writes reduce instability; easier to train deep nets",
    rnnColor: RED_DIM,
    lstmColor: GRN_DIM,
  },
];

// ── SVG diagram showing an LSTM cell with highlighted gate(s) ─────────────────
// Nodes: h_{t-1} (left-top), x_t (left-mid), C_{t-1} (left-bot)
//        σ-forget (top), σ-input (mid-top), tanh-cand (mid-bot), σ-output (bot-top)
//        C_t (right-top), h_t (right-mid)
// Highlighted nodes glow in BLU; the rest are dim.
function LSTMDiagram({ activeCircles }) {
  const active = new Set(activeCircles);

  const nodeColor = (id) =>
    active.has(id) ? BLU : "rgba(255,255,255,0.08)";
  const nodeStroke = (id) =>
    active.has(id) ? BLU : DS.border;
  const nodeGlow = (id) =>
    active.has(id)
      ? `drop-shadow(0 0 6px ${BLU_GLOW})`
      : "none";
  const labelColor = (id) =>
    active.has(id) ? DS.t1 : DS.t3;
  const wireColor = (ids) =>
    ids.some((id) => active.has(id)) ? BLU : "rgba(148,163,184,0.18)";

  return (
    <svg
      viewBox="0 0 420 220"
      style={{ width: "100%", maxWidth: 420, display: "block", margin: "0 auto" }}
      aria-label="LSTM cell diagram"
    >
      {/* ── Input labels ── */}
      <text x="8" y="62" fontSize="10" fill={DS.t3} fontFamily="var(--ds-mono), monospace">
        h&#x2091;&#x208B;&#x2081;
      </text>
      <text x="8" y="112" fontSize="10" fill={DS.t3} fontFamily="var(--ds-mono), monospace">
        x&#x2091;
      </text>
      <text x="8" y="162" fontSize="10" fill={DS.t3} fontFamily="var(--ds-mono), monospace">
        C&#x2091;&#x208B;&#x2081;
      </text>

      {/* ── Wires from inputs to gates ── */}
      {/* h_{t-1} → σ-forget */}
      <line x1="38" y1="58" x2="120" y2="58" stroke={wireColor(["forget"])} strokeWidth="1.5" />
      {/* h_{t-1} → σ-input */}
      <line x1="38" y1="58" x2="38" y2="105" stroke={wireColor(["input", "candidate"])} strokeWidth="1" strokeDasharray="4,3" />
      <line x1="38" y1="105" x2="170" y2="100" stroke={wireColor(["input"])} strokeWidth="1.5" />
      {/* h_{t-1} → tanh-cand */}
      <line x1="38" y1="105" x2="170" y2="130" stroke={wireColor(["candidate"])} strokeWidth="1.5" />
      {/* h_{t-1} → σ-output */}
      <line x1="38" y1="105" x2="170" y2="168" stroke={wireColor(["output"])} strokeWidth="1.5" />

      {/* x_t → all gates (shared stem) */}
      <line x1="48" y1="108" x2="120" y2="58" stroke={wireColor(["forget"])} strokeWidth="1" strokeDasharray="4,3" />
      <line x1="48" y1="108" x2="170" y2="100" stroke={wireColor(["input"])} strokeWidth="1" strokeDasharray="4,3" />
      <line x1="48" y1="108" x2="170" y2="130" stroke={wireColor(["candidate"])} strokeWidth="1" strokeDasharray="4,3" />
      <line x1="48" y1="108" x2="170" y2="168" stroke={wireColor(["output"])} strokeWidth="1" strokeDasharray="4,3" />

      {/* C_{t-1} → multiply-forget circle */}
      <line x1="40" y1="158" x2="230" y2="50" stroke={wireColor(["forget", "cell"])} strokeWidth="1.5" />

      {/* ── Gate circles ── */}
      {/* σ-forget (120, 58) */}
      <circle cx="140" cy="58" r="16" fill={nodeColor("forget")} stroke={nodeStroke("forget")} strokeWidth="1.5"
        style={{ filter: nodeGlow("forget") }} />
      <text x="140" y="62" textAnchor="middle" fontSize="11" fill={labelColor("forget")} fontFamily="var(--ds-mono), monospace">σ</text>

      {/* σ-input (190, 100) */}
      <circle cx="190" cy="100" r="16" fill={nodeColor("input")} stroke={nodeStroke("input")} strokeWidth="1.5"
        style={{ filter: nodeGlow("input") }} />
      <text x="190" y="104" textAnchor="middle" fontSize="11" fill={labelColor("input")} fontFamily="var(--ds-mono), monospace">σ</text>

      {/* tanh-candidate (190, 132) */}
      <circle cx="190" cy="134" r="16" fill={nodeColor("candidate")} stroke={nodeStroke("candidate")} strokeWidth="1.5"
        style={{ filter: nodeGlow("candidate") }} />
      <text x="190" y="138" textAnchor="middle" fontSize="9" fill={labelColor("candidate")} fontFamily="var(--ds-mono), monospace">tanh</text>

      {/* σ-output (190, 170) */}
      <circle cx="190" cy="170" r="16" fill={nodeColor("output")} stroke={nodeStroke("output")} strokeWidth="1.5"
        style={{ filter: nodeGlow("output") }} />
      <text x="190" y="174" textAnchor="middle" fontSize="11" fill={labelColor("output")} fontFamily="var(--ds-mono), monospace">σ</text>

      {/* ── Cell state ⊙ multiply (forget) ── */}
      <circle cx="250" cy="50" r="12" fill={nodeColor("forget")} stroke={nodeStroke("forget")} strokeWidth="1.5"
        style={{ filter: nodeGlow("forget") }} />
      <text x="250" y="54" textAnchor="middle" fontSize="13" fill={labelColor("forget")} fontFamily="var(--ds-mono), monospace">⊙</text>

      {/* ── Cell state + (add) ── */}
      <circle cx="290" cy="50" r="12" fill={nodeColor("candidate")} stroke={nodeStroke("candidate")} strokeWidth="1.5"
        style={{ filter: nodeGlow("candidate") }} />
      <text x="290" y="55" textAnchor="middle" fontSize="14" fill={labelColor("candidate")} fontFamily="var(--ds-mono), monospace">+</text>

      {/* input ⊙ candidate product → + */}
      <line x1="190" y1="116" x2="270" y2="116" stroke={wireColor(["input", "candidate"])} strokeWidth="1.5" />
      <line x1="190" y1="150" x2="270" y2="116" stroke={wireColor(["candidate"])} strokeWidth="1" strokeDasharray="4,3" />
      <circle cx="270" cy="116" r="10" fill={nodeColor("input")} stroke={nodeStroke("input")} strokeWidth="1.5"
        style={{ filter: nodeGlow("input") }} />
      <text x="270" y="120" textAnchor="middle" fontSize="13" fill={labelColor("input")} fontFamily="var(--ds-mono), monospace">⊙</text>
      <line x1="270" y1="106" x2="290" y2="62" stroke={wireColor(["input", "candidate"])} strokeWidth="1.5" />

      {/* ⊙ → + (cell state update path) */}
      <line x1="262" y1="50" x2="278" y2="50" stroke={wireColor(["forget"])} strokeWidth="1.5" />

      {/* + → C_t output */}
      <line x1="302" y1="50" x2="380" y2="50" stroke={wireColor(["forget", "input", "candidate", "cell"])} strokeWidth="1.5" />

      {/* C_t label */}
      <text x="385" y="54" fontSize="10" fill={DS.t3} fontFamily="var(--ds-mono), monospace">C&#x2091;</text>

      {/* tanh of C_t → ⊙ output gate */}
      <line x1="302" y1="50" x2="330" y2="50" stroke={wireColor(["output"])} strokeWidth="1" strokeDasharray="4,3" />
      <circle cx="330" cy="80" r="12" fill={nodeColor("output")} stroke={nodeStroke("output")} strokeWidth="1.5"
        style={{ filter: nodeGlow("output") }} />
      <text x="330" y="84" textAnchor="middle" fontSize="9" fill={labelColor("output")} fontFamily="var(--ds-mono), monospace">tanh</text>
      <line x1="330" y1="62" x2="330" y2="68" stroke={wireColor(["output"])} strokeWidth="1.5" />

      {/* σ-output → ⊙ h */}
      <line x1="206" y1="170" x2="350" y2="116" stroke={wireColor(["output"])} strokeWidth="1.5" />
      <circle cx="350" cy="116" r="10" fill={nodeColor("output")} stroke={nodeStroke("output")} strokeWidth="1.5"
        style={{ filter: nodeGlow("output") }} />
      <text x="350" y="120" textAnchor="middle" fontSize="13" fill={labelColor("output")} fontFamily="var(--ds-mono), monospace">⊙</text>
      <line x1="330" y1="92" x2="340" y2="110" stroke={wireColor(["output"])} strokeWidth="1.5" />

      {/* h_t output */}
      <line x1="360" y1="116" x2="390" y2="116" stroke={wireColor(["output"])} strokeWidth="1.5" />
      <text x="393" y="120" fontSize="10" fill={DS.t3} fontFamily="var(--ds-mono), monospace">h&#x2091;</text>

      {/* Gate labels (small, below circles) */}
      <text x="140" y="80" textAnchor="middle" fontSize="8" fill={active.has("forget") ? BLU : DS.dim} fontFamily="var(--ds-mono), monospace">forget</text>
      <text x="190" y="122" textAnchor="middle" fontSize="8" fill={active.has("input") ? BLU : DS.dim} fontFamily="var(--ds-mono), monospace">input</text>
      <text x="190" y="158" textAnchor="middle" fontSize="8" fill={active.has("candidate") ? BLU : DS.dim} fontFamily="var(--ds-mono), monospace">cand.</text>
      <text x="190" y="192" textAnchor="middle" fontSize="8" fill={active.has("output") ? BLU : DS.dim} fontFamily="var(--ds-mono), monospace">output</text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LSTMSequenceViz() {
  const [activeGate, setActiveGate] = useState(0);
  const gate = GATES[activeGate];

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", maxWidth: 700 }}>
      {/* Header */}
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        LSTM Gates: Managing Long-Range Memory
      </div>
      <p style={{
        fontSize: 12,
        color: DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        lineHeight: 1.6,
        marginBottom: 18,
      }}>
        An LSTM cell uses four gates to control what to remember, update, and output. Select each gate to see its role.
      </p>

      {/* Gate selector buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {GATES.map((g, i) => {
          const isActive = i === activeGate;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGate(i)}
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                border: `1.5px solid ${isActive ? BLU : DS.border}`,
                background: isActive ? BLU_DIM : "rgba(255,255,255,0.03)",
                color: isActive ? DS.t1 : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isActive ? `0 0 10px ${BLU_GLOW}` : "none",
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Main card: diagram + detail */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 20,
        alignItems: "start",
      }}>
        {/* SVG Diagram */}
        <div style={{
          background: "rgba(2,6,23,0.72)",
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          padding: "16px 12px",
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: BLU,
            fontFamily: "var(--ds-mono), monospace",
            marginBottom: 10,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            LSTM Cell Diagram
          </div>
          <LSTMDiagram activeCircles={gate.gateCircles} />
          <div style={{
            marginTop: 8,
            fontSize: 9,
            color: DS.t3,
            fontFamily: "var(--ds-mono), monospace",
            textAlign: "center",
          }}>
            Highlighted nodes (blue) = active path for {gate.label}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Formula */}
          <div style={{
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${DS.border}`,
            borderRadius: 10,
            padding: "12px 14px",
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginBottom: 6,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Formula
            </div>
            <div style={{
              fontSize: 12,
              color: BLU,
              fontFamily: "var(--ds-mono), monospace",
              lineHeight: 1.7,
              wordBreak: "break-word",
            }}>
              {gate.formula}
            </div>
          </div>

          {/* Explanation */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${DS.border}`,
            borderRadius: 10,
            padding: "12px 14px",
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginBottom: 6,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              What it does
            </div>
            <div style={{
              fontSize: 12,
              color: DS.t2,
              fontFamily: "var(--ds-sans), sans-serif",
              lineHeight: 1.6,
            }}>
              {gate.explanation}
            </div>
          </div>

          {/* Analogy */}
          <div style={{
            background: `${BLU_DIM}`,
            border: `1px solid rgba(14,165,233,0.22)`,
            borderRadius: 10,
            padding: "12px 14px",
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: BLU,
              fontFamily: "var(--ds-mono), monospace",
              marginBottom: 6,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Analogy
            </div>
            <div style={{
              fontSize: 12,
              color: DS.t2,
              fontFamily: "var(--ds-sans), sans-serif",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}>
              {gate.analogy}
            </div>
          </div>
        </div>
      </div>

      {/* Why LSTM beats vanilla RNN comparison table */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${DS.border}`,
        borderRadius: 12,
        padding: "16px",
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: DS.t1,
          fontFamily: "var(--ds-mono), monospace",
          marginBottom: 14,
        }}>
          Why LSTM beats Vanilla RNN
        </div>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 2fr 2fr",
          gap: 10,
          paddingBottom: 8,
          borderBottom: `1px solid ${DS.border}`,
          marginBottom: 4,
        }}>
          {["Property", "Vanilla RNN", "LSTM"].map((h) => (
            <div key={h} style={{
              fontSize: 10,
              fontWeight: 700,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {COMPARE_ROWS.map((row, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 2fr 2fr",
            gap: 10,
            padding: "10px 0",
            borderBottom: i < COMPARE_ROWS.length - 1 ? `1px solid ${DS.border}` : "none",
            alignItems: "start",
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: DS.t2,
              fontFamily: "var(--ds-mono), monospace",
              lineHeight: 1.4,
            }}>
              {row.property}
            </div>
            <div style={{
              fontSize: 11,
              color: row.rnnColor,
              fontFamily: "var(--ds-sans), sans-serif",
              lineHeight: 1.5,
            }}>
              {row.rnn}
            </div>
            <div style={{
              fontSize: 11,
              color: row.lstmColor,
              fontFamily: "var(--ds-sans), sans-serif",
              lineHeight: 1.5,
            }}>
              {row.lstm}
            </div>
          </div>
        ))}
      </div>

      {/* Footer insight */}
      <div style={{
        marginTop: 14,
        padding: "10px 14px",
        borderRadius: 10,
        background: "rgba(14,165,233,0.06)",
        border: `1px solid rgba(14,165,233,0.18)`,
        fontSize: 11,
        color: DS.t3,
        fontFamily: "var(--ds-sans), sans-serif",
        lineHeight: 1.6,
      }}>
        <span style={{ color: BLU, fontWeight: 700 }}>Interview tip: </span>
        The key insight examiners want is that the LSTM cell state uses{" "}
        <span style={{ color: DS.t2 }}>additive updates</span>, not multiplicative chained tanh — so gradients flow
        through the cell highway without exponential decay, solving the vanishing gradient problem.
      </div>
    </div>
  );
}
