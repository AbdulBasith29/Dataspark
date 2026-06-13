import { useState, useEffect, useRef } from "react";
import useReducedMotion from "../lib/use-reduced-motion.js";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Shared ──────────────────────────────────────────────────────────────────

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

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.015)", ...style }}>
      {children}
    </div>
  );
}

// ─── MRO data model ───────────────────────────────────────────────────────────

// Each class lists which methods it directly defines (overrides)
const CLASS_DEFS = {
  object:          { methods: ["__init__"], parent: null },
  DataSource:      { methods: ["run", "validate", "close"], parent: "object" },
  BatchSource:     { methods: ["run"], parent: "DataSource" },
  S3BatchSource:   { methods: ["validate"], parent: "BatchSource" },
  GCSBatchSource:  { methods: [], parent: "BatchSource" },
};

// MRO for each concrete class (C3 linearization, pre-computed)
const MRO = {
  S3BatchSource:  ["S3BatchSource", "BatchSource", "DataSource", "object"],
  GCSBatchSource: ["GCSBatchSource", "BatchSource", "DataSource", "object"],
};

// Which class supplies each method for each instance
function resolveMRO(instanceClass, method) {
  const chain = MRO[instanceClass];
  const steps = chain.map((cls) => {
    const has = CLASS_DEFS[cls].methods.includes(method);
    return { cls, has };
  });
  const resolvedIdx = steps.findIndex((s) => s.has);
  return { steps, resolvedIdx };
}

// ─── Tab 1: MRO Tracer ────────────────────────────────────────────────────────

const TREE_LINES = [
  { text: "object", depth: 0 },
  { text: "└── DataSource          run()  validate()  close()", depth: 0 },
  { text: "    └── BatchSource     run()  ← overrides DataSource", depth: 1 },
  { text: "        ├── S3BatchSource   validate()  ← overrides DataSource", depth: 2 },
  { text: "        └── GCSBatchSource  (no overrides)", depth: 2 },
];

