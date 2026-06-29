import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/authContext.jsx";
import { startCheckout, openBillingPortal } from "../lib/billing.js";

// ── Palette (matches landing v2) ───────────────────────────────────────────
const INK = "#04040A";
const WHITE = "#F8FAFC";
const GRAY = "#94A3B8";
const DIM = "#475569";
const BORDER = "rgba(255,255,255,0.08)";
const PURPLE = "#A855F7";
const CYAN = "#22D3EE";
const GREEN = "#34D399";
const RED = "#F87171";
const GRADIENT = `linear-gradient(100deg, ${PURPLE} 0%, ${CYAN} 100%)`;
const SANS = "var(--ds-sans), sans-serif";
const MONO = "var(--ds-mono), monospace";

const CURRENCY = "A$"; // prices are in AUD
const MONTHLY_PRICE = 20;
const ANNUAL_PRICE = 180; // A$15/mo equivalent — 25% off vs paying monthly
const ANNUAL_MONTHLY_EQUIV = (ANNUAL_PRICE / 12).toFixed(0);
const ANNUAL_SAVE_PCT = Math.round((1 - ANNUAL_PRICE / (MONTHLY_PRICE * 12)) * 100);

const FREE_FEATURES = [
  "First 2 lessons of every course",
  "5 AI tutor messages per day",
  "Interactive visualizations",
  "Mock interview previews",
];

const PRO_FEATURES = [
  "Every lesson, every course — unlocked",
  "20 AI tutor messages per day",
  "Full mock-interview simulations",
  "Course completion certificates",
  "All future courses included",
];

function Check({ color = GREEN }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  const { user, isPro, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState("annual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canceled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("canceled");

  const onFree = () => {
    if (user) navigate("/platform");
    else openAuthModal("signup");
  };

  const onPro = async () => {
    setError("");
    if (!user) { openAuthModal("signup"); return; }
    if (isPro) { navigate("/platform"); return; }
    setBusy(true);
    try {
      await startCheckout(interval);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: INK, color: WHITE, fontFamily: SANS, padding: "0 20px 80px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" }}>
          <Link to="/" style={{ color: WHITE, textDecoration: "none", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            DataSpark
          </Link>
          {user ? (
            <Link to="/platform" style={{ color: GRAY, textDecoration: "none", fontSize: 14, fontFamily: MONO }}>
              Go to platform →
            </Link>
          ) : (
            <button onClick={() => openAuthModal("signin")} style={{ background: "none", border: "none", color: GRAY, fontSize: 14, fontFamily: MONO, cursor: "pointer" }}>
              Log in
            </button>
          )}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", margin: "32px 0 12px" }}>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            Start free. Go Pro when you&rsquo;re hooked.
          </h1>
          <p style={{ color: GRAY, fontSize: 16, maxWidth: 540, margin: "14px auto 0", lineHeight: 1.6 }}>
            Every course opens with free lessons. Upgrade to unlock the full curriculum, certificates, and the complete AI tutor.
          </p>
        </div>

        {canceled && (
          <div style={{ maxWidth: 420, margin: "8px auto 0", textAlign: "center", color: GRAY, fontSize: 13, fontFamily: MONO }}>
            Checkout canceled — no charge made. You can upgrade any time.
          </div>
        )}

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", margin: "28px 0 8px" }}>
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 4 }}>
            {[
              { id: "monthly", label: "Monthly" },
              { id: "annual", label: `Annual · save ${ANNUAL_SAVE_PCT}%` },
            ].map((opt) => {
              const active = interval === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setInterval(opt.id)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "9px 18px",
                    borderRadius: 9,
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: SANS,
                    color: active ? "#0B0314" : GRAY,
                    background: active ? GRADIENT : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 28 }}>
          {/* Free */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 18, padding: "28px 26px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: GRAY }}>Free</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "14px 0 4px" }}>
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em" }}>{CURRENCY}0</span>
              <span style={{ color: DIM, fontSize: 15 }}>forever</span>
            </div>
            <p style={{ color: GRAY, fontSize: 14, margin: "0 0 20px" }}>Get a real feel for every course.</p>
            <button
              onClick={onFree}
              style={{ width: "100%", padding: "13px", borderRadius: 11, border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.04)", color: WHITE, fontSize: 14.5, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}
            >
              {user ? "Go to platform" : "Try now — free"}
            </button>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 11 }}>
              {FREE_FEATURES.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: GRAY, lineHeight: 1.4 }}>
                  <Check color={GRAY} /> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{ position: "relative", border: `1.5px solid ${CYAN}`, borderRadius: 18, padding: "28px 26px", background: "linear-gradient(180deg, rgba(34,211,238,0.06), rgba(168,85,247,0.05))", boxShadow: "0 0 50px rgba(34,211,238,0.12)" }}>
            <div style={{ position: "absolute", top: -12, right: 22, background: GRADIENT, color: "#0B0314", fontSize: 11, fontWeight: 800, fontFamily: MONO, letterSpacing: "0.06em", padding: "4px 12px", borderRadius: 20 }}>
              MOST POPULAR
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: CYAN }}>Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "14px 0 4px" }}>
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em" }}>
                {CURRENCY}{interval === "annual" ? ANNUAL_MONTHLY_EQUIV : MONTHLY_PRICE}
              </span>
              <span style={{ color: DIM, fontSize: 15 }}>/mo AUD</span>
            </div>
            <p style={{ color: GRAY, fontSize: 14, margin: "0 0 20px" }}>
              {interval === "annual" ? `Billed ${CURRENCY}${ANNUAL_PRICE} AUD once a year.` : "Billed monthly. Cancel anytime."}
            </p>
            <button
              onClick={onPro}
              disabled={busy}
              style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", background: GRADIENT, color: "#0B0314", fontSize: 14.5, fontWeight: 800, fontFamily: SANS, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1, boxShadow: "0 0 28px rgba(168,85,247,0.4)" }}
            >
              {isPro ? "You're on Pro ✓" : busy ? "Redirecting…" : user ? "Upgrade to Pro" : "Try now — upgrade later"}
            </button>
            {isPro && (
              <button onClick={openBillingPortal} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 11, border: `1px solid ${BORDER}`, background: "transparent", color: GRAY, fontSize: 13, fontFamily: MONO, cursor: "pointer" }}>
                Manage billing
              </button>
            )}
            {error && <div style={{ marginTop: 12, color: RED, fontSize: 12.5, fontFamily: MONO, textAlign: "center" }}>{error}</div>}
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 11 }}>
              {PRO_FEATURES.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: WHITE, lineHeight: 1.4 }}>
                  <Check /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: DIM, fontSize: 12.5, fontFamily: MONO, marginTop: 32 }}>
          Secure payments by Stripe · Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  );
}
