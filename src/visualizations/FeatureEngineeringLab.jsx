import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * FeatureEngineeringLab — shows how a transform re-draws the coordinate system
 * so an inseparable problem becomes linearly separable. Two classes live on
 * concentric rings: inseparable by a straight line in raw (x, y), but a single
 * threshold on r² = x² + y² splits them perfectly. The user picks a transform
 * and sees the "after" view + whether a linear boundary now works.
 * No props. Standalone canvas + transform selector + threshold slider.
 */

const TRANSFORMS = [
  {
    id: "raw",
    label: "Raw (x, y)",
    desc: "The original coordinates. A linear model can only draw a straight line — useless against a ring.",
    separable: false,
  },
  {
    id: "radius",
    label: "r² = x² + y²",
    desc: "One engineered feature. The circular boundary becomes a single linear threshold on r² — trivially separable.",
    separable: true,
  },
  {
    id: "binned",
    label: "Binned radius",
    desc: "Discretize r² into rings. Captures the step-like boundary; coarser than the continuous version but robust.",
    separable: true,
  },
  {
    id: "logx",
    label: "log|x|·log|y|",
    desc: "A mismatched transform — it warps the axes but does NOT expose the radial structure. Still inseparable.",
    separable: false,
  },
];

/** Build two concentric rings: inner = class 0, outer = class 1. */
function buildPoints() {
  const pts = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 26; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = 0.12 + rand() * 0.1; // inner ring
    pts.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a), cls: 0 });
  }
  for (let i = 0; i < 34; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = 0.3 + rand() * 0.12; // outer ring
    pts.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a), cls: 1 });
  }
  return pts;
}

const CLASS_COLOR = ["rgba(129, 140, 248, 0.95)", "rgba(52, 211, 153, 0.95)"];

