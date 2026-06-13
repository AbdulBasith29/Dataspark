import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Accent palette ────────────────────────────────────────────────────────────
const BLUE = "#0EA5E9";
const GREEN = "#34D399";
const PURPLE = "#8B5CF6";
const AMBER = "#F59E0B";

// ── 7 Dashboard Principles ────────────────────────────────────────────────────
const PRINCIPLES = [
  { icon: "①", title: "One insight per chart", desc: "Each viz answers exactly one question." },
  { icon: "②", title: "KPIs above fold", desc: "Critical numbers visible without scrolling." },
  { icon: "③", title: "Max 5–6 colors", desc: "More colors = visual noise, not clarity." },
  { icon: "④", title: "No 3D or dual-axis", desc: "Distorts perception; kills trust in data." },
  { icon: "⑤", title: "Label axes + units", desc: "Never make readers guess what '$' means." },
  { icon: "⑥", title: "Consistent time grain", desc: "Mix of daily/monthly in one chart confuses." },
  { icon: "⑦", title: "Progressive disclosure", desc: "Summary first, detail on click/hover." },
];

// ── Simple SVG trend polyline data ────────────────────────────────────────────
const TREND_POINTS = "10,70 50,55 90,60 130,40 170,45 210,28 250,32 290,18";

// ── Bar chart data ────────────────────────────────────────────────────────────
const BAR_DATA = [
  { label: "Q1", value: 62 },
  { label: "Q2", value: 78 },
  { label: "Q3", value: 55 },
  { label: "Q4", value: 91 },
];

// ── Bad design tile config ────────────────────────────────────────────────────
const BAD_TILES = [
  { bg: "#dc2626", label: "3D PIE CHART!!!", sub: "Q4 Revenue" },
  { bg: "#ea580c", label: "ANIMATED DONUT", sub: "Retention %" },
  { bg: "#db2777", label: "SPARKLINES ×12", sub: "All Metrics" },
  { bg: "#0891b2", label: "WORD CLOUD", sub: "User Feedback" },
  { bg: "#92400e", label: "HEAT MAP", sub: "Click Patterns" },
  { bg: "#65a30d", label: "BUBBLE MATRIX", sub: "Segment Mix" },
];

// ── Table rows ────────────────────────────────────────────────────────────────
const TABLE_ROWS = [
  { segment: "Enterprise", rev: "$1.2M", churn: "2.1%" },
  { segment: "SMB", rev: "$840K", churn: "5.4%" },
  { segment: "Startup", rev: "$310K", churn: "9.8%" },
];

