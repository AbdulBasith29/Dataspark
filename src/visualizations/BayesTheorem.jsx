import { useMemo, useEffect, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

export default function BayesTheorem() {
  const [pA, setPA] = useState(0.08);
  const [pBgivenA, setPBgivenA] = useState(0.9);
  const [pBgivenNotA, setPBgivenNotA] = useState(0.05);
  const canvasRef = useRef(null);

  const { pB, pAgivenB } = useMemo(() => {
    const pNotA = 1 - pA;
    const pB = pBgivenA * pA + pBgivenNotA * pNotA;
    const pAgivenB = pB > 1e-12 ? (pBgivenA * pA) / pB : 0;
    return { pB, pAgivenB };
  }, [pA, pBgivenA, pBgivenNotA]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 20;
    const barH = 36;
    const maxW = cssW - pad * 2 - 100;

    const drawBar = (y, label, p, color) => {
      const w = Math.max(4, p * maxW);
      ctx.fillStyle = DS.t3;
      ctx.font = "10px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, pad, y + 14);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(pad + 90, y, maxW, barH);
      ctx.fillStyle = color;
      ctx.fillRect(pad + 90, y, w, barH);
      ctx.strokeStyle = DS.border;
      ctx.strokeRect(pad + 90, y, maxW, barH);
      ctx.fillStyle = DS.t1;
      ctx.font = "11px var(--ds-mono), monospace";
      ctx.textAlign = "left";
      ctx.fillText(p.toFixed(3), pad + 96 + w + 6, y + 23);
    };

    drawBar(12, "Prior P(A)", pA, "rgba(129, 140, 248, 0.55)");
    drawBar(12 + barH + 14, "P(B|A)", pBgivenA, "rgba(52, 211, 153, 0.45)");
    drawBar(12 + 2 * (barH + 14), "P(B|not A)", pBgivenNotA, "rgba(248, 113, 113, 0.4)");
    drawBar(12 + 3 * (barH + 14), "P(B) mix", pB, "rgba(148, 163, 184, 0.5)");
    drawBar(12 + 4 * (barH + 14), "Posterior P(A|B)", pAgivenB, "rgba(251, 191, 36, 0.65)");
  }, [pA, pBgivenA, pBgivenNotA, pB, pAgivenB]);

  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, fontFamily: "var(--ds-sans), sans-serif", marginBottom: 4 }}>
        Bayes: prior, likelihood, posterior
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 14 }}>
        Think disease screening: rare prior P(A), sensitive test P(B|A), imperfect specificity P(B|not A). Bayes combines them: P(A|B) = P(B|A)P(A) / P(B), with P(B) = P(B|A)P(A) + P(B|not A)P(not A).
      </p>

      <canvas ref={canvasRef} style={{ width: "100%", height: 220, borderRadius: 12, border: `1px solid ${DS.border}`, display: "block" }} />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Prior P(A) = {pA.toFixed(3)}
          <input type="range" min={0.01} max={0.5} step={0.005} value={pA} onChange={(e) => setPA(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.ind }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          Likelihood P(B|A) = {pBgivenA.toFixed(3)}
          <input type="range" min={0.5} max={0.99} step={0.01} value={pBgivenA} onChange={(e) => setPBgivenA(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.grn }} />
        </label>
        <label style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
          P(B|not A) = {pBgivenNotA.toFixed(3)}
          <input type="range" min={0.01} max={0.3} step={0.005} value={pBgivenNotA} onChange={(e) => setPBgivenNotA(+e.target.value)} style={{ width: "100%", marginTop: 6, accentColor: DS.indB }} />
        </label>
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: DS.t2, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.5 }}>
        P(B) = {pB.toFixed(4)} · P(A|B) = {pAgivenB.toFixed(4)}
      </p>

      <p style={{ marginTop: 12, fontSize: 12, color: DS.t3, lineHeight: 1.65, fontFamily: "var(--ds-sans), sans-serif" }}>
        When the prior is small, a positive test still often leaves P(A|B) surprisingly low unless false positives are tiny. That is the base-rate lesson interviewers love.
      </p>
    </div>
  );
}
