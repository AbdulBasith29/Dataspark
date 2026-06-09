import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component — TDZ safety) ───────────────────────

const ACCENT = "#818CF8"; // indigo — Python course color
const ACCENT2 = "#34D399"; // green
const ACCENT3 = "#F59E0B"; // amber
const ACCENT4 = "#38BDF8"; // blue
const ACCENT5 = "#F87171"; // red

const CHART_TYPES = ["Scatter", "Bar", "Line", "Box", "Heatmap"];

const CHART_CODE = {
  Scatter: `import plotly.express as px

fig = px.scatter(
    df,
    x="age",
    y="salary",
    color="dept",
    size="exp",
    title="Salary vs Age by Department",
    hover_data=["name"],
)
fig.show()`,
  Bar: `import plotly.express as px

fig = px.bar(
    df,
    x="category",
    y="count",
    color="group",
    barmode="group",
    title="Count by Category and Group",
)
fig.show()`,
  Line: `import plotly.express as px

fig = px.line(
    df,
    x="date",
    y="value",
    color="series",
    markers=True,
    title="Time Series by Series",
)
fig.show()`,
  Box: `import plotly.express as px

fig = px.box(
    df,
    x="group",
    y="score",
    points="outliers",
    title="Score Distribution by Group",
    color="group",
)
fig.show()`,
  Heatmap: `import plotly.express as px

fig = px.imshow(
    corr_matrix,
    text_auto=True,
    color_continuous_scale="RdBu",
    title="Feature Correlation Matrix",
    zmin=-1, zmax=1,
)
fig.show()`,
};

const CHART_DESC = {
  Scatter: "Best for showing relationships between two continuous variables. Add color/size to encode extra dimensions.",
  Bar: "Best for comparing discrete categories. Use barmode='group' or 'stack' for multi-series comparisons.",
  Line: "Best for time series and ordered data. markers=True adds point markers — helpful for sparse data.",
  Box: "Best for distribution comparisons across groups. Shows IQR, median, whiskers, and outliers automatically.",
  Heatmap: "Best for correlation matrices and 2D data. px.imshow() renders any 2D array with automatic color scaling.",
};

// Scatter: 15 dots in rough upward pattern
const SCATTER_POINTS = [
  [30, 145], [45, 125], [60, 105], [80, 85], [100, 68],
  [38, 135], [55, 118], [72, 98], [90, 75], [110, 55],
  [25, 150], [65, 100], [85, 80], [105, 60], [120, 42],
];

// Bar: 5 bars
const BAR_DATA = [
  { label: "A", height: 90, color: ACCENT },
  { label: "B", height: 60, color: ACCENT2 },
  { label: "C", height: 110, color: ACCENT3 },
  { label: "D", height: 45, color: ACCENT4 },
  { label: "E", height: 80, color: ACCENT5 },
];

// Line: 8 wavy points
const LINE_POINTS = [
  [10, 120], [30, 95], [50, 105], [70, 75], [90, 88], [110, 58], [130, 70], [150, 45],
];

// Heatmap: 4×4 values (0–1)
const HEATMAP_VALUES = [
  [1.0, 0.7, 0.3, -0.2],
  [0.7, 1.0, 0.5, 0.1],
  [0.3, 0.5, 1.0, 0.6],
  [-0.2, 0.1, 0.6, 1.0],
];

const HEATMAP_LABELS = ["Age", "Sal", "Exp", "Score"];

const PX_GO_ROWS = [
  {
    aspect: "Ease of use",
    px: "One-liner for common charts; sane defaults",
    go: "Verbose — you specify every trace, layout key manually",
  },
  {
    aspect: "Customization",
    px: "Limited — use fig.update_traces() / fig.update_layout() to extend",
    go: "Full control — pixel-perfect layouts, custom subplots, mixed trace types",
  },
  {
    aspect: "When to use",
    px: "EDA, quick prototypes, standard chart types (scatter, bar, box, histo)",
    go: "Production dashboards, unusual chart combos, fine-grained animation",
  },
];

// ─── Sub-renders for each chart type ─────────────────────────────────────────

