import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

const EXAMPLES = [
  {
    id: "filter",
    label: "Filter positives",
    input: [-3, 0, 7, -1, 5, 2, -8, 4],
    loop: `result = []\nfor x in data:\n    if x > 0:\n        result.append(x)`,
    comp: `result = [x for x in data if x > 0]`,
    gen:  `result = (x for x in data if x > 0)`,
    run:  (arr) => arr.filter(x => x > 0),
  },
  {
    id: "transform",
    label: "Square each",
    input: [1, 2, 3, 4, 5],
    loop: `result = []\nfor x in data:\n    result.append(x ** 2)`,
    comp: `result = [x**2 for x in data]`,
    gen:  `result = (x**2 for x in data)`,
    run:  (arr) => arr.map(x => x ** 2),
  },
  {
    id: "both",
    label: "Square evens only",
    input: [1, 2, 3, 4, 5, 6, 7, 8],
    loop: `result = []\nfor x in data:\n    if x % 2 == 0:\n        result.append(x ** 2)`,
    comp: `result = [x**2 for x in data if x % 2 == 0]`,
    gen:  `result = (x**2 for x in data if x % 2 == 0)`,
    run:  (arr) => arr.filter(x => x % 2 === 0).map(x => x ** 2),
  },
  {
    id: "dict",
    label: "Dict from list",
    input: ["alice", "bob", "carol"],
    loop: `result = {}\nfor name in data:\n    result[name] = len(name)`,
    comp: `result = {name: len(name) for name in data}`,
    gen:  null,
    run:  (arr) => Object.fromEntries(arr.map(x => [x, x.length])),
  },
];

export default function ComprehensionBuilderViz() {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [mode, setMode] = useState("loop"); // "loop" | "comp" | "gen"

  const ex = EXAMPLES[exampleIdx];
  const output = ex.run(ex.input);

  const modeLabel = { loop: "for loop", comp: "list comprehension", gen: "generator expression" };
  const modeCode  = { loop: ex.loop, comp: ex.comp, gen: ex.gen };

  const highlight = (code) => {
    if (!code) return "Not applicable for dict comprehensions.";
    // Simple keyword highlight via spans — just return as-is for simplicity
    return code;
  };

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Comprehension builder
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        Toggle between a for-loop, list comprehension, and generator expression — same result, different style.
      </p>

      {/* Example selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {EXAMPLES.map((e, i) => (
          <button key={e.id} type="button"
            onClick={() => { setExampleIdx(i); setMode("loop"); }}
            style={{
              background: exampleIdx === i ? DS.indB : "rgba(255,255,255,0.04)",
              border: `1px solid ${exampleIdx === i ? DS.ind : DS.border}`,
              borderRadius: 6, padding: "6px 12px",
              color: exampleIdx === i ? "#fff" : DS.t2,
              ...MONO, cursor: "pointer", fontWeight: exampleIdx === i ? 700 : 400,
            }}>
            {e.label}
          </button>
        ))}
      </div>

      {/* Input data */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>INPUT</div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "8px 12px", ...MONO, color: DS.t2 }}>
          data = {JSON.stringify(ex.input)}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["loop", "comp", ...(ex.gen ? ["gen"] : [])].map(m => (
          <button key={m} type="button"
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${mode === m ? DS.grn : DS.border}`,
              borderRadius: 6, padding: "6px 14px",
              color: mode === m ? DS.grn : DS.t2,
              ...MONO, cursor: "pointer", fontWeight: mode === m ? 700 : 400,
            }}>
            {modeLabel[m]}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>CODE</div>
        <pre style={{
          background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
          borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2,
          margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap",
        }}>
          {highlight(modeCode[mode])}
        </pre>
      </div>

      {/* Output */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: DS.grn, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>OUTPUT</div>
        <div style={{ background: "rgba(52,211,153,0.06)", border: `1px solid rgba(52,211,153,0.25)`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.grn, fontWeight: 600 }}>
          {mode === "gen"
            ? `<generator object>  →  ${JSON.stringify(output)} (when consumed)`
            : JSON.stringify(output)}
        </div>
      </div>

      {/* Insight */}
      <div style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "10px 14px", ...MONO, fontSize: 11, color: DS.t3, lineHeight: 1.65 }}>
        {mode === "loop" && "◈ The for-loop is explicit but verbose — you manually create a list and call .append() every iteration."}
        {mode === "comp" && "◈ The list comprehension is 10-40% faster than the loop version because it's optimised at the CPython bytecode level. It builds the full list in memory."}
        {mode === "gen" && "◈ The generator expression uses () instead of []. It produces items lazily — one at a time. Use this when you only need to iterate once, or when data is too large to fit in memory."}
      </div>
    </div>
  );
}
