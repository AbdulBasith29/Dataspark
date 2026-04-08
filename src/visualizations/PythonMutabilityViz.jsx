import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const M = { fontFamily: "var(--ds-mono)", fontSize: 12 };

// Stable fake hex IDs — same across renders, just used as labels
const IDS = {
  listA:   "0x7f4a_b3c0",
  listNew: "0x8b2c_f190",
  listB:   "0x7f4a_b3c0", // alias = SAME as listA
  listC:   "0x9d1e_0030", // copy = different
  inner1:  "0x5a11_0010",
  inner2:  "0x5a11_0010", // shallow copy of nested = SAME
  inner3:  "0xcc40_9900", // deep copy of nested = different
};

const TABS = ["Mutation", "Alias vs Copy", "Shallow vs Deep"];

// ── Mutation steps ────────────────────────────────────────────────────────────
const MUTATION_STEPS = [
  {
    code: `a = [1, 2, 3]`,
    insight: null,
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3], status: "neutral", label: null },
    ],
  },
  {
    code: `a.append(4)`,
    insight: { type: "good", text: "SAME memory address — a.append() mutates the object in place. The variable a still points to the exact same block." },
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3,4], status: "same", label: "id unchanged ✓" },
    ],
  },
  {
    code: `a[0] = 99`,
    insight: { type: "good", text: "Item reassignment also mutates in place. a still lives at the same address." },
    blocks: [
      { name: "a", id: IDS.listA, value: [99,2,3,4], status: "same", label: "id unchanged ✓" },
    ],
  },
  {
    code: `a = [1]  # reassignment`,
    insight: { type: "warn", text: "Reassignment creates a BRAND NEW object at a new address. The old block is orphaned and garbage-collected. a now points somewhere else." },
    blocks: [
      { name: "a", id: IDS.listNew, value: [1], status: "new", label: "new id — new object" },
      { name: "(old)", id: IDS.listA, value: [99,2,3,4], status: "dead", label: "orphaned →GC" },
    ],
  },
];

// ── Alias steps ───────────────────────────────────────────────────────────────
const ALIAS_STEPS = [
  {
    code: `a = [1, 2, 3]`,
    insight: null,
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3], status: "neutral" },
    ],
  },
  {
    code: `b = a  # alias!`,
    insight: { type: "warn", text: "b = a does NOT copy. Both names point to the SAME memory block. There is only one list object." },
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3], status: "neutral" },
      { name: "b", id: IDS.listA, value: [1,2,3], status: "alias", label: "← same id as a" },
    ],
    arrow: true,
  },
  {
    code: `b.append(4)\n# a is also changed!`,
    insight: { type: "bad", text: "Mutating b mutates a — they share the same object. This is the #1 Python bug in data pipelines: 'cleaning' a copy and silently corrupting the original." },
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3,4], status: "bad", label: "also mutated!" },
      { name: "b", id: IDS.listA, value: [1,2,3,4], status: "bad" },
    ],
  },
  {
    code: `c = a.copy()  # real copy`,
    insight: { type: "good", text: "c = a.copy() creates a new object at a new address. Now c is independent — mutating c won't touch a." },
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3,4], status: "neutral" },
      { name: "c", id: IDS.listC, value: [1,2,3,4], status: "same", label: "different id ✓" },
    ],
  },
  {
    code: `c.append(99)\n# a unchanged`,
    insight: { type: "good", text: "Only c changes. a stays clean. This is the correct pattern for defensive copying at function boundaries." },
    blocks: [
      { name: "a", id: IDS.listA, value: [1,2,3,4], status: "neutral" },
      { name: "c", id: IDS.listC, value: [1,2,3,4,99], status: "same", label: "independent ✓" },
    ],
  },
];

