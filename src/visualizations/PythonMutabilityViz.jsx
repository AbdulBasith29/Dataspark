import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function PythonMutabilityViz() {
  const [listA, setListA] = useState([1, 2, 3]);
  const [tupleA] = useState([1, 2, 3]);
  const [log, setLog] = useState("Tap an action — watch what mutates.");

  const codeStyle = {
    fontFamily: "var(--ds-mono)",
    fontSize: 12,
    lineHeight: 1.65,
    color: DS.t2,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${DS.border}`,
    borderRadius: 10,
    padding: "12px 14px",
  };

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Lists vs tuples (mutability)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono)", lineHeight: 1.55, marginBottom: 16 }}>
        Lists are mutable — methods like <code style={{ color: DS.ind }}>.append()</code> change the object in place. Tuples are fixed sequences; &quot;changing&quot; one means making a new tuple.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={codeStyle}>
          <div style={{ fontSize: 9, color: DS.grn, letterSpacing: 1.2, marginBottom: 8 }}>LIST</div>
          <div style={{ color: DS.ind }}>a</div> = {JSON.stringify(listA)}
        </div>
        <div style={codeStyle}>
          <div style={{ fontSize: 9, color: DS.t3, letterSpacing: 1.2, marginBottom: 8 }}>TUPLE (simulated)</div>
          <div style={{ color: DS.ind }}>t</div> = {JSON.stringify(tupleA)}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => {
            setListA((prev) => [...prev, prev.length + 1]);
            setLog("List: appended in place — same object, new item.");
          }}
          style={{
            background: DS.indB,
            border: "none",
            borderRadius: DS.radiusSm,
            padding: "8px 14px",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
            fontFamily: "var(--ds-mono)",
            cursor: "pointer",
            boxShadow: DS.shadowCta,
          }}
        >
          a.append(next)
        </button>
        <button
          type="button"
          onClick={() => {
            setLog('Tuple: no .append — you would write t = (*t, new) to build a new tuple.');
          }}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusSm,
            padding: "8px 14px",
            color: DS.t2,
            fontWeight: 600,
            fontSize: 12,
            fontFamily: "var(--ds-mono)",
            cursor: "pointer",
          }}
        >
          t.append(?) — explain
        </button>
        <button
          type="button"
          onClick={() => {
            setListA([1, 2, 3]);
            setLog("Reset list to [1, 2, 3].");
          }}
          style={{
            background: "transparent",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusSm,
            padding: "8px 14px",
            color: DS.t3,
            fontSize: 12,
            fontFamily: "var(--ds-mono)",
            cursor: "pointer",
          }}
        >
          Reset list
        </button>
      </div>
      <div
        style={{
          fontSize: 12,
          color: DS.t2,
          fontFamily: "var(--ds-sans)",
          lineHeight: 1.6,
          padding: "12px 14px",
          borderRadius: 10,
          border: `1px solid rgba(52,211,153,0.2)`,
          background: "rgba(52,211,153,0.06)",
        }}
      >
        {log}
      </div>
    </div>
  );
}
