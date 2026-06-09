import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";
const CYAN_BRIGHT = "rgba(6,182,212,0.32)";

const CHUNK_COLORS = [
  { bg: "rgba(6,182,212,0.18)",   border: "rgba(6,182,212,0.55)",   label: "rgba(6,182,212,0.90)"   },
  { bg: "rgba(139,92,246,0.18)",  border: "rgba(139,92,246,0.55)",  label: "rgba(139,92,246,0.90)"  },
  { bg: "rgba(20,184,166,0.18)",  border: "rgba(20,184,166,0.55)",  label: "rgba(20,184,166,0.90)"  },
  { bg: "rgba(251,146,60,0.18)",  border: "rgba(251,146,60,0.55)",  label: "rgba(251,146,60,0.90)"  },
  { bg: "rgba(248,113,113,0.18)", border: "rgba(248,113,113,0.55)", label: "rgba(248,113,113,0.90)" },
];

// Full sample document text (structured for display)
const DOC_LINES = [
  { text: "# Introduction to Vector Databases", type: "h1" },
  { text: "", type: "blank" },
  { text: "Vector databases store high-dimensional embeddings and enable", type: "body" },
  { text: "similarity search at scale. Unlike traditional databases that", type: "body" },
  { text: "rely on exact matching, vector databases use approximate nearest", type: "body" },
  { text: "neighbor (ANN) algorithms to find semantically similar content.", type: "body" },
  { text: "", type: "blank" },
  { text: "## Core Concepts", type: "h2" },
  { text: "", type: "blank" },
  { text: "**Embeddings** are dense numerical representations of data.", type: "body" },
  { text: "The dimensionality of embeddings typically ranges from 768 to", type: "body" },
  { text: "3072 dimensions, depending on the model architecture used.", type: "body" },
  { text: "", type: "blank" },
  { text: "## HNSW Index", type: "h2" },
  { text: "", type: "blank" },
  { text: "Hierarchical Navigable Small World (HNSW) is the most popular", type: "body" },
  { text: "index structure for ANN search. It organizes vectors in a", type: "body" },
  { text: "multi-layer graph where each layer is a subset of the next.", type: "body" },
  { text: "", type: "blank" },
  { text: "## Choosing a Vector Database", type: "h2" },
  { text: "", type: "blank" },
  { text: "When selecting a vector database, consider:", type: "body" },
  { text: "- Scalability requirements", type: "list" },
  { text: "- Managed vs self-hosted", type: "list" },
  { text: "- Filtering capabilities", type: "list" },
  { text: "- Latency SLAs", type: "list" },
];

