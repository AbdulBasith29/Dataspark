import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

// Generator yields
const GENERATOR_STEPS = [
  { step: 0, code: "def gen():\n    print('before 1')\n    yield 1\n    print('before 2')\n    yield 2\n    print('before 3')\n    yield 3", yields: [] },
  { step: 1, yielded: 1, log: "Runs until first yield → pauses, returns 1", state: "paused after yield 1" },
  { step: 2, yielded: 2, log: "Resumes from pause, runs until next yield → pauses, returns 2", state: "paused after yield 2" },
  { step: 3, yielded: 3, log: "Resumes again, yields 3 → one more next() raises StopIteration", state: "paused after yield 3" },
  { step: 4, yielded: null, log: "StopIteration raised — generator is exhausted", state: "exhausted" },
];

const BATCH_GEN_CODE = `def read_in_batches(data, size=3):\n    batch = []\n    for item in data:\n        batch.append(item)\n        if len(batch) == size:\n            yield batch\n            batch = []  # reset!\n    if batch:\n        yield batch  # last partial`;

const BATCH_DATA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const BATCHES = [[1,2,3], [4,5,6], [7,8,9], [10]];

export default function IteratorStepViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [batchIdx, setBatchIdx] = useState(-1);
  const [activeTab, setActiveTab] = useState("step");

  const stepData = GENERATOR_STEPS[stepIdx];
  const yielded = GENERATOR_STEPS.slice(1, stepIdx + 1).filter(s => s.yielded !== null).map(s => s.yielded);

  const tabStyle = (active) => ({
    background: active ? DS.indB : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? DS.ind : DS.border}`,
    borderRadius: 6, padding: "6px 16px",
    color: active ? "#fff" : DS.t2,
    ...MONO, cursor: "pointer", fontWeight: active ? 700 : 400,
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Generators: lazy execution step-by-step
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        A generator pauses at each <code style={{ color: DS.ind }}>yield</code> — execution resumes only when <code style={{ color: DS.ind }}>next()</code> is called.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button type="button" style={tabStyle(activeTab === "step")} onClick={() => setActiveTab("step")}>step-through</button>
        <button type="button" style={tabStyle(activeTab === "batch")} onClick={() => setActiveTab("batch")}>batch generator</button>
      </div>

      {activeTab === "step" && (
        <>
          {/* Generator code */}
          <pre style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
            borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2,
            margin: "0 0 16px", lineHeight: 1.7,
          }}>
            {`def gen():\n    yield 1\n    yield 2\n    yield 3\n\ng = gen()  # nothing runs yet!`}
          </pre>

          {/* Step controls */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <button type="button"
              onClick={() => setStepIdx(Math.min(stepIdx + 1, GENERATOR_STEPS.length - 1))}
              disabled={stepIdx >= GENERATOR_STEPS.length - 1}
              style={{
                background: stepIdx >= GENERATOR_STEPS.length - 1 ? "rgba(255,255,255,0.02)" : DS.indB,
                border: "none", borderRadius: 6, padding: "8px 20px",
                color: "#fff", ...MONO, fontWeight: 700, cursor: stepIdx >= GENERATOR_STEPS.length - 1 ? "not-allowed" : "pointer",
                opacity: stepIdx >= GENERATOR_STEPS.length - 1 ? 0.4 : 1,
              }}>
              next(g) →
            </button>
            <button type="button"
              onClick={() => setStepIdx(0)}
              style={{ background: "transparent", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "8px 16px", color: DS.t3, ...MONO, cursor: "pointer" }}>
              reset
            </button>
            <span style={{ ...MONO, color: DS.t3, fontSize: 11 }}>
              {stepIdx === 0 ? "g created — nothing has run yet" : GENERATOR_STEPS[stepIdx]?.state}
            </span>
          </div>

          {/* State display */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>RETURNED SO FAR</div>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
                borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.grn, fontWeight: 600, minHeight: 40,
              }}>
                {yielded.length === 0 ? <span style={{ color: DS.t3 }}>nothing yet</span> : `[${yielded.join(", ")}]`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 6 }}>LATEST CALL</div>
              <div style={{
                background: stepIdx > 0 && stepIdx < GENERATOR_STEPS.length - 1 ? "rgba(129,140,248,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${stepIdx > 0 && stepIdx < GENERATOR_STEPS.length - 1 ? DS.ind : DS.border}`,
                borderRadius: 8, padding: "10px 14px", ...MONO,
                color: stepIdx === GENERATOR_STEPS.length - 1 ? "#EF4444" : DS.ind,
                fontWeight: 600, minHeight: 40,
              }}>
                {stepIdx === 0 ? <span style={{ color: DS.t3 }}>—</span>
                  : stepIdx === GENERATOR_STEPS.length - 1 ? "StopIteration"
                  : `→ ${GENERATOR_STEPS[stepIdx].yielded}`}
              </div>
            </div>
          </div>

          {stepIdx > 0 && stepIdx < GENERATOR_STEPS.length && (
            <div style={{ background: "rgba(129,140,248,0.06)", border: `1px solid rgba(129,140,248,0.2)`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2, lineHeight: 1.6 }}>
              {GENERATOR_STEPS[stepIdx].log}
            </div>
          )}
        </>
      )}

      {activeTab === "batch" && (
        <>
          <pre style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
            borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2,
            margin: "0 0 16px", lineHeight: 1.7,
          }}>
            {BATCH_GEN_CODE}
          </pre>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 8 }}>
              DATA: {JSON.stringify(BATCH_DATA)} — click to receive batches
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BATCHES.map((batch, i) => (
                <button key={i} type="button"
                  onClick={() => setBatchIdx(i)}
                  style={{
                    background: batchIdx >= i ? DS.indB : "rgba(255,255,255,0.04)",
                    border: `1px solid ${batchIdx >= i ? DS.ind : DS.border}`,
                    borderRadius: 6, padding: "8px 14px",
                    color: batchIdx >= i ? "#fff" : DS.t2,
                    ...MONO, cursor: "pointer",
                  }}>
                  next() → batch {i + 1}
                </button>
              ))}
              <button type="button" onClick={() => setBatchIdx(-1)}
                style={{ background: "transparent", border: `1px solid ${DS.border}`, borderRadius: 6, padding: "8px 14px", color: DS.t3, ...MONO, cursor: "pointer" }}>
                reset
              </button>
            </div>
          </div>

          {batchIdx >= 0 && (
            <div style={{ background: "rgba(52,211,153,0.06)", border: `1px solid rgba(52,211,153,0.2)`, borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.grn, fontWeight: 600 }}>
              batch {batchIdx + 1}: {JSON.stringify(BATCHES[batchIdx])}
              <span style={{ color: DS.t3, fontWeight: 400, marginLeft: 12 }}>
                — only these {BATCHES[batchIdx].length} items in memory
              </span>
            </div>
          )}

          <div style={{ marginTop: 14, ...MONO, fontSize: 11, color: DS.t3, lineHeight: 1.6 }}>
            ◈ Each batch is produced lazily — the generator holds only the current batch in memory, not all 10 items at once. For a 10GB file this means 10MB in memory instead of 10GB.
          </div>
        </>
      )}
    </div>
  );
}
