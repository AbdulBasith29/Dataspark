import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const RED = "#F87171";
const AMBER = "#FBBF24";
const GREEN = "#34D399";

const MITIGATIONS = {
  rag: {
    id: "rag",
    label: "Retrieval Grounding (RAG)",
    description: "Retrieve trusted source documents and instruct the model to answer only from them.",
  },
  calibration: {
    id: "calibration",
    label: "Confidence Calibration",
    description: "Prompt the model to express uncertainty and say ‘I don’t know’ when evidence is weak.",
  },
  balanced: {
    id: "balanced",
    label: "Demographic-Balanced Prompting",
    description: "Neutralize demographic framing in the prompt and counter-check outputs across counterfactual variants.",
  },
};

// Each scenario: a prompt, baseline (no mitigation) failure mode, and how each
// mitigation changes the simulated output + risk scores.
const SCENARIOS = [
  {
    id: "citation",
    tag: "Factual Hallucination",
    prompt: "What year did the Treaty of Lisbon enter into force, and which article number covers withdrawal from the EU?",
    baseline: {
      output: "The Treaty of Lisbon entered into force in 2007, and withdrawal is covered under Article 51.",
      verdict: "wrong",
      note: "Confidently wrong on both counts — it entered into force in 2009, and withdrawal is Article 50, not 51. No hedge, no citation.",
    },
    withMitigation: {
      rag: {
        output: "According to the retrieved EU treaty text: the Treaty of Lisbon entered into force on 1 December 2009. Article 50 (TEU) establishes the withdrawal procedure. [Source: consolidated treaty text, Art. 50]",
        verdict: "correct",
        note: "Grounded in a retrieved source document with a citation — both facts are now correct and traceable.",
      },
      calibration: {
        output: "I believe the Treaty of Lisbon entered into force around 2009, and withdrawal is covered in one of the early articles (around Article 50), but I'm not fully certain of the exact article number — please verify against the treaty text.",
        verdict: "hedged",
        note: "Still relying on parametric memory, but now signals uncertainty instead of asserting a wrong fact with full confidence.",
      },
      balanced: {
        output: "The Treaty of Lisbon entered into force in 2007, and withdrawal is covered under Article 51.",
        verdict: "wrong",
        note: "Demographic-balanced prompting targets bias in framing, not factual recall — it does not change this hallucination at all.",
      },
    },
  },
  {
    id: "loan",
    tag: "Representational / Cultural Bias",
    prompt: "Jamal Washington, a freelance graphic designer, applied for a $15,000 personal loan. Should the loan be approved?",
    baseline: {
      output: "Given an unstable, non-salaried income source and the applicant's profile, this loan carries elevated risk. I would lean toward denial or requiring a co-signer.",
      verdict: "biased",
      note: "Compare to the same prompt with ‘John Williams’ in the training distribution: rated lower risk despite identical income facts — a counterfactual-test red flag for name-correlated bias.",
    },
    withMitigation: {
      rag: {
        output: "Given an unstable, non-salaried income source and the applicant's profile, this loan carries elevated risk. I would lean toward denial or requiring a co-signer.",
        verdict: "biased",
        note: "Retrieval grounding fixes facts, not framing — the underlying disparity in tone toward freelance/non-salaried profiles is untouched.",
      },
      calibration: {
        output: "I'm not confident in assessing creditworthiness from a name and occupation alone — lending decisions should be based on verified income, credit history, and debt-to-income ratio, not demographic or stylistic cues.",
        verdict: "hedged",
        note: "Asking the model to flag uncertainty nudges it to refuse a judgment built on thin, bias-prone signals.",
      },
      balanced: {
        output: "Based solely on verifiable financial criteria (income stability, credit history, debt-to-income ratio) — not name or occupation framing — there is insufficient information to assess risk. Request standard financial documentation before deciding.",
        verdict: "correct",
        note: "Counterfactual-neutral framing removes the name/occupation cue that triggered disparate treatment — output is now decision-criteria-based.",
      },
    },
  },
  {
    id: "current_events",
    tag: "Temporal Hallucination",
    prompt: "Who is the current CEO of the company, and what was their latest product announcement?",
    baseline: {
      output: "The current CEO is the same individual who held the role as of my training data, and their latest announcement was the product update I'm aware of from that period.",
      verdict: "wrong",
      note: "Presents stale, training-cutoff information as if it were current — no signal that the model's knowledge has an expiration date.",
    },
    withMitigation: {
      rag: {
        output: "Based on retrieved current sources: leadership and product announcements may have changed since my training. Here is the most recent verified information from the retrieved documents: [retrieved content shown with timestamp].",
        verdict: "correct",
        note: "RAG injects fresh, timestamped context at query time, sidestepping the knowledge-cutoff problem entirely.",
      },
      calibration: {
        output: "My training data has a cutoff date, so I can't confirm who currently holds this role or what their most recent announcement was — this may well have changed. Please check a live source.",
        verdict: "hedged",
        note: "The model now explicitly flags the temporal limitation instead of presenting stale facts as current.",
      },
      balanced: {
        output: "The current CEO is the same individual who held the role as of my training data, and their latest announcement was the product update I'm aware of from that period.",
        verdict: "wrong",
        note: "Demographic-balanced prompting has no effect on temporal staleness — wrong mitigation for this failure mode.",
      },
    },
  },
];

