import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

const ACCENT = "#8B5CF6";
const ACCENT_DIM = "rgba(139,92,246,0.18)";
const ACCENT_MID = "rgba(139,92,246,0.45)";

// --- Pure math helpers (all constants declared before component) ---

function logFactorial(n) {
  if (n <= 1) return 0;
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}

function binomialPMF(n, k, p) {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logP =
    logFactorial(n) -
    logFactorial(k) -
    logFactorial(n - k) +
    k * Math.log(p) +
    (n - k) * Math.log(1 - p);
  return Math.exp(logP);
}

function poissonPMF(lambda, k) {
  if (k < 0) return 0;
  if (lambda === 0) return k === 0 ? 1 : 0;
  const logP = k * Math.log(lambda) - lambda - logFactorial(k);
  return Math.exp(logP);
}

function fmt4(x) {
  if (x >= 0.001) return x.toFixed(4);
  return x.toExponential(2);
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

const WHEN_TO_USE_ROWS = [
  { label: "Trials", bin: "Fixed n trials", poi: "Events over time/space" },
  { label: "Outcome", bin: "Binary (success/fail)", poi: "Count of rare events" },
  { label: "Parameter", bin: "n and p", poi: "Rate λ (mean = variance)" },
  { label: "Independence", bin: "Each trial independent", poi: "Events independent" },
  { label: "Example", bin: "Coin flips, click-throughs", poi: "Calls/hr, defects/km" },
  { label: "Approx rule", bin: "—", poi: "Use when n≥20, p≤0.05, np=λ" },
];

export default function StatBinomialPoissonViz() {
  const [tab, setTab] = useState("binomial");

  // Binomial controls
  const [nTrials, setNTrials] = useState(6);
  const [pSuccess, setPSuccess] = useState(0.5);
  const [highlightK, setHighlightK] = useState(4);

  // Poisson controls
  const [lambda, setLambda] = useState(3);
  const [highlightKPoi, setHighlightKPoi] = useState(5);

  // Binomial PMF data
  const binData = useMemo(() => {
    const vals = [];
    for (let k = 0; k <= nTrials; k++) {
      vals.push({ k, p: binomialPMF(nTrials, k, pSuccess) });
    }
    return vals;
  }, [nTrials, pSuccess]);

  const binMax = useMemo(() => Math.max(...binData.map((d) => d.p), 0.001), [binData]);
  const binMean = nTrials * pSuccess;
  const binStd = Math.sqrt(nTrials * pSuccess * (1 - pSuccess));

  // Poisson PMF data (k=0..20)
  const poiData = useMemo(() => {
    const vals = [];
    for (let k = 0; k <= 20; k++) {
      vals.push({ k, p: poissonPMF(lambda, k) });
    }
    return vals;
  }, [lambda]);

  const poiMax = useMemo(() => Math.max(...poiData.map((d) => d.p), 0.001), [poiData]);

  const highlightKBin = Math.min(highlightK, nTrials);

  const highlightP =
    tab === "binomial"
      ? binomialPMF(nTrials, highlightKBin, pSuccess)
      : poissonPMF(lambda, highlightKPoi);

  const container = {
    fontFamily: "var(--ds-sans), sans-serif",
    color: DS.t1,
    padding: "24px 20px",
    maxWidth: 720,
    margin: "0 auto",
  };

  const card = {
    background: DS.card,
    border: `1px solid ${DS.border}`,
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 16,
  };

  const sliderLabel = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 13,
    color: DS.t3,
  };

  const tabBtn = (active) => ({
    padding: "8px 20px",
    borderRadius: 8,
    border: `1px solid ${active ? ACCENT : DS.border}`,
    background: active ? ACCENT_DIM : "rgba(255,255,255,0.03)",
    color: active ? DS.t1 : DS.t3,
    fontFamily: "var(--ds-sans), sans-serif",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const badge = (color) => ({
    display: "inline-block",
    background: color + "22",
    border: `1px solid ${color}55`,
    color: color,
    borderRadius: 6,
    padding: "2px 10px",
    fontSize: 12,
    fontFamily: "var(--ds-mono), monospace",
    marginRight: 8,
  });

  return (
    <div style={container}>
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={tabBtn(tab === "binomial")} onClick={() => setTab("binomial")}>
          Binomial
        </button>
        <button style={tabBtn(tab === "poisson")} onClick={() => setTab("poisson")}>
          Poisson
        </button>
      </div>

      {/* ─── BINOMIAL TAB ─── */}
      {tab === "binomial" && (
        <>
          <div style={card}>
            <div style={{ marginBottom: 16, fontSize: 13, color: DS.t3 }}>
              <span style={badge(ACCENT)}>X ~ Binomial(n, p)</span>
              <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.t2 }}>
                P(X=k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={sliderLabel}>
                <span>n = trials</span>
                <span style={{ color: ACCENT, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{nTrials}</span>
              </div>
              <input
                type="range" min={1} max={50} step={1} value={nTrials}
                onChange={(e) => {
                  const v = +e.target.value;
                  setNTrials(v);
                  setHighlightK(Math.min(highlightK, v));
                }}
                style={SLIDER_TRACK}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={sliderLabel}>
                <span>p = success probability</span>
                <span style={{ color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{pSuccess.toFixed(2)}</span>
              </div>
              <input
                type="range" min={0.01} max={0.99} step={0.01} value={pSuccess}
                onChange={(e) => setPSuccess(+e.target.value)}
                style={SLIDER_TRACK}
              />
            </div>

            <div>
              <div style={sliderLabel}>
                <span>Highlight k = exact count</span>
                <span style={{ color: DS.ind, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{highlightKBin}</span>
              </div>
              <input
                type="range" min={0} max={nTrials} step={1} value={highlightKBin}
                onChange={(e) => setHighlightK(+e.target.value)}
                style={SLIDER_TRACK}
              />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Mean = np", val: binMean.toFixed(3), color: ACCENT },
              { label: "Std = √np(1−p)", val: binStd.toFixed(3), color: DS.grn },
              { label: `P(X=${highlightKBin})`, val: fmt4(highlightP), color: DS.ind },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...card, flex: 1, minWidth: 140, marginBottom: 0, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 20, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* PMF bar chart */}
          <div style={{ ...card, paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: DS.t3, marginBottom: 12 }}>
              PMF — P(X = k) for k = 0 … {nTrials}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 140, overflowX: "auto" }}>
              {binData.map(({ k, p }) => {
                const isHl = k === highlightKBin;
                const isMean = Math.round(binMean) === k;
                const barH = Math.max(2, (p / binMax) * 128);
                return (
                  <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 0 auto", minWidth: 18 }}>
                    <div
                      title={`P(X=${k}) = ${fmt4(p)}`}
                      style={{
                        width: "100%",
                        height: barH,
                        background: isHl ? DS.ind : isMean ? ACCENT : ACCENT_MID,
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.2s",
                        cursor: "pointer",
                      }}
                      onClick={() => setHighlightK(k)}
                    />
                    {nTrials <= 20 && (
                      <div style={{ fontSize: 9, color: DS.dim, marginTop: 2 }}>{k}</div>
                    )}
                  </div>
                );
              })}
            </div>
            {nTrials > 20 && (
              <div style={{ fontSize: 10, color: DS.dim, marginTop: 4 }}>k = 0 … {nTrials} (click any bar to highlight)</div>
            )}
          </div>

          {/* Example card */}
          <div style={{ ...card, borderColor: ACCENT_MID, background: ACCENT_DIM }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>Real example</div>
            <div style={{ fontSize: 13, color: DS.t2 }}>
              With <b>{nTrials} coin flips</b> (p = {pSuccess.toFixed(2)}):
            </div>
            <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 13, color: DS.t1, marginTop: 6 }}>
              P(X = {highlightKBin} heads) = {fmt4(highlightP)}
            </div>
          </div>
        </>
      )}

      {/* ─── POISSON TAB ─── */}
      {tab === "poisson" && (
        <>
          <div style={card}>
            <div style={{ marginBottom: 16, fontSize: 13, color: DS.t3 }}>
              <span style={badge(DS.grn)}>X ~ Poisson(λ)</span>
              <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.t2 }}>
                P(X=k) = e⁻λ · λᵏ / k!
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={sliderLabel}>
                <span>λ = average rate</span>
                <span style={{ color: DS.grn, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{lambda.toFixed(1)}</span>
              </div>
              <input
                type="range" min={0.5} max={20} step={0.5} value={lambda}
                onChange={(e) => setLambda(+e.target.value)}
                style={SLIDER_TRACK}
              />
            </div>

            <div>
              <div style={sliderLabel}>
                <span>Highlight k = exact count</span>
                <span style={{ color: DS.ind, fontFamily: "var(--ds-mono), monospace", fontWeight: 700 }}>{highlightKPoi}</span>
              </div>
              <input
                type="range" min={0} max={20} step={1} value={highlightKPoi}
                onChange={(e) => setHighlightKPoi(+e.target.value)}
                style={SLIDER_TRACK}
              />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Mean = λ", val: lambda.toFixed(1), color: DS.grn },
              { label: "Variance = λ", val: lambda.toFixed(1), color: ACCENT },
              { label: `P(X=${highlightKPoi})`, val: fmt4(highlightP), color: DS.ind },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...card, flex: 1, minWidth: 140, marginBottom: 0, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: DS.t3, marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 20, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* PMF bar chart */}
          <div style={{ ...card, paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: DS.t3, marginBottom: 12 }}>
              PMF — P(X = k) for k = 0 … 20
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140 }}>
              {poiData.map(({ k, p }) => {
                const isHl = k === highlightKPoi;
                const isMean = Math.round(lambda) === k;
                const barH = Math.max(2, (p / poiMax) * 128);
                return (
                  <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div
                      title={`P(X=${k}) = ${fmt4(p)}`}
                      style={{
                        width: "100%",
                        height: barH,
                        background: isHl ? DS.ind : isMean ? DS.grn : "rgba(52,211,153,0.3)",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.2s",
                        cursor: "pointer",
                      }}
                      onClick={() => setHighlightKPoi(k)}
                    />
                    <div style={{ fontSize: 9, color: DS.dim, marginTop: 2 }}>{k}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Example card */}
          <div style={{ ...card, borderColor: "rgba(52,211,153,0.35)", background: "rgba(52,211,153,0.08)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.grn, marginBottom: 6 }}>Real example</div>
            <div style={{ fontSize: 13, color: DS.t2 }}>
              Avg <b>λ = {lambda.toFixed(1)} support tickets/hour</b>:
            </div>
            <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 13, color: DS.t1, marginTop: 6 }}>
              P(X = {highlightKPoi} tickets) = {fmt4(highlightP)}
            </div>
          </div>
        </>
      )}

      {/* ─── WHEN TO USE WHICH ─── */}
      <div style={{ ...card, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: DS.t1, marginBottom: 12 }}>
          When to use which distribution?
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["", "Binomial", "Poisson"].map((h, i) => (
                  <th key={i} style={{
                    textAlign: "left",
                    padding: "4px 10px",
                    color: i === 1 ? ACCENT : i === 2 ? DS.grn : DS.dim,
                    borderBottom: `1px solid ${DS.border}`,
                    fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WHEN_TO_USE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td style={{ padding: "5px 10px", color: DS.t3, fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                  <td style={{ padding: "5px 10px", color: DS.t2, borderLeft: `1px solid ${DS.border}` }}>{row.bin}</td>
                  <td style={{ padding: "5px 10px", color: DS.t2, borderLeft: `1px solid ${DS.border}` }}>{row.poi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
