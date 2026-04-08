import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const FUNCTIONS = ["relu", "sigmoid", "tanh", "leaky_relu"];

function f(x, type) {
  if (type === "relu") return Math.max(0, x);
  if (type === "sigmoid") return 1 / (1 + Math.exp(-x));
  if (type === "tanh") return Math.tanh(x);
  return x >= 0 ? x : 0.1 * x;
}

function fp(x, type) {
  if (type === "relu") return x > 0 ? 1 : 0;
  if (type === "sigmoid") {
    const s = 1 / (1 + Math.exp(-x));
    return s * (1 - s);
  }
  if (type === "tanh") {
    const t = Math.tanh(x);
    return 1 - t * t;
  }
  return x >= 0 ? 1 : 0.1;
}

const COLORS = {
  relu: "rgba(129, 140, 248, 0.95)",
  sigmoid: "rgba(52, 211, 153, 0.95)",
  tanh: "rgba(251, 191, 36, 0.95)",
  leaky_relu: "rgba(248, 113, 113, 0.95)",
};

export default function ActivationFunctions() {
  const [x, setX] = useState(-0.8);
  const [showGrad, setShowGrad] = useState(true);
  const [focus, setFocus] = useState("relu");
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 290;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 34;
    const w = cssW - 2 * pad;
    const h = cssH - 2 * pad;
    const tx = (u) => pad + ((u + 3) / 6) * w;
    const ty = (v) => pad + (1 - (v + 1.3) / 2.6) * h;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, w, h);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
    ctx.beginPath();
    ctx.moveTo(tx(-3), ty(0));
    ctx.lineTo(tx(3), ty(0));
    ctx.moveTo(tx(0), ty(-1.3));
    ctx.lineTo(tx(0), ty(1.3));
    ctx.stroke();

    FUNCTIONS.forEach((name) => {
      ctx.beginPath();
      for (let i = 0; i <= 220; i++) {
        const xx = -3 + (i / 220) * 6;
        const yy = f(xx, name);
        if (i === 0) ctx.moveTo(tx(xx), ty(yy));
        else ctx.lineTo(tx(xx), ty(yy));
      }
      const active = focus === name;
      ctx.strokeStyle = COLORS[name].replace("0.95", active ? "0.95" : "0.42");
      ctx.lineWidth = active ? 2.8 : 1.7;
      ctx.stroke();
    });

    const y = f(x, focus);
    const slope = fp(x, focus);
    const m = showGrad ? slope : 0;

    ctx.beginPath();
    ctx.arc(tx(x), ty(y), 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[focus];
    ctx.fill();

    if (showGrad) {
      const dx = 0.8;
      const x0 = x - dx;
      const y0 = y - m * dx;
      const x1 = x + dx;
      const y1 = y + m * dx;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(tx(x0), ty(y0));
      ctx.lineTo(tx(x1), ty(y1));
      ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("x", cssW / 2 - 3, cssH - 8);
    ctx.save();
    ctx.translate(12, cssH / 2 + 22);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("f(x)", 0, 0);
    ctx.restore();

    let ly = 16;
    FUNCTIONS.forEach((name) => {
      ctx.fillStyle = COLORS[name].replace("0.95", focus === name ? "0.95" : "0.55");
      ctx.fillRect(cssW - 138, ly - 8, 9, 9);
      ctx.fillStyle = DS.t2;
      ctx.fillText(name, cssW - 123, ly);
      ly += 14;
    });

    ctx.fillStyle = DS.t2;
    ctx.fillText(
      `focus ${focus}: f(${x.toFixed(2)})=${y.toFixed(3)}${showGrad ? `, f'=${slope.toFixed(3)}` : ""}`,
      14,
      16
    );
  }, [x, showGrad, focus]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Activation functions compared
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        ReLU, sigmoid, tanh, and leaky ReLU shape gradient flow differently. Drag x to inspect output and slope; the dashed tangent visualizes local gradient used by backprop.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 290, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Probe input x = {x.toFixed(2)}
          <input type="range" min={-2.5} max={2.5} step={0.01} value={x} onChange={(e) => setX(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {FUNCTIONS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFocus(name)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${DS.border}`,
                background: focus === name ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
                color: DS.t1,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {name}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowGrad((g) => !g)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: showGrad ? "rgba(52,211,153,0.16)" : "rgba(255,255,255,0.04)",
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {showGrad ? "Hide tangent" : "Show tangent"}
          </button>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Sigmoid/tanh can saturate at large |x| (tiny gradients), while ReLU is sparse but can die for negative pre-activations. Leaky ReLU keeps a non-zero negative slope to reduce dead neurons.
      </p>
    </div>
  );
}
