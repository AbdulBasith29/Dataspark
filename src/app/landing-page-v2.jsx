import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════
// DataSpark — Cinematic Landing v2.1
// "The Old Way vs. The DataSpark Way"
// Persistent ambient motion: 3D canvas starfield, nebula drift, perspective
// grid floor, mouse-parallax fragments, 3D card tilt. No external packages.
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

const TICKER_ITEMS = [
  "System design",
  "Root-cause drills",
  "Executive narrative",
  "A/B judgement calls",
  "Metric trees",
  "SQL under pressure",
  "Case interviews",
  "Stakeholder pushback",
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
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

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

// 3D tilt — element rotates toward the cursor like a physical card
function useTilt(max = 8) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform 0.08s linear";
      el.style.transform = `perspective(950px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    };
    const leave = () => {
      el.style.transition = "transform 0.6s var(--ds-ease-out)";
      el.style.transform = "perspective(950px) rotateX(0deg) rotateY(0deg)";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return ref;
}

// Sets --mx / --my (-1..1) on the element from pointer position — children
// consume them at different multipliers for layered parallax depth.
function useParallaxVars() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);
  return ref;
}

// ── Ambient layer 1: 3D starfield canvas (always moving) ─────────────────────
function CinematicBackground() {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = window.innerWidth < 760 ? 80 : 150;
    const COLORS = [
      [226, 232, 240], [226, 232, 240], [226, 232, 240], [226, 232, 240],
      [168, 85, 247], [34, 211, 238],
    ];
    const stars = Array.from({ length: N }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 0.9 + 0.1,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      tw: 0.6 + Math.random() * 1.8, // twinkle speed
      ph: Math.random() * Math.PI * 2,
    }));

    // camera eases toward the pointer for parallax depth
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e) => {
      tx = e.clientX / w - 0.5;
      ty = e.clientY / h - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf;
    let last = performance.now();
    const pts = new Array(N);

    const tick = (now) => {
      const dt = Math.min(33, now - last) / 1000;
      last = now;
      mx += (tx - mx) * 0.035;
      my += (ty - my) * 0.035;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < N; i += 1) {
        const s = stars[i];
        s.z -= dt * 0.022; // perpetual drift toward the viewer
        if (s.z <= 0.08) {
          s.z = 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
        }
        const div = s.z * 1.6 + 0.25;
        const px = cx + (s.x * w * 0.6) / div - mx * 46 * (1 - s.z);
        const py = cy + (s.y * h * 0.6) / div - my * 46 * (1 - s.z);
        if (px < -40 || px > w + 40 || py < -40 || py > h + 40) {
          pts[i] = null;
          continue;
        }
        const size = 1.9 * (1 - s.z) + 0.35;
        const twinkle = 0.7 + 0.3 * Math.sin(now * 0.001 * s.tw + s.ph);
        const a = clamp01((1 - s.z) * 1.05 + 0.06) * twinkle;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${a.toFixed(3)})`;
        ctx.fill();
        pts[i] = { x: px, y: py, a, near: s.z < 0.55 };
      }

      // constellation lines between nearby foreground stars
      ctx.lineWidth = 0.6;
      for (let i = 0; i < N; i += 1) {
        const p1 = pts[i];
        if (!p1 || !p1.near) continue;
        for (let j = i + 1; j < N; j += 1) {
          const p2 = pts[j];
          if (!p2 || !p2.near) continue;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 8100) {
            const alpha = (1 - Math.sqrt(d2) / 90) * 0.1;
            ctx.strokeStyle = `rgba(148,163,255,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ── Ambient layer 2: huge drifting nebula glows ──────────────────────────────
function NebulaOrbs() {
  const orb = (anim, size, gradient, blur = 90, opacity = 0.55) => ({
    position: "fixed",
    width: size,
    height: size,
    borderRadius: "50%",
    background: gradient,
    filter: `blur(${blur}px)`,
    opacity,
    pointerEvents: "none",
    zIndex: 0,
    animation: anim,
    willChange: "transform",
  });
  return (
    <div aria-hidden>
      <div
        style={{
          ...orb(
            "ds2-drift-a 34s ease-in-out infinite alternate",
            "52vw",
            "radial-gradient(circle, rgba(168,85,247,0.16), transparent 65%)"
          ),
          top: "-18vw",
          right: "-14vw",
        }}
      />
      <div
        style={{
          ...orb(
            "ds2-drift-b 44s ease-in-out infinite alternate",
            "46vw",
            "radial-gradient(circle, rgba(34,211,238,0.10), transparent 65%)"
          ),
          top: "34vh",
          left: "-16vw",
        }}
      />
      <div
        style={{
          ...orb(
            "ds2-drift-c 52s ease-in-out infinite alternate",
            "40vw",
            "radial-gradient(circle, rgba(99,102,241,0.12), transparent 65%)"
          ),
          bottom: "-14vw",
          right: "8vw",
        }}
      />
    </div>
  );
}

// ── Hero floor: animated perspective grid (synth horizon) ────────────────────
function GridFloor() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "-25%",
        right: "-25%",
        bottom: 0,
        height: "36vh",
        overflow: "hidden",
        pointerEvents: "none",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 45%, black 80%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 45%, black 80%, transparent 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-60% 0 0 0",
          transform: "perspective(480px) rotateX(63deg)",
          transformOrigin: "50% 100%",
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.22) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(34,211,238,0.16) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          animation: "ds2-grid 1.9s linear infinite",
        }}
      />
    </div>
  );
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
        background: "rgba(10,12,24,0.55)",
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

// ── Hero floating fragments — glass UI shards drifting in 3D space ───────────
function HeroFragments() {
  const frag = (depth, float, extra) => ({
    position: "absolute",
    transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${Math.round(depth * 0.7)}px), 0)`,
    willChange: "transform",
    pointerEvents: "none",
    ...extra,
  });
  const glass = {
    borderRadius: 14,
    border: `1px solid ${BORDER}`,
    background: "rgba(10,14,28,0.62)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  };
  return (
    <div className="ds2-frags" aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* EMEA churn alert card */}
      <div style={frag(-34, 0, { top: "16%", right: "3%" })}>
        <div style={{ animation: "ds2-float 7s ease-in-out infinite", ...glass, padding: "13px 16px", width: 215 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: DIM, textTransform: "uppercase" }}>
              churn_by_region
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: RED }}>+15.1%</span>
          </div>
          <svg width="183" height="46" viewBox="0 0 183 46">
            <defs>
              <linearGradient id="ds2-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={RED} stopOpacity="0.35" />
                <stop offset="100%" stopColor={RED} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 34 L26 30 L52 32 L78 27 L104 29 L130 18 L156 12 L183 4 L183 46 L0 46 Z" fill="url(#ds2-spark-fill)" />
            <path d="M0 34 L26 30 L52 32 L78 27 L104 29 L130 18 L156 12 L183 4" stroke={RED} strokeWidth="1.6" fill="none" />
            <circle cx="183" cy="4" r="3" fill={RED}>
              <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div style={{ marginTop: 7, fontFamily: SANS, fontSize: 11, color: GRAY }}>
            EMEA · Q3 anomaly detected
          </div>
        </div>
      </div>

      {/* SPARK question bubble */}
      <div style={frag(-56, 0, { top: "47%", right: "13%" })}>
        <div style={{ animation: "ds2-float 9s ease-in-out 0.8s infinite", ...glass, padding: "11px 15px", width: 235, borderColor: "rgba(168,85,247,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }} />
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: PURPLE, textTransform: "uppercase" }}>
              spark · agent
            </span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: "#E2E8F0", lineHeight: 1.55 }}>
            “Why would pricing only hit EMEA? What would you segment by first?”
          </div>
        </div>
      </div>

      {/* Scorecard chip */}
      <div style={frag(-22, 0, { top: "72%", right: "2%" })}>
        <div style={{ animation: "ds2-float 8s ease-in-out 1.6s infinite", ...glass, padding: "11px 15px", width: 195, borderColor: "rgba(34,211,238,0.3)" }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: CYAN, textTransform: "uppercase", marginBottom: 8 }}>
            mission scorecard
          </div>
          {[
            ["Hypothesis framing", 92],
            ["Segmentation", 88],
          ].map(([label, pct]) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 10.5, color: GRAY, marginBottom: 3 }}>
                {label}
                <span style={{ color: WHITE, fontFamily: MONO, fontSize: 9.5 }}>{pct}</span>
              </div>
              <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: GRADIENT_TEXT }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const parallaxRef = useParallaxVars();
  return (
    <header
      ref={parallaxRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GridFloor />
      <HeroFragments />

      <div style={{ position: "relative", zIndex: 1, padding: "0 24px", maxWidth: 1120, margin: "0 auto", width: "100%", boxSizing: "border-box", flex: 1, display: "flex", flexDirection: "column" }}>
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

        {/* Hero body — centered-low: sky above, statement below */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 0, paddingBottom: 90 }}>
          <div style={{ animation: "ds2-rise 0.55s var(--ds-ease-out) 0.08s both", marginBottom: 28 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: CYAN,
                border: `1px solid rgba(34,211,238,0.25)`,
                background: "rgba(34,211,238,0.04)",
                borderRadius: 999,
                padding: "6px 14px",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: CYAN,
                  animation: "ds2-blink 1.6s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              Early access · Cohort 02 opening soon
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 22px",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "clamp(52px, 9vw, 106px)",
              lineHeight: 0.97,
              letterSpacing: "-0.045em",
              color: WHITE,
              maxWidth: 960,
              animation: "ds2-rise 0.65s var(--ds-ease-out) 0.14s both",
            }}
          >
            Stop grinding<br />
            <span style={{ color: "rgba(248,250,252,0.45)" }}>questions.</span>
            <br />
            <span style={{
              background: `linear-gradient(110deg, ${WHITE} 0%, rgba(168,85,247,0.85) 55%, ${CYAN} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}>
              Start solving systems.
            </span>
          </h1>

          <p
            style={{
              margin: "0 0 32px",
              fontFamily: SANS,
              fontSize: "clamp(15px, 1.6vw, 17px)",
              lineHeight: 1.7,
              color: "#64748B",
              maxWidth: 500,
              animation: "ds2-rise 0.6s var(--ds-ease-out) 0.26s both",
              letterSpacing: "0.01em",
            }}
          >
            Real interviews don't ask you to reverse a linked list.
            They ask you to{" "}
            <span style={{ color: GRAY }}>
              investigate business problems and defend your reasoning.
            </span>
          </p>

          <div style={{ animation: "ds2-rise 0.6s var(--ds-ease-out) 0.36s both", marginBottom: 24 }}>
            <EmailCapture />
            <p style={{ margin: "10px 2px 0", fontFamily: MONO, fontSize: 10.5, color: "#334155" }}>
              Free during early access · No credit card
            </p>
          </div>

          <div style={{ animation: "ds2-rise 0.6s var(--ds-ease-out) 0.46s both" }}>
            <KineticBadge />
          </div>
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
          zIndex: 1,
        }}
      >
        Scroll to see the difference
        <span style={{ animation: "ds2-bob 1.8s ease-in-out infinite", color: CYAN }}>↓</span>
      </div>
    </header>
  );
}

// ── Skills ticker — perpetual marquee between sections ───────────────────────
function Ticker() {
  const row = TICKER_ITEMS.concat(TICKER_ITEMS);
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        borderTop: `1px solid ${BORDER_SOFT}`,
        borderBottom: `1px solid ${BORDER_SOFT}`,
        background: "rgba(8,10,22,0.5)",
        overflow: "hidden",
        padding: "15px 0",
        maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div style={{ display: "flex", gap: 52, width: "max-content", animation: "ds2-marquee 30s linear infinite" }}>
        {row.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 52,
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: i % 2 ? DIM : GRAY,
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span style={{ color: i % 2 ? PURPLE : CYAN, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Oversized metrics strip ───────────────────────────────────────────────────
function MetricsStrip() {
  const [ref, inView] = useInView(0.4);
  const n1 = useCountUp(847, inView, 1400);
  const n2 = useCountUp(285, inView, 1600);
  const metrics = [
    { num: n1, suffix: "", label: "professionals active" },
    { num: n2, suffix: "+", label: "scenario missions" },
    { num: 4, suffix: "", label: "domains · Python · SQL · ML · Stats" },
  ];
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 24px 90px",
        maxWidth: 1120,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0",
          borderTop: `1px solid ${BORDER_SOFT}`,
          borderBottom: `1px solid ${BORDER_SOFT}`,
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              padding: "48px 32px",
              borderLeft: i === 0 ? "none" : `1px solid ${BORDER_SOFT}`,
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(20px)",
              transition: `opacity 0.7s var(--ds-ease-out) ${i * 0.1}s, transform 0.7s var(--ds-ease-out) ${i * 0.1}s`,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "clamp(52px, 6vw, 80px)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: WHITE,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 12,
              }}
            >
              {m.num.toLocaleString()}{m.suffix}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: DIM,
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
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
  const stageTilt = lerp(9, 0, seg(p, 0, 0.35)); // stage levels out as you scroll

  return (
    <section ref={wrapRef} style={{ position: "relative", height: "260vh", zIndex: 1 }}>
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
              fontSize: "clamp(30px, 4.5vw, 52px)",
              letterSpacing: "-0.04em",
              color: WHITE,
              lineHeight: 1.06,
            }}
          >
            {boxesOut < 0.5 ? "This is what practice looks like today." : "This is what interviews actually test."}
          </h2>
          <p style={{ margin: "10px 0 0", fontFamily: SANS, fontSize: 15, color: GRAY }}>
            Keep scrolling — watch isolated problems become a system.
          </p>
        </div>

        {/* Stage */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 980,
            height: "min(54vh, 480px)",
            transform: `perspective(1100px) rotateX(${stageTilt}deg)`,
            transformOrigin: "50% 100%",
            willChange: "transform",
          }}
        >
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
                  animation: `ds2-float ${7 + i}s ease-in-out ${i * 0.7}s infinite`,
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

// ── Product showcase — auto-playing "video" demos of the platform ────────────
const DEMO_TABS = [
  { id: "mission", label: "Solve a mission", dur: 13000 },
  { id: "tutor", label: "Get drilled by SPARK", dur: 12500 },
  { id: "score", label: "Watch your scorecard", dur: 11000 },
];

const MISSION_SQL =
  "SELECT plan_tier, COUNT(*) AS churned\nFROM churn_q3\nWHERE region = 'EMEA'\nGROUP BY plan_tier\nORDER BY churned DESC;";

const MISSION_ROWS = [
  { tier: "SMB", n: "1,204", pct: 100 },
  { tier: "Mid-market", n: "312", pct: 26 },
  { tier: "Enterprise", n: "88", pct: 7 },
];

const MISSION_LESSONS = ["Window functions", "Diagnose EMEA churn", "Index tuning", "NULL three-valued logic"];

const TUTOR_MSG_1 =
  "You said pricing caused the EMEA churn. The price change was global. Why did only EMEA react?";
const TUTOR_CHIPS = ["EMEA has more annual plans", "Currency conversion hit", "Just a coincidence"];
const TUTOR_MSG_2 =
  "Better. Annual plans renew once a year — so a May price change hits EMEA's renewal-heavy Q3 hardest. Now: how would you verify the renewal mix?";

// Master clock for a demo scene — loops 0→1 over `duration`, only while running
function useDemoLoop(duration, running, onLoop) {
  const [t, setT] = useState(0);
  const onLoopRef = useRef(onLoop);
  onLoopRef.current = onLoop;
  useEffect(() => {
    if (!running) return undefined;
    let raf;
    const start = performance.now();
    let lastT = 0;
    const tick = (now) => {
      const nt = ((now - start) % duration) / duration;
      if (nt < lastT && onLoopRef.current) onLoopRef.current();
      lastT = nt;
      setT(nt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, running]);
  return t;
}

// Scripted cursor — glides between waypoints and ripples on click
function DemoCursor({ t, waypoints }) {
  let wp = waypoints[0];
  for (const w of waypoints) {
    if (t >= w.at) wp = w;
    else break;
  }
  const rippling = wp.click && t - wp.at < 0.06;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: `${wp.x}%`,
        top: `${wp.y}%`,
        zIndex: 6,
        pointerEvents: "none",
        transition: "left 0.75s var(--ds-ease-in-out), top 0.75s var(--ds-ease-in-out)",
      }}
    >
      {rippling && (
        <span
          key={wp.at}
          style={{
            position: "absolute",
            left: -9,
            top: -9,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: `2px solid ${CYAN}`,
            animation: "ds2-ripple 0.5s var(--ds-ease-out) both",
          }}
        />
      )}
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
        <path d="M5 3 L19 12 L12 13 L9 20 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

const demoPanelStyle = {
  borderRadius: 10,
  border: `1px solid ${BORDER_SOFT}`,
  background: "rgba(2,6,23,0.72)",
};

// Scene 1 — pick a mission, SQL types itself, run, results + SPARK nudge
function MissionDemo({ t }) {
  const typed = MISSION_SQL.slice(0, Math.floor(seg(t, 0.12, 0.48) * MISSION_SQL.length));
  const lessonActive = t > 0.07;
  const ran = t > 0.58;
  const toast = t > 0.78 && t < 0.97;
  return (
    <div style={{ position: "relative", display: "flex", height: "100%", fontFamily: SANS }}>
      <DemoCursor
        t={t}
        waypoints={[
          { at: 0, x: 32, y: 58 },
          { at: 0.02, x: 12, y: 27 },
          { at: 0.07, x: 12, y: 27, click: true },
          { at: 0.13, x: 52, y: 42 },
          { at: 0.5, x: 88, y: 26 },
          { at: 0.56, x: 88, y: 26, click: true },
          { at: 0.64, x: 58, y: 80 },
        ]}
      />
      {/* Sidebar */}
      <div className="ds2-demo-side" style={{ width: 168, borderRight: `1px solid ${BORDER_SOFT}`, padding: "12px 10px", flexShrink: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, padding: "0 6px 10px" }}>
          SQL · Missions
        </div>
        {MISSION_LESSONS.map((l, i) => {
          const active = i === 1 && lessonActive;
          return (
            <div
              key={l}
              style={{
                padding: "8px 9px",
                borderRadius: 8,
                marginBottom: 3,
                fontSize: 11.5,
                color: active ? WHITE : "#64748B",
                background: active ? "rgba(168,85,247,0.16)" : "transparent",
                border: `1px solid ${active ? "rgba(168,85,247,0.4)" : "transparent"}`,
                transition: "all 0.3s var(--ds-ease-out)",
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: GRAY, padding: "7px 11px", ...demoPanelStyle, borderColor: "rgba(168,85,247,0.25)" }}>
          <span style={{ color: PURPLE, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", marginRight: 8 }}>MISSION</span>
          EMEA churn spiked 15% — find which segment drives it.
        </div>
        <div style={{ position: "relative", flex: 1, ...demoPanelStyle, padding: "10px 12px", overflow: "hidden" }}>
          <button
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "none",
              borderRadius: 7,
              padding: "5px 13px",
              fontSize: 10.5,
              fontWeight: 700,
              fontFamily: SANS,
              color: ran ? "#0B0314" : GRAY,
              background: ran ? GRADIENT_TEXT : "rgba(255,255,255,0.06)",
              transition: "all 0.3s",
              pointerEvents: "none",
            }}
          >
            ▶ Run
          </button>
          <pre style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.65, color: "#C7D2FE", whiteSpace: "pre-wrap" }}>
            {typed}
            {t > 0.12 && t < 0.5 && <span style={{ color: CYAN, animation: "ds2-blink 0.8s steps(1) infinite" }}>▍</span>}
          </pre>
        </div>
        <div style={{ ...demoPanelStyle, padding: "10px 12px", minHeight: 92 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: ran ? CYAN : "#1E293B", marginBottom: 8, transition: "color 0.4s" }}>
            {ran ? "3 rows · 0.21s" : "results"}
          </div>
          {MISSION_ROWS.map((row, i) => {
            const vis = seg(t, 0.6 + i * 0.05, 0.72 + i * 0.05);
            return (
              <div key={row.tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, opacity: vis }}>
                <span style={{ width: 78, fontSize: 11, color: "#CBD5E1", flexShrink: 0 }}>{row.tier}</span>
                <div style={{ flex: 1, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${row.pct * vis}%`, borderRadius: 99, background: i === 0 ? "linear-gradient(90deg, #F87171, #FB923C)" : GRADIENT_TEXT }} />
                </div>
                <span style={{ width: 44, fontFamily: MONO, fontSize: 10.5, color: WHITE, textAlign: "right" }}>{row.n}</span>
              </div>
            );
          })}
        </div>
        {toast && (
          <div
            style={{
              position: "absolute",
              right: 14,
              bottom: 14,
              maxWidth: 250,
              padding: "10px 13px",
              borderRadius: 11,
              border: "1px solid rgba(168,85,247,0.45)",
              background: "rgba(13,8,28,0.96)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.6), 0 0 24px rgba(168,85,247,0.2)",
              fontSize: 11.5,
              lineHeight: 1.55,
              color: "#E2E8F0",
              animation: "ds2-pop 0.4s var(--ds-ease-out) both",
              zIndex: 4,
            }}
          >
            <span style={{ color: PURPLE, fontWeight: 700 }}>✦ SPARK:</span> SMB drives 75% of it. Good. Now —{" "}
            <em>why</em> SMB?
          </div>
        )}
      </div>
    </div>
  );
}

