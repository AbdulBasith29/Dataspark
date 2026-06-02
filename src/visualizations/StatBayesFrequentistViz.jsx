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

// Scenario: 15 of 20 patients improved
const N_TRIALS = 20;
const N_SUCCESS = 15;
const P_HAT = N_SUCCESS / N_TRIALS; // 0.75

// Regularised incomplete beta function approximation for CDF of Beta distribution
// Using a simple grid evaluation for visualization (not full numerical integration)
function betaPDF(x, a, b) {
  if (x <= 0 || x >= 1) return 0;
  // log of pdf: (a-1)*log(x) + (b-1)*log(1-x) — we normalize over the grid
  return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
}

// Evaluate posterior Beta(a_post, b_post) over grid, return normalized values
function posteriorGrid(a_post, b_post, steps = 60) {
  const xs = Array.from({ length: steps }, (_, i) => (i + 0.5) / steps);
  const raw = xs.map((x) => betaPDF(x, a_post, b_post));
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  return xs.map((x, i) => ({ x, y: raw[i] / sum }));
}

// Frequentist: binomial p-value for H0: p=0.5, one-sided P(X >= 15 | n=20, p=0.5)
function binomialCDF(k, n, p) {
  let cdf = 0;
  let coeff = 1;
  for (let i = 0; i <= k; i++) {
    if (i > 0) coeff = (coeff * (n - i + 1)) / i;
    cdf += coeff * Math.pow(p, i) * Math.pow(1 - p, n - i);
  }
  return cdf;
}
const FREQ_P_VALUE = 1 - binomialCDF(N_SUCCESS - 1, N_TRIALS, 0.5);
const FREQ_CI_LO = P_HAT - 1.96 * Math.sqrt((P_HAT * (1 - P_HAT)) / N_TRIALS);
const FREQ_CI_HI = P_HAT + 1.96 * Math.sqrt((P_HAT * (1 - P_HAT)) / N_TRIALS);

// Posterior modes = (a-1)/(a+b-2), means = a/(a+b)
function posteriorStats(a, b) {
  const mean = a / (a + b);
  // 95% credible interval — use percentile from grid
  const grid = posteriorGrid(a, b, 200);
  const total = grid.reduce((s, d) => s + d.y, 0);
  let cumulative = 0;
  let lo = 0;
  let hi = 1;
  for (const d of grid) {
    cumulative += d.y;
    if (lo === 0 && cumulative / total >= 0.025) lo = d.x;
    if (hi === 1 && cumulative / total >= 0.975) { hi = d.x; break; }
  }
  return { mean, lo, hi };
}

const PRIORS = {
  skeptical: {
    label: "Skeptical prior",
    a0: 2,
    b0: 8,
    description: "Beta(2,8) — prior belief ~20% success rate; strong skepticism",
    color: "#F87171",
  },
  neutral: {
    label: "Neutral prior",
    a0: 2,
    b0: 2,
    description: "Beta(2,2) — weakly informative; slight pull toward 50%",
    color: DS.ind,
  },
  optimistic: {
    label: "Optimistic prior",
    a0: 8,
    b0: 2,
    description: "Beta(8,2) — prior belief ~80% success rate; domain expert optimism",
    color: DS.grn,
  },
};

