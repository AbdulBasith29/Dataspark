import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const BLUE = "#0EA5E9";
const BLUE_DIM = "rgba(14,165,233,0.15)";
const BLUE_BORDER = "rgba(14,165,233,0.35)";
const PURPLE = "#8B5CF6";
const PURPLE_DIM = "rgba(139,92,246,0.15)";
const PURPLE_BORDER = "rgba(139,92,246,0.35)";
const AMBER = "#F59E0B";
const AMBER_DIM = "rgba(245,158,11,0.15)";
const AMBER_BORDER = "rgba(245,158,11,0.35)";
const RED_C = "#EF4444";
const RED_DIM = "rgba(239,68,68,0.15)";
const RED_BORDER = "rgba(239,68,68,0.35)";
const GREEN = "#34D399";
const GREEN_DIM = "rgba(52,211,153,0.15)";
const GREEN_BORDER = "rgba(52,211,153,0.35)";
const PANEL_BG = "rgba(2,6,23,0.72)";
const CARD_BG = "rgba(255,255,255,0.02)";
const DIM_TEXT = "rgba(255,255,255,0.35)";

// Branch color map
const BRANCH_COLORS = {
  main: GREEN,
  develop: BLUE,
  feature: PURPLE,
  release: AMBER,
  hotfix: RED_C,
  trunk: GREEN,
  flag: BLUE,
};

// ── Workflow tab definitions ──────────────────────────────────────────────────
const WORKFLOWS = [
  {
    id: "github-flow",
    label: "GitHub Flow",
    tagline: "Simple: branch → PR → merge",
  },
  {
    id: "gitflow",
    label: "GitFlow",
    tagline: "Structured: parallel release branches",
  },
  {
    id: "trunk",
    label: "Trunk-Based",
    tagline: "Fast: single trunk + feature flags",
  },
];

// ── Pros/Cons table rows ──────────────────────────────────────────────────────
const TABLE_ROWS = [
  {
    aspect: "Complexity",
    githubFlow: "Low — one rule: branch off main",
    gitflow: "High — strict branch naming & merges",
    trunk: "Medium — requires feature flags & CI",
    recommended: null,
  },
  {
    aspect: "Release cadence",
    githubFlow: "Continuous — merge = deploy",
    gitflow: "Scheduled — release branch cuts",
    trunk: "Continuous / on-demand",
    recommended: null,
  },
  {
    aspect: "Data-team fit",
    githubFlow: "Good for notebooks & small teams",
    gitflow: "Good for versioned model releases",
    trunk: "Best for ML platform / MLOps teams",
    recommended: "trunk",
  },
];

// ── SVG diagram specs ─────────────────────────────────────────────────────────
// Each diagram is fully described as data; the SVG renderer below reads it.
// Rows are numbered 0..N from top. x positions are 0..420 (SVG viewBox width 440).

const GITHUB_FLOW_DIAGRAM = {
  viewBox: "0 0 440 110",
  branches: [
    { id: "main", label: "main", row: 1, color: BRANCH_COLORS.main, x1: 20, x2: 420 },
    {
      id: "feature",
      label: "feature/eda-notebook",
      row: 0,
      color: BRANCH_COLORS.feature,
      x1: 100,
      x2: 320,
    },
  ],
  commits: [
    // main commits
    { id: "m1", branch: "main", row: 1, x: 40, label: "C1" },
    { id: "m2", branch: "main", row: 1, x: 340, label: "PR merge" },
    { id: "m3", branch: "main", row: 1, x: 400, label: "deploy" },
    // feature commits
    { id: "f1", branch: "feature", row: 0, x: 130, label: "WIP" },
    { id: "f2", branch: "feature", row: 0, x: 200, label: "WIP" },
    { id: "f3", branch: "feature", row: 0, x: 280, label: "ready" },
  ],
  connectors: [
    // branch off from main
    { x1: 80, y1: 72, x2: 100, y2: 36 },
    // merge back to main via PR
    { x1: 300, y1: 36, x2: 330, y2: 72 },
  ],
  labels: [
    { x: 85, y: 20, text: "branch off", color: DIM_TEXT },
    { x: 290, y: 20, text: "open PR", color: DIM_TEXT },
    { x: 330, y: 58, text: "merge", color: DIM_TEXT },
  ],
  rowY: [36, 72],
};

