import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component — TDZ safety) ─────────────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";
const CYAN_BORDER = "rgba(6,182,212,0.4)";
const GRN = "#34D399";
const RED = "#F87171";
const ORG = "#F59E0B";
const PANEL_BG = "rgba(2,6,23,0.72)";

const SCENARIOS = {
  warehouse: {
    label: "Data Warehouse Query",
    query: "What were our top 5 products by revenue last quarter?",
    toolName: "query_data_warehouse",
    toolDescription:
      "Execute a read-only SQL query against the company data warehouse (BigQuery). Use for analytical queries on historical sales/revenue/product data. Do NOT use for real-time data.",
    toolCall: `{
  "tool_calls": [{
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "query_data_warehouse",
      "arguments": "{\\"sql\\": \\"SELECT product_name, SUM(revenue) AS total FROM sales WHERE quarter = 'Q3-2025' GROUP BY product_name ORDER BY total DESC LIMIT 5\\"}"
    }
  }]
}`,
    toolResult: `{
  "tool_call_id": "call_abc123",
  "role": "tool",
  "content": {
    "status": "success",
    "row_count": 5,
    "rows": [
      {"product_name": "Aurora Headset", "total": 482190},
      {"product_name": "Pulse Speaker",  "total": 391005},
      {"product_name": "Nimbus Tablet",  "total": 357420},
      {"product_name": "Vertex Laptop",  "total": 298811},
      {"product_name": "Drift Earbuds",  "total": 271640}
    ]
  }
}`,
    finalAnswer:
      "Your top 5 products by Q3-2025 revenue were: Aurora Headset ($482,190), Pulse Speaker ($391,005), Nimbus Tablet ($357,420), Vertex Laptop ($298,811), and Drift Earbuds ($271,640).",
  },
  weather: {
    label: "Real-Time Weather Lookup",
    query: "Should I expect rain in Austin tomorrow afternoon?",
    toolName: "get_weather_forecast",
    toolDescription:
      "Fetch a real-time hourly weather forecast for a given city. Use for current/near-term weather questions. Do NOT use for historical climate data — use get_climate_history instead.",
    toolCall: `{
  "tool_calls": [{
    "id": "call_def456",
    "type": "function",
    "function": {
      "name": "get_weather_forecast",
      "arguments": "{\\"city\\": \\"Austin, TX\\", \\"date\\": \\"tomorrow\\", \\"part_of_day\\": \\"afternoon\\"}"
    }
  }]
}`,
    toolResult: `{
  "tool_call_id": "call_def456",
  "role": "tool",
  "content": {
    "status": "success",
    "city": "Austin, TX",
    "forecast": {
      "precipitation_probability": 72,
      "condition": "Thunderstorms likely",
      "high_f": 81,
      "low_f": 68
    }
  }
}`,
    finalAnswer:
      "Yes — there's a 72% chance of rain in Austin tomorrow afternoon, with thunderstorms likely. Expect a high of 81°F and a low of 68°F, so plan for an umbrella.",
  },
  failure: {
    label: "Failed Lookup (Error Path)",
    query: "What's the current stock level for SKU 'ZX-1029'?",
    toolName: "get_inventory_level",
    toolDescription:
      "Look up current stock quantity for a given SKU from the inventory service. Returns an explicit error if the service is unavailable or the SKU is unknown.",
    toolCall: `{
  "tool_calls": [{
    "id": "call_ghi789",
    "type": "function",
    "function": {
      "name": "get_inventory_level",
      "arguments": "{\\"sku\\": \\"ZX-1029\\"}"
    }
  }]
}`,
    toolResult: `{
  "tool_call_id": "call_ghi789",
  "role": "tool",
  "content": {
    "status": "error",
    "error_code": "SERVICE_UNAVAILABLE",
    "message": "Inventory service is temporarily unavailable.",
    "retry_after_seconds": 30,
    "fallback": "Use cached_inventory_snapshot tool for approximate stock data"
  }
}`,
    finalAnswer:
      "I wasn't able to retrieve live stock for SKU ZX-1029 — the inventory service is temporarily down. I can check a cached snapshot for an approximate count, or you can try again in about 30 seconds. Which would you prefer?",
  },
};

