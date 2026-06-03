import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * Random Forest / bagging viz (ml-s4): many bootstrap-sampled shallow trees
 * each draw a jagged 1D step boundary; averaging them yields a smooth ensemble
 * boundary. Slider for number of trees → watch variance (jaggedness) drop.
 */

const SEED_BASE = 1234567;
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// True target: a smooth logistic-ish probability over x in [0,1].
function trueP(x) {
  return 1 / (1 + Math.exp(-12 * (x - 0.5)));
}

// Build a noisy training set (fixed).
const N = 60;
const TRAIN = (() => {
  const rng = mulberry32(987654);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const x = rng();
    const y = rng() < trueP(x) ? 1 : 0;
    pts.push({ x, y });
  }
  return pts.sort((a, b) => a.x - b.x);
})();

// A depth-1 "stump" fit on a bootstrap sample: pick the threshold (from a small
// grid) that best separates the bootstrap rows, then output left/right means.
const GRID = 80;
function fitStump(bootstrap) {
  let bestT = 0.5;
  let bestErr = Infinity;
  let bestLeft = 0;
  let bestRight = 1;
  for (let g = 1; g < GRID; g++) {
    const t = g / GRID;
    let ls = 0;
    let ln = 0;
    let rs = 0;
    let rn = 0;
    for (const p of bootstrap) {
      if (p.x < t) {
        ls += p.y;
        ln++;
      } else {
        rs += p.y;
        rn++;
      }
    }
    if (ln === 0 || rn === 0) continue;
    const lm = ls / ln;
    const rm = rs / rn;
    let err = 0;
    for (const p of bootstrap) {
      const pred = p.x < t ? lm : rm;
      err += (p.y - pred) * (p.y - pred);
    }
    if (err < bestErr) {
      bestErr = err;
      bestT = t;
      bestLeft = lm;
      bestRight = rm;
    }
  }
  return { t: bestT, left: bestLeft, right: bestRight };
}

// Build up to maxTrees stumps, each on its own bootstrap sample (deterministic).
function buildForest(maxTrees) {
  const trees = [];
  for (let k = 0; k < maxTrees; k++) {
    const rng = mulberry32(SEED_BASE + k * 7919);
    const boot = [];
    for (let i = 0; i < N; i++) {
      boot.push(TRAIN[Math.floor(rng() * N)]);
    }
    trees.push(fitStump(boot));
  }
  return trees;
}

const ALL_TREES = buildForest(200);

export default function RandomForestBagging() {
  const [nTrees, setNTrees] = useState(1);
  const canvasRef = useRef(null);

  const { ensembleCurve, sampleTrees, variance } = useMemo(() => {
    const used = ALL_TREES.slice(0, nTrees);
    const xs = [];
    for (let g = 0; g <= GRID; g++) xs.push(g / GRID);
    // Ensemble prediction = average of stump outputs.
    const curve = xs.map((x) => {
      let s = 0;
      for (const tr of used) s += x < tr.t ? tr.left : tr.right;
      return { x, p: used.length ? s / used.length : 0.5 };
    });
    // Variance proxy: mean spread of individual tree predictions across x.
    let varSum = 0;
    for (const x of xs) {
      const preds = used.map((tr) => (x < tr.t ? tr.left : tr.right));
      const m = preds.reduce((a, b) => a + b, 0) / (preds.length || 1);
      varSum += preds.reduce((a, b) => a + (b - m) * (b - m), 0) / (preds.length || 1);
    }
    return {
      ensembleCurve: curve,
      sampleTrees: used.slice(0, Math.min(used.length, 12)),
      variance: varSum / xs.length,
    };
  }, [nTrees]);

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
    const ty = (p) => pad + (1 - p) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);

    // True probability curve (reference).
    ctx.strokeStyle = "rgba(148,163,184,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let g = 0; g <= GRID; g++) {
      const x = g / GRID;
      const yv = ty(trueP(x));
      if (g === 0) ctx.moveTo(tx(x), yv);
      else ctx.lineTo(tx(x), yv);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Individual tree step functions (faint) — shows the variance.
    sampleTrees.forEach((tr) => {
      ctx.strokeStyle = "rgba(129,140,248,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx(0), ty(tr.left));
      ctx.lineTo(tx(tr.t), ty(tr.left));
      ctx.lineTo(tx(tr.t), ty(tr.right));
      ctx.lineTo(tx(1), ty(tr.right));
      ctx.stroke();
    });

    // Data points.
    TRAIN.forEach((p) => {
      const col = p.y === 1 ? "rgba(52,211,153,0.9)" : "rgba(248,113,113,0.85)";
      ctx.beginPath();
      ctx.arc(tx(p.x), ty(p.y === 1 ? 0.96 : 0.04), 4, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // Ensemble averaged curve (bold indigo→green).
    ctx.strokeStyle = DS.grn;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ensembleCurve.forEach((c, i) => {
      const yv = ty(c.p);
      if (i === 0) ctx.moveTo(tx(c.x), yv);
      else ctx.lineTo(tx(c.x), yv);
    });
    ctx.stroke();

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("feature x", cssW / 2 - 24, cssH - 10);
    ctx.fillText("P(class 1)", pad - 4, pad - 12);
  }, [ensembleCurve, sampleTrees]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Random forest: bagging shallow trees
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Each faint indigo step is one tree fit on its own bootstrap sample — high variance on its own. Averaging many (bold green) cancels the noise and tracks the true curve (dashed grey). Watch the variance fall.
      </p>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 300, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }}
      />

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Number of trees = {nTrees}
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={nTrees}
            onChange={(e) => setNTrees(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.ind }}
          />
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {[1, 5, 25, 100, 200].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNTrees(n)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${DS.border}`,
                background: nTrees === n ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.04)",
                color: nTrees === n ? DS.t1 : DS.t2,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
          <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            ensemble spread (variance) ≈ {variance.toFixed(4)}
          </span>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Adding trees never overfits a forest — it only stabilizes the average. The residual jaggedness at large counts is the ρ·σ² correlation floor; feature subsampling (each split sees a random feature subset) is what lowers it in real forests.
      </p>
    </div>
  );
}
