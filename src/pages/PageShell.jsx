import { Link } from "react-router-dom";
import { DS } from "../lib/ds-platform-tokens.js";

const SANS = "var(--ds-sans), sans-serif";
const MONO = "var(--ds-mono), monospace";
const WHITE = "#F8FAFC";
const PURPLE = "#A855F7";
const CYAN = "#22D3EE";
const BORDER = "rgba(255,255,255,0.08)";

const P = { bg: DS.bg, border: BORDER, t1: WHITE, t2: DS.t2, t3: DS.t3 };

function SparkMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(168,85,247,0.10)" stroke="rgba(168,85,247,0.45)" />
      <path d="M8 22 L14 15 L19 18 L25 9" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="9" r="3" fill={PURPLE} />
      <circle cx="25" cy="9" r="5.5" stroke={PURPLE} strokeOpacity="0.35" />
    </svg>
  );
}

export default function PageShell({ title, children }) {
  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.t1, fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      <style>{`
        *{box-sizing:border-box}
        a{color:inherit}
        .ds-doc h2,.ds-doc h3{color:#F1F5F9;font-weight:700;letter-spacing:-0.01em}
        .ds-doc h3{font-size:17px}
        .ds-doc strong{color:#F8FAFC}
        .ds-doc a{color:#22D3EE;text-decoration:none}
      `}</style>

      {/* Ambient purple glow — in-family with the landing page */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          height: 480,
          background: "radial-gradient(ellipse at center, rgba(168,85,247,0.16), transparent 70%)",
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
      />

      <header style={{ position: "relative", zIndex: 1, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: WHITE }}>
            <SparkMark />
            DataSpark
          </Link>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              background: `linear-gradient(110deg, ${PURPLE}, ${CYAN})`,
              borderRadius: 9,
              padding: "10px 16px",
              boxShadow: "0 8px 24px rgba(168,85,247,0.25)",
            }}
          >
            Back to home
          </Link>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "52px 24px 80px" }}>
        <h1
          style={{
            fontSize: "clamp(30px, 4.5vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            marginBottom: 18,
            background: `linear-gradient(110deg, ${WHITE} 0%, rgba(168,85,247,0.9) 60%, ${CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </h1>
        <div className="ds-doc" style={{ color: P.t2, fontSize: 15, lineHeight: 1.75 }}>{children}</div>
        <div style={{ marginTop: 32, fontSize: 12.5, color: P.t3, fontFamily: MONO }}>
          Questions? Visit <Link to="/contact" style={{ color: CYAN, textDecoration: "none" }}>Contact</Link>.
        </div>
      </main>
    </div>
  );
}
