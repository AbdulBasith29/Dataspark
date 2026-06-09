import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Palette constants (declared before component — TDZ safety) ───────────────
const BLUE = "#0EA5E9";
const BLUE_DIM = "rgba(14,165,233,0.14)";
const BLUE_BORDER = "rgba(14,165,233,0.30)";
const GRN = "#34d399";
const GRN_DIM = "rgba(52,211,153,0.13)";
const GRN_BORDER = "rgba(52,211,153,0.30)";
const RED = "#f87171";
const RED_DIM = "rgba(248,113,113,0.13)";
const RED_BORDER = "rgba(248,113,113,0.30)";
const YLW = "#fbbf24";
const YLW_DIM = "rgba(251,191,36,0.13)";
const YLW_BORDER = "rgba(251,191,36,0.30)";
const PANEL_BG = "rgba(2,6,23,0.72)";
const CARD_BG = "rgba(255,255,255,0.02)";
const PURPLE = "#818cf8";
const PURPLE_DIM = "rgba(129,140,248,0.14)";
const PURPLE_BORDER = "rgba(129,140,248,0.30)";

// ── Text samples ─────────────────────────────────────────────────────────────
const SAMPLES = [
  {
    id: 0,
    label: "Positive",
    color: GRN,
    text: "The product arrived quickly and works perfectly!",
  },
  {
    id: 1,
    label: "Negative",
    color: RED,
    text: "Worst experience ever. Customer service ignored me.",
  },
  {
    id: 2,
    label: "Neutral",
    color: DS.t3,
    text: "The package arrived. It's a box.",
  },
  {
    id: 3,
    label: "Mixed",
    color: YLW,
    text: "The food was okay but the service could be better.",
  },
];

// ── Per-sample hardcoded analysis data ───────────────────────────────────────

// VADER token sentiment chips
const VADER_DATA = [
  {
    // sample 0 — positive
    compound: 0.82,
    label: "POSITIVE",
    labelColor: GRN,
    tokens: [
      { word: "The", score: "neu", color: DS.t3 },
      { word: "product", score: "neu", color: DS.t3 },
      { word: "arrived", score: "neu", color: DS.t3 },
      { word: "quickly", score: "+0.36", color: GRN },
      { word: "and", score: "neu", color: DS.t3 },
      { word: "works", score: "neu", color: DS.t3 },
      { word: "perfectly", score: "+0.58", color: GRN },
      { word: "!", score: "+0.12", color: GRN },
    ],
    note: "Rule-based, no training needed. Punctuation & capitalization boost scores.",
  },
  {
    // sample 1 — negative
    compound: -0.81,
    label: "NEGATIVE",
    labelColor: RED,
    tokens: [
      { word: "Worst", score: "-0.72", color: RED },
      { word: "experience", score: "neu", color: DS.t3 },
      { word: "ever", score: "-0.18", color: RED },
      { word: ".", score: "neu", color: DS.t3 },
      { word: "Customer", score: "neu", color: DS.t3 },
      { word: "service", score: "neu", color: DS.t3 },
      { word: "ignored", score: "-0.34", color: RED },
      { word: "me", score: "neu", color: DS.t3 },
      { word: ".", score: "neu", color: DS.t3 },
    ],
    note: "Superlatives like 'worst' carry strong negative weight in VADER's lexicon.",
  },
  {
    // sample 2 — neutral
    compound: 0.0,
    label: "NEUTRAL",
    labelColor: DS.t3,
    tokens: [
      { word: "The", score: "neu", color: DS.t3 },
      { word: "package", score: "neu", color: DS.t3 },
      { word: "arrived", score: "neu", color: DS.t3 },
      { word: ".", score: "neu", color: DS.t3 },
      { word: "It's", score: "neu", color: DS.t3 },
      { word: "a", score: "neu", color: DS.t3 },
      { word: "box", score: "neu", color: DS.t3 },
      { word: ".", score: "neu", color: DS.t3 },
    ],
    note: "No sentiment-bearing words detected. Compound score = 0.0.",
  },
  {
    // sample 3 — mixed
    compound: 0.09,
    label: "MIXED",
    labelColor: YLW,
    tokens: [
      { word: "The", score: "neu", color: DS.t3 },
      { word: "food", score: "neu", color: DS.t3 },
      { word: "was", score: "neu", color: DS.t3 },
      { word: "okay", score: "+0.22", color: GRN },
      { word: "but", score: "neu", color: DS.t3 },
      { word: "the", score: "neu", color: DS.t3 },
      { word: "service", score: "neu", color: DS.t3 },
      { word: "could", score: "neu", color: DS.t3 },
      { word: "be", score: "neu", color: DS.t3 },
      { word: "better", score: "+0.15", color: YLW },
    ],
    note: "VADER misses the implicit negativity in 'could be better'. Compound near 0.",
  },
];

