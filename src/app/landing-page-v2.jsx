import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════
// DataSpark — Cinematic Landing v2
// "The Old Way vs. The DataSpark Way"
// Single-file, no external animation/chart packages.
// ═══════════════════════════════════════════════════════════════════════════

// ── Palette ──────────────────────────────────────────────────────────────────
const INK = "#04040A";
const WHITE = "#F8FAFC";
const GRAY = "#94A3B8";
const DIM = "#475569";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_SOFT = "rgba(255,255,255,0.05)";
const PURPLE = "#A855F7";
const CYAN = "#22D3EE";
const RED = "#F87171";
const GRADIENT_TEXT = `linear-gradient(100deg, ${PURPLE} 0%, ${CYAN} 100%)`;
const SANS = "var(--ds-sans), sans-serif";
const MONO = "var(--ds-mono), monospace";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
// progress p remapped to [0,1] across the [s,e] window
const seg = (p, s, e) => clamp01((p - s) / (e - s));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ── Comparison content ───────────────────────────────────────────────────────
const CONTRAST_ROWS = [
  {
    label: "The problem",
    grind: "“Write a GROUP BY”",
    lab: "“Diagnose why EMEA churned 15%”",
  },
  {
    label: "The AI’s role",
    grind: "Shows you the answer",
    lab: "Asks you “why?” until you get it",
  },
  {
    label: "Prepares you for",
    grind: "The coding screen",
    lab: "The system design + product round",
  },
  {
    label: "The outcome",
    grind: "You can write queries",
    lab: "You can lead a data team",
  },
];

// ── Chat simulator script ────────────────────────────────────────────────────
const SIM_Q1 = {
  prompt:
    "EMEA churn is up 15% quarter-over-quarter — and the board meeting is Thursday. Most candidates immediately start writing SQL. Don’t. Before you touch a single table: what’s your hypothesis?",
  choices: [
    {
      id: "a",
      label: "A competitor launched in Europe",
      reply:
        "Maybe. But why would a competitor hit EMEA and leave APAC completely flat? Name the single piece of data that would confirm — or kill — that theory.",
    },
    {
      id: "b",
      label: "We changed pricing last quarter",
      reply:
        "Good instinct — pricing did change in May. But why would a global price change only show up in EMEA? What would you segment by before blaming price?",
    },
    {
      id: "c",
      label: "Let me just pull the churn table",
      reply:
        "That’s the code-grind reflex — query first, think never. The table has 40 million rows. What are you actually looking for in it?",
    },
  ],
};

const SIM_Q2 = {
  prompt:
    "Now segment it. The churn is concentrated in SMB accounts hitting their annual renewal. What does that tell you about when this problem actually started?",
  choices: [
    {
      id: "a",
      label: "It started ~12 months ago, at signup",
      reply:
        "Exactly. The renewal cliff is a lagging indicator — the damage was done at onboarding a year ago. That’s the mechanism, not just the metric. This is the answer interviewers hire for.",
    },
    {
      id: "b",
      label: "It started when renewals hit",
      reply:
        "Close — that’s when it became visible. But a renewal cliff is a lagging indicator: these accounts decided to leave months ago. The real start was onboarding, ~12 months back. See the difference? That’s mechanism vs. metric.",
    },
    {
      id: "c",
      label: "I’d need cohort curves to say",
      reply:
        "Careful — that’s a safe answer, and interviewers notice hedging. You already have the signal: a renewal cliff means the decision to leave was made months ago, at onboarding. Commit to the mechanism, then verify with cohorts.",
    },
  ],
};

const SIM_OUTRO =
  "You just found the mechanism, not just the metric — and you can explain it to a board in two sentences. Here’s your scorecard.";

const SIM_SCORECARD = [
  { skill: "Hypothesis framing", level: "Strong", pct: 92 },
  { skill: "Segmentation logic", level: "Strong", pct: 88 },
  { skill: "Root-cause reasoning", level: "Developing", pct: 64 },
  { skill: "Executive narrative", level: "Strong", pct: 90 },
];

// ── Scroll-transform content ─────────────────────────────────────────────────
const CODE_BOXES = [
  {
    tag: "Problem #412 · Easy",
    code: "SELECT region, COUNT(*)\nFROM churn\nGROUP BY 1;",
  },
  {
    tag: "Problem #88 · Medium",
    code: "def reverse_list(head):\n    prev = None\n    while head: ...",
  },
  {
    tag: "Problem #267 · Easy",
    code: "SELECT email, COUNT(*)\nFROM users\nHAVING COUNT(*) > 1;",
  },
];

