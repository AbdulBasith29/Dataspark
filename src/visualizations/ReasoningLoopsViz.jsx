import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component — TDZ safety) ─────────────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";
const CYAN_BORDER = "rgba(6,182,212,0.4)";
const GRN = "#34D399";
const RED = "#F87171";
const PURPLE = "#818CF8";
const PANEL_BG = "rgba(2,6,23,0.72)";

const PROBLEM = "Plan a 3-day itinerary for a Tokyo trip that fits a $600 budget.";

const PATTERNS = [
  { id: "react", label: "ReAct", color: CYAN },
  { id: "tot", label: "Tree of Thoughts", color: PURPLE },
  { id: "reflexion", label: "Self-Reflection", color: GRN },
];

const REACT_TRACE = [
  { kind: "Thought", text: "I need flight + lodging + activity costs before I can build a budget-fitting plan." },
  { kind: "Action", text: "search_flights(\"Tokyo round-trip\")" },
  { kind: "Observation", text: "Round-trip flight: $310." },
  { kind: "Thought", text: "That leaves $290 for 3 nights of lodging + activities. Lodging first." },
  { kind: "Action", text: "search_hotels(\"Tokyo budget hostel\", nights=3)" },
  { kind: "Observation", text: "3 nights at a hostel: $120 total." },
  { kind: "Thought", text: "$170 remains for food + activities across 3 days — roughly $56/day. That's workable." },
  { kind: "Action", text: "finish(\"3-day Tokyo plan: $310 flight, $120 hostel, ~$56/day for food + 1-2 free/cheap activities (temples, markets).\")" },
];

const TOT_TREE = {
  root: "Plan a 3-day $600 Tokyo trip",
  branches: [
    {
      id: "a",
      label: "Path A: Budget hostel + street food",
      score: 8,
      pruned: false,
      detail: "Flight $310 + hostel $120 + food/activities $170 ≈ $600. Tight but fits.",
    },
    {
      id: "b",
      label: "Path B: Mid-range hotel + sit-down meals",
      score: 3,
      pruned: true,
      detail: "Flight $310 + hotel $280 + meals $150 ≈ $740. Over budget — pruned.",
    },
    {
      id: "c",
      label: "Path C: Capsule hotel + day-trip rail pass",
      score: 6,
      pruned: false,
      detail: "Flight $310 + capsule $150 + rail pass $80 + food $90 ≈ $630. Close, needs trimming.",
    },
  ],
};

const REFLEXION_LOOP = [
  {
    label: "Attempt 1",
    content: "Flight $310, hotel $280 (mid-range), food $150. Total: $740.",
    color: RED,
  },
  {
    label: "Critique",
    content: "Evaluator: \"Total $740 exceeds the $600 budget by $140. The hotel choice is the main overage — should swap for cheaper lodging.\"",
    color: PURPLE,
  },
  {
    label: "Attempt 2 (revised)",
    content: "Flight $310, hostel $120 (revised), food $150. Total: $580 — fits budget.",
    color: GRN,
  },
];