function MROTracer() {
  const reduceMotion = useReducedMotion();
  const [instance, setInstance] = useState("S3BatchSource");
  const [method, setMethod] = useState("run");
  const [animStep, setAnimStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const { steps, resolvedIdx } = resolveMRO(instance, method);

  function runTrace() {
    if (running) return;
    // Reduced motion: reveal the whole resolved chain instantly, no stepping.
    if (reduceMotion) {
      setAnimStep(steps.length - 1);
      setRunning(false);
      return;
    }
    setAnimStep(-1);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    if (reduceMotion) {
      setAnimStep(steps.length - 1);
      setRunning(false);
      return;
    }
    if (animStep < steps.length - 1) {
      // Stop early once we find the resolver — but animate one more frame to show "FOUND"
      timerRef.current = setTimeout(() => {
        setAnimStep((prev) => prev + 1);
      }, animStep === resolvedIdx ? 600 : 520);
    } else {
      setRunning(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [running, animStep, steps.length, resolvedIdx, reduceMotion]);

  // Reset animation when selections change
  useEffect(() => {
    setAnimStep(-1);
    setRunning(false);
    clearTimeout(timerRef.current);
  }, [instance, method]);

  const mroChain = MRO[instance];

  function stepColor(idx) {
    if (animStep < idx) return DS.dim;
    if (idx === resolvedIdx) return DS.grn;
    return DS.t3;
  }

  function stepBg(idx) {
    if (animStep < idx) return "transparent";
    if (idx === resolvedIdx) return "rgba(52,211,153,0.08)";
    return "rgba(255,255,255,0.03)";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Class hierarchy tree */}
      <Card>
        <SectionLabel>CLASS HIERARCHY</SectionLabel>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, lineHeight: 1.9, color: DS.t3 }}>
          {TREE_LINES.map((line, i) => (
            <div key={i} style={{
              color: line.depth === 0 ? DS.t2 : line.depth === 1 ? DS.t2 : DS.t3,
              paddingLeft: 0,
            }}>
              {line.text}
            </div>
          ))}
        </div>
      </Card>

      {/* Controls */}
      <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card>
          <SectionLabel>INSTANTIATE</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["S3BatchSource", "GCSBatchSource"].map((cls) => (
              <button key={cls} type="button" onClick={() => setInstance(cls)} style={{
                padding: "8px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
                background: instance === cls ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${instance === cls ? `${DS.ind}88` : DS.border}`,
                color: instance === cls ? DS.ind : DS.t3,
              }}>
                {cls}()
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <SectionLabel>CALL METHOD</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["run", "validate", "close"].map((m) => (
              <button key={m} type="button" onClick={() => setMethod(m)} style={{
                padding: "8px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
                background: method === m ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${method === m ? `${DS.ind}88` : DS.border}`,
                color: method === m ? DS.ind : DS.t3,
              }}>
                .{m}()
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* MRO chain display */}
      <Card>
        <SectionLabel>MRO (C3 LINEARIZATION ORDER)</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {mroChain.map((cls, idx) => (
            <span key={cls} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{
                fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
                padding: "3px 8px", borderRadius: 6,
                background: animStep >= idx ? (idx === resolvedIdx ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)") : "transparent",
                border: `1px solid ${animStep >= idx ? (idx === resolvedIdx ? `${DS.grn}55` : DS.border) : "transparent"}`,
                color: stepColor(idx),
                transition: reduceMotion ? "none" : "all 0.3s ease",
              }}>
                {idx + 1}. {cls}
              </span>
              {idx < mroChain.length - 1 && (
                <span style={{ color: DS.dim, fontSize: 10 }}>→</span>
              )}
            </span>
          ))}
        </div>

        {/* Trace steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((step, idx) => (
            <div key={step.cls} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 8,
              background: stepBg(idx),
              border: `1px solid ${animStep >= idx ? (idx === resolvedIdx ? `${DS.grn}33` : DS.border) : "transparent"}`,
              transition: reduceMotion ? "none" : "all 0.35s ease",
              opacity: animStep < idx ? 0.25 : 1,
            }}>
              <span style={{
                fontFamily: "var(--ds-mono), monospace", fontSize: 10, fontWeight: 700,
                minWidth: 16, color: DS.dim,
              }}>
                {idx + 1}.
              </span>
              <span style={{
                fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
                color: animStep >= idx ? (idx === resolvedIdx ? DS.grn : DS.t2) : DS.dim,
                minWidth: 130,
              }}>
                {step.cls}
              </span>
              <span style={{
                fontFamily: "var(--ds-mono), monospace", fontSize: 10,
                color: animStep >= idx ? (step.has ? DS.grn : DS.dim) : "transparent",
                flex: 1,
              }}>
                {animStep >= idx ? (step.has ? `defines .${method}()` : `no .${method}() here`) : ""}
              </span>
              {animStep >= idx && (
                <span style={{
                  fontFamily: "var(--ds-mono), monospace", fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 5,
                  background: idx === resolvedIdx ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.04)",
                  color: idx === resolvedIdx ? DS.grn : DS.dim,
                  border: `1px solid ${idx === resolvedIdx ? `${DS.grn}44` : DS.border}`,
                }}>
                  {idx === resolvedIdx ? "✓ FOUND" : "skip →"}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Result banner */}
        {animStep >= resolvedIdx && resolvedIdx >= 0 && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 10,
            background: "rgba(52,211,153,0.08)", border: `1px solid ${DS.grn}44`,
          }}>
            <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.grn, fontWeight: 700 }}>
              {instance}().{method}() → runs {steps[resolvedIdx].cls}.{method}()
            </div>
            {resolvedIdx > 0 && (
              <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3, marginTop: 4 }}>
                Walked {resolvedIdx} class{resolvedIdx > 1 ? "es" : ""} before finding the implementation.
                {steps[resolvedIdx].cls !== "DataSource" && steps[resolvedIdx].cls !== "object" &&
                  ` If that method calls super().${method}(), Python continues at position ${resolvedIdx + 2} in the MRO — ${steps[resolvedIdx + 1]?.cls}.`
                }
              </div>
            )}
          </div>
        )}

        <button type="button" onClick={runTrace} disabled={running} style={{
          marginTop: 12, padding: "9px 20px", borderRadius: 8, cursor: running ? "default" : "pointer",
          background: running ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.14)",
          border: `1px solid ${DS.ind}66`, color: running ? DS.dim : DS.ind,
          fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
        }}>
          {running ? "tracing…" : animStep >= 0 ? "↺ re-trace MRO" : "▶ trace MRO walk"}
        </button>
      </Card>

      {/* super() insight box */}
      <Card style={{ borderColor: `${DS.ind}33`, background: "rgba(99,102,241,0.04)" }}>
        <SectionLabel>KEY INSIGHT — super() FOLLOWS MRO, NOT THE CLASS TREE</SectionLabel>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3, lineHeight: 1.7 }}>
          <div style={{ color: DS.t2, marginBottom: 6 }}>
            When <span style={{ color: DS.ind }}>BatchSource.run()</span> calls{" "}
            <span style={{ color: DS.ind }}>super().run()</span>, it does NOT look up the class tree to{" "}
            <span style={{ color: DS.t2 }}>DataSource</span>. It finds the{" "}
            <span style={{ color: DS.grn }}>next class in the MRO</span> of the <em>actual instance</em>.
          </div>
          <div style={{ color: DS.dim, fontSize: 10, marginTop: 4 }}>
            MRO of S3BatchSource: S3BatchSource → BatchSource → DataSource → object
          </div>
          <div style={{ color: DS.dim, fontSize: 10 }}>
            super() inside BatchSource resolves to DataSource — but in a diamond inheritance, it could be
            a sibling mixin. This is why MRO matters for cooperative multiple inheritance.
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab 2: Polymorphism Demo ─────────────────────────────────────────────────

