import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, X, ArrowRight, Code2, Database, BarChart3, Brain, Cpu, Sparkles, PieChart, Network, Settings2 } from "lucide-react";
import { emailDomainFromEmail, safeLogClientEvent } from "../lib/analytics.js";
import { getSupabaseBrowserClient } from "../lib/supabaseClient.js";

// ─── Design tokens ────────────────────────────────────────────────────────────
const P = {
  bg: "#020617", card: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)",
  bH: "rgba(129,140,248,0.2)", t1: "#F8FAFC", t2: "#E2E8F0", t3: "#94A3B8",
  dim: "#475569", ind: "#818CF8", grn: "#34D399", indB: "#6366F1",
};
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const EASE = "cubic-bezier(0.23,1,0.32,1)";

function waitlistErrorMessage(error) {
  const raw = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  if (raw.includes("row-level security") || raw.includes("rls policy") || error?.code === "42501")
    return "Sign-up is blocked by database permissions. In Supabase, run the migration SQL (tables + RLS policies + grants), then retry.";
  if (raw.includes("does not exist") || raw.includes("schema cache") || raw.includes("could not find the table"))
    return "Waitlist is not set up yet. Run the migration in supabase/migrations/ on your Supabase project, then retry.";
  if (raw.includes("jwt") || raw.includes("invalid api key") || raw.includes("invalid authentication"))
    return "Supabase keys look wrong. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and restart npm run dev.";
  return "Something went wrong. Please try again in a moment.";
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// Inline reveal style: fades + slides up when visible
function rev(visible, delay = 0, dy = 28) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : `translateY(${dy}px)`,
    transition: `opacity 0.65s ${delay}ms ${EASE}, transform 0.65s ${delay}ms ${EASE}`,
  };
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <defs>
      <radialGradient id="ll-bg" cx="40%" cy="25%" r="75%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#07081a" />
      </radialGradient>
      <radialGradient id="ll-peak" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#e0e7ff" />
        <stop offset="100%" stopColor="#818CF8" />
      </radialGradient>
      <filter id="ll-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <rect width="32" height="32" rx="7.5" fill="url(#ll-bg)" />
    <ellipse cx="16" cy="1.5" rx="12" ry="5" fill="rgba(129,140,248,0.1)" />
    <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
    <line x1="7.5" y1="24.5" x2="24.5" y2="9" stroke="rgba(129,140,248,0.28)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7.5" cy="24.5" r="2" fill="#4F46E5" opacity="0.7" />
    <circle cx="16" cy="16.75" r="2.5" fill="#6366F1" opacity="0.88" />
    <circle cx="24.5" cy="9" r="5.5" fill="rgba(129,140,248,0.18)" filter="url(#ll-glow)" />
    <circle cx="24.5" cy="9" r="3" fill="url(#ll-peak)" filter="url(#ll-glow)" />
    <line x1="25.5" y1="3.5" x2="25.5" y2="6" stroke="rgba(224,231,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="24.25" y1="4.75" x2="26.75" y2="4.75" stroke="rgba(224,231,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="25.5" cy="4.75" r="0.8" fill="white" />
  </svg>
);

// ─── Logo Marquee ─────────────────────────────────────────────────────────────
const LogoMarquee = () => {
  const logos = ["GOOGLE", "META", "AMAZON", "NETFLIX", "STRIPE", "APPLE", "UBER", "AIRBNB"];
  const doubled = [...logos, ...logos];
  return (
    <div style={{
      overflow: "hidden", padding: "28px 0",
      borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`,
      position: "relative",
      maskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
    }}>
      <div style={{ textAlign: "center", marginBottom: 14, fontSize: 11, fontFamily: "var(--mono)", letterSpacing: 2, color: P.dim, fontWeight: 600 }}>
        PRACTICE PROBLEMS INSPIRED BY INTERVIEWS AT
      </div>
      <div className="logo-marquee-track" style={{ display: "flex", gap: 56, width: "max-content" }}>
        {doubled.map((n, i) => (
          <span key={i} style={{ fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, color: P.t3, letterSpacing: 2.5, opacity: .45, whiteSpace: "nowrap" }}>{n}</span>
        ))}
      </div>
    </div>
  );
};

// ─── Hero Card ────────────────────────────────────────────────────────────────
const HeroCard = ({ visible }) => {
  const [mode, setMode] = useState("strategy");
  return (
    <div className="hero-card-float" style={{
      background: "#080E1A",
      border: `1px solid ${P.border}`,
      borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 440,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.5)",
      ...rev(visible, 120, 40),
    }}>
      {/* Card top bar */}
      <div style={{ padding: "14px 18px 0", display: "flex", alignItems: "center", gap: 7, borderBottom: `1px solid ${P.border}` }}>
        {[["#EF4444","The Old Way"], ["#34D399","The DataSpark Way"]].map(([dot, label], k) => {
          const id = k === 0 ? "syntax" : "strategy";
          const active = mode === id;
          return (
            <button key={id} type="button" role="tab"
              id={`hero-tab-${id}`}
              aria-selected={active}
              aria-controls="hero-card-panel"
              onClick={() => setMode(id)}
              className="hero-card-tab"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px 12px", border: "none", cursor: "pointer", background: "transparent",
                color: active ? P.t1 : P.dim,
                fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: .8,
                borderBottom: active ? `2px solid ${dot}` : "2px solid transparent",
                transition: `color 0.2s ${EASE}, border-color 0.2s ${EASE}`,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? dot : P.dim, transition: "background 0.2s", flexShrink: 0 }} />
              {label}
            </button>
          );
        })}
      </div>

      <div
        id="hero-card-panel" role="tabpanel"
        aria-labelledby={mode === "syntax" ? "hero-tab-syntax" : "hero-tab-strategy"}
        style={{ padding: "22px 20px", minHeight: 230, position: "relative" }}
      >
        {/* Syntax panel */}
        <div style={{
          opacity: mode === "syntax" ? 1 : 0,
          transform: mode === "syntax" ? "none" : "translateY(8px)",
          transition: `opacity 0.3s ${EASE}, transform 0.3s ${EASE}`,
          position: mode === "syntax" ? "relative" : "absolute",
          inset: mode === "syntax" ? "auto" : "22px 20px",
          pointerEvents: mode === "syntax" ? "auto" : "none",
        }}>
          <div style={{ fontSize: 10, color: "#EF4444", fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>PROMPT</div>
          <div style={{ fontSize: 12, color: P.t3, fontStyle: "italic", marginBottom: 14 }}>"Find top 5 customers by revenue"</div>
          <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 11.5, color: "#546380", lineHeight: 1.8, border: `1px solid ${P.border}` }}>
            <span style={{ color: P.ind }}>SELECT</span> customer_id,<br/>
            {"  "}<span style={{ color: P.ind }}>SUM</span>(amount) <span style={{ color: P.ind }}>AS</span> rev<br/>
            <span style={{ color: P.ind }}>FROM</span> orders<br/>
            <span style={{ color: P.ind }}>GROUP BY</span> 1 <span style={{ color: P.ind }}>ORDER BY</span> 2 <span style={{ color: P.ind }}>DESC</span><br/>
            <span style={{ color: P.ind }}>LIMIT</span> 5;
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#34D399", fontFamily: "var(--mono)", fontWeight: 600 }}><Check size={11} strokeWidth={2.5} /> Correct syntax</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#EF4444", fontFamily: "var(--mono)", fontWeight: 600 }}><X size={11} strokeWidth={2.5} /> No context</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#EF4444", fontFamily: "var(--mono)", fontWeight: 600 }}><X size={11} strokeWidth={2.5} /> No reasoning</span>
          </div>
        </div>

        {/* Strategy panel */}
        <div style={{
          opacity: mode === "strategy" ? 1 : 0,
          transform: mode === "strategy" ? "none" : "translateY(8px)",
          transition: `opacity 0.3s ${EASE}, transform 0.3s ${EASE}`,
          position: mode === "strategy" ? "relative" : "absolute",
          inset: mode === "strategy" ? "auto" : "22px 20px",
          pointerEvents: mode === "strategy" ? "auto" : "none",
        }}>
          <div style={{ fontSize: 10, color: P.grn, fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>PROMPT</div>
          <div style={{ fontSize: 12, color: P.t2, fontStyle: "italic", marginBottom: 14 }}>"Conversion dropped 25% over the weekend. Walk the VP through your investigation."</div>
          <div style={{ background: "rgba(52,211,153,.04)", borderRadius: 8, padding: "12px 14px", fontSize: 11.5, color: P.t3, lineHeight: 1.7, border: "1px solid rgba(52,211,153,.14)" }}>
            <div style={{ color: P.grn, fontWeight: 700, fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>YOUR RESPONSE:</div>
            1. First — is the data trustworthy? Check pipeline, recent deploys<br/>
            2. Segment the drop: iOS vs Android, new vs returning, by city<br/>
            3. Top hypothesis: Friday deploy broke the checkout flow<br/>
            4. Present findings + next steps with confidence levels
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Reasoning", "Impact", "Stakeholder-ready"].map(l => (
                <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: P.grn, fontFamily: "var(--mono)", fontWeight: 600 }}>
                  <Check size={11} strokeWidth={2.5} />{l}
                </span>
              ))}
            </div>
            <span style={{ background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.25)", borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 800, color: P.grn, flexShrink: 0 }}>87%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Animated counter ─────────────────────────────────────────────────────────
const C = ({ n, trigger = true }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const s = Date.now();
    const f = () => {
      const p = Math.min((Date.now() - s) / 1500, 1);
      setV(Math.floor((1 - (1 - p) ** 3) * n));
      if (p < 1) requestAnimationFrame(f);
    };
    f();
  }, [n, trigger]);
  return <>{v.toLocaleString()}</>;
};

// ─── Waitlist CTA ─────────────────────────────────────────────────────────────
function WaitlistCTA({ center = false, placement, email, setEmail, emailError, setEmailError, done, busy, track, go }) {
  const ctaLocation = placement === "final" ? "final" : "hero";
  const inputId = placement === "final" ? "waitlist-email-final" : "waitlist-email-hero";
  const statusId = placement === "final" ? "waitlist-status-final" : "waitlist-status-hero";
  const statusText = emailError
    ? emailError
    : done
      ? "You're in — we will email you before launch with early access details."
      : "Ready to join early access. Enter your email and select Secure Your Spot.";
  const srOnly = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 };

  const primary = async () => {
    void track(placement === "final" ? "final_cta_click" : "hero_cta_click", { location: ctaLocation, href: "#join" });
    await go(placement);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: center ? "center" : "flex-start", gap: 12, width: "100%" }}>
      {!done ? (
        <>
          <div className="cta-row" style={{ display: "flex", gap: 10, width: "100%" }}>
            <label htmlFor={inputId} style={srOnly}>Email address</label>
            <input
              type="email" id={inputId} value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
              placeholder="your@email.com"
              aria-label="Email address"
              aria-invalid={!!emailError}
              aria-describedby={statusId}
              onKeyDown={(e) => e.key === "Enter" && !busy && void primary()}
              className="cta-input"
              style={{
                background: "rgba(255,255,255,.04)",
                border: `1px solid ${emailError ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, padding: "15px 18px", color: P.t1, fontSize: 14,
                fontFamily: "var(--sans)", flex: 1, minWidth: 0,
                transition: `border-color 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
              }}
            />
            <button
              type="button" onClick={() => void primary()}
              disabled={busy} className="cta-btn" aria-busy={busy}
              style={{
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                border: "none", borderRadius: 12, padding: "15px 28px", minHeight: 56,
                color: "#fff", fontSize: 14, fontWeight: 800,
                cursor: busy ? "wait" : "pointer",
                boxShadow: "0 4px 24px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                opacity: busy ? 0.85 : 1,
                transition: `all 0.2s ${EASE}`,
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              {busy ? "Joining…" : "Secure Your Spot"}
            </button>
          </div>
          <div id={statusId} aria-live="polite" role="status" style={srOnly}>{statusText}</div>
          {emailError ? <div style={{ fontSize: 12, color: "#FCA5A5", marginTop: -2 }}>{emailError}</div> : null}
          <div style={{ fontSize: 12, color: P.dim, marginTop: -4 }}>No spam, ever. Unsubscribe anytime.</div>
        </>
      ) : (
        <div aria-live="polite" role="status" id={statusId} style={{
          background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)",
          borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <Check size={18} strokeWidth={2.5} style={{ color: P.grn, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: P.grn }}>
            You&apos;re in — we will email you before launch with early access details.
          </span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex" }}>
          {[P.ind, P.grn, "#F59E0B", "#EF4444"].map((c, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `2px solid ${P.bg}`, marginLeft: i ? -6 : 0, zIndex: 4 - i, position: "relative" }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: P.t3 }}>
          <span style={{ color: P.grn, fontWeight: 700 }}><C n={847} /></span>{" "}professionals preparing smarter
        </span>
      </div>
    </div>
  );
}

// ─── Feature proofs ───────────────────────────────────────────────────────────
const FEATURE_PROOFS = [
  {
    id: "socratic", t: "Socratic AI Coaching", c: P.ind,
    d: "A coach that doesn't just give answers. It asks follow-up questions so you can explain your thinking clearly.",
    mechanism: "You get guided questions before seeing a model answer.",
    outcome: "You get better at explaining your choices with confidence.",
  },
  {
    id: "diagram", t: "Visual System Design", c: P.grn,
    d: "Simple diagrams show how data moves through a system, so complex topics feel easier to explain.",
    mechanism: "Visual maps show where issues start and how they spread.",
    outcome: "You can explain system decisions in plain language.",
  },
  {
    id: "missions", t: "Real-World Missions", c: P.ind,
    d: "No toy prompts. Practice realistic interview situations you are likely to face on the job.",
    mechanism: "Each mission includes a simple rubric and answer structure.",
    outcome: "You learn a repeatable way to solve open-ended problems.",
  },
  {
    id: "scoring", t: "Scored on Your Thinking", c: P.grn,
    d: "Feedback focuses on your thinking and communication, not just whether code runs.",
    mechanism: "Scores are broken into clear parts like logic and communication.",
    outcome: "You quickly see what to improve before your next interview.",
  },
  {
    id: "retention", t: "Built-In Retention", c: P.ind,
    d: "Questions you miss come back at the right time so you actually remember key ideas.",
    mechanism: "Missed topics resurface on a simple review schedule.",
    outcome: "You retain concepts longer instead of forgetting after one session.",
  },
  {
    id: "progression", t: "Clear Progression", c: P.grn,
    d: "Courses build step by step, so you always know what to do next.",
    mechanism: "You unlock advanced practice after finishing the basics.",
    outcome: "You improve in a clear order without feeling lost.",
  },
];

function FeatureIcon({ id, c }) {
  if (id === "socratic") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  if (id === "diagram") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (id === "missions") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  if (id === "scoring") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  if (id === "retention") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>;
}

function FeatureDemo({ id }) {
  if (id === "socratic") return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 12, color: P.t2, background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 8, padding: "10px 12px", lineHeight: 1.6 }}>
        AI: Why do you think this is a tracking issue and not normal weekend behavior?
      </div>
      <div style={{ fontSize: 12, color: P.t2, background: "rgba(52,211,153,.07)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 8, padding: "10px 12px", lineHeight: 1.6 }}>
        You: The drop started right after deploy and mostly affected checkout events.
      </div>
    </div>
  );
  if (id === "diagram") return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1fr auto", alignItems: "center", gap: 8, fontSize: 11, color: P.t2, fontFamily: "var(--mono)" }}>
      <span style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: "6px 8px" }}>Events</span>
      <span style={{ opacity: 0.5, textAlign: "center" }}>→</span>
      <span style={{ border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "6px 8px", color: "#FCA5A5" }}>Lag</span>
      <span style={{ opacity: 0.5, textAlign: "center" }}>→</span>
      <span style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: "6px 8px" }}>Dashboard</span>
    </div>
  );
  if (id === "missions") return (
    <div style={{ fontSize: 12, color: P.t2, lineHeight: 1.6 }}>
      Mission: Signups dropped 25% after Friday release.
      <div style={{ marginTop: 8, color: P.grn }}>
        Great answers include: check data quality, split the issue by user group, pick a top hypothesis, and explain next steps.
      </div>
    </div>
  );
  if (id === "scoring") return (
    <div style={{ display: "grid", gap: 6 }}>
      {[["Reasoning", "88%"], ["Assumptions", "74%"], ["Communication", "91%"]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
          <span style={{ color: P.t2 }}>{k}</span>
          <span style={{ color: P.grn, fontWeight: 700 }}>{v}</span>
        </div>
      ))}
    </div>
  );
  if (id === "retention") return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["Day 1: replay", "Day 3: harder variant", "Day 8: cross-topic case"].map(s => (
        <span key={s} style={{ fontSize: 11, color: P.t2, border: `1px solid ${P.border}`, borderRadius: 999, padding: "5px 10px", fontFamily: "var(--mono)" }}>{s}</span>
      ))}
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {[["Python basics", true], ["SQL joins", true], ["Product Sense (unlocked)", true, P.grn], ["System Design (locked)", false]].map(([label, done, color]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: color || (done ? P.t2 : P.dim), fontFamily: "var(--mono)" }}>
          {done && color !== P.dim && <Check size={11} strokeWidth={2.5} style={{ color: color || P.grn }} />}
          {label}
        </div>
      ))}
    </div>
  );
}

// ─── Mission Sprint ───────────────────────────────────────────────────────────
function MissionSprint({ track }) {
  const [choice, setChoice] = useState(null);
  const outcomes = {
    deploy: { score: "84%", text: "Strong start. Next, compare iOS vs Android impact before recommending a rollback." },
    seasonality: { score: "52%", text: "Possible, but you need data from past weekends to support this." },
    pricing: { score: "61%", text: "Good thought. Gather user behavior evidence before changing pricing." },
  };

  const [ref, visible] = useInView(0.15);

  return (
    <section id="try-mission" className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 48px 70px", position: "relative", zIndex: 1 }}>
      <div ref={ref} style={{
        background: "linear-gradient(135deg, rgba(99,102,241,.06) 0%, rgba(99,102,241,.02) 100%)",
        border: "1px solid rgba(99,102,241,.2)", borderRadius: 20,
        padding: "clamp(24px,4vw,40px) clamp(20px,4vw,36px)",
        boxShadow: "inset 0 1px 0 rgba(99,102,241,.15)",
        ...rev(visible, 0),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: P.ind, animation: "pulseGlowDot 2s ease infinite" }} />
          <span style={{ fontSize: 11, color: P.ind, fontFamily: "var(--mono)", letterSpacing: 1.8, fontWeight: 700 }}>TRY A 30-SECOND MISSION</span>
        </div>
        <div style={{ fontSize: "clamp(18px,3vw,22px)", color: P.t1, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>
          Signups dropped 25% this weekend. What would you check first?
        </div>
        <div style={{ fontSize: 13, color: P.t3, marginBottom: 20, lineHeight: 1.6 }}>
          Pick one option to see the kind of feedback you get inside DataSpark.
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {[
            ["deploy", "A Friday deploy may have broken checkout tracking or flow"],
            ["seasonality", "This could be a normal weekend dip"],
            ["pricing", "A recent pricing change may have reduced intent"],
          ].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={choice === id}
              onClick={() => { setChoice(id); void track("mission_preview_choice", { location: "landing_mission", hypothesis: id }); }}
              className="mission-choice"
              style={{
                textAlign: "left",
                background: choice === id ? "rgba(52,211,153,.1)" : "rgba(255,255,255,.02)",
                border: choice === id ? "1px solid rgba(52,211,153,.4)" : `1px solid ${P.border}`,
                borderRadius: 12, padding: "14px 18px", color: choice === id ? P.t1 : P.t2,
                cursor: "pointer", fontSize: 13, lineHeight: 1.5,
                transform: choice === id ? "translateX(4px)" : "none",
                transition: `all 0.25s ${EASE}`,
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                border: choice === id ? "2px solid rgba(52,211,153,.6)" : `2px solid ${P.dim}`,
                background: choice === id ? "rgba(52,211,153,.15)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: `all 0.2s ${EASE}`,
              }}>
                {choice === id && <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.grn }} />}
              </span>
              {label}
            </button>
          ))}
        </div>

        {choice && (
          <div id="mission-feedback" aria-live="polite" role="status"
            key={choice}
            className="mission-feedback-enter"
            style={{
              background: "rgba(2,6,23,.6)", border: `1px solid ${P.border}`,
              borderRadius: 14, padding: "16px 18px", marginBottom: 20,
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: P.t3, fontFamily: "var(--mono)" }}>AI feedback preview</span>
              <span style={{ color: P.grn, fontWeight: 800, fontSize: 13 }}>Score: {outcomes[choice].score}</span>
            </div>
            <div style={{ color: P.t2, fontSize: 13, lineHeight: 1.7 }}>{outcomes[choice].text}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/preview"
            className="mission-cta"
            onClick={() => void track("preview_route_click", { location: "landing_mission", href: "/preview" })}
            style={{
              background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "12px 20px", fontWeight: 700, fontSize: 13,
              boxShadow: "0 4px 20px rgba(99,102,241,.4)", display: "inline-flex", alignItems: "center", gap: 7,
            }}>
            Open Product Preview <ArrowRight size={14} />
          </Link>
          <a href="#join" className="mission-cta"
            onClick={(e) => {
              e.preventDefault();
              void track("hero_cta_click", { location: "landing_mission", href: "#join" });
              document.getElementById("join")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              background: "transparent", color: P.t2, textDecoration: "none",
              borderRadius: 12, padding: "11px 18px", border: `1px solid ${P.border}`,
              fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center",
            }}>
            Get full missions in early access
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function DS8() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [activeProof, setActiveProof] = useState("socratic");
  const [sY, setSY] = useState(0);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => { const f = () => setSY(window.scrollY); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 60); return () => clearTimeout(t); }, []);

  // Section scroll reveals
  const [statsRef, statsVisible] = useInView(0.3);
  const [howRef, howVisible] = useInView(0.1);
  const [featRef, featVisible] = useInView(0.08);
  const [testRef, testVisible] = useInView(0.1);
  const [compRef, compVisible] = useInView(0.12);
  const [courseRef, courseVisible] = useInView(0.15);
  const [ctaRef, ctaVisible] = useInView(0.2);

  const track = async (eventName, metadata) => {
    await safeLogClientEvent({ eventName, page: routeLocation.pathname, metadata });
  };

  const go = async (placement) => {
    if (busy) return;
    const funnelLocation = placement === "final" ? "final" : "hero";
    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) {
      setEmailError("Enter a valid email address to secure your spot.");
      void track("form_submit_error", { location: funnelLocation, reason: "invalid_email", email_domain: emailDomainFromEmail(cleanEmail) });
      return;
    }
    setEmailError("");
    setBusy(true);

    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      setEmailError("Waitlist is temporarily unavailable. Please try again in a few minutes.");
      void track("form_submit_error", { location: funnelLocation, reason: "missing_supabase_env", email_domain: emailDomainFromEmail(cleanEmail) });
      setBusy(false);
      return;
    }

    const normalizedEmail = cleanEmail.toLowerCase();
    const { error } = await supabase.from("waitlist_signups").insert({ email: normalizedEmail, source: "landing_v8" });

    if (error) {
      if (import.meta.env.DEV) console.error("[DataSpark waitlist] insert failed:", error);
      const isDuplicate = error.code === "23505" || (error.message||"").toLowerCase().includes("duplicate") || (error.message||"").toLowerCase().includes("unique");
      setEmailError(isDuplicate ? "You are already on the waitlist — we will keep you posted." : waitlistErrorMessage(error));
      void track("form_submit_error", { location: funnelLocation, reason: isDuplicate ? "duplicate_email" : "supabase_insert_failed", supabase_code: error.code, email_domain: emailDomainFromEmail(normalizedEmail) });
      setBusy(false);
      return;
    }

    void track("form_submit_success", { location: funnelLocation, email_domain: emailDomainFromEmail(normalizedEmail) });
    setDone(true);
    setBusy(false);
    navigate("/thank-you");
  };

  const ctaProps = { email, setEmail, emailError, setEmailError, done, busy, track, go };

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.t1, fontFamily: "var(--sans)", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --sans: 'Manrope', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(99,102,241,.25); color: #fff; }
        html { scroll-behavior: smooth; }
        [id] { scroll-margin-top: 80px; }
        input:focus { outline: none; border-color: ${P.indB} !important; box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important; }
        button:focus-visible, a:focus-visible, input:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,.35) !important;
          border-color: ${P.indB} !important;
        }

        /* ── Keyframes ── */
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-10px) rotate(0.4deg); }
          66%       { transform: translateY(-5px) rotate(-0.2deg); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15); }
          50%     { box-shadow: 0 8px 40px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.2); }
        }
        @keyframes pulseGlowDot {
          0%,100% { opacity:1; transform:scale(1); box-shadow:0 0 0 0 rgba(129,140,248,.5); }
          50%     { opacity:.8; transform:scale(1.1); box-shadow:0 0 0 5px rgba(129,140,248,.0); }
        }
        @keyframes gradientFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes slideInUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes lineGrow {
          from { width:0; opacity:0; }
          to   { width:100%; opacity:1; }
        }
        @keyframes ringPulse {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity:0.12; }
          100% { transform: translate(-50%,-50%) scale(1.4); opacity:0; }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position:  200% center; }
        }

        /* ── Utility classes ── */
        .logo-marquee-track { animation: marquee 32s linear infinite; }
        .hero-card-float { animation: float 8s ease-in-out infinite; }
        .header-cta-breathe { animation: pulseGlow 3s ease infinite; }
        .grad-text {
          background: linear-gradient(135deg, #818CF8 0%, #34D399 50%, #818CF8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 6s ease infinite;
        }
        .mission-feedback-enter { animation: slideInUp 0.35s cubic-bezier(0.23,1,0.32,1) both; }
        .feat-card {
          transition: transform 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s ease, border-color 0.2s ease !important;
        }
        .feat-card:hover { transform: translateY(-4px) !important; }
        .nav-link {
          transition: color 0.2s ease;
          color: #94A3B8;
        }
        .nav-link:hover { color: #F8FAFC !important; }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .logo-marquee-track, .hero-card-float, .header-cta-breathe, .grad-text { animation: none !important; }
          * { transition-duration: 0.001ms !important; }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hero-grid    { flex-direction: column !important; gap: 48px !important; padding-top: 110px !important; min-height: auto !important; }
          .hero-left    { max-width: 100% !important; }
          .hero-right   { display: flex; justify-content: center; }
          .nav-links    { display: none !important; }
          .cta-row      { flex-direction: column !important; }
          .cta-input    { width: 100% !important; }
          .cta-btn      { width: 100% !important; padding: 16px !important; }
          .feat-grid    { grid-template-columns: 1fr !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .before-after { grid-template-columns: 1fr !important; }
          .before-after-arrow { display: none !important; }
          .section-pad  { padding-left: 24px !important; padding-right: 24px !important; }
          .head-pad     { padding: 12px 20px !important; }
          .stat-grid    { gap: 24px !important; }
          .hero-card-tab { min-height: 44px; }
          .header-cta-safe { min-height: 44px; display: inline-flex !important; align-items: center; justify-content: center; padding: 12px 20px !important; }
          .mission-choice { min-height: 44px; }
          .mission-cta  { min-height: 44px; display: inline-flex !important; align-items: center; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .feat-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Atmosphere ─────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {/* Top-center hero glow */}
        <div style={{ position: "absolute", width: 900, height: 500, left: "50%", top: "-10%", transform: "translateX(-50%)", background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
        {/* Bottom-right green accent */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)", bottom: "5%", right: "-5%" }} />
        {/* Subtle dot grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.018,
          backgroundImage: "radial-gradient(circle, #818CF8 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: sY > 40 ? "rgba(2,6,23,0.92)" : "transparent",
        backdropFilter: sY > 40 ? "blur(20px)" : "none",
        WebkitBackdropFilter: sY > 40 ? "blur(20px)" : "none",
        borderBottom: sY > 40 ? `1px solid ${P.border}` : "1px solid transparent",
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
      }}>
        <div className="head-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <Logo />
            <span style={{ fontSize: 17, fontWeight: 800, color: P.t1, letterSpacing: "-.3px", whiteSpace: "nowrap" }}>DataSpark</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {["How it works", "Features", "Courses"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                  className="nav-link"
                  style={{ fontSize: 13.5, textDecoration: "none", fontWeight: 500 }}
                >{l}</a>
              ))}
            </div>
            <a href="#join" className="header-cta-breathe header-cta-safe"
              onClick={(e) => {
                e.preventDefault();
                void track("hero_cta_click", { location: "hero", href: "#join" });
                document.getElementById("join")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                borderRadius: 10, padding: "10px 22px", color: "#fff", fontSize: 13, fontWeight: 700,
                textDecoration: "none", whiteSpace: "nowrap",
              }}>
              Secure Your Spot
            </a>
          </div>
        </div>
      </header>

      {/* ═══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="hero-grid section-pad" style={{
        maxWidth: 1200, margin: "0 auto", padding: "160px 48px 90px",
        display: "flex", alignItems: "center", gap: 56, minHeight: "100vh",
        position: "relative", zIndex: 1,
      }}>
        <div className="hero-left" style={{ flex: "1 1 55%", maxWidth: 580 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 999, padding: "7px 16px",
            ...rev(heroReady, 0, 12),
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.ind, animation: "pulseGlowDot 2.5s ease infinite" }} />
            <span style={{ fontSize: 12, color: P.ind, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 0.5 }}>Early access · Q3 2026 launch</span>
          </div>

          <h1 style={{
            fontSize: "clamp(38px,7vw,76px)", fontWeight: 800, lineHeight: 1.04,
            letterSpacing: "-2.5px", marginBottom: 24,
            ...rev(heroReady, 60),
          }}>
            Stop memorizing{" "}
            <span style={{ color: P.dim, position: "relative" }}>
              syntax.
              <span style={{
                position: "absolute", bottom: 4, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg, #EF4444, transparent)",
                borderRadius: 2, opacity: 0.55,
                animation: heroReady ? `lineGrow 0.6s 0.5s ${EASE} both` : "none",
              }} />
            </span>
            <br />Start solving{" "}
            <span className="grad-text">systems.</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px,2vw,17px)", color: P.t2, fontWeight: 400,
            lineHeight: 1.7, maxWidth: 500, marginBottom: 38,
            ...rev(heroReady, 120),
          }}>
            Most platforms train you to solve isolated coding questions. Real interviews ask you to investigate business problems and explain your thinking clearly. DataSpark helps you do both.
          </p>

          <div id="join" style={rev(heroReady, 180)}>
            <WaitlistCTA placement="hero" {...ctaProps} />
          </div>

          {/* Perks box */}
          <div style={{
            marginTop: 24,
            background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.2)",
            borderRadius: 14, padding: "16px 20px", maxWidth: 520,
            ...rev(heroReady, 240),
          }}>
            <div style={{ fontSize: 10, color: P.ind, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: 1.6, marginBottom: 10 }}>
              EARLY ACCESS INCLUDES
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                "Full access to all 9 launch courses and 285+ scenarios",
                "AI reasoning feedback and mission scorecards",
                "Founding member pricing before public launch (Q3 2026)",
              ].map((perk, i) => (
                <div key={i} style={{ fontSize: 12.5, color: P.t2, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <Check size={13} strokeWidth={2.5} style={{ color: P.grn, flexShrink: 0, marginTop: 2 }} />
                  {perk}
                </div>
              ))}
            </div>
            <Link to="/preview"
              onClick={() => void track("preview_route_click", { location: "hero_perks", href: "/preview" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
                fontSize: 12.5, color: "#fff", background: "rgba(99,102,241,.75)",
                borderRadius: 8, padding: "8px 14px", textDecoration: "none", fontWeight: 700,
                transition: `background 0.2s ${EASE}`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,.95)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,.75)"}
            >
              Explore product preview <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="hero-right" style={{ flex: "1 1 45%", display: "flex", justifyContent: "center" }}>
          <HeroCard visible={heroReady} />
        </div>
      </section>

      {/* ═══ STATS STRIP ════════════════════════════════════════════════════════ */}
      <div ref={statsRef} style={{
        borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`,
        position: "relative", zIndex: 1,
        ...rev(statsVisible, 0),
      }}>
        <div className="stat-grid" style={{
          maxWidth: 1200, margin: "0 auto", padding: "28px 48px",
          display: "flex", justifyContent: "center", gap: "clamp(32px,6vw,100px)", flexWrap: "wrap",
        }}>
          {[
            { n: 285, suffix: "+", label: "interview scenarios" },
            { n: 9, suffix: "", label: "complete courses" },
            { n: 847, suffix: "+", label: "data professionals" },
          ].map(({ n, suffix, label }, i) => (
            <div key={i} style={{ textAlign: "center", ...rev(statsVisible, i * 80) }}>
              <div style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: P.t1, letterSpacing: "-1.5px", lineHeight: 1 }}>
                <C n={n} trigger={statsVisible} />{suffix}
              </div>
              <div style={{ fontSize: 12, color: P.t3, fontFamily: "var(--mono)", marginTop: 6, letterSpacing: 0.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Logo Marquee ──────────────────────────────────────────────────────── */}
      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 64px", position: "relative", zIndex: 1 }}>
        <LogoMarquee />
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-pad" ref={howRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 52, ...rev(howVisible, 0) }}>
          <div style={{ fontSize: 11, color: P.ind, fontWeight: 700, marginBottom: 12, fontFamily: "var(--mono)", letterSpacing: 2 }}>THE SHIFT</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15 }}>
            From{" "}
            <span style={{ color: P.dim }}>code that compiles</span>
            {" "}to{" "}
            <span className="grad-text">logic that convinces</span>
          </h2>
        </div>
        <div className="before-after" style={{
          display: "grid", gridTemplateColumns: "1fr 52px 1fr", alignItems: "stretch",
          ...rev(howVisible, 120),
        }}>
          {/* Left: old way */}
          <div style={{
            background: "linear-gradient(135deg, rgba(239,68,68,.04) 0%, transparent 60%)",
            border: "1px solid rgba(239,68,68,.1)", borderRadius: 18,
            padding: "clamp(20px,3vw,36px) clamp(18px,2.5vw,30px)",
          }}>
            <div style={{ fontSize: 10, color: "#EF4444", fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 22 }}>STANDARD PLATFORMS</div>
            {[
              ["Write a JOIN query", "You get a checkmark. No one asks why you chose LEFT over INNER."],
              ["Implement logistic regression", "model.fit(X, y) — the autograder says 'pass.' But could you explain the tradeoffs?"],
              ["Calculate the mean", "Isolated problem, isolated answer. No business context, no follow-up."],
            ].map(([q, a], i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12.5, color: P.t3, fontStyle: "italic", marginBottom: 4 }}>"{q}"</div>
                <div style={{ fontSize: 12, color: P.t2, lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>

          {/* Middle arrow */}
          <div className="before-after-arrow" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,.04)", border: `1px solid ${P.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", color: P.t3,
            }}>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Right: DataSpark way */}
          <div style={{
            background: "linear-gradient(135deg, rgba(52,211,153,.05) 0%, transparent 60%)",
            border: "1px solid rgba(52,211,153,.1)", borderRadius: 18,
            padding: "clamp(20px,3vw,36px) clamp(18px,2.5vw,30px)",
          }}>
            <div style={{ fontSize: 10, color: P.grn, fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 22 }}>DATASPARK</div>
            {[
              ["Churn spiked 15% in EMEA", "You segment the data, check the pipeline, build a cohort analysis, and walk the VP through your findings."],
              ["Build or buy ML monitoring?", "You weigh team capacity against vendor cost and present a recommendation the CTO would actually act on."],
              ["A/B test shows contradictory metrics", "You identify the clickbait pattern, propose an extended test, and align two teams who disagree."],
            ].map(([q, a], i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12.5, color: P.t1, fontStyle: "italic", marginBottom: 4 }}>"{q}"</div>
                <div style={{ fontSize: 12, color: P.grn, lineHeight: 1.6, opacity: .9 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section id="features" className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 52, ...rev(featVisible, 0) }} ref={featRef}>
          <div style={{ fontSize: 11, color: P.grn, fontWeight: 700, marginBottom: 12, fontFamily: "var(--mono)", letterSpacing: 2 }}>YOUR ADVANTAGE</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15 }}>
            The skills that get you past{" "}
            <span style={{ color: P.dim }}>the coding round</span>
            {" "}and into{" "}
            <span className="grad-text">the senior offer</span>
          </h2>
        </div>
        <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {FEATURE_PROOFS.map((f, i) => {
            const isOpen = activeProof === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`feature-proof-${f.id}`}
                className="feat-card"
                onClick={() => {
                  setActiveProof(prev => prev === f.id ? "" : f.id);
                  void track("feature_proof_toggle", { location: "features", feature_id: f.id, open: activeProof !== f.id });
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${f.c}60`;
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${f.c}20 inset`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isOpen ? f.c : P.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  background: isOpen ? `${f.c}08` : P.card,
                  border: `1px solid ${isOpen ? f.c : P.border}`,
                  borderRadius: 18, padding: "clamp(20px,3vw,28px) clamp(18px,2.5vw,24px)",
                  cursor: "pointer", textAlign: "left", color: P.t1,
                  ...rev(featVisible, 60 + i * 70),
                }}
              >
                {/* Icon container */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.c}12`, border: `1px solid ${f.c}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <FeatureIcon id={f.id} c={f.c} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: P.t1, marginBottom: 8 }}>{f.t}</div>
                <div style={{ fontSize: 13, color: P.t3, lineHeight: 1.7, marginBottom: 12 }}>{f.d}</div>
                <div style={{ fontSize: 11, color: f.c, fontFamily: "var(--mono)", letterSpacing: 1, display: "flex", alignItems: "center", gap: 5 }}>
                  {isOpen ? "HIDE PROOF" : "VIEW PROOF"}
                  <ArrowRight size={11} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: `transform 0.2s ${EASE}` }} />
                </div>

                {/* Expandable proof section */}
                <div
                  id={`feature-proof-${f.id}`}
                  role="region"
                  aria-label={`${f.t} micro-proof`}
                  style={{
                    maxHeight: isOpen ? 400 : 0,
                    overflow: "hidden",
                    transition: `max-height 0.4s ${EASE}`,
                  }}
                >
                  <div style={{ paddingTop: 16, borderTop: `1px solid ${P.border}`, marginTop: 14 }}>
                    <div style={{ fontSize: 10, color: P.dim, fontFamily: "var(--mono)", marginBottom: 10, letterSpacing: 1.5 }}>MICRO-PROOF</div>
                    <FeatureDemo id={f.id} />
                    <div style={{ marginTop: 12, fontSize: 12, color: P.t2 }}>Mechanism: <span style={{ color: P.t3 }}>{f.mechanism}</span></div>
                    <div style={{ marginTop: 4, fontSize: 12, color: P.t2 }}>Outcome: <span style={{ color: P.grn }}>{f.outcome}</span></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <section className="section-pad" ref={testRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 48px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48, ...rev(testVisible, 0) }}>
          <div style={{ fontSize: 11, color: P.ind, fontWeight: 700, marginBottom: 12, fontFamily: "var(--mono)", letterSpacing: 2 }}>FROM EARLY TESTERS</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.2 }}>
            People use DataSpark to practice<br />real interview thinking
          </h2>
        </div>
        <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { n: "Priya K.", r: "Data Analyst · 2 YOE", cohort: "March 2026 cohort", result: "Felt more confident in product rounds within 3 weeks", q: "I stopped freezing in product rounds because the missions felt close to what interviewers actually ask.", avatar: ["#6366F1", "#818CF8"] },
            { n: "Marcus T.", r: "ML Engineer · Series B SaaS", cohort: "February 2026 cohort", result: "Got clearer and more structured answers in mock interviews", q: "The feedback showed me where my logic was weak, not just where my code had issues.", avatar: ["#0EA5E9", "#38BDF8"] },
            { n: "Sarah L.", r: "Analytics Manager · Marketplace", cohort: "January 2026 cohort", result: "Could explain trade-offs more clearly in system discussions", q: "I finally had a clear way to balance business impact and technical choices.", avatar: ["#10B981", "#34D399"] },
          ].map((t, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${P.border}`,
              borderRadius: 18, padding: "28px 26px",
              position: "relative", overflow: "hidden",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              ...rev(testVisible, 80 + i * 90),
            }}>
              {/* Decorative quote mark */}
              <div style={{
                position: "absolute", top: 12, right: 20,
                fontSize: 72, lineHeight: 1, color: P.t1, opacity: 0.03,
                fontFamily: "Georgia, serif", userSelect: "none", pointerEvents: "none",
              }}>"</div>

              {/* Stars */}
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {[...Array(5)].map((_, si) => (
                  <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: 14, color: P.t2, lineHeight: 1.75, marginBottom: 24, fontStyle: "italic", position: "relative" }}>
                "{t.q}"
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${t.avatar[0]}, ${t.avatar[1]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                }}>
                  {t.n.split(" ").map(x => x[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: P.t1 }}>{t.n}</div>
                  <div style={{ fontSize: 11.5, color: P.t3, marginTop: 1 }}>{t.r}</div>
                </div>
              </div>

              {/* Outcome */}
              <div style={{
                padding: "10px 14px",
                background: "rgba(52,211,153,.06)", borderRadius: 10,
                border: "1px solid rgba(52,211,153,.15)",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <Check size={13} strokeWidth={2.5} style={{ color: P.grn, flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: P.grn, lineHeight: 1.5 }}>{t.result}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MISSION SPRINT ════════════════════════════════════════════════════ */}
      <MissionSprint track={track} />

      {/* ═══ COMPARISON TABLE ══════════════════════════════════════════════════ */}
      <section className="section-pad" ref={compRef} style={{ maxWidth: 780, margin: "0 auto", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 44, ...rev(compVisible, 0) }}>
          <div style={{ fontSize: 11, color: "#F5A623", fontWeight: 700, marginBottom: 12, fontFamily: "var(--mono)", letterSpacing: 2 }}>THE DIFFERENCE</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-1px" }}>The Code Grind vs. The Decision Lab</h2>
        </div>
        <div className="compare-grid" style={{
          background: "rgba(255,255,255,0.02)", border: `1px solid ${P.border}`,
          borderRadius: 18, overflow: "hidden",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          ...rev(compVisible, 100),
        }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 24px", borderBottom: `1px solid ${P.border}`, background: "rgba(255,255,255,.02)" }}>
            <span style={{ fontSize: 10, color: P.dim, fontFamily: "var(--mono)", fontWeight: 700 }}></span>
            <span style={{ fontSize: 10, color: "#EF4444", fontFamily: "var(--mono)", fontWeight: 700, textAlign: "center", letterSpacing: 1.5 }}>THE GRIND</span>
            <span style={{ fontSize: 10, color: P.ind, fontFamily: "var(--mono)", fontWeight: 800, textAlign: "center", letterSpacing: 1.5 }}>DATASPARK</span>
          </div>
          {[
            ["Tests for", "Does the code run?", "Does the logic hold up?"],
            ["Feedback", "Pass / fail", "Here's where your reasoning broke"],
            ["Problems", "Write a GROUP BY", "Diagnose why EMEA churned 15%"],
            ["AI role", "Shows you the answer", "Asks you 'why?' until you get it"],
            ["Prepares for", "The coding screen", "System design + product round"],
            ["Outcome", "You can write queries", "You can lead a data team"],
          ].map(([d, s, ds], i, a) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "13px 24px",
              borderBottom: i < a.length - 1 ? `1px solid rgba(255,255,255,.03)` : "none",
              transition: `background 0.15s ${EASE}`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.025)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 12.5, color: P.t3, fontWeight: 500 }}>{d}</span>
              <span style={{ fontSize: 12, color: P.dim, textAlign: "center", fontFamily: "var(--mono)" }}>{s}</span>
              <span style={{ fontSize: 12, color: P.grn, textAlign: "center", fontFamily: "var(--mono)", fontWeight: 600 }}>{ds}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COURSES ═══════════════════════════════════════════════════════════ */}
      <section id="courses" className="section-pad" ref={courseRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 90px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ ...rev(courseVisible, 0) }}>
          <div style={{ fontSize: 11, color: P.ind, fontWeight: 700, marginBottom: 12, fontFamily: "var(--mono)", letterSpacing: 2 }}>9 COURSES · 285+ SCENARIOS</div>
          <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-.5px", marginBottom: 36, lineHeight: 1.2 }}>
            Python to system design.<br />Syntax to strategy.
          </h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {[
            [<Code2 size={15} />, "Python", "#10B981"],
            [<Database size={15} />, "SQL", "#F59E0B"],
            [<BarChart3 size={15} />, "Statistics", "#8B5CF6"],
            [<Brain size={15} />, "ML", "#0EA5E9"],
            [<Cpu size={15} />, "Deep Learning", "#818CF8"],
            [<Sparkles size={15} />, "GenAI", "#34D399"],
            [<PieChart size={15} />, "Product Sense", "#F59E0B"],
            [<Network size={15} />, "Architecture", "#0EA5E9"],
            [<Settings2 size={15} />, "MLOps", "#10B981"],
          ].map(([ic, nm, accent], i) => (
            <div key={i} style={{
              background: courseVisible ? `${accent}0d` : P.card,
              border: courseVisible ? `1px solid ${accent}28` : `1px solid ${P.border}`,
              borderRadius: 10, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8, cursor: "default",
              color: accent,
              opacity: courseVisible ? 1 : 0,
              transform: courseVisible ? "none" : "translateY(16px) scale(0.96)",
              transition: `opacity 0.5s ${120 + i * 50}ms ${EASE}, transform 0.5s ${120 + i * 50}ms ${EASE}, background 0.25s ${EASE}, border-color 0.25s ${EASE}`,
            }}>
              {ic}
              <span style={{ fontSize: 13, fontWeight: 700, color: P.t2 }}>{nm}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════════════════ */}
      <section className="section-pad" ref={ctaRef} style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 110px", textAlign: "center", position: "relative", zIndex: 1, overflow: "hidden" }}>
        {/* Animated ring */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          border: "1px solid rgba(99,102,241,.07)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          animation: ctaVisible ? `ringPulse 4s ease-out infinite` : "none",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          border: "1px solid rgba(99,102,241,.04)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          animation: ctaVisible ? `ringPulse 4s 2s ease-out infinite` : "none",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ ...rev(ctaVisible, 0) }}>
            <div style={{ fontSize: 11, color: P.t3, fontFamily: "var(--mono)", letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>START TODAY</div>
            <h2 style={{ fontSize: "clamp(30px,6vw,60px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.08, marginBottom: 18 }}>
              Pass the senior-level interview
              <br />
              <span className="grad-text">before your first job.</span>
            </h2>
          </div>
          <p style={{ fontSize: "clamp(14px,1.5vw,16px)", color: P.dim, maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.7, ...rev(ctaVisible, 80) }}>
            AI can write the code. The market pays a premium for the person who knows what to build and why.
          </p>
          <div style={{ maxWidth: 460, margin: "0 auto", ...rev(ctaVisible, 160) }}>
            <WaitlistCTA center placement="final" {...ctaProps} />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="section-pad" style={{
        borderTop: `1px solid ${P.border}`, maxWidth: 1200, margin: "0 auto",
        padding: "24px 48px", display: "flex", justifyContent: "space-between",
        alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo />
          <span style={{ fontSize: 12, color: P.dim, fontFamily: "var(--mono)" }}>© 2026 DataSpark</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Contact", href: "/contact" }].map(link => (
            <Link key={link.label} to={link.href}
              onClick={() => void track("footer_link_click", { location: "footer", label: link.label, href: link.href })}
              style={{ fontSize: 12, color: P.dim, textDecoration: "none", fontFamily: "var(--mono)", transition: `color 0.2s ${EASE}` }}
              onMouseEnter={e => e.target.style.color = P.t2}
              onMouseLeave={e => e.target.style.color = P.dim}
            >{link.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
