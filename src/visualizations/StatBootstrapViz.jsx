import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#8B5CF6";
const SANS = { fontFamily: "var(--ds-sans), sans-serif" };
const MONO = { fontFamily: "var(--ds-mono), monospace" };
const CARD = {
  background: "rgba(255,255,255,0.02)",
  border: `1px solid ${DS.border}`,
  borderRadius: 12,
  padding: "14px 16px",
};

// Fixed original dataset — 10 values representing customer ratings 1-10
const ORIGINAL_DATA = [6.2, 7.8, 5.1, 8.4, 6.9, 4.3, 7.2, 9.1, 5.8, 7.5];
const POP_MEAN = ORIGINAL_DATA.reduce((a, b) => a + b, 0) / ORIGINAL_DATA.length;
const POP_SD = Math.sqrt(ORIGINAL_DATA.reduce((a, b) => a + Math.pow(b - POP_MEAN, 2), 0) / ORIGINAL_DATA.length);
const THEORETICAL_SE = POP_SD / Math.sqrt(ORIGINAL_DATA.length);

// Seeded RNG for reproducible bootstrap samples
function mkRng(seed) {
  let s = (seed ^ 0x12345678) >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

function bootstrapSample(data, rng) {
  const n = data.length;
  const indices = Array.from({ length: n }, () => Math.floor(rng() * n));
  const sample = indices.map((i) => data[i]);
  const mean = sample.reduce((a, b) => a + b, 0) / n;
  return { indices, sample, mean };
}

function computeBootstrapCI(means) {
  const sorted = [...means].sort((a, b) => a - b);
  const lo = sorted[Math.floor(sorted.length * 0.025)];
  const hi = sorted[Math.floor(sorted.length * 0.975)];
  return { lo, hi };
}

function buildBootstrapMeans(nSamples, seed) {
  const rng = mkRng(seed);
  return Array.from({ length: nSamples }, () => bootstrapSample(ORIGINAL_DATA, rng).mean);
}

// Build histogram bins from means array
function buildHistogram(means, bins = 16) {
  const min = Math.min(...means);
  const max = Math.max(...means);
  const range = max - min || 1;
  const binWidth = range / bins;
  const counts = Array(bins).fill(0);
  for (const m of means) {
    const idx = Math.min(bins - 1, Math.floor((m - min) / binWidth));
    counts[idx]++;
  }
  return { counts, min, max, binWidth };
}

export default function StatBootstrapViz() {
  const [drawnSamples, setDrawnSamples] = useState([]);
  const [showDistribution, setShowDistribution] = useState(false);
  const [bootstrapSeed, setBootstrapSeed] = useState(7);
  const [nBootstrap] = useState(200);

  const latestSample = drawnSamples[drawnSamples.length - 1] ?? null;

  function drawOneSample() {
    const seed = bootstrapSeed + drawnSamples.length * 31;
    const rng = mkRng(seed);
    const s = bootstrapSample(ORIGINAL_DATA, rng);
    setDrawnSamples((prev) => [...prev.slice(-4), s]);
  }

  function runDistribution() {
    setShowDistribution(true);
  }

  function reset() {
    setDrawnSamples([]);
    setShowDistribution(false);
    setBootstrapSeed((s) => s + 100);
  }

  const allMeans = buildBootstrapMeans(nBootstrap, bootstrapSeed);
  const { lo: ciLo, hi: ciHi } = computeBootstrapCI(allMeans);
  const { counts, min: hMin, max: hMax, binWidth } = buildHistogram(allMeans);
  const maxCount = Math.max(...counts);

  return (
    <div style={{ ...SANS }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Bootstrap Resampling Simulator
      </div>
      <p style={{ fontSize: 12, color: DS.t3, ...MONO, lineHeight: 1.55, marginBottom: 14 }}>
        Bootstrap estimates uncertainty by resampling <em>with replacement</em> from your data — no distributional assumptions needed.
      </p>

      {/* Original dataset */}
      <div style={{ ...CARD, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: DS.t3, ...MONO, marginBottom: 8 }}>
          Original dataset (n=10 customer ratings) — sample mean = <span style={{ color: ACCENT, fontWeight: 700 }}>{POP_MEAN.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ORIGINAL_DATA.map((v, i) => {
            const isHighlighted = latestSample && latestSample.indices.includes(i);
            const count = latestSample ? latestSample.indices.filter((x) => x === i).length : 0;
            return (
              <div
                key={i}
                style={{
                  width: 44,
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: `1px solid ${isHighlighted ? ACCENT : DS.border}`,
                  background: isHighlighted ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.02)",
                  textAlign: "center",
                  position: "relative",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: isHighlighted ? DS.t1 : DS.t3, ...MONO }}>{v}</div>
                {count > 1 && (
                  <div style={{ fontSize: 9, color: ACCENT, ...MONO, fontWeight: 700 }}>×{count}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          type="button"
          onClick={drawOneSample}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: `1px solid ${ACCENT}`,
            background: "rgba(139,92,246,0.18)",
            color: DS.t1,
            ...MONO,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Draw bootstrap sample
        </button>
        <button
          type="button"
          onClick={runDistribution}
          disabled={showDistribution}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.grn}`,
            background: showDistribution ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.16)",
            color: showDistribution ? DS.dim : DS.t1,
            ...MONO,
            fontSize: 11,
            fontWeight: 700,
            cursor: showDistribution ? "default" : "pointer",
          }}
        >
          Show distribution ({nBootstrap} samples)
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.03)",
            color: DS.t3,
            ...MONO,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Recent samples */}
      {drawnSamples.length > 0 && (
        <div style={{ ...CARD, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: DS.t3, ...MONO, marginBottom: 8 }}>
            Recent bootstrap samples (sampled with replacement, same n=10):
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {drawnSamples.map((s, i) => {
              const isLatest = i === drawnSamples.length - 1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 10, color: DS.dim, ...MONO, minWidth: 28 }}>#{drawnSamples.length - drawnSamples.length + i + 1}</div>
                  <div style={{ display: "flex", gap: 3, flex: 1 }}>
                    {s.sample.map((v, j) => (
                      <div
                        key={j}
                        style={{
                          flex: 1,
                          padding: "3px 2px",
                          borderRadius: 4,
                          border: `1px solid ${isLatest ? "rgba(139,92,246,0.4)" : DS.border}`,
                          background: isLatest ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.01)",
                          textAlign: "center",
                          fontSize: 10,
                          color: isLatest ? DS.t2 : DS.dim,
                          ...MONO,
                        }}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isLatest ? ACCENT : DS.t3, ...MONO, minWidth: 48 }}>
                    x̄={s.mean.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bootstrap distribution */}
      {showDistribution && (
        <div style={{ ...CARD, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: DS.t3, ...MONO, marginBottom: 10 }}>
            Bootstrap distribution of means ({nBootstrap} samples):
          </div>

          {/* Histogram */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80, marginBottom: 6 }}>
            {counts.map((c, i) => {
              const binCenter = hMin + (i + 0.5) * binWidth;
              const inCI = binCenter >= ciLo && binCenter <= ciHi;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${(c / maxCount) * 100}%`,
                    background: inCI ? "rgba(139,92,246,0.65)" : "rgba(129,140,248,0.3)",
                    borderRadius: "3px 3px 0 0",
                    minHeight: c > 0 ? 3 : 0,
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: DS.dim, ...MONO, marginBottom: 10 }}>
            <span>{hMin.toFixed(1)}</span>
            <span>{POP_MEAN.toFixed(2)} (sample mean)</span>
            <span>{hMax.toFixed(1)}</span>
          </div>

          {/* CI and comparison */}
          <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            <div style={{ background: "rgba(139,92,246,0.1)", border: `1px solid rgba(139,92,246,0.35)`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: DS.t3, ...MONO, marginBottom: 4 }}>Bootstrap 95% CI</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, ...MONO }}>
                [{ciLo.toFixed(2)}, {ciHi.toFixed(2)}]
              </div>
              <div style={{ fontSize: 10, color: DS.dim, ...MONO, marginTop: 4 }}>2.5th–97.5th percentile of bootstrap means</div>
            </div>
            <div style={{ background: "rgba(129,140,248,0.08)", border: `1px solid rgba(129,140,248,0.25)`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: DS.t3, ...MONO, marginBottom: 4 }}>Theoretical SE (σ/√n)</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DS.ind, ...MONO }}>±{(THEORETICAL_SE * 1.96).toFixed(2)}</div>
              <div style={{ fontSize: 10, color: DS.dim, ...MONO, marginTop: 4 }}>assumes normal distribution</div>
            </div>
          </div>
        </div>
      )}

      {/* Key insight */}
      <div style={{ ...CARD, background: "rgba(2,6,23,0.72)", borderLeft: "3px solid #8B5CF6" }}>
        <div style={{ fontSize: 11, color: DS.t2, ...MONO, lineHeight: 1.7 }}>
          <strong style={{ color: DS.t1 }}>Why bootstrap works: </strong>
          By treating your sample as a stand-in for the population and resampling from it, you empirically build
          the sampling distribution of any statistic — mean, median, correlation, ratio — without assuming
          normality. The 95% CI is simply the [2.5%, 97.5%] interval of those bootstrap statistics.
          <br /><br />
          <strong style={{ color: DS.t1 }}>When to use: </strong>
          Small samples, non-normal data, complex statistics (median, 90th percentile, AUC), or when
          you want distribution-free inference.
        </div>
      </div>
    </div>
  );
}