// Scene 2 — SPARK pushes back on your reasoning
function TutorDemo({ t }) {
  const typed1 = TUTOR_MSG_1.slice(0, Math.floor(seg(t, 0.03, 0.26) * TUTOR_MSG_1.length));
  const chipsVisible = t > 0.28 && t < 0.46;
  const answered = t > 0.46;
  const typed2 = TUTOR_MSG_2.slice(0, Math.floor(seg(t, 0.52, 0.88) * TUTOR_MSG_2.length));
  const bubble = (mine) => ({
    alignSelf: mine ? "flex-end" : "flex-start",
    maxWidth: "82%",
    padding: "10px 14px",
    borderRadius: mine ? "13px 13px 4px 13px" : "13px 13px 13px 4px",
    background: mine ? "rgba(34,211,238,0.1)" : "rgba(168,85,247,0.08)",
    border: `1px solid ${mine ? "rgba(34,211,238,0.3)" : "rgba(168,85,247,0.25)"}`,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: mine ? "#CFFAFE" : "#E2E8F0",
    fontFamily: SANS,
  });
  return (
    <div style={{ position: "relative", height: "100%", padding: 16, display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}>
      <DemoCursor
        t={t}
        waypoints={[
          { at: 0, x: 78, y: 82 },
          { at: 0.32, x: 30, y: 56 },
          { at: 0.42, x: 30, y: 56, click: true },
          { at: 0.52, x: 80, y: 86 },
        ]}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${BORDER_SOFT}` }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }} />
        <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: GRAY }}>SPARK · pushing back on your hypothesis</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
        {t > 0.03 && (
          <div style={bubble(false)}>
            {typed1}
            {t < 0.26 && <span style={{ color: CYAN, animation: "ds2-blink 0.8s steps(1) infinite" }}>▍</span>}
          </div>
        )}
        {chipsVisible && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TUTOR_CHIPS.map((c, i) => (
              <div
                key={c}
                style={{
                  padding: "9px 13px",
                  borderRadius: 10,
                  border: `1px solid ${i === 0 && t > 0.4 ? "rgba(34,211,238,0.55)" : BORDER}`,
                  background: i === 0 && t > 0.4 ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.025)",
                  fontSize: 12,
                  color: WHITE,
                  fontFamily: SANS,
                  animation: `ds2-rise 0.35s var(--ds-ease-out) ${i * 0.07}s both`,
                  transition: "all 0.25s",
                }}
              >
                <span style={{ color: CYAN, fontFamily: MONO, fontSize: 10.5, marginRight: 8 }}>{"ABC"[i]}</span>
                {c}
              </div>
            ))}
          </div>
        )}
        {answered && <div style={{ ...bubble(true), animation: "ds2-rise 0.3s var(--ds-ease-out) both" }}>{TUTOR_CHIPS[0]}</div>}
        {t > 0.52 && (
          <div style={bubble(false)}>
            {typed2}
            {t < 0.88 && <span style={{ color: CYAN, animation: "ds2-blink 0.8s steps(1) infinite" }}>▍</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Scene 3 — the scorecard assembles itself, then gets shared
function ScorecardDemo({ t }) {
  const CIRC = 2 * Math.PI * 46;
  const ringFill = 0.84 * seg(t, 0.06, 0.42);
  const score = Math.round(84 * seg(t, 0.06, 0.42));
  const badge = t > 0.6;
  const copied = t > 0.82 && t < 0.98;
  return (
    <div style={{ position: "relative", height: "100%", padding: 18, display: "flex", gap: 18, alignItems: "center", boxSizing: "border-box", fontFamily: SANS }}>
      <DemoCursor
        t={t}
        waypoints={[
          { at: 0, x: 18, y: 18 },
          { at: 0.66, x: 50, y: 86 },
          { at: 0.76, x: 50, y: 86, click: true },
          { at: 0.84, x: 68, y: 66 },
        ]}
      />
      {/* Ring */}
      <div style={{ position: "relative", width: 132, flexShrink: 0, textAlign: "center" }}>
        <svg width="132" height="132" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="55"
            cy="55"
            r="46"
            fill="none"
            stroke="url(#ds2-ring-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - ringFill)}
            transform="rotate(-90 55 55)"
          />
          <defs>
            <linearGradient id="ds2-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={PURPLE} />
              <stop offset="100%" stopColor={CYAN} />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 27, fontWeight: 700, color: WHITE, fontVariantNumeric: "tabular-nums" }}>{score}</span>
          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.18em", color: DIM, textTransform: "uppercase" }}>readiness</span>
        </div>
        {badge && (
          <div
            style={{
              marginTop: 10,
              display: "inline-block",
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid rgba(34,211,238,0.45)",
              background: "rgba(34,211,238,0.08)",
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: CYAN,
              animation: "ds2-pop 0.45s var(--ds-ease-out) both",
            }}
          >
            Interview ready
          </div>
        )}
      </div>
      {/* Bars + share */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        {SIM_SCORECARD.map((row, i) => {
          const fill = seg(t, 0.18 + i * 0.09, 0.46 + i * 0.09);
          return (
            <div key={row.skill}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: GRAY, marginBottom: 4 }}>
                {row.skill}
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: WHITE }}>{Math.round(row.pct * fill)}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
                <div style={{ height: "100%", width: `${row.pct * fill}%`, borderRadius: 99, background: GRADIENT_TEXT }} />
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <button
            style={{
              border: "none",
              borderRadius: 9,
              padding: "9px 18px",
              fontSize: 11.5,
              fontWeight: 700,
              fontFamily: SANS,
              color: t > 0.76 ? "#0B0314" : WHITE,
              background: t > 0.76 ? GRADIENT_TEXT : "rgba(255,255,255,0.07)",
              transition: "all 0.3s",
              pointerEvents: "none",
            }}
          >
            Share scorecard
          </button>
          {copied && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                color: CYAN,
                animation: "ds2-pop 0.35s var(--ds-ease-out) both",
              }}
            >
              ✓ link copied — send it to recruiters
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ShowcaseSection() {
  const [ref, inView] = useInView(0.2);
  const tilt = useTilt(3);
  const [tab, setTab] = useState(0);
  const autoRef = useRef(true);
  const onLoop = useCallback(() => {
    if (autoRef.current) setTab((v) => (v + 1) % DEMO_TABS.length);
  }, []);
  const t = useDemoLoop(DEMO_TABS[tab].dur, inView, onLoop);
  const pickTab = (i) => {
    autoRef.current = false; // user took the remote — stop auto-advancing
    setTab(i);
  };

  return (
    <section ref={ref} style={{ position: "relative", zIndex: 1, padding: "130px 24px", maxWidth: 1120, margin: "0 auto" }}>
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(24px)",
          transition: "opacity 0.7s var(--ds-ease-out), transform 0.7s var(--ds-ease-out)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SectionKicker>Inside the platform</SectionKicker>
        </div>
        <h2
          style={{
            margin: "16px 0 12px",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 60px)",
            letterSpacing: "-0.04em",
            color: WHITE,
            lineHeight: 1.04,
          }}
        >
          See DataSpark{" "}
          <span style={{
            background: `linear-gradient(110deg, ${WHITE} 0%, ${CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}>in action.</span>
        </h2>
        <p style={{ margin: "0 auto", fontFamily: SANS, fontSize: 16, color: GRAY, maxWidth: 540, lineHeight: 1.65 }}>
          Auto-playing previews of the real product — missions, the SPARK agent, and
          your live scorecard.
        </p>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          marginBottom: 22,
          opacity: inView ? 1 : 0,
          transition: "opacity 0.7s var(--ds-ease-out) 0.1s",
        }}
      >
        {DEMO_TABS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => pickTab(i)}
            style={{
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${i === tab ? "rgba(168,85,247,0.5)" : BORDER}`,
              borderRadius: 10,
              padding: "10px 18px",
              background: i === tab ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)",
              color: i === tab ? WHITE : GRAY,
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {d.label}
            {i === tab && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  height: 2,
                  width: `${t * 100}%`,
                  background: GRADIENT_TEXT,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Browser frame */}
      <div
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(32px)",
          transition: "opacity 0.8s var(--ds-ease-out) 0.15s, transform 0.8s var(--ds-ease-out) 0.15s",
        }}
      >
        <div
          ref={tilt}
          style={{
            maxWidth: 860,
            margin: "0 auto",
            borderRadius: 16,
            border: "1px solid transparent",
            background:
              `linear-gradient(rgba(8,10,20,0.96), rgba(8,10,20,0.96)) padding-box, ` +
              `linear-gradient(150deg, rgba(168,85,247,0.45), rgba(34,211,238,0.45)) border-box`,
            boxShadow: "0 30px 90px rgba(0,0,0,0.6), 0 0 70px rgba(168,85,247,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Chrome bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 16px",
              borderBottom: `1px solid ${BORDER_SOFT}`,
            }}
          >
            <span style={{ display: "flex", gap: 6 }}>
              {["#F87171", "#FBBF24", "#34D399"].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
            </span>
            <span
              style={{
                flex: 1,
                maxWidth: 320,
                margin: "0 auto",
                padding: "5px 14px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                fontFamily: MONO,
                fontSize: 10.5,
                color: DIM,
                textAlign: "center",
              }}
            >
              dataspark-prep.com/platform
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 9.5, color: RED, letterSpacing: "0.14em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, animation: "ds2-blink 1.4s steps(1) infinite" }} />
              LIVE
            </span>
          </div>
          {/* Scene viewport */}
          <div style={{ height: 380, position: "relative" }}>
            {tab === 0 && <MissionDemo t={t} />}
            {tab === 1 && <TutorDemo t={t} />}
            {tab === 2 && <ScorecardDemo t={t} />}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── The Core Contrast — Code Grind vs Decision Lab ───────────────────────────
function ContrastSection() {
  const [ref, inView] = useInView(0.2);
  const [hovered, setHovered] = useState(-1);
  const grindTilt = useTilt(5);
  const labTilt = useTilt(7);

  return (
    <section ref={ref} style={{ position: "relative", zIndex: 1, padding: "130px 24px", maxWidth: 1120, margin: "0 auto" }}>
      {/* Second-read moment: massive background "VS" */}
      <div aria-hidden style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -44%)",
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: "clamp(180px, 24vw, 340px)",
        letterSpacing: "-0.06em",
        color: "rgba(255,255,255,0.018)",
        userSelect: "none",
        pointerEvents: "none",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}>
        VS
      </div>

      <div style={{ textAlign: "center", marginBottom: 56, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SectionKicker>Two ways to prepare</SectionKicker>
        </div>
        <h2
          style={{
            margin: "18px 0 0",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(30px, 5vw, 58px)",
            letterSpacing: "-0.04em",
            color: WHITE,
            lineHeight: 1.04,
          }}
        >
          One builds coders.
          <br />
          <span style={{
            background: `linear-gradient(110deg, ${WHITE} 0%, ${PURPLE} 50%, ${CYAN} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}>One builds leaders.</span>
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
            animation: "ds2-vs-pulse 3s ease-in-out infinite",
          }}
        >
          VS
        </div>

        {/* THE CODE GRIND */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(28px)",
            transition: "opacity 0.7s var(--ds-ease-out), transform 0.7s var(--ds-ease-out)",
          }}
        >
          <div
            ref={grindTilt}
            style={{
              borderRadius: 20,
              border: `1px solid ${BORDER_SOFT}`,
              background: "rgba(10,12,22,0.6)",
              padding: "30px 28px",
              height: "100%",
              boxSizing: "border-box",
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
        </div>

        {/* THE DECISION LAB */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(28px)",
            transition: "opacity 0.7s var(--ds-ease-out) 0.12s, transform 0.7s var(--ds-ease-out) 0.12s",
          }}
        >
          <div
            ref={labTilt}
            style={{
              position: "relative",
              borderRadius: 20,
              border: "1px solid transparent",
              background:
                `linear-gradient(rgba(8,10,22,0.95), rgba(8,10,22,0.95)) padding-box, ` +
                `linear-gradient(140deg, rgba(168,85,247,0.65), rgba(34,211,238,0.65)) border-box`,
              padding: "30px 28px",
              height: "100%",
              boxSizing: "border-box",
              boxShadow: "0 0 60px rgba(168,85,247,0.12), 0 24px 70px rgba(0,0,0,0.5)",
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
      </div>
    </section>
  );
}

// ── Interactive "AI Asks Why" simulator ──────────────────────────────────────
function ChatSimulator() {
  const [secRef, inView] = useInView(0.15);
  const dashTilt = useTilt(4);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]); // {role:'ai'|'user', text}
  const [phase, setPhase] = useState("idle"); // idle | q1 | q2 | done
  const [choicesOpen, setChoicesOpen] = useState(false);
  const queueRef = useRef([]); // pending AI messages [{text, phase}]
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
    <section ref={secRef} style={{ position: "relative", zIndex: 1, padding: "130px 24px", maxWidth: 1120, margin: "0 auto" }}>
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
            fontSize: "clamp(32px, 5vw, 58px)",
            letterSpacing: "-0.04em",
            color: WHITE,
            lineHeight: 1.04,
            maxWidth: 700,
          }}
        >
          The AI that doesn&rsquo;t give you answers.
          <br />
          It asks you <span style={{ color: CYAN, fontStyle: "italic" }}>why.</span>
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
          ref={dashTilt}
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
                <div style={{ fontSize: 26, marginBottom: 10, animation: "ds2-bob 2.4s ease-in-out infinite" }}>◎</div>
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
        zIndex: 1,
        padding: "150px 24px 130px",
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
      {/* Slowly rotating orbit rings */}
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          width: 620,
          height: 620,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          animation: "ds2-spin 70s linear infinite",
          opacity: 0.5,
        }}
      >
        <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(168,85,247,0.22)" strokeWidth="1" strokeDasharray="3 14" />
        <circle cx="300" cy="300" r="290" fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth="1" strokeDasharray="2 18" />
        <circle cx="300" cy="60" r="3" fill={PURPLE} />
        <circle cx="540" cy="380" r="2.4" fill={CYAN} />
      </svg>
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
        <p style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: DIM,
          marginBottom: 28,
        }}>
          — The only question that matters —
        </p>
        <h2
          style={{
            margin: "0 0 10px",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(34px, 5.5vw, 66px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
            color: WHITE,
            maxWidth: 820,
          }}
        >
          Your next data role won&rsquo;t ask you to reverse a linked list.
        </h2>
        <p
          style={{
            margin: "22px auto 40px",
            fontFamily: SANS,
            fontSize: "clamp(16px, 1.8vw, 18px)",
            color: "#64748B",
            maxWidth: 540,
            lineHeight: 1.7,
            letterSpacing: "0.01em",
          }}
        >
          It will ask why churn rose 15% in EMEA — and what you&rsquo;d do about it.{" "}
          <span style={{ color: GRAY }}>Train for that.</span>
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
        position: "relative",
        zIndex: 1,
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
        @keyframes ds2-float {
          0%, 100% { transform: translateY(0) rotate(-0.4deg); }
          50% { transform: translateY(-11px) rotate(0.4deg); }
        }
        @keyframes ds2-throb {
          0%, 100% { box-shadow: 0 0 18px rgba(248,113,113,0.25); }
          50% { box-shadow: 0 0 34px rgba(248,113,113,0.55); }
        }
        @keyframes ds2-particle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.7); }
          50% { opacity: 0.85; transform: translateY(-14px) scale(1); }
        }
        @keyframes ds2-grid {
          from { background-position-y: 0; }
          to   { background-position-y: 46px; }
        }
        @keyframes ds2-marquee {
          to { transform: translateX(-50%); }
        }
        @keyframes ds2-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ds2-sheen {
          to { background-position: -220% 0; }
        }
        @keyframes ds2-ripple {
          from { transform: scale(0.4); opacity: 1; }
          to   { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ds2-pop {
          from { transform: scale(0.75) translateY(8px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes ds2-vs-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0,0,0,0.8); }
          50% { box-shadow: 0 0 30px rgba(0,0,0,0.8), 0 0 24px rgba(168,85,247,0.35); }
        }
        @keyframes ds2-drift-a {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to   { transform: translate3d(-9vw, 12vh, 0) scale(1.15); }
        }
        @keyframes ds2-drift-b {
          from { transform: translate3d(0, 0, 0) scale(1.1); }
          to   { transform: translate3d(11vw, -9vh, 0) scale(0.95); }
        }
        @keyframes ds2-drift-c {
          from { transform: translate3d(0, 0, 0) scale(0.95); }
          to   { transform: translate3d(-7vw, -11vh, 0) scale(1.12); }
        }
        .ds2-shimmer {
          background: linear-gradient(110deg, #F8FAFC 0%, #A855F7 40%, #22D3EE 75%, #F8FAFC 100%);
          background-size: 240% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ds2-sheen 8s linear infinite;
        }
        .ds2-cta:hover { box-shadow: 0 0 40px rgba(168,85,247,0.7) !important; transform: translateY(-1px); }
        .ds2-choice:hover { border-color: rgba(34,211,238,0.5) !important; background: rgba(34,211,238,0.06) !important; }
        @media (max-width: 760px) { .ds2-vs { display: none !important; } }
        @media (max-width: 1060px) { .ds2-frags { display: none !important; } }
        @media (max-width: 640px) { .ds2-demo-side { display: none !important; } }
      `}</style>

      {/* Ambient depth stack — always in motion behind content */}
      <CinematicBackground />
      <NebulaOrbs />

      {/* Vignette to frame the scene like a lens */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(2,2,8,0.55) 100%)",
        }}
      />

      <Hero />
      <Ticker />
      <MetricsStrip />
      <TransformSection />
      <ShowcaseSection />
      <ContrastSection />
      <ChatSimulator />
      <FinalCTA />
      <Footer />
    </div>
  );
}
