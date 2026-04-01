import { useState } from "react";
import { Link } from "react-router-dom";
import { safeLogClientEvent } from "../lib/analytics.js";

const P = {
  bg: "#020617",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  glass: "rgba(6,8,20,0.65)",
  t1: "#F8FAFC",
  t2: "#E2E8F0",
  t3: "#94A3B8",
  dim: "#475569",
  ind: "#818CF8",
  grn: "#34D399",
  indB: "#6366F1",
};

function LogoGlow() {
  return (
    <div
      style={{
        position: "relative",
        width: 120,
        height: 120,
        margin: "0 auto 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="thank-glow-ring"
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(52,211,153,0.12) 45%, transparent 70%)",
          filter: "blur(8px)",
          animation: "thankGlow 4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: P.glass,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${P.border}`,
          boxShadow: "0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="44" height="44" viewBox="0 0 40 40" fill="none" style={{ display: "block" }}>
          <circle cx="20" cy="8" r="4" fill={P.ind} />
          <circle cx="10" cy="30" r="4" fill={P.grn} />
          <circle cx="30" cy="30" r="4" fill={P.ind} />
          <circle cx="20" cy="20" r="4.5" fill="#E2E8F0" />
          <line x1="20" y1="8" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5" />
          <line x1="10" y1="30" x2="20" y2="20" stroke={P.grn} strokeWidth="2" opacity=".5" />
          <line x1="30" y1="30" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5" />
        </svg>
      </div>
      <svg
        className="thank-check"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          filter: "drop-shadow(0 4px 12px rgba(52,211,153,0.5))",
        }}
      >
        <circle cx="12" cy="12" r="11" fill="rgba(52,211,153,0.15)" stroke={P.grn} strokeWidth="1.5" />
        <path
          d="M7 12.5l3 3L17 9"
          stroke={P.grn}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function ThankYouPage() {
  const [copied, setCopied] = useState(false);
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/` : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      void safeLogClientEvent({
        eventName: "thank_you_share_click",
        page: "/thank-you",
        metadata: { action: "copy_link", location: "thank_you" },
      });
    } catch {
      setCopied(false);
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      void copyLink();
      return;
    }
    try {
      await navigator.share({
        title: "DataSpark — early access",
        text: "I just joined the DataSpark waitlist. Strategy over syntax — worth a look.",
        url: inviteUrl,
      });
      void safeLogClientEvent({
        eventName: "thank_you_share_click",
        page: "/thank-you",
        metadata: { action: "native_share", location: "thank_you" },
      });
    } catch {
      /* user cancelled */
    }
  };

  const cards = [
    {
      k: "next",
      label: "What happens next",
      mono: "TIMELINE",
      body: "We will email you before launch with early access, onboarding, and founding-member details. No noise — only signal.",
      accent: P.ind,
    },
    {
      k: "get",
      label: "What you locked in",
      mono: "PERKS",
      body: "Founding member pricing, full access to all 9 launch courses and 285+ scenarios, plus AI reasoning feedback when we go live.",
      accent: P.grn,
    },
    {
      k: "share",
      label: "Move up the list",
      mono: "SHARE",
      body: "Refer friends who belong in the room. Early engagement helps us prioritize the builders and thinkers who show up first.",
      accent: P.ind,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: P.bg,
        color: P.t1,
        fontFamily: "var(--sans)",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--sans:'Manrope',system-ui,sans-serif;--mono:'JetBrains Mono',monospace}
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes thankGlow {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes thankCheck {
          0% { transform: scale(0.2) rotate(-12deg); opacity: 0; }
          55% { transform: scale(1.12) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .thank-check { animation: thankCheck 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both; }
        @media (max-width: 640px) {
          .thank-cta-row { flex-direction: column !important; }
          .thank-cta-row button { width: 100% !important; }
        }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            width: "min(90vw, 560px)",
            height: "min(90vw, 560px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
            top: "-8%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
            bottom: "5%",
            right: "-5%",
          }}
        />
      </div>

      <header
        style={{
          position: "relative",
          zIndex: 2,
          borderBottom: `1px solid ${P.border}`,
          background: "rgba(2,6,23,0.75)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: P.t1 }}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="20" cy="8" r="4" fill={P.ind} />
              <circle cx="10" cy="30" r="4" fill={P.grn} />
              <circle cx="30" cy="30" r="4" fill={P.ind} />
              <circle cx="20" cy="20" r="4.5" fill="#E2E8F0" />
              <line x1="20" y1="8" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5" />
              <line x1="10" y1="30" x2="20" y2="20" stroke={P.grn} strokeWidth="2" opacity=".5" />
              <line x1="30" y1="30" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px" }}>DataSpark</span>
          </Link>
          <Link
            to="/"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              background: P.indB,
              borderRadius: 10,
              padding: "10px 18px",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            }}
          >
            Back to home
          </Link>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1, maxWidth: 920, margin: "0 auto", padding: "48px 24px 80px" }}>
        <LogoGlow />

        <h1
          style={{
            textAlign: "center",
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-1.5px",
            lineHeight: 1.12,
            marginBottom: 14,
          }}
        >
          You&apos;re in.{" "}
          <span style={{ color: P.dim }}>You&apos;re early.</span>
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${P.ind}, ${P.grn})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            That matters.
          </span>
        </h1>

        <p
          style={{
            textAlign: "center",
            color: P.t3,
            fontSize: "clamp(15px, 2vw, 17px)",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.65,
          }}
        >
          Welcome to the early side of the line. You just chose strategy over syntax — this page is your receipt, and your VIP pass.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginBottom: 36,
          }}
        >
          {cards.map((c) => (
            <div
              key={c.k}
              style={{
                background: P.glass,
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${P.border}`,
                borderRadius: 18,
                padding: "22px 20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
                transition: "transform 0.25s ease, border-color 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "rgba(129,140,248,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = P.border;
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "var(--mono)",
                  letterSpacing: 1.6,
                  color: c.accent,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {c.mono}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: P.t1, marginBottom: 10, letterSpacing: "-0.3px" }}>{c.label}</div>
              <div style={{ fontSize: 13.5, color: P.t3, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: 20,
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: 28,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: P.ind, fontWeight: 700, letterSpacing: 1.4, marginBottom: 10 }}>
            BRING YOUR CREW
          </div>
          <p style={{ fontSize: 15, color: P.t2, marginBottom: 18, lineHeight: 1.6, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            Share DataSpark with someone who wants to think like a senior hire — referrals help us spot who to prioritize when doors open.
          </p>
          <div className="thank-cta-row" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => void copyLink()}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "14px 28px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                color: "#fff",
                background: P.indB,
                boxShadow: "0 8px 28px rgba(99,102,241,0.45)",
                fontFamily: "var(--sans)",
              }}
            >
              {copied ? "Copied — paste anywhere" : "Copy invite link"}
            </button>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
              <button
                type="button"
                onClick={() => void shareNative()}
                style={{
                  border: `1px solid ${P.border}`,
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  color: P.t1,
                  background: "rgba(255,255,255,0.04)",
                  fontFamily: "var(--sans)",
                }}
              >
                Share…
              </button>
            ) : null}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12.5, color: P.dim }}>
          No spam, ever. Unsubscribe anytime. Questions?{" "}
          <Link to="/contact" style={{ color: P.t3 }}>
            Contact
          </Link>
        </p>
      </main>
    </div>
  );
}