// Each strategy defines which line indices belong to each chunk
// lineRanges: array of [startLineIdx, endLineIdx] (inclusive)
const STRATEGIES = {
  fixed: {
    id: "fixed",
    label: "Fixed-Size",
    description: "Split by character count (≈200 chars) with 20-char overlap",
    chunkCount: 4,
    avgSize: "~195 chars",
    quality: 2,
    lineRanges: [
      [0, 5],    // chunk 1: h1 + intro paragraph start
      [5, 11],   // chunk 2: tail of intro + h2 + embeddings (cuts mid-section)
      [11, 17],  // chunk 3: tail of Core Concepts + HNSW h2 + first lines
      [17, 25],  // chunk 4: tail of HNSW + Choosing section
    ],
    contextBadges: null,
    splitNote: "⚠ Cuts mid-paragraph — 'HNSW' context split across chunks 2–3",
    pros: ["Simple to implement", "Predictable chunk sizes"],
    cons: ["Breaks semantic units mid-sentence", "Context lost at boundaries"],
    code: `from langchain.text_splitter import CharacterTextSplitter\nsplitter = CharacterTextSplitter(chunk_size=200, chunk_overlap=20)\nchunks = splitter.split_text(document)`,
  },
  recursive: {
    id: "recursive",
    label: "Recursive",
    description: "LangChain-style: tries \\n\\n → \\n → space → char in order",
    chunkCount: 4,
    avgSize: "~185 chars",
    quality: 3,
    lineRanges: [
      [0, 6],    // Introduction paragraph (split on \n\n)
      [7, 12],   // Core Concepts paragraph
      [13, 18],  // HNSW paragraph
      [19, 25],  // Choosing section
    ],
    contextBadges: null,
    splitNote: "✓ Respects paragraphs — headers may land in adjacent chunk",
    pros: ["Respects natural paragraph breaks", "Configurable separator hierarchy"],
    cons: ["Headers may separate from their content", "Size can still vary widely"],
    code: `from langchain.text_splitter import RecursiveCharacterTextSplitter\nsplitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=30)\nchunks = splitter.split_text(document)`,
  },
  structure: {
    id: "structure",
    label: "Structure",
    description: "Splits on markdown headers — one chunk per section",
    chunkCount: 4,
    avgSize: "~210 chars",
    quality: 4,
    lineRanges: [
      [0, 6],    // h1 + intro
      [7, 12],   // h2 Core Concepts
      [13, 18],  // h2 HNSW
      [19, 25],  // h2 Choosing
    ],
    contextBadges: null,
    splitNote: "✓ Header always co-located with its content",
    pros: ["Perfect header-content alignment", "Semantically coherent sections"],
    cons: ["Sections can be very large or tiny", "Requires structured documents"],
    code: `from langchain.text_splitter import MarkdownHeaderTextSplitter\nheaders = [("#","H1"),("##","H2"),("###","H3")]\nsplitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers)`,
  },
  semantic: {
    id: "semantic",
    label: "Semantic",
    description: "Groups sentences by embedding similarity; breaks at topic shifts",
    chunkCount: 3,
    avgSize: "~270 chars",
    quality: 4,
    lineRanges: [
      [0, 12],   // intro + embeddings concept (semantically related)
      [13, 18],  // HNSW (distinct topic)
      [19, 25],  // selection criteria (distinct topic)
    ],
    contextBadges: null,
    splitNote: "✓ Merges intro + embeddings — both about foundational concepts",
    pros: ["Best semantic coherence per chunk", "Adapts to content naturally"],
    cons: ["Requires embedding model at index time", "Slower and more expensive"],
    code: `from langchain_experimental.text_splitter import SemanticChunker\nfrom langchain_openai import OpenAIEmbeddings\nsplitter = SemanticChunker(OpenAIEmbeddings(), breakpoint_threshold_type="percentile")`,
  },
  contextual: {
    id: "contextual",
    label: "Contextual",
    description: "Structure-aware + LLM prepends situational context to each chunk",
    chunkCount: 4,
    avgSize: "~210 chars + context",
    quality: 5,
    lineRanges: [
      [0, 6],
      [7, 12],
      [13, 18],
      [19, 25],
    ],
    contextBadges: [
      "Context: Introduction section of article on Vector Databases — covers what vector DBs are.",
      "Context: 'Core Concepts' section — defines embeddings and their dimensionality.",
      "Context: 'HNSW Index' section — explains the dominant ANN graph index structure.",
      "Context: 'Choosing a Vector Database' — lists key selection criteria for practitioners.",
    ],
    splitNote: "✓ Each chunk carries LLM-generated situational context for retrieval",
    pros: ["Retrieval precision dramatically improved", "Context survives chunking boundaries"],
    cons: ["LLM call per chunk — higher cost", "Slower indexing pipeline"],
    code: `# Anthropic Contextual Retrieval pattern\nfor chunk in chunks:\n    ctx = llm(f"<doc>{doc}</doc>\\nGive brief context for this chunk:\\n{chunk}")\n    indexed_chunk = ctx + "\\n\\n" + chunk`,
  },
};

const STRATEGY_ORDER = ["fixed", "recursive", "structure", "semantic", "contextual"];

