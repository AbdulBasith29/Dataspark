import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";
import useReducedMotion from "../lib/use-reduced-motion.js";

// ─── Scenarios for Tab 1 ──────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: "feature_store",
    className: "FeatureStoreClient",
    params: [
      { name: "host", type: "str", options: ['"redis://localhost"', '"redis://prod-cluster"', '"redis://staging"'] },
      { name: "ttl_seconds", type: "int", options: ["300", "3600", "86400"] },
      { name: "max_connections", type: "int", options: ["5", "20", "100"] },
    ],
    lines: [
      { code: (v) => `    self.host = ${v.host}`, type: "assign", label: "Pure assignment — stores value for later use" },
      { code: (v) => `    self.ttl = ${v.ttl_seconds}`, type: "assign", label: "Pure assignment — no side effects" },
      { code: (v) => `    self._pool = None  # lazy`, type: "assign", label: "Deferred init — pool created in connect()" },
      { code: (v) => `    self._max = ${v.max_connections}`, type: "assign", label: "Config stored, not yet applied" },
      { code: (v) => `    self._metrics = {}`, type: "assign", label: "Mutable state init — safe, no I/O" },
    ],
  },
  {
    id: "etl_job",
    className: "ETLJob",
    params: [
      { name: "source", type: "str", options: ['"s3://raw/events"', '"gs://data-lake/raw"', '"local://data/raw"'] },
      { name: "batch_size", type: "int", options: ["1000", "10000", "100000"] },
      { name: "dry_run", type: "bool", options: ["True", "False"] },
    ],
    lines: [
      { code: (v) => `    self.source = ${v.source}`, type: "assign", label: "Pure assignment" },
      { code: (v) => `    self.batch_size = ${v.batch_size}`, type: "assign", label: "Config stored" },
      { code: (v) => `    self.dry_run = ${v.dry_run}`, type: "assign", label: "Flag assignment" },
      { code: (v) => `    self._stats = {"read": 0, "write": 0}`, type: "assign", label: "Counter init — pure state" },
    ],
  },
  {
    id: "pipeline",
    className: "DataPipeline",
    params: [
      { name: "name", type: "str", options: ['"daily_ingest"', '"hourly_agg"', '"realtime_score"'] },
      { name: "retries", type: "int", options: ["0", "3", "5"] },
      { name: "timeout_s", type: "int", options: ["30", "300", "3600"] },
    ],
    lines: [
      { code: (v) => `    self.name = ${v.name}`, type: "assign", label: "Identifier stored" },
      { code: (v) => `    self.retries = ${v.retries}`, type: "assign", label: "Retry policy stored" },
      { code: (v) => `    self.timeout = ${v.timeout_s}`, type: "assign", label: "Timeout config stored" },
      { code: (v) => `    self._steps: list = []`, type: "assign", label: "Empty list init — steps added via add_step()" },
      { code: (v) => `    self._run_id = None`, type: "assign", label: "Assigned at run time, not construction" },
    ],
  },
];

// ─── Audit lines for Tab 2 ────────────────────────────────────────────────────

const AUDIT_LINES = [
  { code: "    self.name = name", correct: "pure", label: "pure init", explanation: "Stores the argument — no side effects." },
  { code: "    self._conn = db.connect(host)", correct: "sideEffect", label: "side effect", explanation: "Network I/O in constructor. Moves to connect()." },
  { code: "    self._schema = requests.get(schema_url).json()", correct: "sideEffect", label: "side effect", explanation: "HTTP call during construction. Flaky under load. Move to warmup()." },
  { code: "    if not name: raise ValueError('name required')", correct: "validation", label: "validation", explanation: "Guard clause — validates invariant before storing. OK in __init__." },
  { code: "    self._cache: dict = {}", correct: "pure", label: "pure init", explanation: "Mutable default initialized to empty. No I/O." },
  { code: "    threading.Thread(target=self._poll, daemon=True).start()", correct: "sideEffect", label: "side effect", explanation: "Spawns a background thread at construction time. Hard to test/control. Move to start()." },
];

