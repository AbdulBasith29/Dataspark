import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const POINTS = [
  { x: 0.42, y: 0.38 },
  { x: 0.48, y: 0.42 },
  { x: 0.52, y: 0.36 },
  { x: 0.55, y: 0.45 },
  { x: 0.5, y: 0.5 },
  { x: 0.58, y: 0.48 },
  { x: 0.62, y: 0.55 },
  { x: 0.45, y: 0.52 },
  { x: 0.54, y: 0.58 },
  { x: 0.6, y: 0.62 },
  { x: 0.66, y: 0.58 },
  { x: 0.7, y: 0.65 },
];

function meanVarAlongAngle(points, theta) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const projs = points.map((p) => (p.x - mx) * c + (p.y - my) * s);
  const v = projs.reduce((a, z) => a + z * z, 0) / n;
  return { v, c, s };
}

function pc1Angle(points) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  let cxx = 0,
    cxy = 0,
    cyy = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const dy = p.y - my;
    cxx += dx * dx;
    cxy += dx * dy;
    cyy += dy * dy;
  }
  cxx /= n;
  cxy /= n;
  cyy /= n;
  return 0.5 * Math.atan2(2 * cxy, cxx - cyy);
}

export default function PCA() {
  const optimal = useMemo(() => pc1Angle(POINTS), []);
  const [theta, setTheta] = useState(optimal);
  const canvasRef = useRef(null);

  const { v: variance } = useMemo(() => meanVarAlongAngle(POINTS, theta), [theta]);
  const { v: optimalVar } = useMemo(() => meanVarAlongAngle(POINTS, optimal), [optimal]);

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

    const pad = 40;
    const plotW = cssW - 2 * pad;
    const plotH = cssH - 2 * pad;
    const n = POINTS.length;
    const mx = POINTS.reduce((a, p) => a + p.x, 0) / n;
    const my = POINTS.reduce((a, p) => a + p.y, 0) / n;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const L = 0.55;

    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    const x1 = tx(mx - L * c);
    const y1 = ty(my - L * s);
    const x2 = tx(mx + L * c);
    const y2 = ty(my + L * s);

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(129, 140, 248, 0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    POINTS.forEach((p) => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const t = dx * c + dy * s;
      const fx = mx + t * c;
      const fy = my + t * s;
      const px = tx(p.x);
      const py = ty(p.y);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(tx(fx), ty(fy));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.3)";
      ctx.fill();
      ctx.strokeStyle = DS.grn;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("x₁", cssW / 2 - 4, cssH - 10);
    ctx.save();
    ctx.translate(14, cssH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("x₂", 0, 0);
    ctx.restore();
  }, [theta]);

  const deg = (theta * 180) / Math.PI;
  const optDeg = (optimal * 180) / Math.PI;

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        PCA as “best” 1D view
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        First principal component maximizes variance of the projected coordinates (after centering). Rotate the axis: when it aligns with the elongated direction of the cloud, the projected variance peaks — that is the PC1 idea in 2D.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <label style={{ display: "block", marginTop: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          Projection axis angle: {deg.toFixed(1)}° (data PC1 ≈ {optDeg.toFixed(1)}°)
        </div>
        <input
          type="range"
          min={0}
          max={Math.PI}
          step={0.01}
          value={theta}
          onChange={(e) => setTheta(+e.target.value)}
          style={{ width: "100%", accentColor: DS.ind }}
        />
      </label>

      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setTheta(optimal)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(129,140,248,0.15)",
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Snap to PC1
        </button>
        <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Var(projection) = {variance.toFixed(4)} · max ≈ {optimalVar.toFixed(4)}
        </span>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        In practice you center (and often scale), form the covariance matrix, take eigenvectors — the first few capture most variance for visualization or compression. Green segments show each point&apos;s orthogonal drop onto your chosen axis.
      </p>
    </div>
  );
}
