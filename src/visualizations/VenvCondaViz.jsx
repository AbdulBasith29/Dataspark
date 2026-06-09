import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── accent ─────────────────────────────────────────────────────────────────
const GREEN  = DS.grn;
const BLUE   = "#38bdf8";
const PURPLE = "#818cf8";
const YELLOW = "#fbbf24";
const ORANGE = "#f97316";

// ── tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "venv",
    label: "venv",
    color: BLUE,
    tagline: "Built-in stdlib module",
    setupCode: [
      "# create the environment",
      "python -m venv .venv",
      "",
      "# activate (macOS / Linux)",
      "source .venv/bin/activate",
      "",
      "# install dependencies",
      "pip install -r requirements.txt",
    ],
    lockFile: "requirements.txt",
    lockNote: "manual — run `pip freeze > requirements.txt`",
    lockColor: ORANGE,
    facts: [
      { icon: "📦", label: "Manages Python?", value: "No — uses system Python" },
      { icon: "🔒", label: "Lock file",        value: "requirements.txt (manual)" },
      { icon: "🖥", label: "Cross-platform",  value: "Yes (activate script differs)" },
      { icon: "🎯", label: "Best for",         value: "Simple scripts, small projects" },
    ],
  },
  {
    id: "conda",
    label: "conda",
    color: GREEN,
    tagline: "Anaconda / Miniconda",
    setupCode: [
      "# create env with explicit Python version",
      "conda create -n myenv python=3.11",
      "",
      "# activate",
      "conda activate myenv",
      "",
      "# install packages (resolves C deps too)",
      "conda install pandas numpy",
    ],
    lockFile: "environment.yml",
    lockNote: "export with `conda env export > environment.yml`",
    lockColor: GREEN,
    facts: [
      { icon: "📦", label: "Manages Python?", value: "Yes — installs any Python version" },
      { icon: "🔒", label: "Lock file",        value: "environment.yml" },
      { icon: "🖥", label: "Cross-platform",  value: "Yes (conda-forge for binaries)" },
      { icon: "🎯", label: "Best for",         value: "Data science, ML, C dependencies" },
    ],
  },
  {
    id: "poetry",
    label: "poetry",
    color: PURPLE,
    tagline: "Modern dependency manager",
    setupCode: [
      "# scaffold a new project",
      "poetry new myproject",
      "cd myproject",
      "",
      "# add dependencies",
      "poetry add pandas numpy",
      "",
      "# enter the virtual env shell",
      "poetry shell",
    ],
    lockFile: "poetry.lock",
    lockNote: "auto-generated, deterministic, committed to git",
    lockColor: PURPLE,
    facts: [
      { icon: "📦", label: "Manages Python?", value: "No — use pyenv alongside" },
      { icon: "🔒", label: "Lock file",        value: "poetry.lock (auto, deterministic)" },
      { icon: "🖥", label: "Cross-platform",  value: "Yes (pure Python)" },
      { icon: "🎯", label: "Best for",         value: "Libraries, apps, publishing to PyPI" },
    ],
  },
];

// ── comparison table rows ───────────────────────────────────────────────────
const TABLE_ROWS = [
  { tool: "venv",   managesPy: "✗", speed: "Fast",   repro: "Manual",    bestFor: "Simple scripts",    color: BLUE   },
  { tool: "conda",  managesPy: "✓", speed: "Slow",   repro: "Good",      bestFor: "Data science",      color: GREEN  },
  { tool: "poetry", managesPy: "✗", speed: "Medium", repro: "Excellent", bestFor: "Libraries / apps",  color: PURPLE },
];

// ── gotcha text ─────────────────────────────────────────────────────────────
const GOTCHA_CMD_1 = "which python";
const GOTCHA_CMD_2 = "python -c 'import sys; print(sys.prefix)'";

