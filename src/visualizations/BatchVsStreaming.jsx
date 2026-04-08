import { useEffect, useRef } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function BatchVsStreaming() {
  const canvasRef = useRef(null);
  const t0 = useRef(performance.now());
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawFrame = () => {
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

      const mid = cssW / 2;
      ctx.strokeStyle = DS.border;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(mid, 12);
      ctx.lineTo(mid, cssH - 12);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = DS.t2;
      ctx.font = "11px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText("Batch (scheduled windows)", mid * 0.5, 22);
      ctx.fillText("Streaming (continuous)", mid + mid * 0.5, 22);

      const batchPeriod = 3.2;
      const bt = t % batchPeriod;
      const batchPhase = bt / batchPeriod;
      const leftPad = 20;
      const leftW = mid - leftPad - 16;
      const top = 44;
      const h = cssH - top - 36;

      ctx.strokeStyle = DS.border;
      ctx.strokeRect(leftPad, top, leftW, h);

      const barMax = h - 24;
      let barH = 0;
      if (batchPhase < 0.55) {
        barH = (batchPhase / 0.55) * barMax;
      } else if (batchPhase < 0.72) {
        barH = barMax;
        ctx.fillStyle = "rgba(129, 140, 248, 0.35)";
        ctx.fillRect(leftPad + 4, top + h - barMax - 4, leftW - 8, barMax + 8);
      } else {
        barH = barMax * (1 - (batchPhase - 0.72) / 0.28);
      }

      ctx.fillStyle = "rgba(52, 211, 153, 0.45)";
      ctx.fillRect(leftPad + 10, top + h - 10 - barH, leftW - 20, barH);

      ctx.fillStyle = DS.t3;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText(batchPhase < 0.55 ? "accumulating slice..." : batchPhase < 0.72 ? "job running" : "idle until next window", leftPad + 8, top + 14);

      const rightX = mid + 16;
      const rightW = cssW - rightX - 20;
      ctx.strokeStyle = DS.border;
      ctx.strokeRect(rightX, top, rightW, h);

      const beltY = top + h * 0.55;
      ctx.strokeStyle = DS.dim;
      ctx.beginPath();
      ctx.moveTo(rightX + 8, beltY);
      ctx.lineTo(rightX + rightW - 8, beltY);
      ctx.stroke();

      const nDots = 14;
      for (let i = 0; i < nDots; i++) {
        const offset = (t * 38 + i * 22) % (rightW + 40);
        const x = rightX + rightW - 8 - offset;
        if (x < rightX + 8 || x > rightX + rightW - 8) continue;
        ctx.beginPath();
        ctx.arc(x, beltY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + 0.5 * (i % 3 === 0 ? 1 : 0.4)})`;
        ctx.fill();
      }

      ctx.fillStyle = DS.t3;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText("events arrive one-by-one (or micro-batches)", rightX + 8, top + 14);

      ctx.textAlign = "center";
      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.fillText("Higher latency vs simpler correctness; streaming adds ordering, watermarks, and state", cssW / 2, cssH - 10);

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Batch windows vs continuous streaming
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Batch jobs bound work to files or time slices, then process in bulk. Streaming pipelines handle records close to arrival time. The animation contrasts a periodic bar (daily or hourly load) with a steady flow on a conveyor.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 260, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Choose batch for backfills, cheaper warehouse scans, and simpler failure modes. Choose streaming for fraud alerts, live dashboards, and SLA-sensitive paths — often with windowing and exactly-once semantics as extra design cost.
      </p>
    </div>
  );
}