export default function DashboardDesignViz() {
  const [mode, setMode] = useState("bad"); // "bad" | "good"

  const isBad = mode === "bad";

  // ── shared container style ──────────────────────────────────────────────────
  const containerStyle = {
    fontFamily: "var(--ds-sans), sans-serif",
    background: DS.bg,
    color: DS.t1,
    padding: "20px",
    borderRadius: DS.radiusMd,
    minHeight: 480,
  };

  const toggleRowStyle = {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  };

  const btnStyle = (active, color) => ({
    padding: "8px 20px",
    borderRadius: 8,
    border: `1px solid ${active ? color : DS.border}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : DS.t3,
    fontFamily: "var(--ds-sans), sans-serif",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: "pointer",
    transition: "all 0.18s ease",
  });

  // ── label above mockup ──────────────────────────────────────────────────────
  const mockupLabelStyle = (color) => ({
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color,
    marginBottom: 8,
  });

  // ── Bad mockup ──────────────────────────────────────────────────────────────
  const BadMockup = () => (
    <div>
      <div style={mockupLabelStyle("#f87171")}>
        ✗ Bad Design — Chart Junk &amp; No Hierarchy
      </div>
      <div
        style={{
          border: "1px solid #f8717144",
          borderRadius: 10,
          padding: 8,
          background: "rgba(248,113,113,0.04)",
          minHeight: 340,
        }}
      >
        {/* Chartjunk warning badge */}
        <div
          style={{
            display: "inline-block",
            background: "#dc2626",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 4,
            marginBottom: 8,
            letterSpacing: "0.06em",
          }}
        >
          ⚠ CHARTJUNK DETECTED
        </div>

        {/* 6 cramped tiles */}
        <div className="ds-g3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 4,
          }}
        >
          {BAD_TILES.map((tile) => (
            <div
              key={tile.label}
              style={{
                background: tile.bg,
                borderRadius: 6,
                padding: "10px 8px",
                minHeight: 88,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "var(--ds-mono), monospace",
                  marginBottom: 4,
                  lineHeight: 1.2,
                }}
              >
                {tile.label}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>
                {tile.sub}
              </div>
              {/* fake 3D circle decoration */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  marginTop: 6,
                  boxShadow: "4px 4px 0 rgba(0,0,0,0.25)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Random color legend mess */}
        <div
          style={{
            marginTop: 6,
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ffff00", "#00ffff", "#ff8800", "#8800ff"].map(
            (c) => (
              <div
                key={c}
                style={{
                  width: 14,
                  height: 14,
                  background: c,
                  borderRadius: 2,
                }}
              />
            )
          )}
          <span style={{ fontSize: 9, color: DS.t3, alignSelf: "center" }}>
            ← 8-color legend with no labels
          </span>
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 9,
            color: "#f87171",
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          * All charts auto-refresh every 2s • Dual Y-axis on every panel • No
          axis labels
        </div>
      </div>
    </div>
  );

  // ── Good mockup ─────────────────────────────────────────────────────────────
  const GoodMockup = () => (
    <div>
      <div style={mockupLabelStyle(GREEN)}>
        ✓ Good Design — Hierarchy, Whitespace, Clarity
      </div>
      <div
        style={{
          border: `1px solid ${GREEN}44`,
          borderRadius: 10,
          padding: 14,
          background: "rgba(52,211,153,0.03)",
          minHeight: 340,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Section title */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: DS.t3,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Q4 Business Overview
        </div>

        {/* KPI row */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Total Revenue", value: "$2.35M", delta: "+12%", color: BLUE },
            { label: "Active Users", value: "48,200", delta: "+7%", color: GREEN },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                flex: 1,
                background: `${kpi.color}11`,
                border: `1px solid ${kpi.color}33`,
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: 10, color: DS.t3, marginBottom: 4 }}>
                {kpi.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: DS.t1,
                  lineHeight: 1,
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{ fontSize: 11, color: kpi.color, marginTop: 4, fontWeight: 600 }}
              >
                {kpi.delta} vs Q3
              </div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div
          style={{
            background: `${BLUE}0a`,
            border: `1px solid ${BLUE}22`,
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <div style={{ fontSize: 10, color: DS.t3, marginBottom: 6 }}>
            Revenue trend (Jan–Aug) · $K
          </div>
          <svg
            viewBox="0 0 300 80"
            style={{ width: "100%", height: 70, display: "block" }}
          >
            {/* Grid lines */}
            {[20, 40, 60].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="300"
                y2={y}
                stroke={DS.border}
                strokeWidth="0.8"
              />
            ))}
            {/* Area fill */}
            <polyline
              points={`10,80 ${TREND_POINTS} 290,80`}
              fill={`${BLUE}18`}
              stroke="none"
            />
            {/* Line */}
            <polyline
              points={TREND_POINTS}
              fill="none"
              stroke={BLUE}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {TREND_POINTS.split(" ").map((pt) => {
              const [x, y] = pt.split(",");
              return (
                <circle
                  key={pt}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={BLUE}
                  stroke={DS.bg}
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Bar + Table row */}
        <div style={{ display: "flex", gap: 12 }}>
          {/* Bar chart */}
          <div
            style={{
              flex: 1,
              background: `${GREEN}0a`,
              border: `1px solid ${GREEN}22`,
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 10, color: DS.t3, marginBottom: 8 }}>
              Quarterly revenue · $K
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: 52,
              }}
            >
              {BAR_DATA.map((bar) => (
                <div
                  key={bar.label}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${bar.value}%`,
                      background: `${GREEN}88`,
                      border: `1px solid ${GREEN}`,
                      borderRadius: "3px 3px 0 0",
                      minHeight: 8,
                    }}
                  />
                  <div style={{ fontSize: 9, color: DS.t3 }}>{bar.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: 10, color: DS.t3, marginBottom: 6 }}>
              Segment breakdown
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Segment", "Rev", "Churn"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        color: DS.t3,
                        textAlign: "left",
                        paddingBottom: 4,
                        fontWeight: 600,
                        borderBottom: `1px solid ${DS.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.segment}>
                    <td style={{ fontSize: 10, color: DS.t2, padding: "4px 0" }}>
                      {row.segment}
                    </td>
                    <td style={{ fontSize: 10, color: GREEN, padding: "4px 0" }}>
                      {row.rev}
                    </td>
                    <td style={{ fontSize: 10, color: AMBER, padding: "4px 0" }}>
                      {row.churn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: DS.t1,
            marginBottom: 4,
          }}
        >
          Dashboard Design Principles
        </div>
        <div style={{ fontSize: 12, color: DS.t3 }}>
          Compare a cluttered dashboard against a well-structured one — then review the 7 core principles.
        </div>
      </div>

      {/* Toggle */}
      <div style={toggleRowStyle}>
        <button
          style={btnStyle(isBad, "#f87171")}
          onClick={() => setMode("bad")}
        >
          Bad Design ✗
        </button>
        <button
          style={btnStyle(!isBad, GREEN)}
          onClick={() => setMode("good")}
        >
          Good Design ✓
        </button>
      </div>

      {/* Mockup */}
      {isBad ? <BadMockup /> : <GoodMockup />}

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: DS.border,
          margin: "20px 0 16px",
        }}
      />

      {/* 7 Principles grid */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: DS.t3,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        7 Dashboard Design Principles
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        {PRINCIPLES.map((p) => (
          <div
            key={p.title}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${DS.border}`,
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: BLUE,
                marginBottom: 3,
              }}
            >
              {p.icon} {p.title}
            </div>
            <div style={{ fontSize: 11, color: DS.t3, lineHeight: 1.4 }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
