import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component to avoid TDZ crashes) ──────────────
const ACCENT = "#EC4899";

const TABS = [
  { id: "layers", label: "Pretrained → Fine-tuned" },
  { id: "strategies", label: "Strategy Comparison" },
  { id: "lr", label: "Learning Rate" },
];

const TOTAL_LAYERS = 8;

// Layers from bottom (index 0) to top (index 7)
const LAYER_LABELS = [
  "Conv Block 1 (edges)",
  "Conv Block 2 (textures)",
  "Conv Block 3 (shapes)",
  "Conv Block 4 (parts)",
  "Conv Block 5 (objects)",
  "Global Avg Pool",
  "Dense 512",
  "Classifier Head",
];

const PARAM_COUNTS = [0.09, 0.18, 0.36, 0.72, 1.44, 0.05, 0.26, 0.02]; // millions

const STRATEGIES = [
  {
    id: "extract",
    label: "Feature Extraction",
    subtitle: "Freeze all → train head only",
    unfreeze: 0,
    color: DS.grn,
    colorBg: "rgba(52,211,153,0.1)",
    colorBorder: "rgba(52,211,153,0.35)",
    whenToUse: "Small dataset (<1K samples). Target domain similar to source.",
    dataReq: "Low",
    dataReqColor: DS.grn,
    trainTime: "Fast (minutes)",
    trainTimeColor: DS.grn,
    risk: "Low overfitting",
    riskColor: DS.grn,
    lr: "1e-3 to 1e-2",
  },
  {
    id: "partial",
    label: "Partial Fine-tuning",
    subtitle: "Freeze early layers, unfreeze last N",
    unfreeze: 3,
    color: "rgba(251,191,36,0.9)",
    colorBg: "rgba(251,191,36,0.08)",
    colorBorder: "rgba(251,191,36,0.35)",
    whenToUse: "Medium dataset (1K–100K). Some domain shift.",
    dataReq: "Medium",
    dataReqColor: "rgba(251,191,36,0.9)",
    trainTime: "Moderate (hours)",
    trainTimeColor: "rgba(251,191,36,0.9)",
    risk: "Moderate",
    riskColor: "rgba(251,191,36,0.9)",
    lr: "1e-4 to 1e-3",
  },
  {
    id: "full",
    label: "Full Fine-tuning",
    subtitle: "Unfreeze everything, very low LR",
    unfreeze: TOTAL_LAYERS,
    color: ACCENT,
    colorBg: `${ACCENT}12`,
    colorBorder: `${ACCENT}44`,
    whenToUse: "Large dataset (>100K). Significant domain shift.",
    dataReq: "High",
    dataReqColor: "rgba(248,113,113,0.9)",
    trainTime: "Slow (days)",
    trainTimeColor: "rgba(248,113,113,0.9)",
    risk: "Catastrophic forgetting risk",
    riskColor: "rgba(248,113,113,0.9)",
    lr: "1e-5 to 1e-4",
  },
];

// LR values for discriminative LR tab (output layer index 7 has highest LR)
const LR_VALUES = [1e-6, 1e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4, 3e-4];

// ── Helper styles ─────────────────────────────────────────────────────────────
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

