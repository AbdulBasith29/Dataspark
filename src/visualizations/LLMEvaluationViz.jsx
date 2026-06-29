import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const GREEN = "#34D399";
const RED = "#F87171";
const AMBER = "#FBBF24";

const QUESTION = "What are the side effects of metformin?";

const CONTEXT_CHUNKS = [
  "Metformin's most common side effects are gastrointestinal: nausea, diarrhea, and abdominal discomfort, especially when starting treatment.",
  "Rare but serious: lactic acidosis, particularly in patients with kidney impairment.",
  "Long-term use can lead to vitamin B12 deficiency due to reduced intestinal absorption.",
];

const EXAMPLES = {
  good: {
    label: "Good Response",
    response:
      "Metformin commonly causes gastrointestinal side effects like nausea, diarrhea, and abdominal discomfort, especially when first starting the medication. A rare but serious risk is lactic acidosis, particularly in patients with kidney problems. Long-term use is also associated with vitamin B12 deficiency, so periodic monitoring is recommended.",
    scores: {
      faithfulness: {
        score: 0.95,
        rationale:
          "Every claim (GI upset, lactic acidosis risk in kidney impairment, B12 deficiency) traces directly back to a retrieved chunk. No unsupported additions.",
      },
      relevancy: {
        score: 0.92,
        rationale:
          "The response stays tightly focused on side effects — exactly what was asked — without drifting into dosing, mechanism of action, or unrelated drug info.",
      },
      contextPrecision: {
        score: 0.88,
        rationale:
          "All three retrieved chunks were used to build the answer. Almost nothing retrieved went to waste.",
      },
      contextRecall: {
        score: 0.85,
        rationale:
          "Covers the three documented side-effect categories (GI, lactic acidosis, B12) that the ground-truth answer expects. Minor dosage-specific nuance omitted.",
      },
    },
  },
  bad: {
    label: "Bad Response",
    response:
      "Metformin is generally very safe with minimal side effects for most patients. Some people report mild headaches and dizziness. It's also been shown to slightly lower cholesterol levels in long-term studies, which is a nice added benefit alongside blood sugar control.",
    scores: {
      faithfulness: {
        score: 0.15,
        rationale:
          "Headaches, dizziness, and cholesterol-lowering are NOT in the retrieved context — these are hallucinated claims with no grounding in the source chunks.",
      },
      relevancy: {
        score: 0.55,
        rationale:
          "Technically answers 'what are the side effects' but pivots into an unrelated cholesterol benefit, diluting focus on the actual question.",
      },
      contextPrecision: {
        score: 0.30,
        rationale:
          "The retrieved chunks about GI issues, lactic acidosis, and B12 deficiency were barely used — most of the answer was invented instead of drawn from context.",
      },
      contextRecall: {
        score: 0.10,
        rationale:
          "Misses all three documented side-effect categories from the ground truth (GI symptoms, lactic acidosis, B12 deficiency) entirely.",
      },
    },
  },
};

const DIMENSIONS = [
  {
    id: "faithfulness",
    label: "Answer Faithfulness",
    short: "Hallucination check",
    definition: "Is every claim in the answer supported by the retrieved context?",
  },
  {
    id: "relevancy",
    label: "Answer Relevancy",
    short: "On-topic check",
    definition: "Does the answer actually address the question that was asked?",
  },
  {
    id: "contextPrecision",
    label: "Context Precision",
    short: "Retrieval noise check",
    definition: "Of the retrieved chunks, how many actually contributed to the answer?",
  },
  {
    id: "contextRecall",
    label: "Context Recall",
    short: "Retrieval coverage check",
    definition: "Did the retriever fetch all the information needed to answer fully?",
  },
];

function scoreColor(score) {
  if (score >= 0.75) return GREEN;
  if (score >= 0.45) return AMBER;
  return RED;
}

