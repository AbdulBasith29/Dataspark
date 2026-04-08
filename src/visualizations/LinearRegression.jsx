import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const POINTS = [
  { x: 0.08, y: 0.22 },
  { x: 0.18, y: 0.28 },
  { x: 0.28, y: 0.35 },
  { x: 0.38, y: 0.42 },
  { x: 0.48, y: 0.38 },
  { x: 0.58, y: 0.52 },
  { x: 0.68, y: 0.58 },
  { x: 0.78, y: 0.62 },
  { x: 0.88, y: 0.72 },
];

function ols(points) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let cov = 0;
  let vx = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const dy = p.y - my;
    cov += dx * dy;
    vx += dx * dx;
  }
  if (vx < 1e-9) return { m: 0, b: my };
  const m = cov / vx;
  return { m, b: my - m * mx };
}

function sse(points, m, b) {
  return points.reduce((s, p) => {
    const r = p.y - (m * p.x + b);
    return s + r * r;
  }, 0);
}

export default function LinearRegression() {
  const truth = useMemo(() => ols(POINTS), []);
  const [m, setM] = useState(truth.m);
  const [b, setB] = useState(truth.b);
  const canvasRef = useRef(null);

  const err = useMemo(() => sse(POINTS, m, b), [m, b]);
  const bestErr = useMemo(() => sse(POINTS, truth.m, truth.b), [truth]);

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
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2;
    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);

    const lineY = (x) => m * x + b;
    ctx.strokeStyle = "rgba(129, 140, 248, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx(0), ty(lineY(0)));
    ctx.lineTo(tx(1), ty(lineY(1)));
    ctx.stroke();

    POINTS.forEach((p) => {
      const yHat = m * p.x + b;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(tx(p.x), ty(p.y));
      ctx.lineTo(tx(p.x), ty(yHat));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(tx(p.x), ty(p.y), 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
      ctx.fill();
      ctx.strokeStyle = DS.grn;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("x", cssW / 2 - 4, cssH - 12);
    ctx.save();
    ctx.translate(14, cssH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("y", 0, 0);
    ctx.restore();
  }, [m, b]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Linear regression &amp; residuals
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Ordinary least squares picks the line that minimizes the sum of squared vertical errors (SSE). Dashed segments are residuals: observed y minus predicted ŷ.
      </p>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }}
      />

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Slope m = {m.toFixed(2)}
          <input
            type="range"
            min={-0.5}
            max={1.5}
            step={0.01}
            value={m}
            onChange={(e) => setM(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.ind }}
          />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Intercept b = {b.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={b}
            onChange={(e) => setB(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.grn }}
          />
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              setM(truth.m);
              setB(truth.b);
            }}
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
            Snap to OLS
          </button>
          <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            SSE = {err.toFixed(4)}
            {Math.abs(err - bestErr) < 1e-6 ? " (minimum)" : ` · OLS minimum ≈ ${bestErr.toFixed(4)}`}
          </span>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        In interviews, connect this picture to the normal equations (XᵀX)β = Xᵀy, assumptions (linearity, i.i.d. noise), and when you would reach for regularization instead.
      </p>
    </div>
  );
}
