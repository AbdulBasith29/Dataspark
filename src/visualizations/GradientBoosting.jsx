import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * Gradient boosting viz (ml-s5): sequential residual fitting. Each "round"
 * fits a shallow regression stump to the current residuals and adds a
 * shrunken (learning-rate * h) version to the running prediction. The fit
 * climbs toward the target curve and residuals shrink. Learning-rate slider.
 */

// True target the boosted ensemble is trying to learn (a wiggly curve).
function target(x) {
  return 0.5 + 0.32 * Math.sin(7.5 * x) + 0.12 * (x - 0.5);
}

const N = 48;
const XS = (() => {
  const a = [];
  for (let i = 0; i < N; i++) a.push((i + 0.5) / N);
  return a;
})();
const Y = XS.map(target);

// Fit a depth-1 regression stump (best single split) to residual targets r.
const GRID = 60;
function fitStump(x, r) {
  let bestT = 0.5;
  let bestErr = Infinity;
  let bestL = 0;
  let bestR = 0;
  for (let g = 1; g < GRID; g++) {
    const t = g / GRID;
    let ls = 0;
    let ln = 0;
    let rs = 0;
    let rn = 0;
    for (let i = 0; i < x.length; i++) {
      if (x[i] < t) {
        ls += r[i];
        ln++;
      } else {
        rs += r[i];
        rn++;
      }
    }
    if (ln === 0 || rn === 0) continue;
    const lm = ls / ln;
    const rm = rs / rn;
    let err = 0;
    for (let i = 0; i < x.length; i++) {
      const pred = x[i] < t ? lm : rm;
      err += (r[i] - pred) * (r[i] - pred);
    }
    if (err < bestErr) {
      bestErr = err;
      bestT = t;
      bestL = lm;
      bestR = rm;
    }
  }
  return { t: bestT, l: bestL, r: bestR };
}

const MAX_ROUNDS = 60;

export default function GradientBoosting() {
  const [rounds, setRounds] = useState(0);
  const [lr, setLr] = useState(0.3);
  const canvasRef = useRef(null);

  // Precompute the full sequence of stumps for the chosen learning rate,
  // then read off the prediction at `rounds`.
  const { fitCurve, residRms } = useMemo(() => {
    const pred = new Array(N).fill(Y.reduce((a, b) => a + b, 0) / N); // F0 = mean
    for (let m = 0; m < rounds; m++) {
      const resid = XS.map((_, i) => Y[i] - pred[i]); // negative gradient (sq loss)
      const stump = fitStump(XS, resid);
      for (let i = 0; i < N; i++) {
        pred[i] += lr * (XS[i] < stump.t ? stump.l : stump.r);
      }
    }
    const resid = XS.map((_, i) => Y[i] - pred[i]);
    const rms = Math.sqrt(resid.reduce((a, b) => a + b * b, 0) / N);
    return { fitCurve: pred.slice(), residRms: rms };
  }, [rounds, lr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 300;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 38;
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2;
    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);

    // Target curve (dashed grey).
    ctx.strokeStyle = "rgba(148,163,184,0.55)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let g = 0; g <= 100; g++) {
      const x = g / 100;
      const yv = ty(target(x));
      if (g === 0) ctx.moveTo(tx(x), yv);
      else ctx.lineTo(tx(x), yv);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Residual segments (current prediction → target), red.
    XS.forEach((x, i) => {
      ctx.strokeStyle = "rgba(248,113,113,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx(x), ty(fitCurve[i]));
      ctx.lineTo(tx(x), ty(Y[i]));
      ctx.stroke();
    });

    // Data points (targets).
    XS.forEach((x, i) => {
      ctx.beginPath();
      ctx.arc(tx(x), ty(Y[i]), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(226,232,240,0.5)";
      ctx.fill();
    });

    // Current boosted prediction (bold green step curve).
    ctx.strokeStyle = DS.grn;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    XS.forEach((x, i) => {
      const yv = ty(fitCurve[i]);
      if (i === 0) ctx.moveTo(tx(x), yv);
      else ctx.lineTo(tx(x), yv);
    });
    ctx.stroke();

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("feature x", cssW / 2 - 24, cssH - 10);
    ctx.fillText("y", pad - 6, pad - 12);
  }, [fitCurve]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Gradient boosting: fitting residuals
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Each round fits a weak stump to the current residuals (red segments = what is still wrong) and adds learning_rate × it. The green fit climbs toward the target (dashed); residuals shrink stage by stage.
      </p>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 300, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }}
      />

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setRounds((r) => Math.min(MAX_ROUNDS, r + 1))}
            disabled={rounds >= MAX_ROUNDS}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: "rgba(52,211,153,0.16)",
              color: rounds >= MAX_ROUNDS ? DS.dim : DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: rounds >= MAX_ROUNDS ? "not-allowed" : "pointer",
            }}
          >
            + Add weak learner
          </button>
          <button
            type="button"
            onClick={() => setRounds((r) => Math.min(MAX_ROUNDS, r + 10))}
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
            +10
          </button>
          <button
            type="button"
            onClick={() => setRounds(0)}
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
            round {rounds} / {MAX_ROUNDS} · residual RMSE = {residRms.toFixed(4)}
          </span>
        </div>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          learning rate η = {lr.toFixed(2)}
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={lr}
            onChange={(e) => setLr(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.grn }}
          />
        </label>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        High η reaches the target in few rounds but each step is coarse and overshoots; low η needs many rounds yet generalizes better — shrinkage is regularization. In production you stop when validation loss stops improving (early stopping).
      </p>
    </div>
  );
}
