import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants (declared before component — TDZ safety) ---

const BLUE = "#0EA5E9";
const GREEN = "#34D399";
const YELLOW = "#FBBF24";
const RED = "#F87171";

// Drift type definitions
const DRIFT_TYPES = [
  { id: "covariate", label: "Covariate Shift" },
  { id: "label",     label: "Label Shift" },
  { id: "concept",   label: "Concept Drift" },
];

// Bar chart data for each drift type
// Each entry: { label, train, serve } — values are relative heights (0–100)
const CHART_DATA = {
  covariate: {
    title: "Feature X: age_bucket",
    trainLabel: "Training Distribution",
    serveLabel: "Serving Distribution",
    bars: [
      { label: "18-24", train: 12, serve: 38 },
      { label: "25-34", train: 25, serve: 30 },
      { label: "35-44", train: 38, serve: 18 },
      { label: "45-54", train: 18, serve: 9  },
      { label: "55-64", train: 7,  serve: 5  },
    ],
    trainColor: BLUE,
    serveColor: YELLOW,
    psi: 0.34,
    insight: "Users are now younger — model was trained on 35-44 majority. Features are OOD.",
  },
  label: {
    title: "P(Y): spam label",
    trainLabel: "Training Distribution",
    serveLabel: "Serving Distribution",
    bars: [
      { label: "Not spam", train: 95, serve: 80 },
      { label: "Spam",     train: 5,  serve: 20 },
    ],
    trainColor: BLUE,
    serveColor: RED,
    psi: 0.42,
    insight: "Spam prevalence jumped from 5% → 20%. Class imbalance has shifted drastically.",
  },
  concept: {
    title: "Decision boundary for 'spam'",
    trainLabel: "Training Distribution",
    serveLabel: "Serving Distribution",
    bars: [
      { label: "Short msg",   train: 30, serve: 28 },
      { label: "Has link",    train: 45, serve: 44 },
      { label: "All caps",    train: 20, serve: 22 },
      { label: "Known sender",train: 5,  serve: 6  },
    ],
    trainColor: BLUE,
    serveColor: GREEN,
    psi: 0.08,
    insight: "Features unchanged — but 'has link' is no longer predictive of spam. P(Y|X) shifted.",
  },
};

// Detection method definitions
const DETECTION_METHODS = [
  { name: "KS Test",     use: "Continuous features",    detail: "Compares CDFs — sensitive to distribution shape changes" },
  { name: "Chi-Squared", use: "Categorical features",   detail: "Tests if observed vs expected counts are independent" },
  { name: "PSI",         use: "Binned numeric / label", detail: "Population Stability Index — standard in credit scoring" },
];

// PSI threshold definitions
const PSI_THRESHOLDS = [
  { max: 0.1,   label: "Stable",  color: GREEN,  verdict: "No action required — distributions match well" },
  { max: 0.25,  label: "Monitor", color: YELLOW, verdict: "Moderate shift — schedule retraining review" },
  { max: Infinity, label: "Retrain", color: RED,  verdict: "Severe drift — immediate retraining recommended" },
];

function getPsiVerdict(psi) {
  for (const t of PSI_THRESHOLDS) {
    if (psi < t.max) return t;
  }
  return PSI_THRESHOLDS[PSI_THRESHOLDS.length - 1];
}

// ---- Styles ----

const ROOT_STYLE = {
  background: DS.bg,
  borderRadius: DS.radiusMd,
  padding: "18px 20px 16px",
  fontFamily: "var(--ds-sans), sans-serif",
  color: DS.t1,
  maxWidth: 620,
  margin: "0 auto",
  boxSizing: "border-box",
};

const SECTION_TITLE = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: DS.t3,
  marginBottom: 12,
};

const TAB_ROW = {
  display: "flex",
  gap: 6,
  marginBottom: 16,
  flexWrap: "wrap",
};

const CODE_PANEL = {
  background: "rgba(2,6,23,0.72)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  padding: "10px 14px",
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 12,
  color: DS.t2,
  marginBottom: 12,
};

const CARD_STYLE = {
  background: "rgba(255,255,255,0.02)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  padding: "12px 14px",
};

// ---- Sub-components ----

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        border: `1px solid ${active ? BLUE : DS.border}`,
        background: active ? `rgba(14,165,233,0.15)` : "rgba(255,255,255,0.02)",
        color: active ? BLUE : DS.t3,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        outline: "none",
        fontFamily: "var(--ds-sans), sans-serif",
        transition: "all 0.15s ease",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

