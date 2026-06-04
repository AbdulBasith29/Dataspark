import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants ──────────────────────────────────────────────────────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.15)";
const CYAN_BORDER = "rgba(6,182,212,0.4)";

const TECHNIQUES = [
  { id: "rewrite", label: "Query Rewriting" },
  { id: "hyde", label: "HyDE" },
  { id: "rerank", label: "Reranking" },
  { id: "multiquery", label: "Multi-Query" },
];

const RERANK_ROWS = [
  { chunk: "chunk_47", cosine: "0.89", cross: "0.94", finalRank: 1, dir: "up", origRank: 1 },
  { chunk: "chunk_12", cosine: "0.87", cross: "0.41", finalRank: 5, dir: "down", origRank: 2 },
  { chunk: "chunk_91", cosine: "0.85", cross: "0.88", finalRank: 2, dir: "up", origRank: 3 },
  { chunk: "chunk_33", cosine: "0.84", cross: "0.71", finalRank: 3, dir: "same", origRank: 4 },
  { chunk: "chunk_55", cosine: "0.82", cross: "0.79", finalRank: 4, dir: "up", origRank: 5 },
];

const MULTIQUERY_VARIANTS = [
  { id: 1, text: "HNSW algorithm vector databases", chunks: ["chunk_47", "chunk_91", "chunk_22"] },
  { id: 2, text: "approximate nearest neighbor graph-based search", chunks: ["chunk_47", "chunk_33", "chunk_77"] },
  { id: 3, text: "hierarchical navigable small world performance", chunks: ["chunk_91", "chunk_47", "chunk_08"] },
];

const MULTIQUERY_FUSED = [
  { chunk: "chunk_47", score: "3/3 queries", highlight: true },
  { chunk: "chunk_91", score: "2/3 queries", highlight: true },
  { chunk: "chunk_33", score: "1/3 queries", highlight: false },
  { chunk: "chunk_22", score: "1/3 queries", highlight: false },
  { chunk: "chunk_77", score: "1/3 queries", highlight: false },
];

const TECHNIQUE_META = {
  rewrite: {
    latency: "+80–150ms",
    precision: "~25%",
    when: "User queries are vague, colloquial, or underspecified",
  },
  hyde: {
    latency: "+200–400ms",
    precision: "~30%",
    when: "Query-document gap is large (question vs. encyclopedic corpus)",
  },
  rerank: {
    latency: "+100–300ms",
    precision: "~35%",
    when: "High recall is cheap but top-k precision matters critically",
  },
  multiquery: {
    latency: "+300–600ms",
    precision: "~20%",
    when: "Queries are ambiguous or benefit from multiple phrasings",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const boxBase = {
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: 13,
  fontFamily: "var(--ds-sans), sans-serif",
  lineHeight: 1.5,
};

const arrowStyle = {
  color: DS.t3,
  fontSize: 20,
  lineHeight: 1,
  textAlign: "center",
  margin: "4px 0",
  userSelect: "none",
};

function FlowBox({ children, color = CYAN, bg, style = {} }) {
  return (
    <div
      style={{
        ...boxBase,
        background: bg || `rgba(6,182,212,0.08)`,
        border: `1px solid ${color}44`,
        color: DS.t2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Arrow() {
  return <div style={arrowStyle}>↓</div>;
}

function ChunkPill({ text, match, style = {} }) {
  const bg = match ? "rgba(52,211,153,0.15)" : "rgba(148,163,184,0.08)";
  const border = match ? "rgba(52,211,153,0.4)" : DS.border;
  const dotColor = match ? DS.grn : DS.dim;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 6,
        padding: "6px 12px",
        fontSize: 12,
        color: match ? DS.t2 : DS.t3,
        fontFamily: "var(--ds-mono), monospace",
        ...style,
      }}
    >
      <span style={{ color: dotColor, fontSize: 8 }}>●</span>
      {text}
    </div>
  );
}

// ─── Technique Panels ────────────────────────────────────────────────────────

function QueryRewritingPanel() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* Left: Naive */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-sans), sans-serif",
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Naive RAG
        </div>
        <FlowBox
          bg="rgba(148,163,184,0.06)"
          color="#94A3B8"
          style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}
        >
          "what's the hnsw thing for vector search"
        </FlowBox>
        <Arrow />
        <FlowBox bg="rgba(148,163,184,0.06)" color="#94A3B8">
          Vector Store
        </FlowBox>
        <Arrow />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ChunkPill text="chunk_47: HNSW paper intro..." match={true} />
          <ChunkPill text="chunk_88: unrelated LSH content" match={false} />
          <ChunkPill text="chunk_23: hash table basics" match={false} />
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#F59E0B",
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          1 / 3 chunks relevant
        </div>
      </div>

      {/* Right: Query Rewriting */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-sans), sans-serif",
            color: CYAN,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          With Query Rewriting
        </div>
        <FlowBox style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>
          "what's the hnsw thing for vector search"
        </FlowBox>
        <Arrow />
        <FlowBox
          bg="rgba(6,182,212,0.12)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            color: CYAN,
          }}
        >
          <span>✦</span> LLM Rewriter
        </FlowBox>
        <Arrow />
        <FlowBox
          bg="rgba(6,182,212,0.06)"
          style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t1 }}
        >
          "Explain HNSW (Hierarchical Navigable Small World) algorithm for approximate nearest neighbor search in vector databases"
        </FlowBox>
        <Arrow />
        <FlowBox bg="rgba(6,182,212,0.06)" color={CYAN}>
          Vector Store
        </FlowBox>
        <Arrow />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ChunkPill text="chunk_47: HNSW paper intro..." match={true} />
          <ChunkPill text="chunk_91: HNSW graph construction" match={true} />
          <ChunkPill text="chunk_33: ANN benchmarks + HNSW" match={true} />
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: DS.grn,
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          3 / 3 chunks relevant
        </div>
      </div>
    </div>
  );
}