// ── Shallow vs Deep steps ─────────────────────────────────────────────────────
const DEEP_STEPS = [
  {
    code: `original = [[1, 2], [3, 4]]`,
    insight: null,
    outer: { name: "original", id: IDS.listA, status: "neutral" },
    inner: [
      { id: IDS.inner1, value: [1,2], label: "inner[0]" },
      { id: IDS.inner1.replace("0010","0020"), value: [3,4], label: "inner[1]" },
    ],
  },
  {
    code: `shallow = original.copy()`,
    insight: { type: "warn", text: "shallow.copy() makes a new outer list — but the nested lists are NOT copied. shallow[0] and original[0] are the SAME inner object." },
    outer: { name: "shallow", id: IDS.listC, status: "new", label: "new outer id" },
    inner: [
      { id: IDS.inner2, value: [1,2], label: "shared inner[0]", shared: true },
      { id: IDS.inner2.replace("0010","0020"), value: [3,4], label: "shared inner[1]", shared: true },
    ],
  },
  {
    code: `shallow[0].append(99)\n# original[0] also changes!`,
    insight: { type: "bad", text: "Mutating shallow[0] mutates original[0] — they share the same inner object. Shallow copy only goes one level deep." },
    outer: { name: "both", id: "→ shared inner", status: "bad" },
    inner: [
      { id: IDS.inner2, value: [1,2,99], label: "mutated!", shared: true, status: "bad" },
      { id: IDS.inner2.replace("0010","0020"), value: [3,4], label: "inner[1]", shared: true },
    ],
  },
  {
    code: `import copy\ndeep = copy.deepcopy(original)`,
    insight: { type: "good", text: "deepcopy() recursively copies every nested object. deep[0] is a brand-new list — completely independent at every level." },
    outer: { name: "deep", id: IDS.listNew, status: "same", label: "new outer id" },
    inner: [
      { id: IDS.inner3, value: [1,2], label: "new inner[0] ✓" },
      { id: IDS.inner3.replace("9900","9910"), value: [3,4], label: "new inner[1] ✓" },
    ],
  },
];

