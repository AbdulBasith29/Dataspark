import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

const INITIAL_DICT = { user_id: "u_001", name: "Alice", score: 94, active: true };
const SET_A = new Set(["alice", "bob", "carol", "dave"]);
const SET_B = new Set(["bob", "dave", "eve", "frank"]);

export default function DictSetOpsViz() {
  const [dict, setDict]       = useState({ ...INITIAL_DICT });
  const [log, setLog]         = useState("Click an operation to see what happens.");
  const [activeTab, setActiveTab] = useState("dict");
  const [setOp, setSetOp]     = useState(null);

  const dictOps = [
    {
      label: "get()",
      code: `d.get("score", 0)`,
      run: () => {
        setLog(`d.get("score", 0)  →  ${dict.score ?? 0}\n\nSafer than d["score"] — returns the default instead of raising KeyError if the key is missing.`);
      },
    },
    {
      label: "keys()",
      code: `list(d.keys())`,
      run: () => setLog(`list(d.keys())  →  ${JSON.stringify(Object.keys(dict))}`),
    },
    {
      label: "values()",
      code: `list(d.values())`,
      run: () => setLog(`list(d.values())  →  ${JSON.stringify(Object.values(dict))}`),
    },
    {
      label: "items()",
      code: `for k, v in d.items()`,
      run: () => setLog(`d.items()  →  [\n${Object.entries(dict).map(([k,v]) => `  ("${k}", ${JSON.stringify(v)})`).join(",\n")}\n]\n\nUse this for iterating key-value pairs.`),
    },
    {
      label: "update()",
      code: `d.update({"score": 99})`,
      run: () => {
        const updated = { ...dict, score: 99 };
        setDict(updated);
        setLog(`d.update({"score": 99})  →  score changed from ${dict.score} to 99\n\nupdate() merges another dict in-place. Existing keys are overwritten.`);
      },
    },
    {
      label: "pop()",
      code: `d.pop("active")`,
      run: () => {
        const { active, ...rest } = dict;
        setDict(rest);
        setLog(`d.pop("active")  →  removed key "active" (was ${JSON.stringify(active)})\n\nReturns the value while removing the key. Raises KeyError if missing (use pop(key, default) to be safe).`);
      },
    },
    {
      label: "reset",
      code: `# reset`,
      run: () => { setDict({ ...INITIAL_DICT }); setLog("Dict reset to original."); },
    },
  ];

  const setOpResults = {
    "intersection": {
      code: "A & B",
      label: "Intersection (A & B)",
      result: [...SET_A].filter(x => SET_B.has(x)),
      note: "Users in BOTH A and B — e.g. users who visited AND purchased.",
    },
    "union": {
      code: "A | B",
      label: "Union (A | B)",
      result: [...new Set([...SET_A, ...SET_B])],
      note: "All unique users across both sets.",
    },
    "difference": {
      code: "A - B",
      label: "Difference (A - B)",
      result: [...SET_A].filter(x => !SET_B.has(x)),
      note: "Users in A but NOT in B — e.g. users who visited but didn't purchase.",
    },
    "symmetric": {
      code: "A ^ B",
      label: "Symmetric Diff (A ^ B)",
      result: [...SET_A].filter(x => !SET_B.has(x)).concat([...SET_B].filter(x => !SET_A.has(x))),
      note: "Users in one set but not both — exclusive to each group.",
    },
  };

  const tabStyle = (active) => ({
    background: active ? DS.indB : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? DS.ind : DS.border}`,
    borderRadius: 6,
    padding: "6px 16px",
    color: active ? "#fff" : DS.t2,
    ...MONO,
    cursor: "pointer",
    fontWeight: active ? 700 : 400,
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Dictionaries & Sets
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        Click operations to see what each method does to the data.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button type="button" style={tabStyle(activeTab === "dict")} onClick={() => setActiveTab("dict")}>dict ops</button>
        <button type="button" style={tabStyle(activeTab === "set")}  onClick={() => setActiveTab("set")}>set ops</button>
      </div>

      {activeTab === "dict" && (
        <>
          {/* Current dict state */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>CURRENT STATE</div>
            <pre style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2, margin: 0 }}>
              {`d = {\n${Object.entries(dict).map(([k,v]) => `  "${k}": ${JSON.stringify(v)}`).join(",\n")}\n}`}
            </pre>
          </div>

          {/* Op buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {dictOps.map((op, i) => (
              <button key={i} type="button" onClick={op.run}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "6px 12px", color: DS.t2, ...MONO, cursor: "pointer" }}>
                {op.label}
              </button>
            ))}
          </div>

          {/* Log */}
          <pre style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {log}
          </pre>
        </>
      )}

      {activeTab === "set" && (
        <>
          {/* Set labels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["A", SET_A, DS.ind], ["B", SET_B, DS.grn]].map(([label, s, color]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>SET {label}</div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2 }}>
                  {`{${[...s].map(x => `"${x}"`).join(", ")}}`}
                </div>
              </div>
            ))}
          </div>

          {/* Set operation buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {Object.entries(setOpResults).map(([key, op]) => (
              <button key={key} type="button"
                onClick={() => setSetOp(key)}
                style={{ background: setOp === key ? DS.indB : "rgba(255,255,255,0.04)", border: `1px solid ${setOp === key ? DS.ind : DS.border}`, borderRadius: 6, padding: "6px 12px", color: setOp === key ? "#fff" : DS.t2, ...MONO, cursor: "pointer", fontWeight: setOp === key ? 700 : 400 }}>
                {op.code}
              </button>
            ))}
          </div>

          {setOp && (
            <div style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "12px 14px", ...MONO, lineHeight: 1.7 }}>
              <div style={{ color: DS.ind, fontWeight: 700, marginBottom: 6 }}>{setOpResults[setOp].label}</div>
              <div style={{ color: DS.grn, marginBottom: 8 }}>
                {`{${setOpResults[setOp].result.map(x => `"${x}"`).join(", ")}}`}
              </div>
              <div style={{ color: DS.t3, fontSize: 11 }}>{setOpResults[setOp].note}</div>
            </div>
          )}

          <div style={{ marginTop: 14, ...MONO, fontSize: 11, color: DS.t3, lineHeight: 1.6 }}>
            ◈ <strong style={{ color: DS.t2 }}>O(1) lookup:</strong> "alice" in A → True. Membership tests on sets are instant regardless of size — converting a list to a set before repeated lookups changes O(n²) to O(n).
          </div>
        </>
      )}
    </div>
  );
}
