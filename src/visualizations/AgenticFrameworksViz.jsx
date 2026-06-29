import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants (declared before component — TDZ safety) ─────────────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";
const CYAN_BORDER = "rgba(6,182,212,0.4)";
const GRN = "#34D399";
const PURPLE = "#818CF8";
const ORG = "#F59E0B";
const PANEL_BG = "rgba(2,6,23,0.72)";

const FRAMEWORKS = [
  { id: "langgraph", label: "LangGraph", color: CYAN },
  { id: "autogen", label: "AutoGen", color: PURPLE },
  { id: "crewai", label: "CrewAI", color: ORG },
];

const LANGGRAPH_NODES = [
  { id: "planner", label: "planner", x: 50, y: 0 },
  { id: "executor", label: "executor", x: 50, y: 1 },
  { id: "reviewer", label: "reviewer", x: 50, y: 2 },
];

const FRAMEWORK_DATA = {
  langgraph: {
    mentalModel: "Explicit state graph — nodes are functions, edges are (conditional) transitions, a typed state dict flows through every node.",
    flowSteps: [
      { label: "StateGraph(AgentState)", detail: "A typed dict is declared up front — every node reads and writes this shared state." },
      { label: "planner node", detail: "Decides the next action given current state. Writes {next_action, plan} back to state." },
      { label: "executor node", detail: "Executes the planned tool/action. Writes {last_result} to state. Can pause here via interrupt_before for human approval." },
      { label: "reviewer node", detail: "Inspects the result. A conditional edge (route_after_review) decides: loop back to planner, or proceed to END." },
      { label: "conditional edge → planner or END", detail: "This is the cyclic part — LangGraph graphs can loop indefinitely until a condition is met, unlike a fixed linear chain." },
    ],
    code: `builder = StateGraph(AgentState)
builder.add_node("planner", planner_node)
builder.add_node("executor", executor_node)
builder.add_node("reviewer", reviewer_node)
builder.add_conditional_edges(
    "reviewer", route_after_review,
    {"retry": "planner", "done": END}
)
graph = builder.compile(checkpointer=memory)`,
    whenToUse: [
      "Workflows need loops, branching, or dynamic re-routing (not a fixed pipeline)",
      "You need durable checkpointing so long-running jobs can resume after a crash",
      "Human-in-loop approval must pause execution at a specific node",
    ],
    avoid: "Avoid for simple one-shot tasks — graph thinking adds design overhead with no payoff if there's no looping or branching.",
  },
  autogen: {
    mentalModel: "Conversable multi-agent chat — agents are participants in a conversation; an AssistantAgent reasons, a UserProxyAgent executes code/tools, and a GroupChatManager picks who speaks next.",
    flowSteps: [
      { label: "user_proxy.initiate_chat(assistant, message)", detail: "The conversation begins — UserProxyAgent sends the task as the first message." },
      { label: "AssistantAgent reasons", detail: "The LLM-backed agent replies with analysis, code, or a request for the proxy to execute something." },
      { label: "UserProxyAgent executes", detail: "Runs code, calls tools, or proxies a human — then posts the result back into the same conversation thread." },
      { label: "(optional) GroupChatManager", detail: "With more than 2 agents, an LLM-based manager decides which agent speaks next based on conversation context — adds flexibility and latency." },
      { label: "Loop until termination phrase", detail: "The conversation continues turn-by-turn until a termination condition (e.g. 'TERMINATE') appears in a message." },
    ],
    code: `assistant = AssistantAgent(
    name="DataAnalyst",
    system_message="You are an expert data analyst...",
    llm_config={"model": "gpt-4o"}
)
user_proxy = UserProxyAgent(
    name="Executor", human_input_mode="NEVER",
    code_execution_config={"work_dir": "/tmp"}
)
user_proxy.initiate_chat(assistant,
    message="Analyze sales_data.csv, find top 5 products")`,
    whenToUse: [
      "Tasks benefit from agent-to-agent dialogue — code generation + execution + critique loops",
      "Research-style tasks where agents need to converse and iterate naturally",
      "You want a quick way to bolt code execution onto an LLM's reasoning",
    ],
    avoid: "Avoid when you need strict, auditable control flow — GroupChat's LLM-based speaker selection is non-deterministic.",
  },
  crewai: {
    mentalModel: "Role-based crew — each agent has a role, goal, and backstory; tasks are assigned to agents and executed via a defined process (sequential or hierarchical).",
    flowSteps: [
      { label: "Define Agents with role/goal/backstory", detail: "researcher = Agent(role='Senior Data Researcher', goal='...', tools=[...]) — agents are defined like job descriptions." },
      { label: "Define Tasks, assign to Agents", detail: "Each Task names a description, an assigned agent, and optionally context=[other_task] to receive a prior task's output." },
      { label: "Crew(agents, tasks, process=...)", detail: "Process.sequential runs tasks in order, each receiving the previous output. Process.hierarchical adds a manager agent that delegates and synthesizes." },
      { label: "crew.kickoff()", detail: "Execution begins — the researcher task runs first, its output flows into context for the analyst task." },
      { label: "Final synthesized output", detail: "The last task's output (or the hierarchical manager's synthesis) is returned as the crew's result." },
    ],
    code: `researcher = Agent(role="Senior Data Researcher",
    goal="Find comprehensive information",
    backstory="Expert at synthesizing sources",
    tools=[search_tool])
analyst = Agent(role="Data Analyst", goal="...")

research_task = Task(description="Research...", agent=researcher)
analysis_task = Task(description="Analyze...", agent=analyst,
    context=[research_task])

crew = Crew(agents=[researcher, analyst],
    tasks=[research_task, analysis_task],
    process=Process.sequential)`,
    whenToUse: [
      "Business process automation with clearly separable specialist roles",
      "Rapid prototyping of a multi-agent workflow — roles read like a team org chart",
      "Hierarchical delegation where a manager agent breaks down and assigns work",
    ],
    avoid: "Avoid for workflows needing tight loops, conditional re-routing, or fine-grained state control — CrewAI's process model is comparatively rigid.",
  },
};

