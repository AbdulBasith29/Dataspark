import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const WORDS = [
  { id: "king", x: 1.25, y: 0.75 },
  { id: "man", x: 0.45, y: 0.15 },
  { id: "woman", x: -0.35, y: 0.95 },
  { id: "queen", x: 0.42, y: 1.48 },
  { id: "paris", x: 0.95, y: -0.55 },
  { id: "france", x: 0.18, y: -0.48 },
];

export default function WordEmbeddings() {
  const [showVectors, setShowVectors] = useState(true);
  const canvasRef = useRef(null);

  const king = WORDS.find((w) => w.id === "king");
  const man = WORDS.find((w) => w.id === "man");
  const woman = WORDS.find((w) => w.id === "woman");
  const queen = WORDS.find((w) => w.id === "queen");

  const rx = king.x - man.x + woman.x;
  const ry = king.y - man.y + woman.y;

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

    const pad = 36;
    const span = 2.2;
    const cx = cssW / 2;
    const cy = cssH / 2;
    const sc = Math.min(cssW, cssH) / 2 / span;

    const tx = (x) => cx + x * sc;
    const ty = (y) => cy - y * sc;

    ctx.strokeStyle = DS.border;
    ctx.beginPath();
    ctx.moveTo(pad, cy);
    ctx.lineTo(cssW - pad, cy);
    ctx.moveTo(cx, pad);
    ctx.lineTo(cx, cssH - pad);
    ctx.stroke();

    const drawArrow = (x0, y0, x1, y1, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx(x0), ty(y0));
      ctx.lineTo(tx(x1), ty(y1));
      ctx.stroke();
      const ang = Math.atan2(ty(y1) - ty(y0), tx(x1) - tx(x0));
      const ah = 10;
      ctx.beginPath();
      ctx.moveTo(tx(x1), ty(y1));
      ctx.lineTo(tx(x1) - ah * Math.cos(ang - 0.4), ty(y1) - ah * Math.sin(ang - 0.4));
      ctx.lineTo(tx(x1) - ah * Math.cos(ang + 0.4), ty(y1) - ah * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    if (showVectors && king && man && woman) {
      drawArrow(man.x, man.y, king.x, king.y, "rgba(52, 211, 153, 0.75)");
      drawArrow(king.x, king.y, woman.x, woman.y, "rgba(251, 191, 36, 0.8)");
      drawArrow(man.x, man.y, rx, ry, "rgba(248, 113, 113, 0.85)");
    }

    WORDS.forEach((w) => {
      ctx.beginPath();
      ctx.arc(tx(w.x), ty(w.y), w.id === "queen" ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = w.id === "queen" ? "rgba(251, 191, 36, 0.45)" : "rgba(129, 140, 248, 0.4)";
      ctx.fill();
      ctx.strokeStyle = DS.border;
      ctx.stroke();
      ctx.fillStyle = DS.t1;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText(w.id, tx(w.x), ty(w.y) - 12);
    });

    if (showVectors && queen) {
      ctx.beginPath();
      ctx.arc(tx(rx), ty(ry), 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(248, 113, 113, 0.9)";
      ctx.fill();
      ctx.fillStyle = DS.t3;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.fillText("k-m+w", tx(rx), ty(ry) + 18);
    }

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("dim 1 (toy 2D)", cssW / 2, cssH - 8);
  }, [showVectors, king, man, woman, queen, rx, ry]);

  const err = Math.hypot(rx - queen.x, ry - queen.y);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Word vectors in 2D (toy analogy)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Learned embeddings place related words nearby. king minus man plus woman lands near queen in this demo. Green: man to king; yellow: king toward woman; red: composed vector.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setShowVectors((v) => !v)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: showVectors ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
            color: DS.t1,
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {showVectors ? "Hide vector walk" : "Show vector walk"}
        </button>
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace" }}>
        L2 distance queen vs composed: {err.toFixed(3)}
      </p>

      <p style={{ marginTop: 12, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Real embeddings use high dimensions; 2D is for intuition only. Contextual models change the vector with surrounding tokens.
      </p>
    </div>
  );
}
