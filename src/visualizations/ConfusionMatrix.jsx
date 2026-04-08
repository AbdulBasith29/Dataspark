import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/** Binary labels with model scores (calibrated-ish) for threshold sweep */
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
  const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
  return { tp, tn, fp, fn, prec, rec, f1 };
}

export default function ConfusionMatrix() {
  const [threshold, setThreshold] = useState(0.5);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const mm = metricsAtThreshold(threshold);
    const cssW = canvas.clientWidth || 520;
    const cssH = 260;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const n = SAMPLES.length;
    const maxC = Math.max(mm.tp, mm.tn, mm.fp, mm.fn, 1);
    const cell = Math.min(100, (cssW - 160) / 2 - 8);
    const ox = 120;
    const oy = 48;

    const drawCell = (row, col, count, label, baseRgb) => {
      const x = ox + col * (cell + 10);
      const y = oy + row * (cell + 10);
      const intensity = 0.15 + 0.65 * (count / maxC);
      ctx.fillStyle = `rgba(${baseRgb}, ${intensity})`;
      ctx.strokeStyle = DS.border;
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, cell, cell);
      ctx.strokeRect(x, y, cell, cell);
      ctx.fillStyle = DS.t1;
      ctx.font = "700 22px var(--ds-sans), system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(count), x + cell / 2, y + cell / 2 - 8);
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.fillStyle = DS.t3;
      ctx.fillText(label, x + cell / 2, y + cell / 2 + 14);
    };

    ctx.fillStyle = DS.t3;
    ctx.font = "11px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("Predicted negative", ox + cell / 2, oy - 18);
    ctx.fillText("Predicted positive", ox + cell + 10 + cell / 2, oy - 18);

    ctx.save();
    ctx.translate(28, oy + cell + 5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Actual negative", 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(28, oy + 2 * cell + 15);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Actual positive", 0, 0);
    ctx.restore();

    // TN FP / FN TP — rows = actual, cols = predicted
    drawCell(0, 0, mm.tn, "TN", "52, 211, 153");
    drawCell(0, 1, mm.fp, "FP", "251, 191, 36");
    drawCell(1, 0, mm.fn, "FN", "248, 113, 113");
    drawCell(1, 1, mm.tp, "TP", "129, 140, 248");

    ctx.textAlign = "left";
    ctx.fillStyle = DS.t2;
    ctx.font = "11px var(--ds-mono), monospace";
    const rx = ox + 2 * cell + 36;
    let ly = oy + 8;
    ctx.fillText(`n = ${n} · threshold = ${threshold.toFixed(2)}`, rx, ly);
    ly += 20;
    ctx.fillText(`precision = TP / (TP+FP) = ${mm.prec.toFixed(3)}`, rx, ly);
    ly += 18;
    ctx.fillText(`recall    = TP / (TP+FN) = ${mm.rec.toFixed(3)}`, rx, ly);
    ly += 18;
    ctx.fillText(`F1        = harmonic mean = ${mm.f1.toFixed(3)}`, rx, ly);
    ly += 22;
    ctx.fillStyle = DS.dim;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("Scores ≥ threshold → predict positive class.", rx, ly);
  }, [threshold]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Confusion matrix &amp; threshold
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Drag the decision threshold on a fixed set of scores. Raising it usually trades recall for precision — the matrix and metrics update live. Rows are actual labels; columns are predicted.
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 260,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          display: "block",
        }}
      />

      <label style={{ display: "block", marginTop: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          Classify positive if score ≥ {threshold.toFixed(2)}
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
        In production you pick a threshold from business costs (false alarms vs missed positives) or from a validation ROC, not from accuracy alone — especially with class imbalance.
      </p>
    </div>
  );
}
