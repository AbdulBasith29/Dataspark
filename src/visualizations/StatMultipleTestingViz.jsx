import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ALPHA = 0.05;
const GRID_SIZE = 20;

// Seeded pseudo-random for stable "simulation" grid
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

const STABLE_NULLS = (() => {
  const rng = seededRand(42);
  return Array.from({ length: GRID_SIZE }, () => rng() < ALPHA);
})();

const MODE_LABELS = [
  { key: "fwer", label: "FWER Calculator" },
  { key: "grid", label: "False Discovery Grid" },
  { key: "genomics", label: "Genomics Example" },
];

const CARD = {
  background: "rgba(255,255,255,0.02)",
  border: `1px solid ${DS.border}`,
  borderRadius: 12,
  padding: "14px 16px",
};

const MONO = { fontFamily: "var(--ds-mono), monospace" };
const SANS = { fontFamily: "var(--ds-sans), sans-serif" };

export default function StatMultipleTestingViz() {
  const [mode, setMode] = useState("fwer");
  const [numTests, setNumTests] = useState(20);

  const fwer = 1 - Math.pow(1 - ALPHA, numTests);
  const bonferroniAlpha = ALPHA / numTests;
  const fwerPct = (fwer * 100).toFixed(1);
  const bonferroniPct = (bonferroniAlpha * 100).toFixed(3);

  const genomicsTests = 20000;
  const genomicsFP = Math.round(genomicsTests * ALPHA);
  const genomicsBonferroni = (ALPHA / genomicsTests).toExponential(2);

  const falsePositiveCount = STABLE_NULLS.filter(Boolean).length;

  return (
    <div style={{ ...SANS }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Multiple Testing &amp; Bonferroni Correction
      </div>
      <p style={{ fontSize: 12, color: DS.t3, ...MONO, lineHeight: 1.55, marginBottom: 14 }}>
        Running many hypothesis tests inflates your false-positive rate. Learn how to measure and control it.
      </p>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {MODE_LABELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${mode === key ? "#8B5CF6" : DS.border}`,
              background: mode === key ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
              color: mode === key ? DS.t1 : DS.t3,
              ...MONO,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* FWER Calculator */}
      {mode === "fwer" && (
        <div>
          <label style={{ fontSize: 11, color: DS.t3, ...MONO }}>
            Number of simultaneous tests (k) = {numTests}
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={numTests}
              onChange={(e) => setNumTests(+e.target.value)}
              style={{ width: "100%", marginTop: 6, accentColor: "#8B5CF6" }}
            />
          </label>

          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {/* FWER bar */}
            <div style={{ ...CARD }}>
              <div style={{ fontSize: 11, color: DS.t3, ...MONO, marginBottom: 8 }}>
                Family-Wise Error Rate (FWER) = 1 − (1 − α)^k
              </div>
              <div style={{ height: 24, background: "rgba(255,255,255,0.04)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${fwer * 100}%`,
                    background: fwer > 0.5 ? "rgba(248,113,113,0.75)" : fwer > 0.2 ? "rgba(251,191,36,0.7)" : "rgba(52,211,153,0.65)",
                    borderRadius: 6,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: fwer > 0.5 ? "#F87171" : fwer > 0.2 ? "#FBBF24" : DS.grn, ...MONO }}>
                {fwerPct}%
              </div>
              <div style={{ fontSize: 11, color: DS.t3, ...MONO, marginTop: 2 }}>
                chance of at least 1 false positive across all {numTests} test{numTests !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Comparison row */}
            <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ ...CARD }}>
                <div style={{ fontSize: 10, color: DS.t3, ...MONO, marginBottom: 4 }}>Original α (per test)</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: DS.ind, ...MONO }}>0.050</div>
                <div style={{ fontSize: 10, color: DS.dim, ...MONO }}>uncorrected</div>
              </div>
              <div style={{ ...CARD, border: `1px solid rgba(139,92,246,0.35)` }}>
                <div style={{ fontSize: 10, color: DS.t3, ...MONO, marginBottom: 4 }}>Bonferroni α = α/k</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#8B5CF6", ...MONO }}>{bonferroniPct}%</div>
                <div style={{ fontSize: 10, color: DS.dim, ...MONO }}>corrected per test</div>
              </div>
            </div>

            {/* Insight box */}
            <div style={{ ...CARD, background: "rgba(2,6,23,0.72)", borderLeft: "3px solid #8B5CF6" }}>
              <div style={{ fontSize: 11, color: DS.t2, ...MONO, lineHeight: 1.7 }}>
                <span style={{ color: DS.t3 }}>Key insight: </span>
                At k=1, FWER = 5% (just α). At k=20, FWER ≈ 64% — nearly 2 in 3 experiments produce a false positive.
                Bonferroni keeps each test threshold at α/k, preserving the overall error rate.
              </div>
            </div>

            {/* FDR vs FWER */}
            <div style={{ ...CARD }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.t2, ...SANS, marginBottom: 8 }}>
                FWER vs FDR: when to use which
              </div>
              <div className="ds-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11, ...MONO }}>
                <div>
                  <div style={{ color: "#8B5CF6", fontWeight: 700, marginBottom: 4 }}>Bonferroni (FWER)</div>
                  <div style={{ color: DS.t3, lineHeight: 1.6 }}>
                    Controls P(any false positive).<br />
                    Conservative — use for confirmatory tests, clinical trials, few hypotheses.
                  </div>
                </div>
                <div>
                  <div style={{ color: DS.grn, fontWeight: 700, marginBottom: 4 }}>Benjamini-Hochberg (FDR)</div>
                  <div style={{ color: DS.t3, lineHeight: 1.6 }}>
                    Controls expected fraction of false positives among discoveries.<br />
                    Less conservative — use for genomics, exploratory work, many hypotheses.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* False Discovery Grid */}
      {mode === "grid" && (
        <div>
          <div style={{ ...CARD, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: DS.t2, ...MONO, lineHeight: 1.7 }}>
              All {GRID_SIZE} hypotheses below are{" "}
              <strong style={{ color: "#F87171" }}>truly null</strong> (no real effect).
              Running them at α=0.05 still flags{" "}
              <strong style={{ color: "#F87171" }}>{falsePositiveCount}</strong> as "significant" by chance alone.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 14 }}>
            {STABLE_NULLS.map((isFP, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 6px",
                  borderRadius: 8,
                  border: `1px solid ${isFP ? "rgba(248,113,113,0.6)" : DS.border}`,
                  background: isFP ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.02)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: DS.dim, ...MONO }}>H{i + 1}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: isFP ? "#F87171" : DS.t3, ...MONO, marginTop: 2 }}>
                  {isFP ? "p<0.05" : "n.s."}
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...CARD, background: "rgba(2,6,23,0.72)", borderLeft: "3px solid #8B5CF6" }}>
            <div style={{ fontSize: 11, color: DS.t2, ...MONO, lineHeight: 1.7 }}>
              <span style={{ color: "#F87171" }}>Red = false positive</span> — flagged by chance, not by truth.
              {" "}Bonferroni threshold = {(0.05 / GRID_SIZE).toFixed(4)}.
              Only tests far below this survive, reducing false discoveries to near zero.
            </div>
          </div>
        </div>
      )}

      {/* Genomics Example */}
      {mode === "genomics" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ ...CARD, background: "rgba(2,6,23,0.72)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.t1, ...SANS, marginBottom: 10 }}>
              Real-world scenario: GWAS (genome-wide association study)
            </div>
            <div style={{ fontSize: 11, ...MONO, color: DS.t2, lineHeight: 1.8 }}>
              Tests: <span style={{ color: "#8B5CF6", fontWeight: 700 }}>20,000</span> SNP markers<br />
              α per test: <span style={{ color: DS.ind }}>0.05</span> (uncorrected)<br />
              Expected false positives without correction:{" "}
              <span style={{ color: "#F87171", fontWeight: 700 }}>{genomicsFP.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ ...CARD }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", ...MONO, marginBottom: 8 }}>After Bonferroni correction</div>
            <div style={{ fontSize: 11, ...MONO, color: DS.t2, lineHeight: 1.8 }}>
              New threshold: α / k = 0.05 / 20,000 = <span style={{ color: DS.grn, fontWeight: 700 }}>{genomicsBonferroni}</span><br />
              Expected false positives: <span style={{ color: DS.grn, fontWeight: 700 }}>at most 1</span> across the whole study<br />
              Trade-off: power is reduced — genuine weak effects may be missed
            </div>
          </div>

          <div style={{ ...CARD }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.grn, ...MONO, marginBottom: 8 }}>
              Benjamini-Hochberg alternative (FDR)
            </div>
            <div style={{ fontSize: 11, ...MONO, color: DS.t2, lineHeight: 1.8 }}>
              Instead of controlling "any false positive", control the{" "}
              <strong>False Discovery Rate</strong>: the expected fraction of flagged results that are false.<br /><br />
              At FDR = 0.05: up to 5% of your discoveries are expected false positives.<br />
              Far more powerful than Bonferroni for exploratory genomics research.
            </div>
          </div>

          <div style={{ ...CARD, background: "rgba(2,6,23,0.72)", borderLeft: "3px solid #8B5CF6" }}>
            <div style={{ fontSize: 11, color: DS.t2, ...MONO, lineHeight: 1.7 }}>
              <span style={{ color: DS.t3 }}>Decision guide: </span>
              Confirmatory research (clinical trials, regulatory submissions) → Bonferroni (FWER).
              Exploratory discovery (genomics, feature screening, A/B test fleets) → Benjamini-Hochberg (FDR).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