const MISSION_NODES = [
  { x: 105, y: 64, label: "Hypotheses" },
  { x: 495, y: 64, label: "Data sources" },
  { x: 105, y: 276, label: "Segments" },
  { x: 495, y: 276, label: "Exec narrative" },
];

// ── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, active, duration = 1700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = clamp01((now - start) / duration);
      setValue(Math.round(target * easeOut(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

// ── Atoms ────────────────────────────────────────────────────────────────────
function TypedText({ text, speed = 16, onDone }) {
  const [n, setN] = useState(0);
  const doneRef = useRef(false);
  useEffect(() => {
    setN(0);
    doneRef.current = false;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  const done = n >= text.length;
  useEffect(() => {
    if (done && !doneRef.current) {
      doneRef.current = true;
      if (onDone) onDone();
    }
  }, [done, onDone]);
  return (
    <span>
      {text.slice(0, n)}
      {!done && (
        <span style={{ color: CYAN, animation: "ds2-blink 0.8s steps(1) infinite" }}>▍</span>
      )}
    </span>
  );
}

// Ambient particle field — gives CTA zones video-like depth
function Particles({ count = 9, hue = "mixed" }) {
  const dots = [];
  for (let i = 0; i < count; i += 1) {
    const color = hue === "mixed" ? (i % 2 ? PURPLE : CYAN) : hue;
    dots.push(
      <span
        key={i}
        style={{
          position: "absolute",
          left: `${(i * 137) % 100}%`,
          top: `${(i * 61 + 13) % 100}%`,
          width: i % 3 === 0 ? 4 : 2.5,
          height: i % 3 === 0 ? 4 : 2.5,
          borderRadius: "50%",
          background: color,
          opacity: 0,
          animation: `ds2-particle ${4.5 + (i % 4)}s ease-in-out ${i * 0.55}s infinite`,
          pointerEvents: "none",
        }}
      />
    );
  }
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {dots}
    </div>
  );
}

function SparkMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(168,85,247,0.10)" stroke="rgba(168,85,247,0.45)" />
      <path d="M8 22 L14 15 L19 18 L25 9" stroke={CYAN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="9" r="3" fill={PURPLE} />
      <circle cx="25" cy="9" r="5.5" stroke={PURPLE} strokeOpacity="0.35" />
    </svg>
  );
}

// Email capture — the "Secure Your Spot" card
function EmailCapture({ compact = false }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setDone(true);
  };
  if (done) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 22px",
          borderRadius: 14,
          border: `1px solid rgba(34,211,238,0.35)`,
          background: "rgba(34,211,238,0.07)",
          fontFamily: SANS,
          color: WHITE,
          fontSize: 14.5,
          fontWeight: 600,
          animation: "ds2-rise 0.45s var(--ds-ease-out) both",
        }}
      >
        <span style={{ color: CYAN, fontSize: 17 }}>✦</span>
        You&rsquo;re on the list. Watch your inbox — Cohort 02 opens soon.
      </div>
    );
  }
  return (
    <form
      onSubmit={submit}
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        padding: compact ? 8 : 10,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        maxWidth: 520,
      }}
    >
      <Particles count={7} />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={{
          flex: "1 1 220px",
          minWidth: 0,
          background: "rgba(4,4,10,0.6)",
          border: `1px solid ${BORDER_SOFT}`,
          borderRadius: 11,
          padding: "14px 16px",
          color: WHITE,
          fontSize: 14.5,
          fontFamily: SANS,
          outline: "none",
          position: "relative",
          zIndex: 1,
        }}
      />
      <button
        type="submit"
        className="ds2-cta"
        style={{
          position: "relative",
          zIndex: 1,
          border: "none",
          borderRadius: 11,
          padding: "14px 24px",
          fontSize: 14.5,
          fontWeight: 700,
          fontFamily: SANS,
          color: "#0B0314",
          background: GRADIENT_TEXT,
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 0 28px rgba(168,85,247,0.45)",
        }}
      >
        Secure Your Spot →
      </button>
    </form>
  );
}

