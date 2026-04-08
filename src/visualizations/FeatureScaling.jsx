import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const VALUES = [12, 18, 22, 31, 38, 45, 52, 61, 95, 210];

function stats(v) {
  const n = v.length;
  const mu = v.reduce((a, x) => a + x, 0) / n;
  const var_ = v.reduce((a, x) => a + (x - mu) ** 2, 0) / n;
  const sd = Math.sqrt(var_) || 1;
  return { mu, sd };
}

export default function FeatureScaling() {
  const [t, setT] = useState(0);
  const canvasRef = useRef(null);

  const { mu, sd } = useMemo(() => stats(VALUES), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 200;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 28;
    const w = cssW - 2 * pad;
    const yMid = cssH / 2;
    const zVals = VALUES.map((v) => (v - mu) / sd);
    const blended = VALUES.map((v, i) => v + (zVals[i] - v) * t);
    const vmin = Math.min(...blended);
    const vmax = Math.max(...blended);

    const mapX = (val) => {
      if (vmax - vmin < 1e-9) return pad + w / 2;
      return pad + ((val - vmin) / (vmax - vmin)) * w;
    };

    ctx.strokeStyle = DS.border;
    ctx.beginPath();
    ctx.moveTo(pad, yMid);
    ctx.lineTo(pad + w, yMid);
    ctx.stroke();

    VALUES.forEach((v, i) => {
      const val = blended[i];
      const x = mapX(val);
      ctx.beginPath();
      ctx.arc(x, yMid, 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${0.25 + 0.45 * (1 - t * 0.4)})`;
      ctx.fill();
      ctx.strokeStyle = DS.ind;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText(t < 0.5 ? "raw units (skewed spread)" : "toward z-scores (μ=0, σ=1)", pad, 16);
    ctx.fillText(`μ ≈ ${mu.toFixed(1)} · σ ≈ ${sd.toFixed(1)}`, pad, cssH - 10);
  }, [t, mu, sd]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Feature scaling on a number line
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Standardization subtracts the mean and divides by standard deviation so typical values sit near zero with comparable spread. Drag to morph the same points from raw dollars (one outlier stretched) into z-space — tree splits and distance metrics care about this.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 200, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <label style={{ display: "block", marginTop: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          Blend: raw → standardized (z-score) · t = {t.toFixed(2)}
        </div>
        <input type="range" min={0} max={1} step={0.02} value={t} onChange={(e) => setT(+e.target.value)} style={{ width: "100%", accentColor: DS.grn }} />
      </label>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Use <strong style={{ color: DS.t2 }}>fit on training stats only</strong>, then apply to val/test to avoid leakage. For bounded features, min–max to [0,1] is common; for heavy tails, robust scalers sometimes beat z-scores.
      </p>
    </div>
  );
}
