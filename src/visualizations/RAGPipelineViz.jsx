import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (must be before component — TDZ safety) ──────────────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.15)";
const CYAN_BORDER = "rgba(6,182,212,0.35)";
const GRN = "#34D399";
const GRN_DIM = "rgba(52,211,153,0.12)";
const ORG = "#F59E0B";
const RED = "#F87171";
const PANEL_BG = "rgba(2,6,23,0.72)";

const INDEX_STEPS = [
  {
    icon: "📄",
    label: "Document",
    desc: "PDF, markdown, HTML",
  },
  {
    icon: "✂️",
    label: "Chunker",
    desc: "Split into ~512 token segments",
  },
  {
    icon: "🔢",
    label: "Embedder",
    desc: "text-embedding-3-small → 1536-dim vector",
  },
  {
    icon: "🗄️",
    label: "Vector Store",
    desc: "Pinecone / pgvector / Chroma",
  },
];

const QUERY_STEPS = [
  {
    icon: "🔍",
    label: "User Query",
    desc: "Natural language question",
  },
  {
    icon: "🔢",
    label: "Embed Query",
    desc: "Same embedding model",
  },
  {
    icon: "⚡",
    label: "ANN Search",
    desc: "Approximate nearest neighbours",
  },
  {
    icon: "📋",
    label: "Top-K Chunks",
    desc: "Most semantically similar",
  },
  {
    icon: "🤖",
    label: "LLM",
    desc: "Query + context → completion",
  },
  {
    icon: "💬",
    label: "Answer",
    desc: "Grounded in retrieved docs",
  },
];

const FAILURE_CARDS = [
  {
    icon: "⚠️",
    color: RED,
    title: "Bad Chunking",
    desc: "Wrong semantic boundaries break context.",
  },
  {
    icon: "⚠️",
    color: ORG,
    title: "k too small",
    desc: "Missing relevant chunks → incomplete answer.",
  },
  {
    icon: "⚠️",
    color: ORG,
    title: "Context ignored",
    desc: "LLM uses parametric knowledge instead.",
  },
];

const MOCK_ANSWER = `Based on the retrieved context:

HNSW (Hierarchical Navigable Small World) is a graph-based ANN index that organizes vectors in multiple layers for fast approximate nearest-neighbour lookup. Use it when you need sub-millisecond query latency at scale (millions of vectors) and can afford the higher memory footprint.`;

const MOCK_SOURCES = ["chunk_47", "chunk_51", "chunk_89"];

// ── Sub-components ─────────────────────────────────────────────────────────

function Arrow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        color: DS.dim,
        fontSize: 18,
        flexShrink: 0,
        padding: "0 2px",
      }}
    >
      →
    </div>
  );
}