function MiniBarChart({ data, color, title, maxVal }) {
  const barW = 32;
  const barGap = 8;
  const chartH = 70;
  const totalW = data.length * (barW + barGap) - barGap;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: DS.t3, marginBottom: 6, textAlign: "center", fontFamily: "var(--ds-mono), monospace" }}>
        {title}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          width={totalW}
          height={chartH + 20}
          style={{ overflow: "visible" }}
          aria-label={title}
        >
          {data.map((bar, i) => {
            const val = color === data[i].trainColor ? bar.train : bar.serve;
            const height = Math.max(4, (val / maxVal) * chartH);
            const x = i * (barW + barGap);
            const y = chartH - height;
            return (
              <g key={bar.label}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={height}
                  rx={3}
                  fill={color}
                  fillOpacity={0.85}
                />
                <text
                  x={x + barW / 2}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill={DS.t3}
                  fontFamily="var(--ds-mono), monospace"
                >
                  {bar.label.length > 6 ? bar.label.slice(0, 6) + "…" : bar.label}
                </text>
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fill={color}
                  fontFamily="var(--ds-mono), monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Resolve which column to use for each chart (train vs serve)
function TrainChart({ data }) {
  const maxVal = Math.max(...data.bars.map((b) => Math.max(b.train, b.serve)));
  // Build per-bar object with a trainColor property so MiniBarChart can find it
  const barsWithColor = data.bars.map((b) => ({ ...b, trainColor: data.trainColor }));
  return (
    <MiniBarChart
      data={barsWithColor}
      color={data.trainColor}
      title={data.trainLabel}
      maxVal={maxVal}
    />
  );
}

function ServeChart({ data }) {
  const maxVal = Math.max(...data.bars.map((b) => Math.max(b.train, b.serve)));
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: DS.t3, marginBottom: 6, textAlign: "center", fontFamily: "var(--ds-mono), monospace" }}>
        {data.serveLabel}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          width={data.bars.length * 40 - 8}
          height={90}
          style={{ overflow: "visible" }}
          aria-label={data.serveLabel}
        >
          {data.bars.map((bar, i) => {
            const val = bar.serve;
            const chartH = 70;
            const barW = 32;
            const barGap = 8;
            const height = Math.max(4, (val / maxVal) * chartH);
            const x = i * (barW + barGap);
            const y = chartH - height;
            return (
              <g key={bar.label}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={height}
                  rx={3}
                  fill={data.serveColor}
                  fillOpacity={0.85}
                />
                <text
                  x={x + barW / 2}
                  y={chartH + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill={DS.t3}
                  fontFamily="var(--ds-mono), monospace"
                >
                  {bar.label.length > 6 ? bar.label.slice(0, 6) + "…" : bar.label}
                </text>
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fill={data.serveColor}
                  fontFamily="var(--ds-mono), monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function DriftConceptViz() {
  const [activeDrift, setActiveDrift] = useState("covariate");

  const data = CHART_DATA[activeDrift];
  const verdict = getPsiVerdict(data.psi);

  return (
    <div style={ROOT_STYLE}>
      <div style={SECTION_TITLE}>Drift Detection — Distribution Shift</div>

      {/* Tab row */}
      <div style={TAB_ROW}>
        {DRIFT_TYPES.map((d) => (
          <TabButton
            key={d.id}
            label={d.label}
            active={activeDrift === d.id}
            onClick={() => setActiveDrift(d.id)}
          />
        ))}
      </div>

      {/* Chart subtitle */}
      <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10 }}>
        {data.title}
      </div>

      {/* Side-by-side bar charts */}
      <div style={{
        ...CARD_STYLE,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        marginBottom: 12,
        flexWrap: "wrap",
      }}>
        <TrainChart data={data} />
        <div style={{ width: 1, background: DS.border, alignSelf: "stretch", flexShrink: 0 }} />
        <ServeChart data={data} />
      </div>

      {/* PSI formula + score */}
      <div style={{ ...CODE_PANEL, marginBottom: 12 }}>
        <span style={{ color: DS.t3 }}>PSI formula: </span>
        <span style={{ color: BLUE }}>PSI = Σ (Actual% − Expected%) × ln(Actual% / Expected%)</span>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: DS.t3 }}>Computed PSI:</span>
          <span style={{
            fontWeight: 700,
            fontSize: 15,
            color: verdict.color,
            fontFamily: "var(--ds-mono), monospace",
          }}>
            {data.psi.toFixed(2)}
          </span>
          <span style={{
            padding: "2px 9px",
            borderRadius: 4,
            background: `${verdict.color}22`,
            border: `1px solid ${verdict.color}55`,
            color: verdict.color,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}>
            {verdict.label}
          </span>
        </div>
        <div style={{ marginTop: 5, fontSize: 11, color: DS.t3 }}>{verdict.verdict}</div>
      </div>

      {/* Insight box */}
      <div style={{
        background: `rgba(14,165,233,0.07)`,
        border: `1px solid rgba(14,165,233,0.25)`,
        borderRadius: DS.radiusSm,
        padding: "9px 12px",
        fontSize: 12,
        color: DS.t2,
        marginBottom: 14,
        lineHeight: 1.55,
      }}>
        <span style={{ color: BLUE, fontWeight: 700 }}>Interview insight: </span>
        {data.insight}
      </div>

      {/* PSI threshold legend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {PSI_THRESHOLDS.map((t, i) => {
          const ranges = ["< 0.10", "0.10 – 0.25", "> 0.25"];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: DS.t3,
                fontFamily: "var(--ds-mono), monospace",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 2, background: t.color }} />
              <span>{ranges[i]}</span>
              <span style={{ color: t.color, fontWeight: 700 }}>{t.label}</span>
            </div>
          );
        })}
      </div>

      {/* Detection methods grid */}
      <div style={{ ...SECTION_TITLE, marginTop: 4 }}>Detection Methods</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DETECTION_METHODS.map((m) => (
          <div
            key={m.name}
            style={{
              ...CARD_STYLE,
              flex: "1 1 160px",
              minWidth: 140,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 4, fontFamily: "var(--ds-mono), monospace" }}>
              {m.name}
            </div>
            <div style={{ fontSize: 11, color: DS.t3, marginBottom: 3 }}>
              {m.use}
            </div>
            <div style={{ fontSize: 11, color: DS.t2, lineHeight: 1.45 }}>
              {m.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
