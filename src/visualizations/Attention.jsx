import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const TOKENS = ["Query", "wants", "relevant", "context"];
const DIMS = 3;

const Q = [0.9, 0.3, 0.2];
const K = [
  [0.8, 0.2, 0.1],
  [0.4, 0.3, 0.2],
  [0.3, 0.8, 0.4],
  [0.7, 0.6, 0.3],
];
const V = [
  [0.9, 0.2, 0.1],
  [0.5, 0.4, 0.3],
  [0.2, 0.9, 0.7],
  [0.8, 0.7, 0.4],
];

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function softmax(xs, temperature = 1) {
  const scaled = xs.map((x) => x / Math.max(temperature, 1e-6));
  const m = Math.max(...scaled);
  const ex = scaled.map((x) => Math.exp(x - m));
  const z = ex.reduce((a, x) => a + x, 0) || 1;
  return ex.map((x) => x / z);
}

export default function Attention() {
  const [temperature, setTemperature] = useState(1);
  const [headScale, setHeadScale] = useState(1);
  const canvasRef = useRef(null);

  const scores = useMemo(
    () => K.map((k) => (dot(Q, k) / Math.sqrt(DIMS)) * headScale),
    [headScale]
  );
  const weights = useMemo(() => softmax(scores, temperature), [scores, temperature]);
  const context = useMemo(() => {
    const out = [0, 0, 0];
    weights.forEach((w, i) => {
      for (let d = 0; d < DIMS; d++) out[d] += w * V[i][d];
    });
    return out;
  }, [weights]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 280;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const qx = cssW * 0.2;
    const leftY = cssH * 0.5;
    const kx = cssW * 0.55;
    const vx = cssW * 0.82;

    ctx.fillStyle = DS.t2;
    ctx.font = "11px var(--ds-mono), monospace";
    ctx.fillText("Query", qx - 24, 22);
    ctx.fillText("Keys", kx - 14, 22);
    ctx.fillText("Values", vx - 20, 22);

    ctx.beginPath();
    ctx.arc(qx, leftY, 18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
    ctx.fill();
    ctx.strokeStyle = DS.border;
    ctx.stroke();
    ctx.fillStyle = DS.t1;
    ctx.textAlign = "center";
    ctx.fillText("Q", qx, leftY + 4);

    TOKENS.forEach((tok, i) => {
      const y = 50 + i * 56;
      const w = weights[i];
      const a = 0.15 + 0.75 * w;

      ctx.beginPath();
      ctx.arc(kx, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(129, 140, 248, 0.2)";
      ctx.fill();
      ctx.strokeStyle = DS.border;
      ctx.stroke();
      ctx.fillStyle = DS.t2;
      ctx.fillText(`K${i + 1}`, kx, y + 4);

      ctx.beginPath();
      ctx.arc(vx, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.2)";
      ctx.fill();
      ctx.strokeStyle = DS.border;
      ctx.stroke();
      ctx.fillStyle = DS.t2;
      ctx.fillText(`V${i + 1}`, vx, y + 4);

      ctx.strokeStyle = `rgba(251, 191, 36, ${a})`;
      ctx.lineWidth = 1 + 7 * w;
      ctx.beginPath();
      ctx.moveTo(qx + 18, leftY);
      ctx.lineTo(kx - 15, y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(52, 211, 153, ${0.2 + 0.5 * w})`;
      ctx.lineWidth = 1 + 5 * w;
      ctx.beginPath();
      ctx.moveTo(kx + 15, y);
      ctx.lineTo(vx - 15, y);
      ctx.stroke();

      ctx.fillStyle = DS.t3;
      ctx.textAlign = "left";
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.fillText(`${tok} · α=${w.toFixed(2)}`, kx + 22, y + 3);
    });

    ctx.textAlign = "left";
    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText(`context ≈ [${context.map((x) => x.toFixed(2)).join(", ")}]`, 18, cssH - 12);
  }, [weights, context]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Attention weights (single head)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        For one query token, attention computes score(Q, Kᵢ), applies softmax to get weights αᵢ, then mixes values: context = Σ αᵢVᵢ. Thicker gold lines mean higher weight.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Softmax temperature = {temperature.toFixed(2)}
          <input type="range" min={0.35} max={2.2} step={0.01} value={temperature} onChange={(e) => setTemperature(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Head score scale = {headScale.toFixed(2)}
          <input type="range" min={0.5} max={2} step={0.01} value={headScale} onChange={(e) => setHeadScale(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Lower temperature makes attention sharper (peaky); higher temperature spreads weight. Multi-head attention repeats this in parallel with different learned projections.
      </p>
    </div>
  );
}
