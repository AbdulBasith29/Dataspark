import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── accent colors ──────────────────────────────────────────────────────────
const BLUE   = "#0EA5E9";
const PURPLE = "#818cf8";
const GREEN  = DS.grn;
const YELLOW = "#fbbf24";
const ORANGE = "#f97316";
const TEAL   = "#2dd4bf";

// ── entity type metadata ───────────────────────────────────────────────────
const ENTITY_META = {
  ORG:     { label: "ORG",     color: BLUE,   desc: "Organization"  },
  PER:     { label: "PER",     color: PURPLE, desc: "Person"        },
  LOC:     { label: "LOC",     color: GREEN,  desc: "Location"      },
  MONEY:   { label: "MONEY",   color: YELLOW, desc: "Money"         },
  DATE:    { label: "DATE",    color: ORANGE, desc: "Date / Time"   },
  PERCENT: { label: "PERCENT", color: TEAL,   desc: "Percentage"    },
};

// ── preset sentences with token annotations ───────────────────────────────
// Each token: { text, entity?, bioTag, isFirst? }
// bioTag: "O" | "B-XXX" | "I-XXX"
const SENTENCES = [
  {
    id: 0,
    label: "Sentence 1 — Tech acquisition",
    tokens: [
      { text: "Apple",       entity: "ORG",   bioTag: "B-ORG"   },
      { text: "acquired",                     bioTag: "O"       },
      { text: "Beats",       entity: "ORG",   bioTag: "B-ORG"   },
      { text: "Electronics", entity: "ORG",   bioTag: "I-ORG"   },
      { text: "for",                          bioTag: "O"       },
      { text: "$3",          entity: "MONEY", bioTag: "B-MONEY" },
      { text: "billion",     entity: "MONEY", bioTag: "I-MONEY" },
      { text: "in",                           bioTag: "O"       },
      { text: "2014",        entity: "DATE",  bioTag: "B-DATE"  },
      { text: "in",                           bioTag: "O"       },
      { text: "Cupertino",   entity: "LOC",   bioTag: "B-LOC"   },
      { text: ",",                            bioTag: "O"       },
      { text: "California",  entity: "LOC",   bioTag: "I-LOC"   },
      { text: ".",                            bioTag: "O"       },
    ],
  },
  {
    id: 1,
    label: "Sentence 2 — Research hire",
    tokens: [
      { text: "Dr.",         entity: "PER",  bioTag: "B-PER"  },
      { text: "Sarah",       entity: "PER",  bioTag: "I-PER"  },
      { text: "Chen",        entity: "PER",  bioTag: "I-PER"  },
      { text: "joined",                      bioTag: "O"      },
      { text: "Google",      entity: "ORG",  bioTag: "B-ORG"  },
      { text: "DeepMind",    entity: "ORG",  bioTag: "I-ORG"  },
      { text: "in",                          bioTag: "O"      },
      { text: "London",      entity: "LOC",  bioTag: "B-LOC"  },
      { text: "to",                          bioTag: "O"      },
      { text: "lead",                        bioTag: "O"      },
      { text: "the",                         bioTag: "O"      },
      { text: "AlphaFold",   entity: "ORG",  bioTag: "B-ORG"  },
      { text: "team",                        bioTag: "O"      },
      { text: ".",                           bioTag: "O"      },
    ],
  },
  {
    id: 2,
    label: "Sentence 3 — Monetary policy",
    tokens: [
      { text: "The",       entity: "ORG",     bioTag: "B-ORG"     },
      { text: "Fed",       entity: "ORG",     bioTag: "I-ORG"     },
      { text: "raised",                       bioTag: "O"         },
      { text: "interest",                     bioTag: "O"         },
      { text: "rates",                        bioTag: "O"         },
      { text: "by",                           bioTag: "O"         },
      { text: "25",        entity: "MONEY",   bioTag: "B-MONEY"   },
      { text: "basis",     entity: "MONEY",   bioTag: "I-MONEY"   },
      { text: "points",    entity: "MONEY",   bioTag: "I-MONEY"   },
      { text: "on",                           bioTag: "O"         },
      { text: "Tuesday",   entity: "DATE",    bioTag: "B-DATE"    },
      { text: ",",                            bioTag: "O"         },
      { text: "citing",                       bioTag: "O"         },
      { text: "6.5%",      entity: "PERCENT", bioTag: "B-PERCENT" },
      { text: "inflation",                    bioTag: "O"         },
      { text: ".",                            bioTag: "O"         },
    ],
  },
];

// ── model approach cards ───────────────────────────────────────────────────
const MODEL_APPROACHES = [
  {
    name: "Rule-based",
    icon: "⚙",
    color: YELLOW,
    techniques: "Regex + gazetteers",
    precision: "High",
    recall: "Low",
    notes: "No training data needed. Brittle when text deviates from rules.",
  },
  {
    name: "BiLSTM-CRF",
    icon: "〜",
    color: BLUE,
    techniques: "Sequence labeling",
    precision: "Good",
    recall: "Good",
    notes: "Learns context from labeled corpora. CRF enforces valid BIO transitions.",
  },
  {
    name: "Transformer (BERT)",
    icon: "✦",
    color: PURPLE,
    techniques: "Fine-tuned LM",
    precision: "SOTA",
    recall: "SOTA",
    notes: "Transfer learning from large pretraining. Few-shot capable with prompting.",
  },
];

