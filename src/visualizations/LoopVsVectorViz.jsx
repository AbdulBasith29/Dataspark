import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

// Simulated timing data (ms for 1M rows)
const TIMINGS = [
  { label: "vectorised\n(df['a'] * df['b'])", ms: 2,    color: DS.grn, desc: "NumPy C-level operation on entire array" },
  { label: "column apply\n(.apply(lambda x))", ms: 500,  color: "#F59E0B", desc: "Python loop over column values" },
  { label: "row apply\n(.apply(axis=1))",       ms: 5000, color: "#EF4444", desc: "Python loop over every row — 2500× slower!" },
  { label: "iterrows()\nfor loop",               ms: 15000, color: "#DC2626", desc: "Slowest possible — never use for transforms" },
];

const EXAMPLES = [
  {
    id: "multiply",
    label: "Multiply two columns",
    slow: `df['total'] = df.apply(\n    lambda r: r['price'] * r['qty'],\n    axis=1\n)  # 5s on 1M rows`,
    fast: `df['total'] = df['price'] * df['qty']\n# 0.002s on 1M rows — 2500× faster`,
    note: "Arithmetic between columns is always vectorisable.",
  },
  {
    id: "conditional",
    label: "Conditional label",
    slow: `df['label'] = df['score'].apply(\n    lambda x: 'high' if x > 80\n    else 'low'\n)`,
    fast: `import numpy as np\ndf['label'] = np.where(\n    df['score'] > 80, 'high', 'low'\n)  # vectorised ternary`,
    note: "np.where() is the vectorised ternary — use it for binary conditions.",
  },
  {
    id: "string",
    label: "String operation",
    slow: `df['domain'] = df['email'].apply(\n    lambda x: x.split('@')[1]\n)`,
    fast: `df['domain'] = df['email']\\\n    .str.split('@')\\\n    .str[1]  # .str accessor — vectorised`,
    note: "The .str accessor gives vectorised string operations without a Python loop.",
  },
  {
    id: "datetime",
    label: "Extract datetime part",
    slow: `df['day'] = df['ts'].apply(\n    lambda x: x.day_name()\n)`,
    fast: `df['day'] = df['ts'].dt.day_name()\n# .dt accessor — vectorised datetime ops`,
    note: "The .dt accessor is the vectorised equivalent of calling datetime methods per row.",
  },
];

const MAX_MS = 15000;

export default function LoopVsVectorViz() {
  const [activeExample, setActiveExample] = useState(0);
  const [showChart, setShowChart] = useState(false);

  const ex = EXAMPLES[activeExample];

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Loop vs vectorised — performance gap
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        The same operation, written two ways. The vectorised version processes 1 million rows in milliseconds.
      </p>

      {/* Tab toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {EXAMPLES.map((e, i) => (
          <button key={e.id} type="button"
            onClick={() => setActiveExample(i)}
            style={{
              background: activeExample === i ? DS.indB : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeExample === i ? DS.ind : DS.border}`,
              borderRadius: 6, padding: "6px 12px",
              color: activeExample === i ? "#fff" : DS.t2,
              ...MONO, cursor: "pointer", fontWeight: activeExample === i ? 700 : 400,
            }}>
            {e.label}
          </button>
        ))}
      </div>

      {/* Code comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "#EF4444", ...MONO, letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700 }}>
            ✗ SLOW (apply / loop)
          </div>
          <pre style={{
            background: "rgba(239,68,68,0.05)", border: `1px solid rgba(239,68,68,0.2)`,
            borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2,
            margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap", minHeight: 90,
          }}>
            {ex.slow}
          </pre>
        </div>
        <div>
          <div style={{ fontSize: 10, color: DS.grn, ...MONO, letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700 }}>
            ✓ FAST (vectorised)
          </div>
          <pre style={{
            background: "rgba(52,211,153,0.05)", border: `1px solid rgba(52,211,153,0.2)`,
            borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2,
            margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap", minHeight: 90,
          }}>
            {ex.fast}
          </pre>
        </div>
      </div>

      <div style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2, marginBottom: 18, lineHeight: 1.6 }}>
        ◈ {ex.note}
      </div>

      {/* Performance chart toggle */}
      <button type="button"
        onClick={() => setShowChart(!showChart)}
        style={{
          background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`,
          borderRadius: 6, padding: "8px 16px", color: DS.t2, ...MONO, cursor: "pointer", marginBottom: 14,
        }}>
        {showChart ? "▲ hide" : "▼ show"} performance comparison (1M rows)
      </button>

      {showChart && (
        <div>
          {TIMINGS.map((t) => (
            <div key={t.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ ...MONO, fontSize: 11, color: DS.t2, whiteSpace: "pre" }}>{t.label}</span>
                <span style={{ ...MONO, fontSize: 11, color: t.color, fontWeight: 700 }}>
                  {t.ms >= 1000 ? `${(t.ms / 1000).toFixed(1)}s` : `${t.ms}ms`}
                </span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{
                  width: `${(t.ms / MAX_MS) * 100}%`,
                  background: t.color,
                  height: "100%",
                  borderRadius: 4,
                  minWidth: t.ms < 50 ? 4 : 0,
                }} />
              </div>
            </div>
          ))}
          <div style={{ ...MONO, fontSize: 11, color: DS.t3, marginTop: 8 }}>
            iterrows() is ~7,500× slower than vectorised. This is the difference between a 15-second wait and an instant result.
          </div>
        </div>
      )}
    </div>
  );
}
