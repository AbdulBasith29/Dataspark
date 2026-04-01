import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATASPARK v7 — FINAL
// bg: #020617 (Deep Midnight)
// accent: #818CF8 (Electric Indigo) / #34D399 (Cyber Lime)
// copy: PAS framework, power words, career outcomes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const P = {
  bg: "#020617",
  card: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.06)",
  bHover: "rgba(129,140,248,0.2)",
  t1: "#F8FAFC",
  t2: "#E2E8F0",
  t3: "#94A3B8",
  dim: "#475569",
  ind: "#818CF8",
  grn: "#34D399",
  indB: "#6366F1",
};

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="20" cy="8" r="4" fill={P.ind} /><circle cx="10" cy="30" r="4" fill={P.grn} />
    <circle cx="30" cy="30" r="4" fill={P.ind} /><circle cx="20" cy="20" r="4.5" fill="#E2E8F0" />
    <line x1="20" y1="8" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5" />
    <line x1="10" y1="30" x2="20" y2="20" stroke={P.grn} strokeWidth="2" opacity=".5" />
    <line x1="30" y1="30" x2="20" y2="20" stroke={P.ind} strokeWidth="2" opacity=".5" />
  </svg>
);

/* ── Interactive Syntax vs Strategy Toggle ── */
const SyntaxVsStrategy = () => {
  const [mode, setMode] = useState("strategy");
  return (
    <div style={{
      background: "rgba(6,8,20,0.8)", backdropFilter: "blur(32px)",
      border: `1px solid ${P.border}`, borderRadius: 20,
      padding: 0, width: "100%", maxWidth: 420, overflow: "hidden",
      boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
    }}>
      {/* Toggle */}
      <div style={{ display: "flex", borderBottom: `1px solid ${P.border}` }}>
        {[["syntax", "The Old Way"], ["strategy", "The DataSpark Way"]].map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
            background: mode === k ? (k === "strategy" ? "rgba(52,211,153,0.06)" : "rgba(239,68,68,0.04)") : "transparent",
            color: mode === k ? (k === "strategy" ? P.grn : "#EF4444") : P.dim,
            fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: 1,
            borderBottom: mode === k ? `2px solid ${k === "strategy" ? P.grn : "#EF4444"}` : "2px solid transparent",
            transition: "all 0.3s",
          }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 22px", minHeight: 260 }}>
        {mode === "syntax" ? (
          <div>
            <div style={{ fontSize: 9, color: "#EF4444", fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>PROMPT</div>
            <div style={{ fontSize: 12, color: P.t3, fontStyle: "italic", marginBottom: 16 }}>"Write a query to find the top 5 customers by revenue"</div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 11, color: "#64748B", lineHeight: 1.7 }}>
              <span style={{ color: "#818CF8" }}>SELECT</span> customer_id,{"\n"}
              {"  "}<span style={{ color: "#818CF8" }}>SUM</span>(amount) <span style={{ color: "#818CF8" }}>AS</span> rev{"\n"}
              <span style={{ color: "#818CF8" }}>FROM</span> orders{"\n"}
              <span style={{ color: "#818CF8" }}>GROUP BY</span> 1{"\n"}
              <span style={{ color: "#818CF8" }}>ORDER BY</span> 2 <span style={{ color: "#818CF8" }}>DESC</span>{"\n"}
              <span style={{ color: "#818CF8" }}>LIMIT</span> 5;
            </div>
            <div style={{ marginTop: 14, fontSize: 10, color: "#EF4444", fontFamily: "var(--mono)", fontWeight: 600 }}>✓ Correct syntax · ✗ No business context · ✗ No reasoning evaluated</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 9, color: P.grn, fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>PROMPT</div>
            <div style={{ fontSize: 12, color: P.t2, fontStyle: "italic", marginBottom: 16 }}>"Conversion dropped 25% this weekend. The VP needs your diagnosis by EOD."</div>
            <div style={{ background: "rgba(52,211,153,0.04)", borderRadius: 8, padding: "14px 16px", fontSize: 11.5, color: P.t3, lineHeight: 1.7 }}>
              <div style={{ color: P.grn, fontWeight: 700, fontSize: 10, marginBottom: 8 }}>YOUR STRATEGIC RESPONSE:</div>
              <div style={{ marginBottom: 4 }}>1. Validate data pipeline integrity — rule out logging bugs</div>
              <div style={{ marginBottom: 4 }}>2. Segment by platform, city, user cohort</div>
              <div style={{ marginBottom: 4 }}>3. Check for deploys Friday night (most common cause)</div>
              <div style={{ marginBottom: 4 }}>4. Present structured findings to VP with confidence levels</div>
            </div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: P.grn, fontFamily: "var(--mono)", fontWeight: 600 }}>✓ Reasoning scored · ✓ Business impact · ✓ Stakeholder-ready</div>
              <div style={{
                background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 800, color: P.grn,
              }}>87%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const C = ({ n }) => { const [v, setV] = useState(0); useEffect(() => { const s = Date.now(); const f = () => { const p = Math.min((Date.now() - s) / 1500, 1); setV(Math.floor((1 - (1 - p) ** 3) * n)); if (p < 1) requestAnimationFrame(f); }; f(); }, [n]); return <>{v.toLocaleString()}</>; };

export default function DS7() {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  const [sY, setSY] = useState(0);
  useEffect(() => { const f = () => setSY(window.scrollY); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const go = async () => { if (!email.includes("@") || busy) return; setBusy(true); await new Promise(r => setTimeout(r, 1100)); setDone(true); setBusy(false); };

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
      `}</style>

      {/* Atmosphere */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", top: "-20%", left: "-8%" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)", bottom: "5%", right: "-3%" }} />
      </div>

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: sY > 40 ? "rgba(2,6,23,0.92)" : "transparent",
        backdropFilter: sY > 40 ? "blur(20px)" : "none",
        borderBottom: sY > 40 ? `1px solid ${P.border}` : "1px solid transparent",
        transition: "all .4s",
      }}>
        <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <Logo /><span style={{ fontSize: 17, fontWeight: 800, color: P.t1, letterSpacing: "-.3px", whiteSpace: "nowrap" }}>DataSpark</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["How it works", "Features", "Courses"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ fontSize: 13.5, color: "#CBD5E1", textDecoration: "none", fontWeight: 500, transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#CBD5E1"}>{l}</a>
            ))}
            <a href="#join" style={{
              background: P.indB, borderRadius: 8, padding: "10px 24px", color: "#fff", fontSize: 13, fontWeight: 700,
              textDecoration: "none", boxShadow: `0 4px 16px rgba(99,102,241,.35)`, transition: "all .2s", animation: "breathe 3s ease infinite",
            }}>Secure Your Spot</a>
          </nav>
        </div>
      </header>

      {/* ═══ HERO — PAS Framework ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "160px 48px 100px", display: "flex", alignItems: "center", gap: 56, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <div style={{ flex: "1 1 55%" }}>
          <h1 style={{ fontSize: "clamp(38px, 5.5vw, 64px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-2.5px", marginBottom: 20 }}>
            AI Can Write{" "}
            <span style={{ color: P.dim, position: "relative", display: "inline" }}>
              the Code.
              <span style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #EF4444, transparent)", borderRadius: 2, opacity: .5 }} />
            </span>
            <br />
            It Can't Make{" "}
            <span style={{ background: `linear-gradient(135deg, ${P.ind}, ${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              the Decision.
            </span>
          </h1>

          <p style={{ fontSize: 17, color: P.t2, fontWeight: 400, lineHeight: 1.65, maxWidth: 460, marginBottom: 40 }}>
            Standard platforms prepare you to be a syntax-checker. DataSpark prepares you to be the Decision Architect — the one who turns messy data into a strategy the boardroom acts on.
          </p>

          {/* CTA */}
          <div id="join" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
            {!done ? (
              <div style={{ display: "flex", gap: 10 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && go()}
                  style={{ background: "rgba(255,255,255,.035)", border: `1px solid ${P.border}`, borderRadius: 10, padding: "14px 16px", color: P.t1, fontSize: 14, fontFamily: "var(--mono)", width: 230, transition: "all .3s" }} />
                <button onClick={go} disabled={busy || !email.includes("@")} style={{
                  background: email.includes("@") ? P.indB : "rgba(255,255,255,.03)",
                  border: "none", borderRadius: 10, padding: "14px 30px",
                  color: email.includes("@") ? "#fff" : P.dim, fontSize: 14, fontWeight: 800,
                  cursor: email.includes("@") ? "pointer" : "not-allowed",
                  boxShadow: email.includes("@") ? `0 6px 24px rgba(99,102,241,.45)` : "none",
                  transition: "all .3s", whiteSpace: "nowrap",
                }}>{busy ? "Joining..." : "Secure Your Spot →"}</button>
              </div>
            ) : (
              <div style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 10, padding: "13px 22px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: P.grn, fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: P.grn }}>You're in — first access, guaranteed.</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex" }}>
                {[P.ind, P.grn, "#F59E0B", "#EF4444"].map((c, i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `2px solid ${P.bg}`, marginLeft: i ? -5 : 0, zIndex: 4 - i, position: "relative" }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: P.t3 }}>
                <span style={{ color: P.grn, fontWeight: 700 }}><C n={847} /></span> professionals preparing smarter
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Hero Visual */}
        <div style={{ flex: "1 1 45%", display: "flex", justifyContent: "center" }}>
          <SyntaxVsStrategy />
        </div>
      </section>

      {/* Trust logos */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 44, flexWrap: "wrap", padding: "20px 0", borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }}>
          {["GOOGLE", "META", "AMAZON", "NETFLIX", "STRIPE"].map(n => (
            <span key={n} style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, color: "#1E293B", letterSpacing: 2, opacity: .4, transition: "opacity .3s", cursor: "default" }}
              onMouseEnter={e => e.target.style.opacity = ".8"} onMouseLeave={e => e.target.style.opacity = ".4"}>{n}</span>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS (Before/After) ═══ */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: P.ind, fontWeight: 600, marginBottom: 10 }}>The shift</div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
            From <span style={{ color: P.dim }}>syntax drills</span> to{" "}
            <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decision intelligence</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 1fr", alignItems: "stretch" }}>
          <div style={{ background: "rgba(239,68,68,.02)", border: "1px solid rgba(239,68,68,.08)", borderRadius: 16, padding: "32px 28px" }}>
            <div style={{ fontSize: 10, color: "#EF4444", fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 24 }}>STANDARD PLATFORMS</div>
            {[["Write a JOIN query", "Code output — no context, no reasoning evaluated"], ["Implement logistic regression", "model.fit(X, y) — pass/fail autograder"], ["Calculate the mean", "np.mean(data) — isolated from any business question"]].map(([q, a], i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12.5, color: "#64748B", fontStyle: "italic", marginBottom: 4 }}>"{q}"</div>
                <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>→ {a}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,.06)", border: `1px solid rgba(99,102,241,.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: P.ind }}>→</div>
          </div>
          <div style={{ background: "rgba(52,211,153,.03)", border: "1px solid rgba(52,211,153,.08)", borderRadius: 16, padding: "32px 28px" }}>
            <div style={{ fontSize: 10, color: P.grn, fontFamily: "var(--mono)", letterSpacing: 2, fontWeight: 700, marginBottom: 24 }}>DATASPARK</div>
            {[["Churn spiked 15% in EMEA", "Segment → validate pipeline → cohort retention → present action plan to VP"], ["Should we build or buy ML monitoring?", "Team capacity analysis → vendor comparison → cost projection → executive recommendation"], ["A/B test shows contradictory metrics", "Identify clickbait pattern → propose extended test → define tiebreaker metric → align stakeholders"]].map(([q, a], i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12.5, color: P.t2, fontStyle: "italic", marginBottom: 4 }}>"{q}"</div>
                <div style={{ fontSize: 11, color: P.grn, lineHeight: 1.55, opacity: .85 }}>→ {a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — Career Outcomes, not feature lists ═══ */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: P.grn, fontWeight: 600, marginBottom: 10 }}>Your advantage</div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
            The tools that separate<br />
            <span style={{ color: P.dim }}>$120k coders</span> from{" "}
            <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$300k architects</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { t: "The Socratic Sparring Partner", d: "Our AI tutor doesn't hand you answers. It challenges your assumptions, simulates stakeholder pushback, and forces you to defend your logic like a Lead DS.", c: P.ind,
              ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.ind} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
            { t: "Visual System Design", d: "Don't just read about data pipelines — see the bottleneck. Interactive animated diagrams make architectural logic click in seconds, not hours.", c: P.grn,
              ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            { t: "The Boardroom Simulator", d: "Every problem is a high-stakes business crisis — from a 25% churn spike to an A/B test the PM wants to ship. No puzzles in a vacuum.", c: P.ind,
              ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.ind} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
            { t: "Reasoning Audit, Not Autograder", d: "AI scores your decision-making process against a detailed rubric. It evaluates whether a CEO would act on your analysis — not whether your semicolons are correct.", c: P.grn,
              ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
            { t: "Permanent Retention Engine", d: "Spaced repetition resurfaces weak spots at scientifically optimal intervals. You don't cram for one interview — you build permanent expertise.", c: P.ind,
              ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.ind} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> },
            { t: "Decision Architect Progression", d: "Level-gated mastery across 9 courses. Cross-discipline prerequisites ensure you build judgment, not just isolated skills.", c: P.grn,
              ic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
          ].map((f, i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: "28px 24px", transition: "all .3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.bHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ marginBottom: 16 }}>{f.ic}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.t1, marginBottom: 8 }}>{f.t}</div>
              <div style={{ fontSize: 12.5, color: P.t3, lineHeight: 1.7 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SILENT COMPARISON TABLE ═══ */}
      <section style={{ maxWidth: 740, margin: "0 auto", padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 12, color: "#F5A623", fontWeight: 600, marginBottom: 10 }}>The gap</div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, letterSpacing: "-1px" }}>Standard prep vs. Decision Intelligence</h2>
        </div>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px", padding: "14px 24px", borderBottom: `1px solid ${P.border}`, background: "rgba(255,255,255,.01)" }}>
            <span style={{ fontSize: 10, color: P.dim, fontFamily: "var(--mono)", fontWeight: 700 }}>DIMENSION</span>
            <span style={{ fontSize: 10, color: P.dim, fontFamily: "var(--mono)", fontWeight: 700, textAlign: "center" }}>STANDARD</span>
            <span style={{ fontSize: 10, color: P.ind, fontFamily: "var(--mono)", fontWeight: 800, textAlign: "center" }}>DATASPARK</span>
          </div>
          {[
            ["Primary focus", "Syntax correctness", "Strategic reasoning"],
            ["Feedback type", "Pass/fail autograder", "Socratic reasoning audit"],
            ["Problem environment", "Isolated code editor", "Business crisis simulation"],
            ["AI interaction", "Hints on demand", "Stakeholder pushback simulation"],
            ["Learning path", "Linear SQL drills", "Cross-discipline mastery tree"],
            ["Outcome", "Faster typing", "Boardroom-ready authority"],
          ].map(([dim, std, ds], i, a) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px", padding: "13px 24px", borderBottom: i < a.length - 1 ? `1px solid rgba(255,255,255,.02)` : "none" }}>
              <span style={{ fontSize: 12.5, color: P.t2, fontWeight: 500 }}>{dim}</span>
              <span style={{ fontSize: 11.5, color: P.dim, textAlign: "center", fontFamily: "var(--mono)" }}>{std}</span>
              <span style={{ fontSize: 11.5, color: P.grn, textAlign: "center", fontFamily: "var(--mono)", fontWeight: 600 }}>{ds}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COURSES ═══ */}
      <section id="courses" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 12, color: P.ind, fontWeight: 600, marginBottom: 10 }}>9 courses · 285+ scenarios</div>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, letterSpacing: "-.5px", marginBottom: 32 }}>Python to system design. Syntax to strategy.</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {[["🐍","Python"],["🗄️","SQL"],["📐","Statistics"],["🧠","ML"],["🔮","Deep Learning"],["✨","GenAI"],["📊","Product Sense"],["🏗️","Architecture"],["⚙️","MLOps"]].map(([ic,nm],i) => (
            <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 9, padding: "10px 16px", display: "flex", alignItems: "center", gap: 7, transition: "border-color .2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = P.bHover} onMouseLeave={e => e.currentTarget.style.borderColor = P.border}
            ><span style={{ fontSize: 16 }}>{ic}</span><span style={{ fontSize: 12.5, fontWeight: 600 }}>{nm}</span></div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px 120px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,.07) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 14, position: "relative" }}>
          Copilot writes the code.<br />
          <span style={{ background: `linear-gradient(135deg,${P.ind},${P.grn})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Who makes the call?</span>
        </h2>
        <p style={{ fontSize: 15, color: P.dim, maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.6 }}>Your judgment is the only thing the market still pays a premium for.</p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {!done ? (
            <div style={{ display: "flex", gap: 10 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && go()}
                style={{ background: "rgba(255,255,255,.035)", border: `1px solid ${P.border}`, borderRadius: 10, padding: "14px 16px", color: P.t1, fontSize: 14, fontFamily: "var(--mono)", width: 230 }} />
              <button onClick={go} disabled={busy || !email.includes("@")} style={{
                background: P.indB, border: "none", borderRadius: 10, padding: "14px 30px", color: "#fff", fontSize: 14, fontWeight: 800,
                cursor: "pointer", boxShadow: `0 6px 24px rgba(99,102,241,.45)`, animation: "breathe 3s ease infinite",
              }}>{busy ? "Joining..." : "Secure Your Spot →"}</button>
            </div>
          ) : (
            <div style={{ fontSize: 15, color: P.grn, fontWeight: 700 }}>✓ You're in. First access, guaranteed.</div>
          )}
          <span style={{ fontSize: 11, color: "#1E293B" }}>Free for early adopters · No spam</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${P.border}`, maxWidth: 1200, margin: "0 auto", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Logo /><span style={{ fontSize: 10, color: "#1E293B", fontFamily: "var(--mono)" }}>© 2026 DataSpark</span></div>
        <div style={{ display: "flex", gap: 22 }}>
          {["TikTok", "LinkedIn", "Twitter"].map(s => (
            <a key={s} href="#" style={{ fontSize: 10, color: "#334155", textDecoration: "none", fontFamily: "var(--mono)", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "#E2E8F0"} onMouseLeave={e => e.target.style.color = "#334155"}>{s}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
