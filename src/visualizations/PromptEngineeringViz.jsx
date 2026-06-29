import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component — TDZ safety) ─────────────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";
const CYAN_BORDER = "rgba(6,182,212,0.4)";
const GRN = "#34D399";
const RED = "#F87171";
const ORG = "#F59E0B";
const PANEL_BG = "rgba(2,6,23,0.72)";

const TASK_LABEL =
  "A store has 120 apples. They sell 35% on Monday and 40% of the remainder on Tuesday. How many apples remain?";

const TECHNIQUES = [
  { id: "zero", label: "Zero-Shot", quality: 1 },
  { id: "few", label: "Few-Shot", quality: 3 },
  { id: "cot", label: "Chain-of-Thought", quality: 4 },
  { id: "system", label: "System + Role Prompting", quality: 5 },
];

const TECHNIQUE_DETAIL = {
  zero: {
    title: "Zero-Shot",
    summary: "Ask the model to perform the task directly — no examples, no structure.",
    prompt: `A store has 120 apples. They sell 35% on Monday and 40% of the
remainder on Tuesday. How many apples remain?`,
    output: `Around 50 apples remain after the two days of sales.`,
    outputQuality: "wrong",
    outputNote:
      "Wrong and unverifiable. The model guesses an approximate-sounding number with no shown work — 120 × 0.65 × 0.60 = 46.8, not 50. There is no reasoning trail to catch the arithmetic error.",
    pros: ["Fastest to write", "No token overhead", "Fine for tasks the model already does well"],
    cons: ["No worked logic — silent arithmetic slips", "Output format is unpredictable", "No guardrails against confident wrong answers"],
  },
  few: {
    title: "Few-Shot",
    summary: "Provide 1–2 worked examples so the model infers the expected pattern and format.",
    prompt: `Q: A school has 80 pencils. They give away 25% on day one and
50% of what's left on day two. How many pencils remain?
A: After day 1: 80 × (1 - 0.25) = 60
   After day 2: 60 × (1 - 0.50) = 30
   Answer: 30 pencils

Q: A store has 120 apples. They sell 35% on Monday and 40% of the
remainder on Tuesday. How many apples remain?
A:`,
    output: `After Monday: 120 × (1 - 0.35) = 78
After Tuesday: 78 × (1 - 0.40) = 46.8
Answer: 46 apples (rounding down to whole apples)`,
    outputQuality: "good",
    outputNote:
      "Correct, and the format now matches the example exactly. The model copied the worked-step pattern from the example rather than inventing its own structure — that's few-shot's main value.",
    pros: ["Model infers output format from examples", "Reduces ambiguity about structure", "Cheap relative to fine-tuning"],
    cons: ["Burns context tokens per example", "Quality depends on example selection (BM25 / semantic)", "Doesn't guarantee correct arithmetic by itself"],
  },
  cot: {
    title: "Chain-of-Thought",
    summary: "Append \"Let's think step by step\" — the model externalizes intermediate reasoning before answering.",
    prompt: `A store has 120 apples. They sell 35% on Monday and 40% of the
remainder on Tuesday. How many apples remain?

Let's think step by step.`,
    output: `Let's think step by step.
1. Apples sold Monday: 120 × 0.35 = 42
2. Remaining after Monday: 120 - 42 = 78
3. Apples sold Tuesday: 78 × 0.40 = 31.2
4. Remaining after Tuesday: 78 - 31.2 = 46.8 ≈ 46 apples

Answer: 46 apples`,
    outputQuality: "good",
    outputNote:
      "Correct, and now self-checkable — every intermediate value is visible, so a reviewer (or a self-consistency vote) can catch an error at the exact step it occurs, not just in the final number.",
    pros: ["Externalizes working memory — fewer silent arithmetic errors", "Each step is an error checkpoint", "No examples needed (zero-shot CoT)"],
    cons: ["More output tokens → latency + cost", "Unreliable on small models (<~7B)", "Unnecessary overhead for simple factual lookups"],
  },
  system: {
    title: "System + Role Prompting",
    summary: "Wrap the task in a persona, explicit output contract, and constraints — production-grade structure.",
    prompt: `<role>You are a meticulous quantitative analyst who never skips
arithmetic steps and never rounds until the final answer.</role>
<task>Solve the word problem below. Show each calculation explicitly.</task>
<output_format>
Return JSON: { "steps": [string], "final_answer": number }
Do not wrap the JSON in markdown fences.
</output_format>
<constraints>
- Round only the final_answer, to the nearest whole apple.
- If any quantity is ambiguous, state the assumption inside "steps".
</constraints>
<problem>
A store has 120 apples. They sell 35% on Monday and 40% of the
remainder on Tuesday. How many apples remain?
</problem>`,
    output: `{
  "steps": [
    "Apples sold Monday: 120 * 0.35 = 42",
    "Remaining after Monday: 120 - 42 = 78",
    "Apples sold Tuesday: 78 * 0.40 = 31.2",
    "Remaining after Tuesday: 78 - 31.2 = 46.8"
  ],
  "final_answer": 47
}`,
    outputQuality: "best",
    outputNote:
      "Correct AND machine-parseable. The persona ('never skips steps') reinforces CoT-style reasoning, while the output_format contract guarantees the response is valid JSON every single call — no markdown fences, no prose drift, no inconsistent rounding. This is the only technique safe to wire directly into a downstream pipeline.",
    pros: ["Deterministic, parseable output across every call", "Persona + constraints jointly shape both reasoning and format", "Production-ready — composes with tool use & pipelines"],
    cons: ["Most upfront design effort", "Longer system prompt = more fixed token cost per call", "Overkill for a one-off casual question"],
  },
};

