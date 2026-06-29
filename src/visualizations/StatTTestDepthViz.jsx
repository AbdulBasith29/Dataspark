import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6"; // purple
const BRIGHT = "#A78BFA"; // bright purple
const AMBER = "#F59E0B";
const GREEN = "#34D399";
const RED = "#F87171";

const PANEL_BG = "rgba(2,6,23,0.72)";
const CARD_BG = "rgba(255,255,255,0.02)";

const TEST_TYPES = [
  { id: "one", label: "One-sample", blurb: "Compare one group's mean to a known reference value." },
  { id: "ind", label: "Independent", blurb: "Compare the means of two separate, unrelated groups." },
  { id: "paired", label: "Paired", blurb: "Compare two measurements on the same subjects (before / after)." },
];

// Default scenario values (psychology-flavoured: test scores, anxiety scales, etc.)
const DEFAULTS = {
  one: { m1: 105, sd1: 15, n1: 30, ref: 100 },
  ind: { m1: 24, sd1: 6, n1: 28, m2: 20, sd2: 9, n2: 22 },
  paired: { m1: 48, sd1: 10, n1: 25, m2: 42, sdDiff: 8 },
};

// ── Tiny math helpers (approximations are fine per spec) ───────────────────

// Standard normal PDF
function normPdf(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Standard normal CDF via Abramowitz-Stegun approximation
function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  let p =
    d *
    t *
    (0.319381530 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  if (z > 0) p = 1 - p;
  return p;
}

// Two-tailed p-value. We approximate the t-distribution with the normal for
// large df, and apply a small inflation factor for small df so behaviour is
// directionally correct (heavier tails → larger p).
function approxTwoTailedP(t, df) {
  const absT = Math.abs(t);
  // Inflate the effective z slightly down for small df (heavier tails).
  const adj = absT / Math.sqrt(1 + (absT * absT) / Math.max(df, 1) / 2);
  const p = 2 * (1 - normCdf(adj));
  return Math.max(0, Math.min(1, p));
}

// Welch-Satterthwaite degrees of freedom
function welchDf(sd1, n1, sd2, n2) {
  const v1 = (sd1 * sd1) / n1;
  const v2 = (sd2 * sd2) / n2;
  const num = (v1 + v2) * (v1 + v2);
  const den = (v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1);
  return num / den;
}

function round(x, d = 2) {
  const f = Math.pow(10, d);
  return Math.round(x * f) / f;
}

const CRIT_95 = 1.96; // two-tailed critical z for the shaded rejection region

// ── Component ──────────────────────────────────────────────────────────────

export default function StatTTestDepthViz() {
  const [testType, setTestType] = useState("one");
  const [welch, setWelch] = useState(true); // independent: Welch vs Student
  const [vals, setVals] = useState(DEFAULTS);

  const v = vals[testType];

  const setVal = (key, delta, min, max) => {
    setVals((prev) => {
      const cur = prev[testType];
      let next = round((cur[key] ?? 0) + delta, 2);
      if (min != null) next = Math.max(min, next);
      if (max != null) next = Math.min(max, next);
      return { ...prev, [testType]: { ...cur, [key]: next } };
    });
  };

  // ── Compute statistics for the active test ──
  let t = 0;
  let df = 1;
  let dfLabel = "";
  let diffLabel = "";
  let formula = "";

  if (testType === "one") {
    const se = v.sd1 / Math.sqrt(v.n1);
    t = (v.m1 - v.ref) / se;
    df = v.n1 - 1;
    dfLabel = `n − 1 = ${v.n1} − 1`;
    diffLabel = `x̄ − μ₀ = ${round(v.m1 - v.ref)}`;
    formula = "t = (x̄ − μ₀) / (s / √n)";
  } else if (testType === "ind") {
    const v1 = (v.sd1 * v.sd1) / v.n1;
    const v2 = (v.sd2 * v.sd2) / v.n2;
    const se = Math.sqrt(v1 + v2);
    t = (v.m1 - v.m2) / se;
    if (welch) {
      df = welchDf(v.sd1, v.n1, v.sd2, v.n2);
      dfLabel = "Welch–Satterthwaite";
      formula = "t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)";
    } else {
      // Student's pooled
      const sp2 =
        ((v.n1 - 1) * v.sd1 * v.sd1 + (v.n2 - 1) * v.sd2 * v.sd2) /
        (v.n1 + v.n2 - 2);
      const sePooled = Math.sqrt(sp2 * (1 / v.n1 + 1 / v.n2));
      t = (v.m1 - v.m2) / sePooled;
      df = v.n1 + v.n2 - 2;
      dfLabel = `n₁ + n₂ − 2 = ${v.n1 + v.n2 - 2}`;
      formula = "t = (x̄₁ − x̄₂) / (s_pooled √(1/n₁ + 1/n₂))";
    }
    diffLabel = `x̄₁ − x̄₂ = ${round(v.m1 - v.m2)}`;
  } else {
    // paired: analyse the differences
    const meanDiff = v.m1 - v.m2;
    const se = v.sdDiff / Math.sqrt(v.n1);
    t = meanDiff / se;
    df = v.n1 - 1;
    dfLabel = `n_pairs − 1 = ${v.n1} − 1`;
    diffLabel = `d̄ = ${round(meanDiff)}`;
    formula = "t = d̄ / (s_d / √n)";
  }

  const p = approxTwoTailedP(t, df);
  const significant = p < 0.05;

  // ── SVG distribution drawing ──
  const W = 420;
  const H = 150;
  const PAD = 8;
  // x axis is in t-units; range -5..5
  const tMin = -5;
  const tMax = 5;
  const xToPx = (xt) => PAD + ((xt - tMin) / (tMax - tMin)) * (W - 2 * PAD);
  const tClamped = Math.max(tMin, Math.min(tMax, t));

  // Build the null t-distribution curve (centered at 0, sigma≈1)
  const curvePts = [];
  const peak = normPdf(0, 0, 1);
  for (let i = 0; i <= 120; i++) {
    const xt = tMin + (i / 120) * (tMax - tMin);
    const y = normPdf(xt, 0, 1) / peak; // normalised 0..1
    curvePts.push([xToPx(xt), H - PAD - y * (H - 2 * PAD - 18)]);
  }
  const curvePath = curvePts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ");

  // Rejection-region polygons (|t| > 1.96)
  function regionPath(fromT, toT) {
    const pts = [];
    const steps = 30;
    pts.push([xToPx(fromT), H - PAD]);
    for (let i = 0; i <= steps; i++) {
      const xt = fromT + (i / steps) * (toT - fromT);
      const y = normPdf(xt, 0, 1) / peak;
      pts.push([xToPx(xt), H - PAD - y * (H - 2 * PAD - 18)]);
    }
    pts.push([xToPx(toT), H - PAD]);
    return pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ") + " Z";
  }
  const leftReject = regionPath(tMin, -CRIT_95);
  const rightReject = regionPath(CRIT_95, tMax);

  const labelStyle = {
    fontSize: 10,
    fontFamily: "var(--ds-mono), monospace",
    color: DS.t3,
    marginBottom: 4,
  };

  const stepBtn = {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: `1px solid ${DS.border}`,
    background: "rgba(255,255,255,0.04)",
    color: DS.t2,
    fontSize: 14,
    cursor: "pointer",
    lineHeight: "1",
  };

  function Stepper({ label, valKey, value, delta, min, max, unit }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={labelStyle}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button type="button" style={stepBtn} onClick={() => setVal(valKey, -delta, min, max)}>
            −
          </button>
          <div
            style={{
              minWidth: 56,
              textAlign: "center",
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 13,
              color: DS.t1,
              background: PANEL_BG,
              borderRadius: 6,
              padding: "5px 8px",
            }}
          >
            {value}
            {unit ? <span style={{ color: DS.dim, fontSize: 10 }}> {unit}</span> : null}
          </div>
          <button type="button" style={stepBtn} onClick={() => setVal(valKey, delta, min, max)}>
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        t-Test Workbench
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        Pick a test, adjust the group statistics, and watch the t-statistic,
        degrees of freedom, and rejection region update live.
      </p>

      {/* ── Test type toggle ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        {TEST_TYPES.map((tt) => {
          const active = testType === tt.id;
          return (
            <button
              key={tt.id}
              type="button"
              onClick={() => setTestType(tt.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: `1px solid ${active ? ACCENT : DS.border}`,
                background: active ? "rgba(139,92,246,0.12)" : CARD_BG,
                color: active ? BRIGHT : DS.t3,
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                fontFamily: "var(--ds-mono), monospace",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tt.label}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: DS.dim, marginBottom: 14, lineHeight: 1.5 }}>
        {TEST_TYPES.find((x) => x.id === testType).blurb}
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* ── Controls column ── */}
        <div
          style={{
            flex: "1 1 200px",
            minWidth: 200,
            background: CARD_BG,
            border: `1px solid ${DS.border}`,
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: DS.t2, marginBottom: 10 }}>
            Inputs
          </div>

          {testType === "one" && (
            <>
              <Stepper label="Sample mean x̄" valKey="m1" value={v.m1} delta={1} />
              <Stepper label="Sample SD s" valKey="sd1" value={v.sd1} delta={1} min={0.5} />
              <Stepper label="Sample size n" valKey="n1" value={v.n1} delta={1} min={2} />
              <Stepper label="Reference μ₀" valKey="ref" value={v.ref} delta={1} />
            </>
          )}

          {testType === "ind" && (
            <>
              <Stepper label="Group 1 mean x̄₁" valKey="m1" value={v.m1} delta={1} />
              <Stepper label="Group 1 SD s₁" valKey="sd1" value={v.sd1} delta={1} min={0.5} />
              <Stepper label="Group 1 size n₁" valKey="n1" value={v.n1} delta={1} min={2} />
              <div style={{ height: 1, background: DS.border, margin: "8px 0 10px" }} />
              <Stepper label="Group 2 mean x̄₂" valKey="m2" value={v.m2} delta={1} />
              <Stepper label="Group 2 SD s₂" valKey="sd2" value={v.sd2} delta={1} min={0.5} />
              <Stepper label="Group 2 size n₂" valKey="n2" value={v.n2} delta={1} min={2} />

              <div style={{ marginTop: 12 }}>
                <div style={labelStyle}>Variance assumption</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { id: false, label: "Student (pooled)" },
                    { id: true, label: "Welch" },
                  ].map((opt) => (
                    <button
                      key={String(opt.id)}
                      type="button"
                      onClick={() => setWelch(opt.id)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: 7,
                        border: `1px solid ${welch === opt.id ? ACCENT : DS.border}`,
                        background: welch === opt.id ? "rgba(139,92,246,0.12)" : "transparent",
                        color: welch === opt.id ? BRIGHT : DS.t3,
                        fontSize: 10,
                        fontFamily: "var(--ds-mono), monospace",
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {testType === "paired" && (
            <>
              <Stepper label="Mean before x̄₁" valKey="m1" value={v.m1} delta={1} />
              <Stepper label="Mean after x̄₂" valKey="m2" value={v.m2} delta={1} />
              <Stepper label="SD of differences s_d" valKey="sdDiff" value={v.sdDiff} delta={1} min={0.5} />
              <Stepper label="Number of pairs n" valKey="n1" value={v.n1} delta={1} min={2} />
              <div style={{ fontSize: 10, color: DS.dim, lineHeight: 1.5, marginTop: 4 }}>
                The paired test works on each subject's difference (before − after),
                so it needs the SD of those differences, not the raw group SDs.
              </div>
            </>
          )}
        </div>

        {/* ── Results column ── */}
        <div style={{ flex: "2 1 380px", minWidth: 300 }}>
          {/* Formula */}
          <div
            style={{
              background: PANEL_BG,
              borderRadius: 8,
              padding: "10px 14px",
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 13,
              color: BRIGHT,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {formula}
          </div>

          {/* Stat readouts */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              { k: "t-statistic", val: round(t), col: BRIGHT },
              { k: "df", val: round(df, 1), col: DS.t1 },
              { k: "p (two-tailed)", val: p < 0.001 ? "< 0.001" : round(p, 3), col: significant ? GREEN : AMBER },
            ].map((box) => (
              <div
                key={box.k}
                style={{
                  flex: "1 1 100px",
                  background: CARD_BG,
                  border: `1px solid ${DS.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 4 }}>
                  {box.k}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: box.col, fontFamily: "var(--ds-mono), monospace" }}>
                  {box.val}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
            {diffLabel} &nbsp;·&nbsp; df = {dfLabel}
          </div>

          {/* SVG: null distribution + rejection region + observed t */}
          <div
            style={{
              background: PANEL_BG,
              borderRadius: 10,
              padding: "10px 8px 4px",
              marginBottom: 10,
            }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
              {/* rejection regions */}
              <path d={leftReject} fill={RED} opacity={0.28} />
              <path d={rightReject} fill={RED} opacity={0.28} />
              {/* curve */}
              <path d={curvePath} fill="none" stroke={ACCENT} strokeWidth={2} />
              {/* baseline */}
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={DS.border} strokeWidth={1} />
              {/* critical lines */}
              {[-CRIT_95, CRIT_95].map((c) => (
                <line
                  key={c}
                  x1={xToPx(c)}
                  y1={PAD}
                  x2={xToPx(c)}
                  y2={H - PAD}
                  stroke={RED}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
              ))}
              {/* observed t marker */}
              <line
                x1={xToPx(tClamped)}
                y1={PAD - 2}
                x2={xToPx(tClamped)}
                y2={H - PAD}
                stroke={significant ? GREEN : AMBER}
                strokeWidth={2.5}
              />
              <circle cx={xToPx(tClamped)} cy={PAD + 2} r={4} fill={significant ? GREEN : AMBER} />
              <text
                x={xToPx(tClamped)}
                y={PAD + 14}
                fill={significant ? GREEN : AMBER}
                fontSize={11}
                fontFamily="var(--ds-mono), monospace"
                textAnchor={tClamped > 2 ? "end" : "start"}
              >
                t = {round(t)}
              </text>
              {/* axis labels */}
              {[-CRIT_95, 0, CRIT_95].map((c) => (
                <text
                  key={`lab${c}`}
                  x={xToPx(c)}
                  y={H - 0.5}
                  fill={DS.dim}
                  fontSize={9}
                  fontFamily="var(--ds-mono), monospace"
                  textAnchor="middle"
                >
                  {c === 0 ? "0" : c > 0 ? "+1.96" : "−1.96"}
                </text>
              ))}
            </svg>
            <div style={{ fontSize: 10, color: DS.dim, textAlign: "center", padding: "2px 0 4px" }}>
              Null t-distribution. Shaded tails = rejection region (α = 0.05, two-tailed).
            </div>
          </div>

          {/* Verdict */}
          <div
            style={{
              background: significant ? "rgba(52,211,153,0.08)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${significant ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: DS.t2,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: significant ? GREEN : AMBER }}>
              {significant ? "Reject H₀" : "Fail to reject H₀"}
            </strong>{" "}
            — with t({round(df, 1)}) = {round(t)}, p {p < 0.001 ? "< 0.001" : `= ${round(p, 3)}`},{" "}
            {significant
              ? "the observed t falls in the rejection region. The mean difference is larger than sampling noise would plausibly produce."
              : "the observed t sits inside the non-rejection region. This difference is consistent with chance at α = 0.05."}
            {testType === "ind" && (
              <span style={{ color: DS.dim }}>
                {" "}
                ({welch ? "Welch" : "Student"}'s t — note how df shifts when you toggle the
                variance assumption with unequal SDs / n's.)
              </span>
            )}
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: 11,
          color: DS.dim,
          lineHeight: 1.6,
          marginTop: 14,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        Note: p-values use a normal approximation to the t-distribution (with a
        small-df tail correction) — close enough to build intuition, but use real
        software for reporting. Welch's t is the safer default for two independent
        groups whenever variances or sample sizes are unequal.
      </p>
    </div>
  );
}