export default function FeatureEngineeringLab() {
  const points = useMemo(buildPoints, []);
  const [transform, setTransform] = useState("raw");
  const [thresh, setThresh] = useState(0.06); // threshold on r² for the "radius" view
  const canvasRef = useRef(null);

  const current = useMemo(
    () => TRANSFORMS.find((t) => t.id === transform) || TRANSFORMS[0],
    [transform]
  );

  // Project each point into the chosen feature space, normalized to [0,1].
  const projected = useMemo(() => {
    return points.map((p) => {
      const dx = p.x - 0.5;
      const dy = p.y - 0.5;
      if (transform === "raw") {
        return { fx: p.x, fy: p.y, cls: p.cls };
      }
      if (transform === "radius") {
        const r2 = dx * dx + dy * dy; // 0 .. ~0.18
        // map r² onto x-axis, jitter y so points don't overlap on a line
        return { fx: Math.min(1, r2 / 0.2), fy: 0.2 + ((p.x * 7.3) % 0.6), cls: p.cls };
      }
      if (transform === "binned") {
        const r2 = dx * dx + dy * dy;
        const bin = Math.min(4, Math.floor((r2 / 0.2) * 5));
        return { fx: 0.1 + bin * 0.2, fy: 0.2 + ((p.y * 9.1) % 0.6), cls: p.cls };
      }
      // logx: warp axes but keep them as axes (does not expose radius)
      const lx = Math.log(Math.abs(dx) + 0.05);
      const ly = Math.log(Math.abs(dy) + 0.05);
      const norm = (v) => (v + 3) / 3; // roughly -3..0 -> 0..1
      return { fx: Math.min(1, Math.max(0, norm(lx))), fy: Math.min(1, Math.max(0, norm(ly))), cls: p.cls };
    });
  }, [points, transform]);

  // For the radius view, count how cleanly the threshold separates classes.
  const accuracy = useMemo(() => {
    if (transform !== "radius" && transform !== "binned") return null;
    let correct = 0;
    projected.forEach((p) => {
      const pred = p.fx < (transform === "radius" ? thresh / 0.2 : thresh / 0.2) ? 0 : 1;
      if (pred === p.cls) correct += 1;
    });
    return correct / projected.length;
  }, [projected, transform, thresh]);

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

    const pad = 36;
    const half = (cssW - pad * 3) / 2;
    const plotH = cssH - pad * 2;

    const panel = (ox, titleColor, title) => {
      ctx.strokeStyle = DS.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, pad, half, plotH);
      ctx.fillStyle = titleColor;
      ctx.font = "11px var(--ds-mono), monospace";
      ctx.fillText(title, ox + 4, pad - 8);
    };

    // LEFT: always raw (x, y) for reference.
    const lx0 = pad;
    panel(lx0, DS.t3, "raw (x, y) — input space");
    const ltx = (x) => lx0 + x * half;
    const lty = (y) => pad + (1 - y) * plotH;
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(ltx(p.x), lty(p.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = CLASS_COLOR[p.cls];
      ctx.fill();
    });
    // straight line through raw space — clearly fails
    ctx.strokeStyle = "rgba(248, 250, 252, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(ltx(0.05), lty(0.75));
    ctx.lineTo(ltx(0.95), lty(0.25));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DS.t3;
    ctx.fillText("no straight line separates", lx0 + 4, pad + plotH - 8);

    // RIGHT: the chosen feature space.
    const rx0 = pad * 2 + half;
    panel(rx0, current.accent || DS.grn, `after: ${current.label}`);
    const rtx = (x) => rx0 + x * half;
    const rty = (y) => pad + (1 - y) * plotH;
    projected.forEach((p) => {
      ctx.beginPath();
      ctx.arc(rtx(p.fx), rty(p.fy), 5, 0, Math.PI * 2);
      ctx.fillStyle = CLASS_COLOR[p.cls];
      ctx.fill();
    });

    // For separable radial transforms, draw the vertical threshold boundary.
    if (transform === "radius" || transform === "binned") {
      const bx = rtx(thresh / 0.2);
      ctx.strokeStyle = DS.grn;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, pad);
      ctx.lineTo(bx, pad + plotH);
      ctx.stroke();
      ctx.fillStyle = DS.grn;
      ctx.fillText("linear threshold ✓", rx0 + 4, pad + plotH - 8);
    } else if (transform === "logx") {
      ctx.fillStyle = "#FB7185";
      ctx.fillText("still tangled ✗", rx0 + 4, pad + plotH - 8);
    } else {
      ctx.fillStyle = DS.t3;
      ctx.fillText("identical to input", rx0 + 4, pad + plotH - 8);
    }
  }, [points, projected, transform, thresh, current]);

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
        Feature engineering: re-draw the coordinates
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
        Two classes sit on concentric rings — <strong style={{ color: DS.t2 }}>no straight line</strong> separates them
        in raw (x, y). Pick a transform; the right panel shows the new feature space. The right transform turns an
        unlearnable problem into a single linear threshold.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {TRANSFORMS.map((t) => {
          const active = t.id === transform;
          const col = t.separable ? DS.grn : "#FB7185";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTransform(t.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${active ? col : DS.border}`,
                background: active ? `${col}1F` : "rgba(255,255,255,0.02)",
                color: active ? DS.t1 : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

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

      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${(current.separable ? DS.grn : "#FB7185") + "33"}`,
          background: (current.separable ? DS.grn : "#FB7185") + "10",
        }}
      >
        <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.6 }}>
          {current.desc}
        </div>
      </div>

      {(transform === "radius" || transform === "binned") && (
        <label style={{ display: "block", marginTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>linear threshold on r² = {thresh.toFixed(3)}</span>
            {accuracy != null && (
              <span style={{ color: accuracy > 0.92 ? DS.grn : DS.t2 }}>
                separation accuracy = {(accuracy * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <input
            type="range"
            min={0.01}
            max={0.18}
            step={0.005}
            value={thresh}
            onChange={(e) => setThresh(+e.target.value)}
            style={{ width: "100%", accentColor: DS.grn }}
          />
        </label>
      )}

      <p
        style={{
          marginTop: 14,
          fontSize: 12,
          color: DS.t3,
          lineHeight: 1.65,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        The data never changed — only the <strong style={{ color: DS.t2 }}>representation</strong> did. This is the whole
        idea of feature engineering: inject the domain knowledge (here, &ldquo;distance from center matters&rdquo;) that the
        model cannot discover on its own. A mismatched transform (log axes) warps the picture but never exposes the real
        signal.
      </p>
    </div>
  );
}