const AUDIT_CATEGORIES = [
  { key: "pure", label: "Pure Init", color: DS.grn, bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.35)" },
  { key: "validation", label: "Validation", color: "#FCD34D", bg: "rgba(252,211,77,0.10)", border: "rgba(252,211,77,0.32)" },
  { key: "sideEffect", label: "Side Effect", color: "#FCA5A5", bg: "rgba(252,165,165,0.10)", border: "rgba(252,165,165,0.32)" },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: 1.4, color: DS.dim,
      fontFamily: "var(--ds-mono), monospace", fontWeight: 700,
      marginBottom: 8, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function ModeTab({ active, onClick, label, hint }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: "12px 14px",
      background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? `${DS.ind}66` : DS.border}`,
      borderRadius: 10, color: active ? DS.t1 : DS.t3,
      fontFamily: "var(--ds-mono), monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left",
    }}>
      <div style={{ color: active ? DS.ind : DS.t2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: DS.dim, letterSpacing: 0.2, fontWeight: 500 }}>{hint}</div>
    </button>
  );
}

function SmallPill({ active, onClick, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <button type="button" onClick={onClick} style={{
      padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
      fontFamily: "var(--ds-mono), monospace",
      border: active ? `1px solid ${DS.ind}` : `1px solid ${DS.border}`,
      background: active ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
      color: active ? DS.t1 : DS.t2,
      transition: reduceMotion ? "none" : "all 0.15s ease",
    }}>
      {children}
    </button>
  );
}

// ─── Tab 1: Object Anatomy ────────────────────────────────────────────────────

function initParams(scenario) {
  return Object.fromEntries(scenario.params.map((p) => [p.name, p.options[0]]));
}

function buildDict(scenario, values) {
  const entries = [];
  scenario.lines.forEach((line) => {
    const rendered = line.code(values);
    const match = rendered.match(/self\.(\w+)\s*=\s*(.+)/);
    if (match) {
      entries.push({ key: match[1], value: match[2].trim(), label: line.label });
    }
  });
  return entries;
}

function InstancePanel({ scenario, values, onChange, instanceLabel, color }) {
  const dict = useMemo(() => buildDict(scenario, values), [scenario, values]);

  return (
    <div style={{
      padding: "12px 14px", borderRadius: 14,
      border: `1px solid ${color}33`,
      background: "rgba(255,255,255,0.015)",
      flex: 1, minWidth: 0,
    }}>
      {/* Instance header */}
      <div style={{ marginBottom: 10 }}>
        <SectionLabel>Instance</SectionLabel>
        <div style={{
          fontFamily: "var(--ds-mono), monospace", fontSize: 13, fontWeight: 700, color,
        }}>
          {instanceLabel}
        </div>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3, marginTop: 2 }}>
          = {scenario.className}(...)
        </div>
      </div>

      {/* Param pickers */}
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>Constructor args</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {scenario.params.map((p) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "var(--ds-mono), monospace", fontSize: 11,
                color: DS.t3, minWidth: 90,
              }}>
                <span style={{ color: "#FCD34D" }}>{p.name}</span>
                <span style={{ color: DS.dim }}>: {p.type}</span>
              </span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {p.options.map((opt) => (
                  <SmallPill
                    key={opt}
                    active={values[p.name] === opt}
                    onClick={() => onChange(p.name, opt)}
                  >
                    {opt}
                  </SmallPill>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* __init__ code preview */}
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>__init__ code</SectionLabel>
        <div style={{
          fontFamily: "var(--ds-mono), monospace", fontSize: 11, lineHeight: 1.85,
          background: "rgba(0,0,0,0.35)", border: `1px solid ${DS.border}`,
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ color: DS.ind }}>def __init__(self{scenario.params.map((p) => `, ${p.name}`).join("")}):</div>
          {scenario.lines.map((line, i) => {
            const rendered = line.code(values);
            // highlight the value part in yellow
            const eqIdx = rendered.indexOf("=");
            const lhs = eqIdx >= 0 ? rendered.slice(0, eqIdx + 1) : rendered;
            const rhs = eqIdx >= 0 ? rendered.slice(eqIdx + 1) : "";
            return (
              <div key={i} style={{ color: DS.t2 }}>
                <span style={{ color: DS.t3 }}>{lhs}</span>
                <span style={{ color: "#FCD34D" }}>{rhs}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* self.__dict__ panel */}
      <div>
        <SectionLabel>self.__dict__</SectionLabel>
        <div style={{
          fontFamily: "var(--ds-mono), monospace", fontSize: 11,
          background: "rgba(0,0,0,0.28)", border: `1px solid ${DS.border}`,
          borderRadius: 10, padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {dict.map(({ key, value, label }) => (
            <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: DS.grn, minWidth: 80 }}>"{key}"</span>
              <span style={{ color: DS.dim }}>:</span>
              <span style={{ color: "#FCD34D", flex: 1 }}>{value}</span>
              <span style={{
                fontSize: 9, color: DS.dim, letterSpacing: 0.5,
                borderLeft: `1px solid ${DS.border}`, paddingLeft: 6,
                alignSelf: "center", maxWidth: 140, lineHeight: 1.3,
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ObjectAnatomyTab({ scenario, setScenarioId }) {
  const [valuesA, setValuesA] = useState(() => initParams(scenario));
  const [valuesB, setValuesB] = useState(() => {
    const def = initParams(scenario);
    // Give instance B a different default for interest
    const params = scenario.params;
    if (params.length > 0) def[params[0].name] = params[0].options[1] ?? params[0].options[0];
    if (params.length > 1) def[params[1].name] = params[1].options[1] ?? params[1].options[0];
    return def;
  });

  const handleScenarioChange = (id) => {
    const s = SCENARIOS.find((sc) => sc.id === id);
    setValuesA(initParams(s));
    const def = initParams(s);
    if (s.params.length > 0) def[s.params[0].name] = s.params[0].options[1] ?? s.params[0].options[0];
    if (s.params.length > 1) def[s.params[1].name] = s.params[1].options[1] ?? s.params[1].options[0];
    setValuesB(def);
    setScenarioId(id);
  };

  return (
    <div>
      {/* Scenario picker */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Pick a class scenario</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SCENARIOS.map((s) => (
            <SmallPill
              key={s.id}
              active={scenario.id === s.id}
              onClick={() => handleScenarioChange(s.id)}
            >
              {s.className}
            </SmallPill>
          ))}
        </div>
      </div>

      {/* Independence callout */}
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        border: `1px solid rgba(129,140,248,0.22)`,
        background: "rgba(129,140,248,0.06)",
        marginBottom: 14,
        fontFamily: "var(--ds-sans), sans-serif", fontSize: 12, color: DS.t2, lineHeight: 1.6,
      }}>
        <strong style={{ color: DS.ind }}>Instance independence:</strong>{" "}
        Each call to <code style={{ fontFamily: "var(--ds-mono), monospace", color: "#FCD34D" }}>{scenario.className}()</code> allocates a
        fresh namespace. Changing <em>instance_a</em>'s attributes never affects <em>instance_b</em>. Configure them
        independently below to see their <code style={{ fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>__dict__</code> diverge.
      </div>

      {/* Two instances side by side */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <InstancePanel
          scenario={scenario}
          values={valuesA}
          onChange={(k, v) => setValuesA((prev) => ({ ...prev, [k]: v }))}
          instanceLabel="instance_a"
          color={DS.ind}
        />
        <InstancePanel
          scenario={scenario}
          values={valuesB}
          onChange={(k, v) => setValuesB((prev) => ({ ...prev, [k]: v }))}
          instanceLabel="instance_b"
          color={DS.grn}
        />
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 10,
        border: `1px solid ${DS.border}`,
        background: "rgba(255,255,255,0.015)",
        fontFamily: "var(--ds-sans), sans-serif", fontSize: 12, color: DS.t3, lineHeight: 1.6,
      }}>
        <strong style={{ color: DS.t2 }}>Interview signal:</strong>{" "}
        Every attribute shown above is a <em>pure assignment</em> — no network, no file I/O, no threads.
        A constructor that only assigns values is trivially testable with{" "}
        <code style={{ fontFamily: "var(--ds-mono), monospace", color: "#FCD34D" }}>obj = {scenario.className}(...)</code> — no mocking needed.
        Side effects belong in explicit lifecycle methods like{" "}
        <code style={{ fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>connect()</code> or{" "}
        <code style={{ fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>start()</code>.
      </div>
    </div>
  );
}

// ─── Tab 2: Constructor Audit ─────────────────────────────────────────────────

const CATEGORY_MAP = {
  pure: { label: "Pure Init", color: DS.grn, bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.35)" },
  validation: { label: "Validation", color: "#FCD34D", bg: "rgba(252,211,77,0.10)", border: "rgba(252,211,77,0.32)" },
  sideEffect: { label: "Side Effect", color: "#FCA5A5", bg: "rgba(252,165,165,0.10)", border: "rgba(252,165,165,0.32)" },
};

const REFACTORED_LINES = [
  { code: "def __init__(self, name, host, schema_url):", indent: 0, comment: "" },
  { code: '    if not name: raise ValueError("name required")', indent: 1, comment: "# validation stays" },
  { code: "    self.name = name", indent: 1, comment: "# pure init stays" },
  { code: "    self._cache: dict = {}", indent: 1, comment: "# pure init stays" },
  { code: "    self._conn = None", indent: 1, comment: "# was db.connect — deferred" },
  { code: "    self._schema = None", indent: 1, comment: "# was requests.get — deferred" },
  { code: "    self._poll_thread = None", indent: 1, comment: "# was thread.start — deferred" },
  { code: "", indent: 0, comment: "" },
  { code: "def connect(self):", indent: 0, comment: "# side effects extracted" },
  { code: "    self._conn = db.connect(self.host)", indent: 1, comment: "" },
  { code: "", indent: 0, comment: "" },
  { code: "def warmup(self):", indent: 0, comment: "" },
  { code: "    self._schema = requests.get(self.schema_url).json()", indent: 1, comment: "" },
  { code: "", indent: 0, comment: "" },
  { code: "def start(self):", indent: 0, comment: "" },
  { code: "    self._poll_thread = threading.Thread(", indent: 1, comment: "" },
  { code: "        target=self._poll, daemon=True)", indent: 2, comment: "" },
  { code: "    self._poll_thread.start()", indent: 1, comment: "" },
];

function ConstructorAuditTab() {
  const reduceMotion = useReducedMotion();
  const [classifications, setClassifications] = useState({});
  const [revealed, setRevealed] = useState(false);

  const totalLines = AUDIT_LINES.length;
  const classified = Object.keys(classifications).length;
  const correct = AUDIT_LINES.filter((l, i) => classifications[i] === l.correct).length;
  const allClassified = classified === totalLines;

  const classify = (idx, key) => {
    setClassifications((prev) => ({ ...prev, [idx]: key }));
  };

  const reset = () => {
    setClassifications({});
    setRevealed(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          border: `1px solid rgba(252,165,165,0.22)`,
          background: "rgba(252,165,165,0.06)",
          fontFamily: "var(--ds-sans), sans-serif", fontSize: 12, color: DS.t2, lineHeight: 1.6,
        }}>
          <strong style={{ color: "#FCA5A5" }}>Bad constructor below.</strong>{" "}
          Classify each line: is it{" "}
          <span style={{ color: DS.grn }}>pure init</span>,{" "}
          <span style={{ color: "#FCD34D" }}>validation</span>, or a{" "}
          <span style={{ color: "#FCA5A5" }}>side effect</span> that should be extracted?
        </div>
      </div>

      {/* Score bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
        padding: "10px 14px", borderRadius: 10,
        border: `1px solid ${DS.border}`,
        background: "rgba(255,255,255,0.015)",
        fontFamily: "var(--ds-mono), monospace", fontSize: 12,
      }}>
        <span style={{ color: DS.dim }}>Progress:</span>
        <span style={{ color: DS.t1, fontWeight: 700 }}>{classified}/{totalLines} classified</span>
        {revealed && (
          <span style={{ color: correct === totalLines ? DS.grn : "#FCD34D", fontWeight: 700 }}>
            · {correct}/{totalLines} correct
          </span>
        )}
        <div style={{ flex: 1, height: 4, background: DS.border, borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999,
            width: `${(classified / totalLines) * 100}%`,
            background: revealed
              ? correct === totalLines ? DS.grn : "#FCD34D"
              : DS.ind,
            transition: reduceMotion ? "none" : "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Class header (bad version) */}
      <div style={{ marginBottom: 10 }}>
        <SectionLabel>Bad constructor — classify each line</SectionLabel>
        <div style={{
          fontFamily: "var(--ds-mono), monospace", fontSize: 11, lineHeight: 1.6,
          background: "rgba(0,0,0,0.35)", border: `1px solid rgba(252,165,165,0.18)`,
          borderRadius: 12, padding: "12px 14px",
          marginBottom: 10,
        }}>
          <div style={{ color: DS.dim, marginBottom: 6 }}>class DataConnector:</div>
          <div style={{ color: DS.ind, marginBottom: 4 }}>{"    def __init__(self, name, host, schema_url):"}</div>
        </div>
      </div>

      {/* Audit lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {AUDIT_LINES.map((line, i) => {
          const chosen = classifications[i];
          const cat = chosen ? CATEGORY_MAP[chosen] : null;
          const isCorrect = chosen === line.correct;
          const showResult = revealed && chosen;

          return (
            <div
              key={i}
              style={{
                borderRadius: 12,
                border: `1px solid ${showResult ? (isCorrect ? "rgba(52,211,153,0.4)" : "rgba(252,165,165,0.4)") : cat ? cat.border : DS.border}`,
                background: showResult
                  ? isCorrect ? "rgba(52,211,153,0.08)" : "rgba(252,165,165,0.08)"
                  : cat ? cat.bg : "rgba(255,255,255,0.015)",
                padding: "10px 12px",
                transition: reduceMotion ? "none" : "all 0.2s ease",
              }}
            >
              {/* Code line */}
              <div style={{
                fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t1,
                marginBottom: 8, letterSpacing: 0.2,
              }}>
                {line.code}
              </div>

              {/* Classification buttons */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {AUDIT_CATEGORIES.map((c) => {
                  const isActive = chosen === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => !revealed && classify(i, c.key)}
                      style={{
                        padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                        fontFamily: "var(--ds-mono), monospace",
                        cursor: revealed ? "default" : "pointer",
                        border: isActive ? `1px solid ${c.border}` : `1px solid ${DS.border}`,
                        background: isActive ? c.bg : "rgba(255,255,255,0.02)",
                        color: isActive ? c.color : DS.t3,
                        opacity: revealed && !isActive ? 0.4 : 1,
                        transition: reduceMotion ? "none" : "all 0.15s ease",
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}

                {/* Revealed answer badge */}
                {revealed && (
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 10, fontWeight: 700,
                    color: isCorrect ? DS.grn : "#FCA5A5",
                    fontFamily: "var(--ds-mono), monospace",
                  }}>
                    {isCorrect ? "correct" : `answer: ${CATEGORY_MAP[line.correct].label}`}
                  </span>
                )}
              </div>

              {/* Explanation on reveal */}
              {revealed && (
                <div style={{
                  marginTop: 6, fontSize: 11, color: DS.t3, lineHeight: 1.5,
                  fontFamily: "var(--ds-sans), sans-serif",
                  borderTop: `1px solid ${DS.border}`, paddingTop: 6,
                }}>
                  {line.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={!allClassified}
          style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            fontFamily: "var(--ds-mono), monospace", cursor: allClassified ? "pointer" : "not-allowed",
            border: allClassified ? `1px solid ${DS.ind}` : `1px solid ${DS.border}`,
            background: allClassified ? `${DS.ind}1e` : "rgba(255,255,255,0.02)",
            color: allClassified ? DS.t1 : DS.dim,
            transition: reduceMotion ? "none" : "all 0.15s ease",
          }}
        >
          {revealed ? "Answers shown" : allClassified ? "Reveal answers" : `Classify all ${totalLines - classified} remaining lines first`}
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            fontFamily: "var(--ds-mono), monospace", cursor: "pointer",
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
            color: DS.t3,
          }}
        >
          Reset
        </button>
      </div>

      {/* Refactored code — shown after reveal */}
      {revealed && (
        <div style={{ marginTop: 4 }}>
          <SectionLabel>Refactored version</SectionLabel>
          <div style={{
            borderRadius: 12, border: `1px solid rgba(52,211,153,0.28)`,
            background: "rgba(52,211,153,0.05)", padding: "14px 16px",
          }}>
            {/* Why it matters */}
            <div style={{
              marginBottom: 12, fontSize: 12, color: DS.t2,
              fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.6,
            }}>
              <strong style={{ color: DS.grn }}>Why this matters for interviews:</strong>{" "}
              A constructor that spawns threads, opens sockets, or fetches schemas is untestable without mocking
              the entire world. Extract side effects into named lifecycle methods so callers control when I/O happens.
            </div>

            {/* Key improvements legend */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                { color: DS.grn, text: "pure init / validation stays in __init__" },
                { color: "#FCD34D", text: "side effects moved to connect() / warmup() / start()" },
              ].map(({ color, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Refactored code block */}
            <div style={{
              fontFamily: "var(--ds-mono), monospace", fontSize: 11, lineHeight: 1.9,
              background: "rgba(0,0,0,0.35)", border: `1px solid ${DS.border}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              {REFACTORED_LINES.map((line, i) => {
                if (!line.code && !line.comment) return <div key={i} style={{ height: 6 }} />;
                const isMethod = line.code.startsWith("def ") || line.code.startsWith("class ");
                const isComment = line.comment !== "";
                return (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: isMethod ? DS.ind : DS.t2 }}>{line.code}</span>
                    {isComment && (
                      <span style={{ color: DS.grn, opacity: 0.7 }}>{line.comment}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Testability note */}
            <div style={{
              marginTop: 12, padding: "10px 12px", borderRadius: 8,
              border: `1px solid rgba(129,140,248,0.2)`,
              background: "rgba(129,140,248,0.06)",
              fontSize: 12, color: DS.t2, lineHeight: 1.6,
              fontFamily: "var(--ds-sans), sans-serif",
            }}>
              <strong style={{ color: DS.ind }}>Testability payoff:</strong>{" "}
              <code style={{ fontFamily: "var(--ds-mono), monospace", color: "#FCD34D" }}>DataConnector("svc", "host", "url")</code>{" "}
              now constructs without any I/O. You can assert on{" "}
              <code style={{ fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>obj.name</code> and{" "}
              <code style={{ fontFamily: "var(--ds-mono), monospace", color: DS.grn }}>obj._cache</code>{" "}
              without a real database, HTTP server, or thread pool.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function ClassObjectLab() {
  const [tab, setTab] = useState("anatomy");
  const [scenarioId, setScenarioId] = useState("feature_store");
  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId), [scenarioId]);

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif" }}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
          Classes, Objects &amp; __init__
        </div>
        <p style={{ margin: 0, maxWidth: 600, fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
          Explore instance anatomy and learn to audit constructor purity — the keys to testable, reliable data engineering code.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <ModeTab
          active={tab === "anatomy"}
          onClick={() => setTab("anatomy")}
          label="Object anatomy"
          hint="Configure instances, inspect __dict__, see independence"
        />
        <ModeTab
          active={tab === "audit"}
          onClick={() => setTab("audit")}
          label="Constructor audit"
          hint="Classify each line — pure init, validation, or side effect"
        />
      </div>

      {/* Tab content */}
      {tab === "anatomy" ? (
        <ObjectAnatomyTab scenario={scenario} setScenarioId={setScenarioId} />
      ) : (
        <ConstructorAuditTab />
      )}
    </div>
  );
}
