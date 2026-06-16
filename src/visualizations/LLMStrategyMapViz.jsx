import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const GREEN = "#34D399";
const AMBER = "#FBBF24";
const RED = "#F87171";
const PURPLE = "#A78BFA";

// Constraint toggles the learner can flip.
const CONSTRAINTS = [
  {
    id: "freshData",
    label: "Needs fresh / frequently-changing data",
    hint: "e.g. pricing, inventory, hourly-updated facts",
  },
  {
    id: "newBehavior",
    label: "Needs new behavior, format, or style baked in",
    hint: "e.g. strict JSON schema, legal citation format, brand voice",
  },
  {
    id: "largeCorpus",
    label: "Knowledge lives in a large proprietary document set",
    hint: "10K+ documents, internal wikis, manuals",
  },
  {
    id: "needsCitations",
    label: "Needs citations / provenance for answers",
    hint: "compliance, legal, medical — must point to source",
  },
  {
    id: "tightBudget",
    label: "Tight engineering budget / need results today",
    hint: "no infra, no labeled data pipeline available",
  },
  {
    id: "highVolumeNarrow",
    label: "High-volume narrow task (e.g. classification at scale)",
    hint: "cost-per-call matters more than flexibility",
  },
];

const STRATEGIES = {
  prompting: {
    id: "prompting",
    label: "Prompting",
    color: CYAN_BRIGHT,
    tagline: "Change the input, not the model.",
    tradeoffs: {
      cost: "Lowest — API calls only",
      latency: "Lowest",
      freshness: "None (frozen at training time)",
      complexity: "Trivial — no infra",
    },
  },
  rag: {
    id: "rag",
    label: "RAG",
    color: GREEN,
    tagline: "Decouple knowledge storage from the model.",
    tradeoffs: {
      cost: "Medium — vector DB + embedding + API calls",
      latency: "Medium (+ retrieval overhead, 50–300ms)",
      freshness: "High — re-index in minutes",
      complexity: "Moderate — chunking + retrieval pipeline",
    },
  },
  finetune: {
    id: "finetune",
    label: "Fine-Tuning",
    color: PURPLE,
    tagline: "Continue training the model on your data.",
    tradeoffs: {
      cost: "High upfront — GPU-hours + labeled data",
      latency: "Lowest after training",
      freshness: "None — frozen until retrained",
      complexity: "High — training pipeline + model artifact",
    },
  },
  hybrid: {
    id: "hybrid",
    label: "Hybrid (RAG + Fine-Tune + Prompting)",
    color: AMBER,
    tagline: "Each layer compensates for the others' weaknesses.",
    tradeoffs: {
      cost: "Highest — all infra + training cost combined",
      latency: "Medium — dominated by retrieval, mitigated by tuned model",
      freshness: "High — RAG carries freshness",
      complexity: "Highest — full production stack",
    },
  },
};

// Decision function: given the constraint flags, return the recommended strategy id + reasoning bullets.
function recommend(flags) {
  const { freshData, newBehavior, largeCorpus, needsCitations, tightBudget, highVolumeNarrow } = flags;
  const reasons = [];

  const needsRetrieval = freshData || largeCorpus || needsCitations;
  const needsBehaviorChange = newBehavior || highVolumeNarrow;

  if (tightBudget && !needsRetrieval && !needsBehaviorChange) {
    reasons.push("No retrieval or behavior-change requirement triggered, and budget/time is tight.");
    reasons.push("The model likely already has this knowledge in its weights — prompting is the cheapest lever.");
    return { id: "prompting", reasons };
  }

  if (needsRetrieval && needsBehaviorChange) {
    reasons.push("Fresh/large/citable knowledge needs (" +
      [freshData && "freshness", largeCorpus && "large corpus", needsCitations && "citations"].filter(Boolean).join(", ") +
      ") point to RAG.");
    reasons.push("Behavior/format/volume needs (" +
      [newBehavior && "new format or style", highVolumeNarrow && "high-volume narrow task"].filter(Boolean).join(", ") +
      ") point to fine-tuning.");
    reasons.push("Neither alone covers both — combine: fine-tuning handles style/consistency, RAG handles grounding and freshness.");
    return { id: "hybrid", reasons };
  }

  if (needsRetrieval) {
    if (freshData) reasons.push("Data changes frequently — fine-tuning would be stale within hours/days; RAG re-indexes in minutes.");
    if (largeCorpus) reasons.push("Knowledge volume exceeds what fits in a prompt's context window — RAG retrieves only the relevant slice.");
    if (needsCitations) reasons.push("Provenance is required — RAG can return the source chunks alongside the answer; fine-tuning cannot.");
    return { id: "rag", reasons };
  }

  if (needsBehaviorChange) {
    if (newBehavior) reasons.push("A persistent format/style/vocabulary change is needed — prompting is variable across calls, fine-tuning bakes it in.");
    if (highVolumeNarrow) reasons.push("At high volume, a small fine-tuned model can match a large prompted model at a fraction of the inference cost.");
    return { id: "finetune", reasons };
  }

  reasons.push("No constraint strongly favors RAG or fine-tuning — start with prompting and add complexity only when it proves insufficient.");
  return { id: "prompting", reasons };
}

