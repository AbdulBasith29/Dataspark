import { useState, useMemo, useRef, useEffect } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const AMBER = "#FBBF24";
const GREEN = "#34D399";
const RED = "#F87171";
const DIM_DOT = "rgba(255,255,255,0.12)";

const VIEW_W = 640;
const VIEW_H = 360;

// HNSW-style layered graph layout — small illustrative graph, not a literal HNSW build.
// Layer 0 (bottom) has all nodes; higher layers have fewer "hub" nodes.
const LAYER_COUNT = 3;
const NODES_PER_LAYER = [22, 8, 3]; // layer 0, 1, 2 (top)

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildLayers() {
  const rand = seededRandom(42);
  const layers = [];
  for (let l = 0; l < LAYER_COUNT; l++) {
    const count = NODES_PER_LAYER[l];
    const nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `L${l}N${i}`,
        layer: l,
        x: 40 + rand() * (VIEW_W - 80),
        y: 40 + rand() * (VIEW_H - 80),
      });
    }
    layers.push(nodes);
  }
  return layers;
}

const LAYERS = buildLayers();
const ALL_NODES = LAYERS.flat();

// Query point — fixed for reproducibility, placed away from any node so the
// "true nearest neighbor" is a deliberate, findable point.
const QUERY_POINT = { x: VIEW_W * 0.78, y: VIEW_H * 0.28 };

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Determine true nearest neighbor across all layer-0 nodes (brute force ground truth)
const TRUE_NEAREST = LAYERS[0].reduce(
  (best, n) => (dist(n, QUERY_POINT) < dist(best, QUERY_POINT) ? n : best),
  LAYERS[0][0]
);

// Build a simple greedy HNSW-style path: start at the single top-layer node,
// greedily move toward query within each layer, descend a layer, repeat.
function buildHnswPath() {
  const path = [];
  let current = LAYERS[LAYER_COUNT - 1][0]; // entry point at top layer
  path.push(current);
  for (let l = LAYER_COUNT - 1; l >= 0; l--) {
    const layerNodes = LAYERS[l];
    // greedy hop: move to nearest node in this layer to the query, a few hops
    let bestInLayer = layerNodes.reduce(
      (best, n) => (dist(n, QUERY_POINT) < dist(best, QUERY_POINT) ? n : best),
      layerNodes[0]
    );
    if (dist(bestInLayer, current) > 0) {
      path.push(bestInLayer);
      current = bestInLayer;
    }
  }
  return path;
}

const HNSW_PATH = buildHnswPath();
const HNSW_RESULT = HNSW_PATH[HNSW_PATH.length - 1];
const HNSW_IS_EXACT = HNSW_RESULT.id === TRUE_NEAREST.id;

const SCAN_STEP_MS = 28;
const HOP_STEP_MS = 380;

