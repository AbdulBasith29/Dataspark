import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * Imbalanced-classes playground (ml-e4).
 * A heavily skewed 2-class dataset where each point has a latent "true" score.
 * Controls: imbalance ratio (% positive), decision threshold, and a "rebalance"
 * toggle (class weighting that nudges the effective threshold down).
 * Live metrics + confusion matrix show the accuracy paradox: accuracy stays high
 * while recall on the minority class collapses as skew increases.
 */

const TOTAL = 600;

// Deterministic pseudo-random so the dataset is stable across renders.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a dataset: `posFrac` of TOTAL are positive. Each point gets a model
// "score" drawn so positives skew high and negatives skew low, but with overlap
// (so the classifier is good, not perfect — recall can still collapse under skew).
function buildDataset(posFrac) {
  const rand = mulberry32(20240602);
  const nPos = Math.max(1, Math.round(TOTAL * posFrac));
  const nNeg = TOTAL - nPos;
  const pts = [];
  const gauss = () => {
    // Box–Muller
    const u = Math.max(1e-9, rand());
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const clamp01 = (x) => Math.min(0.999, Math.max(0.001, x));
  for (let i = 0; i < nPos; i++) {
    pts.push({ y: 1, score: clamp01(0.64 + 0.16 * gauss()) });
  }
  for (let i = 0; i < nNeg; i++) {
    pts.push({ y: 0, score: clamp01(0.36 + 0.16 * gauss()) });
  }
  return pts;
}

function metricsAt(pts, t) {
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0;
  for (const s of pts) {
    const pred = s.score >= t ? 1 : 0;
    if (s.y === 1 && pred === 1) tp++;
    else if (s.y === 0 && pred === 0) tn++;
    else if (s.y === 0 && pred === 1) fp++;
    else fn++;
  }
  const total = tp + tn + fp + fn || 1;
  const acc = (tp + tn) / total;
  const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec);
  return { tp, tn, fp, fn, acc, prec, rec, f1 };
}

const PCT_OPTIONS = [
  { label: "50% (balanced)", frac: 0.5 },
  { label: "20%", frac: 0.2 },
  { label: "5%", frac: 0.05 },
  { label: "1% (heavy skew)", frac: 0.01 },
];

function Bar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          marginBottom: 3,
        }}
      >
        <span>{label}</span>
        <span style={{ color: DS.t1 }}>{value.toFixed(3)}</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 6,
          background: "rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.round(value * 100)}%`,
            height: "100%",
            background: color,
            transition: "width 140ms ease",
          }}
        />
      </div>
    </div>
  );
}

