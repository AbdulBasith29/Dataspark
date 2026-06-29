import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6";
const ACCENT_LIGHT = "#A78BFA";
const GREEN = "#34D399";
const AMBER = "#F59E0B";
const RED = "#F87171";

// Two groups: control fixed at mean = 0, treatment slides right.
const CONTROL_MEAN = 0;

// SVG plotting geometry
const PLOT_W = 520;
const PLOT_H = 200;
const X_MIN = -6;
const X_MAX = 9;

// Magnitude benchmarks (Cohen) for d. eta-squared and r have their own bands.
const D_BANDS = [
  { max: 0.2, label: "negligible", color: DS.dim },
  { max: 0.5, label: "small", color: AMBER },
  { max: 0.8, label: "medium", color: ACCENT_LIGHT },
  { max: Infinity, label: "large", color: GREEN },
];

const ETA_BANDS = [
  { max: 0.01, label: "negligible", color: DS.dim },
  { max: 0.06, label: "small", color: AMBER },
  { max: 0.14, label: "medium", color: ACCENT_LIGHT },
  { max: Infinity, label: "large", color: GREEN },
];

const R_BANDS = [
  { max: 0.1, label: "negligible", color: DS.dim },
  { max: 0.3, label: "small", color: AMBER },
  { max: 0.5, label: "medium", color: ACCENT_LIGHT },
  { max: Infinity, label: "large", color: GREEN },
];

const METRICS = [
  { id: "d", label: "Cohen's d", glyph: "d" },
  { id: "eta", label: "η² (ANOVA)", glyph: "η²" },
  { id: "r", label: "r", glyph: "r" },
];

