import { useEffect, useMemo, useRef, useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

/**
 * LearningParadigms — contrasts supervised / unsupervised / reinforcement
 * learning by what *feedback* the model receives. Same scatter of points,
 * three completely different signals:
 *   - supervised:   points carry their true colored label
 *   - unsupervised: points are gray; you (and the model) only see geometry
 *   - reinforcement: an agent walks a grid chasing a delayed reward
 * No props. Standalone canvas + paradigm selector.
 */

const PARADIGMS = [
  {
    id: "supervised",
    label: "Supervised",
    accent: DS.ind,
    blurb:
      "The world hands you the correct answer for every example, upfront. Learn a mapping input → known label.",
    signal: "Labeled examples (x, y)",
  },
  {
    id: "unsupervised",
    label: "Unsupervised",
    accent: DS.grn,
    blurb:
      "No labels at all. Find structure already latent in the data — clusters, density, low-dimensional shape.",
    signal: "Raw inputs x, no target",
  },
  {
    id: "reinforcement",
    label: "Reinforcement",
    accent: "#FB7185",
    blurb:
      "An agent acts, the world replies with a delayed scalar reward, and the next state depends on what the agent did.",
    signal: "Delayed reward for a sequence of actions",
  },
];

/** Two labeled blobs (class 0 / class 1) used by supervised + unsupervised views. */
const POINTS = [
  { x: 0.18, y: 0.32, cls: 0 },
  { x: 0.24, y: 0.4, cls: 0 },
  { x: 0.3, y: 0.28, cls: 0 },
  { x: 0.22, y: 0.5, cls: 0 },
  { x: 0.34, y: 0.44, cls: 0 },
  { x: 0.28, y: 0.6, cls: 0 },
  { x: 0.16, y: 0.42, cls: 0 },
  { x: 0.66, y: 0.66, cls: 1 },
  { x: 0.74, y: 0.58, cls: 1 },
  { x: 0.7, y: 0.74, cls: 1 },
  { x: 0.8, y: 0.68, cls: 1 },
  { x: 0.62, y: 0.56, cls: 1 },
  { x: 0.78, y: 0.8, cls: 1 },
  { x: 0.84, y: 0.6, cls: 1 },
];

const CLASS_COLOR = ["rgba(129, 140, 248, 0.95)", "rgba(52, 211, 153, 0.95)"];
const GRID = 6; // RL gridworld size

export default function LearningParadigms() {
  const [paradigm, setParadigm] = useState("supervised");
  const [step, setStep] = useState(0); // RL animation step
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const current = useMemo(
    () => PARADIGMS.find((p) => p.id === paradigm) || PARADIGMS[0],
    [paradigm]
  );

  // A fixed agent path toward the reward cell (bottom-right), with one detour.
  const path = useMemo(
    () => [
      { c: 0, r: 0 },
      { c: 1, r: 0 },
      { c: 1, r: 1 },
      { c: 2, r: 1 },
      { c: 2, r: 2 },
      { c: 3, r: 2 },
      { c: 3, r: 3 },
      { c: 4, r: 3 },
      { c: 4, r: 4 },
      { c: 5, r: 4 },
      { c: 5, r: 5 },
    ],
    []
  );

  // Drive RL animation only while playing + on the reinforcement view.
  useEffect(() => {
    if (paradigm !== "reinforcement" || !playing) return undefined;
    let last = performance.now();
    const tick = (now) => {
      if (now - last > 420) {
        last = now;
        setStep((s) => (s + 1) % (path.length + 2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paradigm, playing, path.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || 480;
    const cssH = 300;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, cssW, cssH);

    const pad = 32;
    const plotW = cssW - pad * 2;
    const plotH = cssH - pad * 2;
    const tx = (x) => pad + x * plotW;
    const ty = (y) => pad + (1 - y) * plotH;

    ctx.strokeStyle = DS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);

    ctx.font = "11px var(--ds-mono), monospace";

    if (paradigm === "supervised") {
      // Show colored labels + a learned linear boundary between the blobs.
      ctx.strokeStyle = "rgba(248, 250, 252, 0.55)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(tx(0.2), ty(0.95));
      ctx.lineTo(tx(0.95), ty(0.2));
      ctx.stroke();
      ctx.setLineDash([]);

      POINTS.forEach((p) => {
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.y), 7, 0, Math.PI * 2);
        ctx.fillStyle = CLASS_COLOR[p.cls];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.fillStyle = DS.t3;
      ctx.fillText("learned decision boundary", tx(0.34), ty(0.06));
      ctx.fillStyle = CLASS_COLOR[0];
      ctx.fillText("● class 0 (labeled)", pad + 4, pad + 14);
      ctx.fillStyle = CLASS_COLOR[1];
      ctx.fillText("● class 1 (labeled)", pad + 4, pad + 30);
    } else if (paradigm === "unsupervised") {
      // Same points, no labels — gray. Draw the two cluster hulls the model discovers.
      const drawHull = (cx, cy, rx, ry, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.ellipse(tx(cx), ty(cy), rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      drawHull(0.25, 0.43, 52, 58, "rgba(148,163,184,0.6)");
      drawHull(0.74, 0.68, 50, 56, "rgba(148,163,184,0.6)");

      POINTS.forEach((p) => {
        ctx.beginPath();
        ctx.arc(tx(p.x), ty(p.y), 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.fillStyle = DS.t3;
      ctx.fillText("no labels — only geometry; clusters are unnamed", pad + 4, pad + 16);
    } else {
      // Reinforcement: a gridworld; agent walks toward the reward cell.
      const cell = Math.min(plotW, plotH) / GRID;
      const gx = (c) => pad + c * cell;
      const gy = (r) => pad + r * cell;

      for (let r = 0; r < GRID; r += 1) {
        for (let c = 0; c < GRID; c += 1) {
          ctx.strokeStyle = DS.border;
          ctx.lineWidth = 1;
          ctx.strokeRect(gx(c), gy(r), cell, cell);
        }
      }

      // Reward cell (goal) bottom-right, penalty cell as a trap.
      ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
      ctx.fillRect(gx(GRID - 1), gy(GRID - 1), cell, cell);
      ctx.fillStyle = DS.grn;
      ctx.fillText("+1", gx(GRID - 1) + cell / 2 - 7, gy(GRID - 1) + cell / 2 + 4);

      ctx.fillStyle = "rgba(251, 113, 133, 0.22)";
      ctx.fillRect(gx(3), gy(0), cell, cell);
      ctx.fillStyle = "#FB7185";
      ctx.fillText("-1", gx(3) + cell / 2 - 6, gy(0) + cell / 2 + 4);

      // Trail traveled so far.
      const here = Math.min(step, path.length - 1);
      ctx.strokeStyle = "rgba(251, 113, 133, 0.7)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= here; i += 1) {
        const cx = gx(path[i].c) + cell / 2;
        const cy = gy(path[i].r) + cell / 2;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Agent.
      const a = path[here];
      ctx.beginPath();
      ctx.arc(gx(a.c) + cell / 2, gy(a.r) + cell / 2, cell * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "#FB7185";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = DS.t3;
      const reached = step >= path.length - 1;
      ctx.fillText(
        reached ? "reward received — credit assigned back along the path" : "agent acting; reward is delayed until the goal",
        pad + 2,
        cssH - 8
      );
    }
  }, [paradigm, step, path]);

  return (
    <div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: DS.t1,
          fontFamily: "var(--ds-sans), sans-serif",
          marginBottom: 4,
        }}
      >
        Three paradigms, one question: what feedback arrives?
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        The paradigm is a property of the <strong style={{ color: DS.t2 }}>supervision signal</strong>, not the
        algorithm. Toggle below and watch what the model is actually told after it acts.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {PARADIGMS.map((p) => {
          const active = p.id === paradigm;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setParadigm(p.id);
                setStep(0);
                setPlaying(p.id === "reinforcement");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${active ? p.accent : DS.border}`,
                background: active ? `${p.accent}22` : "rgba(255,255,255,0.02)",
                color: active ? DS.t1 : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 300,
          borderRadius: 12,
          border: `1px solid ${DS.border}`,
          display: "block",
        }}
      />

      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${current.accent}33`,
          background: `${current.accent}10`,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: current.accent,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          feedback signal — {current.signal}
        </div>
        <div style={{ fontSize: 12, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", lineHeight: 1.6 }}>
          {current.blurb}
        </div>
      </div>

      {paradigm === "reinforcement" && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: "rgba(251,113,133,0.15)",
              color: DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {playing ? "Pause agent" : "Run agent"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setPlaying(false);
            }}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: "rgba(255,255,255,0.03)",
              color: DS.t2,
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <span style={{ fontSize: 11, color: DS.t3, fontFamily: "var(--ds-mono), monospace" }}>
            step {Math.min(step, path.length - 1)} / {path.length - 1}
          </span>
        </div>
      )}

      <p
        style={{
          marginTop: 14,
          fontSize: 12,
          color: DS.t3,
          lineHeight: 1.65,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        Same problem, three framings. In interviews, classify by asking{" "}
        <strong style={{ color: DS.t2 }}>&ldquo;after the model acts, what does the world tell it?&rdquo;</strong> — a
        correct answer per example (supervised), nothing but structure (unsupervised), or a delayed reward for a
        sequence (reinforcement).
      </p>
    </div>
  );
}
