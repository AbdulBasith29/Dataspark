import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/** 2D binary classification toy — axis-aligned splits */
const POINTS = [
  { x: 0.15, y: 0.75, c: 0 },
  { x: 0.22, y: 0.82, c: 0 },
  { x: 0.18, y: 0.68, c: 0 },
  { x: 0.28, y: 0.78, c: 0 },
  { x: 0.72, y: 0.22, c: 1 },
  { x: 0.82, y: 0.18, c: 1 },
  { x: 0.78, y: 0.3, c: 1 },
  { x: 0.65, y: 0.28, c: 1 },
  { x: 0.42, y: 0.48, c: 1 },
  { x: 0.48, y: 0.42, c: 1 },
  { x: 0.38, y: 0.38, c: 0 },
  { x: 0.52, y: 0.52, c: 1 },
  { x: 0.35, y: 0.52, c: 0 },
  { x: 0.58, y: 0.38, c: 1 },
];

const STEPS = [
  {
    title: "Before any split",
    lines: [],
    ig: null,
    text: "All points sit in one region. A greedy tree will choose the axis-aligned cut that best separates class labels (here: Gini impurity goes down).",
  },
  {
    title: "Root split: x₁ < 0.50",
    lines: [{ type: "v", pos: 0.5 }],
    ig: 0.42,
    text: "Vertical cut on feature x₁. Left side is mostly class 0 (muted); right side mixes both — so we recurse on the right.",
  },
  {
    title: "Right child: x₂ < 0.55",
    lines: [
      { type: "v", pos: 0.5 },
      { type: "h", pos: 0.55, xmin: 0.5, xmax: 1 },
    ],
    ig: 0.28,
    text: "Only inside x₁ ≥ 0.50, split on x₂. Upper-right pocket becomes nearly pure class 0; lower-right trends class 1.",
  },
  {
    title: "Refine: x₁ < 0.62 (lower-right)",
    lines: [
      { type: "v", pos: 0.5 },
      { type: "h", pos: 0.55, xmin: 0.5, xmax: 1 },
      { type: "v", pos: 0.62, xmin: 0.5, xmax: 1, ymin: 0, ymax: 0.55 },
    ],
    ig: 0.14,
    text: "Another vertical split isolates a few stubborn negatives. Real trees keep splitting until a depth / min-leaf limit — this is the same idea, stopped early for clarity.",
  },
];

export default function DecisionTree() {
  const [step, setStep] = useState(0);
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
      phaseRef.current = t * 0.001;
      const cssW = canvas.clientWidth || 480;
      const cssH = 280;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, 0, cssW, cssH);

      const pad = 36;
      const plotW = cssW - pad * 2;
      const plotH = cssH - pad * 2;
      const tx = (x) => pad + x * plotW;
      const ty = (y) => pad + (1 - y) * plotH;

      const s = STEPS[step];

      ctx.strokeStyle = DS.border;
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const v = g / 4;
        ctx.beginPath();
        ctx.moveTo(tx(v), pad);
        ctx.lineTo(tx(v), cssH - pad);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pad, ty(v));
        ctx.lineTo(cssW - pad, ty(v));
        ctx.stroke();
      }

      const pulse = 0.55 + 0.45 * Math.sin(phaseRef.current * 2);

      s.lines.forEach((ln, idx) => {
        const isLatest = idx === s.lines.length - 1;
        ctx.strokeStyle = isLatest ? `rgba(129, 140, 248, ${0.45 + 0.45 * pulse})` : "rgba(129, 140, 248, 0.35)";
        ctx.lineWidth = isLatest ? 2.5 : 1.5;
        ctx.setLineDash(isLatest ? [6, 4] : [4, 6]);
        if (ln.type === "v") {
          const y0 = ln.ymin ?? 0;
          const y1 = ln.ymax ?? 1;
          ctx.beginPath();
          ctx.moveTo(tx(ln.pos), ty(y1));
          ctx.lineTo(tx(ln.pos), ty(y0));
          ctx.stroke();
        } else {
          const x0 = ln.xmin ?? 0;
          const x1 = ln.xmax ?? 1;
          ctx.beginPath();
          ctx.moveTo(tx(x0), ty(ln.pos));
          ctx.lineTo(tx(x1), ty(ln.pos));
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);

      POINTS.forEach((p) => {
        const col = p.c === 1 ? "rgba(52, 211, 153, 0.9)" : "rgba(248, 113, 113, 0.85)";
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.y), 7, 0, Math.PI * 2);
        ctx.fillStyle = col.replace("0.9", "0.25").replace("0.85", "0.22");
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.fillText("x₁ (e.g. spend)", cssW / 2 - 40, cssH - 10);
      ctx.save();
      ctx.translate(12, cssH / 2 + 24);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("x₂ (e.g. tenure)", 0, 0);
      ctx.restore();

      if (!cancelled) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [step]);

  const s = STEPS[step];

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Decision tree splits
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Greedy induction picks the rule that most reduces impurity (Gini or entropy). Step through: each new line is a node&apos;s decision boundary on one feature — the hallmark of CART-style trees.
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 280,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          display: "block",
        }}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          disabled={step <= 0}
          onClick={() => setStep((x) => Math.max(0, x - 1))}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.04)",
            color: step <= 0 ? DS.dim : DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 600,
            cursor: step <= 0 ? "not-allowed" : "pointer",
          }}
        >
          Back
        </button>
        <button
          type="button"
          disabled={step >= STEPS.length - 1}
          onClick={() => setStep((x) => Math.min(STEPS.length - 1, x + 1))}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.04)",
            color: step >= STEPS.length - 1 ? DS.dim : DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 600,
            cursor: step >= STEPS.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          Next split
        </button>
        <button
          type="button"
          onClick={() => setStep(0)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.04)",
            color: DS.t2,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Step {step + 1} / {STEPS.length}
          {s.ig != null ? ` · illustrative Δ impurity ≈ ${s.ig.toFixed(2)}` : ""}
        </span>
      </div>

      <p style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>{s.title}</p>
      <p style={{ marginTop: 6, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>{s.text}</p>
    </div>
  );
}
