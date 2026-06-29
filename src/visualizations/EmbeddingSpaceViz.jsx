import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const AMBER = "#FBBF24";
const GREEN = "#34D399";
const PURPLE = "#A78BFA";
const RED = "#F87171";

// Toy 2D embedding space — positions chosen so that semantic neighborhoods cluster
// (royalty, gender, capitals, animals, tech) and the king-man+woman≈queen analogy holds.
const WORDS = [
  // royalty / gender cluster
  { id: "king", x: 4.2, y: 3.0, cluster: "royalty" },
  { id: "queen", x: 3.4, y: 4.6, cluster: "royalty" },
  { id: "man", x: 1.6, y: 0.6, cluster: "royalty" },
  { id: "woman", x: 0.8, y: 2.2, cluster: "royalty" },
  { id: "prince", x: 4.9, y: 2.3, cluster: "royalty" },
  { id: "princess", x: 4.1, y: 3.9, cluster: "royalty" },
  // capitals / countries cluster
  { id: "paris", x: -3.2, y: 3.4, cluster: "geo" },
  { id: "france", x: -2.4, y: 2.2, cluster: "geo" },
  { id: "tokyo", x: -4.6, y: 4.3, cluster: "geo" },
  { id: "japan", x: -3.9, y: 3.1, cluster: "geo" },
  { id: "berlin", x: -2.9, y: 4.9, cluster: "geo" },
  { id: "germany", x: -2.1, y: 3.8, cluster: "geo" },
  // animals cluster
  { id: "dog", x: -1.0, y: -3.4, cluster: "animal" },
  { id: "puppy", x: -0.4, y: -2.4, cluster: "animal" },
  { id: "cat", x: -2.2, y: -3.8, cluster: "animal" },
  { id: "kitten", x: -1.7, y: -2.7, cluster: "animal" },
  { id: "wolf", x: -0.4, y: -4.6, cluster: "animal" },
  // tech / ML cluster
  { id: "gpu", x: 3.6, y: -3.2, cluster: "tech" },
  { id: "transformer", x: 4.4, y: -2.1, cluster: "tech" },
  { id: "embedding", x: 3.0, y: -1.6, cluster: "tech" },
  { id: "attention", x: 4.9, y: -1.0, cluster: "tech" },
  { id: "neural network", x: 2.4, y: -2.7, cluster: "tech" },
];

const CLUSTER_COLORS = {
  royalty: AMBER,
  geo: GREEN,
  animal: PURPLE,
  tech: CYAN_BRIGHT,
};

const CLUSTER_LABELS = {
  royalty: "Royalty / Gender",
  geo: "Capitals / Countries",
  animal: "Animals",
  tech: "ML / Tech",
};

// Plot bounds in "embedding space" units, mapped onto an SVG viewport.
const VIEW_W = 600;
const VIEW_H = 460;
const SPACE_HALF = 6.0; // data spans roughly [-6, 6] on both axes

function toSvgX(x) {
  return (x + SPACE_HALF) / (2 * SPACE_HALF) * VIEW_W;
}
function toSvgY(y) {
  // invert y so positive is "up" visually
  return VIEW_H - (y + SPACE_HALF) / (2 * SPACE_HALF) * VIEW_H;
}

