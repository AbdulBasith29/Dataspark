import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const SAMPLES = [
  { y: 1, score: 0.93 },
  { y: 1, score: 0.88 },
  { y: 1, score: 0.81 },
  { y: 1, score: 0.76 },
  { y: 1, score: 0.62 },
  { y: 1, score: 0.55 },
  { y: 1, score: 0.48 },
  { y: 0, score: 0.42 },
  { y: 0, score: 0.38 },
  { y: 0, score: 0.32 },
  { y: 0, score: 0.28 },
  { y: 0, score: 0.22 },
  { y: 0, score: 0.18 },
  { y: 0, score: 0.12 },
  { y: 0, score: 0.08 },
  { y: 1, score: 0.35 },
  { y: 0, score: 0.52 },
  { y: 1, score: 0.67 },
  { y: 0, score: 0.58 },
];

function metricsAtThreshold(t) {
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0;
  for (const s of SAMPLES) {
    const pred = s.score >= t ? 1 : 0;
    if (s.y === 1 && pred === 1) tp++;
    else if (s.y === 0 && pred === 0) tn++;
    else if (s.y === 0 && pred === 1) fp++;
    else fn++;
  }
  const P = tp + fn;
  const N = tn + fp;
  const tpr = P === 0 ? 0 : tp / P;
  const fpr = N === 0 ? 0 : fp / N;
  return { tpr, fpr, tp, fp, tn, fn, P, N };
}

function buildRocCurve() {
  const P = SAMPLES.filter((s) => s.y === 1).length;
  const N = SAMPLES.length - P;
  const sorted = [...SAMPLES].sort((a, b) => b.score - a.score);
  const pts = [[0, 0]];
  let tp = 0,
    fp = 0;
  let i = 0;
  while (i < sorted.length) {
    const sc = sorted[i].score;
    while (i < sorted.length && sorted[i].score === sc) {
      if (sorted[i].y === 1) tp++;
      else fp++;
      i++;
    }
    pts.push([fp / N, tp / P]);
  }
  return { pts, P, N };
}

function aucTrap(pts) {
  let a = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const yavg = (pts[i][1] + pts[i - 1][1]) / 2;
    a += dx * yavg;
  }
  return a;
}

export default function ROCCurve() {
  const [threshold, setThreshold] = useState(0.45);
  const canvasRef = useRef(null);

  const { pts: rocPts, P, N } = useMemo(() => buildRocCurve(), []);
  const auc = useMemo(() => aucTrap(rocPts), [rocPts]);
  const cur = useMemo(() => metricsAtThreshold(threshold), [threshold]);

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

    const pad = 44;
    const pw = cssW - pad * 2;
    const ph = cssH - pad * 2;
    const tx = (f) => pad + f * pw;
    const ty = (t) => pad + (1 - t) * ph;

    ctx.strokeStyle = DS.border;
    ctx.strokeRect(pad, pad, pw, ph);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(tx(0), ty(0));
    ctx.lineTo(tx(1), ty(1));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(129, 140, 248, 0.12)";
    ctx.beginPath();
    ctx.moveTo(tx(0), ty(0));
    for (const [f, t] of rocPts) ctx.lineTo(tx(f), ty(t));
    ctx.lineTo(tx(1), ty(0));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(129, 140, 248, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    rocPts.forEach(([f, t], i) => {
      if (i === 0) ctx.moveTo(tx(f), ty(t));
      else ctx.lineTo(tx(f), ty(t));
    });
    ctx.stroke();

    const dotX = tx(cur.fpr);
    const dotY = ty(cur.tpr);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(52, 211, 153, 0.35)";
    ctx.fill();
    ctx.strokeStyle = DS.grn;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("FPR (1 − specificity)", cssW / 2 - 70, cssH - 12);
    ctx.save();
    ctx.translate(16, cssH / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("TPR (recall)", 0, 0);
    ctx.restore();

    ctx.fillStyle = DS.t2;
    ctx.font = "11px var(--ds-mono), monospace";
    ctx.fillText(`AUC ≈ ${auc.toFixed(3)}`, pad + 6, pad + 16);
  }, [rocPts, cur.fpr, cur.tpr, auc]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        ROC curve &amp; threshold sweep
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Each threshold gives one (FPR, TPR) pair. Connecting them yields the ROC; area under the curve summarizes ranking quality across all thresholds. Diagonal = random scoring.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <label style={{ display: "block", marginTop: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          Threshold (score ≥ t): {threshold.toFixed(2)} → FPR = {cur.fpr.toFixed(3)}, TPR = {cur.tpr.toFixed(3)} · P = {P}, N = {N}
        </div>
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(+e.target.value)}
          style={{ width: "100%", accentColor: DS.indB }}
        />
      </label>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        AUC is the probability a random positive is scored above a random negative. For heavy class skew, pair ROC with precision–recall curves.
      </p>
    </div>
  );
}