// Naive Bayes feature importance + prediction
const NB_DATA = [
  {
    // sample 0
    prediction: "POSITIVE",
    confidence: 94,
    predColor: GRN,
    topPos: [
      { word: "perfectly", score: 0.88 },
      { word: "quickly", score: 0.71 },
      { word: "works", score: 0.52 },
    ],
    topNeg: [
      { word: "wait", score: 0.12 },
      { word: "problem", score: 0.08 },
      { word: "broken", score: 0.04 },
    ],
    note: "Fast, interpretable, needs labeled data. Bag-of-words; ignores word order.",
  },
  {
    // sample 1
    prediction: "NEGATIVE",
    confidence: 91,
    predColor: RED,
    topPos: [
      { word: "good", score: 0.06 },
      { word: "helpful", score: 0.03 },
      { word: "fast", score: 0.02 },
    ],
    topNeg: [
      { word: "worst", score: 0.91 },
      { word: "ignored", score: 0.77 },
      { word: "ever", score: 0.42 },
    ],
    note: "Strong negative keywords drive a high-confidence negative prediction.",
  },
  {
    // sample 2
    prediction: "NEUTRAL",
    confidence: 78,
    predColor: DS.t3,
    topPos: [
      { word: "arrived", score: 0.24 },
      { word: "box", score: 0.11 },
      { word: "package", score: 0.09 },
    ],
    topNeg: [
      { word: "lost", score: 0.08 },
      { word: "damaged", score: 0.05 },
      { word: "missing", score: 0.03 },
    ],
    note: "Factual sentences have low feature weights; NB assigns neutral with moderate confidence.",
  },
  {
    // sample 3
    prediction: "POSITIVE",
    confidence: 55,
    predColor: YLW,
    topPos: [
      { word: "okay", score: 0.44 },
      { word: "better", score: 0.38 },
      { word: "food", score: 0.21 },
    ],
    topNeg: [
      { word: "could", score: 0.29 },
      { word: "service", score: 0.15 },
      { word: "but", score: 0.08 },
    ],
    note: "Mixed signals: NB leans positive but with low confidence. Misses the implicit critique.",
  },
];

// BERT token attention + prediction
const BERT_DATA = [
  {
    // sample 0
    prediction: "POSITIVE",
    confidence: 98,
    predColor: GRN,
    tokens: [
      { word: "The", attn: 0.04 },
      { word: "product", attn: 0.31 },
      { word: "arrived", attn: 0.22 },
      { word: "quickly", attn: 0.72 },
      { word: "and", attn: 0.05 },
      { word: "works", attn: 0.55 },
      { word: "perfectly", attn: 0.95 },
      { word: "!", attn: 0.41 },
    ],
    note: "Context-aware; handles negation and sarcasm. Slower inference.",
  },
  {
    // sample 1
    prediction: "NEGATIVE",
    confidence: 97,
    predColor: RED,
    tokens: [
      { word: "Worst", attn: 0.96 },
      { word: "experience", attn: 0.52 },
      { word: "ever", attn: 0.61 },
      { word: ".", attn: 0.05 },
      { word: "Customer", attn: 0.28 },
      { word: "service", attn: 0.33 },
      { word: "ignored", attn: 0.88 },
      { word: "me", attn: 0.22 },
    ],
    note: "High attention on 'Worst' and 'ignored' — BERT correctly identifies strong negative sentiment.",
  },
  {
    // sample 2
    prediction: "NEUTRAL",
    confidence: 92,
    predColor: DS.t3,
    tokens: [
      { word: "The", attn: 0.03 },
      { word: "package", attn: 0.38 },
      { word: "arrived", attn: 0.44 },
      { word: ".", attn: 0.06 },
      { word: "It's", attn: 0.10 },
      { word: "a", attn: 0.02 },
      { word: "box", attn: 0.19 },
    ],
    note: "Uniform low attention reflects absence of sentiment signals. Confident neutral.",
  },
  {
    // sample 3
    prediction: "MIXED",
    confidence: 82,
    predColor: YLW,
    tokens: [
      { word: "The", attn: 0.04 },
      { word: "food", attn: 0.35 },
      { word: "was", attn: 0.08 },
      { word: "okay", attn: 0.52 },
      { word: "but", attn: 0.66 },
      { word: "the", attn: 0.04 },
      { word: "service", attn: 0.41 },
      { word: "could", attn: 0.55 },
      { word: "be", attn: 0.18 },
      { word: "better", attn: 0.73 },
    ],
    note: "BERT attends to 'but' as a contrastive cue and correctly flags mixed sentiment.",
  },
];

