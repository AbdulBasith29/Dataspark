import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

// Simulate class vs instance attributes
const CLASS_ATTRS = { default_batch_size: 1000, version: "2.0" };

const makeInstance = (id, source, batchSize) => ({
  id,
  source,
  batch_size: batchSize || CLASS_ATTRS.default_batch_size,
  _records: 0,
});

export default function ObjectMemoryViz() {
  const [instances, setInstances] = useState([
    makeInstance("p1", "s3://data/orders.csv", null),
  ]);
  const [activeId, setActiveId] = useState("p1");
  const [classVersion, setClassVersion] = useState("2.0");
  const [log, setLog] = useState("Click an instance to inspect it, or add a new one.");

  const addInstance = () => {
    const sources = ["postgres://db/users", "s3://logs/events.json", "kafka://topic/clicks"];
    const id = `p${instances.length + 1}`;
    const newInst = makeInstance(id, sources[instances.length % sources.length], (instances.length + 1) * 500);
    setInstances(prev => [...prev, newInst]);
    setActiveId(id);
    setLog(`Created new instance ${id}. Each instance has its own source and batch_size — but they all share the class-level default_batch_size.`);
  };

  const updateClassAttr = () => {
    const newV = classVersion === "2.0" ? "3.0" : "2.0";
    setClassVersion(newV);
    setLog(`Changed Pipeline.version to "${newV}". ALL instances see the new value immediately — class attributes are shared.`);
  };

  const active = instances.find(i => i.id === activeId);

  const boxStyle = (highlight) => ({
    background: highlight ? "rgba(129,140,248,0.1)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${highlight ? DS.ind : DS.border}`,
    borderRadius: 8,
    padding: "12px 14px",
    ...MONO,
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Class vs instance attributes
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        Class attributes are <span style={{ color: DS.ind }}>shared</span> across all instances. Instance attributes (<code>self.x</code>) belong to each object independently.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 16 }}>
        {/* Class block */}
        <div>
          <div style={{ fontSize: 10, color: DS.ind, ...MONO, letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>
            CLASS  Pipeline
          </div>
          <div style={boxStyle(false)}>
            <div style={{ color: DS.t3, marginBottom: 6, fontSize: 11 }}>class attributes (shared)</div>
            <div style={{ color: DS.t2 }}>default_batch_size = <span style={{ color: DS.grn }}>1000</span></div>
            <div style={{ color: DS.t2 }}>
              version = <span style={{ color: DS.grn }}>"{classVersion}"</span>
              <button type="button" onClick={updateClassAttr}
                style={{ marginLeft: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${DS.border}`, borderRadius: 4, padding: "2px 8px", color: DS.t3, ...MONO, fontSize: 10, cursor: "pointer" }}>
                change
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={addInstance}
              disabled={instances.length >= 3}
              style={{
                background: instances.length >= 3 ? "rgba(255,255,255,0.02)" : DS.indB,
                border: "none", borderRadius: 6, padding: "8px 16px", color: "#fff",
                ...MONO, fontWeight: 700, cursor: instances.length >= 3 ? "not-allowed" : "pointer",
                opacity: instances.length >= 3 ? 0.4 : 1, width: "100%",
              }}>
              + Pipeline() → new instance
            </button>
          </div>
        </div>

        {/* Instances */}
        <div>
          <div style={{ fontSize: 10, color: DS.grn, ...MONO, letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>
            INSTANCES (in memory)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {instances.map(inst => (
              <button key={inst.id} type="button"
                onClick={() => { setActiveId(inst.id); setLog(`Inspecting ${inst.id}: source="${inst.source}", batch_size=${inst.batch_size}. These are instance attributes — unique to this object.`); }}
                style={{
                  ...boxStyle(activeId === inst.id),
                  textAlign: "left", cursor: "pointer", width: "100%",
                }}>
                <div style={{ color: DS.ind, fontWeight: 700, marginBottom: 4 }}>{inst.id}</div>
                <div style={{ color: DS.t3, fontSize: 11 }}>source = <span style={{ color: DS.t2 }}>"{inst.source}"</span></div>
                <div style={{ color: DS.t3, fontSize: 11 }}>batch_size = <span style={{ color: DS.t2 }}>{inst.batch_size}</span></div>
                <div style={{ color: DS.t3, fontSize: 11 }}>version → <span style={{ color: DS.ind }}>Pipeline.version</span> = <span style={{ color: DS.grn }}>"{classVersion}"</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log */}
      <div style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2, lineHeight: 1.65, marginBottom: 14 }}>
        {log}
      </div>

      {/* Code reference */}
      <pre style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2, margin: 0, lineHeight: 1.7 }}>
        {`class Pipeline:\n    version = "${classVersion}"           # class attr — shared\n    default_batch_size = 1000  # class attr — shared\n\n    def __init__(self, source, batch_size=None):\n        self.source = source        # instance attr\n        self.batch_size = batch_size or self.default_batch_size`}
      </pre>
    </div>
  );
}
