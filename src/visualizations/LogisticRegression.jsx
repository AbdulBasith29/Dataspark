import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const POINTS = [
  { x: 0.22, y: 0.78, c: 0 },
  { x: 0.28, y: 0.7, c: 0 },
  { x: 0.18, y: 0.65, c: 0 },
  { x: 0.35, y: 0.82, c: 0 },
  { x: 0.75, y: 0.25, c: 1 },
  { x: 0.82, y: 0.32, c: 1 },
  { x: 0.7, y: 0.18, c: 1 },
  { x: 0.65, y: 0.38, c: 1 },
  { x: 0.48, y: 0.52, c: 1 },
  { x: 0.42, y: 0.45, c: 0 },
  { x: 0.52, y: 0.58, c: 1 },
  { x: 0.38, y: 0.55, c: 0 },
];

function sigmoid(z) {
  if (z > 20) return 1;
  if (z < -20) return 0;
  return 1 / (1 + Math.exp(-z));
}

/** z = w1*x + w2*y + b; boundary where z = 0 */
function clipSegmentToUnitSquare(w1, w2, b) {
  if (Math.abs(w2) < 1e-6) {
    if (Math.abs(w1) < 1e-6) return null;
    const x = -b / w1;
    if (x < 0 || x > 1) return null;
    return [
      { x, y: 0 },
      { x, y: 1 },
    ];
  }
  const pts = [];
  const tryY = (y) => {
    const x = (-w2 * y - b) / w1;
    if (x >= 0 && x <= 1) pts.push({ x, y });
  };
  const tryX = (x) => {
    const y = (-w1 * x - b) / w2;
    if (y >= 0 && y <= 1) pts.push({ x, y });
  };
  tryY(0);
  tryY(1);
  tryX(0);
  tryX(1);
  const uniq = [];
  for (const p of pts) {
    if (!uniq.some((q) => Math.abs(q.x - p.x) + Math.abs(q.y - p.y) < 1e-4)) uniq.push(p);
  }
  if (uniq.length < 2) return null;
  return [uniq[0], uniq[1]];
}

export default function LogisticRegression() {
  const [w1, setW1] = useState(2.4);
  const [w2, setW2] = useState(-2.2);
  const [b, setB] = useState(0.35);
  const canvasRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let cancelled = false;

    const frame = (t) => {
      if (cancelled) return;
      phaseRef.current = t * 0.0008;
      const cssW = canvas.clientWidth || 480;
      const cssH = 280;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, cssW, cssH);
      const pad = 36;
      const plotW = cssW - pad * 2;
      const plotH = cssH - pad * 2;
      const tx = (x) => pad + x * plotW;
      const ty = (y) => pad + (1 - y) * plotH;

      const pulse = 0.08 + 0.06 * Math.sin(phaseRef.current);

      const res = 28;
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x = (i + 0.5) / res;
          const y = (j + 0.5) / res;
          const p = sigmoid(w1 * x + w2 * y + b);
          const a = 0.12 + 0.28 * p + pulse * (p - 0.5) * 0.05;
          ctx.fillStyle = `rgba(129, 140, 248, ${a})`;
          const x0 = tx(i / res);
          const x1 = tx((i + 1) / res);
          const yTop = ty((j + 1) / res);
          const yBot = ty(j / res);
          ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop);
        }
      }

      ctx.strokeStyle = DS.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, plotW, plotH);

      const seg = clipSegmentToUnitSquare(w1, w2, b);
      if (seg) {
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 + 0.1 * Math.sin(phaseRef.current * 1.5)})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(tx(seg[0].x), ty(seg[0].y));
        ctx.lineTo(tx(seg[1].x), ty(seg[1].y));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      POINTS.forEach((p) => {
        const z = w1 * p.x + w2 * p.y + b;
        const pred = z >= 0 ? 1 : 0;
        const correct = pred === p.c;
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.y), 8, 0, Math.PI * 2);
        ctx.fillStyle = p.c === 1 ? "rgba(52, 211, 153, 0.35)" : "rgba(248, 113, 113, 0.35)";
        ctx.fill();
        ctx.strokeStyle = correct ? DS.grn : "#F97316";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.fillText("feature x₁", cssW / 2 - 36, cssH - 10);
      ctx.save();
      ctx.translate(12, cssH / 2 + 20);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("feature x₂", 0, 0);
      ctx.restore();

      if (!cancelled) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [w1, w2, b]);

  let correct = 0;
  for (const p of POINTS) {
    const z = w1 * p.x + w2 * p.y + b;
    if ((z >= 0 ? 1 : 0) === p.c) correct++;
  }

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Logistic regression: linear boundary, nonlinear probability
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Class probability is σ(w·x + b). The decision boundary is still a line (or hyperplane in higher dimensions). Background tint approximates σ; orange rings mark misclassified points at the 0.5 threshold.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          w₁ (weight on x₁) = {w1.toFixed(2)}
          <input type="range" min={-4} max={4} step={0.05} value={w1} onChange={(e) => setW1(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          w₂ (weight on x₂) = {w2.toFixed(2)}
          <input type="range" min={-4} max={4} step={0.05} value={w2} onChange={(e) => setW2(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.indB }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Bias b = {b.toFixed(2)}
          <input type="range" min={-2} max={2} step={0.02} value={b} onChange={(e) => setB(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>
        Accuracy @0.5 threshold on this toy set: {correct}/{POINTS.length}
      </p>

      <p style={{ marginTop: 12, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Training fits w and b with cross-entropy loss (convex → global optimum with enough regularization). For non-linear boundaries you add features or switch to richer models.
      </p>
    </div>
  );
}
