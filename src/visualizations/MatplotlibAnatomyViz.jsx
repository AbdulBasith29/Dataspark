import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const BLUE = "#0EA5E9";
const BLUE_DIM = "rgba(14,165,233,0.18)";
const BLUE_BORDER = "rgba(14,165,233,0.55)";

const PARTS = [
  { id: "figure",  label: "fig",              desc: "Figure — outer boundary",    code: 'fig = plt.figure(figsize=(8, 5), facecolor="#f9f9f9")' },
  { id: "axes",    label: "ax = fig.add_subplot()", desc: "Axes — inner plot area", code: "ax = fig.add_subplot(111)  # or plt.subplots()" },
  { id: "title",   label: "ax.set_title()",   desc: "Title",                      code: 'ax.set_title("Revenue Over Time", fontsize=14, fontweight="bold")' },
  { id: "xlabel",  label: "ax.set_xlabel()",  desc: "X-axis label",               code: 'ax.set_xlabel("Month", fontsize=11)' },
  { id: "ylabel",  label: "ax.set_ylabel()",  desc: "Y-axis label",               code: 'ax.set_ylabel("Revenue ($)", fontsize=11)' },
  { id: "legend",  label: "ax.legend()",      desc: "Legend",                     code: 'ax.legend(loc="upper right", framealpha=0.9)' },
  { id: "ticks",   label: "ax.tick_params()", desc: "Axis ticks",                 code: 'ax.tick_params(axis="both", labelsize=9, direction="out", length=4)' },
  { id: "line",    label: "ax.plot()",        desc: "Data line",                  code: 'ax.plot(x, y, color="#0EA5E9", linewidth=2, label="2024")' },
];

const CODE_STYLE = {
  fontFamily: "var(--ds-mono), monospace",
  fontSize: 13,
  color: BLUE,
  background: "rgba(2,6,23,0.72)",
  border: `1px solid ${BLUE_BORDER}`,
  borderRadius: 8,
  padding: "12px 16px",
  marginTop: 12,
  whiteSpace: "pre",
  overflowX: "auto",
  minHeight: 40,
};

