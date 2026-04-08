import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACTIVATIONS = ["sigmoid", "relu", "tanh"];

function activate(x, type) {
  if (type === "sigmoid") return 1 / (1 + Math.exp(-x));
  if (type === "relu") return Math.max(0, x);
  return Math.tanh(x);
}

export default function NeuralNetwork() {
  const [activation, setActivation] = useState("sigmoid");
  const [inputA, setInputA] = useState(0.7);
  const [inputB, setInputB] = useState(0.3);
  const [bias, setBias] = useState(-0.1);
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

  const hidden1Pre = 1.2 * inputA + -0.8 * inputB + bias;
  const hidden2Pre = -0.6 * inputA + 1.0 * inputB + bias * 0.4;
  const hidden1 = activate(hidden1Pre, activation);
  const hidden2 = activate(hidden2Pre, activation);
  const outPre = 1.4 * hidden1 + -1.1 * hidden2 + 0.2;
  const output = 1 / (1 + Math.exp(-outPre));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let cancelled = false;

    const frame = (t) => {
      if (cancelled) return;
      phaseRef.current = t * 0.0015;
      const cssW = canvas.clientWidth || 480;
      const cssH = 280;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, 0, cssW, cssH);

      const layers = {
        in: [
          { x: cssW * 0.18, y: cssH * 0.35, v: inputA, name: "x₁" },
          { x: cssW * 0.18, y: cssH * 0.65, v: inputB, name: "x₂" },
        ],
        hid: [
          { x: cssW * 0.5, y: cssH * 0.35, v: hidden1, name: "h₁" },
          { x: cssW * 0.5, y: cssH * 0.65, v: hidden2, name: "h₂" },
        ],
        out: [{ x: cssW * 0.82, y: cssH * 0.5, v: output, name: "ŷ" }],
      };

      const pulse = 0.45 + 0.45 * Math.sin(phaseRef.current * 2);

      const drawEdge = (a, b, w) => {
        const mag = Math.min(1, Math.abs(w));
        const col = w >= 0 ? `rgba(52, 211, 153, ${0.2 + 0.5 * mag})` : `rgba(248, 113, 113, ${0.2 + 0.5 * mag})`;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5 + 2 * mag;
        ctx.beginPath();
        ctx.moveTo(a.x + 18, a.y);
        ctx.lineTo(b.x - 18, b.y);
        ctx.stroke();

        const tDot = (Math.sin(phaseRef.current * 2 + w) + 1) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const px = a.x + dx * tDot;
        const py = a.y + dy * tDot;
        ctx.beginPath();
        ctx.arc(px, py, 3 + 2 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      };

      drawEdge(layers.in[0], layers.hid[0], 1.2);
      drawEdge(layers.in[1], layers.hid[0], -0.8);
      drawEdge(layers.in[0], layers.hid[1], -0.6);
      drawEdge(layers.in[1], layers.hid[1], 1.0);
      drawEdge(layers.hid[0], layers.out[0], 1.4);
      drawEdge(layers.hid[1], layers.out[0], -1.1);

      const drawNode = (n, fillBase) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = fillBase;
        ctx.fill();
        ctx.strokeStyle = DS.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const ring = Math.min(1, Math.max(0, n.v));
        ctx.beginPath();
        ctx.arc(n.x, n.y, 20, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * ring);
        ctx.strokeStyle = "rgba(129, 140, 248, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = DS.t1;
        ctx.font = "11px var(--ds-mono), monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.name, n.x, n.y - 24);
        ctx.fillStyle = DS.t3;
        ctx.fillText(n.v.toFixed(2), n.x, n.y + 4);
      };

      layers.in.forEach((n) => drawNode(n, "rgba(56, 189, 248, 0.18)"));
      layers.hid.forEach((n) => drawNode(n, "rgba(129, 140, 248, 0.18)"));
      layers.out.forEach((n) => drawNode(n, "rgba(52, 211, 153, 0.2)"));

      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText("Input layer", cssW * 0.18, 20);
      ctx.fillText(`Hidden (${activation})`, cssW * 0.5, 20);
      ctx.fillText("Output (sigmoid)", cssW * 0.82, 20);

      if (!cancelled) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [activation, inputA, inputB, hidden1, hidden2, output]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Neural network forward pass
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        A tiny 2→2→1 network. Inputs flow through weighted sums, then nonlinearity in hidden units, then a sigmoid output probability. Edge thickness reflects |weight|, and moving dots show activation flow.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Input x₁ = {inputA.toFixed(2)}
          <input type="range" min={0} max={1} step={0.01} value={inputA} onChange={(e) => setInputA(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Input x₂ = {inputB.toFixed(2)}
          <input type="range" min={0} max={1} step={0.01} value={inputB} onChange={(e) => setInputB(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Hidden bias = {bias.toFixed(2)}
          <input type="range" min={-1} max={1} step={0.01} value={bias} onChange={(e) => setBias(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.indB }} />
        </label>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>Hidden activation</span>
          {ACTIVATIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setActivation(a)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${DS.border}`,
                background: activation === a ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
                color: DS.t1,
                fontSize: 11,
                fontFamily: "var(--ds-mono), monospace",
                cursor: "pointer",
              }}
            >
              {a}
            </button>
          ))}
          <span style={{ fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>ŷ ≈ {output.toFixed(3)}</span>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        This is inference only. Training adjusts weights via backpropagation so predicted probabilities match labels while regularization controls overfitting.
      </p>
    </div>
  );
}
