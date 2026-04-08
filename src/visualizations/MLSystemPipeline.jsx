import { useEffect, useRef } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const STAGES = ["Request", "Gateway", "Features", "Model", "Response"];

export default function MLSystemPipeline() {
  const canvasRef = useRef(null);
  const t0 = useRef(performance.now());
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext("2d");
      const cssW = canvas.clientWidth || 520;
      const cssH = 220;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const t = (performance.now() - t0.current) / 1000;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, 0, cssW, cssH);

      const n = STAGES.length;
      const pad = 24;
      const gap = (cssW - 2 * pad) / (n - 1);
      const y = cssH / 2;
      const rw = 68;
      const rh = 32;

      const centers = STAGES.map((_, i) => ({ x: pad + i * gap, y }));

      ctx.strokeStyle = DS.border;
      ctx.lineWidth = 2;
      for (let i = 0; i < n - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(centers[i].x + rw / 2, y);
        ctx.lineTo(centers[i + 1].x - rw / 2, y);
        ctx.stroke();
      }

      const phase = (t * 0.18) % 1;
      centers.forEach((c, i) => {
        const seg = phase * (n - 1);
        const active = seg >= i && seg < i + 1;
        ctx.fillStyle = active ? "rgba(52, 211, 153, 0.18)" : "rgba(255,255,255,0.04)";
        ctx.strokeStyle = active ? DS.grn : DS.border;
        ctx.lineWidth = active ? 2 : 1;
        ctx.fillRect(c.x - rw / 2, y - rh / 2, rw, rh);
        ctx.strokeRect(c.x - rw / 2, y - rh / 2, rw, rh);
        ctx.fillStyle = DS.t2;
        ctx.font = "9px var(--ds-mono), monospace";
        ctx.textAlign = "center";
        ctx.fillText(STAGES[i], c.x, y + 3);
      });

      const pathLen = n - 1;
      const u = phase % 1;
      const pos = u * pathLen;
      const seg = Math.min(Math.floor(pos), pathLen - 1);
      const tt = pos - seg;
      const x0 = centers[seg].x + rw / 2;
      const x1 = centers[seg + 1].x - rw / 2;
      const px = x0 + tt * (x1 - x0);
      ctx.beginPath();
      ctx.arc(px, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
      ctx.fill();

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(129, 140, 248, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centers[n - 1].x, y + rh / 2 + 6);
      ctx.lineTo(centers[2].x, y + rh / 2 + 36);
      ctx.lineTo(centers[2].x, y - rh / 2 - 6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = DS.t3;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.fillText("feedback / retrain", centers[2].x, y - rh / 2 - 12);

      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText("Sketch for latency, failure modes, and observability at each hop", cssW / 2, cssH - 10);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        ML system design: request path
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        A typical online path: authenticate, fetch features, score, post-process, log. The dotted arc reminds you that quality issues surface as data and model iterations — design for shadow traffic, canaries, and feature skew between train and serve.
      </p>
      <canvas ref={canvasRef} style={{ width: "100%", height: 220, borderRadius: 12, border: "1px solid " + DS.border, display: "block" }} />
      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Extend verbally with caching, batch fallback, autoscaling triggers, and how you handle missing features or model version rollback.
      </p>
    </div>
  );
}
