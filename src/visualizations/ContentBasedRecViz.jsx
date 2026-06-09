import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Accent color ──────────────────────────────────────────────────────────────
const BLUE = "#0EA5E9";
const PURPLE = "#8B5CF6";
const GREEN = "#34D399";
const AMBER = "#F59E0B";

// ── Tag color map ─────────────────────────────────────────────────────────────
const TAG_COLORS = {
  "sci-fi": BLUE,
  thriller: "#f87171",
  "mind-bending": PURPLE,
  action: AMBER,
  drama: GREEN,
  space: "#38bdf8",
  emotional: "#fb7185",
  cyberpunk: "#a78bfa",
  linguistic: "#34d399",
  "post-apocalyptic": "#fb923c",
  "practical-effects": "#94a3b8",
};

// ── Movie data ────────────────────────────────────────────────────────────────
const MOVIES = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    tags: ["sci-fi", "thriller", "mind-bending", "action"],
    emoji: "🌀",
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    tags: ["sci-fi", "drama", "space", "emotional"],
    emoji: "🪐",
  },
  {
    id: "matrix",
    title: "The Matrix",
    year: 1999,
    tags: ["sci-fi", "action", "cyberpunk", "mind-bending"],
    emoji: "💊",
  },
  {
    id: "arrival",
    title: "Arrival",
    year: 2016,
    tags: ["sci-fi", "drama", "linguistic", "emotional"],
    emoji: "🛸",
  },
  {
    id: "madmax",
    title: "Mad Max",
    year: 2015,
    tags: ["action", "post-apocalyptic", "thriller", "practical-effects"],
    emoji: "🔥",
  },
];

// ── Pre-computed cosine similarities (all pairs) ──────────────────────────────
const SIMILARITY = {
  inception: {
    interstellar: 0.67,
    matrix: 0.75,
    arrival: 0.58,
    madmax: 0.24,
  },
  interstellar: {
    inception: 0.67,
    matrix: 0.42,
    arrival: 0.83,
    madmax: 0.18,
  },
  matrix: {
    inception: 0.75,
    interstellar: 0.42,
    arrival: 0.35,
    madmax: 0.38,
  },
  arrival: {
    inception: 0.58,
    interstellar: 0.83,
    matrix: 0.35,
    madmax: 0.12,
  },
  madmax: {
    inception: 0.24,
    interstellar: 0.18,
    matrix: 0.38,
    arrival: 0.12,
  },
};

// ── Score bar color (green → amber → red by threshold) ───────────────────────
const scoreColor = (s) => {
  if (s >= 0.7) return GREEN;
  if (s >= 0.45) return AMBER;
  return "#f87171";
};

