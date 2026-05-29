import { useState, useEffect, useRef } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── timing data ───────────────────────────────────────────────────────────────
const SIZES = [
  { label: "100 rows",  n: 100,    loopMs: 0.8,   vecMs: 0.05  },
  { label: "10k rows",  n: 10_000, loopMs: 80,    vecMs: 1     },
  { label: "1M rows",   n: 1_000_000, loopMs: 8000, vecMs: 45  },
];

const OPS = [
  {
    label: "Double values",
    loop: `result = []\nfor v in df["val"]:\n    result.append(v * 2)\ndf["out"] = result`,
    vec:  `df["out"] = df["val"] * 2`,
  },
  {
    label: "Clip to range",
    loop: `result = []\nfor v in df["val"]:\n    result.append(max(0, min(100, v)))\ndf["out"] = result`,
    vec:  `df["out"] = df["val"].clip(0, 100)`,
  },
  {
    label: "Apply log",
    loop: `import math\nresult = []\nfor v in df["val"]:\n    result.append(math.log1p(v))\ndf["out"] = result`,
    vec:  `import numpy as np\ndf["out"] = np.log1p(df["val"])`,
  },
  {
    label: "String extract",
    loop: `result = []\nfor s in df["col"]:\n    result.append(s.split("_")[0])\ndf["out"] = result`,
    vec:  `df["out"] = df["col"].str.split("_").str[0]`,
  },
];

// ── anti-patterns ─────────────────────────────────────────────────────────────
const ANTI_PATTERNS = [
  {
    title: "iterrows() — Python-speed iteration",
    bad: `# BAD: iterrows() boxes each row as a Series\nfor idx, row in df.iterrows():\n    df.at[idx, "result"] = row["a"] + row["b"]`,
    good: `# FAST: vectorized column arithmetic\ndf["result"] = df["a"] + df["b"]`,
    why: "iterrows() converts every row to a Python object — O(n) boxing overhead on top of the Python interpreter loop. Vectorized ops run in compiled C/Fortran and touch memory sequentially.",
    badMs: 12_500,
    goodMs: 80,
  },
  {
    title: "List comprehension → assignment",
    bad: `# BAD: Python for-loop masquerading as pandas\ndf["out"] = [custom_fn(x) for x in df["col"]]`,
    good: `# BETTER: .apply() keeps it pandas-native\ndf["out"] = df["col"].apply(custom_fn)\n# BEST (if numeric): direct vectorized op\ndf["out"] = df["col"] * 2.5 + 1`,
    why: "A list comprehension pulls every value into Python memory one at a time. .apply() is still a Python loop but with less overhead; true vectorized ops avoid Python entirely.",
    badMs: 9_200,
    goodMs: 65,
  },
  {
    title: "df.append() inside a loop",
    bad: `# BAD: O(n²) copies — each append copies the whole frame\nresult = pd.DataFrame()\nfor chunk in chunks:\n    result = result.append(chunk)  # deprecated in 2.0`,
    good: `# FAST: collect first, concat once\nparts = []\nfor chunk in chunks:\n    parts.append(chunk)\nresult = pd.concat(parts, ignore_index=True)`,
    why: "Each .append() creates a brand new DataFrame, copying all existing rows. 1 000 appends means ~500k unnecessary row copies — O(n²) total work vs O(n) for a single pd.concat().",
    badMs: 18_000,
    goodMs: 120,
  },
  {
    title: "Recomputing boolean mask inside a loop",
    bad: `# BAD: mask recomputed on every iteration\nfor val in target_values:\n    subset = df[df["col"] == val]\n    process(subset)`,
    good: `# FAST: compute mask once, group once\nfor val, group in df.groupby("col"):\n    process(group)\n# or: mask once\nmask = df["col"].isin(target_values)\ndf[mask].groupby("col").apply(process)`,
    why: "Each df[df[\"col\"] == val] scans every row. With k target values, that's k full passes = O(n·k). groupby() sorts once in O(n log n) then splits — far cheaper for large k.",
    badMs: 7_400,
    goodMs: 55,
  },
];

// ── shared UI helpers ─────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 1.4, color: DS.dim, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function CodeBlock({ code, bad, good }) {
  const bg = bad
    ? { background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }
    : good
    ? { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }
    : { background: "rgba(255,255,255,0.03)", border: `1px solid ${DS.border}` };

  return (
    <pre style={{
      ...bg,
      borderRadius: 10,
      padding: "10px 12px",
      margin: 0,
      fontFamily: "var(--ds-mono), monospace",
      fontSize: 11,
      color: bad ? "rgba(248,113,113,0.95)" : good ? "rgba(52,211,153,0.95)" : DS.t2,
      whiteSpace: "pre-wrap",
      lineHeight: 1.65,
      overflowX: "auto",
    }}>
      {code}
    </pre>
  );
}