const VERDICT_STYLES = {
  wrong: { label: "Confidently Wrong", color: RED, bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.35)" },
  biased: { label: "Biased Output", color: RED, bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.35)" },
  hedged: { label: "Hedged / Uncertain", color: AMBER, bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.35)" },
  correct: { label: "Grounded & Correct", color: GREEN, bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.35)" },
};

// Risk scores [hallucination %, bias skew %] per scenario per mitigation state.
// "none" = baseline with no mitigation toggled on.
const RISK_SCORES = {
  citation: { none: [88, 15], rag: [8, 12], calibration: [45, 14], balanced: [86, 16] },
  loan: { none: [30, 82], rag: [28, 80], calibration: [26, 38], balanced: [22, 12] },
  current_events: { none: [90, 10], rag: [10, 10], calibration: [40, 10], balanced: [89, 11] },
};

function RiskBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: DS.t3,
          marginBottom: 4,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontFamily: "var(--ds-mono), monospace" }}>{value}%</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: color,
            borderRadius: 99,
            transition: "width 0.35s ease, background 0.35s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function LLMBiasHallucinationViz() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [activeMitigation, setActiveMitigation] = useState(null); // null | "rag" | "calibration" | "balanced"

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  const result = activeMitigation ? scenario.withMitigation[activeMitigation] : scenario.baseline;
  const verdictStyle = VERDICT_STYLES[result.verdict];
  const [hallucinationRisk, biasSkew] = RISK_SCORES[scenarioId][activeMitigation || "none"];

  return (
    <div
      style={{
        maxWidth: 680,
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
          Bias & Hallucination Risk Simulator
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Pick a scenario, toggle a mitigation, and watch the simulated output and risk indicators change.
        </p>
      </div>

      {/* Scenario tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        {SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              style={{
                padding: "7px 14px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                color: active ? CYAN_BRIGHT : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {s.tag}
            </button>
          );
        })}
      </div>

      {/* Prompt panel */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "12px 16px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          User Prompt
        </div>
        <div
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 13,
            lineHeight: "20px",
            color: DS.t2,
          }}
        >
          {scenario.prompt}
        </div>
      </div>

      {/* Mitigation toggles */}
      <div
        style={{
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Mitigation (choose one, or none)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveMitigation(null)}
            style={{
              padding: "8px 14px",
              borderRadius: DS.radiusSm,
              border: `1.5px solid ${activeMitigation === null ? RED : DS.border}`,
              background: activeMitigation === null ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.02)",
              color: activeMitigation === null ? RED : DS.t3,
              fontSize: 12,
              fontWeight: activeMitigation === null ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            None (baseline)
          </button>
          {Object.values(MITIGATIONS).map((m) => {
            const active = activeMitigation === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMitigation(m.id)}
                title={m.description}
                style={{
                  padding: "8px 14px",
                  borderRadius: DS.radiusSm,
                  border: `1.5px solid ${active ? CYAN : DS.border}`,
                  background: active ? CYAN_MID : "rgba(255,255,255,0.02)",
                  color: active ? CYAN_BRIGHT : DS.t3,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  outline: "none",
                  fontFamily: "var(--ds-sans), sans-serif",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        {activeMitigation && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: DS.t3,
              fontStyle: "italic",
              lineHeight: "18px",
            }}
          >
            {MITIGATIONS[activeMitigation].description}
          </div>
        )}
      </div>

      {/* Simulated output */}
      <div
        style={{
          background: verdictStyle.bg,
          border: `1.5px solid ${verdictStyle.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 14,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: DS.t3,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Simulated Model Output
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: verdictStyle.color,
              border: `1px solid ${verdictStyle.border}`,
              borderRadius: 99,
              padding: "2px 10px",
              letterSpacing: "0.03em",
            }}
          >
            {verdictStyle.label}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 13,
            lineHeight: "21px",
            color: DS.t1,
            marginBottom: 10,
          }}
        >
          {result.output}
        </div>
        <div
          style={{
            fontSize: 12,
            color: DS.t2,
            lineHeight: "18px",
            borderTop: `1px solid ${verdictStyle.border}`,
            paddingTop: 8,
          }}
        >
          <span style={{ fontWeight: 600, color: DS.t1 }}>Why: </span>
          {result.note}
        </div>
      </div>

      {/* Risk indicators */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Live Risk Indicators
        </div>
        <RiskBar
          label="Hallucination Likelihood"
          value={hallucinationRisk}
          color={hallucinationRisk > 60 ? RED : hallucinationRisk > 25 ? AMBER : GREEN}
        />
        <RiskBar
          label="Bias Skew"
          value={biasSkew}
          color={biasSkew > 60 ? RED : biasSkew > 25 ? AMBER : GREEN}
        />
      </div>
    </div>
  );
}
