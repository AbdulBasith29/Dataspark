import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6";
const AMBER = "#F59E0B";
const GREEN = "#34D399";

const X_MIN = -4;
const X_MAX = 4;
const CURVE_BARS = 60;
const BAR_STEP = (X_MAX - X_MIN) / CURVE_BARS;

function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCdf(z) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function computePValue(z, twoSided) {
  const tailP = 1 - normalCdf(Math.abs(z));
  return twoSided ? 2 * tailP : tailP;
}

const MAX_PDF = normalPdf(0); // ~0.3989

const BAR_DATA = Array.from({ length: CURVE_BARS }, (_, i) => {
  const xLeft = X_MIN + i * BAR_STEP;
  const xMid = xLeft + BAR_STEP / 2;
  return { xLeft, xMid, pdf: normalPdf(xMid) };
});

const MISCONCEPTIONS = [
  {
    myth: "p = 0.03 means there's a 97% chance the effect is real.",
    truth:
      "The p-value is computed assuming H₀ is true. It cannot tell you the probability that H₀ is false. That requires a prior probability (Bayesian reasoning). This error is called probability inversion.",
    tag: "Probability inversion",
  },
  {
    myth: "A smaller p-value means a larger or more important effect.",
    truth:
      "P-values conflate effect size with sample size. A tiny, irrelevant effect in a huge study can produce p < 0.0001. Always report effect sizes (Cohen's d, odds ratio, η²) alongside p-values.",
    tag: "Effect size confusion",
  },
  {
    myth: "p > 0.05 proves there is no effect.",
    truth:
      "Failing to reject H₀ means the data are consistent with H₀ — not that H₀ is true. The study may simply be underpowered. Absence of evidence is not evidence of absence.",
    tag: "Null = no effect fallacy",
  },
  {
    myth: "p = 0.049 is meaningfully different from p = 0.051.",
    truth:
      "The 0.05 threshold is a convention, not a physical law. Results near the boundary carry nearly identical information. Treat p-values as continuous evidence, not binary switches.",
    tag: "Bright-line thinking",
  },
];

const DOES_CARDS = [
  {
    label: "DOES mean",
    color: GREEN,
    bg: "rgba(52,211,153,0.08)",
    borderColor: "rgba(52,211,153,0.3)",
    items: [
      "P(data this extreme or more extreme | H₀ is true)",
      "A measure of how surprising the data would be if H₀ were true",
      "One input among several when deciding whether to reject H₀",
    ],
  },
  {
    label: "DOES NOT mean",
    color: AMBER,
    bg: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.3)",
    items: [
      "P(H₀ is true) — probability inversion requires a prior",
      "The probability the result will replicate exactly",
      "The size or practical importance of the effect",
      "The probability of making an error in this specific decision",
    ],
  },
];

// --- Component ---

