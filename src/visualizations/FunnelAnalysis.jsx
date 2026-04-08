import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const STAGES = ["Visit", "Signup", "Activate", "Subscribe", "Retain"];

export default function FunnelAnalysis() {
  const [topN, setTopN] = useState(10000);
  const [c1, setC1] = useState(0.55);
  const [c2, setC2] = useState(0.42);
  const [c3, setC3] = useState(0.38);
  const [c4, setC4] = useState(0.22);
  const canvasRef = useRef(null);

  useEffect(() => {
    const counts = [topN, topN * c1, topN * c1 * c2, topN * c1 * c2 * c3, topN * c1 * c2 * c3 * c4];
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

    const pad = 20;
    const maxW = cssW - 2 * pad;
    const stepH = (cssH - pad * 2) / STAGES.length;
    const maxCount = counts[0];

    STAGES.forEach((label, i) => {
      const n = counts[i];
      const w = maxCount > 0 ? (n / maxCount) * maxW : 0;
      const y = pad + i * stepH;
      const margin = 6;
      const h = stepH - margin;
      const x0 = pad + (maxW - w) / 2;

      const g = ctx.createLinearGradient(x0, y, x0 + w, y + h);
      g.addColorStop(0, "rgba(129, 140, 248, 0.55)");
      g.addColorStop(1, "rgba(99, 102, 241, 0.25)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y);
      ctx.lineTo(x0 + w * 0.98, y + h);
      ctx.lineTo(x0 + w * 0.02, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = DS.border;
      ctx.stroke();

      const rate = i === 0 ? 1 : counts[i - 1] > 0 ? n / counts[i - 1] : 0;
      ctx.fillStyle = DS.t1;
      ctx.font = "11px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, pad, y + h / 2 + 4);
      ctx.textAlign = "right";
      ctx.fillStyle = DS.t3;
      const stepLabel = i === 0 ? "baseline" : `${(rate * 100).toFixed(1)}% of prior`;
      ctx.fillText(`${Math.round(n).toLocaleString()} (${stepLabel})`, pad + maxW, y + h / 2 + 4);
    });
  }, [topN, c1, c2, c3, c4]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Conversion funnel (multiplicative stages)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Each stage keeps a fraction of the previous cohort. Overall conversion is the product of step-through rates — the same idea as decomposing a north-star metric into sequential drivers.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Top-of-funnel volume = {topN.toLocaleString()}
          <input type="range" min={2000} max={50000} step={500} value={topN} onChange={(e) => setTopN(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Visit → Signup: {(c1 * 100).toFixed(1)}%
          <input type="range" min={0.15} max={0.85} step={0.01} value={c1} onChange={(e) => setC1(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Signup → Activate: {(c2 * 100).toFixed(1)}%
          <input type="range" min={0.15} max={0.85} step={0.01} value={c2} onChange={(e) => setC2(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.indB }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Activate → Subscribe: {(c3 * 100).toFixed(1)}%
          <input type="range" min={0.1} max={0.7} step={0.01} value={c3} onChange={(e) => setC3(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Subscribe → Retain: {(c4 * 100).toFixed(1)}%
          <input type="range" min={0.05} max={0.5} step={0.01} value={c4} onChange={(e) => setC4(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>
        End-to-end rate: {((topN * c1 * c2 * c3 * c4) / topN * 100).toFixed(2)}% of visitors reach Retain.
      </p>

      <p style={{ marginTop: 12, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Interview tip: name the biggest proportional drop first; propose targeted experiments or qualitative research at that step before buying more top-of-funnel traffic.
      </p>
    </div>
  );
}
