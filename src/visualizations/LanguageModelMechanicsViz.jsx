import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const SAMPLING_STRATEGIES = {
  greedy: {
    id: "greedy",
    label: "Greedy",
    description: "Always pick the single highest-probability token. Deterministic, but repetitive.",
  },
  temperature: {
    id: "temperature",
    label: "Temperature",
    description: "Reshape the distribution with τ before sampling. Higher τ flattens it — more variety, more risk.",
  },
  topk: {
    id: "topk",
    label: "Top-K",
    description: "Zero out everything except the K most probable tokens, then sample from what's left.",
  },
};

// Each prompt step: the running prompt text + a candidate distribution over next tokens.
// Probabilities are illustrative "logits already softmaxed at temperature=1" base distribution.
const SEQUENCE = [
  {
    promptSuffix: "",
    candidates: [
      { token: "Paris", p: 0.62 },
      { token: "located", p: 0.14 },
      { token: "a", p: 0.09 },
      { token: "known", p: 0.08 },
      { token: "Lyon", p: 0.04 },
      { token: "famous", p: 0.03 },
    ],
  },
  {
    promptSuffix: " Paris",
    candidates: [
      { token: ",", p: 0.41 },
      { token: ".", p: 0.27 },
      { token: "is", p: 0.16 },
      { token: "—", p: 0.09 },
      { token: "and", p: 0.05 },
      { token: "France", p: 0.02 },
    ],
  },
  {
    promptSuffix: " Paris,",
    candidates: [
      { token: "a", p: 0.38 },
      { token: "often", p: 0.22 },
      { token: "the", p: 0.18 },
      { token: "known", p: 0.12 },
      { token: "which", p: 0.07 },
      { token: "famously", p: 0.03 },
    ],
  },
  {
    promptSuffix: " Paris, often",
    candidates: [
      { token: "called", p: 0.55 },
      { token: "described", p: 0.18 },
      { token: "known", p: 0.14 },
      { token: "considered", p: 0.07 },
      { token: "regarded", p: 0.04 },
      { token: "nicknamed", p: 0.02 },
    ],
  },
  {
    promptSuffix: " Paris, often called",
    candidates: [
      { token: "the", p: 0.71 },
      { token: "“the", p: 0.11 },
      { token: "a", p: 0.09 },
      { token: "City", p: 0.05 },
      { token: "France's", p: 0.03 },
      { token: "Europe's", p: 0.01 },
    ],
  },
];

const BASE_PROMPT = "The capital of France is";

function softmaxWithTemperature(candidates, temperature) {
  // Recompute relative weighting under a temperature by treating the given
  // probabilities as proportional to exp(logit), so logit ~ ln(p).
  const logits = candidates.map((c) => Math.log(Math.max(c.p, 1e-6)));
  const scaled = logits.map((l) => l / Math.max(temperature, 0.05));
  const m = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - m));
  const z = exps.reduce((a, b) => a + b, 0) || 1;
  return candidates.map((c, i) => ({ ...c, p: exps[i] / z }));
}

function applyTopK(candidates, k) {
  const sorted = [...candidates].sort((a, b) => b.p - a.p);
  const kept = sorted.slice(0, k);
  const z = kept.reduce((a, c) => a + c.p, 0) || 1;
  const renormalized = kept.map((c) => ({ ...c, p: c.p / z }));
  const keptTokens = new Set(kept.map((c) => c.token));
  return candidates.map((c) =>
    keptTokens.has(c.token)
      ? renormalized.find((r) => r.token === c.token)
      : { ...c, p: 0 }
  );
}

function pickToken(distribution, strategy) {
  if (strategy === "greedy") {
    return distribution.reduce((best, c) => (c.p > best.p ? c : best), distribution[0]);
  }
  // Sample proportionally to p (deterministic "expected" pick: highest weighted random draw
  // is approximated here by a stable pseudo-random seed per step for reproducibility).
  let r = 0.42; // fixed draw point so the demo is reproducible and inspectable
  let acc = 0;
  for (const c of distribution) {
    acc += c.p;
    if (r <= acc && c.p > 0) return c;
  }
  return distribution.filter((c) => c.p > 0).slice(-1)[0] || distribution[0];
}

function barColor(isChosen) {
  return isChosen ? CYAN_BRIGHT : "rgba(255,255,255,0.16)";
}