// ── "When to use" table ───────────────────────────────────────────────────────
const WHEN_TO_USE = [
  {
    approach: "Lexicon (VADER)",
    speed: "Instant",
    accuracy: "Moderate",
    needsLabels: "No",
    speedColor: GRN,
    accuracyColor: YLW,
    labelsColor: GRN,
  },
  {
    approach: "ML (NB / LogReg)",
    speed: "Fast",
    accuracy: "Good",
    needsLabels: "Yes",
    speedColor: GRN,
    accuracyColor: GRN,
    labelsColor: YLW,
  },
  {
    approach: "BERT Fine-tuned",
    speed: "Slow",
    accuracy: "Best",
    needsLabels: "Yes (large)",
    speedColor: RED,
    accuracyColor: GRN,
    labelsColor: RED,
  },
];

// ── Helper: bar width for NB feature importance ───────────────────────────────
function FeatureBar({ word, score, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <div style={{
        width: 64,
        fontSize: 10,
        color: DS.t2,
        fontFamily: "var(--ds-mono), monospace",
        flexShrink: 0,
        textAlign: "right",
      }}>
        {word}
      </div>
      <div style={{
        flex: 1,
        height: 10,
        borderRadius: 4,
        background: "rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${score * 100}%`,
          height: "100%",
          borderRadius: 4,
          background: color,
          opacity: 0.75,
        }} />
      </div>
      <div style={{
        width: 34,
        fontSize: 10,
        color: DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        textAlign: "right",
        flexShrink: 0,
      }}>
        {score.toFixed(2)}
      </div>
    </div>
  );
}

