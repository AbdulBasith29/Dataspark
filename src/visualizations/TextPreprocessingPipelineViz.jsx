import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const GREEN = "#10B981";
const GREEN_DIM = "rgba(16,185,129,0.15)";
const GREEN_BORDER = "rgba(16,185,129,0.35)";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const GRAY = "rgba(255,255,255,0.18)";
const GRAY_DIM = "rgba(255,255,255,0.06)";
const PANEL_BG = "rgba(2,6,23,0.72)";
const CARD_BG = "rgba(255,255,255,0.02)";

const PRESETS = [
  {
    label: "Sentiment",
    text: "The movie was NOT bad, I'm really enjoying it!",
  },
  {
    label: "Action",
    text: "Running quickly through the forest, he jumped over streams",
  },
  {
    label: "NER",
    text: "Apple Inc.'s CEO visited New York's financial district",
  },
];

// Hardcoded pipeline transformations per preset index
const PIPELINE_DATA = [
  // Preset 0: Sentiment
  {
    raw: "The movie was NOT bad, I'm really enjoying it!",
    lowercased: "the movie was not bad im really enjoying it",
    tokens: ["the", "movie", "was", "not", "bad", "im", "really", "enjoying", "it"],
    stopWords: ["the", "was", "not", "im", "it"],
    notWarning: true,
    kept: ["movie", "bad", "really", "enjoying"],
    lemmas: [
      { token: "movie", lemma: "movie" },
      { token: "bad", lemma: "bad" },
      { token: "really", lemma: "really" },
      { token: "enjoying", lemma: "enjoy" },
    ],
  },
  // Preset 1: Action
  {
    raw: "Running quickly through the forest, he jumped over streams",
    lowercased: "running quickly through the forest he jumped over streams",
    tokens: ["running", "quickly", "through", "the", "forest", "he", "jumped", "over", "streams"],
    stopWords: ["through", "the", "he", "over"],
    notWarning: false,
    kept: ["running", "quickly", "forest", "jumped", "streams"],
    lemmas: [
      { token: "running", lemma: "run" },
      { token: "quickly", lemma: "quickly" },
      { token: "forest", lemma: "forest" },
      { token: "jumped", lemma: "jump" },
      { token: "streams", lemma: "stream" },
    ],
  },
  // Preset 2: NER
  {
    raw: "Apple Inc.'s CEO visited New York's financial district",
    lowercased: "apple incs ceo visited new yorks financial district",
    tokens: ["apple", "incs", "ceo", "visited", "new", "yorks", "financial", "district"],
    stopWords: ["new"],
    notWarning: false,
    kept: ["apple", "incs", "ceo", "visited", "yorks", "financial", "district"],
    lemmas: [
      { token: "apple", lemma: "apple" },
      { token: "incs", lemma: "inc" },
      { token: "ceo", lemma: "ceo" },
      { token: "visited", lemma: "visit" },
      { token: "yorks", lemma: "york" },
      { token: "financial", lemma: "financial" },
      { token: "district", lemma: "district" },
    ],
  },
];

const STEP_CONFIGS = [
  { id: 0, label: "1 · Raw Text", color: "#6366F1" },
  { id: 1, label: "2 · Lowercase & Clean", color: "#8B5CF6" },
  { id: 2, label: "3 · Tokenize", color: "#0EA5E9" },
  { id: 3, label: "4 · Remove Stop Words", color: AMBER },
  { id: 4, label: "5 · Lemmatize", color: GREEN },
];

export default function TextPreprocessingPipelineViz() {
  const [presetIdx, setPresetIdx] = useState(0);

  const data = PIPELINE_DATA[presetIdx];

  return (
    <div
      style={{
        background: PANEL_BG,
        borderRadius: 14,
        padding: "20px 22px 24px",
        fontFamily: "var(--ds-sans), sans-serif",
        color: "#E2E8F0",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: GREEN,
            letterSpacing: 0.3,
            marginBottom: 4,
          }}
        >
          Text Preprocessing Pipeline
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Select a sentence and trace its transformation through each NLP stage
        </div>
      </div>

      {/* Preset buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setPresetIdx(i)}
            style={{
              background: presetIdx === i ? GREEN_DIM : CARD_BG,
              border: `1px solid ${presetIdx === i ? GREEN_BORDER : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8,
              color: presetIdx === i ? GREEN : "rgba(255,255,255,0.6)",
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: 0.2,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Pipeline steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STEP_CONFIGS.map((step) => (
          <PipelineStep key={step.id} step={step} data={data} />
        ))}
      </div>

      {/* Footer legend */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 12,
        }}
      >
        <LegendDot color={GREEN} label="Kept token" />
        <LegendDot color="rgba(255,255,255,0.22)" label="Stop word removed" />
        <LegendDot color={AMBER} label="Lemma changed" />
        <LegendDot color={RED} label="Sentiment risk" />
      </div>
    </div>
  );
}