function euclidean(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Cosine-similarity-style score derived from angle, normalized to [0,1] for display,
// using vectors anchored at the space's center so direction is meaningful.
function cosineLikeSimilarity(a, b) {
  const center = { x: 0, y: 0 };
  const va = { x: a.x - center.x, y: a.y - center.y };
  const vb = { x: b.x - center.x, y: b.y - center.y };
  const dot = va.x * vb.x + va.y * vb.y;
  const magA = Math.hypot(va.x, va.y) || 1e-6;
  const magB = Math.hypot(vb.x, vb.y) || 1e-6;
  const cos = dot / (magA * magB);
  // blend cosine with inverse distance so nearby points read as "more similar"
  // in a way that's intuitive on this toy 2D map.
  const dist = euclidean(a, b);
  const distScore = 1 / (1 + dist / 3);
  return 0.5 * ((cos + 1) / 2) + 0.5 * distScore;
}

function nearestNeighbors(word, all, n = 4) {
  return all
    .filter((w) => w.id !== word.id)
    .map((w) => ({ ...w, sim: cosineLikeSimilarity(word, w) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, n);
}

const KING = WORDS.find((w) => w.id === "king");
const MAN = WORDS.find((w) => w.id === "man");
const WOMAN = WORDS.find((w) => w.id === "woman");
const QUEEN = WORDS.find((w) => w.id === "queen");
const COMPOSED = { x: KING.x - MAN.x + WOMAN.x, y: KING.y - MAN.y + WOMAN.y };

export default function EmbeddingSpaceViz() {
  const [selectedId, setSelectedId] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);

  const selected = WORDS.find((w) => w.id === selectedId) || null;

  const neighbors = useMemo(() => {
    if (!selected) return [];
    return nearestNeighbors(selected, WORDS, 4);
  }, [selected]);

  const neighborIds = new Set(neighbors.map((n) => n.id));

  const composedDistanceToQueen = euclidean(COMPOSED, QUEEN);

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
          Embedding Space Explorer
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Click a word to see its nearest neighbors by similarity. Toggle the analogy overlay to see why
          king − man + woman ≈ queen is a spatial fact, not a coincidence.
        </p>
      </div>

      {/* Cluster legend */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
        {Object.entries(CLUSTER_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: DS.t3 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: CLUSTER_COLORS[key], display: "inline-block" }} />
            {label}
          </div>
        ))}
      </div>

      {/* Analogy toggle */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <button
          onClick={() => setShowAnalogy((v) => !v)}
          style={{
            padding: "8px 16px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${showAnalogy ? CYAN : DS.border}`,
            background: showAnalogy ? CYAN_DIM : "rgba(255,255,255,0.02)",
            color: showAnalogy ? CYAN_BRIGHT : DS.t3,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: showAnalogy ? 600 : 400,
            cursor: "pointer",
            outline: "none",
            transition: "all 0.15s ease",
          }}
        >
          {showAnalogy ? "Hide" : "Show"} king − man + woman ≈ queen overlay
        </button>
      </div>

      {/* SVG scatter plot */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: 10,
          marginBottom: 16,
        }}
      >
        <svg width="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ display: "block" }}>
          {/* axes */}
          <line x1={0} y1={VIEW_H / 2} x2={VIEW_W} y2={VIEW_H / 2} stroke={DS.border} strokeWidth={1} />
          <line x1={VIEW_W / 2} y1={0} x2={VIEW_W / 2} y2={VIEW_H} stroke={DS.border} strokeWidth={1} />

          {/* analogy vectors */}
          {showAnalogy && (
            <g>
              <line
                x1={toSvgX(MAN.x)} y1={toSvgY(MAN.y)}
                x2={toSvgX(KING.x)} y2={toSvgY(KING.y)}
                stroke={GREEN} strokeWidth={2} markerEnd="url(#arrow-green)"
              />
              <line
                x1={toSvgX(KING.x)} y1={toSvgY(KING.y)}
                x2={toSvgX(COMPOSED.x)} y2={toSvgY(COMPOSED.y)}
                stroke={AMBER} strokeWidth={2} markerEnd="url(#arrow-amber)"
              />
              <line
                x1={toSvgX(WOMAN.x)} y1={toSvgY(WOMAN.y)}
                x2={toSvgX(COMPOSED.x)} y2={toSvgY(COMPOSED.y)}
                stroke={RED} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.7}
              />
              <circle cx={toSvgX(COMPOSED.x)} cy={toSvgY(COMPOSED.y)} r={6} fill={RED} opacity={0.9} />
              <text x={toSvgX(COMPOSED.x) + 10} y={toSvgY(COMPOSED.y) + 4} fill={DS.t2} fontSize={10} fontFamily="var(--ds-mono), monospace">
                king−man+woman
              </text>
              <defs>
                <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill={GREEN} />
                </marker>
                <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill={AMBER} />
                </marker>
              </defs>
            </g>
          )}

          {/* connecting lines to neighbors of selected word */}
          {selected &&
            neighbors.map((n) => (
              <line
                key={"line-" + n.id}
                x1={toSvgX(selected.x)} y1={toSvgY(selected.y)}
                x2={toSvgX(n.x)} y2={toSvgY(n.y)}
                stroke={CYAN_BRIGHT}
                strokeWidth={1 + n.sim * 2}
                opacity={0.25 + n.sim * 0.5}
              />
            ))}

          {/* word points */}
          {WORDS.map((w) => {
            const isSelected = selected && w.id === selected.id;
            const isNeighbor = neighborIds.has(w.id);
            const r = isSelected ? 8 : isNeighbor ? 6.5 : 5;
            return (
              <g
                key={w.id}
                onClick={() => setSelectedId(w.id === selectedId ? null : w.id)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={toSvgX(w.x)}
                  cy={toSvgY(w.y)}
                  r={r}
                  fill={CLUSTER_COLORS[w.cluster]}
                  opacity={isSelected ? 1 : isNeighbor ? 0.95 : 0.55}
                  stroke={isSelected ? "#fff" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={toSvgX(w.x)}
                  y={toSvgY(w.y) - r - 5}
                  textAnchor="middle"
                  fill={isSelected ? "#fff" : isNeighbor ? DS.t1 : DS.t3}
                  fontSize={isSelected ? 12 : 10.5}
                  fontWeight={isSelected ? 700 : isNeighbor ? 600 : 400}
                  fontFamily="var(--ds-mono), monospace"
                >
                  {w.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected word panel */}
      {selected ? (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Nearest neighbors of <span style={{ color: CYAN_BRIGHT }}>"{selected.id}"</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {neighbors.map((n) => {
              const pct = Math.round(n.sim * 100);
              return (
                <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 110, flexShrink: 0, fontSize: 12, fontFamily: "var(--ds-mono), monospace", color: DS.t2 }}>
                    {n.id}
                  </div>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: CLUSTER_COLORS[n.cluster],
                        borderRadius: 4,
                        transition: "width 0.25s ease",
                      }}
                    />
                  </div>
                  <div style={{ width: 42, flexShrink: 0, fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t3 }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            fontSize: 12.5,
            color: DS.t3,
            padding: "14px",
            marginBottom: 16,
            border: `1px dashed ${DS.border}`,
            borderRadius: DS.radiusMd,
          }}
        >
          Click any point above to see its nearest neighbors by similarity score.
        </div>
      )}

      {/* Analogy explanation */}
      {showAnalogy && (
        <div
          style={{
            background: CYAN_DIM,
            border: `1px solid rgba(6,182,212,0.3)`,
            borderRadius: DS.radiusMd,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 12.5,
            color: DS.t2,
            lineHeight: "19px",
          }}
        >
          The vector from "man" to "king" (green) encodes something like <em>+royalty</em>. Adding that same
          displacement starting at "woman" (amber, from king to the composed point) lands very close to "queen" —
          Euclidean distance to the real "queen" point here is{" "}
          <strong style={{ color: CYAN_BRIGHT }}>{composedDistanceToQueen.toFixed(2)}</strong> units, far smaller
          than the distance between unrelated clusters. This is the spatial structure that makes embeddings useful:
          relationships between concepts become arithmetic on vectors.
        </div>
      )}

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
        Real embedding models place words in 768–3072 dimensions, not 2 — this toy space is for intuition only.
        The similarity score shown blends angle (cosine-style) and proximity, mirroring how cosine similarity over
        normalized high-dimensional vectors captures "closeness in meaning" rather than closeness in raw token overlap.
      </div>
    </div>
  );
}
