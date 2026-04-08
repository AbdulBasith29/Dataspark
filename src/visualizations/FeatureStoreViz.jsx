import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function FeatureStoreViz() {
  const [highlight, setHighlight] = useState("both");
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 520;
    const cssH = 240;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const mid = cssW / 2;
    const top = 44;
    const h = cssH - top - 32;
    const leftW = mid - 28;
    const rightX = mid + 16;
    const rightW = cssW - rightX - 16;

    const leftOn = highlight === "both" || highlight === "offline";
    const rightOn = highlight === "both" || highlight === "online";

    ctx.strokeStyle = DS.border;
    ctx.strokeRect(16, top, leftW, h);
    ctx.fillStyle = DS.t2;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("Offline store (warehouse / lake)", 16 + leftW / 2, top - 8);

    ctx.fillStyle = leftOn ? "rgba(129, 140, 248, 0.15)" : "rgba(255,255,255,0.03)";
    ctx.fillRect(20, top + 8, leftW - 8, h - 16);
    ctx.fillStyle = DS.t3;
    ctx.font = "9px var(--ds-mono), monospace";
    ctx.textAlign = "left";
    const rows = ["user_id", "session_cnt_7d", "total_spend_30d", "last_seen_ts"];
    rows.forEach((r, i) => {
      ctx.fillText(r, 28, top + 28 + i * 18);
    });
    ctx.fillStyle = DS.grn;
    ctx.fillText("batch backfill / training reads", 28, top + h - 14);

    ctx.strokeStyle = DS.border;
    ctx.strokeRect(rightX, top, rightW, h);
    ctx.fillStyle = DS.t2;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("Online store (low-latency)", rightX + rightW / 2, top - 8);

    ctx.fillStyle = rightOn ? "rgba(52, 211, 153, 0.12)" : "rgba(255,255,255,0.03)";
    ctx.fillRect(rightX + 4, top + 8, rightW - 8, h - 16);
    ctx.fillStyle = DS.t3;
    ctx.font = "9px var(--ds-mono), monospace";
    ctx.textAlign = "left";
    ctx.fillText("entity: user:42", rightX + 12, top + 28);
    ctx.fillText("vector: [0.2, 1.0, ...]", rightX + 12, top + 46);
    ctx.fillStyle = DS.grn;
    ctx.fillText("point reads at serve time", rightX + 12, top + h - 14);

    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.strokeStyle = `rgba(251, 191, 136, ${0.25 + 0.35 * pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(16 + leftW / 2, top + h + 4);
    ctx.lineTo(16 + leftW / 2, cssH - 6);
    ctx.lineTo(rightX + rightW / 2, cssH - 6);
    ctx.lineTo(rightX + rightW / 2, top + h + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = DS.t3;
    ctx.font = "9px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("Consistency: same logical feature, two physical paths", cssW / 2, cssH - 8);
  }, [highlight]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Feature store: offline vs online paths
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Training and batch scoring pull wide historical features from the warehouse. Serving needs millisecond reads with freshness guarantees. A feature store ties definitions, lineage, and materialization jobs so both paths stay aligned.
      </p>
      <canvas ref={canvasRef} style={{ width: "100%", height: 240, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[
          { id: "both", label: "Both paths" },
          { id: "offline", label: "Highlight offline" },
          { id: "online", label: "Highlight online" },
        ].map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setHighlight(b.id)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: highlight === b.id ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Discuss point-in-time correctness for training labels, TTLs for online keys, and how you detect train-serve skew before it hits metrics.
      </p>
    </div>
  );
}
