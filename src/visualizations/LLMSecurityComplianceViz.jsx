import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const RED = "#F87171";
const AMBER = "#FBBF24";
const GREEN = "#34D399";

// Pipeline stages where risk enters, each with a toggleable defense.
const DEFENSES = {
  redaction: {
    id: "redaction",
    label: "PII Redaction (input)",
    stage: "input",
    description: "Scrub names, emails, phone numbers, SSNs from user input before it reaches the model or leaves your infrastructure.",
  },
  retention: {
    id: "retention",
    label: "Data Retention Policy",
    stage: "training",
    description: "Opt out of API-provider training on your data; enforce short retention windows and document deletion via DPA.",
  },
  outputFilter: {
    id: "outputFilter",
    label: "Output PII Filtering",
    stage: "output",
    description: "Scan model output with regex + NER before returning it to the user; block or mask any detected PII.",
  },
  accessControl: {
    id: "accessControl",
    label: "Per-User Access Controls",
    stage: "retrieval",
    description: "Namespace the vector DB by user_id and filter retrieval results at query time — never rely on prompt instructions alone.",
  },
};

const DEFENSE_ORDER = ["redaction", "retention", "outputFilter", "accessControl"];

// Pipeline stage metadata, in left-to-right flow order.
const STAGES = [
  {
    id: "input",
    label: "User Input",
    risk: "User pastes a support message containing their full name, email, and account number.",
    defenseId: "redaction",
  },
  {
    id: "training",
    label: "Third-Party API / Training",
    risk: "Raw request is sent to an external LLM API and may be retained or used for model training.",
    defenseId: "retention",
  },
  {
    id: "retrieval",
    label: "RAG Retrieval",
    risk: "Vector DB has no per-user filter — any user's query can retrieve any other user's indexed documents (e.g., HR salary records).",
    defenseId: "accessControl",
  },
  {
    id: "output",
    label: "Model Output",
    risk: "Model hallucinates or reproduces memorized PII (another customer's email/account number) in its response.",
    defenseId: "outputFilter",
  },
];

// Simulated example that updates live as defenses toggle.
const RAW_INPUT = "Hi, this is Jamie Carter (jamie.carter88@gmail.com, acct #4471-2290). My order hasn't shipped — can you check on it?";
const REDACTED_INPUT = "Hi, this is [NAME_REDACTED] ([EMAIL_REDACTED], acct #[ACCOUNT_REDACTED]). My order hasn't shipped — can you check on it?";

const RAW_RETRIEVED_DOC = "Retrieved doc: \"Employee salary review — Jamie Carter, Senior Engineer, $142,000 base, SSN on file: 412-xx-xxxx...\"";
const FILTERED_RETRIEVED_DOC = "Retrieval blocked: no document in requesting user's namespace matches this query. 0 results returned.";

const RAW_OUTPUT = "Thanks Jamie! I can see your order under jamie.carter88@gmail.com, account #4471-2290. It looks like a similar customer, Pat Nguyen (pat.nguyen@email.com), had a similar delay — you can reference ticket #88213 from their case.";
const FILTERED_OUTPUT = "Thanks for reaching out! I can see an order associated with your account — it looks like it's delayed in transit. I've flagged it for expedited review. [2 PII spans masked by output filter]";

// Compliance checklist items — each maps to one or more defenses being active.
const COMPLIANCE_ITEMS = [
  { id: "dpa", label: "Data Processing Agreement (GDPR) covers retention scope", requires: ["retention"] },
  { id: "minimization", label: "Data minimization — only necessary fields leave the input boundary", requires: ["redaction"] },
  { id: "no_train", label: "‘No training’ clause confirmed with API provider", requires: ["retention"] },
  { id: "output_pii", label: "Output PII filter active — no leaked PII reaches the user", requires: ["outputFilter"] },
  { id: "rls", label: "Row/namespace-level access control enforced at retrieval layer", requires: ["accessControl"] },
  { id: "audit", label: "Audit logging on PII detections (input + output)", requires: ["redaction", "outputFilter"] },
];