const COMPARISON_ROWS = [
  { label: "Mental model", langgraph: "Stateful graph (nodes + edges)", autogen: "Multi-agent conversation", crewai: "Role-based crew + tasks" },
  { label: "Topology", langgraph: "Cyclic — loops & branches", autogen: "Conversational turns", crewai: "Sequential or hierarchical" },
  { label: "State mgmt", langgraph: "Typed dict + checkpointing", autogen: "Conversation history", crewai: "Task context passing" },
  { label: "Human-in-loop", langgraph: "First-class (interrupt_before)", autogen: "human_input_mode flag", crewai: "Limited" },
  { label: "Best for", langgraph: "Complex stateful workflows", autogen: "Conversational/code tasks", crewai: "Business task delegation" },
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
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function LangGraphDiagram({ activeStep }) {
  // activeStep: -1 idle, 0..4 highlighting relevant nodes/edges
  const nodeActive = (id) => {
    if (activeStep === 1 && id === "planner") return true;
    if (activeStep === 2 && id === "executor") return true;
    if (activeStep === 3 && id === "reviewer") return true;
    if (activeStep === 4 && id === "planner") return true;
    return false;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0" }}>
      {LANGGRAPH_NODES.map((n, i) => (
        <div key={n.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              padding: "9px 22px",
              borderRadius: DS.radiusSm,
              border: `1.5px solid ${nodeActive(n.id) ? CYAN : DS.border}`,
              background: nodeActive(n.id) ? CYAN_MID : "rgba(255,255,255,0.03)",
              color: nodeActive(n.id) ? CYAN : DS.t2,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: nodeActive(n.id) ? `0 0 14px rgba(6,182,212,0.35)` : "none",
              transition: "all 0.3s ease",
            }}
          >
            {n.label}
          </div>
          {i < LANGGRAPH_NODES.length - 1 && (
            <div style={{ color: activeStep >= 2 + i ? CYAN : DS.dim, fontSize: 16, transition: "color 0.3s ease" }}>↓</div>
          )}
        </div>
      ))}
      <div
        style={{
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: activeStep === 4 ? ORG : DS.dim,
          fontSize: 11,
          fontFamily: "var(--ds-mono), monospace",
          transition: "color 0.3s ease",
        }}
      >
        <span>↺ retry → planner</span>
        <span style={{ color: DS.dim }}>|</span>
        <span>done → END</span>
      </div>
    </div>
  );
}

