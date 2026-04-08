import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCdf(z) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function zCritTwoTail(alpha) {
  let lo = 0;
  let hi = 5;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const p = 2 * (1 - normalCdf(mid));
    if (p > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export default function HypothesisTesting() {
  const [alpha, setAlpha] = useState(0.05);
  const [zObs, setZObs] = useState(2.2);
  const canvasRef = useRef(null);

  const zc = useMemo(() => zCritTwoTail(alpha), [alpha]);
  const pTwoSided = useMemo(() => 2 * (1 - normalCdf(Math.abs(zObs))), [zObs]);
  const reject = Math.abs(zObs) > zc;

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

    const padL = 44;
    const padR = 16;
    const padT = 28;
    const padB = 36;
    const plotW = cssW - padL - padR;
    const plotH = cssH - padT - padB;
    const xMin = -4;
    const xMax = 4;
    const tx = (x) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
    const yMax = 0.45;
    const ty = (y) => padT + (1 - y / yMax) * plotH;

    const xs = [];
    const ys = [];
    let ymax = 0;
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (i / 200) * (xMax - xMin);
      const y = normalPdf(x);
      xs.push(x);
      ys.push(y);
      ymax = Math.max(ymax, y);
    }
    const scaleY = 0.42 / ymax;

    ctx.beginPath();
    ctx.moveTo(tx(xMin), ty(0));
    ctx.lineTo(tx(xMax), ty(0));
    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    const fillTail = (x0, x1, fill) => {
      ctx.beginPath();
      ctx.moveTo(tx(x0), ty(0));
      for (let x = x0; x <= x1; x += 0.04) {
        ctx.lineTo(tx(x), ty(normalPdf(x) * scaleY));
      }
      ctx.lineTo(tx(x1), ty(0));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };

    fillTail(xMin, -zc, "rgba(248, 113, 113, 0.35)");
    fillTail(zc, xMax, "rgba(248, 113, 113, 0.35)");

    ctx.beginPath();
    xs.forEach((x, i) => {
      const py = ys[i] * scaleY;
      if (i === 0) ctx.moveTo(tx(x), ty(py));
      else ctx.lineTo(tx(x), ty(py));
    });
    ctx.strokeStyle = "rgba(129, 140, 248, 0.95)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const zx = tx(zObs);
    const zy = ty(normalPdf(zObs) * scaleY);
    ctx.beginPath();
    ctx.moveTo(zx, ty(0));
    ctx.lineTo(zx, zy);
    ctx.strokeStyle = reject ? "rgba(251, 191, 36, 0.9)" : "rgba(52, 211, 153, 0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(zx, zy, 5, 0, Math.PI * 2);
    ctx.fillStyle = reject ? "#FBBF24" : DS.grn;
    ctx.fill();

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("z (standardized stat under H0)", cssW / 2, cssH - 10);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.beginPath();
    ctx.moveTo(tx(-zc), padT);
    ctx.lineTo(tx(-zc), padT + plotH);
    ctx.moveTo(tx(zc), padT);
    ctx.lineTo(tx(zc), padT + plotH);
    ctx.stroke();
  }, [alpha, zc, zObs, reject]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Hypothesis test: rejection region (two-sided)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Under H0, the test statistic is modeled as standard normal (z). Red tails are the rejection region for level alpha. Compare your observed z to critical values plus or minus z*.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 260, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Significance alpha (two-sided) = {alpha.toFixed(3)} · critical |z*| = {zc.toFixed(3)}
          <input type="range" min={0.01} max={0.2} step={0.005} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Observed z = {zObs.toFixed(2)} · two-sided p-value ~ {pTwoSided.toFixed(4)} {reject ? "(reject H0)" : "(do not reject)"}
          <input type="range" min={-3.5} max={3.5} step={0.05} value={zObs} onChange={(e) => setZObs(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        This is the classical picture; p-value is the tail probability beyond |z_obs| under H0. In practice you also check assumptions, pre-registration, multiple comparisons, and whether the question is better framed as estimation (CI) than a hard accept/reject.
      </p>
    </div>
  );
}