function Stars({ count, total = 5 }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < count ? "#FBBF24" : DS.dim,
            fontSize: 14,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function LineText({ line }) {
  if (line.type === "blank") return <span>&nbsp;</span>;
  if (line.type === "h1") {
    return (
      <span style={{ color: DS.t1, fontWeight: 700, fontSize: 15 }}>
        {line.text}
      </span>
    );
  }
  if (line.type === "h2") {
    return (
      <span style={{ color: CYAN, fontWeight: 600, fontSize: 13 }}>
        {line.text}
      </span>
    );
  }
  if (line.type === "list") {
    return (
      <span style={{ color: DS.t2, paddingLeft: 8 }}>{line.text}</span>
    );
  }
  // body — render **bold**
  const parts = line.text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ color: DS.t2 }}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={{ color: DS.t1, fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function ChunkingStrategyViz() {
  const [selectedStrategy, setSelectedStrategy] = useState("fixed");
  const strategy = STRATEGIES[selectedStrategy];

  // Build a map: lineIdx -> chunkIndex
  const lineChunkMap = {};
  strategy.lineRanges.forEach(([start, end], chunkIdx) => {
    for (let i = start; i <= end && i < DOC_LINES.length; i++) {
      lineChunkMap[i] = chunkIdx;
    }
  });

  return (
    <div
      style={{
        maxWidth: 660,
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
          Chunking Strategy Explorer
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          See how five strategies split the same document — and why it matters for retrieval quality.
        </p>
      </div>

      {/* Strategy Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {STRATEGY_ORDER.map((sid) => {
          const active = sid === selectedStrategy;
          return (
            <button
              key={sid}
              onClick={() => setSelectedStrategy(sid)}
              style={{
                padding: "7px 14px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                color: active ? CYAN : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {STRATEGIES[sid].label}
            </button>
          );
        })}
      </div>

      {/* Strategy description */}
      <div
        style={{
          background: CYAN_DIM,
          border: `1px solid rgba(6,182,212,0.25)`,
          borderRadius: DS.radiusMd,
          padding: "9px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: DS.t2,
          textAlign: "center",
        }}
      >
        <span style={{ color: CYAN, fontWeight: 600 }}>{strategy.label}: </span>
        {strategy.description}
      </div>

      {/* Document Panel */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 14,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          lineHeight: "22px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 10,
            fontFamily: "var(--ds-sans), sans-serif",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Sample Document — Chunks Highlighted
        </div>

        {/* Render lines grouped by chunk */}
        {(() => {
          // Group consecutive lines into chunk blocks
          const blocks = [];
          let currentChunk = null;
          let currentLines = [];

          DOC_LINES.forEach((line, idx) => {
            const chunkIdx = lineChunkMap[idx];
            if (chunkIdx === undefined) {
              // Line not in any chunk — shouldn't happen but handle gracefully
              if (currentChunk !== null) {
                blocks.push({ chunkIdx: currentChunk, lines: currentLines });
                currentChunk = null;
                currentLines = [];
              }
              blocks.push({ chunkIdx: -1, lines: [line] });
            } else if (chunkIdx !== currentChunk) {
              if (currentChunk !== null) {
                blocks.push({ chunkIdx: currentChunk, lines: currentLines });
              }
              currentChunk = chunkIdx;
              currentLines = [line];
            } else {
              currentLines.push(line);
            }
          });
          if (currentChunk !== null) {
            blocks.push({ chunkIdx: currentChunk, lines: currentLines });
          }

          return blocks.map((block, blockIdx) => {
            if (block.chunkIdx === -1) {
              return (
                <div key={blockIdx}>
                  {block.lines.map((line, li) => (
                    <div key={li} style={{ minHeight: 22 }}>
                      <LineText line={line} />
                    </div>
                  ))}
                </div>
              );
            }

            const color = CHUNK_COLORS[block.chunkIdx % CHUNK_COLORS.length];
            const badge = selectedStrategy === "contextual" && strategy.contextBadges
              ? strategy.contextBadges[block.chunkIdx]
              : null;

            return (
              <div
                key={blockIdx}
                style={{
                  background: color.bg,
                  border: `1.5px solid ${color.border}`,
                  borderRadius: 7,
                  padding: "6px 10px",
                  marginBottom: 6,
                  position: "relative",
                }}
              >
                {/* Chunk label pill */}
                <span
                  style={{
                    position: "absolute",
                    top: -9,
                    left: 10,
                    background: DS.bg,
                    border: `1px solid ${color.border}`,
                    borderRadius: 99,
                    fontSize: 10,
                    fontFamily: "var(--ds-sans), sans-serif",
                    fontWeight: 600,
                    color: color.label,
                    padding: "1px 8px",
                    letterSpacing: "0.04em",
                  }}
                >
                  Chunk {block.chunkIdx + 1}
                </span>

                {/* Contextual badge */}
                {badge && (
                  <div
                    style={{
                      background: "rgba(6,182,212,0.10)",
                      border: `1px solid rgba(6,182,212,0.30)`,
                      borderRadius: 5,
                      padding: "4px 8px",
                      marginBottom: 6,
                      fontSize: 10,
                      fontFamily: "var(--ds-sans), sans-serif",
                      color: CYAN,
                      lineHeight: "15px",
                    }}
                  >
                    📋 {badge}
                  </div>
                )}

                {block.lines.map((line, li) => (
                  <div key={li} style={{ minHeight: 22 }}>
                    <LineText line={line} />
                  </div>
                ))}
              </div>
            );
          });
        })()}
      </div>

      {/* Split note */}
      <div
        style={{
          fontSize: 12,
          color: DS.t3,
          marginBottom: 14,
          padding: "6px 12px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 6,
          border: `1px solid ${DS.border}`,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        {strategy.splitNote}
      </div>

      {/* Stats Row */}
      <div className="ds-g3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[
          { label: "Chunks", value: strategy.chunkCount },
          { label: "Avg Size", value: strategy.avgSize },
          {
            label: "Quality",
            value: <Stars count={strategy.quality} />,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radiusMd,
              padding: "12px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: DS.t3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: label === "Avg Size" ? 13 : 18,
                fontWeight: 700,
                color: DS.t1,
                fontFamily: label === "Avg Size" ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Pros / Cons Panel */}
      <div className="ds-g2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {/* Pros */}
        <div
          style={{
            background: "rgba(52,211,153,0.07)",
            border: "1px solid rgba(52,211,153,0.22)",
            borderRadius: DS.radiusMd,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#34D399",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            Pros
          </div>
          {strategy.pros.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                marginBottom: 5,
                fontSize: 13,
                color: DS.t2,
                fontFamily: "var(--ds-sans), sans-serif",
                lineHeight: "18px",
              }}
            >
              <span style={{ color: "#34D399", flexShrink: 0, marginTop: 1 }}>✓</span>
              <span>{p}</span>
            </div>
          ))}
        </div>

        {/* Cons */}
        <div
          style={{
            background: "rgba(248,113,113,0.07)",
            border: "1px solid rgba(248,113,113,0.22)",
            borderRadius: DS.radiusMd,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#F87171",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            Cons
          </div>
          {strategy.cons.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                marginBottom: 5,
                fontSize: 13,
                color: DS.t2,
                fontFamily: "var(--ds-sans), sans-serif",
                lineHeight: "18px",
              }}
            >
              <span style={{ color: "#F87171", flexShrink: 0, marginTop: 1 }}>✗</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippet */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          Python Implementation
        </div>
        <pre
          style={{
            margin: 0,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            lineHeight: "20px",
            color: DS.t2,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {strategy.code.split("\n").map((line, i) => {
            // Minimal syntax highlight: comments, strings, keywords
            const commentMatch = line.match(/^(.*?)(#.*)$/);
            if (commentMatch) {
              return (
                <div key={i}>
                  <span>{commentMatch[1]}</span>
                  <span style={{ color: DS.dim }}>{commentMatch[2]}</span>
                </div>
              );
            }
            // Highlight known keywords/imports
            const highlighted = line
              .split(/(from |import |def |for |in |\bif\b)/)
              .map((part, pi) => {
                if (["from ", "import ", "def ", "for ", "in ", "if "].includes(part)) {
                  return (
                    <span key={pi} style={{ color: CYAN, fontWeight: 600 }}>
                      {part}
                    </span>
                  );
                }
                // Highlight strings
                return part.split(/("([^"]*)")/g).map((s, si) => {
                  if (s.startsWith('"') && s.endsWith('"')) {
                    return (
                      <span key={si} style={{ color: "#34D399" }}>
                        {s}
                      </span>
                    );
                  }
                  return <span key={si}>{s}</span>;
                });
              });
            return <div key={i}>{highlighted}</div>;
          })}
        </pre>
      </div>
    </div>
  );
}
