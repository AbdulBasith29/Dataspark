import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * SVM viz (ml-s6): two 2D point clouds. Linear mode shows a max-margin
 * separating line whose margin width responds to the soft-margin C slider,
 * highlighting the support vectors (points on/inside the margin). RBF mode
 * shows that a concentric (non-linearly-separable) layout needs a kernel —
 * rendered as a curved decision region with a γ slider.
 */

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Linearly separable-ish two blobs.
const LINEAR_PTS = (() => {
  const rng = mulberry32(42);
  const p = [];
  for (let i = 0; i < 16; i++) p.push({ x: 0.2 + rng() * 0.28, y: 0.55 + rng() * 0.35, c: 0 });
  for (let i = 0; i < 16; i++) p.push({ x: 0.55 + rng() * 0.3, y: 0.1 + rng() * 0.35, c: 1 });
  return p;
})();

// Concentric: inner class 1, outer ring class 0 — not linearly separable.
const RBF_PTS = (() => {
  const rng = mulberry32(7);
  const p = [];
  for (let i = 0; i < 18; i++) {
    const a = rng() * Math.PI * 2;
    const r = 0.04 + rng() * 0.12;
    p.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a), c: 1 });
  }
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2;
    const r = 0.3 + rng() * 0.16;
    p.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a), c: 0 });
  }
  return p;
})();

export default function SVMMargins() {
  const [kernel, setKernel] = useState("linear"); // "linear" | "rbf"
  const [logC, setLogC] = useState(0); // C = 10^logC
  const [gamma, setGamma] = useState(40);
  const canvasRef = useRef(null);

  const C = useMemo(() => Math.pow(10, logC), [logC]);

  // For the linear demo we use a fixed oriented boundary (normal w, offset b)
  // and let C control the margin half-width: large C -> narrow margin.
  const linear = useMemo(() => {
    const wx = 0.8;
    const wy = -0.6; // boundary normal
    const nrm = Math.hypot(wx, wy);
    const ux = wx / nrm;
    const uy = wy / nrm;
    const b = -(ux * 0.5 + uy * 0.45); // passes near the gap
    // margin half-width shrinks as C grows (1/||w|| analogy).
    const margin = 0.08 + 0.22 / (1 + 0.6 * C);
    const signed = (p) => ux * p.x + uy * p.y + b;
    const support = LINEAR_PTS.filter((p) => Math.abs(signed(p)) <= margin + 0.02);
    return { ux, uy, b, margin, signed, support };
  }, [C]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 30;
    const sz = Math.min(cssW - pad * 2, cssH - pad * 2);
    const ox = (cssW - sz) / 2;
    const oy = (cssH - sz) / 2;
    const tx = (x) => ox + x * sz;
    const ty = (y) => oy + (1 - y) * sz;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, sz, sz);

    if (kernel === "rbf") {
      // Decision region from a simple RBF score: sum over class-1 minus class-0.
      const g = gamma;
      const step = 6;
      for (let px = 0; px < sz; px += step) {
        for (let py = 0; py < sz; py += step) {
          const x = px / sz;
          const y = 1 - py / sz;
          let score = 0;
          for (const pt of RBF_PTS) {
            const d2 = (x - pt.x) ** 2 + (y - pt.y) ** 2;
            score += (pt.c === 1 ? 1 : -1) * Math.exp(-g * d2);
          }
          ctx.fillStyle =
            score > 0 ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.08)";
          ctx.fillRect(ox + px, oy + py, step, step);
        }
      }
      // points
      RBF_PTS.forEach((p) => {
        const col = p.c === 1 ? "rgba(52,211,153,0.95)" : "rgba(248,113,113,0.9)";
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.y), 6, 0, Math.PI * 2);
        ctx.fillStyle = col.replace("0.95", "0.3").replace("0.9", "0.25");
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    } else {
      const { ux, uy, b, margin, signed, support } = linear;
      // boundary line: ux*x + uy*y + b = 0  ->  draw across the box.
      const drawLine = (off, style, width, dash) => {
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        // solve for endpoints at x=0 and x=1 (uy != 0 here).
        const yAt = (x) => -(ux * x + b - off) / uy;
        ctx.beginPath();
        ctx.moveTo(tx(0), ty(yAt(0)));
        ctx.lineTo(tx(1), ty(yAt(1)));
        ctx.stroke();
        ctx.setLineDash([]);
      };
      drawLine(margin, "rgba(129,140,248,0.4)", 1.5, [5, 4]);
      drawLine(-margin, "rgba(129,140,248,0.4)", 1.5, [5, 4]);
      drawLine(0, "rgba(129,140,248,0.95)", 2.5, []);

      LINEAR_PTS.forEach((p) => {
        const isSV = support.includes(p);
        const col = p.c === 1 ? "rgba(52,211,153,0.95)" : "rgba(248,113,113,0.9)";
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.y), isSV ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = col.replace("0.95", "0.3").replace("0.9", "0.25");
        ctx.fill();
        ctx.strokeStyle = isSV ? DS.t1 : col;
        ctx.lineWidth = isSV ? 2.5 : 1.5;
        ctx.stroke();
        // tick mark unused; signed kept for clarity of intent
        void signed;
      });
    }

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.fillText("x₁", cssW - pad - 8, cssH - oy + 14 > cssH ? cssH - 6 : oy + sz + 16);
  }, [kernel, linear, gamma]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        SVM: margins, support vectors &amp; kernels
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        {kernel === "linear"
          ? "Solid line = max-margin boundary; dashed = the margin. White-ringed points are support vectors — only they fix the boundary. Raise C to shrink the margin and overfit."
          : "Concentric classes are not linearly separable. The RBF kernel bends the boundary; γ sets how local each point's influence is — high γ = wiggly (overfit)."}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["linear", "rbf"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKernel(k)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${kernel === k ? DS.borderStrong : DS.border}`,
              background: kernel === k ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.04)",
              color: kernel === k ? DS.t1 : DS.t2,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {k} kernel
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 320, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }}
      />

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {kernel === "linear" ? (
          <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            soft-margin C = {C.toFixed(2)} {C >= 5 ? "(low regularization → narrow margin)" : "(high regularization → wide margin)"}
            <input
              type="range"
              min={-1}
              max={1.3}
              step={0.05}
              value={logC}
              onChange={(e) => setLogC(+e.target.value)}
              style={{ width: "100%", marginTop: 6, accentColor: DS.ind }}
            />
            <span style={{ display: "block", marginTop: 8, color: DS.t2 }}>
              support vectors: {linear.support.length} · margin half-width ≈ {linear.margin.toFixed(3)}
            </span>
          </label>
        ) : (
          <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            RBF γ = {gamma} {gamma >= 60 ? "(tight influence → wiggly, overfit)" : "(broad influence → smooth)"}
            <input
              type="range"
              min={8}
              max={120}
              step={2}
              value={gamma}
              onChange={(e) => setGamma(+e.target.value)}
              style={{ width: "100%", marginTop: 6, accentColor: DS.grn }}
            />
          </label>
        )}
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Large C trusts the data (low bias, high variance); small C trusts the margin — the opposite direction from ridge&apos;s λ. The kernel trick computes inner products in an implicit higher-dimensional space, so the boundary can curve without ever materializing that space.
      </p>
    </div>
  );
}
