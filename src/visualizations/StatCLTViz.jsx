import { useState, useMemo, useCallback } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#8B5CF6";
const ACCENT_DIM = "rgba(139,92,246,0.18)";

// ── Population samplers (defined before component — no TDZ risk) ──

function sampleUniform() {
  // Uniform(0, 1) → mean=0.5, std=1/sqrt(12)≈0.289
  return Math.random();
}

function sampleExponential() {
  // Exponential(λ=1) → mean=1, right-skewed
  return -Math.log(1 - Math.random());
}

function sampleBimodal() {
  // Mix of N(0.25, 0.08²) and N(0.75, 0.08²)
  const which = Math.random() < 0.5;
  const u1 = Math.random(), u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return which ? 0.25 + 0.08 * z : 0.75 + 0.08 * z;
}

const POPULATIONS = {
  Uniform: {
    sampler: sampleUniform,
    mu: 0.5,
    sigma: 1 / Math.sqrt(12),
    description: "Flat — every value equally likely",
    previewBars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  "Exponential/Skewed": {
    sampler: sampleExponential,
    mu: 1.0,
    sigma: 1.0,
    description: "Right-skewed — most values are small",
    previewBars: [8, 5, 3.5, 2.5, 1.8, 1.3, 1, 0.8, 0.6, 0.4],
  },
  Bimodal: {
    sampler: sampleBimodal,
    mu: 0.5,
    sigma: Math.sqrt(0.5 * 0.25 * 0.25 + 0.5 * 0.75 * 0.75 + 0.5 * 0.5 * 0.25 + 0.5 * 0.5 * 0.25 - 0.25),
    description: "Two peaks — two distinct sub-groups",
    previewBars: [2, 4, 7, 5, 1.5, 1.5, 5, 7, 4, 2],
  },
};

const SAMPLE_SIZES = [1, 5, 10, 30, 100];
const NUM_SAMPLES = 1000;
const NUM_BINS = 30;

// Normal PDF helper
function normalPdf(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Draw NUM_SAMPLES sample means of size n from the given population
function drawSampleMeans(popKey, n) {
  const pop = POPULATIONS[popKey];
  const means = [];
  for (let s = 0; s < NUM_SAMPLES; s++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += pop.sampler();
    means.push(sum / n);
  }
  return means;
}

// Bucket means into NUM_BINS bins between [min, max]
function buildHistogram(means) {
  if (means.length === 0) return { bins: [], lo: 0, hi: 1, binWidth: 1 / NUM_BINS };
  let lo = means[0], hi = means[0];
  for (const v of means) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const padding = (hi - lo) * 0.1 || 0.05;
  lo -= padding; hi += padding;
  const binWidth = (hi - lo) / NUM_BINS;
  const counts = new Array(NUM_BINS).fill(0);
  for (const v of means) {
    const idx = Math.min(Math.floor((v - lo) / binWidth), NUM_BINS - 1);
    if (idx >= 0) counts[idx]++;
  }
  return { bins: counts, lo, hi, binWidth };
}

const SLIDER_TRACK = {
  WebkitAppearance: "none",
  appearance: "none",
  width: "100%",
  height: 4,
  borderRadius: 2,
  background: "rgba(139,92,246,0.25)",
  outline: "none",
  cursor: "pointer",
};

export default function StatCLTViz() {
  const [popKey, setPopKey] = useState("Uniform");
  const [nIdx, setNIdx] = useState(2); // index into SAMPLE_SIZES, default n=10
  const [means, setMeans] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const n = SAMPLE_SIZES[nIdx];
  const pop = POPULATIONS[popKey];
  const theoreticalSigma = pop.sigma / Math.sqrt(n);
  const theoreticalMu = pop.mu;

  const handleDraw = useCallback(() => {
    setIsRunning(true);
    // Use setTimeout to avoid blocking the paint
    setTimeout(() => {
      const m = drawSampleMeans(popKey, n);
      setMeans(m);
      setIsRunning(false);
    }, 0);
  }, [popKey, n]);

  const hist = useMemo(() => (means ? buildHistogram(means) : null), [means]);

  const sampleMu = useMemo(() => {
    if (!means || means.length === 0) return null;
    return means.reduce((a, b) => a + b, 0) / means.length;
  }, [means]);

  const maxCount = useMemo(() => {
    if (!hist) return 1;
    return Math.max(...hist.bins, 1);
  }, [hist]);

  // Generate normal curve overlay points
  const normalCurvePoints = useMemo(() => {
    if (!hist) return [];
    const pts = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = hist.lo + (i / steps) * (hist.hi - hist.lo);
      const density = normalPdf(x, theoreticalMu, theoreticalSigma);
      // Scale density to match histogram counts: density * NUM_SAMPLES * binWidth
      const scaledY = density * NUM_SAMPLES * hist.binWidth;
      pts.push({ x: i / steps, y: scaledY });
    }
    return pts;
  }, [hist, theoreticalMu, theoreticalSigma]);

  const normalMax = useMemo(() => Math.max(...normalCurvePoints.map((p) => p.y), 1), [normalCurvePoints]);

  const card = {
    background: DS.card,
    border: `1px solid ${DS.border}`,
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 16,
  };

  const popBtn = (active) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? ACCENT : DS.border}`,
    background: active ? ACCENT_DIM : "rgba(255,255,255,0.02)",
    color: active ? DS.t1 : DS.t3,
    fontFamily: "var(--ds-sans), sans-serif",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: active ? 600 : 400,
  });

  const nBtn = (active) => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${active ? DS.grn : DS.border}`,
    background: active ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.02)",
    color: active ? DS.grn : DS.t3,
    fontFamily: "var(--ds-mono), monospace",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const overallMax = Math.max(maxCount, normalMax);

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1, padding: "24px 20px", maxWidth: 740, margin: "0 auto" }}>

      {/* Population selector */}
      <div style={card}>
        <div style={{ fontSize: 12, color: DS.t3, marginBottom: 10, fontWeight: 600 }}>Population shape</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.keys(POPULATIONS).map((key) => (
            <button key={key} style={popBtn(popKey === key)} onClick={() => { setPopKey(key); setMeans(null); }}>
              {key}
            </button>
          ))}
        </div>

        {/* Population preview mini-chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40, marginBottom: 6 }}>
          {POPULATIONS[popKey].previewBars.map((h, i) => {
            const maxH = Math.max(...POPULATIONS[popKey].previewBars);
            return (
              <div key={i} style={{
                flex: 1,
                height: (h / maxH) * 36,
                background: ACCENT + "66",
                borderRadius: "2px 2px 0 0",
              }} />
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: DS.dim }}>{POPULATIONS[popKey].description}</div>
      </div>

      {/* Sample size selector */}
      <div style={card}>
        <div style={{ fontSize: 12, color: DS.t3, marginBottom: 10, fontWeight: 600 }}>Sample size n</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SAMPLE_SIZES.map((sz, i) => (
            <button key={sz} style={nBtn(nIdx === i)} onClick={() => { setNIdx(i); setMeans(null); }}>
              n={sz}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: DS.dim, marginTop: 8 }}>
          Theoretical σ of sample mean = {pop.sigma.toFixed(4)} / √{n} = {theoreticalSigma.toFixed(4)}
        </div>
      </div>

      {/* Draw button */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={handleDraw}
          disabled={isRunning}
          style={{
            padding: "12px 32px",
            borderRadius: 10,
            border: `1px solid ${ACCENT}`,
            background: isRunning ? "rgba(139,92,246,0.1)" : ACCENT_DIM,
            color: isRunning ? DS.t3 : DS.t1,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: isRunning ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isRunning ? "Simulating…" : `Draw ${NUM_SAMPLES} sample means`}
        </button>
      </div>

      {/* Histogram of sample means */}
      {hist && (
        <>
          <div style={{ ...card, paddingBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: DS.t3, fontWeight: 600 }}>
                Distribution of {NUM_SAMPLES} sample means (n={n}, {popKey})
              </div>
              <div style={{ fontSize: 11, color: ACCENT, fontFamily: "var(--ds-mono), monospace" }}>
                — normal curve
              </div>
            </div>

            {/* Bar chart + normal overlay via SVG-like div approach */}
            <div style={{ position: "relative", height: 160 }}>
              {/* Histogram bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: "100%", position: "absolute", inset: 0 }}>
                {hist.bins.map((count, i) => {
                  const barH = (count / overallMax) * 148;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                      <div
                        title={`count=${count}`}
                        style={{
                          width: "100%",
                          height: barH,
                          background: "rgba(139,92,246,0.4)",
                          borderRadius: "2px 2px 0 0",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Normal curve overlay (SVG) */}
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points={normalCurvePoints.map((pt, i) => {
                    const svgX = pt.x * 100;
                    const svgY = 100 - (pt.y / overallMax) * 96;
                    return `${svgX},${svgY}`;
                  }).join(" ")}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Mean line */}
                <line
                  x1={((theoreticalMu - hist.lo) / (hist.hi - hist.lo)) * 100}
                  y1="0"
                  x2={((theoreticalMu - hist.lo) / (hist.hi - hist.lo)) * 100}
                  y2="100"
                  stroke={DS.grn}
                  strokeWidth="1"
                  strokeDasharray="3,2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* Axis labels */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: DS.dim, marginTop: 4 }}>
              <span>{hist.lo.toFixed(3)}</span>
              <span>← sample mean →</span>
              <span>{hist.hi.toFixed(3)}</span>
            </div>
          </div>

          {/* Stats comparison */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Population μ", val: pop.mu.toFixed(4), color: DS.grn },
              { label: "Sample means avg", val: sampleMu !== null ? sampleMu.toFixed(4) : "—", color: DS.ind },
              { label: "Theoretical σ/√n", val: theoreticalSigma.toFixed(4), color: ACCENT },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...card, flex: 1, minWidth: 140, marginBottom: 0, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 17, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CLT Insight box */}
      <div style={{
        ...card,
        background: ACCENT_DIM,
        borderColor: "rgba(139,92,246,0.35)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 8 }}>CLT Insight</div>
        <div style={{ fontSize: 13, color: DS.t2, lineHeight: 1.6 }}>
          {n < 30
            ? <>Even though the population is <b>{popKey.toLowerCase()}</b>, at n={n} the sample mean distribution is{" "}
                {n <= 5 ? "still noticeably non-normal" : "beginning to resemble a normal curve"}.
                Try <b>n=30 or n=100</b> to see the CLT in action.</>
            : <>Even though the population is <b>{popKey.toLowerCase()}</b>, at n={n} the sample mean distribution is
                {" "}<b>approximately normal</b> with mean ≈ μ and std ≈ σ/√n. This is the Central Limit Theorem.</>
          }
        </div>
        <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t3, marginTop: 10, background: "rgba(2,6,23,0.72)", padding: "8px 12px", borderRadius: 6 }}>
          X̄ ~ N(μ={pop.mu.toFixed(3)}, σ²/n = {(theoreticalSigma * theoreticalSigma).toFixed(5)})
        </div>
      </div>

      {!means && (
        <div style={{ textAlign: "center", color: DS.dim, fontSize: 13, marginTop: 8 }}>
          Select a population and sample size, then click "Draw {NUM_SAMPLES} sample means"
        </div>
      )}
    </div>
  );
}