function AutogenDiagram({ activeStep }) {
  const proxyActive = activeStep === 0 || activeStep === 2;
  const assistantActive = activeStep === 1;
  const managerActive = activeStep === 3;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "14px 0" }}>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "50%",
            border: `1.5px solid ${proxyActive ? PURPLE : DS.border}`,
            background: proxyActive ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.03)",
            color: proxyActive ? PURPLE : DS.t2,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            width: 84,
            height: 84,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: proxyActive ? `0 0 14px rgba(129,140,248,0.35)` : "none",
            transition: "all 0.3s ease",
          }}
        >
          UserProxy
        </div>
        <div style={{ color: activeStep >= 0 ? PURPLE : DS.dim, fontSize: 20, transition: "color 0.3s ease" }}>⇄</div>
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "50%",
            border: `1.5px solid ${assistantActive ? PURPLE : DS.border}`,
            background: assistantActive ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.03)",
            color: assistantActive ? PURPLE : DS.t2,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            width: 84,
            height: 84,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: assistantActive ? `0 0 14px rgba(129,140,248,0.35)` : "none",
            transition: "all 0.3s ease",
          }}
        >
          Assistant
        </div>
      </div>
      <div
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: `1px solid ${managerActive ? ORG : DS.border}`,
          background: managerActive ? "rgba(245,158,11,0.14)" : "rgba(255,255,255,0.02)",
          color: managerActive ? ORG : DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 11,
          transition: "all 0.3s ease",
        }}
      >
        GroupChatManager picks next speaker
      </div>
    </div>
  );
}