// ── BIO tag color helper ───────────────────────────────────────────────────
function bioColor(tag) {
  if (tag === "O")                      return DS.t3;
  if (tag.startsWith("B-"))            return DS.grn;
  if (tag.startsWith("I-"))            return BLUE;
  return DS.t2;
}

export default function NERViz() {
  const [sentIdx, setSentIdx]       = useState(0);
  const [hoveredTok, setHoveredTok] = useState(null);

  const sentence = SENTENCES[sentIdx];

  // ── styles ────────────────────────────────────────────────────────────────
  const cardBase = {
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${DS.border}`,
    borderRadius: 10,
    padding: "12px 14px",
  };

  const sentBtn = (active) => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${active ? BLUE : DS.border}`,
    background: active ? `${BLUE}20` : "transparent",
    color: active ? BLUE : DS.t3,
    fontSize: 11,
    fontFamily: "var(--ds-mono), monospace",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      {/* header */}
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Named Entity Recognition — Annotation Explorer
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Pick a sentence to see entity spans, BIO tags, and model trade-offs.
      </p>

      {/* ── sentence selector ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {SENTENCES.map((s) => (
          <button key={s.id} style={sentBtn(sentIdx === s.id)} onClick={() => setSentIdx(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── entity legend ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.values(ENTITY_META).map(({ label, color, desc }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: `${color}18`,
              border: `1px solid ${color}55`,
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: color }}>{label}</span>
            <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif" }}>— {desc}</span>
          </div>
        ))}
      </div>

      {/* ── annotated sentence ── */}
      <div style={{ ...cardBase, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10, letterSpacing: "0.05em" }}>
          ANNOTATED SENTENCE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 4px", alignItems: "flex-end" }}>
          {sentence.tokens.map((tok, i) => {
            const meta = tok.entity ? ENTITY_META[tok.entity] : null;
            const isHovered = hoveredTok === i;
            return (
              <div
                key={i}
                style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", cursor: meta ? "pointer" : "default" }}
                onMouseEnter={() => setHoveredTok(i)}
                onMouseLeave={() => setHoveredTok(null)}
              >
                {/* entity label chip above token */}
                {meta ? (
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: "var(--ds-mono), monospace",
                      color: meta.color,
                      background: `${meta.color}22`,
                      border: `1px solid ${meta.color}55`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      marginBottom: 3,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tok.bioTag}
                  </div>
                ) : (
                  <div style={{ height: 18, marginBottom: 3 }} />
                )}

                {/* token span */}
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "var(--ds-sans), sans-serif",
                    color: meta ? meta.color : DS.t2,
                    background: meta ? `${meta.color}${isHovered ? "30" : "18"}` : "transparent",
                    border: meta ? `1px solid ${meta.color}${isHovered ? "77" : "33"}` : "1px solid transparent",
                    borderRadius: 5,
                    padding: meta ? "2px 6px" : "2px 3px",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  {tok.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BIO tag sequence ── */}
      <div style={{ ...cardBase, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10, letterSpacing: "0.05em" }}>
          BIO TAG SEQUENCE
        </div>
        <div style={{ display: "flex", overflowX: "auto", gap: 6, paddingBottom: 4 }}>
          {sentence.tokens.map((tok, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                background: "rgba(2,6,23,0.72)",
                border: `1px solid ${DS.border}`,
                borderRadius: 6,
                padding: "6px 8px",
                minWidth: 52,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t2, marginBottom: 4 }}>
                {tok.text}
              </span>
              <div
                style={{
                  width: "100%",
                  height: 1,
                  background: DS.border,
                  marginBottom: 4,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--ds-mono), monospace",
                  color: bioColor(tok.bioTag),
                  letterSpacing: "0.03em",
                }}
              >
                {tok.bioTag}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>B- = Begin entity span</span>
          <span style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: BLUE }}>I- = Inside (continuation)</span>
          <span style={{ fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: DS.t3 }}>O = Outside any entity</span>
        </div>
      </div>

      {/* ── model approaches ── */}
      <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8, letterSpacing: "0.05em" }}>
        MODEL APPROACHES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {MODEL_APPROACHES.map((m) => (
          <div
            key={m.name}
            style={{
              background: `${m.color}0d`,
              border: `1px solid ${m.color}33`,
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16, color: m.color }}>{m.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: "var(--ds-sans), sans-serif" }}>
                {m.name}
              </span>
            </div>

            <div style={{ fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t3, marginBottom: 6 }}>
              {m.techniques}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ background: `${DS.grn}15`, border: `1px solid ${DS.grn}33`, borderRadius: 5, padding: "2px 7px", fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>
                P: {m.precision}
              </div>
              <div style={{ background: `${BLUE}15`, border: `1px solid ${BLUE}33`, borderRadius: 5, padding: "2px 7px", fontSize: 10, fontFamily: "var(--ds-mono), monospace", color: BLUE }}>
                R: {m.recall}
              </div>
            </div>

            <div style={{ fontSize: 11, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.5 }}>
              {m.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