function SpeedupBadge({ speedup }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 9px",
      borderRadius: 99,
      background: "rgba(252,211,77,0.1)",
      border: "1px solid rgba(252,211,77,0.25)",
      color: "#FCD34D",
      fontWeight: 700,
      fontFamily: "var(--ds-mono), monospace",
      fontSize: 13,
    }}>
      {speedup}x faster
    </span>
  );
}

function ModeTab({ active, onClick, label, hint }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: "12px 14px",
      background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? `${DS.ind}66` : DS.border}`,
      borderRadius: 10, color: active ? DS.t1 : DS.t3,
      fontFamily: "var(--ds-mono), monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left",
    }}>
      <div style={{ color: active ? DS.ind : DS.t2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: DS.dim, letterSpacing: 0.2, fontWeight: 500 }}>{hint}</div>
    </button>
  );
}

// ── Log-scale bar chart row ───────────────────────────────────────────────────
function TimingBar({ label, timeMs, maxLogTime, color, children }) {
  const MIN_LOG = 0; // log10(1ms) = 0
  const logVal = Math.log10(Math.max(timeMs, 0.001));
  const pct = Math.max(4, ((logVal - MIN_LOG) / (Math.log10(maxLogTime) - MIN_LOG)) * 100);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3 }}>{label}</span>
        <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t2, fontWeight: 600 }}>
          {timeMs >= 1000 ? `${(timeMs / 1000).toFixed(1)}s` : timeMs >= 1 ? `${timeMs}ms` : `${(timeMs * 1000).toFixed(0)}μs`}
        </span>
      </div>
      <div style={{ height: 14, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
      {children}
    </div>
  );
}

// ── Race animation (loop row counter) ────────────────────────────────────────
function LoopRowCounter({ running, totalRows, loopMs, onDone }) {
  const [row, setRow] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!running) { setRow(0); return; }
    startRef.current = performance.now();
    const duration = Math.min(loopMs, 3200); // cap animation at 3.2s

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const currentRow = Math.floor(progress * totalRows);
      setRow(currentRow);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDone && onDone();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, totalRows, loopMs, onDone]);

  const displayRow = running ? row : 0;
  const pct = totalRows > 0 ? (displayRow / totalRows) * 100 : 0;

  return (
    <div>
      <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3, marginBottom: 5 }}>
        {running
          ? displayRow < totalRows
            ? `row ${displayRow.toLocaleString()} of ${totalRows.toLocaleString()}…`
            : `✓ done — ${totalRows.toLocaleString()} rows processed`
          : `${totalRows.toLocaleString()} rows waiting…`}
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 8 }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #F87171, #FB923C)",
          borderRadius: 4,
          transition: "width 0.1s linear",
        }} />
      </div>
      {/* Simulated growing result list — show first few rows */}
      {running && displayRow > 0 && (
        <div style={{
          background: "rgba(248,113,113,0.05)",
          border: "1px solid rgba(248,113,113,0.15)",
          borderRadius: 8,
          padding: "6px 8px",
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 10,
          color: "rgba(248,113,113,0.8)",
          lineHeight: 1.6,
          maxHeight: 68,
          overflow: "hidden",
        }}>
          {Array.from({ length: Math.min(displayRow, 4) }, (_, i) => (
            <div key={i}>[{i}] → {(Math.round((i + 1) * 2.4 * 10) / 10).toFixed(1)}</div>
          ))}
          {displayRow > 4 && <div style={{ color: DS.dim }}>… {(displayRow - 4).toLocaleString()} more</div>}
        </div>
      )}
    </div>
  );
}

// ── Tab 1: Race ───────────────────────────────────────────────────────────────
function RaceTab() {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [opIdx, setOpIdx] = useState(0);
  const [racing, setRacing] = useState(false);
  const [loopDone, setLoopDone] = useState(false);
  const [vecDone, setVecDone] = useState(false);
  const vecTimerRef = useRef(null);

  const size = SIZES[sizeIdx];
  const op = OPS[opIdx];
  const speedup = Math.round(size.loopMs / size.vecMs);
  const maxLogTime = size.loopMs * 1.2;

  const done = loopDone && vecDone;

  function startRace() {
    setRacing(false);
    setLoopDone(false);
    setVecDone(false);
    // slight delay so state clears before re-triggering
    setTimeout(() => {
      setRacing(true);
      // Vectorized completes almost instantly — schedule its "done" based on ratio
      const vecAnimMs = Math.min(size.vecMs / size.loopMs * Math.min(size.loopMs, 3200), 400);
      vecTimerRef.current = setTimeout(() => setVecDone(true), Math.max(vecAnimMs, 120));
    }, 80);
  }

  useEffect(() => () => clearTimeout(vecTimerRef.current), []);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <SectionLabel>Dataset size</SectionLabel>
          <div style={{ display: "flex", gap: 6 }}>
            {SIZES.map((s, i) => (
              <button key={i} type="button" onClick={() => { setSizeIdx(i); setRacing(false); setLoopDone(false); setVecDone(false); }} style={{
                padding: "5px 10px",
                borderRadius: 7,
                border: `1px solid ${sizeIdx === i ? `${DS.ind}88` : DS.border}`,
                background: sizeIdx === i ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                color: sizeIdx === i ? DS.t1 : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                cursor: "pointer",
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Operation</SectionLabel>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {OPS.map((o, i) => (
              <button key={i} type="button" onClick={() => { setOpIdx(i); setRacing(false); setLoopDone(false); setVecDone(false); }} style={{
                padding: "5px 10px",
                borderRadius: 7,
                border: `1px solid ${opIdx === i ? `${DS.grn}66` : DS.border}`,
                background: opIdx === i ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.02)",
                color: opIdx === i ? DS.t1 : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 11,
                cursor: "pointer",
              }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-side race panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* Loop */}
        <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#F87171", fontFamily: "var(--ds-mono), monospace", letterSpacing: 0.5 }}>LOOP</span>
            {loopDone && <span style={{ fontSize: 10, color: "#F87171", fontFamily: "var(--ds-mono), monospace" }}>
              {size.loopMs >= 1000 ? `${(size.loopMs / 1000).toFixed(1)}s` : `${size.loopMs}ms`}
            </span>}
          </div>
          <CodeBlock code={op.loop} bad />
          <div style={{ marginTop: 10 }}>
            <LoopRowCounter
              running={racing}
              totalRows={Math.min(size.n, sizeIdx === 2 ? 1_000_000 : size.n)}
              loopMs={Math.min(size.loopMs, 3200)}
              onDone={() => setLoopDone(true)}
            />
          </div>
        </div>

        {/* Vectorized */}
        <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(52,211,153,0.2)", background: "rgba(52,211,153,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.grn, fontFamily: "var(--ds-mono), monospace", letterSpacing: 0.5 }}>VECTORIZED</span>
            {vecDone && <span style={{ fontSize: 10, color: DS.grn, fontFamily: "var(--ds-mono), monospace" }}>
              {size.vecMs >= 1 ? `${size.vecMs}ms` : `${(size.vecMs * 1000).toFixed(0)}μs`}
            </span>}
          </div>
          <CodeBlock code={op.vec} good />
          <div style={{ marginTop: 10 }}>
            {!racing && !vecDone && (
              <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.t3 }}>
                {size.n.toLocaleString()} rows waiting…
              </div>
            )}
            {(racing || vecDone) && (
              <div>
                <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 11, color: DS.grn, marginBottom: 5 }}>
                  {vecDone ? `✓ done — all ${size.n.toLocaleString()} rows at once` : "processing all rows simultaneously…"}
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 8 }}>
                  <div style={{
                    height: "100%",
                    width: vecDone ? "100%" : "100%",
                    background: "linear-gradient(90deg, #34D399, #10B981)",
                    borderRadius: 4,
                    transition: "width 0.15s ease",
                  }} />
                </div>
                {vecDone && (
                  <div style={{
                    background: "rgba(52,211,153,0.05)",
                    border: "1px solid rgba(52,211,153,0.15)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 10,
                    color: "rgba(52,211,153,0.8)",
                    lineHeight: 1.6,
                  }}>
                    <div>all {size.n.toLocaleString()} rows → ndarray op</div>
                    <div style={{ color: DS.dim }}>single C-level kernel call</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timing chart + speedup */}
      <div style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.015)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <SectionLabel>Time comparison (log scale)</SectionLabel>
          {done && <SpeedupBadge speedup={speedup} />}
        </div>
        <TimingBar label="Loop" timeMs={size.loopMs} maxLogTime={maxLogTime} color="linear-gradient(90deg, #F87171, #FB923C)" />
        <TimingBar label="Vectorized" timeMs={size.vecMs} maxLogTime={maxLogTime} color="linear-gradient(90deg, #34D399, #10B981)" />
        <div style={{ marginTop: 6, fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
          Bar widths proportional to log₁₀(time) — each step = 10× difference
        </div>
      </div>

      {/* All sizes summary */}
      <div style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${DS.border}`, background: "rgba(255,255,255,0.015)", marginBottom: 14 }}>
        <SectionLabel>Speedup scales super-linearly</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {SIZES.map((s) => {
            const su = Math.round(s.loopMs / s.vecMs);
            return (
              <div key={s.label} style={{
                padding: "8px 10px",
                borderRadius: 9,
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${DS.border}`,
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, color: DS.t3, marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "#FCD34D", fontWeight: 700, fontFamily: "var(--ds-mono), monospace", fontSize: 15 }}>{su}x</div>
                <div style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 9, color: DS.dim, marginTop: 2 }}>
                  {s.loopMs >= 1000 ? `${(s.loopMs / 1000).toFixed(1)}s` : `${s.loopMs}ms`} → {s.vecMs >= 1 ? `${s.vecMs}ms` : `${(s.vecMs * 1000).toFixed(0)}μs`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Run button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={startRace} style={{
          padding: "10px 28px",
          borderRadius: 9,
          border: `1px solid ${DS.ind}88`,
          background: "rgba(99,102,241,0.15)",
          color: DS.t1,
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: 0.5,
        }}>
          {racing && !done ? "Racing…" : done ? "Run again" : "▶ Start race"}
        </button>
      </div>
    </div>
  );
}

// ── Tab 2: Anti-patterns ──────────────────────────────────────────────────────
function AntiPatternsTab() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 14, fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t3, lineHeight: 1.6 }}>
        Four patterns that silently kill pandas performance. Each has a mechanical fix — recognizing the pattern is half the battle.
      </div>
      {ANTI_PATTERNS.map((ap, i) => {
        const speedup = Math.round(ap.badMs / ap.goodMs);
        const isOpen = expanded === i;
        return (
          <div key={i} style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.015)",
            marginBottom: 10,
          }}>
            {/* Header */}
            <button type="button" onClick={() => setExpanded(isOpen ? null : i)} style={{
              width: "100%",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: "#F87171",
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 12, color: DS.t1, fontWeight: 700 }}>
                  {ap.title}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SpeedupBadge speedup={speedup} />
                <span style={{ color: DS.dim, fontSize: 14, fontFamily: "var(--ds-mono), monospace" }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {isOpen && (
              <div style={{ marginTop: 12 }}>
                {/* Code comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <SectionLabel>Bad — slow</SectionLabel>
                    <CodeBlock code={ap.bad} bad />
                  </div>
                  <div>
                    <SectionLabel>Fixed — fast</SectionLabel>
                    <CodeBlock code={ap.good} good />
                  </div>
                </div>

                {/* Timing bars */}
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${DS.border}`, marginBottom: 10 }}>
                  <SectionLabel>1M rows — log scale</SectionLabel>
                  <TimingBar
                    label="Bad approach"
                    timeMs={ap.badMs}
                    maxLogTime={ap.badMs * 1.5}
                    color="linear-gradient(90deg, #F87171, #FB923C)"
                  />
                  <TimingBar
                    label="Fixed approach"
                    timeMs={ap.goodMs}
                    maxLogTime={ap.badMs * 1.5}
                    color="linear-gradient(90deg, #34D399, #10B981)"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
                      bar width = log₁₀(time)
                    </div>
                    <SpeedupBadge speedup={speedup} />
                  </div>
                </div>

                {/* Explanation */}
                <div style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(129,140,248,0.05)",
                  border: `1px solid ${DS.ind}33`,
                  fontFamily: "var(--ds-mono), monospace",
                  fontSize: 11,
                  color: DS.t3,
                  lineHeight: 1.65,
                }}>
                  <span style={{ color: DS.ind, fontWeight: 700, marginRight: 5 }}>WHY:</span>
                  {ap.why}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function VectorizationRace() {
  const [tab, setTab] = useState("race");

  return (
    <div style={{ color: DS.t1, fontFamily: "var(--ds-sans), sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 4, fontSize: 17, fontWeight: 700, color: DS.t1 }}>
        Vectorization: the multiplicative speedup
      </div>
      <p style={{ fontSize: 12, color: DS.t3, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.55, marginBottom: 16 }}>
        Python loops process rows one by one. NumPy / pandas vectorized ops hand the entire array to compiled C/Fortran code in a single call. The speedup isn't linear — it compounds as data grows.
      </p>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <ModeTab
          active={tab === "race"}
          onClick={() => setTab("race")}
          label="Loop vs Vectorized"
          hint="Side-by-side race with timing bars"
        />
        <ModeTab
          active={tab === "anti"}
          onClick={() => setTab("anti")}
          label="Anti-patterns"
          hint="4 common slow patterns + fixes"
        />
      </div>

      {/* Tab content */}
      {tab === "race" ? <RaceTab /> : <AntiPatternsTab />}

      {/* Footer note */}
      <p style={{ marginTop: 16, fontSize: 11, color: DS.dim, fontFamily: "var(--ds-mono), monospace", lineHeight: 1.6 }}>
        Timings are representative benchmarks on a modern laptop (CPython 3.11, pandas 2.x). Exact numbers vary by hardware, dtype, and cache warmth — the speedup ratios are what matter.
      </p>
    </div>
  );
}
