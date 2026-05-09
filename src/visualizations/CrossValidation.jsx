import { useCallback, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const N = 24;

export default function CrossValidation() {
  const [k, setK] = useState(5);
  const [fold, setFold] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef(null);

  const foldOf = useCallback((i) => i % k, [k]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setFold((f) => (f + 1 >= k ? 0 : f + 1));
    }, 900);
    return () => clearInterval(id);
  }, [playing, k]);

  useEffect(() => {
    if (fold >= k) setFold(0);
  }, [k, fold, foldOf]);

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

    const pad = 20;
    const gap = 4;
    const cols = 12;
    const rows = 2;
    const cellW = (cssW - 2 * pad - (cols - 1) * gap) / cols;
    const cellH = (cssH - 2 * pad - (rows - 1) * gap - 28) / rows;

    const colors = [
      "rgba(129, 140, 248, 0.55)",
      "rgba(52, 211, 153, 0.45)",
      "rgba(251, 191, 36, 0.5)",
      "rgba(248, 113, 113, 0.45)",
      "rgba(99, 102, 241, 0.5)",
      "rgba(34, 197, 94, 0.4)",
      "rgba(236, 72, 153, 0.45)",
      "rgba(14, 165, 233, 0.45)",
    ];

    for (let i = 0; i < N; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = pad + c * (cellW + gap);
      const y = pad + 28 + r * (cellH + gap);
      const f = foldOf(i);
      const isVal = f === fold;
      ctx.fillStyle = colors[f % colors.length];
      ctx.globalAlpha = isVal ? 1 : 0.35;
      ctx.fillRect(x, y, cellW, cellH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = isVal ? "#FBBF24" : DS.border;
      ctx.lineWidth = isVal ? 2.5 : 1;
      ctx.strokeRect(x, y, cellW, cellH);
      ctx.fillStyle = DS.t1;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + cellW / 2, y + cellH / 2 + 3);
    }

    ctx.fillStyle = DS.t3;
    ctx.font = "11px var(--ds-mono), monospace";
    ctx.textAlign = "left";
    ctx.fillText(`K = ${k} folds · validation fold = ${fold + 1} (gold border)`, pad, 18);
  }, [k, fold, foldOf]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        K-fold cross-validation
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Data are partitioned into K folds. Each color is one fold; the highlighted fold is held out for validation while the rest train. Rotate folds to get K error estimates, then average (and watch variance).
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 200, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          K = {k}
          <input type="range" min={3} max={8} step={1} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: 140, marginLeft: 8, verticalAlign: "middle", accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", flex: "1 1 180px" }}>
          Fold {fold + 1}
          <input type="range" min={0} max={Math.max(0, k - 1)} step={1} value={Math.min(fold, k - 1)} onChange={(e) => setFold(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: playing ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {playing ? "Pause" : "Rotate folds"}
        </button>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Use CV to pick hyperparameters on training data; keep a final test set untouched if you need an unbiased generalization number. Stratified K-fold helps with class imbalance; time series needs forward chaining instead of random folds.
      </p>
    </div>
  );
}
