import { Link } from "react-router-dom";
import PageShell from "./PageShell.jsx";

const P = { border: "rgba(255,255,255,0.08)", card: "rgba(255,255,255,0.02)", t2: "#E2E8F0", t3: "#94A3B8", ind: "#818CF8", grn: "#34D399", indB: "#6366F1" };

export default function PreviewPage() {
  return (
    <PageShell title="Product Preview">
      <p style={{ marginBottom: 18 }}>
        This is a read-only slice of the DataSpark experience: one mission, one AI feedback panel, and one progress snapshot.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <section style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.ind, fontFamily: "var(--mono)", marginBottom: 8 }}>MISSION PREVIEW</div>
          <div style={{ color: P.t2, marginBottom: 8 }}>
            Signups dropped 25% after a Friday release. How would you investigate and explain it to your manager?
          </div>
          <ul style={{ marginLeft: 18, color: P.t3 }}>
            <li>Check data quality + deploy timeline</li>
            <li>Segment by platform, cohort, geography</li>
            <li>Prioritize top hypothesis and rollback criteria</li>
          </ul>
        </section>

        <section style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.grn, fontFamily: "var(--mono)", marginBottom: 8 }}>AI FEEDBACK SNAPSHOT</div>
          <div style={{ color: P.t2, marginBottom: 10 }}>
            Strong structure and clear communication. Next, add confidence levels and expected impact before making a recommendation.
          </div>
          <div style={{ display: "grid", gap: 6, maxWidth: 360 }}>
            {[
              ["Reasoning", "88%"],
              ["Assumptions", "74%"],
              ["Communication", "91%"],
            ].map(([k, v]) => (
              <div key={k} style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: "6px 10px", display: "flex", justifyContent: "space-between", color: P.t2 }}>
                <span>{k}</span>
                <span style={{ color: P.grn, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.ind, fontFamily: "var(--mono)", marginBottom: 8 }}>PROGRESSION SNAPSHOT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: "38%", height: "100%", background: "linear-gradient(90deg,#818CF8,#34D399)" }} />
            </div>
            <span style={{ color: P.t2, fontWeight: 700 }}>38%</span>
          </div>
          <div style={{ color: P.t3 }}>Current path: SQL Foundations → Product Sense → System Design.</div>
        </section>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to="/" style={{ textDecoration: "none", background: P.indB, color: "#fff", borderRadius: 8, padding: "10px 14px", fontWeight: 700 }}>
          Join Early Access
        </Link>
        <Link to="/contact" style={{ textDecoration: "none", border: `1px solid ${P.border}`, color: P.t2, borderRadius: 8, padding: "10px 14px", fontWeight: 600 }}>
          Ask a question
        </Link>
      </div>
    </PageShell>
  );
}
