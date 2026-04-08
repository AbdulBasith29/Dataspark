import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const Z1 = 2.2;
const Z2 = 1.4;

function ridge(lambda) {
  const s = 1 + lambda;
  return { w1: Z1 / s, w2: Z2 / s };
}

function lasso(lambda) {
  const t = (x) => (x > lambda ? x - lambda : x < -lambda ? x + lambda : 0);
  return { w1: t(Z1), w2: t(Z2) };
}

export default function RegularizationEffect() {
  const [lambda, setLambda] = useState(0.35);
  const canvasRef = useRef(null);

  const r = ridge(lambda);
  const l = lasso(lambda);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 260;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 40;
    const span = 2.8;
    const cx = cssW / 2;
    const cy = cssH / 2;
    const scale = Math.min(cssW, cssH) / 2 / span;

    const tx = (w1) => cx + w1 * scale;
    const ty = (w2) => cy - w2 * scale;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, cy);
    ctx.lineTo(cssW - pad, cy);
    ctx.moveTo(cx, pad);
    ctx.lineTo(cx, cssH - pad);
    ctx.stroke();

    const drawDiamond = (lam, stroke, dash) => {
      const s = lam * scale;
      ctx.beginPath();
      ctx.moveTo(cx + s, cy);
      ctx.lineTo(cx, cy - s);
      ctx.lineTo(cx - s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.closePath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawCircle = (lam, stroke) => {
      const rad = lam * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    drawDiamond(lambda, "rgba(251, 191, 36, 0.45)", [5, 4]);
    drawCircle(lambda, "rgba(52, 211, 153, 0.35)");

    const dot = (w1, w2, fill, ring) => {
      ctx.beginPath();
      ctx.arc(tx(w1), ty(w2), 8, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = ring;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    dot(Z1, Z2, "rgba(148, 163, 184, 0.5)", DS.t2);
    dot(r.w1, r.w2, "rgba(52, 211, 153, 0.45)", DS.grn);
    dot(l.w1, l.w2, "rgba(129, 140, 248, 0.55)", DS.ind);

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("w1", cssW - 16, cy + 4);
    ctx.fillText("w2", cx + 4, pad - 8);

    ctx.textAlign = "left";
    ctx.fillText("gray: unconstrained min (OLS)", 12, 18);
    ctx.fillStyle = DS.grn;
    ctx.fillText("green: ridge (L2)", 12, 32);
    ctx.fillStyle = DS.ind;
    ctx.fillText("indigo: lasso (L1)", 12, 46);
  }, [lambda, r.w1, r.w2, l.w1, l.w2]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        L1 vs L2 shrinkage (orthonormal intuition)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        With uncorrelated features, ridge scales all coefficients toward zero along a straight line; lasso subtracts a threshold per coordinate and can zero some out (sparse model). Gold diamond is the L1 budget; green circle is the L2 budget (same lambda scale for illustration only).
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 260, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <label style={{ display: "block", marginTop: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          Penalty strength lambda = {lambda.toFixed(2)}
        </div>
        <input type="range" min={0} max={2.2} step={0.02} value={lambda} onChange={(e) => setLambda(+e.target.value)} style={{ width: "100%", accentColor: DS.ind }} />
      </label>

      <div style={{ marginTop: 10, fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
        <div>
          Ridge: ({r.w1.toFixed(3)}, {r.w2.toFixed(3)})
        </div>
        <div>
          Lasso: ({l.w1.toFixed(3)}, {l.w2.toFixed(3)})
          {l.w1 === 0 || l.w2 === 0 ? " (some weights exactly zero)" : ""}
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Real data are not orthonormal; geometry is rotated but the story holds: L2 smooths coefficients, L1 encourages sparsity. Elastic net blends both. Dropout and weight decay in deep nets are different mechanisms but serve similar goals against overfitting.
      </p>
    </div>
  );
}
