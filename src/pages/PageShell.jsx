import { Link } from "react-router-dom";

const P = { bg: "#020617", border: "rgba(255,255,255,0.06)", t1: "#F8FAFC", t2: "#E2E8F0", t3: "#94A3B8", indB: "#6366F1" };

export default function PageShell({ title, children }) {
  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.t1, fontFamily: "var(--sans)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--sans:'Manrope',system-ui,sans-serif;--mono:'JetBrains Mono',monospace}
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit}
      `}</style>

      <header style={{ borderBottom: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Link to="/" style={{ textDecoration: "none", fontWeight: 900, letterSpacing: "-0.3px" }}>
            DataSpark
          </Link>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              background: P.indB,
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            Back to home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 72px" }}>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 14 }}>{title}</h1>
        <div style={{ color: P.t2, fontSize: 15, lineHeight: 1.75 }}>{children}</div>
        <div style={{ marginTop: 28, fontSize: 12.5, color: P.t3 }}>
          Questions? Visit <Link to="/contact" style={{ color: P.t2 }}>Contact</Link>.
        </div>
      </main>
    </div>
  );
}