function PipelineStep({ icon, label, desc, active, done }) {
  const isLit = active || done;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "10px 10px",
        borderRadius: DS.radiusMd,
        border: `1px solid ${isLit ? CYAN_BORDER : DS.border}`,
        background: isLit ? CYAN_DIM : "rgba(255,255,255,0.02)",
        transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
        boxShadow: active ? `0 0 14px rgba(6,182,212,0.35)` : "none",
        minWidth: 90,
        flex: "1 1 0",
        cursor: "default",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--ds-sans), sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: isLit ? CYAN : DS.t2,
          transition: "color 0.35s ease",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--ds-sans), sans-serif",
          fontSize: 10,
          color: DS.t3,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {desc}
      </span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: CYAN,
        textTransform: "uppercase",
        marginBottom: 10,
        opacity: 0.75,
      }}
    >
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function RAGPipelineViz() {
  // Indexing phase state
  const [indexActive, setIndexActive] = useState(-1); // -1 = idle
  const [indexDone, setIndexDone] = useState(false);
  const [indexRunning, setIndexRunning] = useState(false);

  // Query phase state
  const [queryText, setQueryText] = useState(
    "What is HNSW and when should I use it?"
  );
  const [queryActive, setQueryActive] = useState(-1);
  const [queryDone, setQueryDone] = useState(false);
  const [queryRunning, setQueryRunning] = useState(false);

  function runIndexing() {
    if (indexRunning) return;
    setIndexDone(false);
    setIndexActive(-1);
    setIndexRunning(true);

    INDEX_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setIndexActive(i);
        if (i === INDEX_STEPS.length - 1) {
          setTimeout(() => {
            setIndexActive(-1);
            setIndexDone(true);
            setIndexRunning(false);
          }, 600);
        }
      }, i * 500);
    });
  }

  function runQuery() {
    if (queryRunning || !indexDone) return;
    setQueryDone(false);
    setQueryActive(-1);
    setQueryRunning(true);

    QUERY_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setQueryActive(i);
        if (i === QUERY_STEPS.length - 1) {
          setTimeout(() => {
            setQueryActive(-1);
            setQueryDone(true);
            setQueryRunning(false);
          }, 700);
        }
      }, i * 700);
    });
  }

  const btnBase = {
    fontFamily: "var(--ds-sans), sans-serif",
    fontSize: 13,
    fontWeight: 700,
    border: "none",
    borderRadius: DS.radiusSm,
    padding: "8px 18px",
    cursor: "pointer",
    transition: "opacity 0.2s, box-shadow 0.2s",
    letterSpacing: "0.02em",
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
        padding: "4px 0 12px",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: CYAN,
            letterSpacing: "-0.01em",
            marginBottom: 4,
          }}
        >
          RAG Pipeline
        </div>
        <div style={{ fontSize: 13, color: DS.t3, letterSpacing: "0.02em" }}>
          Retrieval Augmented Generation — Interactive
        </div>
      </div>

      {/* ── INDEXING PHASE ── */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusLg,
          padding: "18px 20px",
          marginBottom: 16,
        }}
      >
        <SectionLabel>Indexing — run once</SectionLabel>

        {/* Steps row */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 4,
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          {INDEX_STEPS.map((step, i) => (
            <div
              key={step.label}
              style={{ display: "flex", alignItems: "center", gap: 4, flex: "1 1 0" }}
            >
              <PipelineStep
                {...step}
                active={indexActive === i}
                done={indexDone && indexActive === -1}
              />
              {i < INDEX_STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        {/* Button + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button
            onClick={runIndexing}
            disabled={indexRunning}
            style={{
              ...btnBase,
              background: indexRunning ? "rgba(6,182,212,0.25)" : CYAN,
              color: indexRunning ? CYAN : "#020617",
              opacity: indexRunning ? 0.7 : 1,
              boxShadow: indexRunning ? "none" : "0 4px 14px rgba(6,182,212,0.4)",
            }}
          >
            ▶ Run Indexing
          </button>

          {indexRunning && !indexDone && (
            <span
              style={{
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 12,
                color: CYAN,
                opacity: 0.85,
              }}
            >
              Indexing…
            </span>
          )}

          {indexDone && (
            <span
              style={{
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 12,
                color: GRN,
                background: GRN_DIM,
                border: `1px solid rgba(52,211,153,0.3)`,
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              ✓ 247 chunks indexed
            </span>
          )}
        </div>
      </div>

      {/* ── QUERY PHASE ── */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${indexDone ? CYAN_BORDER : DS.border}`,
          borderRadius: DS.radiusLg,
          padding: "18px 20px",
          marginBottom: 16,
          transition: "border-color 0.4s ease",
          opacity: indexDone ? 1 : 0.55,
          pointerEvents: indexDone ? "auto" : "none",
        }}
      >
        <SectionLabel>Query — on every request</SectionLabel>

        {/* Steps row — 6 steps, slightly smaller */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 3,
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          {QUERY_STEPS.map((step, i) => (
            <div
              key={step.label}
              style={{ display: "flex", alignItems: "center", gap: 3, flex: "1 1 0" }}
            >
              <PipelineStep
                {...step}
                active={queryActive === i}
                done={queryDone && queryActive === -1}
              />
              {i < QUERY_STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={queryRunning}
            style={{
              flex: "1 1 220px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radiusSm,
              color: DS.t1,
              fontFamily: "var(--ds-sans), sans-serif",
              fontSize: 13,
              padding: "8px 12px",
              outline: "none",
            }}
          />
          <button
            onClick={runQuery}
            disabled={queryRunning || !indexDone}
            style={{
              ...btnBase,
              background: queryRunning ? "rgba(6,182,212,0.2)" : CYAN,
              color: queryRunning ? CYAN : "#020617",
              opacity: queryRunning ? 0.7 : 1,
              boxShadow: queryRunning ? "none" : "0 4px 14px rgba(6,182,212,0.35)",
            }}
          >
            Ask
          </button>
        </div>

        {/* Mock answer box */}
        {queryDone && (
          <div
            style={{
              background: "rgba(6,182,212,0.06)",
              border: `1px solid ${CYAN_BORDER}`,
              borderRadius: DS.radiusMd,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                color: CYAN,
                marginBottom: 8,
                letterSpacing: "0.06em",
              }}
            >
              ▸ ANSWER
            </div>
            <p
              style={{
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                color: DS.t2,
                lineHeight: 1.65,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {MOCK_ANSWER}
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  color: DS.t3,
                }}
              >
                Sources:
              </span>
              {MOCK_SOURCES.map((src) => (
                <span
                  key={src}
                  style={{
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 11,
                    color: CYAN,
                    background: CYAN_DIM,
                    border: `1px solid ${CYAN_BORDER}`,
                    borderRadius: 4,
                    padding: "1px 7px",
                  }}
                >
                  [{src}]
                </span>
              ))}
            </div>
          </div>
        )}

        {!indexDone && (
          <div
            style={{
              fontFamily: "var(--ds-sans), sans-serif",
              fontSize: 12,
              color: DS.t3,
              fontStyle: "italic",
            }}
          >
            Run Indexing first to enable queries.
          </div>
        )}
      </div>

      {/* ── FAILURE POINTS ── */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusLg,
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: RED,
            textTransform: "uppercase",
            marginBottom: 12,
            opacity: 0.85,
          }}
        >
          Common Failure Points
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {FAILURE_CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: DS.radiusSm,
                padding: "12px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>{card.icon}</span>
                <span
                  style={{
                    fontFamily: "var(--ds-sans), sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: card.color,
                  }}
                >
                  {card.title}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--ds-sans), sans-serif",
                  fontSize: 11,
                  color: DS.t3,
                  lineHeight: 1.4,
                }}
              >
                {card.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