function HyDEPanel() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* Left: Naive */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-sans), sans-serif",
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Naive Embedding
        </div>
        <FlowBox
          bg="rgba(148,163,184,0.06)"
          color="#94A3B8"
          style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}
        >
          "How does HNSW work?"
        </FlowBox>
        <Arrow />
        <FlowBox bg="rgba(148,163,184,0.08)" color="#94A3B8">
          Embed query text
        </FlowBox>
        <Arrow />
        <div
          style={{
            background: "rgba(148,163,184,0.06)",
            border: `1px solid rgba(148,163,184,0.2)`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            color: DS.dim,
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          <div style={{ marginBottom: 6, color: DS.t3 }}>Retrieval quality:</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: i <= 2 ? "rgba(245,158,11,0.4)" : "rgba(148,163,184,0.1)",
                  border: `1px solid ${i <= 2 ? "rgba(245,158,11,0.4)" : DS.border}`,
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 6, color: "#F59E0B" }}>Mediocre matches — question embedding is far from answer embeddings</div>
        </div>
      </div>

      {/* Right: HyDE */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-sans), sans-serif",
            color: CYAN,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          HyDE
        </div>
        <FlowBox style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12 }}>
          "How does HNSW work?"
        </FlowBox>
        <Arrow />
        <FlowBox
          bg="rgba(6,182,212,0.12)"
          style={{ fontWeight: 600, color: CYAN, display: "flex", alignItems: "center", gap: 8 }}
        >
          <span>✦</span> LLM generates hypothetical answer
        </FlowBox>
        <Arrow />
        <div
          style={{
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${CYAN_BORDER}`,
            borderRadius: 8,
            padding: "10px 12px",
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            color: DS.t2,
            lineHeight: 1.6,
            marginBottom: 4,
          }}
        >
          <span style={{ color: CYAN, fontWeight: 700 }}>Hypothetical answer: </span>
          "HNSW organizes vectors in a hierarchical graph with multiple layers. Each vector connects to M neighbors. Search starts at the top layer and greedily navigates toward the query..."
        </div>
        <Arrow />
        <FlowBox bg="rgba(6,182,212,0.08)" color={CYAN}>
          Embed hypothetical answer (document-like text)
        </FlowBox>
        <Arrow />
        <div
          style={{
            background: "rgba(52,211,153,0.06)",
            border: `1px solid rgba(52,211,153,0.3)`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          <div style={{ marginBottom: 6, color: DS.t3 }}>Retrieval quality:</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: "rgba(52,211,153,0.4)",
                  border: `1px solid rgba(52,211,153,0.5)`,
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 6, color: DS.grn }}>Precise matches — answer embedding lives in document space</div>
        </div>
      </div>
    </div>
  );
}

function RerankingPanel() {
  const sortedByFinal = [...RERANK_ROWS].sort((a, b) => a.finalRank - b.finalRank);

  const dirIcon = (dir) => {
    if (dir === "up") return <span style={{ color: DS.grn }}>↑</span>;
    if (dir === "down") return <span style={{ color: "#F87171" }}>↓</span>;
    return <span style={{ color: DS.dim }}>—</span>;
  };

  const crossColor = (val) => {
    const n = parseFloat(val);
    if (n >= 0.85) return DS.grn;
    if (n >= 0.65) return CYAN;
    return "#F87171";
  };

  return (
    <div>
      {/* Two stage diagram */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: 160,
            background: "rgba(148,163,184,0.05)",
            border: `1px solid ${DS.border}`,
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: DS.t3,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            Stage 1 · Coarse
          </div>
          <div
            style={{
              fontFamily: "var(--ds-sans), sans-serif",
              fontSize: 13,
              color: DS.t2,
              lineHeight: 1.6,
            }}
          >
            Vector search<br />
            <span style={{ color: DS.t3 }}>→ top-50 candidates</span><br />
            <span style={{ color: "#F59E0B", fontSize: 12 }}>Fast, approximate, high recall</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: DS.t3,
            fontSize: 20,
            padding: "0 4px",
          }}
        >
          →
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 160,
            background: CYAN_DIM,
            border: `1px solid ${CYAN_BORDER}`,
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: CYAN,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            Stage 2 · Fine
          </div>
          <div
            style={{
              fontFamily: "var(--ds-sans), sans-serif",
              fontSize: 13,
              color: DS.t2,
              lineHeight: 1.6,
            }}
          >
            Cross-encoder scores 50 pairs<br />
            <span style={{ color: DS.t3 }}>→ top-5 final results</span><br />
            <span style={{ color: DS.grn, fontSize: 12 }}>Slow, precise, high precision</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              {["Chunk", "Cosine Score", "Cross-Encoder Score", "Final Rank"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    fontFamily: "var(--ds-sans), sans-serif",
                    color: DS.t3,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    borderBottom: `1px solid ${DS.border}`,
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedByFinal.map((row, i) => {
              const isDramatic = row.chunk === "chunk_12";
              return (
                <tr
                  key={row.chunk}
                  style={{
                    background: isDramatic
                      ? "rgba(248,113,113,0.06)"
                      : i % 2 === 0
                      ? "transparent"
                      : "rgba(255,255,255,0.01)",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 13,
                      color: isDramatic ? "#F87171" : DS.t2,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.chunk}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 13,
                      color: DS.t3,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.cosine}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 13,
                      color: crossColor(row.cross),
                      borderBottom: `1px solid ${DS.border}`,
                      fontWeight: 600,
                    }}
                  >
                    {row.cross}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 13,
                      color: DS.t2,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.finalRank} {dirIcon(row.dir)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "10px 14px",
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: 8,
          fontSize: 12,
          color: DS.t2,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        <span style={{ color: "#F87171", fontWeight: 600 }}>Key insight: </span>
        chunk_12 ranked #2 by cosine similarity but dropped to #5 by cross-encoder — it contained surface-level keyword matches without semantic relevance.
      </div>
    </div>
  );
}

function MultiQueryPanel() {
  const allChunks = MULTIQUERY_VARIANTS.flatMap((v) => v.chunks);
  const chunkCount = {};
  allChunks.forEach((c) => { chunkCount[c] = (chunkCount[c] || 0) + 1; });

  const variantColors = [CYAN, "#818CF8", "#34D399"];

  return (
    <div>
      {/* Original query */}
      <FlowBox
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 13,
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        "How does HNSW achieve fast approximate nearest neighbor search?"
      </FlowBox>
      <Arrow />
      <FlowBox
        bg="rgba(6,182,212,0.12)"
        style={{
          fontWeight: 600,
          color: CYAN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span>✦</span> LLM generates N query variants
      </FlowBox>
      <Arrow />

      {/* 3 variant columns */}
      <div style={{ display: "flex", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
        {MULTIQUERY_VARIANTS.map((v, i) => (
          <div
            key={v.id}
            style={{
              flex: 1,
              minWidth: 140,
              background: `${variantColors[i]}12`,
              border: `1px solid ${variantColors[i]}44`,
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: variantColors[i],
                fontFamily: "var(--ds-sans), sans-serif",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Query {v.id}
            </div>
            <div
              style={{
                fontSize: 12,
                color: DS.t2,
                fontFamily: "var(--ds-mono), monospace",
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              "{v.text}"
            </div>
            <div
              style={{
                fontSize: 11,
                color: DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                marginBottom: 4,
              }}
            >
              Retrieved:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {v.chunks.map((c) => (
                <div
                  key={c}
                  style={{
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 11,
                    color: chunkCount[c] >= 2 ? DS.grn : DS.t3,
                    background:
                      chunkCount[c] >= 2
                        ? "rgba(52,211,153,0.1)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${chunkCount[c] >= 2 ? "rgba(52,211,153,0.3)" : DS.border}`,
                    borderRadius: 4,
                    padding: "3px 8px",
                  }}
                >
                  {c} {chunkCount[c] >= 2 ? "★" : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Arrow />
      <FlowBox
        bg="rgba(129,140,248,0.1)"
        style={{
          color: DS.ind,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
          justifyContent: "center",
        }}
      >
        RRF Fusion (Reciprocal Rank Fusion)
      </FlowBox>
      <Arrow />

      {/* Fused results */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {MULTIQUERY_FUSED.map((row, i) => (
          <div
            key={row.chunk}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              borderBottom: i < MULTIQUERY_FUSED.length - 1 ? `1px solid ${DS.border}` : "none",
              background: row.highlight ? "rgba(52,211,153,0.06)" : "transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 12,
                  color: DS.dim,
                  minWidth: 16,
                }}
              >
                {i + 1}.
              </span>
              <span
                style={{
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 13,
                  color: row.highlight ? DS.t1 : DS.t2,
                  fontWeight: row.highlight ? 600 : 400,
                }}
              >
                {row.chunk}
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 12,
                color: row.highlight ? DS.grn : DS.t3,
                fontWeight: row.highlight ? 600 : 400,
              }}
            >
              {row.score} {row.highlight ? "↑ boosted" : ""}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "10px 14px",
          background: "rgba(52,211,153,0.07)",
          border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: 8,
          fontSize: 12,
          color: DS.t2,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        <span style={{ color: DS.grn, fontWeight: 600 }}>RRF rule: </span>
        Chunks appearing across multiple query retrievals get boosted rank. chunk_47 and chunk_91 appear in 3/3 and 2/3 queries respectively — floated to the top.
      </div>
    </div>
  );
}

