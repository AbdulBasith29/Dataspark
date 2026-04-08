import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const CODE = { fontFamily: "var(--ds-mono)", fontSize: 12 };

export default function FStringBuilderViz() {
  const [name, setName]   = useState("Alice");
  const [score, setScore] = useState("94.7");
  const [city, setCity]   = useState("New York");
  const [activeMethod, setActiveMethod] = useState(null);

  const nameVal  = name  || "…";
  const scoreVal = parseFloat(score) || 0;
  const cityVal  = city  || "…";

  // f-string output
  const fstring = `User ${nameVal} scored ${scoreVal.toFixed(1)}% — from ${cityVal}`;

  // string method demos
  const methods = [
    { label: ".upper()",        input: nameVal,  result: nameVal.toUpperCase() },
    { label: ".lower()",        input: cityVal,  result: cityVal.toLowerCase() },
    { label: ".strip()",        input: `  ${nameVal}  `, result: nameVal },
    { label: ".split()",        input: `${nameVal} Smith`, result: JSON.stringify(`${nameVal} Smith`.split(" ")) },
    { label: ".replace()",      input: cityVal,  result: cityVal.replace(" ", "_") },
    { label: ".startswith()",   input: nameVal,  result: String(nameVal.startsWith("A")) },
  ];

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${DS.border}`,
    borderRadius: 8,
    padding: "8px 10px",
    color: DS.t1,
    fontSize: 13,
    fontFamily: "var(--ds-mono)",
    width: "100%",
    outline: "none",
  };

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        f-string live builder
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono)", lineHeight: 1.55, marginBottom: 20 }}>
        Edit the variables — watch the f-string output update instantly.
      </p>

      {/* Variable inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "name", value: name, set: setName },
          { label: "score", value: score, set: setScore },
          { label: "city", value: city, set: setCity },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: DS.ind, fontFamily: "var(--ds-mono)", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>
              {label} =
            </div>
            <input
              value={value}
              onChange={e => set(e.target.value)}
              style={inputStyle}
              spellCheck={false}
            />
          </div>
        ))}
      </div>

      {/* f-string template */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono)", letterSpacing: "0.1em", marginBottom: 6 }}>
          TEMPLATE
        </div>
        <pre style={{
          ...CODE,
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${DS.border}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: DS.t2,
          margin: 0,
        }}>
          {`f"User `}<span style={{ color: DS.ind }}>{`{name}`}</span>{` scored `}<span style={{ color: DS.ind }}>{`{score:.1f}`}</span>{`% — from `}<span style={{ color: DS.ind }}>{`{city}`}</span>{`"`}
        </pre>
      </div>

      {/* Live output */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono)", letterSpacing: "0.1em", marginBottom: 6 }}>
          OUTPUT
        </div>
        <div style={{
          background: "rgba(52,211,153,0.06)",
          border: `1px solid rgba(52,211,153,0.25)`,
          borderRadius: 8,
          padding: "12px 14px",
          ...CODE,
          color: DS.grn,
          fontWeight: 600,
        }}>
          "{fstring}"
        </div>
      </div>

      {/* String methods */}
      <div>
        <div style={{ fontSize: 10, color: DS.t3, fontFamily: "var(--ds-mono)", letterSpacing: "0.1em", marginBottom: 10 }}>
          STRING METHODS — click to see result
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {methods.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveMethod(activeMethod === i ? null : i)}
              style={{
                background: activeMethod === i ? DS.indB : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeMethod === i ? DS.ind : DS.border}`,
                borderRadius: 6,
                padding: "6px 12px",
                color: activeMethod === i ? "#fff" : DS.t2,
                ...CODE,
                cursor: "pointer",
                fontWeight: activeMethod === i ? 700 : 400,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        {activeMethod !== null && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${DS.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            ...CODE,
            color: DS.t2,
            lineHeight: 1.7,
          }}>
            <span style={{ color: DS.ind }}>{`"${methods[activeMethod].input}"`}</span>
            <span style={{ color: DS.t3 }}>{methods[activeMethod].label}</span>
            <span style={{ color: DS.t3 }}> → </span>
            <span style={{ color: DS.grn, fontWeight: 600 }}>{methods[activeMethod].result}</span>
          </div>
        )}
      </div>
    </div>
  );
}