export default function StatPValueViz() {
  const [zScore, setZScore] = useState(1.96);
  const [twoSided, setTwoSided] = useState(true);
  const [activeMisconception, setActiveMisconception] = useState(null);

  const pValue = computePValue(zScore, twoSided);
  const significant = pValue < 0.05;
  const zAbs = Math.abs(zScore);

  const isTailBar = (bar) => {
    if (twoSided) return bar.xMid < -zAbs || bar.xMid > zAbs;
    return bar.xMid > zAbs;
  };

  const zPct = ((zScore - X_MIN) / (X_MAX - X_MIN)) * 100;

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        P-Value Interpreter
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        Drag the slider to set the observed z-score. The shaded tail(s) show the
        area used to compute the p-value — the probability of data this extreme
        or more extreme under H₀.
      </p>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            flex: 1,
            minWidth: 200,
            fontSize: 11,
            color: DS.t3,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          Observed z-score = {zScore.toFixed(2)}
          <input
            type="range"
            min={-4}
            max={4}
            step={0.05}
            value={zScore}
            onChange={(e) => setZScore(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: ACCENT, display: "block" }}
          />
        </label>
        <button
          type="button"
          onClick={() => setTwoSided((v) => !v)}
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            border: `1px solid ${twoSided ? ACCENT : DS.border}`,
            background: twoSided ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
            color: twoSided ? ACCENT : DS.t3,
            fontSize: 11,
            fontFamily: "var(--ds-mono), monospace",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
        >
          {twoSided ? "Two-sided ↔" : "One-sided →"}
        </button>
      </div>

      {/* Distribution curve using div bars */}
      <div
        style={{
          position: "relative",
          height: 130,
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          marginBottom: 8,
        }}
      >
        {/* Bars */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            paddingBottom: 22,
            paddingTop: 8,
          }}
        >
          {BAR_DATA.map((bar, i) => {
            const heightPct = (bar.pdf / MAX_PDF) * 100;
            const inTail = isTailBar(bar);
            const barColor = inTail
              ? significant
                ? "rgba(52,211,153,0.55)"
                : "rgba(245,158,11,0.55)"
              : "rgba(129,140,248,0.28)";
            return (
              <div
                key={i}
                title={`x≈${bar.xMid.toFixed(2)}, pdf=${bar.pdf.toFixed(3)}`}
                style={{
                  flex: 1,
                  height: `${heightPct}%`,
                  background: barColor,
                  transition: "background 0.25s",
                }}
              />
            );
          })}
        </div>

        {/* Z marker line */}
        <div
          style={{
            position: "absolute",
            top: 6,
            bottom: 22,
            left: `${zPct}%`,
            width: 2,
            background: significant ? GREEN : AMBER,
            borderRadius: 2,
            transition: "left 0.05s linear, background 0.25s",
          }}
        />

        {/* Axis tick labels */}
        <div style={{ position: "absolute", bottom: 4, left: 6, fontSize: 9, fontFamily: "var(--ds-mono), monospace", color: DS.dim }}>−4</div>
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontFamily: "var(--ds-mono), monospace", color: DS.dim }}>0</div>
        <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: 9, fontFamily: "var(--ds-mono), monospace", color: DS.dim }}>+4</div>

        {/* Z value label near marker */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: `${Math.max(5, Math.min(75, zPct - 5))}%`,
            fontSize: 9,
            fontFamily: "var(--ds-mono), monospace",
            color: significant ? GREEN : AMBER,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          z={zScore.toFixed(2)}
        </div>
      </div>

      {/* P-value result row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div
          style={{
            flex: "0 0 auto",
            background: significant ? "rgba(52,211,153,0.08)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${significant ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
            minWidth: 120,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "var(--ds-mono), monospace",
              color: significant ? GREEN : AMBER,
            }}
          >
            {pValue < 0.0001 ? "< 0.0001" : pValue.toFixed(4)}
          </div>
          <div style={{ fontSize: 10, color: DS.t3, marginTop: 2 }}>
            p-value ({twoSided ? "two-sided" : "one-sided"})
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 160,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${DS.border}`,
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontFamily: "var(--ds-mono), monospace",
              color: significant ? GREEN : AMBER,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {significant ? "p < 0.05 → Reject H₀" : "p ≥ 0.05 → Fail to reject H₀"}
          </div>
          <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.55 }}>
            {significant
              ? "Data this extreme would occur less than 5% of the time under H₀. This is evidence against H₀ — not proof the effect is real or large."
              : "Data this extreme is not unusual if H₀ were true. We lack sufficient evidence to reject H₀ — but H₀ may still be false (low power)."}
          </div>
        </div>
      </div>

      {/* DOES / DOES NOT cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {DOES_CARDS.map((card) => (
          <div
            key={card.label}
            style={{
              background: card.bg,
              border: `1px solid ${card.borderColor}`,
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: card.color,
                fontFamily: "var(--ds-mono), monospace",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              A p-value {card.label}:
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {card.items.map((item, i) => (
                <li
                  key={i}
                  style={{ fontSize: 11, color: DS.t2, lineHeight: 1.6, marginBottom: 4 }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Misconceptions accordion */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: DS.t2,
          marginBottom: 8,
        }}
      >
        Common misconceptions — tap to reveal the correction
      </div>
      <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
        {MISCONCEPTIONS.map((m, i) => {
          const isOpen = activeMisconception === i;
          return (
            <div
              key={i}
              style={{
                background: isOpen ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isOpen ? "rgba(139,92,246,0.3)" : DS.border}`,
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onClick={() => setActiveMisconception(isOpen ? null : i)}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "10px 14px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 9,
                    padding: "2px 6px",
                    borderRadius: 5,
                    background: "rgba(245,158,11,0.15)",
                    color: AMBER,
                    fontFamily: "var(--ds-mono), monospace",
                    whiteSpace: "nowrap",
                    marginTop: 1,
                  }}
                >
                  MYTH
                </span>
                <span style={{ fontSize: 12, color: DS.t2, flex: 1, lineHeight: 1.5 }}>
                  {m.myth}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 12,
                    color: DS.dim,
                    marginTop: 1,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    display: "inline-block",
                  }}
                >
                  ▾
                </span>
              </div>
              {isOpen && (
                <div
                  style={{
                    padding: "0 14px 12px 14px",
                    borderTop: `1px solid ${DS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: ACCENT,
                      fontFamily: "var(--ds-mono), monospace",
                      margin: "8px 0 4px",
                    }}
                  >
                    [{m.tag}] — Correction:
                  </div>
                  <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.6 }}>
                    {m.truth}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 11,
          color: DS.dim,
          lineHeight: 1.6,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        Interview tip: When asked "what does a p-value mean?", the senior answer
        names the conditional explicitly — P(data | H₀) — then immediately flags
        the Bayesian inversion error (P(H₀ | data) requires a prior). That
        distinction is the most frequently probed conceptual gap.
      </p>
    </div>
  );
}