export default function MatplotlibAnatomyViz() {
  const [highlighted, setHighlighted] = useState(null);

  function toggle(id) {
    setHighlighted((prev) => (prev === id ? null : id));
  }

  function isHL(id) {
    return highlighted === id;
  }

  function hlStyle(id, base) {
    return isHL(id)
      ? { ...base, boxShadow: `0 0 0 2px ${BLUE}`, background: BLUE_DIM }
      : base;
  }

  const activePart = PARTS.find((p) => p.id === highlighted);

  // ── diagram dimensions ──────────────────────────────────────────────
  const FIG_W = 320;
  const FIG_H = 220;
  const AX_LEFT = 48;
  const AX_TOP = 32;
  const AX_RIGHT = 44;
  const AX_BOT = 40;
  const AX_W = FIG_W - AX_LEFT - AX_RIGHT;
  const AX_H = FIG_H - AX_TOP - AX_BOT;

  // mock line points (diagonal + bump) — as % of axes
  const linePoints = [
    [0, 0.72], [0.15, 0.55], [0.3, 0.42], [0.45, 0.35],
    [0.6, 0.22], [0.75, 0.18], [1.0, 0.08],
  ]
    .map(([px, py]) => `${AX_LEFT + px * AX_W},${AX_TOP + py * AX_H}`)
    .join(" ");

  // tick positions
  const xTicks = [0, 0.25, 0.5, 0.75, 1.0];
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        color: "#e2e8f0",
        maxWidth: 680,
        margin: "0 auto",
        padding: "20px 16px",
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 4, marginTop: 0 }}>
        Matplotlib Figure Anatomy
      </h3>
      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 0, marginBottom: 16 }}>
        Click any label to highlight that component and see its Python code.
      </p>

      {/* ── main layout: diagram + labels ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── SVG diagram ── */}
        <svg
          width={FIG_W}
          height={FIG_H}
          style={{ flexShrink: 0, borderRadius: 6, overflow: "visible" }}
        >
          {/* Figure background */}
          <rect
            x={0} y={0} width={FIG_W} height={FIG_H}
            rx={6}
            fill={isHL("figure") ? BLUE_DIM : "rgba(15,23,42,0.85)"}
            stroke={isHL("figure") ? BLUE : "rgba(100,116,139,0.5)"}
            strokeWidth={isHL("figure") ? 2.5 : 1.5}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => toggle("figure")}
          />

          {/* Axes background */}
          <rect
            x={AX_LEFT} y={AX_TOP} width={AX_W} height={AX_H}
            fill={isHL("axes") ? "rgba(14,165,233,0.12)" : "rgba(255,255,255,0.03)"}
            stroke={isHL("axes") ? BLUE : "rgba(100,116,139,0.35)"}
            strokeWidth={isHL("axes") ? 2 : 1}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => toggle("axes")}
          />

          {/* Y-axis ticks */}
          {yTicks.map((t, i) => {
            const cy = AX_TOP + t * AX_H;
            return (
              <g key={i}>
                <line
                  x1={AX_LEFT - 5} y1={cy} x2={AX_LEFT} y2={cy}
                  stroke={isHL("ticks") ? BLUE : "#64748b"}
                  strokeWidth={isHL("ticks") ? 2 : 1}
                />
                <text
                  x={AX_LEFT - 8} y={cy + 4}
                  textAnchor="end" fontSize={8}
                  fill={isHL("ticks") ? BLUE : "#64748b"}
                >
                  {Math.round((1 - t) * 100)}
                </text>
              </g>
            );
          })}

          {/* X-axis ticks */}
          {xTicks.map((t, i) => {
            const cx = AX_LEFT + t * AX_W;
            return (
              <g key={i}>
                <line
                  x1={cx} y1={AX_TOP + AX_H} x2={cx} y2={AX_TOP + AX_H + 5}
                  stroke={isHL("ticks") ? BLUE : "#64748b"}
                  strokeWidth={isHL("ticks") ? 2 : 1}
                />
                <text
                  x={cx} y={AX_TOP + AX_H + 14}
                  textAnchor="middle" fontSize={8}
                  fill={isHL("ticks") ? BLUE : "#64748b"}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Ticks invisible hit area */}
          <rect
            x={AX_LEFT - 20} y={AX_TOP} width={20} height={AX_H}
            fill="transparent" style={{ cursor: "pointer" }}
            onClick={() => toggle("ticks")}
          />
          <rect
            x={AX_LEFT} y={AX_TOP + AX_H} width={AX_W} height={20}
            fill="transparent" style={{ cursor: "pointer" }}
            onClick={() => toggle("ticks")}
          />

          {/* Data line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke={isHL("line") ? "#38bdf8" : BLUE}
            strokeWidth={isHL("line") ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: "pointer", transition: "all 0.2s", filter: isHL("line") ? `drop-shadow(0 0 4px ${BLUE})` : "none" }}
            onClick={() => toggle("line")}
          />

          {/* Title */}
          <text
            x={AX_LEFT + AX_W / 2} y={AX_TOP - 10}
            textAnchor="middle" fontSize={10} fontWeight="bold"
            fill={isHL("title") ? BLUE : "#cbd5e1"}
            style={{ cursor: "pointer", transition: "fill 0.2s" }}
            onClick={() => toggle("title")}
          >
            Revenue Over Time
          </text>
          {isHL("title") && (
            <rect
              x={AX_LEFT + AX_W / 2 - 58} y={AX_TOP - 22}
              width={116} height={16} rx={3}
              fill={BLUE_DIM} stroke={BLUE} strokeWidth={1.5}
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* X label */}
          <text
            x={AX_LEFT + AX_W / 2} y={FIG_H - 5}
            textAnchor="middle" fontSize={9}
            fill={isHL("xlabel") ? BLUE : "#94a3b8"}
            style={{ cursor: "pointer", transition: "fill 0.2s" }}
            onClick={() => toggle("xlabel")}
          >
            Month
          </text>

          {/* Y label */}
          <text
            x={10} y={AX_TOP + AX_H / 2}
            textAnchor="middle" fontSize={9}
            fill={isHL("ylabel") ? BLUE : "#94a3b8"}
            transform={`rotate(-90, 10, ${AX_TOP + AX_H / 2})`}
            style={{ cursor: "pointer", transition: "fill 0.2s" }}
            onClick={() => toggle("ylabel")}
          >
            Revenue ($)
          </text>

          {/* Legend box */}
          <rect
            x={AX_LEFT + AX_W - 55} y={AX_TOP + 8}
            width={50} height={22} rx={3}
            fill={isHL("legend") ? BLUE_DIM : "rgba(15,23,42,0.7)"}
            stroke={isHL("legend") ? BLUE : "rgba(100,116,139,0.4)"}
            strokeWidth={isHL("legend") ? 2 : 1}
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onClick={() => toggle("legend")}
          />
          <line
            x1={AX_LEFT + AX_W - 50} y1={AX_TOP + 19}
            x2={AX_LEFT + AX_W - 38} y2={AX_TOP + 19}
            stroke={BLUE} strokeWidth={2}
            style={{ pointerEvents: "none" }}
          />
          <text
            x={AX_LEFT + AX_W - 35} y={AX_TOP + 23}
            fontSize={8} fill="#cbd5e1"
            style={{ pointerEvents: "none" }}
          >
            2024
          </text>
        </svg>

        {/* ── Label buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
          {PARTS.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                background: isHL(p.id) ? BLUE_DIM : "rgba(255,255,255,0.04)",
                border: `1px solid ${isHL(p.id) ? BLUE : "rgba(100,116,139,0.3)"}`,
                borderRadius: 6,
                padding: "5px 10px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  color: isHL(p.id) ? BLUE : "#94a3b8",
                  fontWeight: isHL(p.id) ? 700 : 400,
                }}
              >
                {p.label}
              </span>
              <span style={{ fontSize: 10, color: "#64748b", marginLeft: 6 }}>
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Code panel ── */}
      <div style={CODE_STYLE}>
        {activePart
          ? activePart.code
          : "# Click a label above to see its Python code"}
      </div>
    </div>
  );
}