function CrewDiagram({ activeStep }) {
  const researcherActive = activeStep === 0 || activeStep === 1;
  const analystActive = activeStep === 1 || activeStep === 2;
  const crewActive = activeStep === 2 || activeStep === 3;
  const outputActive = activeStep === 4;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "12px 0" }}>
      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            padding: "8px 14px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${researcherActive ? ORG : DS.border}`,
            background: researcherActive ? "rgba(245,158,11,0.16)" : "rgba(255,255,255,0.03)",
            color: researcherActive ? ORG : DS.t2,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            fontWeight: 600,
            boxShadow: researcherActive ? `0 0 14px rgba(245,158,11,0.3)` : "none",
            transition: "all 0.3s ease",
          }}
        >
          Researcher
        </div>
        <div style={{ display: "flex", alignItems: "center", color: analystActive ? ORG : DS.dim, fontSize: 16 }}>→</div>
        <div
          style={{
            padding: "8px 14px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${analystActive ? ORG : DS.border}`,
            background: analystActive ? "rgba(245,158,11,0.16)" : "rgba(255,255,255,0.03)",
            color: analystActive ? ORG : DS.t2,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            fontWeight: 600,
            boxShadow: analystActive ? `0 0 14px rgba(245,158,11,0.3)` : "none",
            transition: "all 0.3s ease",
          }}
        >
          Analyst
        </div>
      </div>
      <div style={{ color: crewActive ? ORG : DS.dim, fontSize: 16, transition: "color 0.3s ease" }}>↓</div>
      <div
        style={{
          padding: "8px 16px",
          borderRadius: DS.radiusSm,
          border: `1.5px solid ${crewActive ? ORG : DS.border}`,
          background: crewActive ? "rgba(245,158,11,0.16)" : "rgba(255,255,255,0.03)",
          color: crewActive ? ORG : DS.t2,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          fontWeight: 600,
          transition: "all 0.3s ease",
        }}
      >
        Crew(process=sequential)
      </div>
      <div style={{ color: outputActive ? GRN : DS.dim, fontSize: 16, transition: "color 0.3s ease" }}>↓</div>
      <div
        style={{
          padding: "7px 14px",
          borderRadius: DS.radiusSm,
          border: `1.5px solid ${outputActive ? GRN : DS.border}`,
          background: outputActive ? "rgba(52,211,153,0.14)" : "rgba(255,255,255,0.03)",
          color: outputActive ? GRN : DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 11.5,
          transition: "all 0.3s ease",
        }}
      >
        Final synthesized output
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function AgenticFrameworksViz() {
  const [selected, setSelected] = useState("langgraph");
  const [activeStep, setActiveStep] = useState(-1);
  const data = FRAMEWORK_DATA[selected];
  const fw = FRAMEWORKS.find((f) => f.id === selected);

  function selectFramework(id) {
    setSelected(id);
    setActiveStep(-1);
  }

  function stepThrough(i) {
    setActiveStep(i);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      {/* Header */}
      <div style={{ marginBottom: 18, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DS.t1, letterSpacing: "-0.3px" }}>
          Agentic Framework Mental Models
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Same goal — three different architectures for getting there. Click a framework, then step through its flow.
        </p>
      </div>

      {/* Framework tabs */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
        {FRAMEWORKS.map((f) => {
          const active = f.id === selected;
          return (
            <button
              key={f.id}
              onClick={() => selectFramework(f.id)}
              style={{
                padding: "9px 18px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? f.color : DS.border}`,
                background: active ? `${f.color}22` : "rgba(255,255,255,0.02)",
                color: active ? f.color : DS.t3,
                fontFamily: "var(--ds-sans), sans-serif",
                fontSize: 13.5,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Mental model description */}
      <div
        style={{
          background: `${fw.color}14`,
          border: `1px solid ${fw.color}44`,
          borderRadius: DS.radiusMd,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: DS.t2,
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: fw.color, fontWeight: 600 }}>{data.mentalModel}</span>
      </div>

      {/* Diagram panel */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusLg,
          padding: "16px 18px",
          marginBottom: 16,
        }}
      >
        <SectionLabel color={fw.color}>Architecture — click a step below to animate</SectionLabel>
        {selected === "langgraph" && <LangGraphDiagram activeStep={activeStep} />}
        {selected === "autogen" && <AutogenDiagram activeStep={activeStep} />}
        {selected === "crewai" && <CrewDiagram activeStep={activeStep} />}
      </div>

      {/* Step list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {data.flowSteps.map((step, i) => {
          const active = activeStep === i;
          return (
            <button
              key={i}
              onClick={() => stepThrough(i)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: DS.radiusSm,
                border: `1px solid ${active ? fw.color : DS.border}`,
                background: active ? `${fw.color}14` : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 11,
                    color: active ? fw.color : DS.dim,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}.
                </span>
                <span
                  style={{
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 12.5,
                    color: active ? fw.color : DS.t2,
                    fontWeight: 600,
                  }}
                >
                  {step.label}
                </span>
              </div>
              {active && (
                <div style={{ marginTop: 6, fontSize: 12.5, color: DS.t2, lineHeight: 1.5, paddingLeft: 20 }}>
                  {step.detail}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Code snippet */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel color={fw.color}>Representative Code</SectionLabel>
        <pre
          style={{
            margin: 0,
            background: PANEL_BG,
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd,
            padding: "14px 16px",
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 12,
            lineHeight: "19px",
            color: DS.t2,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowX: "auto",
          }}
        >
          {data.code}
        </pre>
      </div>

      {/* When to use / avoid */}
      <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            background: "rgba(52,211,153,0.07)",
            border: "1px solid rgba(52,211,153,0.22)",
            borderRadius: DS.radiusMd,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: GRN,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            When to use {fw.label}
          </div>
          {data.whenToUse.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, fontSize: 12.5, color: DS.t2, lineHeight: "18px" }}>
              <span style={{ color: GRN, flexShrink: 0 }}>✓</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "rgba(248,113,113,0.07)",
            border: "1px solid rgba(248,113,113,0.22)",
            borderRadius: DS.radiusMd,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#F87171",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Avoid when
          </div>
          <div style={{ fontSize: 12.5, color: DS.t2, lineHeight: 1.55 }}>{data.avoid}</div>
        </div>
      </div>

      {/* Comparison table */}
      <div>
        <SectionLabel color={CYAN}>Quick Comparison</SectionLabel>
        <div
          style={{
            background: PANEL_BG,
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10.5, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${DS.border}` }}> </th>
                {FRAMEWORKS.map((f) => (
                  <th
                    key={f.id}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      color: selected === f.id ? f.color : DS.t3,
                      fontWeight: 700,
                      borderBottom: `1px solid ${DS.border}`,
                    }}
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)" }}>
                  <td style={{ padding: "8px 12px", fontSize: 11.5, color: DS.t3, borderBottom: `1px solid ${DS.border}`, fontWeight: 600 }}>
                    {row.label}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 11.5, color: selected === "langgraph" ? DS.t1 : DS.t2, borderBottom: `1px solid ${DS.border}` }}>
                    {row.langgraph}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 11.5, color: selected === "autogen" ? DS.t1 : DS.t2, borderBottom: `1px solid ${DS.border}` }}>
                    {row.autogen}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 11.5, color: selected === "crewai" ? DS.t1 : DS.t2, borderBottom: `1px solid ${DS.border}` }}>
                    {row.crewai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