export default function VenvCondaViz() {
  const [activeTool, setActiveTool] = useState("venv");

  const tool = TOOLS.find((t) => t.id === activeTool);

  const tabStyle = (t) => ({
    padding: "7px 18px",
    borderRadius: 8,
    border: `1px solid ${activeTool === t.id ? t.color : DS.border}`,
    background: activeTool === t.id ? `${t.color}22` : "transparent",
    color: activeTool === t.id ? t.color : DS.t3,
    fontSize: 13,
    fontWeight: activeTool === t.id ? 700 : 400,
    fontFamily: "var(--ds-mono), monospace",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s, color 0.15s",
  });

  const cardBase = {
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${DS.border}`,
    borderRadius: 10,
    padding: "12px 14px",
  };

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      {/* header */}
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Python Environment Management — venv vs conda vs poetry
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Pick a tool to see setup commands, lock-file strategy, and key trade-offs.
      </p>

      {/* ── tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TOOLS.map((t) => (
          <button key={t.id} style={tabStyle(t)} onClick={() => setActiveTool(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── tool detail panel ── */}
      <div
        style={{
          border: `1px solid ${tool.color}44`,
          borderRadius: 12,
          padding: 16,
          background: `${tool.color}08`,
          marginBottom: 18,
        }}
      >
        {/* tool name + tagline */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: tool.color, fontFamily: "var(--ds-mono), monospace" }}>
            {tool.label}
          </span>
          <span style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif" }}>
            {tool.tagline}
          </span>
        </div>

        {/* two columns: code block + facts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {/* setup code block */}
          <div>
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, letterSpacing: "0.05em" }}>
              SETUP COMMANDS
            </div>
            <div
              style={{
                background: "rgba(2,6,23,0.72)",
                border: `1px solid ${DS.border}`,
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                lineHeight: 1.8,
                overflowX: "auto",
              }}
            >
              {tool.setupCode.map((line, i) => {
                const isComment = line.startsWith("#");
                const isEmpty   = line === "";
                return (
                  <div key={i} style={{ color: isEmpty ? "transparent" : isComment ? DS.t3 : DS.t1 }}>
                    {isEmpty ? " " : line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* key facts */}
          <div>
            <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, letterSpacing: "0.05em" }}>
              KEY FACTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {tool.facts.map(({ icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${DS.border}`,
                    borderRadius: 7,
                    padding: "7px 10px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* lock file indicator */}
        <div
          style={{
            background: `${tool.lockColor}12`,
            border: `1px solid ${tool.lockColor}44`,
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", letterSpacing: "0.05em" }}>
            LOCK FILE
          </span>
          <code
            style={{
              fontSize: 12,
              fontFamily: "var(--ds-mono), monospace",
              color: tool.lockColor,
              background: `${tool.lockColor}18`,
              border: `1px solid ${tool.lockColor}44`,
              borderRadius: 5,
              padding: "2px 8px",
            }}
          >
            {tool.lockFile}
          </code>
          <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif" }}>
            — {tool.lockNote}
          </span>
        </div>
      </div>

      {/* ── comparison table ── */}
      <div style={{ ...cardBase, marginBottom: 14, overflowX: "auto" }}>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10, letterSpacing: "0.05em" }}>
          COMPARISON TABLE
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Tool", "Manages Python?", "Speed", "Reproducibility", "Best for"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "6px 10px",
                    fontSize: 10,
                    fontFamily: "var(--ds-mono), monospace",
                    color: DS.t3,
                    borderBottom: `1px solid ${DS.border}`,
                    letterSpacing: "0.04em",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row) => {
              const isActive = activeTool === row.tool;
              return (
                <tr
                  key={row.tool}
                  style={{
                    background: isActive ? `${row.color}12` : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onClick={() => setActiveTool(row.tool)}
                >
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--ds-mono), monospace",
                      fontWeight: 700,
                      color: row.color,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.tool}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--ds-mono), monospace",
                      color: row.managesPy === "✓" ? GREEN : DS.t3,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.managesPy}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--ds-sans), sans-serif",
                      color: DS.t2,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.speed}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--ds-sans), sans-serif",
                      color: DS.t2,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.repro}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontFamily: "var(--ds-sans), sans-serif",
                      color: DS.t2,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {row.bestFor}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginTop: 8 }}>
          Click a row to switch tool panel above.
        </div>
      </div>

      {/* ── common gotcha callout ── */}
      <div
        style={{
          border: `1px solid ${YELLOW}66`,
          borderLeft: `3px solid ${YELLOW}`,
          borderRadius: 8,
          padding: "12px 14px",
          background: `${YELLOW}0c`,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: YELLOW, fontFamily: "var(--ds-mono), monospace", marginBottom: 6, letterSpacing: "0.04em" }}>
          COMMON GOTCHA
        </div>
        <p style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.6, margin: 0, marginBottom: 10 }}>
          Never install packages into the system Python — always activate an environment first.
          Confirm you are inside the right env before installing anything:
        </p>
        <div
          style={{
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${DS.border}`,
            borderRadius: 6,
            padding: "8px 12px",
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            color: DS.t1,
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: DS.t3 }}># which interpreter am I using?</span>
          <br />
          <span style={{ color: GREEN }}>{GOTCHA_CMD_1}</span>
          <br />
          <br />
          <span style={{ color: DS.t3 }}># what prefix / virtual env is active?</span>
          <br />
          <span style={{ color: GREEN }}>{GOTCHA_CMD_2}</span>
        </div>
      </div>
    </div>
  );
}