// Kinetic counter badge — "847 professionals preparing smarter"
function KineticBadge() {
  const [ref, inView] = useInView(0.6);
  const n = useCountUp(847, inView);
  return (
    <div
      ref={ref}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 18px 9px 11px",
        borderRadius: 999,
        border: `1px solid rgba(168,85,247,0.3)`,
        background: "rgba(168,85,247,0.06)",
        boxShadow: inView ? "0 0 32px rgba(168,85,247,0.18)" : "none",
        transition: "box-shadow 1.2s var(--ds-ease-out)",
        fontFamily: SANS,
      }}
    >
      <span style={{ display: "flex" }}>
        {[CYAN, PURPLE, "#F472B6", "#818CF8"].map((c, i) => (
          <span
            key={c}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              marginLeft: i === 0 ? 0 : -8,
              border: `2px solid ${INK}`,
              background: `radial-gradient(circle at 32% 32%, ${c}, #0F172A)`,
            }}
          />
        ))}
      </span>
      <span style={{ fontSize: 13.5, color: GRAY }}>
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 15,
            color: WHITE,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n.toLocaleString()}
        </span>{" "}
        professionals preparing smarter
      </span>
    </div>
  );
}

function SectionKicker({ children, color = CYAN }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ width: 28, height: 1, background: color, opacity: 0.6 }} />
      {children}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <header
      style={{
        position: "relative",
        padding: "0 24px",
        maxWidth: 1120,
        margin: "0 auto",
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 0",
          animation: "ds2-rise 0.5s var(--ds-ease-out) both",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: WHITE,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: "-0.02em",
          }}
        >
          <SparkMark />
          DataSpark
        </Link>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11.5,
            color: DIM,
            letterSpacing: "0.08em",
          }}
        >
          dataspark-prep.com
        </span>
      </nav>

      {/* Hero body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, paddingBottom: 56 }}>
        <div style={{ animation: "ds2-rise 0.55s var(--ds-ease-out) 0.08s both" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: MONO,
              fontSize: 11.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CYAN,
              border: `1px solid rgba(34,211,238,0.3)`,
              background: "rgba(34,211,238,0.05)",
              borderRadius: 999,
              padding: "7px 16px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: CYAN,
                animation: "ds2-blink 1.6s ease-in-out infinite",
              }}
            />
            Early access · Cohort 02 opening soon
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(40px, 7vw, 78px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            color: WHITE,
            maxWidth: 880,
            animation: "ds2-rise 0.6s var(--ds-ease-out) 0.16s both",
          }}
        >
          Stop grinding questions.
          <br />
          <span
            style={{
              background: GRADIENT_TEXT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Start solving systems.
          </span>
        </h1>

        <p
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: "clamp(16px, 2vw, 19px)",
            lineHeight: 1.65,
            color: GRAY,
            maxWidth: 620,
            animation: "ds2-rise 0.6s var(--ds-ease-out) 0.24s both",
          }}
        >
          Most platforms train you to solve isolated coding questions. Real
          interviews ask you to{" "}
          <strong style={{ color: WHITE, fontWeight: 600 }}>
            investigate business problems
          </strong>{" "}
          and explain your thinking clearly.
        </p>

        <div style={{ animation: "ds2-rise 0.6s var(--ds-ease-out) 0.32s both" }}>
          <EmailCapture />
          <p style={{ margin: "10px 2px 0", fontFamily: MONO, fontSize: 11.5, color: DIM }}>
            Free for early access · No credit card
          </p>
        </div>

        <div style={{ animation: "ds2-rise 0.6s var(--ds-ease-out) 0.42s both" }}>
          <KineticBadge />
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: DIM,
          animation: "ds2-rise 0.6s var(--ds-ease-out) 0.6s both",
        }}
      >
        Scroll to see the difference
        <span style={{ animation: "ds2-bob 1.8s ease-in-out infinite", color: CYAN }}>↓</span>
      </div>
    </header>
  );
}

// ── Scroll-linked transformation ─────────────────────────────────────────────
// Isolated code boxes warp into a system-design mind map + mission scorecard.
function TransformSection() {
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        setProgress(clamp01(-rect.top / total));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const p = progress;
  const boxesOut = seg(p, 0.18, 0.5); // code boxes warp away
  const mapIn = seg(p, 0.42, 0.72); // mind map materializes
  const cardIn = seg(p, 0.6, 0.88); // scorecard slides in
  const lineDraw = seg(p, 0.48, 0.82);

  return (
    <section ref={wrapRef} style={{ position: "relative", height: "260vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30, maxWidth: 720 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SectionKicker color={PURPLE}>The transformation</SectionKicker>
          </div>
          <h2
            style={{
              margin: "14px 0 0",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 42px)",
              letterSpacing: "-0.03em",
              color: WHITE,
              lineHeight: 1.12,
            }}
          >
            {boxesOut < 0.5 ? "This is what practice looks like today." : "This is what interviews actually test."}
          </h2>
          <p style={{ margin: "10px 0 0", fontFamily: SANS, fontSize: 15, color: GRAY }}>
            Keep scrolling — watch isolated problems become a system.
          </p>
        </div>

        {/* Stage */}
        <div style={{ position: "relative", width: "100%", maxWidth: 980, height: "min(54vh, 480px)" }}>
          {/* Phase 1 — isolated code boxes */}
          {CODE_BOXES.map((box, i) => {
            const drift = boxesOut;
            const dx = (i - 1) * lerp(0, 60, drift);
            const dy = lerp(0, -40 - i * 22, drift);
            return (
              <div
                key={box.tag}
                style={{
                  position: "absolute",
                  left: `${[6, 36, 66][i]}%`,
                  top: `${[12, 38, 16][i]}%`,
                  width: "min(280px, 38vw)",
                  transform: `translate(${dx}px, ${dy}px) scale(${lerp(1, 0.55, drift)}) rotate(${lerp(
                    (i - 1) * 2,
                    (i - 1) * 14,
                    drift
                  )}deg)`,
                  opacity: 1 - drift,
                  filter: `blur(${lerp(0, 6, drift)}px)`,
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                  background: "rgba(15,23,42,0.85)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                  overflow: "hidden",
                  willChange: "transform, opacity",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: `1px solid ${BORDER_SOFT}`,
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: DIM,
                    letterSpacing: "0.06em",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {box.tag}
                  <span style={{ color: "#334155" }}>● ● ●</span>
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "14px 16px",
                    fontFamily: MONO,
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "#7C8DA6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {box.code}
                </pre>
              </div>
            );
          })}

          {/* Phase 2 — system design mind map */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              opacity: mapIn,
              transform: `scale(${lerp(0.92, 1, mapIn)})`,
              willChange: "transform, opacity",
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 600 340" style={{ width: "100%", maxWidth: 640, height: "100%" }} aria-hidden>
              <defs>
                <linearGradient id="ds2-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={PURPLE} />
                  <stop offset="100%" stopColor={CYAN} />
                </linearGradient>
              </defs>
              {MISSION_NODES.map((node) => {
                const len = Math.hypot(node.x - 300, node.y - 170);
                return (
                  <line
                    key={node.label}
                    x1="300"
                    y1="170"
                    x2={node.x}
                    y2={node.y}
                    stroke="url(#ds2-line)"
                    strokeWidth="1.4"
                    strokeOpacity="0.7"
                    strokeDasharray={len}
                    strokeDashoffset={len * (1 - lineDraw)}
                  />
                );
              })}
              {/* Center node */}
              <g>
                <rect
                  x="208"
                  y="146"
                  width="184"
                  height="48"
                  rx="12"
                  fill="rgba(168,85,247,0.12)"
                  stroke={PURPLE}
                  strokeOpacity="0.6"
                />
                <text
                  x="300"
                  y="175"
                  textAnchor="middle"
                  fill={WHITE}
                  fontFamily="var(--ds-sans), sans-serif"
                  fontSize="14.5"
                  fontWeight="700"
                >
                  EMEA Churn Mission
                </text>
              </g>
              {MISSION_NODES.map((node, i) => {
                const nodeIn = seg(lineDraw, 0.4 + i * 0.12, 0.7 + i * 0.12);
                return (
                  <g key={node.label} opacity={nodeIn}>
                    <rect
                      x={node.x - 62}
                      y={node.y - 19}
                      width="124"
                      height="38"
                      rx="10"
                      fill="rgba(34,211,238,0.08)"
                      stroke={CYAN}
                      strokeOpacity="0.45"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4.5}
                      textAnchor="middle"
                      fill="#A5F3FC"
                      fontFamily="var(--ds-mono), monospace"
                      fontSize="11.5"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Phase 3 — mission scorecard */}
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: lerp(-30, 6, cardIn),
              width: "min(280px, 76vw)",
              opacity: cardIn,
              transform: `translateY(${lerp(36, 0, cardIn)}px)`,
              borderRadius: 16,
              border: `1px solid rgba(34,211,238,0.3)`,
              background: "rgba(8,12,24,0.92)",
              boxShadow: "0 22px 60px rgba(0,0,0,0.55), 0 0 40px rgba(34,211,238,0.1)",
              padding: "16px 18px",
              willChange: "transform, opacity",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: CYAN,
                marginBottom: 12,
              }}
            >
              Mission scorecard
            </div>
            {SIM_SCORECARD.slice(0, 3).map((row, i) => {
              const fill = seg(cardIn, 0.3 + i * 0.15, 0.8 + i * 0.1);
              return (
                <div key={row.skill} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: SANS,
                      fontSize: 12,
                      color: GRAY,
                      marginBottom: 4,
                    }}
                  >
                    {row.skill}
                    <span style={{ color: WHITE, fontFamily: MONO, fontSize: 11 }}>
                      {Math.round(row.pct * fill)}%
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${row.pct * fill}%`,
                        borderRadius: 99,
                        background: GRADIENT_TEXT,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress rail */}
        <div
          style={{
            marginTop: 26,
            width: 160,
            height: 2,
            borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ width: `${p * 100}%`, height: "100%", background: GRADIENT_TEXT }} />
        </div>
      </div>
    </section>
  );
}

// ── The Core Contrast — Code Grind vs Decision Lab ───────────────────────────
function ContrastSection() {
  const [ref, inView] = useInView(0.2);
  const [hovered, setHovered] = useState(-1);

  return (
    <section ref={ref} style={{ padding: "110px 24px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SectionKicker>Two ways to prepare</SectionKicker>
        </div>
        <h2
          style={{
            margin: "16px 0 0",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(28px, 4.5vw, 48px)",
            letterSpacing: "-0.03em",
            color: WHITE,
            lineHeight: 1.1,
          }}
        >
          One builds coders.{" "}
          <span
            style={{
              background: GRADIENT_TEXT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            One builds leaders.
          </span>
        </h2>
      </div>

      <div
        className="ds2-contrast-grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 22,
        }}
      >
        {/* VS divider — desktop only */}
        <div
          className="ds2-vs"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: `1px solid ${BORDER}`,
            background: INK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            color: GRAY,
            boxShadow: "0 0 30px rgba(0,0,0,0.8)",
          }}
        >
          VS
        </div>

        {/* THE CODE GRIND */}
        <div
          style={{
            borderRadius: 20,
            border: `1px solid ${BORDER_SOFT}`,
            background: "rgba(255,255,255,0.015)",
            padding: "30px 28px",
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(28px)",
            transition: "opacity 0.7s var(--ds-ease-out), transform 0.7s var(--ds-ease-out)",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: DIM,
              marginBottom: 6,
            }}
          >
            The old way
          </div>
          <h3
            style={{
              margin: "0 0 24px",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: "#64748B",
            }}
          >
            THE CODE GRIND
          </h3>
          {CONTRAST_ROWS.map((row, i) => (
            <div
              key={row.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(-1)}
              style={{
                padding: "16px 14px",
                borderRadius: 12,
                marginBottom: 6,
                background: hovered === i ? "rgba(255,255,255,0.04)" : "transparent",
                transition: "background 0.18s var(--ds-ease-out)",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(14px)",
                transitionDelay: `${0.1 + i * 0.08}s`,
                cursor: "default",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#334155",
                  marginBottom: 5,
                }}
              >
                {row.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 15.5, color: "#7C8DA6", lineHeight: 1.5 }}>
                {row.grind}
              </div>
            </div>
          ))}
        </div>

        {/* THE DECISION LAB */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            border: "1px solid transparent",
            background:
              `linear-gradient(rgba(8,10,22,0.97), rgba(8,10,22,0.97)) padding-box, ` +
              `linear-gradient(140deg, rgba(168,85,247,0.65), rgba(34,211,238,0.65)) border-box`,
            padding: "30px 28px",
            boxShadow: "0 0 60px rgba(168,85,247,0.12), 0 24px 70px rgba(0,0,0,0.5)",
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(28px)",
            transition: "opacity 0.7s var(--ds-ease-out) 0.12s, transform 0.7s var(--ds-ease-out) 0.12s",
          }}
        >
          <Particles count={6} />
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: CYAN,
              marginBottom: 6,
            }}
          >
            The DataSpark way
          </div>
          <h3
            style={{
              margin: "0 0 24px",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "-0.02em",
              background: GRADIENT_TEXT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            THE DECISION LAB
          </h3>
          {CONTRAST_ROWS.map((row, i) => (
            <div
              key={row.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(-1)}
              style={{
                position: "relative",
                padding: "16px 14px",
                borderRadius: 12,
                marginBottom: 6,
                background: hovered === i ? "rgba(168,85,247,0.08)" : "transparent",
                outline: hovered === i ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
                transition: "background 0.18s var(--ds-ease-out), outline-color 0.18s var(--ds-ease-out)",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(14px)",
                transitionDelay: `${0.18 + i * 0.08}s`,
                cursor: "default",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(34,211,238,0.6)",
                  marginBottom: 5,
                }}
              >
                {row.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 600, color: WHITE, lineHeight: 1.5 }}>
                {row.lab}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Interactive "AI Asks Why" simulator ──────────────────────────────────────
function ChatSimulator() {
  const [secRef, inView] = useInView(0.15);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]); // {role:'ai'|'user', text}
  const [phase, setPhase] = useState("idle"); // idle | q1 | q2 | outro | done
  const [choicesOpen, setChoicesOpen] = useState(false);
  const queueRef = useRef([]); // pending AI messages [{text, thenPhase, thenChoices}]
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, choicesOpen, phase]);

  const pushAi = useCallback((text) => {
    setMessages((prev) => [...prev, { role: "ai", text }]);
  }, []);

  const startSim = () => {
    if (started) return;
    setStarted(true);
    setPhase("q1");
    queueRef.current = [];
    pushAi(SIM_Q1.prompt);
  };

  // Called when the latest AI message finishes typing
  const onAiDone = useCallback(() => {
    const next = queueRef.current.shift();
    if (next) {
      setTimeout(() => {
        if (next.phase) setPhase(next.phase);
        pushAi(next.text);
      }, 420);
    } else {
      setChoicesOpen(true);
    }
  }, [pushAi]);

  const pickChoice = (choice) => {
    setChoicesOpen(false);
    setMessages((prev) => [...prev, { role: "user", text: choice.label }]);
    if (phase === "q1") {
      queueRef.current = [{ text: SIM_Q2.prompt, phase: "q2" }];
      setTimeout(() => pushAi(choice.reply), 500);
    } else if (phase === "q2") {
      queueRef.current = [{ text: SIM_OUTRO, phase: "done" }];
      setTimeout(() => pushAi(choice.reply), 500);
    }
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setPhase("idle");
    setChoicesOpen(false);
    queueRef.current = [];
  };

  const activeChoices = phase === "q1" ? SIM_Q1.choices : phase === "q2" ? SIM_Q2.choices : null;
  const showChoices = choicesOpen && activeChoices && phase !== "done";

  // tiny bar chart data — EMEA is the anomaly
  const regions = [
    { name: "NA", h: 38, churn: "4.2%" },
    { name: "EMEA", h: 86, churn: "15.1%", anomaly: true },
    { name: "APAC", h: 33, churn: "3.8%" },
    { name: "LATAM", h: 42, churn: "4.9%" },
  ];

  return (
    <section ref={secRef} style={{ padding: "110px 24px", maxWidth: 1120, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 44,
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(24px)",
          transition: "opacity 0.7s var(--ds-ease-out), transform 0.7s var(--ds-ease-out)",
        }}
      >
        <SectionKicker color={PURPLE}>Live demo · no signup needed</SectionKicker>
        <h2
          style={{
            margin: "16px 0 12px",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(28px, 4.5vw, 46px)",
            letterSpacing: "-0.03em",
            color: WHITE,
            lineHeight: 1.1,
            maxWidth: 700,
          }}
        >
          The AI that doesn&rsquo;t give you answers.
          <br />
          It asks you <span style={{ color: CYAN }}>why</span>.
        </h2>
        <p style={{ margin: 0, fontFamily: SANS, fontSize: 16, color: GRAY, maxWidth: 560, lineHeight: 1.65 }}>
          Try a 60-second slice of a real DataSpark mission. Something is wrong in this
          dashboard — find it, click it, and defend your reasoning.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 22,
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(28px)",
          transition: "opacity 0.8s var(--ds-ease-out) 0.15s, transform 0.8s var(--ds-ease-out) 0.15s",
        }}
      >
        {/* Dashboard panel */}
        <div
          style={{
            borderRadius: 18,
            border: `1px solid ${BORDER}`,
            background: "rgba(10,14,26,0.85)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${BORDER_SOFT}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 11,
              color: DIM,
              letterSpacing: "0.08em",
            }}
          >
            <span>quarterly_churn_by_region.dash</span>
            <span style={{ color: RED }}>● 1 anomaly</span>
          </div>
          <div style={{ flex: 1, padding: "30px 26px 18px", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "6%", minHeight: 200 }}>
              {regions.map((r) => (
                <div key={r.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: r.anomaly ? RED : DIM,
                      fontWeight: r.anomaly ? 700 : 400,
                    }}
                  >
                    {r.churn}
                  </span>
                  <button
                    onClick={r.anomaly ? startSim : undefined}
                    aria-label={r.anomaly ? "Investigate the EMEA churn anomaly" : undefined}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: `${r.h * 2}px`,
                      maxHeight: 190,
                      border: "none",
                      borderRadius: "6px 6px 2px 2px",
                      cursor: r.anomaly && !started ? "pointer" : "default",
                      background: r.anomaly
                        ? "linear-gradient(180deg, rgba(248,113,113,0.85), rgba(248,113,113,0.25))"
                        : "linear-gradient(180deg, rgba(148,163,184,0.35), rgba(148,163,184,0.08))",
                      boxShadow: r.anomaly && !started ? "0 0 26px rgba(248,113,113,0.35)" : "none",
                      animation: r.anomaly && !started ? "ds2-throb 2s ease-in-out infinite" : "none",
                      padding: 0,
                    }}
                  >
                    {r.anomaly && !started && (
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          top: -10,
                          left: "50%",
                          transform: "translate(-50%, -100%)",
                          whiteSpace: "nowrap",
                          fontFamily: MONO,
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: RED,
                          animation: "ds2-bob 1.8s ease-in-out infinite",
                        }}
                      >
                        click to investigate ↓
                      </span>
                    )}
                  </button>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: r.anomaly ? WHITE : DIM }}>{r.name}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                paddingTop: 12,
                borderTop: `1px solid ${BORDER_SOFT}`,
                fontFamily: MONO,
                fontSize: 10.5,
                color: "#334155",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Q3 FY26 · churn_rate by region</span>
              <span>source: warehouse.prod</span>
            </div>
          </div>
        </div>

        {/* Chat workspace */}
        <div
          style={{
            position: "relative",
            borderRadius: 18,
            border: "1px solid transparent",
            background:
              `linear-gradient(rgba(7,9,20,0.97), rgba(7,9,20,0.97)) padding-box, ` +
              `linear-gradient(150deg, rgba(168,85,247,0.5), rgba(34,211,238,0.5)) border-box`,
            display: "flex",
            flexDirection: "column",
            minHeight: 420,
            boxShadow: "0 0 50px rgba(168,85,247,0.08)",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${BORDER_SOFT}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: started ? CYAN : DIM,
                boxShadow: started ? `0 0 10px ${CYAN}` : "none",
              }}
            />
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: GRAY }}>
              SPARK · interview agent
            </span>
            {started && (
              <button
                onClick={reset}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "4px 10px",
                  color: DIM,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  cursor: "pointer",
                }}
              >
                reset
              </button>
            )}
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxHeight: 430,
            }}
          >
            {!started && (
              <div
                style={{
                  margin: "auto",
                  textAlign: "center",
                  fontFamily: SANS,
                  fontSize: 14,
                  color: DIM,
                  lineHeight: 1.7,
                  padding: "0 20px",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 10 }}>◎</div>
                Something in that dashboard is wrong.
                <br />
                <span style={{ color: GRAY }}>Click the anomaly to begin your investigation.</span>
              </div>
            )}

            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    padding: "11px 15px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? "rgba(34,211,238,0.1)" : "rgba(168,85,247,0.08)",
                    border: `1px solid ${m.role === "user" ? "rgba(34,211,238,0.3)" : "rgba(168,85,247,0.25)"}`,
                    fontFamily: SANS,
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: m.role === "user" ? "#CFFAFE" : "#E2E8F0",
                    animation: "ds2-rise 0.3s var(--ds-ease-out) both",
                  }}
                >
                  {m.role === "ai" && isLast ? (
                    <TypedText text={m.text} onDone={onAiDone} />
                  ) : (
                    m.text
                  )}
                </div>
              );
            })}

            {showChoices && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
                {activeChoices.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => pickChoice(c)}
                    className="ds2-choice"
                    style={{
                      textAlign: "left",
                      background: "rgba(255,255,255,0.025)",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 11,
                      padding: "11px 15px",
                      color: WHITE,
                      fontFamily: SANS,
                      fontSize: 13.5,
                      cursor: "pointer",
                      animation: `ds2-rise 0.35s var(--ds-ease-out) ${i * 0.08}s both`,
                    }}
                  >
                    <span style={{ color: CYAN, fontFamily: MONO, fontSize: 11.5, marginRight: 9 }}>
                      {c.id.toUpperCase()}
                    </span>
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {phase === "done" && choicesOpen && (
              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid rgba(34,211,238,0.3)`,
                  background: "rgba(8,14,26,0.9)",
                  padding: "16px 18px",
                  animation: "ds2-rise 0.45s var(--ds-ease-out) both",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: CYAN,
                    marginBottom: 12,
                  }}
                >
                  Your mission scorecard
                </div>
                {SIM_SCORECARD.map((row, i) => (
                  <div
                    key={row.skill}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 0",
                      borderTop: i === 0 ? "none" : `1px solid ${BORDER_SOFT}`,
                      animation: `ds2-rise 0.4s var(--ds-ease-out) ${0.1 + i * 0.1}s both`,
                    }}
                  >
                    <span style={{ color: row.level === "Strong" ? CYAN : "#FBBF24", fontSize: 13 }}>
                      {row.level === "Strong" ? "✓" : "◐"}
                    </span>
                    <span style={{ flex: 1, fontFamily: SANS, fontSize: 13, color: "#CBD5E1" }}>{row.skill}</span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10.5,
                        color: row.level === "Strong" ? CYAN : "#FBBF24",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {row.level}
                    </span>
                  </div>
                ))}
                <p style={{ margin: "12px 0 0", fontFamily: SANS, fontSize: 12.5, color: DIM, lineHeight: 1.6 }}>
                  In the full platform, every mission updates this scorecard — and SPARK
                  drills your weakest dimension next.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const [ref, inView] = useInView(0.3);
  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        padding: "130px 24px 120px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Glow ring */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: 680,
          height: 680,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.13) 0%, rgba(34,211,238,0.05) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Particles count={12} />
      <div
        style={{
          position: "relative",
          maxWidth: 760,
          margin: "0 auto",
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(28px)",
          transition: "opacity 0.8s var(--ds-ease-out), transform 0.8s var(--ds-ease-out)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(30px, 5vw, 54px)",
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            color: WHITE,
          }}
        >
          Your next data role won&rsquo;t ask you to reverse a linked list.
        </h2>
        <p
          style={{
            margin: "18px auto 36px",
            fontFamily: SANS,
            fontSize: "clamp(16px, 2vw, 19px)",
            color: GRAY,
            maxWidth: 580,
            lineHeight: 1.65,
          }}
        >
          It will ask you why churn rose 15% in EMEA — and what you&rsquo;d do about it.{" "}
          <span style={{ color: WHITE, fontWeight: 600 }}>Train for that.</span>
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <EmailCapture compact />
        </div>
        <p style={{ margin: "14px 0 0", fontFamily: MONO, fontSize: 11.5, color: DIM }}>
          Early access · Cohort 02 · Limited seats
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${BORDER_SOFT}`,
        padding: "26px 24px",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1120,
        margin: "0 auto",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: GRAY }}>
        <SparkMark size={18} />
        DataSpark
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: "#334155" }}>
        © 2026 DataSpark · dataspark-prep.com
      </span>
    </footer>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPageV2() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", background: INK, color: WHITE, overflowX: "hidden" }}>
      <style>{`
        @keyframes ds2-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ds2-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes ds2-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes ds2-throb {
          0%, 100% { box-shadow: 0 0 18px rgba(248,113,113,0.25); }
          50% { box-shadow: 0 0 34px rgba(248,113,113,0.55); }
        }
        @keyframes ds2-particle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.7); }
          50% { opacity: 0.85; transform: translateY(-14px) scale(1); }
        }
        .ds2-cta:hover { box-shadow: 0 0 40px rgba(168,85,247,0.7) !important; transform: translateY(-1px); }
        .ds2-choice:hover { border-color: rgba(34,211,238,0.5) !important; background: rgba(34,211,238,0.06) !important; }
        @media (max-width: 760px) { .ds2-vs { display: none !important; } }
      `}</style>

      {/* Page-level atmosphere */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 800px 500px at 80% -10%, rgba(168,85,247,0.08), transparent 65%)," +
            "radial-gradient(ellipse 700px 460px at 10% 30%, rgba(34,211,238,0.05), transparent 65%)",
        }}
      />

      <Hero />
      <TransformSection />
      <ContrastSection />
      <ChatSimulator />
      <FinalCTA />
      <Footer />
    </div>
  );
}