function formatLR(v) {
  if (v >= 1e-3) return v.toExponential(0);
  const exp = Math.floor(Math.log10(v));
  const man = v / Math.pow(10, exp);
  if (Math.abs(man - 1) < 0.01) return `1e${exp}`;
  return `${man.toFixed(0)}e${exp}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function LayersTab() {
  const [unfreezeCount, setUnfreezeCount] = useState(1);

  // Layers displayed bottom → top; index 0 is bottom (most frozen)
  const frozenCount = TOTAL_LAYERS - unfreezeCount;
  const trainableParams = PARAM_COUNTS.slice(frozenCount).reduce((a, b) => a + b, 0);
  const totalParams = PARAM_COUNTS.reduce((a, b) => a + b, 0);
  const pct = ((trainableParams / totalParams) * 100).toFixed(1);

  const strategyLabel =
    unfreezeCount === 0
      ? "Feature Extraction"
      : unfreezeCount === TOTAL_LAYERS
      ? "Full Fine-tuning"
      : "Partial Fine-tuning";

  return (
    <div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        Pretrained layers encode general features. Drag the slider to choose how many layers to unfreeze for training.{" "}
        <span style={{ color: DS.t2 }}>Blue = frozen</span>, <span style={{ color: ACCENT }}>pink = trainable</span>.
      </p>

      {/* Layer stack */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginBottom: 18,
        padding: 12,
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: `1px solid ${DS.border}`,
      }}>
        {[...LAYER_LABELS].reverse().map((label, revIdx) => {
          const idx = TOTAL_LAYERS - 1 - revIdx; // original index
          const isTrainable = idx >= frozenCount;
          return (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${isTrainable ? `${ACCENT}55` : "rgba(56,189,248,0.2)"}`,
              background: isTrainable ? `${ACCENT}12` : "rgba(56,189,248,0.06)",
              transition: "all 0.2s ease",
            }}>
              {/* Lock / unlock icon */}
              <div style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: isTrainable ? `${ACCENT}33` : "rgba(56,189,248,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                flexShrink: 0,
              }}>
                {isTrainable ? "▶" : "🔒"}
              </div>

              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: "var(--ds-mono), monospace",
                  color: isTrainable ? DS.t1 : DS.t3,
                  fontWeight: isTrainable ? 600 : 400,
                }}>
                  {label}
                </span>
              </div>

              <div style={{
                fontSize: 10,
                fontFamily: "var(--ds-mono), monospace",
                color: isTrainable ? ACCENT : "rgba(56,189,248,0.7)",
                flexShrink: 0,
              }}>
                {PARAM_COUNTS[idx].toFixed(2)}M {isTrainable ? "trainable" : "frozen"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider */}
      <label style={{ display: "block", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          Layers to unfreeze: {unfreezeCount} / {TOTAL_LAYERS}
          {" · "}
          <span style={{ color: ACCENT }}>{strategyLabel}</span>
        </div>
        <input
          type="range"
          min={0}
          max={TOTAL_LAYERS}
          step={1}
          value={unfreezeCount}
          onChange={(e) => setUnfreezeCount(+e.target.value)}
          style={{ width: "100%", accentColor: ACCENT }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginTop: 4 }}>
          <span>0 (Feature Extraction)</span>
          <span>8 (Full Fine-tuning)</span>
        </div>
      </label>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
      }}>
        {[
          { label: "Trainable params", value: `${trainableParams.toFixed(2)}M`, color: ACCENT },
          { label: "Frozen params", value: `${(totalParams - trainableParams).toFixed(2)}M`, color: "rgba(56,189,248,0.8)" },
          { label: "Training %", value: `${pct}%`, color: DS.t2 },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: "10px 12px",
            borderRadius: 9,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${DS.border}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: stat.color, fontFamily: "var(--ds-mono), monospace" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-sans), sans-serif", marginTop: 3 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategiesTab() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        Three core strategies. Click a card to expand details. Your data size and domain shift determine the best choice.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {STRATEGIES.map((s) => {
          const isOpen = selected === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(isOpen ? null : s.id)}
              style={{
                padding: "14px 16px",
                borderRadius: 11,
                border: `1.5px solid ${isOpen ? s.color : DS.border}`,
                background: isOpen ? s.colorBg : "rgba(255,255,255,0.02)",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "var(--ds-mono), monospace" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif", marginTop: 2 }}>
                    {s.subtitle}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: DS.dim }}>{isOpen ? "▲" : "▼"}</div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "When to use", value: s.whenToUse, color: DS.t2 },
                    { label: "Data requirement", value: s.dataReq, color: s.dataReqColor },
                    { label: "Training time", value: s.trainTime, color: s.trainTimeColor },
                    { label: "Risk", value: s.risk, color: s.riskColor },
                    { label: "Learning rate", value: s.lr, color: DS.t2 },
                  ].map((item) => (
                    <div key={item.label} style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${DS.border}`,
                    }}>
                      <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 3 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: item.color, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.4 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Decision guide */}
      <div style={{
        padding: "14px 16px",
        borderRadius: 11,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${DS.border}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: DS.t2, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
          Decision guide: data size → strategy
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { range: "< 1K samples", strategy: "Feature Extraction", color: DS.grn },
            { range: "1K – 100K samples", strategy: "Partial Fine-tuning", color: "rgba(251,191,36,0.9)" },
            { range: "> 100K samples", strategy: "Full Fine-tuning (very low LR)", color: ACCENT },
          ].map((row) => (
            <div key={row.range} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{
                width: 130,
                fontSize: 10,
                color: DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                flexShrink: 0,
              }}>
                {row.range}
              </div>
              <div style={{ fontSize: 9, color: DS.dim }}>→</div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: row.color,
                fontFamily: "var(--ds-mono), monospace",
              }}>
                {row.strategy}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LRTab() {
  const [hovered, setHovered] = useState(null);

  const maxLR = LR_VALUES[LR_VALUES.length - 1];

  return (
    <div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6, marginBottom: 16 }}>
        <span style={{ color: DS.t2 }}>Discriminative learning rates</span>: early layers (general features) get 10–100x smaller LR than later layers (task-specific). Hover a layer to inspect.
      </p>

      {/* LR bar chart — layers output→input */}
      <div style={{
        padding: "14px 14px 10px",
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: `1px solid ${DS.border}`,
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 12 }}>
          Learning rate per layer (output layer at top)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...LAYER_LABELS].map((label, revIdx) => {
            const idx = TOTAL_LAYERS - 1 - revIdx;
            const lr = LR_VALUES[idx];
            const barWidth = Math.max(4, (lr / maxLR) * 100);
            const isHov = hovered === idx;
            const ratio = maxLR / lr;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "default" }}
              >
                {/* Layer name */}
                <div style={{
                  width: 140,
                  fontSize: 10,
                  color: isHov ? DS.t1 : DS.t3,
                  fontFamily: "var(--ds-mono), monospace",
                  flexShrink: 0,
                  transition: "color 0.15s ease",
                }}>
                  {label}
                </div>

                {/* Bar */}
                <div style={{ flex: 1, height: 14, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: isHov
                      ? `linear-gradient(90deg, rgba(56,189,248,0.7), ${ACCENT})`
                      : `linear-gradient(90deg, rgba(56,189,248,0.35), rgba(236,72,153,0.5))`,
                    transition: "all 0.15s ease",
                  }} />
                </div>

                {/* LR value */}
                <div style={{
                  width: 52,
                  fontSize: 10,
                  color: isHov ? ACCENT : DS.dim,
                  fontFamily: "var(--ds-mono), monospace",
                  textAlign: "right",
                  flexShrink: 0,
                  transition: "color 0.15s ease",
                }}>
                  {formatLR(lr)}
                </div>

                {/* Ratio badge on hover */}
                {isHov && ratio > 1 && (
                  <div style={{
                    fontSize: 9,
                    color: "rgba(251,191,36,0.9)",
                    fontFamily: "var(--ds-mono), monospace",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}>
                    ÷{ratio >= 10 ? Math.round(ratio) : ratio.toFixed(0)}x vs head
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          {
            title: "Early layers",
            sub: "Edges, textures, shapes",
            detail: "Learn universal low-level features. Rarely need updating — high LR would destroy them (catastrophic forgetting).",
            color: "rgba(56,189,248,0.85)",
            colorBg: "rgba(56,189,248,0.08)",
          },
          {
            title: "Late layers",
            sub: "Task-specific representations",
            detail: "Highly domain-specific. Need more plasticity to adapt to the new task. Use 10–100x larger LR.",
            color: ACCENT,
            colorBg: `${ACCENT}10`,
          },
        ].map((card) => (
          <div key={card.title} style={{
            padding: "12px",
            borderRadius: 10,
            background: card.colorBg,
            border: `1px solid ${card.color}44`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: card.color, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6 }}>
              {card.sub}
            </div>
            <div style={{ fontSize: 11, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
              {card.detail}
            </div>
          </div>
        ))}
      </div>

      {/* LoRA callout */}
      <div style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: `${ACCENT}0e`,
        border: `1px solid ${ACCENT}33`,
        fontSize: 11,
        color: DS.t3,
        fontFamily: "var(--ds-sans), sans-serif",
        lineHeight: 1.55,
      }}>
        <span style={{ color: ACCENT, fontWeight: 700 }}>LoRA alternative:</span> instead of discriminative LR, LoRA freezes all original weights and adds small trainable low-rank matrices (r=8–64) to each layer. Achieves 10–100x fewer trainable parameters with similar accuracy.
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DLTransferLearningViz() {
  const [activeTab, setActiveTab] = useState("layers");

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Transfer Learning &amp; Fine-Tuning
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        How to reuse pretrained weights: choose which layers to freeze, which strategy fits your data size, and how to set discriminative learning rates.
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
      {activeTab === "layers" && <LayersTab />}
      {activeTab === "strategies" && <StrategiesTab />}
      {activeTab === "lr" && <LRTab />}
    </div>
  );
}