const STEPS = [
  { id: "query", label: "1. User Query" },
  { id: "decide", label: "2. Model Decides to Call a Tool" },
  { id: "call", label: "3. Generated Tool Call (JSON)" },
  { id: "execute", label: "4. App Executes Tool" },
  { id: "result", label: "5. Tool Result Returned" },
  { id: "answer", label: "6. Model's Final Answer" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, color }) {
  return (
    <div
      style={{
        fontFamily: "var(--ds-sans), sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: color || DS.t3,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function CodeBlock({ children, borderColor }) {
  return (
    <pre
      style={{
        margin: 0,
        background: PANEL_BG,
        border: `1px solid ${borderColor || DS.border}`,
        borderRadius: DS.radiusMd,
        padding: "12px 14px",
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 12,
        lineHeight: "19px",
        color: DS.t2,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowX: "auto",
      }}
    >
      {children}
    </pre>
  );
}

function StepRail({ activeIdx, maxRevealed, onStep }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 }}>
      {STEPS.map((s, i) => {
        const unlocked = i <= maxRevealed;
        const active = i === activeIdx;
        return (
          <button
            key={s.id}
            disabled={!unlocked}
            onClick={() => onStep(i)}
            style={{
              textAlign: "left",
              padding: "9px 14px",
              borderRadius: DS.radiusSm,
              border: `1px solid ${active ? CYAN : unlocked ? DS.border : "rgba(255,255,255,0.03)"}`,
              background: active ? CYAN_MID : unlocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.008)",
              color: active ? CYAN : unlocked ? DS.t2 : DS.dim,
              fontFamily: "var(--ds-sans), sans-serif",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: unlocked ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              outline: "none",
              opacity: unlocked ? 1 : 0.5,
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ToolUseViz() {
  const [scenarioId, setScenarioId] = useState("warehouse");
  const [stepIdx, setStepIdx] = useState(0);
  const [maxRevealed, setMaxRevealed] = useState(0);
  const scenario = SCENARIOS[scenarioId];

  function changeScenario(id) {
    setScenarioId(id);
    setStepIdx(0);
    setMaxRevealed(0);
  }

  function goToStep(i) {
    setStepIdx(i);
  }

  function next() {
    const n = Math.min(stepIdx + 1, STEPS.length - 1);
    setStepIdx(n);
    setMaxRevealed((m) => Math.max(m, n));
  }

  function reset() {
    setStepIdx(0);
    setMaxRevealed(0);
  }

  const currentStepId = STEPS[stepIdx].id;
  const isFailure = scenarioId === "failure";

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DS.t1, letterSpacing: "-0.3px" }}>
          Tool Use &amp; Function Calling — Step Through the Loop
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Watch a query travel through the full function-calling cycle, one step at a time.
        </p>
      </div>

      {/* Scenario selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 18 }}>
        {Object.entries(SCENARIOS).map(([id, s]) => {
          const active = id === scenarioId;
          return (
            <button
              key={id}
              onClick={() => changeScenario(id)}
              style={{
                padding: "7px 14px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? (id === "failure" ? RED : CYAN) : DS.border}`,
                background: active ? (id === "failure" ? "rgba(248,113,113,0.16)" : CYAN_DIM) : "rgba(255,255,255,0.02)",
                color: active ? (id === "failure" ? RED : CYAN) : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {/* Step rail */}
        <div style={{ flex: "0 0 220px", minWidth: 200 }}>
          <StepRail activeIdx={stepIdx} maxRevealed={maxRevealed} onStep={goToStep} />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={next}
              disabled={stepIdx === STEPS.length - 1}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: DS.radiusSm,
                border: "none",
                background: stepIdx === STEPS.length - 1 ? "rgba(6,182,212,0.15)" : CYAN,
                color: stepIdx === STEPS.length - 1 ? CYAN : "#020617",
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: stepIdx === STEPS.length - 1 ? "default" : "pointer",
                opacity: stepIdx === STEPS.length - 1 ? 0.6 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {stepIdx === STEPS.length - 1 ? "Complete" : "Next Step →"}
            </button>
            <button
              onClick={reset}
              style={{
                padding: "9px 12px",
                borderRadius: DS.radiusSm,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.02)",
                color: DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: "1 1 360px", minWidth: 300 }}>
          {currentStepId === "query" && (
            <div>
              <SectionLabel color={CYAN}>User Query</SectionLabel>
              <CodeBlock>{`"${scenario.query}"`}</CodeBlock>
            </div>
          )}

          {currentStepId === "decide" && (
            <div>
              <SectionLabel color={CYAN}>Model Decides: Call a Tool</SectionLabel>
              <div
                style={{
                  background: CYAN_DIM,
                  border: `1px solid ${CYAN_BORDER}`,
                  borderRadius: DS.radiusMd,
                  padding: "12px 14px",
                  fontSize: 12.5,
                  color: DS.t2,
                  lineHeight: 1.55,
                  marginBottom: 10,
                }}
              >
                The model reads the available tool definitions and decides this query needs{" "}
                <code style={{ color: CYAN, fontFamily: "var(--ds-mono), monospace" }}>{scenario.toolName}</code> rather
                than a direct text answer.
              </div>
              <SectionLabel>Tool Description the Model Sees</SectionLabel>
              <CodeBlock>{scenario.toolDescription}</CodeBlock>
            </div>
          )}

          {currentStepId === "call" && (
            <div>
              <SectionLabel color={CYAN}>Generated Tool Call</SectionLabel>
              <CodeBlock>{scenario.toolCall}</CodeBlock>
              <div style={{ marginTop: 8, fontSize: 11.5, color: DS.dim, fontStyle: "italic" }}>
                The model never executes this — it only produces the structured description of what should run.
              </div>
            </div>
          )}

          {currentStepId === "execute" && (
            <div>
              <SectionLabel color={ORG}>Application Executes the Tool</SectionLabel>
              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: DS.radiusMd,
                  padding: "14px 16px",
                  fontSize: 13,
                  color: DS.t2,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>{isFailure ? "⚠️" : "⚙️"}</span>
                <span>
                  Your backend receives <code style={{ color: ORG, fontFamily: "var(--ds-mono), monospace" }}>{scenario.toolName}</code>{" "}
                  with the parsed arguments and runs the real function — a database query, API call, or service lookup.
                  {isFailure && " This time, the underlying service call fails."}
                </span>
              </div>
            </div>
          )}

          {currentStepId === "result" && (
            <div>
              <SectionLabel color={isFailure ? RED : GRN}>Tool Result Returned to the Model</SectionLabel>
              <CodeBlock borderColor={isFailure ? "rgba(248,113,113,0.5)" : "rgba(52,211,153,0.4)"}>{scenario.toolResult}</CodeBlock>
              {isFailure && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: DS.t3, fontStyle: "italic" }}>
                  Notice the structured error — explicit error_code, message, retry hint, and a fallback tool suggestion. The model can reason about this instead of hallucinating a result.
                </div>
              )}
            </div>
          )}

          {currentStepId === "answer" && (
            <div>
              <SectionLabel color={GRN}>Model's Final Answer</SectionLabel>
              <div
                style={{
                  background: "rgba(52,211,153,0.07)",
                  border: "1px solid rgba(52,211,153,0.3)",
                  borderRadius: DS.radiusMd,
                  padding: "14px 16px",
                  fontSize: 13.5,
                  color: DS.t1,
                  lineHeight: 1.6,
                }}
              >
                {scenario.finalAnswer}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer summary loop */}
      <div
        style={{
          marginTop: 20,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          fontSize: 11.5,
          color: DS.t3,
          textAlign: "center",
          fontFamily: "var(--ds-mono), monospace",
        }}
      >
        query → decide → call (JSON) → execute → result → answer
      </div>
    </div>
  );
}
