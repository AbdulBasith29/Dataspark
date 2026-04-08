import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ETL_LABELS = ["Sources", "Extract", "Transform", "Load", "Warehouse"];
const ELT_LABELS = ["Sources", "Extract", "Load raw", "Transform", "Curated"];

function drawRoundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export default function ETLPipeline() {
  const [mode, setMode] = useState("etl");
  const [paused, setPaused] = useState(false);
  const canvasRef = useRef(null);
  const modeRef = useRef(mode);
  const pausedRef = useRef(paused);
  modeRef.current = mode;
  pausedRef.current = paused;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    const labelsFor = (m) => (m === "etl" ? ETL_LABELS : ELT_LABELS);

    const loop = (now) => {
      if (!pausedRef.current) {
        const dt = (now - last) / 1000;
        last = now;
        phase = (phase + dt * 0.22) % 1;
      } else {
        last = now;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const cssW = canvas.clientWidth || 520;
        const cssH = 240;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.clearRect(0, 0, cssW, cssH);
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(0, 0, cssW, cssH);

        const labels = labelsFor(modeRef.current);
        const n = 5;
        const padX = 28;
        const gap = (cssW - 2 * padX) / (n - 1);
        const y = cssH * 0.52;
        const rw = 72;
        const rh = 36;

        const centers = Array.from({ length: n }, (_, i) => ({
          x: padX + i * gap,
          y,
        }));

        ctx.strokeStyle = DS.border;
        ctx.lineWidth = 2;
        for (let i = 0; i < n - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(centers[i].x + rw / 2, y);
          ctx.lineTo(centers[i + 1].x - rw / 2, y);
          ctx.stroke();
        }

        centers.forEach((c, i) => {
          const segStart = i / (n - 1);
          const segEnd = (i + 1) / (n - 1);
          const active = phase >= segStart && phase < segEnd;
          ctx.fillStyle = active ? "rgba(129, 140, 248, 0.22)" : "rgba(255,255,255,0.04)";
          ctx.strokeStyle = active ? DS.ind : DS.border;
          ctx.lineWidth = active ? 2 : 1;
          drawRoundRect(ctx, c.x - rw / 2, y - rh / 2, rw, rh, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = DS.t2;
          ctx.font = "9px var(--ds-mono), monospace";
          ctx.textAlign = "center";
          ctx.fillText(labels[i], c.x, y + 3);
        });

        const pathLen = n - 1;
        for (let k = 0; k < 4; k++) {
          const u = (phase + k * 0.22) % 1;
          const pos = u * pathLen;
          const seg = Math.min(Math.floor(pos), pathLen - 1);
          const t = pos - seg;
          const x0 = centers[seg].x + rw / 2;
          const x1 = centers[seg + 1].x - rw / 2;
          const px = x0 + t * (x1 - x0);
          ctx.beginPath();
          ctx.arc(px, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(52, 211, 153, ${0.55 + 0.35 * Math.sin(phase * Math.PI * 2 + k)})`;
          ctx.fill();
        }

        ctx.fillStyle = DS.t3;
        ctx.font = "10px var(--ds-mono), monospace";
        ctx.textAlign = "center";
        const cap =
          modeRef.current === "etl"
            ? "Curate before landing in the warehouse"
            : "Land raw first, transform inside the warehouse";
        ctx.fillText(cap, cssW / 2, cssH - 10);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        ETL vs ELT pipeline flow
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Same ingredients, different order: ETL shapes data in the integration layer before load. ELT ingests raw into a lake or warehouse, then uses SQL or dbt to model. Toggle to compare stage order; dots are illustrative record batches.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 240, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["etl", "elt"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${DS.border}`,
                background: mode === m ? "rgba(129,140,248,0.25)" : "rgba(255,255,255,0.04)",
                color: DS.t1,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
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
          {paused ? "Play" : "Pause"}
        </button>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Modern stacks often blend both: bronze, silver, and gold layers mix raw landing with curated marts. Pick ETL when upstream is messy and egress is costly; pick ELT when the warehouse is the compute engine.
      </p>
    </div>
  );
}