// Normal PDF
function pdf(x, mean, sd) {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

// Map data x and density to SVG coords
function xToPx(x) {
  return ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
}

function buildCurvePath(mean, sd, peak) {
  const pts = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
    const y = pdf(x, mean, sd);
    const px = xToPx(x);
    const py = PLOT_H - (y / peak) * (PLOT_H - 24) - 8;
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return "M" + pts.join(" L");
}

// Overlap (overlapping coefficient) of two equal-SD normals separated by d:
// OVL = 2 * Phi(-|d|/2)
function normalCdf(z) {
  // Abramowitz & Stegun approximation of the standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}

function bandLabel(bands, value) {
  return bands.find((b) => value < b.max) || bands[bands.length - 1];
}

// --- Component ---

export default function StatEffectSizeViz() {
  const [meanDiff, setMeanDiff] = useState(0.67); // raw difference in means
  const [sd, setSd] = useState(1.0); // pooled SD
  const [n, setN] = useState(25); // per-group sample size
  const [metric, setMetric] = useState("d");

  const treatmentMean = CONTROL_MEAN + meanDiff;

  // Cohen's d = mean difference / pooled SD
  const d = Math.abs(meanDiff) / sd;

  // Convert d → r (point-biserial, equal groups): r = d / sqrt(d² + 4)
  const r = d / Math.sqrt(d * d + 4);

  // Convert d → eta-squared (two-group, equal n): η² = d² / (d² + 4 - ... )
  // For a two-group comparison, η² = r² (point-biserial squared).
  const eta = r * r;

  // Overlap of the two distributions (equal SD) = 2 * Phi(-d/2)
  const overlap = 2 * normalCdf(-d / 2);

  // Approximate t and p for the APA sentence (two-sample, equal n, equal SD).
  // t = d * sqrt(n/2)  (independent samples, n per group)
  const df = 2 * n - 2;
  const t = d * Math.sqrt(n / 2);
  // Two-sided p via a rough normal approximation (df large enough for teaching).
  const p = 2 * (1 - normalCdf(Math.abs(t)));

  const peak = pdf(0, 0, sd); // tallest density (both curves share sd)

  const controlPath = buildCurvePath(CONTROL_MEAN, sd, peak);
  const treatmentPath = buildCurvePath(treatmentMean, sd, peak);

  // Active metric value + band
  let metricValue, metricBands, metricGlyph;
  if (metric === "d") {
    metricValue = d;
    metricBands = D_BANDS;
    metricGlyph = "d";
  } else if (metric === "eta") {
    metricValue = eta;
    metricBands = ETA_BANDS;
    metricGlyph = "η²";
  } else {
    metricValue = r;
    metricBands = R_BANDS;
    metricGlyph = "r";
  }
  const band = bandLabel(metricBands, metricValue);

  // APA p formatting: strip leading 0, use "< .001" when tiny
  const fmtP = (val) => {
    if (val < 0.001) return "< .001";
    return "= " + val.toFixed(3).replace(/^0/, "");
  };

  const apaSentence = `t(${df}) = ${t.toFixed(2)}, p ${fmtP(
    p
  )}, d = ${d.toFixed(2)} (${bandLabel(D_BANDS, d).label} effect)`;

  // Trivial-effect-but-significant warning
  const trivialButSignificant = p < 0.05 && d < 0.2;

  const sliderStyle = {
    width: "100%",
    accentColor: ACCENT,
    cursor: "pointer",
  };

  const labelStyle = {
    fontSize: 11,
    fontFamily: "var(--ds-mono), monospace",
    color: DS.t3,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  };

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Effect Size Explorer
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
        Drag the means apart and watch the overlap shrink. A small p-value tells
        you an effect is unlikely to be zero — the effect size tells you whether
        it matters.
      </p>

      {/* ── Distribution plot ── */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <svg
            viewBox={`0 0 ${PLOT_W} ${PLOT_H + 22}`}
            width="100%"
            style={{ display: "block", maxWidth: "100%" }}
          >
            <defs>
              <linearGradient id="ctrlFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DS.dim} stopOpacity="0.35" />
                <stop offset="100%" stopColor={DS.dim} stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="treatFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.4" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* baseline */}
            <line
              x1="0"
              y1={PLOT_H}
              x2={PLOT_W}
              y2={PLOT_H}
              stroke={DS.border}
              strokeWidth="1"
            />

            {/* control fill + curve */}
            <path
              d={`${controlPath} L${xToPx(X_MAX)},${PLOT_H} L${xToPx(
                X_MIN
              )},${PLOT_H} Z`}
              fill="url(#ctrlFill)"
            />
            <path d={controlPath} fill="none" stroke={DS.t3} strokeWidth="2" />

            {/* treatment fill + curve */}
            <path
              d={`${treatmentPath} L${xToPx(X_MAX)},${PLOT_H} L${xToPx(
                X_MIN
              )},${PLOT_H} Z`}
              fill="url(#treatFill)"
            />
            <path
              d={treatmentPath}
              fill="none"
              stroke={ACCENT_LIGHT}
              strokeWidth="2"
            />

            {/* mean markers */}
            <line
              x1={xToPx(CONTROL_MEAN)}
              y1={28}
              x2={xToPx(CONTROL_MEAN)}
              y2={PLOT_H}
              stroke={DS.t3}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1={xToPx(treatmentMean)}
              y1={28}
              x2={xToPx(treatmentMean)}
              y2={PLOT_H}
              stroke={ACCENT_LIGHT}
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            <text
              x={xToPx(CONTROL_MEAN)}
              y={PLOT_H + 16}
              fill={DS.t3}
              fontSize="10"
              fontFamily="var(--ds-mono), monospace"
              textAnchor="middle"
            >
              Control
            </text>
            <text
              x={xToPx(treatmentMean)}
              y={PLOT_H + 16}
              fill={ACCENT_LIGHT}
              fontSize="10"
              fontFamily="var(--ds-mono), monospace"
              textAnchor="middle"
            >
              Treatment
            </text>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            fontSize: 11,
            fontFamily: "var(--ds-mono), monospace",
            color: DS.t3,
          }}
        >
          <span>
            Distribution overlap:{" "}
            <strong
              style={{
                color: overlap > 0.6 ? AMBER : overlap > 0.3 ? ACCENT_LIGHT : GREEN,
              }}
            >
              {(overlap * 100).toFixed(0)}%
            </strong>
          </span>
          <span>
            Cohen's d ={" "}
            <strong style={{ color: ACCENT_LIGHT }}>{d.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={labelStyle}>
            <span>Mean difference</span>
            <span style={{ color: DS.t1 }}>{meanDiff.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={meanDiff}
            onChange={(e) => setMeanDiff(parseFloat(e.target.value))}
            style={sliderStyle}
          />
        </div>
        <div>
          <div style={labelStyle}>
            <span>Pooled SD</span>
            <span style={{ color: DS.t1 }}>{sd.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={sd}
            onChange={(e) => setSd(parseFloat(e.target.value))}
            style={sliderStyle}
          />
        </div>
        <div>
          <div style={labelStyle}>
            <span>n per group</span>
            <span style={{ color: DS.t1 }}>{n}</span>
          </div>
          <input
            type="range"
            min="5"
            max="2000"
            step="5"
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
            style={sliderStyle}
          />
        </div>
      </div>

      {/* ── Metric toggle ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMetric(m.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${
                metric === m.id ? "rgba(139,92,246,0.5)" : DS.border
              }`,
              background:
                metric === m.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
              color: metric === m.id ? ACCENT_LIGHT : DS.t3,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: metric === m.id ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Active metric card ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            fontFamily: "var(--ds-mono), monospace",
            color: band.color,
            minWidth: 110,
          }}
        >
          {metricGlyph} = {metricValue.toFixed(metric === "eta" ? 3 : 2)}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: band.color,
              textTransform: "capitalize",
            }}
          >
            {band.label} effect
          </div>
          <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.5, marginTop: 3 }}>
            {metric === "d" &&
              "Cohen's d = (mean difference) / pooled SD. Benchmarks: 0.2 small · 0.5 medium · 0.8 large."}
            {metric === "eta" &&
              "η² = proportion of variance explained (SS_effect / SS_total). Benchmarks: .01 small · .06 medium · .14 large."}
            {metric === "r" &&
              "r = standardized association on a −1..1 scale. Benchmarks: .1 small · .3 medium · .5 large."}
          </div>
        </div>
      </div>

      {/* ── APA results sentence ── */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "var(--ds-mono), monospace",
            color: DS.dim,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          APA-formatted result
        </div>
        <div
          style={{
            fontSize: 15,
            fontFamily: "var(--ds-mono), monospace",
            color: DS.t1,
            lineHeight: 1.5,
          }}
        >
          {apaSentence}
        </div>
        <div style={{ fontSize: 11, color: DS.t3, marginTop: 8, lineHeight: 1.5 }}>
          Always report the effect size next to the p-value — APA 7th edition and
          most journals now require it, ideally with a confidence interval on the
          effect (e.g., 95% CI [low, high]).
        </div>
      </div>

      {/* ── Trivial-but-significant warning ── */}
      {trivialButSignificant && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: `1px solid rgba(248,113,113,0.3)`,
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 4 }}>
            Significant, but trivial
          </div>
          <p style={{ fontSize: 12, color: DS.t2, lineHeight: 1.55, margin: 0 }}>
            With n = {n} per group, p {fmtP(p)} — statistically "significant" — yet
            d = {d.toFixed(2)} is negligible. A large enough sample makes almost any
            non-zero difference reach significance. This is exactly why a tiny
            p-value must never be reported without an effect size.
          </p>
        </div>
      )}

      <p
        style={{
          fontSize: 11,
          color: DS.dim,
          lineHeight: 1.6,
          fontFamily: "var(--ds-sans), sans-serif",
          marginTop: 8,
        }}
      >
        Try this: push <strong>n per group</strong> toward 2000 with a small mean
        difference. Watch p plunge below .001 while d stays trivial — the
        replication-crisis lesson in one slider.
      </p>
    </div>
  );
}
