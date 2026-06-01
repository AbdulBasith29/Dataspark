import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── constants ────────────────────────────────────────────────────────────────
const ACCENT = "#8B5CF6";
const CONF_LEVELS = [
  { label: "90%", z: 1.645 },
  { label: "95%", z: 1.96 },
  { label: "99%", z: 2.576 },
];

const MISCONCEPTIONS = [
  {
    wrong: true,
    text: '"There is a 95% probability the true mean is inside THIS specific interval."',
    fix: "Once the data are observed the CI either contains μ or it doesn't — the probability is 0 or 1. The 95% is a long-run property of the procedure, not of this one interval.",
  },
  {
    wrong: false,
    text: '"If we repeated this sampling procedure many times, ~95% of the resulting intervals would contain the true mean."',
    fix: "This is the correct frequentist interpretation. The confidence level describes the procedure's hit rate across repeated samples, not a single interval.",
  },
  {
    wrong: true,
    text: '"The interval contains 95% of the individual data values."',
    fix: "A confidence interval is about the parameter (mean), not about data spread. That's what a prediction interval describes instead.",
  },
];

function sampleNormal(mean, sd) {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function generateSimCIs(trueMean, sd, n, zCrit, count) {
  return Array.from({ length: count }, () => {
    const vals = Array.from({ length: n }, () => sampleNormal(trueMean, sd));
    const m = vals.reduce((a, b) => a + b, 0) / n;
    const se = sd / Math.sqrt(n);
    const lo = m - zCrit * se;
    const hi = m + zCrit * se;
    return { lo, hi, captures: lo <= trueMean && trueMean <= hi };
  });
}

// ── component ────────────────────────────────────────────────────────────────
export default function StatConfidenceIntervalViz() {
  const [sampleMean, setSampleMean] = useState(100);
  const [sd, setSd] = useState(15);
  const [n, setN] = useState(50);
  const [confLevelIdx, setConfLevelIdx] = useState(1);
  const [simKey, setSimKey] = useState(0);
  const [activeTab, setActiveTab] = useState("builder");

  const confLevel = CONF_LEVELS[confLevelIdx];
  const se = sd / Math.sqrt(n);
  const margin = confLevel.z * se;
  const lower = sampleMean - margin;
  const upper = sampleMean + margin;
  const width = margin * 2;

  const refSe = sd / Math.sqrt(10);
  const refMargin = confLevel.z * refSe;

  const simCIs = useMemo(
    () => generateSimCIs(sampleMean, sd, n, confLevel.z, 40),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [simKey, sampleMean, sd, n, confLevelIdx]
  );
  const captureCount = simCIs.filter((c) => c.captures).length;

  const pad = Math.max(margin * 2.5, 30);
  const nlMin = sampleMean - pad;
  const nlMax = sampleMean + pad;
  const nlRange = nlMax - nlMin;
  function pct(v) {
    return `${(((v - nlMin) / nlRange) * 100).toFixed(2)}%`;
  }

  const tabStyle = (tab) => ({
    padding: "6px 14px",
    borderRadius: 8,
    border: `1px solid ${activeTab === tab ? ACCENT : DS.border}`,
    background: activeTab === tab ? `${ACCENT}22` : "transparent",
    color: activeTab === tab ? DS.t1 : DS.t3,
    fontFamily: "var(--ds-mono), monospace",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div style={{ color: DS.t2, fontFamily: "var(--ds-sans), sans-serif" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Confidence Interval Explorer
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Build CIs, simulate repeated sampling, and correct the three most common misconceptions.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button type="button" style={tabStyle("builder")} onClick={() => setActiveTab("builder")}>CI Builder</button>
        <button type="button" style={tabStyle("sim")} onClick={() => setActiveTab("sim")}>Simulation</button>
        <button type="button" style={tabStyle("myths")} onClick={() => setActiveTab("myths")}>Misconceptions</button>
      </div>

      {activeTab === "builder" && (
        <div>
          <div
            style={{
              position: "relative",
              height: 72,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: 10,
              marginBottom: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "4%",
                right: "4%",
                height: 1,
                background: DS.dim,
                transform: "translateY(-50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: pct(lower),
                width: `${((upper - lower) / nlRange) * 100}%`,
                height: 20,
                transform: "translateY(-50%)",
                background: `${ACCENT}33`,
                border: `2px solid ${ACCENT}`,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: pct(sampleMean),
                transform: "translateX(-50%)",
                width: 2,
                height: "70%",
                background: DS.grn,
              }}
            />
            <div style={{ position: "absolute", bottom: 5, left: pct(lower), transform: "translateX(-50%)", fontSize: 10, color: ACCENT, fontFamily: "var(--ds-mono), monospace" }}>
              {lower.toFixed(1)}
            </div>
            <div style={{ position: "absolute", bottom: 5, left: pct(upper), transform: "translateX(-50%)", fontSize: 10, color: ACCENT, fontFamily: "var(--ds-mono), monospace" }}>
              {upper.toFixed(1)}
            </div>
            <div style={{ position: "absolute", top: 5, left: pct(sampleMean), transform: "translateX(-50%)", fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace", whiteSpace: "nowrap" }}>
              x̄={sampleMean}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "CI Width", value: width.toFixed(2), color: ACCENT },
              { label: "SE = σ/√n", value: se.toFixed(3), color: DS.ind },
              { label: "Margin ±", value: margin.toFixed(2), color: DS.grn },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${DS.border}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace" }}>{value}</div>
                <div style={{ fontSize: 10, color: DS.t3, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: `${ACCENT}0D`,
              border: `1px solid ${ACCENT}44`,
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 14,
              fontSize: 11,
              color: DS.t2,
              fontFamily: "var(--ds-mono), monospace",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: ACCENT, fontWeight: 700 }}>Width ∝ 1/√n</span>
            {" · At n=10 width = "}
            <span style={{ color: "rgba(248,113,113,0.9)" }}>{(refMargin * 2).toFixed(2)}</span>
            {" vs current "}
            <span style={{ color: ACCENT }}>{width.toFixed(2)}</span>
            {". Quadruple n to halve the width."}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
              Sample mean x̄ = {sampleMean}
              <input type="range" min={50} max={150} step={1} value={sampleMean} onChange={(e) => setSampleMean(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
            </label>
            <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
              Std deviation σ = {sd}
              <input type="range" min={5} max={30} step={1} value={sd} onChange={(e) => setSd(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
            </label>
            <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
              Sample size n = {n}
              <input type="range" min={10} max={500} step={5} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: ACCENT }} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {CONF_LEVELS.map((cl, i) => (
                <button
                  key={cl.label}
                  type="button"
                  onClick={() => setConfLevelIdx(i)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 6,
                    border: `1px solid ${confLevelIdx === i ? ACCENT : DS.border}`,
                    background: confLevelIdx === i ? `${ACCENT}22` : "transparent",
                    color: confLevelIdx === i ? DS.t1 : DS.t3,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {cl.label} (z={cl.z})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "sim" && (
        <div>
          <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", marginBottom: 10, lineHeight: 1.55 }}>
            Each bar is an independent {confLevel.label} CI drawn from the same population (μ={sampleMean}, σ={sd}, n={n}).
            {" "}Green = captures μ · Red = misses μ.
          </p>
          <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, fontFamily: "var(--ds-mono), monospace" }}>
            <span style={{ color: DS.grn }}>Captured: {captureCount}/{simCIs.length}</span>
            <span style={{ color: DS.t2 }}>({((captureCount / simCIs.length) * 100).toFixed(0)}% hit rate)</span>
            <span style={{ color: DS.t3 }}>Expected ≈ {confLevel.label}</span>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: 10,
              padding: "10px 8px",
              marginBottom: 12,
            }}
          >
            {(() => {
              const allVals = simCIs.flatMap((c) => [c.lo, c.hi]);
              const vMin = Math.min(...allVals);
              const vMax = Math.max(...allVals);
              const vRange = vMax - vMin || 1;
              const muPct = ((sampleMean - vMin) / vRange) * 88 + 6;
              return simCIs.map((ci, i) => {
                const lPct = ((ci.lo - vMin) / vRange) * 88 + 6;
                const wPct = ((ci.hi - ci.lo) / vRange) * 88;
                return (
                  <div key={i} style={{ position: "relative", height: 10, marginBottom: 3 }}>
                    <div style={{ position: "absolute", left: `${muPct}%`, top: 0, width: 1, height: "100%", background: "rgba(248,250,252,0.15)" }} />
                    <div
                      style={{
                        position: "absolute",
                        left: `${lPct}%`,
                        width: `${Math.max(wPct, 0.5)}%`,
                        height: 7,
                        top: 1,
                        borderRadius: 2,
                        background: ci.captures ? `${DS.grn}88` : "rgba(248,113,113,0.65)",
                        border: `1px solid ${ci.captures ? DS.grn : "rgba(248,113,113,0.85)"}`,
                      }}
                    />
                  </div>
                );
              });
            })()}
          </div>

          <button
            type="button"
            onClick={() => setSimKey((k) => k + 1)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${ACCENT}`,
              background: `${ACCENT}22`,
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Resample 40 CIs
          </button>
          <span style={{ marginLeft: 10, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            Hit rate varies per run but averages to {confLevel.label} over many runs.
          </span>
        </div>
      )}

      {activeTab === "myths" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MISCONCEPTIONS.map((m, i) => (
            <div
              key={i}
              style={{
                background: m.wrong ? "rgba(248,113,113,0.05)" : "rgba(52,211,153,0.05)",
                border: `1px solid ${m.wrong ? "rgba(248,113,113,0.35)" : `${DS.grn}44`}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{m.wrong ? "✗" : "✓"}</span>
                <div style={{ fontSize: 12, color: m.wrong ? "rgba(252,165,165,1)" : DS.grn, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.5, fontStyle: "italic" }}>
                  {m.text}
                </div>
              </div>
              <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.6, paddingLeft: 22 }}>
                {m.fix}
              </div>
            </div>
          ))}
          <div
            style={{
              background: `${ACCENT}0D`,
              border: `1px solid ${ACCENT}33`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 11,
              color: DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: ACCENT, fontWeight: 700 }}>Senior answer:</span>
            {" A 95% CI means the procedure, repeated on many independent samples, would contain the true parameter ~95% of the time. This specific interval either contains μ or it doesn't — we just don't observe which."}
          </div>
        </div>
      )}
    </div>
  );
}