export default function ContentBasedRecViz() {
  const [selectedId, setSelectedId] = useState("inception");

  const selectedMovie = MOVIES.find((m) => m.id === selectedId);

  // Similarity rows sorted descending
  const simRows = MOVIES.filter((m) => m.id !== selectedId)
    .map((m) => ({
      movie: m,
      score: SIMILARITY[selectedId][m.id],
    }))
    .sort((a, b) => b.score - a.score);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const containerStyle = {
    fontFamily: "var(--ds-sans), sans-serif",
    background: DS.bg,
    color: DS.t1,
    padding: "20px",
    borderRadius: DS.radiusMd,
  };

  const sectionTitleStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: DS.t3,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: 10,
  };

  const cardStyle = (isSelected) => ({
    flex: "1 1 120px",
    background: isSelected ? `${BLUE}18` : "rgba(255,255,255,0.03)",
    border: `1px solid ${isSelected ? BLUE : DS.border}`,
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    transition: "all 0.18s ease",
    boxShadow: isSelected ? `0 0 0 2px ${BLUE}44` : "none",
  });

  const tagChipStyle = (tag) => ({
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: `${TAG_COLORS[tag] || DS.t3}22`,
    border: `1px solid ${TAG_COLORS[tag] || DS.t3}55`,
    color: TAG_COLORS[tag] || DS.t3,
    marginRight: 5,
    marginBottom: 5,
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{ fontSize: 15, fontWeight: 700, color: DS.t1, marginBottom: 4 }}
        >
          Content-Based Recommendation Explorer
        </div>
        <div style={{ fontSize: 12, color: DS.t3 }}>
          Select a movie to see its feature vector and cosine similarity scores against all others.
        </div>
      </div>

      {/* Movie cards row */}
      <div style={sectionTitleStyle}>Select a movie</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {MOVIES.map((movie) => {
          const isSelected = movie.id === selectedId;
          return (
            <div
              key={movie.id}
              style={cardStyle(isSelected)}
              onClick={() => setSelectedId(movie.id)}
            >
              <div
                style={{
                  fontSize: 20,
                  marginBottom: 4,
                  lineHeight: 1,
                }}
              >
                {movie.emoji}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isSelected ? BLUE : DS.t1,
                  marginBottom: 2,
                }}
              >
                {movie.title}
              </div>
              <div style={{ fontSize: 10, color: DS.t3 }}>{movie.year}</div>
            </div>
          );
        })}
      </div>

      {/* Feature Vector panel */}
      <div
        style={{
          background: "rgba(14,165,233,0.06)",
          border: `1px solid ${BLUE}30`,
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: BLUE,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Feature Vector — {selectedMovie.emoji} {selectedMovie.title}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
          {selectedMovie.tags.map((tag) => (
            <span key={tag} style={tagChipStyle(tag)}>
              {tag}
            </span>
          ))}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            color: DS.t3,
          }}
        >
          {/* Binarized vector representation */}
          vector =[{" "}
          {Object.keys(TAG_COLORS).map((tag) => {
            const present = selectedMovie.tags.includes(tag);
            return (
              <span
                key={tag}
                style={{
                  color: present ? TAG_COLORS[tag] : DS.dim,
                  fontWeight: present ? 700 : 400,
                }}
              >
                {present ? "1" : "0"}
                {", "}
              </span>
            );
          })}
          …]
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: DS.t3,
          }}
        >
          Each dimension = one genre/attribute tag. 1 = present, 0 = absent.
        </div>
      </div>

      {/* Cosine Similarity table */}
      <div style={sectionTitleStyle}>Cosine Similarity Ranking</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {simRows.map(({ movie, score }, idx) => {
          const color = scoreColor(score);
          // Shared tags
          const sharedTags = movie.tags.filter((t) =>
            selectedMovie.tags.includes(t)
          );
          return (
            <div
              key={movie.id}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${DS.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Rank badge */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `${color}22`,
                  border: `1px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>

              {/* Movie info */}
              <div style={{ flex: "0 0 110px" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: DS.t1,
                    marginBottom: 2,
                  }}
                >
                  {movie.emoji} {movie.title}
                </div>
                <div style={{ fontSize: 10, color: DS.t3 }}>
                  {sharedTags.length > 0
                    ? `Shared: ${sharedTags.join(", ")}`
                    : "No shared tags"}
                </div>
              </div>

              {/* Score bar + value */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 6,
                    background: DS.border,
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(score * 100)}%`,
                      background: color,
                      borderRadius: 3,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                    }}
                  >
                    cos(θ) = {score.toFixed(2)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                    }}
                  >
                    {score >= 0.7
                      ? "High match"
                      : score >= 0.45
                      ? "Partial match"
                      : "Low match"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works section */}
      <div
        style={{
          background: "rgba(129,140,248,0.06)",
          border: `1px solid ${PURPLE}30`,
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: PURPLE,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          How It Works — Cosine Similarity
        </div>

        {/* Formula */}
        <div
          style={{
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${DS.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 14,
              color: DS.t1,
              letterSpacing: "0.04em",
            }}
          >
            cos(A,B) ={" "}
            <span style={{ color: BLUE }}>A · B</span>
            {" "}
            <span style={{ color: DS.t3 }}>/</span>
            {" "}
            (
            <span style={{ color: GREEN }}>|A|</span>
            {" × "}
            <span style={{ color: GREEN }}>|B|</span>
            )
          </span>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            {
              step: "1",
              color: BLUE,
              label: "Build item profiles",
              desc: "Encode metadata (genres, cast, directors) as binary or weighted vectors.",
            },
            {
              step: "2",
              color: PURPLE,
              label: "Compute dot product (A · B)",
              desc: "Count shared tag dimensions weighted by their TF-IDF importance.",
            },
            {
              step: "3",
              color: GREEN,
              label: "Normalize by magnitudes",
              desc: "Divide by vector lengths so longer profiles don't dominate.",
            },
            {
              step: "4",
              color: AMBER,
              label: "Rank & recommend",
              desc: "Sort all candidate items by score; return top-K.",
            },
          ].map((s) => (
            <div
              key={s.step}
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: `${s.color}22`,
                  border: `1px solid ${s.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: s.color,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {s.step}
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: DS.t1 }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 11, color: DS.t3, marginLeft: 6 }}>
                  {s.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: `${BLUE}0c`,
            border: `1px solid ${BLUE}22`,
            borderRadius: 7,
            fontSize: 11,
            color: DS.t3,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: BLUE, fontWeight: 600 }}>Key advantage: </span>
          Item profiles built from metadata (genres, cast, directors) — no user history needed.
          Works on day one with zero ratings data (cold-start friendly).
        </div>
      </div>
    </div>
  );
}
