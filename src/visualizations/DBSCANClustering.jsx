import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * Two interleaving crescents (the "two moons" shape) plus a sparse halo of
 * noise. K-means cannot recover these non-convex shapes; DBSCAN can, by
 * growing clusters along chains of dense points. eps + minPts sliders
 * reclassify every point into core / border / noise and recolor clusters.
 */

const CLUSTER_COLORS = [
  "rgba(129, 140, 248, 0.95)", // indigo
  "rgba(52, 211, 153, 0.95)", // green
  "rgba(244, 114, 182, 0.95)", // pink
  "rgba(251, 191, 36, 0.95)", // amber
  "rgba(56, 189, 248, 0.95)", // sky
];

/** Build the two-moons cloud once, deterministically (seeded LCG). */
function buildPoints() {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const jitter = (amp) => (rand() - 0.5) * amp;
  const pts = [];

  // Upper crescent
  for (let i = 0; i < 26; i++) {
    const t = Math.PI * (i / 25);
    pts.push({
      x: 0.32 + 0.26 * Math.cos(t) + jitter(0.05),
      y: 0.6 - 0.26 * Math.sin(t) + jitter(0.05),
    });
  }
  // Lower crescent (offset + flipped)
  for (let i = 0; i < 26; i++) {
    const t = Math.PI * (i / 25);
    pts.push({
      x: 0.58 - 0.26 * Math.cos(t) + jitter(0.05),
      y: 0.42 + 0.26 * Math.sin(t) + jitter(0.05),
    });
  }
  // Scattered noise
  for (let i = 0; i < 8; i++) {
    pts.push({ x: 0.08 + rand() * 0.84, y: 0.06 + rand() * 0.88 });
  }
  return pts.map((p) => ({
    x: Math.min(0.96, Math.max(0.04, p.x)),
    y: Math.min(0.96, Math.max(0.04, p.y)),
  }));
}

const POINTS = buildPoints();

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Classic DBSCAN. Returns labels (-1 = noise) and a core flag per point. */
function dbscan(points, eps, minPts) {
  const n = points.length;
  const labels = new Array(n).fill(undefined); // undefined = unvisited
  const isCore = new Array(n).fill(false);

  const neighbors = (i) => {
    const out = [];
    for (let j = 0; j < n; j++) {
      if (dist(points[i], points[j]) <= eps) out.push(j);
    }
    return out;
  };

  let cluster = -1;
  for (let i = 0; i < n; i++) {
    if (labels[i] !== undefined) continue;
    const nbrs = neighbors(i);
    if (nbrs.length < minPts) {
      labels[i] = -1; // provisional noise
      continue;
    }
    cluster += 1;
    labels[i] = cluster;
    isCore[i] = true;
    const queue = [...nbrs];
    for (let q = 0; q < queue.length; q++) {
      const j = queue[q];
      if (labels[j] === -1) labels[j] = cluster; // noise becomes border
      if (labels[j] !== undefined) continue;
      labels[j] = cluster;
      const jn = neighbors(j);
      if (jn.length >= minPts) {
        isCore[j] = true;
        for (const k of jn) queue.push(k);
      }
    }
  }
  return { labels, isCore };
}

export default function DBSCANClustering() {
  const [eps, setEps] = useState(0.11);
  const [minPts, setMinPts] = useState(4);
  const canvasRef = useRef(null);

  const { labels, isCore } = useMemo(
    () => dbscan(POINTS, eps, minPts),
    [eps, minPts]
  );

  const stats = useMemo(() => {
    let core = 0;
    let border = 0;
    let noise = 0;
    const clusters = new Set();
    labels.forEach((lab, i) => {
      if (lab === -1) noise += 1;
      else {
        clusters.add(lab);
        if (isCore[i]) core += 1;
        else border += 1;
      }
    });
    return { core, border, noise, k: clusters.size };
  }, [labels, isCore]);

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

    const pad = 28;
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2;
    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    // grid
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

    // eps radius preview around the first core point we find
    const probe = labels.findIndex((lab, i) => lab !== -1 && isCore[i]);
    if (probe >= 0) {
      const p = POINTS[probe];
      ctx.beginPath();
      ctx.arc(tx(p.x), ty(p.y), eps * plotW, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(248, 250, 252, 0.25)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    POINTS.forEach((p, i) => {
      const lab = labels[i];
      const px = tx(p.x);
      const py = ty(p.y);
      if (lab === -1) {
        // noise: hollow gray x
        ctx.strokeStyle = DS.dim;
        ctx.lineWidth = 1.4;
        const s = 4;
        ctx.beginPath();
        ctx.moveTo(px - s, py - s);
        ctx.lineTo(px + s, py + s);
        ctx.moveTo(px + s, py - s);
        ctx.lineTo(px - s, py + s);
        ctx.stroke();
        return;
      }
      const color = CLUSTER_COLORS[lab % CLUSTER_COLORS.length];
      const core = isCore[i];
      ctx.beginPath();
      ctx.arc(px, py, core ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = core ? color.replace("0.95", "0.6") : color.replace("0.95", "0.18");
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = core ? 2 : 1.2;
      ctx.stroke();
    });

    // legend
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillStyle = DS.t3;
    ctx.fillText("filled = core   ·   light = border   ·   x = noise", pad, cssH - 8);
  }, [labels, isCore, eps]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        DBSCAN: density finds shapes k-means can&apos;t
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Two interleaving crescents — a shape k-means slices straight through. DBSCAN grows clusters along chains of dense points, so it wraps each crescent and drops the sparse stragglers as noise. Tune <strong>eps</strong> (neighborhood radius, dashed circle) and <strong>minPts</strong> and watch every point recolor.
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

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", flex: "1 1 200px", minWidth: 160 }}>
          eps = {eps.toFixed(3)}
          <input
            type="range"
            min={0.04}
            max={0.24}
            step={0.005}
            value={eps}
            onChange={(e) => setEps(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.ind }}
          />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace", flex: "1 1 200px", minWidth: 160 }}>
          minPts = {minPts}
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={minPts}
            onChange={(e) => setMinPts(+e.target.value)}
            style={{ width: "100%", marginTop: 6, accentColor: DS.grn }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setEps(0.11);
            setMinPts(4);
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
          Reset to clean split
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 14, fontSize: 11, fontFamily: "var(--ds-mono), monospace", color: DS.t2 }}>
        <span>clusters: <strong style={{ color: DS.t1 }}>{stats.k}</strong></span>
        <span>core: <strong style={{ color: DS.ind }}>{stats.core}</strong></span>
        <span>border: <strong style={{ color: DS.grn }}>{stats.border}</strong></span>
        <span>noise: <strong style={{ color: DS.dim }}>{stats.noise}</strong></span>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        {stats.k <= 1
          ? "Right now eps is large enough that the two crescents have merged into one cluster — loosen eps too far and distinct shapes blur together."
          : stats.k >= 4 || stats.noise > 20
          ? "eps is small / minPts is high, so dense regions fragment and most points demote to noise — the over-fragmentation failure mode."
          : "Two crescents recovered as separate clusters, with sparse stragglers labeled noise. A single global eps is DBSCAN's weakness: if one cluster were much sparser, no single radius would fit both — that is what HDBSCAN solves."}
      </p>
    </div>
  );
}