const TRADEOFF_ROWS = [
  { key: "cost", label: "Cost to implement" },
  { key: "latency", label: "End-to-end latency" },
  { key: "freshness", label: "Data freshness" },
  { key: "complexity", label: "Implementation complexity" },
];

export default function LLMStrategyMapViz() {
  const [flags, setFlags] = useState({
    freshData: false,
    newBehavior: false,
    largeCorpus: false,
    needsCitations: false,
    tightBudget: false,
    highVolumeNarrow: false,
  });

  const result = useMemo(() => recommend(flags), [flags]);
  const recommended = STRATEGIES[result.id];

  function toggle(id) {
    setFlags((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleReset() {
    setFlags({
      freshData: false,
      newBehavior: false,
      largeCorpus: false,
      needsCitations: false,
      tightBudget: false,
      highVolumeNarrow: false,
    });
  }

  const anyActive = Object.values(flags).some(Boolean);

  return (
    <div
      style={{
        maxWidth: 700,
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
          The Strategy Map
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Toggle your constraints — watch which strategy (or combination) the decision framework recommends.
        </p>
      </div>

      {/* Constraint toggles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 18,
        }}
        className="ds-g2"
      >
        {CONSTRAINTS.map((c) => {
          const active = flags[c.id];
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: DS.radiusMd,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    flexShrink: 0,
                    border: `1.5px solid ${active ? CYAN_BRIGHT : DS.dim}`,
                    background: active ? CYAN_BRIGHT : "transparent",
                  }}
                />
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: active ? DS.t1 : DS.t2,
                  }}
                >
                  {c.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: DS.t3, paddingLeft: 22 }}>{c.hint}</div>
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <button
          onClick={handleReset}
          disabled={!anyActive}
          style={{
            padding: "6px 14px",
            borderRadius: DS.radiusSm,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
            color: anyActive ? DS.t3 : DS.dim,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 12,
            cursor: anyActive ? "pointer" : "not-allowed",
            outline: "none",
          }}
        >
          Reset constraints
        </button>
      </div>

      {/* Recommendation card */}
      <div
        style={{
          background: `rgba(${recommended.color === CYAN_BRIGHT ? "6,182,212" : recommended.color === GREEN ? "52,211,153" : recommended.color === PURPLE ? "167,139,250" : "251,191,36"},0.10)`,
          border: `1.5px solid ${recommended.color}`,
          borderRadius: DS.radiusMd,
          padding: "16px 18px",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          Recommended Strategy
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: recommended.color, marginBottom: 4 }}>
          {recommended.label}
        </div>
        <div style={{ fontSize: 13, color: DS.t2, marginBottom: 12 }}>{recommended.tagline}</div>
        <div style={{ display: "grid", gap: 6 }}>
          {result.reasons.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: DS.t2, lineHeight: "18px" }}>
              <span style={{ color: recommended.color, flexShrink: 0 }}>→</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy chips row showing all 4, recommended highlighted */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {Object.values(STRATEGIES).map((s) => {
          const isRec = s.id === recommended.id;
          return (
            <div
              key={s.id}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                border: `1.5px solid ${isRec ? s.color : DS.border}`,
                background: isRec ? "rgba(255,255,255,0.04)" : "transparent",
                fontSize: 12,
                fontWeight: isRec ? 700 : 400,
                color: isRec ? s.color : DS.dim,
                transition: "all 0.15s ease",
              }}
            >
              {isRec ? "● " : "○ "}
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Trade-off table — updates live for the recommended strategy vs the other three */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 16,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Trade-off Table
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", color: DS.t3, fontWeight: 500, borderBottom: `1px solid ${DS.border}` }}>
                Dimension
              </th>
              {Object.values(STRATEGIES).map((s) => (
                <th
                  key={s.id}
                  style={{
                    textAlign: "left",
                    padding: "6px 8px",
                    color: s.id === recommended.id ? s.color : DS.t3,
                    fontWeight: s.id === recommended.id ? 700 : 500,
                    borderBottom: `1px solid ${DS.border}`,
                    background: s.id === recommended.id ? "rgba(255,255,255,0.03)" : "transparent",
                  }}
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRADEOFF_ROWS.map((row) => (
              <tr key={row.key}>
                <td style={{ padding: "8px 8px", color: DS.t2, fontWeight: 600, borderBottom: `1px solid ${DS.border}` }}>
                  {row.label}
                </td>
                {Object.values(STRATEGIES).map((s) => (
                  <td
                    key={s.id}
                    style={{
                      padding: "8px 8px",
                      color: s.id === recommended.id ? DS.t1 : DS.t3,
                      borderBottom: `1px solid ${DS.border}`,
                      background: s.id === recommended.id ? "rgba(255,255,255,0.03)" : "transparent",
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 11.5,
                    }}
                  >
                    {s.tradeoffs[row.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
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
        The core trap: "just fine-tune on all our documents" feels intuitive but fails on freshness, provenance,
        and retraining cost. Fine-tuning teaches <strong style={{ color: DS.t1 }}>behavior</strong>; RAG provides{" "}
        <strong style={{ color: DS.t1 }}>knowledge</strong>. Most mature production systems land on the hybrid
        corner of this map — a fine-tuned model consuming live-retrieved context, steered by a few-shot system prompt.
      </div>
    </div>
  );
}