const PATTERN_META = {
  react: {
    description:
      "ReAct interleaves Thought → Action → Observation in a single linear thread. Each tool call grounds the next thought in a real result, so the plan builds incrementally and stays anchored to facts.",
    shape: "Linear chain — one thread, no backtracking",
    cost: "Low — proportional to number of steps",
    bestFor: "Tool-heavy, open-ended tasks where each step reveals new information",
  },
  tot: {
    description:
      "Tree of Thoughts generates multiple candidate plans up front, scores each with an evaluator, and prunes the weak branches — effectively searching the space of possible plans before committing.",
    shape: "Branching tree — explore then prune",
    cost: "High — O(branching factor × depth) LLM calls",
    bestFor: "Problems with discrete candidate solutions that can be scored independently, like this budget allocation",
  },
  reflexion: {
    description:
      "Self-Reflection generates a full attempt, critiques it against the goal, and revises — spanning multiple complete passes rather than incremental steps within one pass.",
    shape: "Generate → critique → revise loop across full attempts",
    cost: "Medium — multiple full generations, one critique each",
    bestFor: "Tasks with a clear pass/fail signal (here: does the total fit $600?) where a first draft is the fastest entry point",
  },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, color }) {
  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: color || DS.t3,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function ReActPanel({ revealedCount, onReveal }) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {REACT_TRACE.slice(0, revealedCount).map((step, i) => {
          const color = step.kind === "Thought" ? CYAN : step.kind === "Action" ? "#FBBF24" : GRN;
          return (
            <div
              key={i}
              style={{
                background: `${color}0F`,
                border: `1px solid ${color}40`,
                borderRadius: DS.radiusSm,
                padding: "9px 12px",
                fontSize: 12.5,
                color: DS.t2,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color, fontWeight: 700, fontFamily: "var(--ds-mono), monospace" }}>{step.kind}: </span>
              <span style={{ fontFamily: "var(--ds-mono), monospace" }}>{step.text}</span>
            </div>
          );
        })}
      </div>
      {revealedCount < REACT_TRACE.length ? (
        <button
          onClick={() => onReveal(Math.min(revealedCount + 1, REACT_TRACE.length))}
          style={{
            padding: "9px 18px",
            borderRadius: DS.radiusSm,
            border: "none",
            background: CYAN,
            color: "#020617",
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Step {revealedCount + 1} →
        </button>
      ) : (
        <div style={{ fontSize: 12, color: DS.t3, fontStyle: "italic" }}>
          Loop complete — a single thread reached the goal step by step, each thought grounded by the previous observation.
        </div>
      )}
    </div>
  );
}

function ToTPanel({ revealed, onReveal }) {
  return (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "9px 14px",
          background: "rgba(129,140,248,0.1)",
          border: `1px solid ${PURPLE}55`,
          borderRadius: DS.radiusSm,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12.5,
          color: PURPLE,
          marginBottom: 14,
        }}
      >
        {TOT_TREE.root}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        {TOT_TREE.branches.map((b) => {
          const isRevealed = revealed.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => onReveal(b.id)}
              style={{
                flex: "1 1 160px",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${isRevealed ? (b.pruned ? RED : GRN) : DS.border}`,
                background: isRevealed ? (b.pruned ? "rgba(248,113,113,0.08)" : "rgba(52,211,153,0.08)") : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "all 0.25s ease",
                opacity: isRevealed && b.pruned ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isRevealed ? (b.pruned ? RED : GRN) : DS.t2,
                  marginBottom: 4,
                  textDecoration: isRevealed && b.pruned ? "line-through" : "none",
                }}
              >
                {b.label}
              </div>
              <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>Score: {b.score}/10</div>
              {isRevealed && (
                <div style={{ fontSize: 11.5, color: DS.t2, lineHeight: 1.45, fontFamily: "var(--ds-mono), monospace" }}>
                  {b.detail}
                </div>
              )}
              {!isRevealed && <div style={{ fontSize: 11, color: DS.dim, fontStyle: "italic" }}>Click to evaluate this branch</div>}
            </button>
          );
        })}
      </div>
      {revealed.length === TOT_TREE.branches.length && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(52,211,153,0.08)",
            border: `1px solid rgba(52,211,153,0.3)`,
            borderRadius: DS.radiusSm,
            fontSize: 12.5,
            color: DS.t2,
          }}
        >
          <span style={{ color: GRN, fontWeight: 700 }}>Winning branch: Path A</span> (score 8/10) — Path B pruned for
          exceeding budget; Path C kept as a fallback but scored lower than A.
        </div>
      )}
    </div>
  );
}

function ReflexionPanel({ revealedCount, onReveal }) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {REFLEXION_LOOP.slice(0, revealedCount).map((step, i) => (
          <div
            key={i}
            style={{
              background: `${step.color}0F`,
              border: `1px solid ${step.color}45`,
              borderRadius: DS.radiusSm,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
              {step.label}
            </div>
            <div style={{ fontSize: 12.5, color: DS.t2, lineHeight: 1.5, fontFamily: "var(--ds-mono), monospace" }}>{step.content}</div>
          </div>
        ))}
      </div>
      {revealedCount < REFLEXION_LOOP.length ? (
        <button
          onClick={() => onReveal(Math.min(revealedCount + 1, REFLEXION_LOOP.length))}
          style={{
            padding: "9px 18px",
            borderRadius: DS.radiusSm,
            border: "none",
            background: GRN,
            color: "#020617",
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {revealedCount === 0 ? "Generate Attempt 1 →" : revealedCount === 1 ? "Critique →" : "Revise →"}
        </button>
      ) : (
        <div style={{ fontSize: 12, color: DS.t3, fontStyle: "italic" }}>
          Loop complete — notice this spans two full attempts, not incremental steps within one attempt like ReAct.
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ReasoningLoopsViz() {
  const [pattern, setPattern] = useState("react");
  const [reactRevealed, setReactRevealed] = useState(0);
  const [totRevealed, setTotRevealed] = useState([]);
  const [reflexionRevealed, setReflexionRevealed] = useState(0);

  function changePattern(id) {
    setPattern(id);
    setReactRevealed(0);
    setTotRevealed([]);
    setReflexionRevealed(0);
  }

  function toggleTotBranch(id) {
    setTotRevealed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  const meta = PATTERN_META[pattern];
  const activePattern = PATTERNS.find((p) => p.id === pattern);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DS.t1, letterSpacing: "-0.3px" }}>
          Reasoning Loop Patterns
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Same problem, three different ways an agent can reason its way to a solution.
        </p>
      </div>

      {/* Fixed problem */}
      <div
        style={{
          background: CYAN_DIM,
          border: `1px solid ${CYAN_BORDER}`,
          borderRadius: DS.radiusMd,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: DS.t2,
        }}
      >
        <span style={{ color: CYAN, fontWeight: 600 }}>Problem: </span>
        {PROBLEM}
      </div>

      {/* Pattern tabs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
        {PATTERNS.map((p) => {
          const active = p.id === pattern;
          return (
            <button
              key={p.id}
              onClick={() => changePattern(p.id)}
              style={{
                padding: "9px 16px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? p.color : DS.border}`,
                background: active ? `${p.color}22` : "rgba(255,255,255,0.02)",
                color: active ? p.color : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13.5,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Shape / description */}
      <div
        style={{
          background: `${activePattern.color}14`,
          border: `1px solid ${activePattern.color}44`,
          borderRadius: DS.radiusMd,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: DS.t2,
          lineHeight: 1.5,
        }}
      >
        {meta.description}
      </div>

      {/* Animated trace panel */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusLg,
          padding: "16px 18px",
          marginBottom: 16,
        }}
      >
        <SectionLabel color={activePattern.color}>Live Trace</SectionLabel>
        {pattern === "react" && <ReActPanel revealedCount={reactRevealed} onReveal={setReactRevealed} />}
        {pattern === "tot" && <ToTPanel revealed={totRevealed} onReveal={toggleTotBranch} />}
        {pattern === "reflexion" && <ReflexionPanel revealedCount={reflexionRevealed} onReveal={setReflexionRevealed} />}
      </div>

      {/* Meta comparison */}
      <div className="ds-g3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Shape", value: meta.shape },
          { label: "Cost", value: meta.cost },
          { label: "Best for", value: meta.bestFor },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radiusMd,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                color: DS.t3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.45 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
