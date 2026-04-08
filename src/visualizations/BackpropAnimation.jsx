import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const EDGE_INDEX = [
  ["x1", "h1"],
  ["x2", "h1"],
  ["x1", "h2"],
  ["x2", "h2"],
  ["h1", "y"],
  ["h2", "y"],
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function BackpropAnimation() {
  const [lr, setLr] = useState(0.2);
  const [epoch, setEpoch] = useState(0);
  const [playing, setPlaying] = useState(true);
  const canvasRef = useRef(null);
  const tickRef = useRef(0);

  const decay = Math.exp(-epoch * 0.12);
  const grads = {
    out: [0.95 * decay],
    h: [0.7 * decay, 0.52 * decay],
    in: [0.22 * decay, 0.16 * decay],
    edges: [0.84, 0.61, 0.55, 0.42, 0.92, 0.68].map((g) => g * decay),
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setEpoch((e) => (e >= 24 ? 0 : e + 1));
    }, 850);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let cancelled = false;

    const frame = (t) => {
      if (cancelled) return;
      tickRef.current = t * 0.0013;
      const cssW = canvas.clientWidth || 480;
      const cssH = 280;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, 0, cssW, cssH);

      const pos = {
        x1: { x: 0.18 * cssW, y: 0.35 * cssH },
        x2: { x: 0.18 * cssW, y: 0.65 * cssH },
        h1: { x: 0.5 * cssW, y: 0.35 * cssH },
        h2: { x: 0.5 * cssW, y: 0.65 * cssH },
        y: { x: 0.82 * cssW, y: 0.5 * cssH },
      };

      const pulse = 0.45 + 0.45 * Math.sin(tickRef.current * 2.2);

      EDGE_INDEX.forEach(([aKey, bKey], i) => {
        const a = pos[aKey];
        const b = pos[bKey];
        const g = grads.edges[i];
        ctx.strokeStyle = `rgba(248, 113, 113, ${0.18 + 0.65 * g})`;
        ctx.lineWidth = 1 + 5 * g;
        ctx.beginPath();
        ctx.moveTo(a.x + 18, a.y);
        ctx.lineTo(b.x - 18, b.y);
        ctx.stroke();

        const tt = (tickRef.current * 0.9 + i * 0.13) % 1;
        ctx.beginPath();
        ctx.arc(lerp(b.x - 18, a.x + 18, tt), lerp(b.y, a.y, tt), 2 + 3 * pulse * g, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${0.35 + 0.55 * g})`;
        ctx.fill();
      });

      const drawNode = (n, g, color) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = DS.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(n.x, n.y, 21, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * Math.min(1, g));
        ctx.strokeStyle = `rgba(248, 113, 113, ${0.35 + 0.6 * g})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      };

      drawNode(pos.x1, grads.in[0], "rgba(56, 189, 248, 0.16)");
      drawNode(pos.x2, grads.in[1], "rgba(56, 189, 248, 0.16)");
      drawNode(pos.h1, grads.h[0], "rgba(129, 140, 248, 0.17)");
      drawNode(pos.h2, grads.h[1], "rgba(129, 140, 248, 0.17)");
      drawNode(pos.y, grads.out[0], "rgba(52, 211, 153, 0.2)");

      ctx.fillStyle = DS.t1;
      ctx.font = "11px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText("x1", pos.x1.x, pos.x1.y + 4);
      ctx.fillText("x2", pos.x2.x, pos.x2.y + 4);
      ctx.fillText("h1", pos.h1.x, pos.h1.y + 4);
      ctx.fillText("h2", pos.h2.x, pos.h2.y + 4);
      ctx.fillText("y_hat", pos.y.x, pos.y.y + 4);

      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.fillText("Forward: left to right", cssW * 0.25, 20);
      ctx.fillText("Backprop: right to left", cssW * 0.73, 20);

      if (!cancelled) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [grads]);

  const loss = (0.68 * Math.exp(-epoch * 0.12) + 0.03).toFixed(3);
  const stepNorm = (lr * (grads.edges.reduce((a, g) => a + g * g, 0) ** 0.5)).toFixed(3);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Backpropagation: gradient flow
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Loss gradient starts at the output and propagates backward via chain rule. Thick red edges mean larger |dL/dw|. Yellow packets move opposite the forward signal to emphasize direction.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Learning rate eta = {lr.toFixed(2)}
          <input type="range" min={0.03} max={0.8} step={0.01} value={lr} onChange={(e) => setLr(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Epoch = {epoch}
          <input type="range" min={0} max={24} step={1} value={epoch} onChange={(e) => setEpoch(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: playing ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => setEpoch(0)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: "rgba(255,255,255,0.04)",
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <span style={{ fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>
            loss ~ {loss} · update norm ~ eta||g|| = {stepNorm}
          </span>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Parameter update is <code style={{ color: DS.ind }}>w &lt;- w - eta * dL/dw</code>. Very high eta can overshoot; very low eta converges slowly. Optimizers like Adam rescale gradients per parameter.
      </p>
    </div>
  );
}
