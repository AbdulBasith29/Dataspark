import { useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function WarehouseStarSchema() {
  const [snowflake, setSnowflake] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const cssW = c.clientWidth || 520;
    const cssH = 260;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.floor(cssW * dpr);
    c.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);
    const cx = cssW / 2;
    const cy = cssH / 2 + 8;
    function drawTable(x, y, w, h, label, sub) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.strokeStyle = DS.border;
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      ctx.strokeRect(x - w / 2, y - h / 2, w, h);
      ctx.fillStyle = DS.t2;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y - 2);
      if (sub) {
        ctx.fillStyle = DS.t3;
        ctx.font = "8px var(--ds-mono), monospace";
        ctx.fillText(sub, x, y + 10);
      }
    }
    function line(x1, y1, x2, y2) {
      ctx.strokeStyle = DS.dim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    const fw = 100;
    const fh = 44;
    drawTable(cx, cy, fw, fh, "FACT_ORDERS", "grain: line item");
    const r = 108;
    const dims = [
      { label: "DIM_CUSTOMER", sub: "cust_key", x: cx, y: cy - r },
      { label: "DIM_PRODUCT", sub: "product_key", x: cx + r * 0.92, y: cy + r * 0.45 },
      { label: "DIM_DATE", sub: "date_key", x: cx - r * 0.92, y: cy + r * 0.45 },
    ];
    dims.forEach((d) => {
      line(cx, cy - fh / 2, d.x, d.y + 22);
      drawTable(d.x, d.y, 92, 40, d.label, d.sub);
    });
    if (snowflake) {
      const px = cx + r * 0.92 + 78;
      const py = cy + r * 0.45;
      line(cx + r * 0.92 + 46, cy + r * 0.45, px - 40, py);
      drawTable(px, py, 72, 34, "DIM_BRAND", null);
      drawTable(px, py + 48, 72, 34, "DIM_CATEGORY", null);
      ctx.fillStyle = DS.t3;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText("Product normalized into hierarchy", 12, cssH - 14);
    } else {
      ctx.fillStyle = DS.t3;
      ctx.font = "9px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText("Denormalized dims for fast joins", 12, cssH - 14);
    }
    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("Fact holds metrics + foreign keys; dims hold descriptive attributes", cx, 20);
  }, [snowflake]);

  const border = "1px solid " + DS.border;
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Star vs snowflake warehouse shape
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Star schema keeps wide dimension tables for simpler queries. Snowflake normalizes dimensions for less redundancy at the cost of extra joins.
      </p>
      <canvas ref={canvasRef} style={{ width: "100%", height: 260, borderRadius: 12, border, display: "block" }} />
      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={() => setSnowflake((s) => !s)} style={{ padding: "8px 14px", borderRadius: 8, border, background: snowflake ? "rgba(129,140,248,0.22)" : "rgba(255,255,255,0.04)", color: DS.t1, fontFamily: "var(--ds-mono), monospace", fontSize: 11, cursor: "pointer" }}>
          {snowflake ? "Show star" : "Show snowflake"}
        </button>
      </div>
      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Interview tip: tie grain, late-arriving facts, and SCD types to keys and partitions.
      </p>
    </div>
  );
}