const GITFLOW_DIAGRAM = {
  viewBox: "0 0 440 200",
  branches: [
    { id: "main", label: "main", row: 4, color: BRANCH_COLORS.main, x1: 20, x2: 420 },
    { id: "hotfix", label: "hotfix", row: 3, color: BRANCH_COLORS.hotfix, x1: 300, x2: 390 },
    {
      id: "release",
      label: "release/v1.2",
      row: 2,
      color: BRANCH_COLORS.release,
      x1: 230,
      x2: 360,
    },
    { id: "develop", label: "develop", row: 1, color: BRANCH_COLORS.develop, x1: 20, x2: 420 },
    {
      id: "feature",
      label: "feature/model-v2",
      row: 0,
      color: BRANCH_COLORS.feature,
      x1: 60,
      x2: 200,
    },
  ],
  commits: [
    // main
    { id: "mt1", branch: "main", row: 4, x: 40, label: "" },
    { id: "mt2", branch: "main", row: 4, x: 360, label: "v1.2" },
    { id: "mt3", branch: "main", row: 4, x: 400, label: "tag" },
    // hotfix
    { id: "hf1", branch: "hotfix", row: 3, x: 330, label: "" },
    { id: "hf2", branch: "hotfix", row: 3, x: 375, label: "" },
    // release
    { id: "r1", branch: "release", row: 2, x: 260, label: "" },
    { id: "r2", branch: "release", row: 2, x: 310, label: "" },
    { id: "r3", branch: "release", row: 2, x: 350, label: "" },
    // develop
    { id: "d1", branch: "develop", row: 1, x: 40, label: "" },
    { id: "d2", branch: "develop", row: 1, x: 220, label: "merge feat" },
    { id: "d3", branch: "develop", row: 1, x: 380, label: "hotfix" },
    // feature
    { id: "f1", branch: "feature", row: 0, x: 90, label: "" },
    { id: "f2", branch: "feature", row: 0, x: 140, label: "" },
    { id: "f3", branch: "feature", row: 0, x: 190, label: "" },
  ],
  connectors: [
    // feature branches off develop
    { x1: 60, y1: 80, x2: 70, y2: 40 },
    // feature merges into develop
    { x1: 195, y1: 40, x2: 210, y2: 80 },
    // develop → release branch
    { x1: 225, y1: 80, x2: 240, y2: 120 },
    // release → main
    { x1: 355, y1: 120, x2: 360, y2: 160 },
    // hotfix off main
    { x1: 305, y1: 160, x2: 320, y2: 120 },
    // hotfix → main
    { x1: 378, y1: 120, x2: 390, y2: 160 },
    // hotfix → develop
    { x1: 378, y1: 120, x2: 380, y2: 80 },
  ],
  labels: [
    { x: 60, y: 26, text: "branch", color: DIM_TEXT },
    { x: 190, y: 26, text: "merge PR", color: DIM_TEXT },
    { x: 240, y: 108, text: "release cut", color: DIM_TEXT },
    { x: 310, y: 146, text: "hotfix", color: DIM_TEXT },
  ],
  rowY: [40, 80, 120, 120, 160],
};