export default function VectorDBIndexViz() {
  const [bruteRunning, setBruteRunning] = useState(false);
  const [bruteIndex, setBruteIndex] = useState(0);
  const [bruteDone, setBruteDone] = useState(false);
  const [bruteElapsedMs, setBruteElapsedMs] = useState(0);

  const [hnswRunning, setHnswRunning] = useState(false);
  const [hnswHop, setHnswHop] = useState(0);
  const [hnswDone, setHnswDone] = useState(false);
  const [hnswElapsedMs, setHnswElapsedMs] = useState(0);

  const bruteTimer = useRef(null);
  const hnswTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (bruteTimer.current) clearInterval(bruteTimer.current);
      if (hnswTimer.current) clearInterval(hnswTimer.current);
    };
  }, []);

  function runBruteForce() {
    if (bruteRunning) return;
    setBruteRunning(true);
    setBruteDone(false);
    setBruteIndex(0);
    setBruteElapsedMs(0);
    let i = 0;
    bruteTimer.current = setInterval(() => {
      i += 1;
      setBruteIndex(i);
      setBruteElapsedMs(i * SCAN_STEP_MS);
      if (i >= ALL_NODES.length) {
        clearInterval(bruteTimer.current);
        setBruteRunning(false);
        setBruteDone(true);
      }
    }, SCAN_STEP_MS);
  }

  function runHnsw() {
    if (hnswRunning) return;
    setHnswRunning(true);
    setHnswDone(false);
    setHnswHop(0);
    setHnswElapsedMs(0);
    let i = 0;
    hnswTimer.current = setInterval(() => {
      i += 1;
      setHnswHop(i);
      setHnswElapsedMs(i * HOP_STEP_MS);
      if (i >= HNSW_PATH.length - 1) {
        clearInterval(hnswTimer.current);
        setHnswRunning(false);
        setHnswDone(true);
      }
    }, HOP_STEP_MS);
  }

  function resetAll() {
    if (bruteTimer.current) clearInterval(bruteTimer.current);
    if (hnswTimer.current) clearInterval(hnswTimer.current);
    setBruteRunning(false);
    setBruteIndex(0);
    setBruteDone(false);
    setBruteElapsedMs(0);
    setHnswRunning(false);
    setHnswHop(0);
    setHnswDone(false);
    setHnswElapsedMs(0);
  }

  const scannedNodes = ALL_NODES.slice(0, bruteIndex);
  const bruteFoundExact = bruteDone;

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: DS.t1,
            letterSpacing: "-0.3px",
          }}
        >
          Brute-Force Scan vs. HNSW Index
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Trigger both searches for the same query vector and watch the difference between checking every
          point and hopping through a layered graph.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <button
          onClick={runBruteForce}
          disabled={bruteRunning}
          style={{
            padding: "9px 16px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${RED}`,
            background: bruteRunning ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.16)",
            color: RED,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: bruteRunning ? "not-allowed" : "pointer",
            outline: "none",
          }}
        >
          {bruteRunning ? "Scanning every point…" : "Run brute-force scan"}
        </button>
        <button
          onClick={runHnsw}
          disabled={hnswRunning}
          style={{
            padding: "9px 16px",
            borderRadius: DS.radiusSm,
            border: `1.5px solid ${CYAN}`,
            background: hnswRunning ? CYAN_DIM : CYAN_MID,
            color: CYAN_BRIGHT,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: hnswRunning ? "not-allowed" : "pointer",
            outline: "none",
          }}
        >
          {hnswRunning ? "Hopping through graph…" : "Run HNSW search"}
        </button>
        <button
          onClick={resetAll}
          style={{
            padding: "9px 16px",
            borderRadius: DS.radiusSm,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
            color: DS.t3,
            fontFamily: "var(--ds-sans), sans-serif",
            fontSize: 13,
            cursor: "pointer",
            outline: "none",
          }}
        >
          Reset
        </button>
      </div>

      {/* Side-by-side SVGs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
        className="ds-g2"
      >
        {/* Brute force panel */}
        <div
          style={{
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd,
            padding: 10,
          }}
        >
          <div style={{ fontSize: 11, color: RED, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Brute-Force (exact kNN)
          </div>
          <svg width="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ display: "block" }}>
            {ALL_NODES.map((n, i) => {
              const scanned = i < bruteIndex;
              const isResult = bruteDone && n.id === TRUE_NEAREST.id;
              return (
                <circle
                  key={n.id}
                  cx={n.x}
                  cy={n.y}
                  r={isResult ? 7 : 3.5}
                  fill={isResult ? GREEN : scanned ? RED : DIM_DOT}
                  opacity={isResult ? 1 : scanned ? 0.85 : 0.5}
                />
              );
            })}
            {/* query point */}
            <circle cx={QUERY_POINT.x} cy={QUERY_POINT.y} r={7} fill={AMBER} stroke="#fff" strokeWidth={1.5} />
            <text x={QUERY_POINT.x + 10} y={QUERY_POINT.y + 4} fill={AMBER} fontSize={10} fontFamily="var(--ds-mono), monospace">
              query
            </text>
            {bruteDone && (
              <line
                x1={QUERY_POINT.x} y1={QUERY_POINT.y}
                x2={TRUE_NEAREST.x} y2={TRUE_NEAREST.y}
                stroke={GREEN} strokeWidth={1.5} strokeDasharray="3,3"
              />
            )}
          </svg>
          <div style={{ fontSize: 11.5, color: DS.t3, marginTop: 6, fontFamily: "var(--ds-mono), monospace" }}>
            checked {Math.min(bruteIndex, ALL_NODES.length)}/{ALL_NODES.length} vectors
            {bruteDone && <span style={{ color: GREEN }}> · found true nearest</span>}
          </div>
        </div>

        {/* HNSW panel */}
        <div
          style={{
            background: "rgba(2,6,23,0.72)",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusMd,
            padding: 10,
          }}
        >
          <div style={{ fontSize: 11, color: CYAN_BRIGHT, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            HNSW (layered graph)
          </div>
          <svg width="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ display: "block" }}>
            {/* layer-0 dim nodes for context */}
            {LAYERS[0].map((n) => (
              <circle key={n.id} cx={n.x} cy={n.y} r={2.5} fill={DIM_DOT} opacity={0.4} />
            ))}
            {LAYERS[1].map((n) => (
              <circle key={n.id} cx={n.x} cy={n.y} r={3.5} fill="rgba(34,211,238,0.25)" />
            ))}
            {LAYERS[2].map((n) => (
              <circle key={n.id} cx={n.x} cy={n.y} r={5} fill="rgba(34,211,238,0.4)" />
            ))}

            {/* path hops so far */}
            {HNSW_PATH.slice(0, hnswHop + 1).map((n, i) => {
              if (i === 0) return null;
              const prev = HNSW_PATH[i - 1];
              return (
                <line
                  key={"hop-" + i}
                  x1={prev.x} y1={prev.y} x2={n.x} y2={n.y}
                  stroke={CYAN_BRIGHT} strokeWidth={2}
                />
              );
            })}
            {HNSW_PATH.slice(0, hnswHop + 1).map((n, i) => (
              <circle
                key={"hopnode-" + i}
                cx={n.x} cy={n.y}
                r={i === hnswHop ? 7 : 5}
                fill={i === hnswHop && hnswDone ? GREEN : CYAN_BRIGHT}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}

            {/* query point */}
            <circle cx={QUERY_POINT.x} cy={QUERY_POINT.y} r={7} fill={AMBER} stroke="#fff" strokeWidth={1.5} />
            <text x={QUERY_POINT.x + 10} y={QUERY_POINT.y + 4} fill={AMBER} fontSize={10} fontFamily="var(--ds-mono), monospace">
              query
            </text>
          </svg>
          <div style={{ fontSize: 11.5, color: DS.t3, marginTop: 6, fontFamily: "var(--ds-mono), monospace" }}>
            {hnswHop}/{HNSW_PATH.length - 1} hops across {LAYER_COUNT} layers
            {hnswDone && (
              <span style={{ color: HNSW_IS_EXACT ? GREEN : AMBER }}>
                {" "}· {HNSW_IS_EXACT ? "matched exact result" : "approximate result (not the true nearest)"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Speed / recall readout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
        className="ds-g3"
      >
        {[
          {
            label: "Brute-force time",
            value: bruteDone ? `${bruteElapsedMs} ms (sim.)` : bruteRunning ? `${bruteElapsedMs} ms…` : "—",
            color: RED,
          },
          {
            label: "HNSW time",
            value: hnswDone ? `${hnswElapsedMs} ms (sim.)` : hnswRunning ? `${hnswElapsedMs} ms…` : "—",
            color: CYAN_BRIGHT,
          },
          {
            label: "Speedup",
            value:
              bruteDone && hnswDone && hnswElapsedMs > 0
                ? `${(bruteElapsedMs / hnswElapsedMs).toFixed(1)}×`
                : "—",
            color: GREEN,
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radiusMd,
              padding: "12px 10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10.5, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "var(--ds-mono), monospace" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recall trade-off note */}
      <div
        style={{
          background: CYAN_DIM,
          border: `1px solid rgba(6,182,212,0.3)`,
          borderRadius: DS.radiusMd,
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: 12.5,
          color: DS.t2,
          lineHeight: "19px",
        }}
      >
        Brute-force is <strong style={{ color: RED }}>O(n)</strong> — it always finds the exact nearest neighbor
        because it checks every vector, but that cost scales linearly with corpus size: at 10M vectors and 1536
        dims, a single query can cost ~15 billion floating-point operations. HNSW is <strong style={{ color: CYAN_BRIGHT }}>O(log n)</strong> —
        it enters at a sparse top layer and greedily descends, checking only a handful of candidates per layer.
        The trade: it can occasionally settle on the second-best neighbor instead of the true best — this is the
        "approximate" in Approximate Nearest Neighbor. Production systems tune <code style={{ fontFamily: "var(--ds-mono), monospace" }}>ef_search</code> to
        trade a little speed for higher recall.
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: 12,
          color: DS.t3,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: DS.radiusMd,
          border: `1px solid ${DS.border}`,
          lineHeight: "18px",
        }}
      >
        This toy graph uses 3 layers to illustrate the principle: Layer 2 (top) has only 3 "hub" nodes for fast
        global navigation, Layer 1 has 8, and Layer 0 (bottom) has all 22 nodes for fine-grained precision —
        mirroring real HNSW's exponential layer-size falloff controlled by the parameter <code style={{ fontFamily: "var(--ds-mono), monospace" }}>M</code>.
      </div>
    </div>
  );
}
