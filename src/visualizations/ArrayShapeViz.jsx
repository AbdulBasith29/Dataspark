import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const MONO = { fontFamily: "var(--ds-mono)", fontSize: 12 };

// Generate a flat array of values
const makeData = (n) => Array.from({ length: n }, (_, i) => i);

const OPERATIONS = [
  {
    id: "1d",
    label: "1D array",
    code: "np.arange(12)\n# shape: (12,)",
    shape: [12],
  },
  {
    id: "reshape-3x4",
    label: "reshape(3, 4)",
    code: "arr.reshape(3, 4)\n# shape: (3, 4)",
    shape: [3, 4],
  },
  {
    id: "reshape-2x6",
    label: "reshape(2, 6)",
    code: "arr.reshape(2, 6)\n# shape: (2, 6)",
    shape: [2, 6],
  },
  {
    id: "reshape-4x3",
    label: "reshape(4, 3)",
    code: "arr.reshape(4, 3)\n# shape: (4, 3)",
    shape: [4, 3],
  },
  {
    id: "reshape-2x2x3",
    label: "reshape(2,2,3)",
    code: "arr.reshape(2, 2, 3)\n# shape: (2, 2, 3)\n# 3D tensor!",
    shape: [2, 2, 3],
  },
];

const AXES_INFO = [
  { axis: 0, label: "axis=0", desc: "Reduces along rows — result has one value per column", example: "X.mean(axis=0)  →  column means" },
  { axis: 1, label: "axis=1", desc: "Reduces along columns — result has one value per row", example: "X.sum(axis=1)   →  row sums" },
];

export default function ArrayShapeViz() {
  const [activeOp, setActiveOp] = useState(1); // default reshape(3,4)
  const [activeAxis, setActiveAxis] = useState(null);

  const op = OPERATIONS[activeOp];
  const data = makeData(12);

  // Render array as grid
  const renderGrid = (shape) => {
    if (shape.length === 1) {
      // 1D: single row
      return (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {data.map((v, i) => (
            <div key={i} style={cellStyle(activeAxis === 0 ? i % shape[0] : activeAxis === 1 ? Math.floor(i / shape[0]) : null, i, shape[0], 1)}>
              {v}
            </div>
          ))}
        </div>
      );
    }
    if (shape.length === 2) {
      const [rows, cols] = shape;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: cols }, (_, c) => {
                const idx = r * cols + c;
                const isAxisHighlight = activeAxis === 0 ? true : activeAxis === 1 ? r === 0 : false; // just a demo highlight
                return (
                  <div key={c} style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    background: activeAxis === 0 ? `rgba(129,140,248,${0.05 + (c / cols) * 0.25})` :
                                activeAxis === 1 ? `rgba(52,211,153,${0.05 + (r / rows) * 0.25})` :
                                "rgba(255,255,255,0.06)",
                    border: `1px solid ${DS.border}`,
                    borderRadius: 4,
                    ...MONO, color: DS.t1, fontWeight: 600, fontSize: 11,
                  }}>
                    {data[idx]}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }
    if (shape.length === 3) {
      const [d1, d2, d3] = shape;
      return (
        <div style={{ display: "flex", gap: 16 }}>
          {Array.from({ length: d1 }, (_, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, color: DS.ind, ...MONO, marginBottom: 4 }}>block {i}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {Array.from({ length: d2 }, (_, r) => (
                  <div key={r} style={{ display: "flex", gap: 3 }}>
                    {Array.from({ length: d3 }, (_, c) => {
                      const idx = i * d2 * d3 + r * d3 + c;
                      return (
                        <div key={c} style={{
                          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(255,255,255,0.06)", border: `1px solid ${DS.border}`,
                          borderRadius: 4, ...MONO, color: DS.t1, fontSize: 11,
                        }}>
                          {data[idx]}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  const cellStyle = () => ({
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(255,255,255,0.06)", border: `1px solid ${DS.border}`,
    borderRadius: 4, ...MONO, color: DS.t1, fontWeight: 600, fontSize: 11,
  });

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        NumPy array shapes & axes
      </div>
      <p style={{ ...MONO, color: DS.t3, lineHeight: 1.55, marginBottom: 16 }}>
        The same 12 values, reshaped into different dimensions. Same data — different structure.
      </p>

      {/* Reshape buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {OPERATIONS.map((o, i) => (
          <button key={o.id} type="button"
            onClick={() => setActiveOp(i)}
            style={{
              background: activeOp === i ? DS.indB : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeOp === i ? DS.ind : DS.border}`,
              borderRadius: 6, padding: "6px 12px",
              color: activeOp === i ? "#fff" : DS.t2,
              ...MONO, cursor: "pointer", fontWeight: activeOp === i ? 700 : 400,
            }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Code + grid side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, marginBottom: 20, alignItems: "start" }}>
        <pre style={{
          background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}`,
          borderRadius: 8, padding: "12px 14px", ...MONO, color: DS.t2,
          margin: 0, lineHeight: 1.7,
        }}>
          {op.code}
        </pre>
        <div>
          <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 8 }}>
            VISUAL — shape {JSON.stringify(op.shape)}
          </div>
          {renderGrid(op.shape)}
        </div>
      </div>

      {/* Axis demo */}
      <div>
        <div style={{ fontSize: 10, color: DS.t3, ...MONO, letterSpacing: "0.1em", marginBottom: 10 }}>
          AXIS DIRECTION — for a (3,4) array:
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {AXES_INFO.map(a => (
            <button key={a.axis} type="button"
              onClick={() => setActiveAxis(activeAxis === a.axis ? null : a.axis)}
              style={{
                background: activeAxis === a.axis ? (a.axis === 0 ? "rgba(129,140,248,0.2)" : "rgba(52,211,153,0.2)") : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeAxis === a.axis ? (a.axis === 0 ? DS.ind : DS.grn) : DS.border}`,
                borderRadius: 6, padding: "6px 14px",
                color: activeAxis === a.axis ? (a.axis === 0 ? DS.ind : DS.grn) : DS.t2,
                ...MONO, cursor: "pointer", fontWeight: activeAxis === a.axis ? 700 : 400,
              }}>
              {a.label}
            </button>
          ))}
        </div>
        {activeAxis !== null && (
          <div style={{ background: `rgba(${activeAxis === 0 ? "129,140,248" : "52,211,153"},0.06)`, border: `1px solid rgba(${activeAxis === 0 ? "129,140,248" : "52,211,153"},0.2)`, borderRadius: 8, padding: "10px 14px", ...MONO, color: DS.t2, lineHeight: 1.7 }}>
            <div style={{ color: activeAxis === 0 ? DS.ind : DS.grn, fontWeight: 700, marginBottom: 4 }}>{AXES_INFO[activeAxis].label}</div>
            <div>{AXES_INFO[activeAxis].desc}</div>
            <div style={{ color: activeAxis === 0 ? DS.ind : DS.grn, marginTop: 4 }}>{AXES_INFO[activeAxis].example}</div>
          </div>
        )}
      </div>
    </div>
  );
}
