import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATASPARK v8 — Mobile-First, Responsive, Final
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const P = { bg: "#020617", card: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", bH: "rgba(129,140,248,0.2)", t1: "#F8FAFC", t2: "#E2E8F0", t3: "#94A3B8", dim: "#475569", ind: "#818CF8", grn: "#34D399", indB: "#6366F1" };

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="20" cy="8" r="4" fill={P.ind}/><circle cx="10" cy="30" r="4" fill={P.grn}/>
    <circle cx="30" cy="30" r="4" fill={P.ind}/><circle cx="20" cy="20" r="4.5" fill="#E2E8F0"/>
    <line x1="20" y1="8" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5"/>
    <line x1="10" y1="30" x2="20" y2="20" stroke={P.grn} strokeWidth="2" opacity=".5"/>
    <line x1="30" y1="30" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5"/>
  </svg>
);

/* ── Marquee Trust Logos ── */
const LogoMarquee = () => {
  const logos = ["GOOGLE", "META", "AMAZON", "NETFLIX", "STRIPE", "APPLE", "UBER", "AIRBNB"];
  const doubled = [...logos, ...logos];
  return (
    <div style={{ overflow: "hidden", padding: "20px 0", borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`, position: "relative" }}>
      <div style={{ display: "flex", gap: 48, animation: "marquee 30s linear infinite", width: "max-content" }}>
        {doubled.map((n, i) => (
          <span key={i} style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, color: "#1E293B", letterSpacing: 2, opacity: .45, whiteSpace: "nowrap" }}>{n}</span>
        ))}
      </div>
    </div>
  );
};

/* ── Interactive Syntax vs Strategy ── */
const HeroCard = () => {
  const [mode, setMode] = useState("strategy");
  return (
    <div style={{
      background: "rgba(6,8,20,0.75)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
      border: `1px solid ${P.border}`, borderRadius: 18, overflow: "hidden", width: "100%", maxWidth: 420,
      boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${P.border}` }}>
        {[["syntax", "The Old Way"], ["strategy", "The DataSpark Way"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            flex: 1, padding: "11px 0", border: "none", cursor: "pointer",
            background: mode === k ? (k === "strategy" ? "rgba(52,211,153,.05)" : "rgba(239,68,68,.03)") : "transparent",
            color: mode === k ? (k === "strategy" ? P.grn : "#EF4444") : P.dim,
            fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: .8,
            borderBottom: mode === k ? `2px solid ${k === "strategy" ? P.grn : "#EF4444"}` : "2px solid transparent",
            transition: "all .3s",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "20px 18px", minHeight: 220 }}>
        {mode === "syntax" ? (
          <>
            <div style={{ fontSize: 8, color: "#EF4444", fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>PROMPT</div>
            <div style={{ fontSize: 11.5, color: P.t3, fontStyle: "italic", marginBottom: 14 }}>"Find top 5 customers by revenue"</div>
            <div style={{ background: "rgba(255,255,255,.02)", borderRadius: 7, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 10.5, color: "#546380", lineHeight: 1.7 }}>
              <span style={{ color: P.ind }}>SELECT</span> customer_id,<br/>
              {"  "}<span style={{ color: P.ind }}>SUM</span>(amount) <span style={{ color: P.ind }}>AS</span> rev<br/>
              <span style={{ color: P.ind }}>FROM</span> orders<br/>
              <span style={{ color: P.ind }}>GROUP BY</span> 1 <span style={{ color: P.ind }}>ORDER BY</span> 2 <span style={{ color: P.ind }}>DESC</span><br/>
              <span style={{ color: P.ind }}>LIMIT</span> 5;
            </div>
            <div style={{ marginTop: 12, fontSize: 9.5, color: "#EF4444", fontFamily: "var(--mono)", fontWeight: 600 }}>✓ Correct syntax · ✗ No context · ✗ No reasoning</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 8, color: P.grn, fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>PROMPT</div>
            <div style={{ fontSize: 11.5, color: P.t2, fontStyle: "italic", marginBottom: 14 }}>"Conversion dropped 25% over the weekend. Walk the VP through your investigation."</div>
            <div style={{ background: "rgba(52,211,153,.03)", borderRadius: 7, padding: "12px 14px", fontSize: 11, color: P.t3, lineHeight: 1.65 }}>
              <div style={{ color: P.grn, fontWeight: 700, fontSize: 9, marginBottom: 6 }}>YOUR RESPONSE:</div>
              1. First — is the data trustworthy? Check pipeline, recent deploys<br/>
              2. Segment the drop: iOS vs Android, new vs returning, by city<br/>
              3. Top hypothesis: Friday deploy broke the checkout flow<br/>
              4. Present findings + next steps to the VP with confidence levels
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9.5, color: P.grn, fontFamily: "var(--mono)", fontWeight: 600 }}>✓ Reasoning · ✓ Impact · ✓ Stakeholder-ready</span>
              <span style={{ background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 5, padding: "3px 8px", fontSize: 11, fontWeight: 800, color: P.grn }}>87%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const C = ({ n }) => { const [v, setV] = useState(0); useEffect(() => { const s = Date.now(); const f = () => { const p = Math.min((Date.now() - s) / 1500, 1); setV(Math.floor((1 - (1 - p) ** 3) * n)); if (p < 1) requestAnimationFrame(f); }; f(); }, [n]); return <>{v.toLocaleString()}</>; };

export default function DS8() {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  const [sY, setSY] = useState(0);
  useEffect(() => { const f = () => setSY(window.scrollY); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const go = async () => { if (!email.includes("@") || busy) return; setBusy(true); await new Promise(r => setTimeout(r, 1100)); setDone(true); setBusy(false); };

  const CTA = ({ center = false }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: center ? "center" : "flex-start", gap: 12, width: "100%" }}>
      {!done ? (
        <div className="cta-row" style={{ display: "flex", gap: 10, width: "100%" }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && go()}
            className="cta-input"
            style={{ background: "rgba(255,255,255,.035)", border: `1px solid ${P.border}`, borderRadius: 10, padding: "14px 16px", color: P.t1, fontSize: 14, fontFamily: "var(--mono)", flex: 1, minWidth: 0, transition: "all .3s" }} />
          <button onClick={go} disabled={busy || !email.includes("@")}
            className="cta-btn"
            style={{
              background: email.includes("@") ? P.indB : "rgba(255,255,255,.03)",
              border: "none", borderRadius: 10, padding: "14px 28px", minHeight: 56,
              color: email.includes("@") ? "#fff" : P.dim, fontSize: 14, fontWeight: 800,
              cursor: email.includes("@") ? "pointer" : "not-allowed",
              boxShadow: email.includes("@") ? "0 6px 24px rgba(99,102,241,.45)" : "none",
              transition: "all .3s", whiteSpace: "nowrap", flexShrink: 0,
            }}>{busy ? "Joining..." : "Secure Your Spot →"}</button>
        </div>
      ) : (
        <div style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: P.grn, fontWeight: 800 }}>✓</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: P.grn }}>You're in — first access, guaranteed.</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex" }}>
          {[P.ind, P.grn, "#F59E0B", "#EF4444"].map((c, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: `2px solid ${P.bg}`, marginLeft: i ? -5 : 0, zIndex: 4 - i, position: "relative" }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: P.t3 }}>
          <span style={{ color: P.grn, fontWeight: 700 }}><C n={847} /></span> professionals preparing smarter
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.t1, fontFamily: "var(--sans)", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--sans:'Manrope',system-ui,sans-serif;--mono:'JetBrains Mono',monospace}
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:rgba(99,102,241,.2);color:#fff}
        html{scroll-behavior:smooth}
        input:focus{outline:none;border-color:${P.indB}!important;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        @keyframes breathe{0%,100%{box-shadow:0 4px 16px rgba(99,102,241,.35)}50%{box-shadow:0 4px 28px rgba(99,102,241,.55)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* ═══ RESPONSIVE ═══ */
        @media(max-width:768px){
          .hero-grid{flex-direction:column!important;gap:40px!important;padding-top:120px!important;min-height:auto!important}
          .hero-left{max-width:100%!important}
          .hero-right{display:flex;justify-content:center}
          .nav-links{display:none!important}
          .cta-row{flex-direction:column!important}
          .cta-input{width:100%!important}
          .cta-btn{width:100%!important;padding:16px!important}
          .feat-grid{grid-template-columns:1fr!important}
          .compare-grid{grid-template-columns:1fr!important}
          .before-after{grid-template-columns:1fr!important}
          .before-after-arrow{display:none!important}
          .section-pad{padding-left:24px!important;padding-right:24px!important}
          .head-pad{padding:12px 24px!important}
        }
        @media(min-width:769px) and (max-width:1024px){
          .feat-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {/* Atmosphere */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", top: "-20%", left: "-8%" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)", bottom: "5%", right: "-3%" }} />
      </div>

      {/* ═══ HEADER — responsive: hides nav links on mobile ═══ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: sY > 40 ? "rgba(2,6,23,0.92)" : "transparent",
        backdropFilter: sY > 40 ? "blur(20px)" : "none",
        borderBottom: sY > 40 ? `1px solid ${P.border}` : "1px solid transparent",
        transition: "all .4s",
      }}>
        <div className="head-pad" style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <Logo /><span style={{ fontSize: 17, fontWeight: 800, color: P.t1, letterSpacing: "-.3px", whiteSpace: "nowrap" }}>DataSpark</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {["How it works", "Features", "Courses"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{ fontSize: 13.5, color: "#CBD5E1", textDecoration: "none", fontWeight: 500, transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#CBD5E1"}>{l}</a>
              ))}
            </div>
            <a href="#join" style={{
              background: P.indB, borderRadius: 8, padding: "10px 22px", color: "#fff", fontSize: 13, fontWeight: 700,
              textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,.35)", transition: "all .2s",
              animation: "breathe 3s ease infinite", whiteSpace: "nowrap",
            }}>Secure Your Spot</a>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="hero-grid section-pad" style={{
        maxWidth: 1200, margin: "0 auto", padding: "160px 48px 80px",
        display: "flex", alignItems: "center", gap: 56, minHeight: "100vh",
        position: "relative", zIndex: 1,
      }}>
        <div className="hero-left" style={{ flex: "1 1 55%", maxWidth: 560 }}>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 20 }}>
            Stop memorizing{" "}
            <span style={{ color: P.dim, position: "relative" }}>
              syntax.
              <span style={{ position: "absolute", bottom: 2, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#EF4444,transparent)", borderRadius: 2, opacity: .5 }} />
            </span>
            <br />Start solving{" "}
            <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>systems.</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 17px)", color: P.t2, fontWeight: 400, lineHeight: 1.65, maxWidth: 480, marginBottom: 36 }}>
            Traditional platforms drill you on queries — write this JOIN, fix this error. But top-tier interviews ask you to diagnose a 25% drop in users or decide which feature to build next. DataSpark teaches the logic behind the code.
          </p>

          <div id="join"><CTA /></div>
        </div>

        <div className="hero-right" style={{ flex: "1 1 45%" }}>
          <HeroCard />
        </div>
      </section>

      {/* ── Logo Marquee ── */}
      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 60px", position: "relative", zIndex: 1 }}>
        <LogoMarquee />
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: P.ind, fontWeight: 600, marginBottom: 10 }}>The shift</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
            From <span style={{ color: P.dim }}>code that compiles</span> to{" "}
            <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>logic that convinces</span>
          </h2>
        </div>
        <div className="before-after" style={{ display: "grid", gridTemplateColumns: "1fr 44px 1fr", alignItems: "stretch" }}>
          <div style={{ background: "rgba(239,68,68,.02)", border: "1px solid rgba(239,68,68,.08)", borderRadius: 16, padding: "clamp(20px,3vw,32px) clamp(16px,2.5vw,28px)" }}>
            <div style={{ fontSize: 10, color: "#EF4444", fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>STANDARD PLATFORMS</div>
            {[["Write a JOIN query","You get a checkmark. No one asks why you chose LEFT over INNER."],["Implement logistic regression","model.fit(X, y) — the autograder says 'pass.' But could you explain the tradeoffs?"],["Calculate the mean","Isolated problem, isolated answer. No business context, no follow-up."]].map(([q,a],i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginBottom: 3 }}>"{q}"</div>
                <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>→ {a}</div>
              </div>
            ))}
          </div>
          <div className="before-after-arrow" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: P.ind }}>→</div>
          </div>
          <div style={{ background: "rgba(52,211,153,.03)", border: "1px solid rgba(52,211,153,.08)", borderRadius: 16, padding: "clamp(20px,3vw,32px) clamp(16px,2.5vw,28px)" }}>
            <div style={{ fontSize: 10, color: P.grn, fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>DATASPARK</div>
            {[["Churn spiked 15% in EMEA","You segment the data, check the pipeline, build a cohort analysis, and walk the VP through your findings."],["Build or buy ML monitoring?","You weigh team capacity against vendor cost and present a recommendation the CTO would actually act on."],["A/B test shows contradictory metrics","You identify the clickbait pattern, propose an extended test, and align two teams who disagree."]].map(([q,a],i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: P.t2, fontStyle: "italic", marginBottom: 3 }}>"{q}"</div>
                <div style={{ fontSize: 11, color: P.grn, lineHeight: 1.55, opacity: .85 }}>→ {a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: P.grn, fontWeight: 600, marginBottom: 10 }}>Your advantage</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
            The skills that get you past<br /><span style={{ color: P.dim }}>the coding round</span> and into{" "}
            <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>the senior offer</span>
          </h2>
        </div>
        <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { t: "Socratic AI Coaching", d: "A tutor that doesn't just give answers. It challenges your logic, asks 'why?', and helps you defend your decisions — like a senior engineer would.", c: P.ind, ic: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.ind} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            { t: "Visual System Design", d: "Stop guessing how data flows. Interactive diagrams show you how real systems work, so you can explain them in any interview.", c: P.grn, ic: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            { t: "Real-World Missions", d: "No more vacuum problems. Solve real crises from companies like Uber and Netflix — broken funnels, failing pipelines, contradictory A/B tests.", c: P.ind, ic: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.ind} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
            { t: "Scored on Your Thinking", d: "Get evaluated on how you reason, not just whether the code runs. Our AI checks if a senior engineer would trust your analysis.", c: P.grn, ic: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
            { t: "Built-In Retention", d: "Questions you miss come back at the right time. Spaced repetition means you actually remember what you learned — weeks later.", c: P.ind, ic: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.ind} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> },
            { t: "Clear Progression", d: "Level-gated courses that build on each other. You always know what to learn next and exactly where your gaps are.", c: P.grn, ic: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
          ].map((f, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: "clamp(20px,3vw,28px) clamp(18px,2.5vw,24px)", transition: "all .3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.bH; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ marginBottom: 14 }}>{f.ic}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.t1, marginBottom: 6 }}>{f.t}</div>
              <div style={{ fontSize: 12.5, color: P.t3, lineHeight: 1.7 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="section-pad" style={{ maxWidth: 740, margin: "0 auto", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12, color: "#F5A623", fontWeight: 600, marginBottom: 10 }}>The difference</div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, letterSpacing: "-1px" }}>The Code Grind vs. The Decision Lab</h2>
        </div>
        <div className="compare-grid" style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 20px", borderBottom: `1px solid ${P.border}`, background: "rgba(255,255,255,.01)" }}>
            <span style={{ fontSize: 9, color: P.dim, fontFamily: "var(--mono)", fontWeight: 700 }}></span>
            <span style={{ fontSize: 9, color: P.dim, fontFamily: "var(--mono)", fontWeight: 700, textAlign: "center" }}>THE GRIND</span>
            <span style={{ fontSize: 9, color: P.ind, fontFamily: "var(--mono)", fontWeight: 800, textAlign: "center" }}>DATASPARK</span>
          </div>
          {[
            ["Tests for", "Does the code run?", "Does the logic hold up?"],
            ["Feedback", "Pass / fail", "Here's where your reasoning broke"],
            ["Problems", "Write a GROUP BY", "Diagnose why EMEA churned 15%"],
            ["AI role", "Shows you the answer", "Asks you 'why?' until you get it"],
            ["Prepares for", "The coding screen", "The system design + product round"],
            ["Outcome", "You can write queries", "You can lead a data team"],
          ].map(([d, s, ds], i, a) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "11px 20px", borderBottom: i < a.length - 1 ? "1px solid rgba(255,255,255,.02)" : "none" }}>
              <span style={{ fontSize: 12, color: P.t2, fontWeight: 500 }}>{d}</span>
              <span style={{ fontSize: 11, color: P.dim, textAlign: "center", fontFamily: "var(--mono)" }}>{s}</span>
              <span style={{ fontSize: 11, color: P.grn, textAlign: "center", fontFamily: "var(--mono)", fontWeight: 600 }}>{ds}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COURSES ═══ */}
      <section id="courses" className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 12, color: P.ind, fontWeight: 600, marginBottom: 10 }}>9 courses · 285+ scenarios</div>
        <h2 style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 800, letterSpacing: "-.5px", marginBottom: 28 }}>Python to system design. Syntax to strategy.</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {[["🐍","Python"],["🗄️","SQL"],["📐","Statistics"],["🧠","ML"],["🔮","Deep Learning"],["✨","GenAI"],["📊","Product Sense"],["🏗️","Architecture"],["⚙️","MLOps"]].map(([ic,nm],i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 9, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "default" }}>
              <span style={{ fontSize: 15 }}>{ic}</span><span style={{ fontSize: 12, fontWeight: 600 }}>{nm}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 100px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,.07) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(26px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 14, position: "relative" }}>
          Pass the senior-level interview<br />
          <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>before your first job.</span>
        </h2>
        <p style={{ fontSize: "clamp(14px,1.5vw,15px)", color: P.dim, maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.6 }}>AI can write the code. The market pays a premium for the person who knows what to build and why.</p>
        <div style={{ maxWidth: 440, margin: "0 auto" }}><CTA center /></div>
      </section>

      {/* Footer */}
      <footer className="section-pad" style={{ borderTop: `1px solid ${P.border}`, maxWidth: 1200, margin: "0 auto", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Logo /><span style={{ fontSize: 10, color: "#1E293B", fontFamily: "var(--mono)" }}>© 2026 DataSpark</span></div>
        <div style={{ display: "flex", gap: 20 }}>
          {["TikTok","LinkedIn","Twitter"].map(s => (
            <a key={s} href="#" style={{ fontSize: 10, color: "#334155", textDecoration: "none", fontFamily: "var(--mono)", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color="#E2E8F0"} onMouseLeave={e => e.target.style.color="#334155"}>{s}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