const TRUNK_DIAGRAM = {
  viewBox: "0 0 440 110",
  branches: [
    { id: "trunk", label: "trunk / main", row: 1, color: BRANCH_COLORS.trunk, x1: 20, x2: 420 },
    {
      id: "flag",
      label: "short-lived branch (< 2 days)",
      row: 0,
      color: BRANCH_COLORS.flag,
      x1: 100,
      x2: 260,
    },
  ],
  commits: [
    { id: "t1", branch: "trunk", row: 1, x: 40, label: "" },
    { id: "t2", branch: "trunk", row: 1, x: 120, label: "" },
    { id: "t3", branch: "trunk", row: 1, x: 280, label: "merge" },
    { id: "t4", branch: "trunk", row: 1, x: 360, label: "" },
    { id: "t5", branch: "trunk", row: 1, x: 410, label: "" },
    { id: "f1", branch: "flag", row: 0, x: 140, label: "" },
    { id: "f2", branch: "flag", row: 0, x: 200, label: "" },
    { id: "f3", branch: "flag", row: 0, x: 250, label: "" },
  ],
  connectors: [
    { x1: 100, y1: 72, x2: 115, y2: 36 },
    { x1: 252, y1: 36, x2: 265, y2: 72 },
  ],
  labels: [
    { x: 60, y: 20, text: "flag: OFF", color: DIM_TEXT },
    { x: 130, y: 20, text: "flag: ON (dev)", color: BLUE },
    { x: 290, y: 20, text: "merge fast", color: DIM_TEXT },
    { x: 330, y: 58, text: "flag: ON (prod)", color: GREEN },
  ],
  rowY: [36, 72],
};

const DIAGRAM_MAP = {
  "github-flow": GITHUB_FLOW_DIAGRAM,
  gitflow: GITFLOW_DIAGRAM,
  trunk: TRUNK_DIAGRAM,
};

// ── Helper: row index → Y coord ───────────────────────────────────────────────
function rowToY(diagram, row) {
  return diagram.rowY[row];
}