// ── Block component ───────────────────────────────────────────────────────────
function MemoryBlock({ name, id, value, status, label, small }) {
  const colors = {
    neutral: { border: DS.border,            id: DS.t3,   bg: "rgba(255,255,255,0.03)" },
    same:    { border: "rgba(52,211,153,0.5)", id: DS.grn,  bg: "rgba(52,211,153,0.07)" },
    new:     { border: "rgba(129,140,248,0.5)", id: DS.ind, bg: "rgba(129,140,248,0.07)" },
    bad:     { border: "rgba(239,68,68,0.5)",  id: "#EF4444", bg: "rgba(239,68,68,0.07)" },
    dead:    { border: "rgba(255,255,255,0.08)", id: DS.dim, bg: "transparent" },
    alias:   { border: "rgba(245,158,11,0.5)", id: "#F59E0B", bg: "rgba(245,158,11,0.06)" },
  };
  const c = colors[status] || colors.neutral;
  const shortId = id.length > 14 ? id.slice(0, 14) : id;

  return (
    <div style={{
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      background: c.bg,
      padding: small ? "8px 12px" : "12px 14px",
      opacity: status === "dead" ? 0.35 : 1,
      minWidth: small ? 90 : 120,
      transition: "all 0.25s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ ...M, fontWeight: 700, color: DS.t1, fontSize: small ? 11 : 13 }}>{name}</span>
        {label && <span style={{ ...M, fontSize: 9, color: c.id, letterSpacing: "0.05em" }}>{label}</span>}
      </div>
      {value !== undefined && (
        <div style={{ ...M, color: DS.t2, marginBottom: 6, fontSize: 11 }}>
          {JSON.stringify(value)}
        </div>
      )}
      <div style={{ ...M, fontSize: 9, color: c.id, letterSpacing: "0.03em", wordBreak: "break-all" }}>
        id: {shortId}
      </div>
    </div>
  );
}

// ── Insight banner ────────────────────────────────────────────────────────────
function Insight({ insight }) {
  if (!insight) return null;
  const cfg = {
    good: { bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.25)", color: DS.grn, icon: "✓" },
    warn: { bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.25)", color: "#F59E0B", icon: "⚠" },
    bad:  { bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.25)",  color: "#EF4444", icon: "✗" },
  }[insight.type];
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: "10px 14px", ...M, color: DS.t2, lineHeight: 1.65, marginBottom: 14 }}>
      <span style={{ color: cfg.color, fontWeight: 700, marginRight: 8 }}>{cfg.icon}</span>
      {insight.text}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PythonMutabilityViz() {
  const [tab, setTab]   = useState(0);
  const [step, setStep] = useState(0);

  const steps = [MUTATION_STEPS, ALIAS_STEPS, DEEP_STEPS][tab];
  const s     = steps[step];

  const goNext  = () => setStep(i => Math.min(i + 1, steps.length - 1));
  const goPrev  = () => setStep(i => Math.max(i - 1, 0));
  const reset   = () => setStep(0);

  const tabStyle = (i) => ({
    background: tab === i ? DS.indB : "rgba(255,255,255,0.04)",
    border: `1px solid ${tab === i ? DS.ind : DS.border}`,
    borderRadius: 6, padding: "6px 14px",
    color: tab === i ? "#fff" : DS.t2,
    ...M, cursor: "pointer", fontWeight: tab === i ? 700 : 400,
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Memory Explorer — Mutability & Identity
      </div>
      <p style={{ ...M, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        Each box is a real memory slot. <span style={{ color: DS.grn }}>Green id</span> = same object. <span style={{ color: DS.ind }}>Indigo id</span> = new object. <span style={{ color: "#EF4444" }}>Red</span> = silent mutation bug.
      </p>

      {/* Tab row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <button key={t} type="button" style={tabStyle(i)} onClick={() => { setTab(i); setStep(0); }}>{t}</button>
        ))}
      </div>

      {/* Code line */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: DS.t3, ...M, letterSpacing: "0.1em", marginBottom: 6 }}>STEP {step + 1} / {steps.length}</div>
        <pre style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "10px 14px", ...M, color: DS.t2, margin: 0, lineHeight: 1.7 }}>
          {s.code}
        </pre>
      </div>

      {/* Memory blocks — Mutation & Alias */}
      {tab < 2 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
          {s.blocks.map((b, i) => (
            <MemoryBlock key={i} {...b} />
          ))}
          {s.arrow && (
            <div style={{ display: "flex", alignItems: "center", ...M, color: "#F59E0B", fontSize: 18, alignSelf: "center" }}>→</div>
          )}
        </div>
      )}

      {/* Memory blocks — Shallow vs Deep */}
      {tab === 2 && (
        <div style={{ marginBottom: 14 }}>
          {s.outer && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: DS.t3, ...M, letterSpacing: "0.1em", marginBottom: 6 }}>OUTER LIST</div>
              <MemoryBlock name={s.outer.name} id={s.outer.id} status={s.outer.status} label={s.outer.label} />
            </div>
          )}
          {s.inner && (
            <div>
              <div style={{ fontSize: 10, color: DS.t3, ...M, letterSpacing: "0.1em", marginBottom: 6 }}>INNER LISTS</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {s.inner.map((item, i) => (
                  <MemoryBlock key={i}
                    name={item.label}
                    id={item.id}
                    value={item.value}
                    status={item.status || (item.shared ? (s.outer?.status === "bad" ? "bad" : "alias") : "neutral")}
                    label={item.shared ? "shared ref" : undefined}
                    small
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insight */}
      <Insight insight={s.insight} />

      {/* Navigation */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={goPrev} disabled={step === 0}
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "7px 16px", color: step === 0 ? DS.dim : DS.t2, ...M, cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1 }}>
          ← prev
        </button>
        <button type="button" onClick={goNext} disabled={step === steps.length - 1}
          style={{ background: step === steps.length - 1 ? "rgba(255,255,255,0.02)" : DS.indB, border: "none", borderRadius: 6, padding: "7px 20px", color: "#fff", ...M, fontWeight: 700, cursor: step === steps.length - 1 ? "not-allowed" : "pointer", opacity: step === steps.length - 1 ? 0.4 : 1 }}>
          next →
        </button>
        <button type="button" onClick={reset}
          style={{ background: "transparent", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "7px 14px", color: DS.t3, ...M, cursor: "pointer" }}>
          reset
        </button>
        <span style={{ ...M, fontSize: 10, color: DS.dim }}>
          {"●".repeat(step + 1)}{"○".repeat(steps.length - step - 1)}
        </span>
      </div>
    </div>
  );
}