// Test dataframe: 5 rows, 2 have nulls in "value" col
const BASE_DF = [
  { id: 1, value: 10.0, label: "A" },
  { id: 2, value: null, label: "B" },
  { id: 3, value: 5.0,  label: "C" },
  { id: 4, value: null, label: "D" },
  { id: 5, value: 20.0, label: "E" },
];

function applyFillNull(df) {
  return df.map((r) => ({ ...r, value: r.value === null ? 0 : r.value }));
}
function applyLog(df) {
  return df.map((r) => ({ ...r, value: r.value === null ? null : parseFloat(Math.log1p(r.value).toFixed(4)) }));
}
function applyNorm(df) {
  const vals = df.map((r) => r.value).filter((v) => v !== null);
  const min = Math.min(...vals), max = Math.max(...vals);
  return df.map((r) => ({ ...r, value: r.value === null ? null : parseFloat(((r.value - min) / (max - min)).toFixed(4)) }));
}
function applyDropAll(df) {
  const hasNull = df.some((r) => r.value === null);
  return hasNull ? [] : df;  // drops ALL rows if any null — LSP violation
}

const TRANSFORMERS = [
  {
    name: "FillNullTransformer",
    base: "BaseTransformer",
    desc: "fills NaN → 0",
    code: "df.fillna({'value': 0})",
    apply: applyFillNull,
    lsp: false,
  },
  {
    name: "LogTransformer",
    base: "BaseTransformer",
    desc: "applies log1p to numeric cols",
    code: "df['value'] = np.log1p(df['value'])",
    apply: applyLog,
    lsp: false,
  },
  {
    name: "NormTransformer",
    base: "BaseTransformer",
    desc: "min-max normalize",
    code: "(df - df.min()) / (df.max() - df.min())",
    apply: applyNorm,
    lsp: false,
  },
  {
    name: "DropAllTransformer",
    base: "BaseTransformer",
    desc: "drops ALL rows if any null found",
    code: "df.dropna(how='any') if df.isnull().any() else df  # BUG",
    apply: applyDropAll,
    lsp: true,
  },
];

