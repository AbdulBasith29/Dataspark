import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const GREEN = "#34D399";
const PURPLE = "#A78BFA";
const AMBER = "#FBBF24";

// Simplified weight matrix dims for the visual grid (not the real 4096x4096 — illustrative)
const GRID_SIZE = 10; // 10x10 visual grid representing a d x k weight matrix
const RANKS = [4, 8, 16, 64];

const MODEL_PARAMS = 7_000_000_000; // 7B param model, illustrative base for full FT
const FULL_FT_TRAINABLE = MODEL_PARAMS; // full fine-tuning trains all weights

// Approximate trainable param counts at d=k=4096 per target module, scaled into the
// narrative numbers used in the lesson copy ("4M trainable params" for typical LoRA setup)
const LORA_TRAINABLE_BY_RANK = {
  4: 1_700_000,
  8: 3_400_000,
  16: 6_800_000,
  64: 27_200_000,
};

const DECISION_FACTORS = [
  {
    id: "dataSize",
    label: "Dataset Size",
    options: [
      { id: "small", label: "< 500 examples", lora: true, note: "Too little data to safely update billions of params — full FT will overfit and forget." },
      { id: "medium", label: "500 – 10,000 examples", lora: true, note: "LoRA's sweet spot. Enough signal to learn the task without the capacity to memorize noise." },
      { id: "large", label: "50,000+ examples", lora: false, note: "Enough data to justify full fine-tuning's extra capacity, if compute allows." },
    ],
  },
  {
    id: "compute",
    label: "Compute Budget",
    options: [
      { id: "low", label: "1 consumer GPU", lora: true, note: "QLoRA fits a 7B–13B model in 24GB VRAM. Full FT needs multi-GPU clusters." },
      { id: "medium", label: "Small GPU cluster", lora: true, note: "LoRA still wins on cost — same quality ceiling for most tasks at a fraction of the spend." },
      { id: "high", label: "Large GPU cluster, cost no constraint", lora: false, note: "If budget truly isn't a constraint, full FT has a marginally higher ceiling for deep behavioral change." },
    ],
  },
  {
    id: "task",
    label: "Task Type",
    options: [
      { id: "style", label: "Style / format / tone change", lora: true, note: "LoRA excels at narrow, low-rank behavioral shifts like format adherence and persona." },
      { id: "domain", label: "New domain vocabulary", lora: true, note: "Still LoRA territory — target more modules (q/k/v/o + MLP) for more capacity if needed." },
      { id: "knowledge", label: "Injecting large amounts of new factual knowledge", lora: false, note: "Neither LoRA nor full FT is ideal here — prefer RAG. If you must bake in knowledge at scale, full FT has more capacity." },
    ],
  },
];

