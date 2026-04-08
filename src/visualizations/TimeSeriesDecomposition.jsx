import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const N = 96;

export default function TimeSeriesDecomposition() {
  const [trendSlope, setTrendSlope] = useState(0.08);
  const [seasonAmp, setSeasonAmp] = useState(0.45);
  const [noiseAmp, setNoiseAmp] = useState(0.12);
  const [show, setShow] = useState({ y: true, trend: true, season: true, resid: true });
  const canvasRef = useRef(null);

  const series = useMemo(() => {
    const t = Array.from({ length: N }, (_, i) => i);
    const trend = t.map((i) => 2 + trendSlope * i);
    const period = 12;
    const season = t.map((i) => seasonAmp * Math.sin((2 * Math.PI * i) / period));
    const noise = t.map((i) => noiseAmp * Math.sin(i * 2.17 + 0.7) * Math.cos(i * 0.83));
    const y = t.map((i) => trend[i] + season[i] + noise[i]);
    const smooth = (arr, w) =>
      arr.map((_, i) => {
        let s = 0;
        let c = 0;
        for (let d = -w; d <= w; d++) {
          const j = i + d;
          if (j >= 0 && j < N) {
            s += arr[j];
            c++;
          }
        }
        return s / c;
      });
    const trendHat = smooth(y, 6);
    const detrended = y.map((v, i) => v - trendHat[i]);
    const seasonHat = detrended.map((v, i) => {
      const k = i % period;
      let sum = 0;
      let cnt = 0;
      for (let j = k; j < N; j += period) {
        sum += detrended[j];
        cnt++;
      }
      return cnt ? sum / cnt : 0;
    });
    const seasonalComp = t.map((i) => seasonHat[i]);
    const resid = y.map((v, i) => v - trendHat[i] - seasonalComp[i]);
    return { y, trendHat, seasonalComp, resid };
  }, [trendSlope, seasonAmp, noiseAmp]);

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

    const pad = { l: 44, r: 12, t: 14, b: 28 };
    const plotW = cssW - pad.l - pad.r;
    const plotH = cssH - pad.t - pad.b;

    const allVals = [...series.y, ...series.trendHat, ...series.seasonalComp, ...series.resid];
    const vmin = Math.min(...allVals) - 0.2;
    const vmax = Math.max(...allVals) + 0.2;
    const tx = (i) => pad.l + (i / (N - 1)) * plotW;
    const ty = (v) => pad.t + (1 - (v - vmin) / (vmax - vmin)) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.strokeRect(pad.l, pad.t, plotW, plotH);

    const drawLine = (arr, color, width, dash) => {
      ctx.beginPath();
      arr.forEach((v, i) => {
        if (i === 0) ctx.moveTo(tx(i), ty(v));
        else ctx.lineTo(tx(i), ty(v));
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    if (show.y) drawLine(series.y, "rgba(248, 250, 252, 0.9)", 2);
    if (show.trend) drawLine(series.trendHat, "rgba(52, 211, 153, 0.85)", 2, [4, 3]);
    if (show.season) drawLine(series.seasonalComp, "rgba(129, 140, 248, 0.9)", 1.5);
    if (show.resid) drawLine(series.resid, "rgba(251, 191, 36, 0.75)", 1, [2, 2]);

    ctx.fillStyle = DS.t3;
    ctx.font = "10px var(--ds-mono), monospace";
    ctx.textAlign = "center";
    ctx.fillText("time", cssW / 2, cssH - 8);
  }, [series, show]);

  const toggle = (name, label) => (
    <button
      key={name}
      type="button"
      onClick={() => setShow((s) => ({ ...s, [name]: !s[name] }))}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: `1px solid ${DS.border}`,
        background: show[name] ? "rgba(129,140,248,0.18)" : "rgba(255,255,255,0.04)",
        color: DS.t1,
        fontFamily: "var(--ds-mono), monospace",
        fontSize: 10,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Additive decomposition (toy series)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Synthetic y = trend + seasonality + noise. We estimate a smoothed trend, subtract it, average seasonal deviations by phase (period 12), then residual is what is left. This is a teaching sketch, not a production STL replacement.
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 280, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {toggle("y", "y")}
        {toggle("trend", "trend")}
        {toggle("season", "season")}
        {toggle("resid", "resid")}
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Trend slope = {trendSlope.toFixed(2)}
          <input type="range" min={0.02} max={0.18} step={0.01} value={trendSlope} onChange={(e) => setTrendSlope(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Season amplitude = {seasonAmp.toFixed(2)}
          <input type="range" min={0.1} max={0.9} step={0.02} value={seasonAmp} onChange={(e) => setSeasonAmp(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Noise amplitude = {noiseAmp.toFixed(2)}
          <input type="range" min={0.02} max={0.35} step={0.01} value={noiseAmp} onChange={(e) => setNoiseAmp(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.indB }} />
        </label>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        For real workflows use STL, seasonal ARIMA, or Prophet-style models; check stationarity and structural breaks before trusting seasonal patterns.
      </p>
    </div>
  );
}