function ScatterSVG() {
  const DOT_COLORS = [ACCENT, ACCENT2, ACCENT3, ACCENT4, ACCENT5];
  return (
    <svg width="100%" viewBox="0 0 180 170" style={{ display: "block" }}>
      {/* axes */}
      <line x1="18" y1="10" x2="18" y2="155" stroke={DS.t3} strokeWidth="1" />
      <line x1="18" y1="155" x2="170" y2="155" stroke={DS.t3} strokeWidth="1" />
      <text x="90" y="168" textAnchor="middle" fill={DS.t3} fontSize="9">age</text>
      <text x="6" y="85" textAnchor="middle" fill={DS.t3} fontSize="9" transform="rotate(-90,6,85)">salary</text>
      {SCATTER_POINTS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i % 3 === 0 ? 5 : i % 3 === 1 ? 3.5 : 4.5}
          fill={DOT_COLORS[i % DOT_COLORS.length]}
          fillOpacity={0.82}
        />
      ))}
    </svg>
  );
}

function BarSVG() {
  const BASE_Y = 150;
  const BAR_W = 20;
  const START_X = 22;
  const GAP = 28;
  return (
    <svg width="100%" viewBox="0 0 180 170" style={{ display: "block" }}>
      <line x1="18" y1="10" x2="18" y2="155" stroke={DS.t3} strokeWidth="1" />
      <line x1="18" y1="155" x2="170" y2="155" stroke={DS.t3} strokeWidth="1" />
      <text x="90" y="168" textAnchor="middle" fill={DS.t3} fontSize="9">category</text>
      <text x="6" y="85" textAnchor="middle" fill={DS.t3} fontSize="9" transform="rotate(-90,6,85)">count</text>
      {BAR_DATA.map(({ label, height, color }, i) => {
        const x = START_X + i * GAP;
        const y = BASE_Y - height;
        return (
          <g key={label}>
            <rect x={x} y={y} width={BAR_W} height={height} fill={color} fillOpacity={0.8} rx={2} />
            <text x={x + BAR_W / 2} y={BASE_Y + 10} textAnchor="middle" fill={DS.t3} fontSize="8">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineSVG() {
  const pts = LINE_POINTS.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg width="100%" viewBox="0 0 180 170" style={{ display: "block" }}>
      <line x1="8" y1="10" x2="8" y2="155" stroke={DS.t3} strokeWidth="1" />
      <line x1="8" y1="155" x2="162" y2="155" stroke={DS.t3} strokeWidth="1" />
      <text x="85" y="168" textAnchor="middle" fill={DS.t3} fontSize="9">date</text>
      <text x="4" y="85" textAnchor="middle" fill={DS.t3} fontSize="9" transform="rotate(-90,4,85)">value</text>
      <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" />
      {LINE_POINTS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={3.5} fill={ACCENT} fillOpacity={0.9} />
      ))}
    </svg>
  );
}

function BoxSVG() {
  // Group A: Q1=70, median=95, Q3=120, min=40, max=145, outliers at 20, 162
  const x = 60, bw = 40;
  const toY = (v) => 158 - v; // scale: value 0→158, value 160→-2
  return (
    <svg width="100%" viewBox="0 0 180 170" style={{ display: "block" }}>
      <line x1="18" y1="10" x2="18" y2="155" stroke={DS.t3} strokeWidth="1" />
      <line x1="18" y1="155" x2="170" y2="155" stroke={DS.t3} strokeWidth="1" />
      <text x="90" y="168" textAnchor="middle" fill={DS.t3} fontSize="9">group</text>
      <text x="6" y="85" textAnchor="middle" fill={DS.t3} fontSize="9" transform="rotate(-90,6,85)">score</text>
      {/* whisker lines */}
      <line x1={x + bw / 2} y1={toY(40)} x2={x + bw / 2} y2={toY(70)} stroke={ACCENT2} strokeWidth="1.5" />
      <line x1={x + bw / 2} y1={toY(120)} x2={x + bw / 2} y2={toY(145)} stroke={ACCENT2} strokeWidth="1.5" />
      {/* whisker caps */}
      <line x1={x + 10} y1={toY(40)} x2={x + bw - 10} y2={toY(40)} stroke={ACCENT2} strokeWidth="1.5" />
      <line x1={x + 10} y1={toY(145)} x2={x + bw - 10} y2={toY(145)} stroke={ACCENT2} strokeWidth="1.5" />
      {/* IQR box */}
      <rect x={x} y={toY(120)} width={bw} height={toY(70) - toY(120)} fill={ACCENT} fillOpacity={0.22} stroke={ACCENT} strokeWidth="1.5" />
      {/* median */}
      <line x1={x} y1={toY(95)} x2={x + bw} y2={toY(95)} stroke={ACCENT3} strokeWidth="2.5" />
      {/* outliers */}
      <circle cx={x + bw / 2} cy={toY(20)} r={4} fill="none" stroke={ACCENT5} strokeWidth="1.5" />
      <circle cx={x + bw / 2} cy={toY(162)} r={4} fill="none" stroke={ACCENT5} strokeWidth="1.5" />
      <text x={x + bw / 2} y={158 + 11} textAnchor="middle" fill={DS.t3} fontSize="8">A</text>
    </svg>
  );
}

function HeatmapSVG() {
  const SIZE = 30;
  const OFFSET_X = 34;
  const OFFSET_Y = 12;
  const getColor = (v) => {
    // RdBu-ish: negative → red, zero → white-ish, positive → blue
    if (v >= 0) {
      const t = v;
      const r = Math.round(56 + (1 - t) * 199);
      const g = Math.round(189 + (1 - t) * 66);
      const b = Math.round(248);
      return `rgb(${r},${g},${b})`;
    } else {
      const t = -v;
      const r = Math.round(248);
      const g = Math.round(113 + (1 - t) * 142);
      const b = Math.round(113 + (1 - t) * 135);
      return `rgb(${r},${g},${b})`;
    }
  };
  return (
    <svg width="100%" viewBox="0 0 180 170" style={{ display: "block" }}>
      {HEATMAP_VALUES.map((row, ri) =>
        row.map((val, ci) => (
          <g key={`${ri}-${ci}`}>
            <rect
              x={OFFSET_X + ci * SIZE}
              y={OFFSET_Y + ri * SIZE}
              width={SIZE - 2}
              height={SIZE - 2}
              fill={getColor(val)}
              rx={2}
            />
            <text
              x={OFFSET_X + ci * SIZE + SIZE / 2 - 1}
              y={OFFSET_Y + ri * SIZE + SIZE / 2 + 4}
              textAnchor="middle"
              fill="#020617"
              fontSize="8"
              fontWeight="600"
            >
              {val.toFixed(1)}
            </text>
          </g>
        ))
      )}
      {/* Column labels */}
      {HEATMAP_LABELS.map((lbl, i) => (
        <text key={lbl + "col"} x={OFFSET_X + i * SIZE + SIZE / 2 - 1} y={OFFSET_Y - 2} textAnchor="middle" fill={DS.t3} fontSize="8">{lbl}</text>
      ))}
      {/* Row labels */}
      {HEATMAP_LABELS.map((lbl, i) => (
        <text key={lbl + "row"} x={OFFSET_X - 4} y={OFFSET_Y + i * SIZE + SIZE / 2 + 4} textAnchor="end" fill={DS.t3} fontSize="8">{lbl}</text>
      ))}
    </svg>
  );
}

const CHART_SVG_MAP = {
  Scatter: ScatterSVG,
  Bar: BarSVG,
  Line: LineSVG,
  Box: BoxSVG,
  Heatmap: HeatmapSVG,
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const ROOT_STYLE = {
  background: DS.bg,
  color: DS.t1,
  fontFamily: "var(--ds-sans), sans-serif",
  padding: "24px",
  borderRadius: "14px",
  maxWidth: "720px",
  margin: "0 auto",
};

const HEADER_STYLE = {
  fontSize: "18px",
  fontWeight: "700",
  color: DS.t1,
  marginBottom: "4px",
};

const SUB_STYLE = {
  fontSize: "13px",
  color: DS.t3,
  marginBottom: "20px",
};

const BTN_ROW_STYLE = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const baseBtn = {
  padding: "7px 16px",
  borderRadius: "8px",
  border: `1px solid ${DS.border}`,
  background: "rgba(255,255,255,0.04)",
  color: DS.t2,
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s",
};

const activeBtnStyle = {
  ...baseBtn,
  background: "rgba(129,140,248,0.18)",
  borderColor: ACCENT,
  color: ACCENT,
};

const CHART_AREA_STYLE = {
  display: "flex",
  gap: "20px",
  alignItems: "flex-start",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const SVG_WRAP_STYLE = {
  flex: "0 0 200px",
  background: "rgba(2,6,23,0.72)",
  borderRadius: "10px",
  border: `1px solid ${DS.border}`,
  padding: "12px",
  minWidth: "160px",
};

const CODE_PANEL_STYLE = {
  flex: "1 1 240px",
  background: "rgba(2,6,23,0.72)",
  borderRadius: "10px",
  border: `1px solid ${DS.border}`,
  padding: "14px 16px",
  fontFamily: "var(--ds-mono), monospace",
  fontSize: "12px",
  color: ACCENT2,
  whiteSpace: "pre",
  overflowX: "auto",
  lineHeight: "1.65",
  minWidth: "0",
};

const DESC_STYLE = {
  fontSize: "13px",
  color: DS.t2,
  lineHeight: "1.6",
  background: "rgba(129,140,248,0.07)",
  border: `1px solid rgba(129,140,248,0.18)`,
  borderRadius: "8px",
  padding: "10px 14px",
  marginBottom: "24px",
};

const TABLE_WRAP_STYLE = {
  borderRadius: "10px",
  border: `1px solid ${DS.border}`,
  overflow: "hidden",
};

const TH_STYLE = {
  padding: "10px 14px",
  fontSize: "12px",
  fontWeight: "700",
  color: DS.t3,
  background: "rgba(255,255,255,0.03)",
  borderBottom: `1px solid ${DS.border}`,
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const TD_BASE = {
  padding: "10px 14px",
  fontSize: "13px",
  color: DS.t2,
  lineHeight: "1.5",
  verticalAlign: "top",
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PlotlyInteractiveViz() {
  const [activeChart, setActiveChart] = useState("Scatter");

  const ChartSVG = CHART_SVG_MAP[activeChart];

  return (
    <div style={ROOT_STYLE}>
      <div style={HEADER_STYLE}>Plotly Express Chart Explorer</div>
      <div style={SUB_STYLE}>Select a chart type to see a static preview and the px.* call that produces it.</div>

      {/* Chart type buttons */}
      <div style={BTN_ROW_STYLE}>
        {CHART_TYPES.map((t) => (
          <button
            key={t}
            style={activeChart === t ? activeBtnStyle : baseBtn}
            onClick={() => setActiveChart(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart preview + code */}
      <div style={CHART_AREA_STYLE}>
        <div style={SVG_WRAP_STYLE}>
          <div style={{ fontSize: "11px", color: DS.t3, marginBottom: "6px", fontWeight: "600" }}>
            {activeChart} preview
          </div>
          <ChartSVG />
        </div>
        <div style={CODE_PANEL_STYLE}>{CHART_CODE[activeChart]}</div>
      </div>

      {/* Description */}
      <div style={DESC_STYLE}>
        <span style={{ fontWeight: "700", color: DS.t1 }}>{activeChart} · </span>
        {CHART_DESC[activeChart]}
      </div>

      {/* px vs go comparison table */}
      <div style={{ fontSize: "14px", fontWeight: "700", color: DS.t1, marginBottom: "10px" }}>
        px (Plotly Express) vs go (Graph Objects)
      </div>
      <div style={TABLE_WRAP_STYLE}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...TH_STYLE, width: "22%" }}>Aspect</th>
              <th style={{ ...TH_STYLE, width: "39%" }}>
                <span style={{ color: ACCENT2 }}>px</span> · Plotly Express
              </th>
              <th style={{ ...TH_STYLE, width: "39%" }}>
                <span style={{ color: ACCENT3 }}>go</span> · Graph Objects
              </th>
            </tr>
          </thead>
          <tbody>
            {PX_GO_ROWS.map((row, i) => (
              <tr key={row.aspect} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <td style={{ ...TD_BASE, fontWeight: "600", color: DS.t1, borderRight: `1px solid ${DS.border}` }}>
                  {row.aspect}
                </td>
                <td style={{ ...TD_BASE, borderRight: `1px solid ${DS.border}` }}>{row.px}</td>
                <td style={TD_BASE}>{row.go}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