const QUALITY_COPY = {
  wrong: { label: "INCORRECT", color: RED },
  good: { label: "CORRECT", color: GRN },
  best: { label: "CORRECT + STRUCTURED", color: CYAN },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function QualityMeter({ quality }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: 6,
            borderRadius: 3,
            background: i < quality ? CYAN : "rgba(255,255,255,0.08)",
            transition: "background 0.25s ease",
          }}
        />
      ))}
    </div>
  );
}

function CodeBlock({ children, borderColor }) {
  return (
    <pre
      style={{
        margin: 0,
        background: PANEL_BG,
        border: `1px solid ${borderColor || DS.border}`,
        borderRadius: DS.radiusMd,
        padding: "14px 16px",
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12.5,
        lineHeight: "20px",
        color: DS.t2,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowX: "auto",
      }}
    >
      {children}
    </pre>
  );
}

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

// ── Main Component ───────────────────────────────────────────────────────────

export default function PromptEngineeringViz() {
  const [selected, setSelected] = useState("zero");
  const [showOutput, setShowOutput] = useState(false);
  const detail = TECHNIQUE_DETAIL[selected];
  const qc = QUALITY_COPY[detail.outputQuality];

  function selectTechnique(id) {
    setSelected(id);
    setShowOutput(false);
  }

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
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DS.t1, letterSpacing: "-0.3px" }}>
          Prompt Engineering Technique Comparison
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Same task, four techniques — watch output quality and reliability change.
        </p>
      </div>

      {/* Fixed task panel */}
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
        <span style={{ color: CYAN, fontWeight: 600 }}>Fixed task: </span>
        {TASK_LABEL}
      </div>

      {/* Technique tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 18 }}>
        {TECHNIQUES.map((t) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              onClick={() => selectTechnique(t.id)}
              style={{
                padding: "8px 14px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_MID : "rgba(255,255,255,0.02)",
                color: active ? CYAN : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
              <span>{t.label}</span>
              <QualityMeter quality={t.quality} />
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          color: DS.t2,
          marginBottom: 14,
          textAlign: "center",
          padding: "0 8px",
          lineHeight: 1.5,
        }}
      >
        {detail.summary}
      </div>

      {/* Prompt panel */}
      <SectionLabel color={CYAN}>Generated Prompt</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        <CodeBlock>{detail.prompt}</CodeBlock>
      </div>

      {/* Reveal output button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <button
          onClick={() => setShowOutput((v) => !v)}
          style={{
            padding: "9px 20px",
            borderRadius: DS.radiusSm,
            border: "none",
            background: showOutput ? "rgba(6,182,212,0.18)" : CYAN,
            color: showOutput ? CYAN : "#020617",
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
            letterSpacing: "0.02em",
          }}
        >
          {showOutput ? "Hide Model Output" : "Run Prompt — Show Model Output"}
        </button>
      </div>

      {/* Output panel */}
      {showOutput && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <SectionLabel color={qc.color}>Simulated Model Output</SectionLabel>
            <span
              style={{
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                fontWeight: 700,
                color: qc.color,
                background: `${qc.color}1A`,
                border: `1px solid ${qc.color}55`,
                borderRadius: 6,
                padding: "2px 9px",
                letterSpacing: "0.04em",
              }}
            >
              {qc.label}
            </span>
          </div>
          <CodeBlock borderColor={`${qc.color}55`}>{detail.output}</CodeBlock>
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: `${qc.color}0F`,
              border: `1px solid ${qc.color}40`,
              borderRadius: DS.radiusMd,
              fontSize: 12.5,
              color: DS.t2,
              lineHeight: 1.55,
            }}
          >
            {detail.outputNote}
          </div>
        </div>
      )}

      {/* Pros / Cons */}
      <div
        className="ds-g2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
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
              color: GRN,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            Pros
          </div>
          {detail.pros.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                marginBottom: 5,
                fontSize: 12.5,
                color: DS.t2,
                lineHeight: "18px",
              }}
            >
              <span style={{ color: GRN, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
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
              color: RED,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            Cons
          </div>
          {detail.cons.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                marginBottom: 5,
                fontSize: 12.5,
                color: DS.t2,
                lineHeight: "18px",
              }}
            >
              <span style={{ color: RED, flexShrink: 0, marginTop: 1 }}>✗</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note for temperature relevance */}
      <div
        style={{
          marginTop: 14,
          fontSize: 11.5,
          color: DS.dim,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        Tip: notice how quality climbs left → right as structure is added — but so does prompt design effort and token cost.
      </div>
    </div>
  );
}