export default function StatBayesFrequentistViz() {
  const [priorKey, setPriorKey] = useState("neutral");
  const [tab, setTab] = useState("compare");

  const prior = PRIORS[priorKey];
  const a_post = prior.a0 + N_SUCCESS;
  const b_post = prior.b0 + (N_TRIALS - N_SUCCESS);
  const { mean: postMean, lo: credLo, hi: credHi } = posteriorStats(a_post, b_post);

  const posteriorPoints = posteriorGrid(a_post, b_post, 50);
  const maxY = Math.max(...posteriorPoints.map((d) => d.y));

  const priorPoints = posteriorGrid(prior.a0, prior.b0, 50);
  const maxPriorY = Math.max(...priorPoints.map((d) => d.y));
  const normFactor = maxY / (maxPriorY || 1);

  return (
    <div style={{ ...SANS }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Bayesian vs Frequentist Explorer
      </div>
      <p style={{ fontSize: 12, color: DS.t3, ...MONO, lineHeight: 1.55, marginBottom: 14 }}>
        Scenario: a new drug shows improvement in 15 of 20 patients (p&#770; = 75%). Two statistical paradigms, one dataset.
      </p>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { key: "compare", label: "Side-by-side" },
          { key: "posterior", label: "Posterior chart" },
          { key: "differences", label: "Key differences" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${tab === key ? ACCENT : DS.border}`,
              background: tab === key ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
              color: tab === key ? DS.t1 : DS.t3,
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

      {/* Prior selector (always visible) */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(PRIORS).map(([key, p]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPriorKey(key)}
            style={{
              padding: "5px 10px",
              borderRadius: 7,
              border: `1px solid ${priorKey === key ? p.color : DS.border}`,
              background: priorKey === key ? `${p.color}22` : "rgba(255,255,255,0.02)",
              color: priorKey === key ? p.color : DS.dim,
              ...MONO,
              fontSize: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: DS.dim, ...MONO, marginBottom: 14 }}>
        {prior.description} → Posterior: Beta({a_post}, {b_post})
      </div>

      {/* Tab: Side-by-side comparison */}
      {tab === "compare" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Frequentist */}
          <div style={{ ...CARD }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.ind, ...SANS, marginBottom: 10 }}>Frequentist</div>
            <div style={{ fontSize: 10, ...MONO, color: DS.t3, lineHeight: 1.75 }}>
              <div><span style={{ color: DS.t2 }}>H₀:</span> p = 0.5 (drug has no effect)</div>
              <div><span style={{ color: DS.t2 }}>Observed:</span> 15/20 improved</div>
              <div><span style={{ color: DS.t2 }}>p-value:</span> <span style={{ color: FREQ_P_VALUE < 0.05 ? DS.grn : "#F87171", fontWeight: 700 }}>{FREQ_P_VALUE.toFixed(4)}</span></div>
              <div><span style={{ color: DS.t2 }}>95% CI:</span> [{FREQ_CI_LO.toFixed(2)}, {FREQ_CI_HI.toFixed(2)}]</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: DS.dim, ...MONO, lineHeight: 1.6, background: "rgba(2,6,23,0.72)", borderRadius: 8, padding: "8px 10px" }}>
              "If H₀ were true, we'd see data this extreme in {(FREQ_P_VALUE * 100).toFixed(1)}% of experiments."<br /><br />
              CI is a procedure: 95% of CIs built this way contain the true p. Not a probability statement about this specific interval.
            </div>
          </div>

          {/* Bayesian */}
          <div style={{ ...CARD, border: `1px solid rgba(139,92,246,0.3)` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, ...SANS, marginBottom: 10 }}>Bayesian</div>
            <div style={{ fontSize: 10, ...MONO, color: DS.t3, lineHeight: 1.75 }}>
              <div><span style={{ color: DS.t2 }}>Prior:</span> {prior.label}</div>
              <div><span style={{ color: DS.t2 }}>Likelihood:</span> Binomial(20, p)</div>
              <div><span style={{ color: DS.t2 }}>Posterior mean:</span> <span style={{ color: prior.color, fontWeight: 700 }}>{(postMean * 100).toFixed(1)}%</span></div>
              <div><span style={{ color: DS.t2 }}>95% Credible:</span> [{(credLo * 100).toFixed(1)}%, {(credHi * 100).toFixed(1)}%]</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: DS.dim, ...MONO, lineHeight: 1.6, background: "rgba(2,6,23,0.72)", borderRadius: 8, padding: "8px 10px" }}>
              "There is a 95% probability the true efficacy rate is between {(credLo * 100).toFixed(1)}% and {(credHi * 100).toFixed(1)}%."<br /><br />
              This IS a probability statement about the parameter — valid under Bayesian interpretation.
            </div>
          </div>
        </div>
      )}

      {/* Tab: Posterior chart */}
      {tab === "posterior" && (
        <div style={{ ...CARD }}>
          <div style={{ fontSize: 11, color: DS.t3, ...MONO, marginBottom: 10 }}>
            Prior (faint) vs Posterior (solid) — observe how the prior shifts after observing 15/20 successes
          </div>

          {/* Chart */}
          <div style={{ position: "relative", height: 120 }}>
            <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: 1 }}>
              {posteriorPoints.map((d, i) => {
                const priorHeight = priorPoints[i] ? (priorPoints[i].y * normFactor) / maxY : 0;
                const postHeight = d.y / maxY;
                const inCI = d.x >= credLo && d.x <= credHi;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", position: "relative" }}>
                    {/* Prior bar (faint) */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${priorHeight * 100}%`,
                        background: "rgba(129,140,248,0.2)",
                        borderRadius: "2px 2px 0 0",
                      }}
                    />
                    {/* Posterior bar */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${postHeight * 100}%`,
                        background: inCI ? `${prior.color}bb` : `${prior.color}55`,
                        borderRadius: "2px 2px 0 0",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Vertical line at posterior mean */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${postMean * 100}%`,
                width: 2,
                background: prior.color,
                opacity: 0.9,
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: DS.dim, ...MONO, marginTop: 4 }}>
            <span>p = 0%</span>
            <span>p = {(postMean * 100).toFixed(1)}% (posterior mean)</span>
            <span>p = 100%</span>
          </div>

          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 10, ...MONO }}>
            <div style={{ color: DS.t3 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(129,140,248,0.3)", borderRadius: 2, marginRight: 4 }} />
              Prior: {prior.label}
            </div>
            <div style={{ color: prior.color }}>
              <span style={{ display: "inline-block", width: 10, height: 10, background: prior.color, borderRadius: 2, marginRight: 4 }} />
              Posterior (shaded = 95% CI)
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 10, color: DS.t2, ...MONO, lineHeight: 1.7, background: "rgba(2,6,23,0.72)", borderRadius: 8, padding: "8px 10px" }}>
            Change the prior above to see how skeptical vs optimistic beliefs shift the posterior.
            With enough data, all priors converge — this is the Bernstein-von Mises theorem.
          </div>
        </div>
      )}

      {/* Tab: Key differences */}
      {tab === "differences" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ ...CARD }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DS.ind, ...SANS, marginBottom: 8 }}>Frequentist</div>
              <ul style={{ fontSize: 10, color: DS.t3, ...MONO, lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
                <li>θ is fixed, unknown constant</li>
                <li>Probability is long-run frequency</li>
                <li>CI: procedure with 95% coverage rate</li>
                <li>Cannot say "P(drug works)"</li>
                <li>No prior knowledge incorporated</li>
                <li>Standard in clinical trials, academia</li>
              </ul>
            </div>
            <div style={{ ...CARD, border: `1px solid rgba(139,92,246,0.3)` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, ...SANS, marginBottom: 8 }}>Bayesian</div>
              <ul style={{ fontSize: 10, color: DS.t3, ...MONO, lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
                <li>θ is a random variable with distribution</li>
                <li>Probability is degree of belief</li>
                <li>Credible interval IS a probability statement</li>
                <li>Can directly compute P(drug effective)</li>
                <li>Incorporates prior domain knowledge</li>
                <li>Natural for sequential/adaptive testing</li>
              </ul>
            </div>
          </div>

          <div style={{ ...CARD }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.t2, ...SANS, marginBottom: 8 }}>Confidence vs Credible intervals</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 10, ...MONO }}>
              <div style={{ lineHeight: 1.7, color: DS.t3 }}>
                <strong style={{ color: DS.ind }}>95% Confidence interval:</strong><br />
                "95% of intervals built by this procedure will contain the true θ."<br />
                NOT: "95% chance θ is in this specific interval."
              </div>
              <div style={{ lineHeight: 1.7, color: DS.t3 }}>
                <strong style={{ color: ACCENT }}>95% Credible interval:</strong><br />
                "Given the data and prior, there is a 95% probability θ lies in this range."<br />
                This IS a direct probability statement.
              </div>
            </div>
          </div>

          <div style={{ ...CARD, background: "rgba(2,6,23,0.72)", borderLeft: "3px solid #8B5CF6" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: DS.t1, ...SANS, marginBottom: 6 }}>When practitioners choose Bayesian</div>
            <div style={{ fontSize: 10, color: DS.t2, ...MONO, lineHeight: 1.8 }}>
              • Small samples where prior knowledge adds power<br />
              • Sequential A/B testing (avoids the peeking problem)<br />
              • "What is the probability we beat the baseline?" questions<br />
              • Decision-theoretic frameworks (expected loss, value of information)<br />
              • Hierarchical models with structured partial pooling
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