function ScoreBar({ score }) {
  const color = scoreColor(score);
  return (
    <div
      style={{
        position: "relative",
        height: 8,
        borderRadius: 99,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${Math.round(score * 100)}%`,
          background: color,
          borderRadius: 99,
          transition: "width 0.35s var(--ds-ease-out, ease)",
        }}
      />
    </div>
  );
}

export default function LLMEvaluationViz() {
  const [exampleId, setExampleId] = useState("good");
  const [expandedDim, setExpandedDim] = useState("faithfulness");

  const example = EXAMPLES[exampleId];
  const avgScore =
    DIMENSIONS.reduce((sum, d) => sum + example.scores[d.id].score, 0) / DIMENSIONS.length;

  return (
    <div
      style={{
        maxWidth: 680,
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
          LLM-as-Judge: RAGAS Evaluation
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Watch the same RAGAS dimensions score a good vs. bad response to the identical question.
        </p>
      </div>

      {/* Toggle: good vs bad */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {["good", "bad"].map((id) => {
          const active = id === exampleId;
          const color = id === "good" ? GREEN : RED;
          return (
            <button
              key={id}
              onClick={() => setExampleId(id)}
              style={{
                padding: "8px 18px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? color : DS.border}`,
                background: active ? `${color}1F` : "rgba(255,255,255,0.02)",
                color: active ? color : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {EXAMPLES[id].label}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div
        style={{
          background: CYAN_DIM,
          border: `1px solid rgba(6,182,212,0.25)`,
          borderRadius: DS.radiusMd,
          padding: "9px 14px",
          marginBottom: 12,
          fontSize: 13,
          color: DS.t2,
          textAlign: "center",
        }}
      >
        <span style={{ color: CYAN, fontWeight: 600 }}>Question: </span>
        {QUESTION}
      </div>

      {/* Retrieved context */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "12px 14px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Retrieved Context (3 chunks)
        </div>
        {CONTEXT_CHUNKS.map((chunk, i) => (
          <div
            key={i}
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11.5,
              color: DS.t2,
              lineHeight: "18px",
              padding: "6px 8px",
              marginBottom: i < CONTEXT_CHUNKS.length - 1 ? 6 : 0,
              background: "rgba(255,255,255,0.02)",
              borderRadius: 6,
              border: `1px solid ${DS.border}`,
            }}
          >
            {chunk}
          </div>
        ))}
      </div>

      {/* LLM response */}
      <div
        style={{
          background: exampleId === "good" ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
          border: `1px solid ${exampleId === "good" ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
          borderRadius: DS.radiusMd,
          padding: "12px 14px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Generated Response
        </div>
        <div style={{ fontSize: 13, color: DS.t1, lineHeight: "20px" }}>{example.response}</div>
      </div>

      {/* Overall score */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          marginBottom: 14,
          borderRadius: DS.radiusMd,
          border: `1px solid ${DS.border}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <span style={{ fontSize: 12, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          LLM-as-Judge Overall
        </span>
        <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor(avgScore), fontFamily: "var(--ds-mono), monospace" }}>
          {avgScore.toFixed(2)}
        </span>
      </div>

      {/* Per-dimension cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DIMENSIONS.map((dim) => {
          const result = example.scores[dim.id];
          const isExpanded = expandedDim === dim.id;
          const color = scoreColor(result.score);
          return (
            <div
              key={dim.id}
              style={{
                border: `1px solid ${isExpanded ? CYAN_MID : DS.border}`,
                borderRadius: DS.radiusMd,
                background: isExpanded ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
                overflow: "hidden",
                transition: "border-color 0.15s ease",
              }}
            >
              <button
                onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  outline: "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DS.t1 }}>{dim.label}</div>
                  <div style={{ fontSize: 11, color: DS.t3, marginTop: 2 }}>{dim.short}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color,
                    }}
                  >
                    {result.score.toFixed(2)}
                  </span>
                  <span
                    style={{
                      color: DS.t3,
                      fontSize: 12,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                      display: "inline-block",
                    }}
                  >
                    ▾
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div style={{ padding: "0 14px 14px" }}>
                  <ScoreBar score={result.score} />
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: DS.t3,
                      fontStyle: "italic",
                    }}
                  >
                    {dim.definition}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: "rgba(6,182,212,0.07)",
                      border: "1px solid rgba(6,182,212,0.20)",
                      fontSize: 12.5,
                      color: DS.t2,
                      lineHeight: "18px",
                    }}
                  >
                    <span style={{ color: CYAN, fontWeight: 600 }}>Judge rationale: </span>
                    {result.rationale}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          color: DS.t3,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: DS.radiusMd,
          border: `1px solid ${DS.border}`,
          lineHeight: "18px",
        }}
      >
        Click any dimension to see the judge's chain-of-thought rationale. Notice how faithfulness
        collapses first on the bad response — hallucinated claims with zero grounding in the
        retrieved context — while relevancy degrades more gently since the answer still nominally
        addresses the question.
      </div>
    </div>
  );
}
