import { useEffect, useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

function normalCdf(z) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function twoPropZTest(cA, nA, cB, nB) {
  const pA = cA / nA;
  const pB = cB / nB;
  const pPool = (cA + cB) / (nA + nB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));
  if (se < 1e-12) return { z: 0, pVal: 1, pA, pB, pPool };
  const z = (pA - pB) / se;
  const pVal = Math.min(1, 2 * (1 - normalCdf(Math.abs(z))));
  return { z, pVal, pA, pB, pPool };
}

function binomial(n, p) {
  let c = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) c++;
  }
  return c;
}

export default function ABTestSimulator() {
  const [nArm, setNArm] = useState(400);
  const [pA, setPA] = useState(0.12);
  const [pB, setPB] = useState(0.15);
  const [runId, setRunId] = useState(0);
  const [sample, setSample] = useState(() => ({
    cA: binomial(400, 0.12),
    cB: binomial(400, 0.15),
  }));

  useEffect(() => {
    setSample({ cA: binomial(nArm, pA), cB: binomial(nArm, pB) });
  }, [nArm, pA, pB, runId]);

  const { z, pVal, pAhat, pBhat, pPool } = useMemo(
    () => twoPropZTest(sample.cA, nArm, sample.cB, nArm),
    [sample, nArm]
  );

  const sig05 = pVal < 0.05;

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        A/B test simulator (two proportions)
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Set true conversion rates for control (A) and treatment (B), sample size per arm, then draw one experiment. We report a pooled two-proportion z-test (same framework as many textbook A/B calculators).
      </p>

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          n per arm = {nArm}
          <input type="range" min={100} max={2000} step={50} value={nArm} onChange={(e) => setNArm(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          True rate control A = {pA.toFixed(3)}
          <input type="range" min={0.02} max={0.35} step={0.005} value={pA} onChange={(e) => setPA(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          True rate treatment B = {pB.toFixed(3)}
          <input type="range" min={0.02} max={0.35} step={0.005} value={pB} onChange={(e) => setPB(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.indB }} />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setRunId((k) => k + 1)}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: `1px solid ${DS.border}`,
          background: "rgba(129,140,248,0.2)",
          color: DS.t1,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Run one experiment (resample)
      </button>

      <div
        style={{
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: 14,
          background: "rgba(255,255,255,0.02)",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 12,
          color: DS.t2,
          lineHeight: 1.7,
        }}
      >
        <div>Arm A: {sample.cA} / {nArm} converts → p_hat_A = {pAhat.toFixed(4)}</div>
        <div>Arm B: {sample.cB} / {nArm} converts → p_hat_B = {pBhat.toFixed(4)}</div>
        <div>Pooled p under H0: {pPool.toFixed(4)}</div>
        <div>z statistic: {z.toFixed(3)}</div>
        <div style={{ color: sig05 ? DS.grn : DS.t3 }}>
          Two-sided p-value (normal approx): {pVal.toFixed(4)}
          {sig05 ? " (below 0.05)" : ""}
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        Re-run to see sampling noise: even with a real lift, individual runs can miss significance. Power and sample size planning exist precisely because of this variance. For production, prefer sequential methods or pre-registered fixed horizons over peeking until significance.
      </p>
    </div>
  );
}