// ── Sub-components ────────────────────────────────────────────────────────────
function TabButton({ label, tagline, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? BLUE_DIM : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? BLUE_BORDER : DS.border}`,
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
        textAlign: "left",
        flex: 1,
        minWidth: 0,
        transition: "background 0.18s, border-color 0.18s",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: active ? BLUE : DS.t2,
          letterSpacing: 0.3,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 10, color: active ? "rgba(14,165,233,0.7)" : DS.t3, lineHeight: 1.3 }}>
        {tagline}
      </div>
    </button>
  );
}

function BranchDiagram({ diagram, workflowId }) {
  return (
    <svg
      viewBox={diagram.viewBox}
      style={{ width: "100%", maxWidth: 440, display: "block" }}
      aria-label={`${workflowId} branch diagram`}
    >
      {/* Branch lines */}
      {diagram.branches.map((b) => {
        const y = rowToY(diagram, b.row);
        return (
          <g key={b.id}>
            <line
              x1={b.x1}
              y1={y}
              x2={b.x2}
              y2={y}
              stroke={b.color}
              strokeWidth={2.5}
              strokeOpacity={0.7}
            />
            {/* Branch label badge */}
            <rect
              x={b.x1}
              y={y - 11}
              width={b.label.length * 6.4 + 8}
              height={14}
              rx={4}
              fill={b.color}
              fillOpacity={0.18}
              stroke={b.color}
              strokeOpacity={0.45}
              strokeWidth={1}
            />
            <text
              x={b.x1 + 4}
              y={y + 2}
              fontSize={8}
              fontFamily="var(--ds-mono), monospace"
              fill={b.color}
              fillOpacity={0.95}
            >
              {b.label}
            </text>
          </g>
        );
      })}

      {/* Connector lines (merges / branch-offs) */}
      {diagram.connectors.map((c, i) => (
        <line
          key={i}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}

      {/* Commit dots */}
      {diagram.commits.map((c) => {
        const y = rowToY(diagram, c.row);
        const branch = diagram.branches.find((b) => b.id === c.branch);
        const color = branch ? branch.color : DS.t2;
        return (
          <g key={c.id}>
            <circle cx={c.x} cy={y} r={5} fill={PANEL_BG} stroke={color} strokeWidth={2} />
            {c.label && (
              <text
                x={c.x}
                y={y + 14}
                fontSize={7}
                fontFamily="var(--ds-mono), monospace"
                fill={color}
                fillOpacity={0.8}
                textAnchor="middle"
              >
                {c.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Floating labels */}
      {diagram.labels &&
        diagram.labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            fontSize={8}
            fontFamily="var(--ds-sans), sans-serif"
            fill={l.color}
          >
            {l.text}
          </text>
        ))}
    </svg>
  );
}

function ProsConsTable({ activeWorkflow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 11,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        <thead>
          <tr>
            {["Aspect", "GitHub Flow", "GitFlow", "Trunk-Based"].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "6px 10px",
                  textAlign: "left",
                  color: i === 0 ? DS.t3 : i === 1 && activeWorkflow === "github-flow" ? BLUE : i === 2 && activeWorkflow === "gitflow" ? BLUE : i === 3 && activeWorkflow === "trunk" ? BLUE : DS.t3,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  fontSize: 10,
                  borderBottom: `1px solid ${DS.border}`,
                  background:
                    (i === 1 && activeWorkflow === "github-flow") ||
                    (i === 2 && activeWorkflow === "gitflow") ||
                    (i === 3 && activeWorkflow === "trunk")
                      ? BLUE_DIM
                      : "transparent",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, ri) => (
            <tr key={row.aspect}>
              <td
                style={{
                  padding: "7px 10px",
                  color: DS.t3,
                  fontWeight: 600,
                  borderBottom: ri < TABLE_ROWS.length - 1 ? `1px solid ${DS.border}` : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {row.aspect}
              </td>
              {[
                { wf: "github-flow", text: row.githubFlow },
                { wf: "gitflow", text: row.gitflow },
                { wf: "trunk", text: row.trunk },
              ].map(({ wf, text }, ci) => {
                const isRecommended = row.recommended === wf;
                const isActive = activeWorkflow === wf;
                return (
                  <td
                    key={wf}
                    style={{
                      padding: "7px 10px",
                      color: isRecommended ? GREEN : isActive ? DS.t1 : DS.t2,
                      background: isActive ? BLUE_DIM : isRecommended ? GREEN_DIM : "transparent",
                      borderBottom: ri < TABLE_ROWS.length - 1 ? `1px solid ${DS.border}` : "none",
                      borderLeft: `1px solid ${DS.border}`,
                      fontWeight: isRecommended ? 600 : 400,
                      lineHeight: 1.4,
                    }}
                  >
                    {isRecommended ? "★ " : ""}
                    {text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GitWorkflowViz() {
  const [activeWorkflow, setActiveWorkflow] = useState("github-flow");

  const diagram = DIAGRAM_MAP[activeWorkflow];
  const workflowMeta = WORKFLOWS.find((w) => w.id === activeWorkflow);

  return (
    <div
      style={{
        background: PANEL_BG,
        borderRadius: 14,
        padding: "20px 22px 24px",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: BLUE,
            letterSpacing: 0.3,
            marginBottom: 4,
          }}
        >
          Git Workflows for Data Teams
        </div>
        <div style={{ fontSize: 12, color: DS.t3 }}>
          Select a branching strategy to see the branch diagram and compare tradeoffs
        </div>
      </div>

      {/* Workflow tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {WORKFLOWS.map((wf) => (
          <TabButton
            key={wf.id}
            label={wf.label}
            tagline={wf.tagline}
            active={activeWorkflow === wf.id}
            onClick={() => setActiveWorkflow(wf.id)}
          />
        ))}
      </div>

      {/* Diagram card */}
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: 10,
          padding: "16px 12px 10px",
          marginBottom: 18,
        }}
      >
        {/* Diagram title */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 12,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          {workflowMeta.label} — branch diagram
        </div>

        {/* Branch color legend */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {diagram.branches.map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: b.color,
                  opacity: 0.85,
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: b.color,
                  fontFamily: "var(--ds-mono), monospace",
                  opacity: 0.9,
                }}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* SVG Branch Diagram */}
        <BranchDiagram diagram={diagram} workflowId={activeWorkflow} />
      </div>

      {/* Pros/Cons table */}
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 12px 8px",
            fontSize: 11,
            fontWeight: 700,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            borderBottom: `1px solid ${DS.border}`,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          Workflow Comparison — active column highlighted
        </div>
        <div style={{ padding: "4px 0" }}>
          <ProsConsTable activeWorkflow={activeWorkflow} />
        </div>
        <div
          style={{
            padding: "6px 12px 8px",
            fontSize: 10,
            color: GREEN,
            fontStyle: "italic",
          }}
        >
          ★ = recommended for data teams in that row context
        </div>
      </div>
    </div>
  );
}