function InfoBar({ id }) {
  const meta = TECHNIQUE_META[id];
  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        background: "rgba(6,182,212,0.05)",
        border: `1px solid ${CYAN_BORDER}`,
        borderRadius: 10,
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 120,
          fontFamily: "var(--ds-sans), sans-serif",
          fontSize: 13,
          color: DS.t2,
        }}
      >
        <span style={{ color: DS.t3 }}>⚡ Latency impact: </span>
        <span style={{ color: "#F59E0B", fontWeight: 600 }}>{meta.latency}</span>
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 120,
          fontFamily: "var(--ds-sans), sans-serif",
          fontSize: 13,
          color: DS.t2,
        }}
      >
        <span style={{ color: DS.t3 }}>🎯 Precision improvement: </span>
        <span style={{ color: DS.grn, fontWeight: 600 }}>{meta.precision}</span>
      </div>
      <div
        style={{
          flex: 2,
          minWidth: 200,
          fontFamily: "var(--ds-sans), sans-serif",
          fontSize: 13,
          color: DS.t2,
        }}
      >
        <span style={{ color: DS.t3 }}>💡 When to use: </span>
        {meta.when}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdvancedRAGViz() {
  const [selectedTechnique, setSelectedTechnique] = useState("rewrite");

  return (
    <div
      style={{
        background: DS.bgElev,
        borderRadius: DS.radiusLg,
        padding: "24px 24px",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
        maxWidth: 860,
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: DS.t1,
            letterSpacing: "-0.01em",
          }}
        >
          Advanced RAG Patterns
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: DS.t3,
            lineHeight: 1.5,
          }}
        >
          Four techniques that improve retrieval quality beyond naive vector search
        </p>
      </div>

      {/* Tab Selector */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {TECHNIQUES.map((t) => {
          const active = selectedTechnique === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTechnique(t.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: active ? `1.5px solid ${CYAN}` : `1.5px solid ${DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                color: active ? CYAN : DS.t3,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontFamily: "var(--ds-sans), sans-serif",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content Panel */}
      <div
        style={{
          background: DS.card,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "20px",
        }}
      >
        {selectedTechnique === "rewrite" && <QueryRewritingPanel />}
        {selectedTechnique === "hyde" && <HyDEPanel />}
        {selectedTechnique === "rerank" && <RerankingPanel />}
        {selectedTechnique === "multiquery" && <MultiQueryPanel />}
      </div>

      {/* Info Bar */}
      <InfoBar id={selectedTechnique} />
    </div>
  );
}