function formatParams(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export default function LoRAFineTuningViz() {
  const [method, setMethod] = useState("lora"); // "full" | "lora"
  const [rank, setRank] = useState(8);
  const [choices, setChoices] = useState({}); // decision helper selections

  const trainableParams = method === "full" ? FULL_FT_TRAINABLE : LORA_TRAINABLE_BY_RANK[rank];
  const reductionFactor = Math.round(FULL_FT_TRAINABLE / trainableParams);
  const trainablePct = (trainableParams / MODEL_PARAMS) * 100;

  function setChoice(factorId, optionId) {
    setChoices((prev) => ({ ...prev, [factorId]: optionId }));
  }

  const recommendation = useMemo(() => {
    const selected = DECISION_FACTORS.filter((f) => choices[f.id]);
    if (selected.length === 0) return null;
    const loraVotes = selected.filter((f) => {
      const opt = f.options.find((o) => o.id === choices[f.id]);
      return opt?.lora;
    }).length;
    const fullVotes = selected.length - loraVotes;
    if (loraVotes >= fullVotes) return "lora";
    return "full";
  }, [choices]);

  // Build grid coloring: full FT highlights every cell, LoRA highlights only a thin
  // "low-rank" band (rows from A, cols from B) proportional to rank/GRID_SIZE
  const rankBandSize = Math.max(1, Math.round((rank / 64) * 4)); // visual thickness 1-4 cells

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
          Full Fine-Tuning vs. LoRA
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          See exactly how many parameters each method updates — and when to reach for which.
        </p>
      </div>

      {/* Method toggle */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {[
          { id: "full", label: "Full Fine-Tuning" },
          { id: "lora", label: "LoRA" },
        ].map(({ id, label }) => {
          const active = id === method;
          return (
            <button
              key={id}
              onClick={() => setMethod(id)}
              style={{
                padding: "8px 18px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                color: active ? CYAN : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Weight matrix visualization */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "16px 16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          {method === "full" ? "W (d×k) — every weight updated" : "W frozen + ΔW = A×B (low-rank update)"}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: method === "lora" ? 14 : 0, alignItems: "center" }}>
          {method === "full" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gap: 2,
                width: 280,
                height: 280,
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: CYAN,
                    opacity: 0.55,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Matrix A: d x r -> tall thin */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${rankBandSize}, 1fr)`,
                    gap: 2,
                    width: rankBandSize * 14,
                    height: 220,
                  }}
                >
                  {Array.from({ length: GRID_SIZE * rankBandSize }).map((_, i) => (
                    <div
                      key={i}
                      style={{ background: PURPLE, opacity: 0.7, borderRadius: 2, transition: "all 0.2s ease" }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: PURPLE, fontFamily: "var(--ds-mono), monospace" }}>
                  A (d×r)
                </span>
              </div>

              <span style={{ fontSize: 18, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>×</span>

              {/* Matrix B: r x k -> short wide */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gap: 2,
                    width: 220,
                    height: rankBandSize * 14,
                  }}
                >
                  {Array.from({ length: rankBandSize * GRID_SIZE }).map((_, i) => (
                    <div
                      key={i}
                      style={{ background: CYAN, opacity: 0.7, borderRadius: 2, transition: "all 0.2s ease" }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: CYAN, fontFamily: "var(--ds-mono), monospace" }}>
                  B (r×k)
                </span>
              </div>

              <span style={{ fontSize: 18, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>=</span>

              {/* Resulting ΔW shown as faint full grid with a highlighted band */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  gap: 2,
                  width: 160,
                  height: 160,
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: GREEN,
                      opacity: 0.18,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {method === "lora" && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              {RANKS.map((r) => {
                const active = r === rank;
                return (
                  <button
                    key={r}
                    onClick={() => setRank(r)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: `1.5px solid ${active ? PURPLE : DS.border}`,
                      background: active ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.02)",
                      color: active ? PURPLE : DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 12,
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    r={r}
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: "center", fontSize: 11.5, color: DS.t3 }}>
              Higher rank = thicker A/B bands = more capacity, more overfitting risk on small datasets
            </div>
          </div>
        )}
      </div>

      {/* Param counter */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "16px 10px",
            borderRadius: DS.radiusMd,
            border: `1px solid ${method === "full" ? CYAN_MID : DS.border}`,
            background: method === "full" ? CYAN_DIM : "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ fontSize: 11, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Trainable Params
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: method === "full" ? CYAN : DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              marginTop: 4,
            }}
          >
            {formatParams(trainableParams)}
          </div>
          <div style={{ fontSize: 11, color: DS.t3, marginTop: 2 }}>
            {trainablePct.toFixed(method === "full" ? 0 : 3)}% of {formatParams(MODEL_PARAMS)} model
          </div>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "16px 10px",
            borderRadius: DS.radiusMd,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ fontSize: 11, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Reduction vs. Full FT
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: method === "lora" ? GREEN : DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginTop: 4,
            }}
          >
            {method === "lora" ? `${reductionFactor}×` : "1×"}
          </div>
          <div style={{ fontSize: 11, color: DS.t3, marginTop: 2 }}>
            {method === "lora" ? "fewer trainable parameters" : "baseline (trains everything)"}
          </div>
        </div>
      </div>

      {/* Decision helper */}
      <div
        style={{
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 12,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600, color: DS.t1, marginBottom: 10 }}>
          Decision Helper: LoRA or Full Fine-Tune?
        </div>
        {DECISION_FACTORS.map((factor) => (
          <div key={factor.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: DS.t3, marginBottom: 6 }}>{factor.label}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {factor.options.map((opt) => {
                const active = choices[factor.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setChoice(factor.id, opt.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: DS.radiusSm,
                      border: `1.5px solid ${active ? CYAN : DS.border}`,
                      background: active ? CYAN_DIM : "rgba(255,255,255,0.015)",
                      color: active ? CYAN : DS.t2,
                      fontFamily: "var(--ds-sans), sans-serif",
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {choices[factor.id] && (
              <div style={{ marginTop: 6, fontSize: 11.5, color: DS.t3, lineHeight: "16px" }}>
                {factor.options.find((o) => o.id === choices[factor.id])?.note}
              </div>
            )}
          </div>
        ))}

        {recommendation && (
          <div
            style={{
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: DS.radiusSm,
              background: recommendation === "lora" ? "rgba(52,211,153,0.10)" : "rgba(6,182,212,0.10)",
              border: `1px solid ${recommendation === "lora" ? "rgba(52,211,153,0.30)" : "rgba(6,182,212,0.30)"}`,
              fontSize: 13,
              color: DS.t1,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Based on your selections: {recommendation === "lora" ? "LoRA / QLoRA is the better fit" : "Full fine-tuning is justified here"}
          </div>
        )}
      </div>

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
        B is initialized to zero, so ΔW = A×B = 0 at the start of training — the LoRA model
        begins as an exact copy of the base model and only diverges as training proceeds.
      </div>
    </div>
  );
}