function StageNode({ stage, isActive, onClick, defenseOn }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 130,
        padding: "12px 10px",
        borderRadius: DS.radiusMd,
        border: `1.5px solid ${isActive ? CYAN : defenseOn ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
        background: isActive ? CYAN_DIM : defenseOn ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.15s ease",
        outline: "none",
        fontFamily: "var(--ds-sans), sans-serif",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: DS.t1, marginBottom: 4 }}>
        {stage.label}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: defenseOn ? GREEN : RED,
        }}
      >
        {defenseOn ? "Protected" : "Exposed"}
      </div>
    </button>
  );
}

export default function LLMSecurityComplianceViz() {
  const [selectedStageId, setSelectedStageId] = useState(STAGES[0].id);
  const [activeDefenses, setActiveDefenses] = useState({
    redaction: false,
    retention: false,
    outputFilter: false,
    accessControl: false,
  });

  const selectedStage = STAGES.find((s) => s.id === selectedStageId);
  const selectedDefense = DEFENSES[selectedStage.defenseId];
  const defenseOnForSelected = activeDefenses[selectedStage.defenseId];

  function toggleDefense(id) {
    setActiveDefenses((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const protectedCount = Object.values(activeDefenses).filter(Boolean).length;
  const totalDefenses = DEFENSE_ORDER.length;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: DS.t1,
            letterSpacing: "-0.3px",
          }}
        >
          LLM Pipeline Security & Compliance Map
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Click a stage to inspect its risk. Toggle defenses and watch the simulated data flow change.
        </p>
      </div>

      {/* Pipeline diagram */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        {STAGES.map((stage) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isActive={stage.id === selectedStageId}
            defenseOn={activeDefenses[stage.defenseId]}
            onClick={() => setSelectedStageId(stage.id)}
          />
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: DS.t3,
          marginBottom: 16,
        }}
      >
        Data flows left → right through the request pipeline
      </div>

      {/* Selected stage risk + defense toggle */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Risk at: {selectedStage.label}
        </div>
        <div style={{ fontSize: 13, color: DS.t2, lineHeight: "20px", marginBottom: 12 }}>
          {selectedStage.risk}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            background: defenseOnForSelected ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${defenseOnForSelected ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
            borderRadius: DS.radiusSm,
            padding: "10px 12px",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.t1 }}>
              {selectedDefense.label}
            </div>
            <div style={{ fontSize: 12, color: DS.t3, marginTop: 2, lineHeight: "16px" }}>
              {selectedDefense.description}
            </div>
          </div>
          <button
            onClick={() => toggleDefense(selectedDefense.id)}
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: 99,
              border: `1.5px solid ${defenseOnForSelected ? GREEN : DS.border}`,
              background: defenseOnForSelected ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.04)",
              color: defenseOnForSelected ? GREEN : DS.t3,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none",
              fontFamily: "var(--ds-sans), sans-serif",
              transition: "all 0.15s ease",
            }}
          >
            {defenseOnForSelected ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Simulated data flow */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          Simulated Request — Live
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>1. User input sent to API</div>
          <div
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 12,
              lineHeight: "18px",
              color: activeDefenses.redaction ? GREEN : RED,
              background: "rgba(2,6,23,0.6)",
              border: `1px solid ${DS.border}`,
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            {activeDefenses.redaction ? REDACTED_INPUT : RAW_INPUT}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>2. RAG retrieval for this query</div>
          <div
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 12,
              lineHeight: "18px",
              color: activeDefenses.accessControl ? GREEN : RED,
              background: "rgba(2,6,23,0.6)",
              border: `1px solid ${DS.border}`,
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            {activeDefenses.accessControl ? FILTERED_RETRIEVED_DOC : RAW_RETRIEVED_DOC}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>3. Model output returned to user</div>
          <div
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 12,
              lineHeight: "18px",
              color: activeDefenses.outputFilter ? GREEN : RED,
              background: "rgba(2,6,23,0.6)",
              border: `1px solid ${DS.border}`,
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            {activeDefenses.outputFilter ? FILTERED_OUTPUT : RAW_OUTPUT}
          </div>
        </div>
      </div>

      {/* Compliance checklist */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: DS.t3,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Compliance Checklist
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: protectedCount === totalDefenses ? GREEN : protectedCount > 0 ? AMBER : RED,
              fontFamily: "var(--ds-mono), monospace",
            }}
          >
            {protectedCount}/{totalDefenses} defenses active
          </div>
        </div>

        {COMPLIANCE_ITEMS.map((item) => {
          const satisfied = item.requires.every((id) => activeDefenses[id]);
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 7,
                fontSize: 13,
                color: satisfied ? DS.t1 : DS.t3,
                lineHeight: "18px",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1.5px solid ${satisfied ? GREEN : DS.border}`,
                  background: satisfied ? "rgba(52,211,153,0.25)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: GREEN,
                  fontWeight: 700,
                }}
              >
                {satisfied ? "✓" : ""}
              </span>
              <span style={{ textDecoration: satisfied ? "none" : "none" }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