export default function LanguageModelMechanicsViz() {
  const [strategy, setStrategy] = useState("greedy");
  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState(3);
  const [step, setStep] = useState(0);
  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [history, setHistory] = useState([]);

  const stepData = SEQUENCE[step];

  const distribution = useMemo(() => {
    const base = stepData.candidates;
    if (strategy === "temperature") {
      return softmaxWithTemperature(base, temperature);
    }
    if (strategy === "topk") {
      return applyTopK(base, topK);
    }
    return base;
  }, [stepData, strategy, temperature, topK]);

  const sortedDist = useMemo(
    () => [...distribution].sort((a, b) => b.p - a.p),
    [distribution]
  );

  const chosen = useMemo(() => pickToken(distribution, strategy), [distribution, strategy]);

  const fullPromptSoFar = BASE_PROMPT + stepData.promptSuffix + generatedTokens.map((t) => " " + t).join("");

  function handleGenerateNext() {
    if (step >= SEQUENCE.length - 1) return;
    setGeneratedTokens((prev) => [...prev, chosen.token]);
    setHistory((prev) => [...prev, { step, token: chosen.token, p: chosen.p, strategy }]);
    setStep((s) => s + 1);
  }

  function handleReset() {
    setStep(0);
    setGeneratedTokens([]);
    setHistory([]);
  }

  const isDone = step >= SEQUENCE.length - 1 && history.length === SEQUENCE.length - 1 ? false : step >= SEQUENCE.length - 1;
  const canGenerate = step < SEQUENCE.length - 1;

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
          Next-Token Prediction Explorer
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Watch the model's probability distribution over the vocabulary, choose a sampling strategy, and build a sentence one token at a time.
        </p>
      </div>

      {/* Strategy Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        {Object.values(SAMPLING_STRATEGIES).map((s) => {
          const active = s.id === strategy;
          return (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
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
              {s.label}
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
        <span style={{ color: CYAN, fontWeight: 600 }}>{SAMPLING_STRATEGIES[strategy].label}: </span>
        {SAMPLING_STRATEGIES[strategy].description}
      </div>

      {/* Strategy-specific controls */}
      {strategy === "temperature" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            Temperature τ = {temperature.toFixed(2)}
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(+e.target.value)}
              style={{ width: "100%", marginTop: 6, accentColor: CYAN }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
            <span>0.1 — greedy-like</span>
            <span>1.0 — raw distribution</span>
            <span>2.0 — flattened</span>
          </div>
        </div>
      )}

      {strategy === "topk" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            K = {topK}
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={topK}
              onChange={(e) => setTopK(+e.target.value)}
              style={{ width: "100%", marginTop: 6, accentColor: CYAN }}
            />
          </label>
          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
            Only the top {topK} token{topK > 1 ? "s" : ""} remain eligible; probabilities are renormalized over that set.
          </div>
        </div>
      )}

      {/* Prompt panel */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 16,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 13,
          lineHeight: "22px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 8,
            fontFamily: "var(--ds-sans), sans-serif",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Running Sequence (step {step + 1} of {SEQUENCE.length})
        </div>
        <div style={{ color: DS.t1 }}>
          {BASE_PROMPT}
          {generatedTokens.map((t, i) => (
            <span key={i} style={{ color: CYAN_BRIGHT, fontWeight: 600 }}>
              {" " + t}
            </span>
          ))}
          <span style={{ color: DS.dim }}> █</span>
        </div>
      </div>

      {/* Probability distribution bar chart */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 16,
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
          P(next token | context) — candidate distribution
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {sortedDist.map((c) => {
            const isChosen = chosen && c.token === chosen.token;
            const pct = Math.round(c.p * 1000) / 10;
            return (
              <div key={c.token} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 78,
                    flexShrink: 0,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 12,
                    color: c.p === 0 ? DS.dim : isChosen ? CYAN_BRIGHT : DS.t2,
                    fontWeight: isChosen ? 700 : 400,
                    textAlign: "right",
                    textDecoration: c.p === 0 ? "line-through" : "none",
                  }}
                  title={c.token}
                >
                  {c.token}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 16,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(pct, 0)}%`,
                      background: barColor(isChosen),
                      borderRadius: 4,
                      transition: "width 0.25s ease, background 0.25s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 48,
                    flexShrink: 0,
                    fontSize: 11,
                    fontFamily: "var(--ds-mono), monospace",
                    color: isChosen ? CYAN_BRIGHT : DS.t3,
                    fontWeight: isChosen ? 700 : 400,
                  }}
                >
                  {pct.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* chosen token callout */}
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: CYAN_MID,
            border: `1px solid rgba(6,182,212,0.4)`,
            borderRadius: DS.radiusSm,
            fontSize: 12,
            color: DS.t1,
            fontFamily: "var(--ds-sans), sans-serif",
            textAlign: "center",
          }}
        >
          Sampled token: <strong style={{ color: CYAN_BRIGHT }}>"{chosen.token}"</strong>{" "}
          <span style={{ color: DS.t3 }}>
            ({strategy === "greedy" ? "argmax of distribution" : "drawn from reshaped distribution"})
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18 }}>
        <button
          onClick={handleGenerateNext}
          disabled={!canGenerate}
          style={{
            padding: "10px 18px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${canGenerate ? CYAN : DS.border}`,
            background: canGenerate ? CYAN_MID : "rgba(255,255,255,0.02)",
            color: canGenerate ? CYAN_BRIGHT : DS.dim,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: canGenerate ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
            outline: "none",
          }}
        >
          {canGenerate ? "Append token →" : "Sequence complete"}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "10px 18px",
            borderRadius: DS.radiusSm,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
            color: DS.t3,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            cursor: "pointer",
            outline: "none",
          }}
        >
          Reset
        </button>
      </div>

      {/* Generation history */}
      {history.length > 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd,
            padding: "12px 16px",
            marginBottom: 16,
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
            Generation Trace
          </div>
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                fontFamily: "var(--ds-mono), monospace",
                color: DS.t2,
                padding: "4px 0",
                borderTop: i === 0 ? "none" : `1px solid ${DS.border}`,
              }}
            >
              <span>
                step {h.step + 1} → <strong style={{ color: CYAN_BRIGHT }}>"{h.token}"</strong>
              </span>
              <span style={{ color: DS.t3 }}>
                p={Math.round(h.p * 1000) / 10}% · {SAMPLING_STRATEGIES[h.strategy].label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Explainer footer */}
      <div
        style={{
          fontSize: 12,
          color: DS.t3,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: DS.radiusMd,
          border: `1px solid ${DS.border}`,
          fontFamily: "var(--ds-sans), sans-serif",
          lineHeight: "18px",
        }}
      >
        Each step is one full forward pass over the growing sequence: the model outputs a logit for every
        vocabulary token, softmax converts logits to probabilities, then a sampling strategy decides which token
        becomes part of the context for the next pass. Try switching strategies mid-sequence — greedy always
        chooses "Paris" then "," then "a"... while a higher temperature can surface a less likely but still
        plausible continuation.
      </div>
    </div>
  );
}
