import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/** Normalized 2D toy cloud — three natural blobs */
const POINTS = [
  { x: 0.14, y: 0.22 },
  { x: 0.18, y: 0.28 },
  { x: 0.22, y: 0.2 },
  { x: 0.16, y: 0.34 },
  { x: 0.26, y: 0.3 },
  { x: 0.74, y: 0.18 },
  { x: 0.82, y: 0.24 },
  { x: 0.78, y: 0.3 },
  { x: 0.7, y: 0.26 },
  { x: 0.86, y: 0.18 },
  { x: 0.48, y: 0.72 },
  { x: 0.54, y: 0.82 },
  { x: 0.44, y: 0.86 },
  { x: 0.52, y: 0.68 },
  { x: 0.58, y: 0.76 },
  { x: 0.42, y: 0.78 },
];

const CLUSTER_COLORS = [
  "rgba(129, 140, 248, 0.95)",
  "rgba(52, 211, 153, 0.95)",
  "rgba(244, 114, 182, 0.95)",
  "rgba(251, 191, 36, 0.95)",
];

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function assignClusters(points, centroids) {
  return points.map((p) => {
    let best = 0;
    let bestD = Infinity;
    centroids.forEach((c, j) => {
      const d = dist2(p, c);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    });
    return best;
  });
}

function updateCentroids(points, assignment, k) {
  const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
  points.forEach((p, i) => {
    const a = assignment[i];
    sums[a].x += p.x;
    sums[a].y += p.y;
    sums[a].n += 1;
  });
  return sums.map((s) =>
    s.n === 0 ? { x: 0.5, y: 0.5 } : { x: s.x / s.n, y: s.y / s.n }
  );
}

function centroidsEqual(a, b, eps = 1e-4) {
  return a.every((c, i) => dist2(c, b[i]) < eps * eps);
}

const INITIAL_CENTROIDS = {
  2: [
    { x: 0.22, y: 0.72 },
    { x: 0.78, y: 0.22 },
  ],
  3: [
    { x: 0.2, y: 0.25 },
    { x: 0.8, y: 0.22 },
    { x: 0.5, y: 0.8 },
  ],
  4: [
    { x: 0.18, y: 0.22 },
    { x: 0.82, y: 0.2 },
    { x: 0.48, y: 0.78 },
    { x: 0.5, y: 0.35 },
  ],
};

function buildHistory(k) {
  let centroids = INITIAL_CENTROIDS[k].map((c) => ({ ...c }));
  const history = [];
  const maxIter = 16;
  for (let iter = 0; iter < maxIter; iter++) {
    const assignment = assignClusters(POINTS, centroids);
    history.push({ centroids: centroids.map((c) => ({ ...c })), assignment: [...assignment] });
    const next = updateCentroids(POINTS, assignment, k);
    if (centroidsEqual(centroids, next)) break;
    centroids = next;
  }
  return history;
}

export default function KMeansClustering() {
  const [k, setK] = useState(3);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef(null);

  const history = useMemo(() => buildHistory(k), [k]);
  const maxStep = Math.max(0, history.length - 1);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [k]);

  useEffect(() => {
    if (step > maxStep) setStep(maxStep);
  }, [maxStep, step]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => (s >= maxStep ? 0 : s + 1));
    }, 950);
    return () => clearInterval(id);
  }, [playing, maxStep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const snap = history[Math.min(step, maxStep)];
    if (!snap) return;

    const cssW = canvas.clientWidth || 480;
    const cssH = 280;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 36;
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2;
    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const v = g / 4;
      ctx.beginPath();
      ctx.moveTo(tx(v), pad);
      ctx.lineTo(tx(v), cssH - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad, ty(v));
      ctx.lineTo(cssW - pad, ty(v));
      ctx.stroke();
    }

    POINTS.forEach((p, i) => {
      const c = CLUSTER_COLORS[snap.assignment[i] % CLUSTER_COLORS.length];
      ctx.beginPath();
      ctx.arc(tx(p.x), ty(p.y), 6, 0, Math.PI * 2);
      ctx.fillStyle = c.replace("0.95", "0.35");
      ctx.fill();
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    snap.centroids.forEach((c, j) => {
      ctx.beginPath();
      const cx = tx(c.x);
      const cy = ty(c.y);
      const s = 10;
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx + s, cy);
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx, cy + s);
      ctx.strokeStyle = CLUSTER_COLORS[j % CLUSTER_COLORS.length];
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#F8FAFC";
      ctx.fill();
    });

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), 'JetBrains Mono', monospace";
    ctx.fillText("feature x₁", cssW / 2 - 24, cssH - 10);
    ctx.save();
    ctx.translate(12, cssH / 2 + 20);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("feature x₂", 0, 0);
    ctx.restore();
  }, [history, step, maxStep]);

  const snap = history[Math.min(step, maxStep)];
  const converged = step >= maxStep && history.length > 1;

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        K-means: assign → update
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Lloyd&apos;s algorithm repeats two moves: assign each point to its nearest centroid, then move each centroid to the mean of its cluster. The crosshairs are centroids; points tint by current assignment.
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 280,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          display: "block",
        }}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>
          k = {k}
          <input
            type="range"
            min={2}
            max={4}
            step={1}
            value={k}
            onChange={(e) => setK(+e.target.value)}
            style={{ width: 120, marginLeft: 8, verticalAlign: "middle", accentColor: DS.ind }}
          />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", flex: "1 1 200px", minWidth: 160 }}>
          Iteration {step} / {maxStep}
          <input
            type="range"
            min={0}
            max={maxStep}
            step={1}
            value={Math.min(step, maxStep)}
            onChange={(e) => setStep(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.grn }}
          />
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
          {playing ? "Pause" : "Play loop"}
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.04)",
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Next step
        </button>
        <button
          type="button"
          onClick={() => setStep(0)}
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
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        {snap
          ? converged
            ? `Converged after ${maxStep} update${maxStep === 1 ? "" : "s"} (within tolerance). In the wild, run multiple random inits — K-means only guarantees a local minimum of within-cluster variance.`
            : "Each step first colors points by nearest centroid, then recenters. Empty clusters (not shown here) need a re-seed or k adjustment."
          : null}
      </p>
    </div>
  );
}