export default function ImbalancedClasses() {
  const [posFrac, setPosFrac] = useState(0.05);
  const [threshold, setThreshold] = useState(0.5);
  const [rebalance, setRebalance] = useState(false);

  const canvasRef = useRef(null);
  const data = useMemo(() => buildDataset(posFrac), [posFrac]);

  // "Rebalance" emulates class weighting: it lowers the effective decision
  // threshold toward the minority class so positives are predicted more readily.
  const effThreshold = useMemo(() => {
    if (!rebalance) return threshold;
    const shift = (0.5 - posFrac) * 0.5; // bigger shift for heavier skew
    return Math.min(0.95, Math.max(0.05, threshold - shift));
  }, [rebalance, threshold, posFrac]);

  const m = useMemo(() => metricsAt(data, effThreshold), [data, effThreshold]);
  const nPos = useMemo(() => data.filter((p) => p.y === 1).length, [data]);
  const nNeg = data.length - nPos;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 520;
    const cssH = 150;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 14;
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2 - 14;
    const x0 = pad;
    const y0 = pad;
    const sx = (score) => x0 + score * plotW;

    // Jittered scatter of points by score; color by class.
    const rand = mulberry32(7);
    for (const p of data) {
      const px = sx(p.score);
      const py = y0 + 6 + rand() * (plotH - 12);
      const predPos = p.score >= effThreshold;
      ctx.beginPath();
      ctx.arc(px, py, p.y === 1 ? 2.6 : 1.8, 0, Math.PI * 2);
      if (p.y === 1) {
        ctx.fillStyle = predPos ? "rgba(52,211,153,0.95)" : "rgba(248,113,113,0.9)";
      } else {
        ctx.fillStyle = predPos ? "rgba(251,191,36,0.7)" : "rgba(129,140,248,0.32)";
      }
      ctx.fill();
    }

    // Threshold line.
    const tx = sx(effThreshold);
    ctx.strokeStyle = DS.grn;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(tx, y0);
    ctx.lineTo(tx, y0 + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels.
    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "left";
    ctx.fillText("model score → 0", x0, cssH - 4);
    ctx.textAlign = "right";
    ctx.fillText("1", x0 + plotW, cssH - 4);
    ctx.textAlign = "center";
    ctx.fillStyle = DS.grn;
    ctx.fillText(`t = ${effThreshold.toFixed(2)}`, tx, y0 - 2 + 0);
  }, [data, effThreshold]);

  const cellStyle = (rgb, count, maxC) => ({
    background: `rgba(${rgb}, ${0.14 + 0.55 * (count / (maxC || 1))})`,
    border: `1px solid ${DS.border}`,
    borderRadius: 8,
    padding: "10px 6px",
    textAlign: "center",
    fontFamily: "var(--ds-mono), monospace",
  });
  const maxCell = Math.max(m.tp, m.tn, m.fp, m.fn, 1);

  return (
    <div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: DS.t1,
          fontFamily: "var(--ds-sans), sans-serif",
          marginBottom: 4,
        }}
      >
        Imbalanced classes &amp; the accuracy paradox
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        Skew the dataset toward one class and watch accuracy stay high while recall on the
        minority (green = caught, red = missed) collapses. Drag the threshold — or toggle
        rebalance (class weighting) — to recover recall.
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 150,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          display: "block",
        }}
      />

      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", minWidth: 200 }}>
          <div
            style={{
              fontSize: 11,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginBottom: 8,
            }}
          >
            Positive class share ({nPos} pos / {nNeg} neg)
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {PCT_OPTIONS.map((opt) => {
              const active = Math.abs(opt.frac - posFrac) < 1e-9;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setPosFrac(opt.frac)}
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--ds-mono), monospace",
                    padding: "5px 9px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: active ? DS.t1 : DS.t3,
                    background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? DS.borderStrong : DS.border}`,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <label style={{ display: "block" }}>
            <div
              style={{
                fontSize: 11,
                color: DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                marginBottom: 8,
              }}
            >
              Decision threshold: {threshold.toFixed(2)}
              {rebalance && (
                <span style={{ color: DS.grn }}> → effective {effThreshold.toFixed(2)}</span>
              )}
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

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              cursor: "pointer",
              fontSize: 11,
              color: DS.t2,
              fontFamily: "var(--ds-mono), monospace",
            }}
          >
            <input
              type="checkbox"
              checked={rebalance}
              onChange={(e) => setRebalance(e.target.checked)}
              style={{ accentColor: DS.grn }}
            />
            Rebalance (class weighting → lower effective threshold)
          </label>
        </div>

        <div style={{ flex: "1 1 200px", minWidth: 200 }}>
          <Bar label="accuracy (the liar)" value={m.acc} color={DS.dim} />
          <Bar label="precision" value={m.prec} color="rgba(251,191,36,0.85)" />
          <Bar label="recall (minority caught)" value={m.rec} color={DS.grn} />
          <Bar label="F1" value={m.f1} color={DS.ind} />

          <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
            <div style={cellStyle("52,211,153", m.tn, maxCell)}>
              <div style={{ fontSize: 16, fontWeight: 700, color: DS.t1 }}>{m.tn}</div>
              <div style={{ fontSize: 9, color: DS.t3 }}>TN</div>
            </div>
            <div style={cellStyle("251,191,36", m.fp, maxCell)}>
              <div style={{ fontSize: 16, fontWeight: 700, color: DS.t1 }}>{m.fp}</div>
              <div style={{ fontSize: 9, color: DS.t3 }}>FP (false alarm)</div>
            </div>
            <div style={cellStyle("248,113,113", m.fn, maxCell)}>
              <div style={{ fontSize: 16, fontWeight: 700, color: DS.t1 }}>{m.fn}</div>
              <div style={{ fontSize: 9, color: DS.t3 }}>FN (missed)</div>
            </div>
            <div style={cellStyle("129,140,248", m.tp, maxCell)}>
              <div style={{ fontSize: 16, fontWeight: 700, color: DS.t1 }}>{m.tp}</div>
              <div style={{ fontSize: 9, color: DS.t3 }}>TP (caught)</div>
            </div>
          </div>
        </div>
      </div>

      <p
        style={{
          marginTop: 16,
          fontSize: 12,
          color: DS.t3,
          lineHeight: 1.65,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        At 1% positives, a do-nothing model scores ~0.99 accuracy yet catches no positives —
        the accuracy paradox. Precision/recall and the confusion matrix expose it; threshold
        tuning and class weights are the cheap levers to recover recall without retraining.
      </p>
    </div>
  );
}
