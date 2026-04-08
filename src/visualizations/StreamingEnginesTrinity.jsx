import { useEffect, useRef } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function StreamingEnginesTrinity() {
  const canvasRef = useRef(null);
  const t0 = useRef(performance.now());
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext("2d");
      const cssW = canvas.clientWidth || 520;
      const cssH = 260;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const t = (performance.now() - t0.current) / 1000;
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, 0, cssW, cssH);

      const colW = (cssW - 48) / 3;
      const x0 = 16;
      const top = 38;
      const h = cssH - top - 28;
      const titles = ["Kafka (durable log)", "Spark Streaming (micro-batch)", "Flink (event-time state)"];

      titles.forEach((title, col) => {
        const x = x0 + col * (colW + 8);
        ctx.strokeStyle = DS.border;
        ctx.strokeRect(x, top, colW, h);
        ctx.fillStyle = DS.t2;
        ctx.font = "10px var(--ds-mono), monospace";
        ctx.textAlign = "center";
        ctx.fillText(title, x + colW / 2, 22);

        if (col === 0) {
          const rows = 7;
          for (let r = 0; r < rows; r++) {
            const off = (t * 0.9 + r * 0.12) % 1;
            const y = top + h - 14 - off * (h - 28);
            ctx.fillStyle = "rgba(129, 140, 248, " + String(0.2 + 0.5 * (1 - off)) + ")";
            ctx.fillRect(x + 8, y, colW - 16, 10);
            ctx.fillStyle = DS.t3;
            ctx.font = "8px var(--ds-mono), monospace";
            ctx.textAlign = "left";
            ctx.fillText("offset " + String((r + Math.floor(t * 3)) % 900), x + 10, y + 8);
          }
        } else if (col === 1) {
          const period = 1.4;
          const ph = (t % period) / period;
          const bw = colW - 20;
          const bh = Math.min(h * 0.45, ph < 0.65 ? (ph / 0.65) * h * 0.45 : h * 0.45);
          ctx.fillStyle = "rgba(52, 211, 153, 0.35)";
          ctx.fillRect(x + 10, top + h / 2 - bh / 2, bw, bh);
          ctx.fillStyle = DS.t3;
          ctx.font = "9px var(--ds-mono), monospace";
          ctx.textAlign = "center";
          ctx.fillText(ph < 0.65 ? "collecting window..." : "RDD / DS batch", x + colW / 2, top + h - 10);
        } else {
          const beltY = top + h * 0.55;
          ctx.strokeStyle = DS.dim;
          ctx.beginPath();
          ctx.moveTo(x + 8, beltY);
          ctx.lineTo(x + colW - 8, beltY);
          ctx.stroke();
          for (let i = 0; i < 12; i++) {
            const u = (t * 55 + i * 19) % (colW + 30);
            const px = x + colW - 10 - u;
            if (px < x + 8) continue;
            ctx.beginPath();
            ctx.arc(px, beltY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(251, 191, 36, 0.75)";
            ctx.fill();
          }
          ctx.fillStyle = DS.t3;
          ctx.font = "9px var(--ds-mono), monospace";
          ctx.textAlign = "center";
          ctx.fillText("low-latency + state", x + colW / 2, top + h - 10);
        }
      });

      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText("Pick by latency, semantics, and ops maturity; stacks often combine all three", cssW / 2, cssH - 8);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Kafka, Spark Streaming, and Flink side by side
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Kafka is the replayable log and decoupling layer. Spark often micro-batches for throughput and SQL ergonomics. Flink targets lower latency with event-time operators and managed state. Real platforms mix them under a control plane.
      </p>
      <canvas ref={canvasRef} style={{ width: "100%", height: 260, borderRadius: 12, border: "1px solid " + DS.border, display: "block" }} />
      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Interview angle: compare delivery guarantees, backpressure, state checkpoints, and what breaks at 2x traffic.
      </p>
    </div>
  );
}