// ── Helper: VADER compound score bar ────────────────────────────────────────
function CompoundBar({ compound, labelColor }) {
  // range -1 to +1; map to 0-100% position
  const pos = Math.round(((compound + 1) / 2) * 100);
  const barColor = compound >= 0.05 ? GRN : compound <= -0.05 ? RED : DS.t3;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        fontSize: 10,
        color: DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        marginBottom: 4,
      }}>
        Compound score: <span style={{ color: labelColor, fontWeight: 700 }}>{compound.toFixed(2)}</span>
      </div>
      <div style={{
        position: "relative",
        height: 12,
        borderRadius: 6,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${DS.border}`,
      }}>
        {/* Center line */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 1,
          background: DS.border,
        }} />
        {/* Indicator */}
        <div style={{
          position: "absolute",
          left: `${pos}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: barColor,
          boxShadow: `0 0 6px ${barColor}`,
          border: "2px solid rgba(2,6,23,0.9)",
        }} />
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 9,
        color: DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        marginTop: 3,
      }}>
        <span>-1.0 (neg)</span>
        <span>0 (neu)</span>
        <span>+1.0 (pos)</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SentimentAnalysisViz() {
  const [selectedSample, setSelectedSample] = useState(0);

  const vader = VADER_DATA[selectedSample];
  const nb = NB_DATA[selectedSample];
  const bert = BERT_DATA[selectedSample];
  const sample = SAMPLES[selectedSample];

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
          Sentiment Analysis: Three Approaches Compared
        </div>
        <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
          Select a text sample to see how lexicon-based VADER, Naive Bayes, and BERT each classify it.
        </div>
      </div>

      {/* Sample selector pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {SAMPLES.map((s) => {
          const isActive = s.id === selectedSample;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSample(s.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                border: `1.5px solid ${isActive ? s.color : DS.border}`,
                background: isActive ? `${s.color}18` : CARD_BG,
                color: isActive ? s.color : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                fontWeight: isActive ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Selected text display */}
      <div style={{
        background: PANEL_BG,
        borderRadius: 10,
        border: `1.5px solid ${sample.color}44`,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          padding: "3px 10px",
          borderRadius: 12,
          background: `${sample.color}22`,
          border: `1px solid ${sample.color}55`,
          fontSize: 10,
          fontWeight: 700,
          color: sample.color,
          fontFamily: "var(--ds-mono), monospace",
          flexShrink: 0,
        }}>
          {sample.label}
        </div>
        <div style={{
          fontSize: 13,
          color: DS.t1,
          fontFamily: "var(--ds-sans), sans-serif",
          fontStyle: "italic",
          lineHeight: 1.5,
        }}>
          "{sample.text}"
        </div>
      </div>

      {/* Three approach panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>

        {/* ── Panel 1: VADER ── */}
        <div style={{
          background: CARD_BG,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 14px",
            background: `${YLW_DIM}`,
            borderBottom: `1px solid ${YLW_BORDER}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: YLW, fontFamily: "var(--ds-mono), monospace" }}>
              Lexicon-Based (VADER)
            </div>
            <div style={{ fontSize: 10, color: DS.t3, marginTop: 2 }}>
              Rule-based — no training needed
            </div>
          </div>
          <div style={{ padding: "12px 14px" }}>
            {/* Token chips */}
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Token scores
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {vader.tokens.map((tok, i) => (
                <div key={i} style={{
                  padding: "3px 7px",
                  borderRadius: 5,
                  background: tok.color === GRN ? GRN_DIM : tok.color === RED ? RED_DIM : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tok.color === GRN ? GRN_BORDER : tok.color === RED ? RED_BORDER : DS.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}>
                  <span style={{ fontSize: 11, color: DS.t1, fontFamily: "var(--ds-mono), monospace" }}>{tok.word}</span>
                  <span style={{ fontSize: 9, color: tok.color, fontFamily: "var(--ds-mono), monospace" }}>{tok.score}</span>
                </div>
              ))}
            </div>

            <CompoundBar compound={vader.compound} labelColor={vader.labelColor} />

            {/* Prediction badge */}
            <div style={{
              marginTop: 12,
              textAlign: "center",
              padding: "8px 10px",
              borderRadius: 8,
              background: `${vader.labelColor}18`,
              border: `1px solid ${vader.labelColor}44`,
              fontSize: 13,
              fontWeight: 700,
              color: vader.labelColor,
              fontFamily: "var(--ds-mono), monospace",
            }}>
              {vader.label}
            </div>

            {/* Note */}
            <div style={{
              marginTop: 10,
              fontSize: 10,
              color: DS.t3,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}>
              {vader.note}
            </div>
          </div>
        </div>

        {/* ── Panel 2: Naive Bayes ── */}
        <div style={{
          background: CARD_BG,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 14px",
            background: BLUE_DIM,
            borderBottom: `1px solid ${BLUE_BORDER}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, fontFamily: "var(--ds-mono), monospace" }}>
              ML (Naive Bayes)
            </div>
            <div style={{ fontSize: 10, color: DS.t3, marginTop: 2 }}>
              Fast, interpretable, needs labeled data
            </div>
          </div>
          <div style={{ padding: "12px 14px" }}>
            {/* Feature importance */}
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Top positive features
            </div>
            {nb.topPos.map((f, i) => (
              <FeatureBar key={i} word={f.word} score={f.score} color={GRN} />
            ))}
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, marginTop: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Top negative features
            </div>
            {nb.topNeg.map((f, i) => (
              <FeatureBar key={i} word={f.word} score={f.score} color={RED} />
            ))}

            {/* Prediction */}
            <div style={{
              marginTop: 14,
              padding: "8px 12px",
              borderRadius: 8,
              background: `${nb.predColor}18`,
              border: `1px solid ${nb.predColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: nb.predColor, fontFamily: "var(--ds-mono), monospace" }}>
                {nb.prediction}
              </span>
              <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
                {nb.confidence}% conf.
              </span>
            </div>

            {/* Confidence bar */}
            <div style={{
              marginTop: 6,
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${nb.confidence}%`,
                height: "100%",
                borderRadius: 4,
                background: nb.predColor,
                opacity: 0.7,
              }} />
            </div>

            {/* Note */}
            <div style={{
              marginTop: 10,
              fontSize: 10,
              color: DS.t3,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}>
              {nb.note}
            </div>
          </div>
        </div>

        {/* ── Panel 3: BERT ── */}
        <div style={{
          background: CARD_BG,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 14px",
            background: PURPLE_DIM,
            borderBottom: `1px solid ${PURPLE_BORDER}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE, fontFamily: "var(--ds-mono), monospace" }}>
              BERT Fine-tuned
            </div>
            <div style={{ fontSize: 10, color: DS.t3, marginTop: 2 }}>
              Context-aware, handles negation
            </div>
          </div>
          <div style={{ padding: "12px 14px" }}>
            {/* Token attention */}
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Token attention weights
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {bert.tokens.map((tok, i) => {
                const opacity = 0.08 + tok.attn * 0.85;
                const bgOpacity = 0.05 + tok.attn * 0.55;
                return (
                  <div key={i} style={{
                    padding: "4px 7px",
                    borderRadius: 5,
                    background: `rgba(129,140,248,${bgOpacity})`,
                    border: `1px solid rgba(129,140,248,${opacity})`,
                  }}>
                    <div style={{ fontSize: 11, color: DS.t1, fontFamily: "var(--ds-mono), monospace", opacity: 0.6 + tok.attn * 0.4 }}>
                      {tok.word}
                    </div>
                    <div style={{ fontSize: 9, color: PURPLE, fontFamily: "var(--ds-mono), monospace", textAlign: "center" }}>
                      {tok.attn.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ fontSize: 9, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
              Darker box = higher attention weight
            </div>

            {/* Prediction */}
            <div style={{
              marginTop: 4,
              padding: "8px 12px",
              borderRadius: 8,
              background: `${bert.predColor}18`,
              border: `1px solid ${bert.predColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: bert.predColor, fontFamily: "var(--ds-mono), monospace" }}>
                {bert.prediction}
              </span>
              <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
                {bert.confidence}% conf.
              </span>
            </div>

            {/* Confidence bar */}
            <div style={{
              marginTop: 6,
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${bert.confidence}%`,
                height: "100%",
                borderRadius: 4,
                background: bert.predColor,
                opacity: 0.7,
              }} />
            </div>

            {/* Note */}
            <div style={{
              marginTop: 10,
              fontSize: 10,
              color: DS.t3,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}>
              {bert.note}
            </div>
          </div>
        </div>
      </div>

      {/* When to use which table */}
      <div style={{
        background: PANEL_BG,
        borderRadius: 12,
        border: `1px solid ${DS.border}`,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${DS.border}`,
          fontSize: 11,
          fontWeight: 700,
          color: DS.t2,
          fontFamily: "var(--ds-mono), monospace",
          letterSpacing: 0.3,
          textTransform: "uppercase",
        }}>
          When to use which approach
        </div>

        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
          gap: 0,
          padding: "8px 16px",
          borderBottom: `1px solid ${DS.border}`,
        }}>
          {["Approach", "Speed", "Accuracy", "Needs Labels"].map((h) => (
            <div key={h} style={{
              fontSize: 10,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              letterSpacing: 0.3,
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {WHEN_TO_USE.map((row, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
            gap: 0,
            padding: "10px 16px",
            borderBottom: i < WHEN_TO_USE.length - 1 ? `1px solid ${DS.border}` : "none",
            alignItems: "center",
          }}>
            <div style={{ fontSize: 12, color: DS.t1, fontWeight: 600, fontFamily: "var(--ds-mono), monospace" }}>
              {row.approach}
            </div>
            <div style={{ fontSize: 12, color: row.speedColor, fontFamily: "var(--ds-mono), monospace" }}>
              {row.speed}
            </div>
            <div style={{ fontSize: 12, color: row.accuracyColor, fontFamily: "var(--ds-mono), monospace" }}>
              {row.accuracy}
            </div>
            <div style={{ fontSize: 12, color: row.labelsColor, fontFamily: "var(--ds-mono), monospace" }}>
              {row.needsLabels}
            </div>
          </div>
        ))}
      </div>

      {/* Footer insight */}
      <div style={{
        marginTop: 14,
        padding: "11px 16px",
        borderRadius: 10,
        background: `${PURPLE}0a`,
        border: `1px solid ${PURPLE_BORDER}`,
        fontSize: 12,
        color: DS.t3,
        lineHeight: 1.6,
      }}>
        <span style={{ color: PURPLE, fontWeight: 700 }}>Interview tip: </span>
        For production systems, start with a lexicon baseline to understand your data, then fine-tune BERT only if accuracy demands justify the inference cost. Always check the
        {" "}<span style={{ color: DS.t2 }}>mixed/sarcastic examples</span> — they separate shallow approaches from context-aware models.
      </div>
    </div>
  );
}
