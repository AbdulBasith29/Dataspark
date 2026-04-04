import { useMemo, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function TrainValTestSplit() {
  const [trainPct, setTrainPct] = useState(70);
  const valPct = useMemo(() => Math.round((100 - trainPct) * 0.45), [trainPct]);
  const testPct = 100 - trainPct - valPct;

  const bar = (pct, color, label) => (
    <div style={{ flex: pct, minWidth: 48, textAlign: "center" }}>
      <div
        style={{
          height: 44,
          borderRadius: 10,
          background: color,
          border: `1px solid rgba(255,255,255,0.08)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--ds-mono)",
          fontSize: 13,
          fontWeight: 700,
          color: DS.t1,
        }}
      >
        {pct}%
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: DS.t3, fontFamily: "var(--ds-sans)", fontWeight: 600 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans)", marginBottom: 4 }}>
        Train / validation / test
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono)", lineHeight: 1.55, marginBottom: 18 }}>
        Drag the split. Validation estimates generalization during tuning; test is touched once (ideally) for an honest final score.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "flex-end" }}>
        {bar(trainPct, "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(129,140,248,0.55))", "Train")}
        {bar(valPct, "linear-gradient(135deg, rgba(52,211,153,0.55), rgba(16,185,129,0.35))", "Val")}
        {bar(testPct, "linear-gradient(135deg, rgba(148,163,184,0.45), rgba(71,85,105,0.35))", "Test")}
      </div>
      <label style={{ display: "block" }}>
        <div style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono)", marginBottom: 8 }}>
          Training fraction: {trainPct}% (val & test adjust automatically)
        </div>
        <input
          type="range"
          min={50}
          max={90}
          value={trainPct}
          onChange={(e) => setTrainPct(+e.target.value)}
          style={{ width: "100%", accentColor: DS.indB }}
        />
      </label>
      <ul style={{ marginTop: 16, paddingLeft: 18, color: DS.t2, fontSize: 12, lineHeight: 1.65, fontFamily: "var(--ds-sans)" }}>
        <li>Train: fit parameters.</li>
        <li>Val: pick hyperparameters &amp; early stopping — peeking here still leaks signal if you iterate blindly.</li>
        <li>Test: lock away until you need a final, comparable number.</li>
      </ul>
    </div>
  );
}
