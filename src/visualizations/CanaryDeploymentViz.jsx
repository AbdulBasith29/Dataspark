import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants (declared before component — TDZ safety) ---

const BLUE = "#0EA5E9";
const AMBER = "#F59E0B";
const GREEN = "#34D399";
const RED = "#F87171";

const PHASE_LABELS = [
  { max: 0,   label: "Shadow Mode — no real traffic",     color: DS.dim },
  { max: 5,   label: "Canary Phase 1 — validating",       color: AMBER },
  { max: 25,  label: "Canary Phase 2 — scaling up",       color: AMBER },
  { max: 99,  label: "Progressive rollout",               color: GREEN },
  { max: 100, label: "Full cutover — v1 retired",         color: BLUE },
];

function getPhase(pct) {
  for (const p of PHASE_LABELS) {
    if (pct <= p.max) return p;
  }
  return PHASE_LABELS[PHASE_LABELS.length - 1];
}

// Simulated metric values that shift as canary pct increases
function getMetrics(pct) {
  // v2 starts similar, becomes measurably better once pct > 20%
  const factor = pct > 20 ? 1 : 0;
  return {
    v1: {
      latency: "142 ms",
      errorRate: "1.8%",
      auc: "0.871",
    },
    v2: {
      latency: factor ? "118 ms" : "141 ms",
      errorRate: factor ? "1.1%" : "1.7%",
      auc: factor ? "0.903" : "0.872",
    },
    v2Better: factor === 1,
  };
}

const METRIC_ROWS = [
  { key: "latency",   label: "Latency p99",  lowerIsBetter: true },
  { key: "errorRate", label: "Error Rate",    lowerIsBetter: true },
  { key: "auc",       label: "AUC",           lowerIsBetter: false },
];

// ---- Styles ----

const ROOT_STYLE = {
  background: DS.bg,
  borderRadius: DS.radiusMd,
  padding: "18px 20px 14px",
  fontFamily: "var(--ds-sans), sans-serif",
  color: DS.t1,
  maxWidth: 560,
  margin: "0 auto",
  minHeight: 320,
  boxSizing: "border-box",
};

const TITLE_STYLE = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: DS.t3,
  marginBottom: 14,
};

const DIAGRAM_WRAP = {
  display: "flex",
  alignItems: "stretch",
  gap: 10,
  marginBottom: 14,
  height: 72,
};

const SOURCE_BOX = {
  background: "rgba(2,6,23,0.72)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 12px",
  fontSize: 11,
  fontWeight: 700,
  color: DS.t2,
  whiteSpace: "nowrap",
  minWidth: 92,
  textAlign: "center",
  letterSpacing: "0.03em",
};

const LANES_WRAP = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

function LaneBar({ label, widthPct, color, minPct }) {
  const displayed = Math.max(widthPct, minPct);
  return (
    <div style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <div style={{
        height: "100%",
        width: `${displayed}%`,
        minWidth: 36,
        background: color,
        borderRadius: 5,
        transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        boxSizing: "border-box",
        overflow: "hidden",
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          whiteSpace: "nowrap",
          fontFamily: "var(--ds-mono), monospace",
        }}>
          {Math.round(widthPct)}%
        </span>
      </div>
      <span style={{ fontSize: 11, color: DS.t3, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

const TABLE_WRAP = {
  background: "rgba(2,6,23,0.72)",
  border: `1px solid ${DS.border}`,
  borderRadius: DS.radiusSm,
  overflow: "hidden",
  marginBottom: 14,
};

const TH_STYLE = {
  fontSize: 11,
  fontWeight: 700,
  color: DS.t3,
  padding: "7px 12px",
  textAlign: "left",
  borderBottom: `1px solid ${DS.border}`,
  background: "rgba(255,255,255,0.025)",
  fontFamily: "var(--ds-mono), monospace",
};

const TD_STYLE = {
  fontSize: 12,
  padding: "7px 12px",
  fontFamily: "var(--ds-mono), monospace",
  borderBottom: `1px solid rgba(255,255,255,0.04)`,
};

const SLIDER_WRAP = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const SLIDER_LABEL = {
  fontSize: 12,
  color: DS.t3,
  fontFamily: "var(--ds-mono), monospace",
};

// ---- Component ----

export default function CanaryDeploymentViz() {
  const [canaryPct, setCanaryPct] = useState(0);

  const v1Pct = 100 - canaryPct;
  const metrics = getMetrics(canaryPct);
  const phase = getPhase(canaryPct);

  return (
    <div style={ROOT_STYLE}>
      <div style={TITLE_STYLE}>Canary Deployment — Traffic Router</div>

      {/* Phase label */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: phase.color,
        marginBottom: 12,
        padding: "5px 10px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 6,
        display: "inline-block",
        letterSpacing: "0.02em",
      }}>
        {phase.label}
      </div>

      {/* Traffic diagram */}
      <div style={DIAGRAM_WRAP}>
        <div style={SOURCE_BOX}>
          Incoming<br />Requests
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          color: DS.dim,
          fontSize: 18,
          padding: "0 2px",
        }}>→</div>
        <div style={LANES_WRAP}>
          <LaneBar
            label="Model v1 (Production)"
            widthPct={v1Pct}
            color={BLUE}
            minPct={canaryPct === 100 ? 0 : 6}
          />
          <LaneBar
            label="Model v2 (Canary)"
            widthPct={canaryPct}
            color={AMBER}
            minPct={canaryPct === 0 ? 0 : 6}
          />
        </div>
      </div>

      {/* Metrics table */}
      <div style={TABLE_WRAP}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH_STYLE}>Metric</th>
              <th style={{ ...TH_STYLE, color: BLUE }}>Model v1</th>
              <th style={{ ...TH_STYLE, color: AMBER }}>Model v2</th>
            </tr>
          </thead>
          <tbody>
            {METRIC_ROWS.map((row) => {
              const v1Val = metrics.v1[row.key];
              const v2Val = metrics.v2[row.key];
              // v2 better means lower for latency/error, higher for auc
              const v2Wins = metrics.v2Better;
              const v2Color = v2Wins
                ? (row.lowerIsBetter ? GREEN : GREEN)
                : DS.t2;
              const v1Color = v2Wins ? DS.dim : DS.t2;
              return (
                <tr key={row.key}>
                  <td style={{ ...TD_STYLE, color: DS.t3 }}>{row.label}</td>
                  <td style={{ ...TD_STYLE, color: v1Color }}>{v1Val}</td>
                  <td style={{ ...TD_STYLE, color: v2Color, fontWeight: v2Wins ? 700 : 400 }}>
                    {v2Val}
                    {v2Wins && (
                      <span style={{ marginLeft: 5, fontSize: 10, color: GREEN }}>↑</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slider */}
      <div style={SLIDER_WRAP}>
        <span style={SLIDER_LABEL}>Canary traffic: <strong style={{ color: AMBER }}>{canaryPct}%</strong></span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={canaryPct}
          onChange={(e) => setCanaryPct(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: AMBER,
            cursor: "pointer",
          }}
        />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: DS.dim,
          fontFamily: "var(--ds-mono), monospace",
        }}>
          <span>0% — Shadow</span>
          <span>50% — Split</span>
          <span>100% — Full cutover</span>
        </div>
      </div>
    </div>
  );
}