function DFTable({ rows, highlight }) {
  if (rows.length === 0) {
    return (
      <div style={{
        padding: "8px 10px", borderRadius: 8,
        background: "rgba(252,165,165,0.08)", border: `1px solid #FCA5A588`,
        fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: "#FCA5A5",
      }}>
        ⚠ 0 rows returned — all data lost
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--ds-mono), monospace", fontSize: 10 }}>
        <thead>
          <tr>
            {Object.keys(rows[0]).map((col) => (
              <th key={col} style={{ padding: "3px 8px", color: DS.dim, textAlign: "left", borderBottom: `1px solid ${DS.border}`, letterSpacing: 0.8 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {Object.entries(row).map(([col, val]) => (
                <td key={col} style={{
                  padding: "3px 8px", color: val === null ? "#FCA5A5" : highlight ? DS.grn : DS.t2,
                  borderBottom: `1px solid rgba(255,255,255,0.03)`,
                }}>
                  {val === null ? "NaN" : String(val)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolymorphismDemo() {
  const reduceMotion = useReducedMotion();
  const [ran, setRan] = useState(false);
  const [selected, setSelected] = useState(null);

  const results = TRANSFORMERS.map((t) => ({ ...t, output: t.apply(BASE_DF) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Intro */}
      <Card>
        <SectionLabel>INPUT DATAFRAME — 5 ROWS, 2 NULLS</SectionLabel>
        <DFTable rows={BASE_DF} highlight={false} />
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.dim, marginTop: 8 }}>
          All four transformers accept this DataFrame and promise to return a transformed DataFrame.
          The base contract: <span style={{ color: DS.ind }}>process(df) → DataFrame, no side-effects on input</span>.
        </div>
      </Card>

      {/* Class hierarchy */}
      <Card>
        <SectionLabel>POLYMORPHIC CLASS HIERARCHY</SectionLabel>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3, lineHeight: 1.8 }}>
          <div style={{ color: DS.t2 }}>BaseTransformer</div>
          <div style={{ paddingLeft: 14 }}>└── <span style={{ color: DS.grn }}>FillNullTransformer</span>  — fills NaN → 0</div>
          <div style={{ paddingLeft: 14 }}>└── <span style={{ color: DS.grn }}>LogTransformer</span>      — log1p on numeric cols</div>
          <div style={{ paddingLeft: 14 }}>└── <span style={{ color: DS.grn }}>NormTransformer</span>     — min-max normalize</div>
          <div style={{ paddingLeft: 14 }}>└── <span style={{ color: "#FCA5A5" }}>DropAllTransformer</span>  — ⚠ drops ALL rows if any null</div>
        </div>
      </Card>

      {/* Run all button */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button type="button" onClick={() => { setRan(true); setSelected(null); }} style={{
          padding: "10px 20px", borderRadius: 8, cursor: "pointer",
          background: "rgba(99,102,241,0.14)", border: `1px solid ${DS.ind}66`,
          color: DS.ind, fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
        }}>
          ▶ call process(df) on all transformers
        </button>
        {ran && (
          <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.grn }}>
            ✓ dispatched — same call, different behavior
          </span>
        )}
      </div>

      {/* Results grid */}
      {ran && (
        <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {results.map((t) => (
            <button key={t.name} type="button" onClick={() => setSelected(selected === t.name ? null : t.name)} style={{
              padding: "12px 14px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              background: selected === t.name
                ? (t.lsp ? "rgba(252,165,165,0.06)" : "rgba(52,211,153,0.06)")
                : "rgba(255,255,255,0.015)",
              border: `1px solid ${t.lsp ? "#FCA5A566" : (selected === t.name ? `${DS.grn}55` : DS.border)}`,
              transition: reduceMotion ? "none" : "all 0.2s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{
                  fontFamily: "var(--ds-mono), monospace", fontSize: 11, fontWeight: 700,
                  color: t.lsp ? "#FCA5A5" : DS.t1,
                }}>
                  {t.name}
                </span>
                <span style={{
                  fontFamily: "var(--ds-mono), monospace", fontSize: 9, fontWeight: 700,
                  padding: "2px 7px", borderRadius: 5,
                  background: t.lsp ? "rgba(252,165,165,0.15)" : "rgba(52,211,153,0.12)",
                  color: t.lsp ? "#FCA5A5" : DS.grn,
                  border: `1px solid ${t.lsp ? "#FCA5A544" : `${DS.grn}44`}`,
                }}>
                  {t.lsp ? "LSP VIOLATION" : "✓ valid"}
                </span>
              </div>
              <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 9, color: DS.dim, marginBottom: 8 }}>
                {t.output.length} rows returned
              </div>
              <DFTable rows={t.output} highlight={!t.lsp} />
              {selected === t.name && (
                <div style={{
                  marginTop: 8, padding: "7px 10px", borderRadius: 8,
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
                  fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.ind,
                }}>
                  {t.code}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* LSP explanation */}
      <Card style={{ borderColor: "#FCA5A533", background: "rgba(252,165,165,0.03)" }}>
        <SectionLabel>LISKOV SUBSTITUTION PRINCIPLE (LSP)</SectionLabel>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3, lineHeight: 1.75 }}>
          <div style={{ color: DS.t2, marginBottom: 6 }}>
            <span style={{ color: "#FCD34D" }}>Rule:</span> if S is a subtype of T, then objects of type T
            may be replaced with objects of type S without altering correctness.
          </div>
          <div style={{ marginBottom: 6 }}>
            A caller that iterates <span style={{ color: DS.ind }}>transformers: list[BaseTransformer]</span> and
            calls <span style={{ color: DS.ind }}>.process(df)</span> expects a non-empty DataFrame when
            given 5 rows of valid data. <span style={{ color: "#FCA5A5" }}>DropAllTransformer</span> silently
            returns 0 rows — it <em>narrows the postcondition</em>.
          </div>
          <div style={{ color: DS.dim, fontSize: 10 }}>
            Violations to watch for: raising exceptions the base doesn't declare · narrowing the return type ·
            requiring stricter preconditions (e.g. "df must have no nulls") · surprising side-effects.
          </div>
        </div>
        <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: `1px solid ${DS.border}` }}>
          <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.dim, marginBottom: 4 }}>
            # LSP-safe version of the contract:
          </div>
          <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t2, lineHeight: 1.7 }}>
            <span style={{ color: DS.ind }}>class</span> <span style={{ color: "#FCD34D" }}>BaseTransformer</span>:<br />
            {"    "}<span style={{ color: DS.dim }}>"""process(df) → DataFrame of same schema, len(output) ≥ 0.</span><br />
            {"    "}<span style={{ color: DS.dim }}>Postcondition: must NOT raise for any valid DataFrame."""</span><br />
            {"    "}<span style={{ color: DS.ind }}>def</span> process(self, df): <span style={{ color: DS.dim }}># ← document the contract clearly</span>
          </div>
        </div>
      </Card>

      {/* Polymorphism insight */}
      <Card style={{ borderColor: `${DS.ind}33`, background: "rgba(99,102,241,0.04)" }}>
        <SectionLabel>KEY INSIGHT — DYNAMIC DISPATCH</SectionLabel>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3, lineHeight: 1.7 }}>
          <div style={{ color: DS.t2, marginBottom: 6 }}>
            The power of polymorphism is that the caller doesn't need to know the concrete type:
          </div>
          <div style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: `1px solid ${DS.border}`, marginBottom: 6 }}>
            <span style={{ color: DS.ind }}>for</span> t <span style={{ color: DS.ind }}>in</span> pipeline:<br />
            {"    "}df = t.process(df){"  "}<span style={{ color: DS.dim }}># dispatches to the right class at runtime</span>
          </div>
          <div style={{ color: DS.dim, fontSize: 10 }}>
            Python resolves which <span style={{ color: DS.ind }}>.process()</span> to call based on the
            instance's actual type at runtime — not the declared type. This is called{" "}
            <span style={{ color: "#FCD34D" }}>dynamic dispatch</span>. Combine with LSP to build safe,
            interchangeable pipeline stages.
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function InheritanceExplorer() {
  const [tab, setTab] = useState("mro");

  return (
    <div style={{ fontFamily: "var(--ds-mono), monospace", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans, sans-serif)", marginBottom: 4 }}>
          Inheritance &amp; Polymorphism
        </div>
        <div style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.5 }}>
          Explore how Python resolves method calls through the MRO chain, and why polymorphism only works safely when subclasses honour the Liskov Substitution Principle.
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <ModeTab
          active={tab === "mro"}
          onClick={() => setTab("mro")}
          label="01 · MRO Tracer"
          hint="C3 linearization · super() walk · method resolution"
        />
        <ModeTab
          active={tab === "poly"}
          onClick={() => setTab("poly")}
          label="02 · Polymorphism Demo"
          hint="same call · different dispatch · LSP violations"
        />
      </div>

      {/* Tab content */}
      {tab === "mro" ? <MROTracer /> : <PolymorphismDemo />}
    </div>
  );
}