function PipelineStep({ step, data }) {
  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Step header bar */}
      <div
        style={{
          background: `${step.color}22`,
          borderBottom: `1px solid ${step.color}44`,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: step.color,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {step.label}
        </span>
      </div>

      {/* Step content */}
      <div style={{ padding: "10px 14px" }}>
        <StepContent stepId={step.id} data={data} color={step.color} />
      </div>
    </div>
  );
}

function StepContent({ stepId, data, color }) {
  if (stepId === 0) {
    return (
      <span
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 13,
          color: "#CBD5E1",
          lineHeight: 1.6,
        }}
      >
        {data.raw}
      </span>
    );
  }

  if (stepId === 1) {
    return (
      <span
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 13,
          color: "#CBD5E1",
          lineHeight: 1.6,
        }}
      >
        {data.lowercased}
      </span>
    );
  }

  if (stepId === 2) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {data.tokens.map((tok, i) => (
          <TokenChip key={i} text={tok} color={color} />
        ))}
      </div>
    );
  }

  if (stepId === 3) {
    const stopSet = new Set(data.stopWords);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {data.tokens.map((tok, i) => {
          const isStop = stopSet.has(tok);
          const isNot = tok === "not" && data.notWarning;
          return (
            <div key={i} style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 12,
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: isStop
                    ? isNot
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(255,255,255,0.04)"
                    : `${color}22`,
                  border: `1px solid ${
                    isStop
                      ? isNot
                        ? "rgba(239,68,68,0.4)"
                        : "rgba(255,255,255,0.08)"
                      : `${color}55`
                  }`,
                  color: isStop
                    ? isNot
                      ? RED
                      : "rgba(255,255,255,0.28)"
                    : "#CBD5E1",
                  textDecoration: isStop ? "line-through" : "none",
                  textDecorationColor: "rgba(255,255,255,0.3)",
                }}
              >
                {tok}
              </span>
              {isNot && (
                <span
                  style={{
                    fontSize: 9,
                    color: RED,
                    marginTop: 2,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚠ context loss
                </span>
              )}
            </div>
          );
        })}
        {data.notWarning && (
          <div
            style={{
              width: "100%",
              marginTop: 8,
              padding: "6px 10px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 7,
              fontSize: 11,
              color: RED,
              fontWeight: 600,
            }}
          >
            ⚠ Sentiment risk: removing "not" flips the meaning from negative→positive!
          </div>
        )}
      </div>
    );
  }

  if (stepId === 4) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {data.lemmas.map((entry, i) => {
          const changed = entry.token !== entry.lemma;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: changed ? `${GREEN}18` : CARD_BG,
                border: `1px solid ${changed ? GREEN_BORDER : "rgba(255,255,255,0.07)"}`,
                borderRadius: 7,
                padding: "4px 9px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 12,
                  color: changed ? AMBER : "rgba(255,255,255,0.5)",
                  textDecoration: changed ? "line-through" : "none",
                  textDecorationColor: "rgba(245,158,11,0.5)",
                }}
              >
                {entry.token}
              </span>
              {changed && (
                <>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>→</span>
                  <span
                    style={{
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 12,
                      color: GREEN,
                      fontWeight: 700,
                    }}
                  >
                    {entry.lemma}
                  </span>
                </>
              )}
              {!changed && (
                <span
                  style={{
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 12,
                    color: "#CBD5E1",
                  }}
                >
                  {entry.lemma}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

function TokenChip({ text, color }) {
  return (
    <span
      style={{
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        padding: "3px 9px",
        borderRadius: 5,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        color: "#CBD5E1",
      }}
    >
      {text}
    </span>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{label}</span>
    </div>
  );
}
