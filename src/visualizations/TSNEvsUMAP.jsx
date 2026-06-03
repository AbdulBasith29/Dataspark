import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * Illustrates how a non-linear 2D embedding (t-SNE / UMAP style) re-arranges
 * the SAME high-dimensional structure as you change the locality knob
 * (perplexity / n_neighbors). We do NOT run real t-SNE math — instead we use a
 * convincing precomputed/simulated embedding model: three well-separated
 * high-dim clusters whose 2D positions, spread, and inter-cluster gaps shift
 * deterministically with the knob. The point is pedagogical: clusters persist,
 * but their sizes and the gaps BETWEEN them are not meaningful.
 */

const CLUSTER_COLORS = [
  "rgba(129, 140, 248, 0.95)", // indigo
  "rgba(52, 211, 153, 0.95)", // green
  "rgba(244, 114, 182, 0.95)", // pink
];

const CLUSTER_LABELS = ["class A", "class B", "class C"];

/** Seeded LCG for reproducible per-cluster offsets. */
function makeRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Each cluster: an anchor, a base radius, and a fixed cloud of offsets. */
const CLUSTERS = (() => {
  const rand = makeRand(2024);
  const defs = [
    { anchor: { x: 0.28, y: 0.34 }, n: 30, density: 1.0 },
    { anchor: { x: 0.72, y: 0.3 }, n: 30, density: 0.45 }, // tighter in high-D
    { anchor: { x: 0.5, y: 0.74 }, n: 30, density: 1.6 }, // diffuse in high-D
  ];
  return defs.map((d) => {
    const offsets = [];
    for (let i = 0; i < d.n; i++) {
      // gaussian-ish via sum of uniforms
      const gx = (rand() + rand() + rand()) / 3 - 0.5;
      const gy = (rand() + rand() + rand()) / 3 - 0.5;
      offsets.push({ dx: gx, dy: gy });
    }
    return { ...d, offsets };
  });
})();

/**
 * Simulated embedding as a function of the locality knob t in [0,1]
 * (t maps perplexity/n_neighbors low->high).
 *  - low t: clusters fly apart, internal spread is exaggerated (fragmented look)
 *  - high t: clusters pull toward the global centroid, internal spread shrinks
 *  - density is EQUALIZED on screen regardless of true high-dim density
 */
function embed(t) {
  const center = { x: 0.5, y: 0.5 };
  // gap between clusters shrinks as t rises (global structure pulls together)
  const gap = 1.25 - 0.6 * t;
  // on-screen radius GROWS slightly with t (min_dist-like spreading) but is
  // intentionally NOT proportional to the cluster's true density
  const radius = 0.07 + 0.05 * t;
  const pts = [];
  CLUSTERS.forEach((c, ci) => {
    const ax = center.x + (c.anchor.x - center.x) * gap;
    const ay = center.y + (c.anchor.y - center.y) * gap;
    // local detail (jitter) is amplified at LOW t -> fragmented appearance
    const local = radius * (1 + (1 - t) * 0.8);
    c.offsets.forEach((o) => {
      pts.push({
        x: ax + o.dx * local * 2,
        y: ay + o.dy * local * 2,
        cluster: ci,
      });
    });
  });
  return pts.map((p) => ({
    ...p,
    x: Math.min(0.97, Math.max(0.03, p.x)),
    y: Math.min(0.97, Math.max(0.03, p.y)),
  }));
}

export default function TSNEvsUMAP() {
  const [knob, setKnob] = useState(0.5); // 0..1 perplexity / n_neighbors
  const canvasRef = useRef(null);

  const points = useMemo(() => embed(knob), [knob]);
  // map knob 0..1 to a plausible perplexity (5..50)
  const perplexity = Math.round(5 + knob * 45);
  const nNeighbors = Math.round(5 + knob * 45);

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

    const pad = 26;
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2;
    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);

    // cluster centroids (to draw the misleading inter-cluster gap)
    const centroids = [0, 1, 2].map((ci) => {
      const cp = points.filter((p) => p.cluster === ci);
      const mx = cp.reduce((a, p) => a + p.x, 0) / cp.length;
      const my = cp.reduce((a, p) => a + p.y, 0) / cp.length;
      return { x: mx, y: my };
    });

    // dashed lines between centroids labeled "distance NOT meaningful"
    ctx.strokeStyle = "rgba(248, 250, 252, 0.18)";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    for (let a = 0; a < 3; a++) {
      for (let b = a + 1; b < 3; b++) {
        ctx.beginPath();
        ctx.moveTo(tx(centroids[a].x), ty(centroids[a].y));
        ctx.lineTo(tx(centroids[b].x), ty(centroids[b].y));
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    points.forEach((p) => {
      const color = CLUSTER_COLORS[p.cluster];
      ctx.beginPath();
      ctx.arc(tx(p.x), ty(p.y), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color.replace("0.95", "0.4");
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // cluster labels
    ctx.font = "11px var(--ds-mono), monospace";
    centroids.forEach((c, ci) => {
      ctx.fillStyle = CLUSTER_COLORS[ci];
      ctx.fillText(CLUSTER_LABELS[ci], tx(c.x) + 6, ty(c.y) - 8);
    });
  }, [points]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        t-SNE / UMAP: the embedding moves, the data doesn&apos;t
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Three fixed high-dimensional clusters projected to 2D. Drag the locality knob (<strong>perplexity</strong> for t-SNE, <strong>n_neighbors</strong> for UMAP) and watch the same structure re-arrange. Low values fragment and over-separate; high values pull everything global. The dashed lines are inter-cluster gaps — they shift with the knob, which is the proof they are <strong>not meaningful</strong>.
      </p>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 300,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          display: "block",
        }}
      />

      <label style={{ display: "block", marginTop: 14 }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 8 }}>
          locality knob: perplexity ≈ {perplexity} (t-SNE) · n_neighbors ≈ {nNeighbors} (UMAP)
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={knob}
          onChange={(e) => setKnob(+e.target.value)}
          style={{ width: "100%", accentColor: DS.ind }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace", marginTop: 4 }}>
          <span>low · local detail, fragmented</span>
          <span>high · global, merged</span>
        </div>
      </label>

      <div
        style={{
          marginTop: 14,
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${DS.borderStrong}`,
          background: "rgba(129,140,248,0.08)",
          fontSize: 11.5,
          color: DS.t2,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.6,
        }}
      >
        ⚠ Read this plot for <strong>cluster membership only</strong>. The distance between
        blobs, the size of a blob, and its on-screen density are <strong>not</strong> meaningful —
        t-SNE/UMAP preserve local neighborhoods, not global geometry. Trust only structure
        that persists as you vary the knob (and the random seed).
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        {knob < 0.3
          ? "Low perplexity / few neighbors: clusters fly apart and internal detail is exaggerated — at the extreme, even noise can look like crisp sub-clusters."
          : knob > 0.7
          ? "High perplexity / many neighbors: global structure dominates, clusters tighten and drift together — distinct groups can visually merge."
          : "A balanced setting: three clusters are clearly separated. Note all three blobs render at similar sizes even though their true high-dim densities differ — t-SNE/UMAP equalize density."}
      </p>
    </div>
  );
}
