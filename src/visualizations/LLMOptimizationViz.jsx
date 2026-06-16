import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";
const CYAN_BRIGHT = "rgba(6,182,212,0.32)";

const GREEN = "#34D399";
const AMBER = "#FBBF24";
const PURPLE = "#A78BFA";
const RED = "#F87171";

// Baseline latency pipeline (all values in ms)
const BASE_STAGES = [
  { id: "network", label: "Network RTT", baseMs: 120, color: "rgba(148,163,184,0.55)" },
  { id: "tokenize", label: "Tokenization", baseMs: 60, color: "rgba(167,139,250,0.55)" },
  { id: "retrieval", label: "Retrieval (RAG)", baseMs: 450, color: "rgba(251,146,60,0.55)" },
  { id: "prefill", label: "Prefill (TTFT)", baseMs: 1800, color: "rgba(6,182,212,0.55)" },
  { id: "generation", label: "Generation (tokens)", baseMs: 3200, color: "rgba(52,211,153,0.55)" },
];

const TOGGLES = [
  {
    id: "semanticCache",
    label: "Semantic Caching",
    description: "Embed the query, check for a similar cached query, skip the LLM entirely on a hit.",
    tradeoff: "~35% cache hit rate on FAQ-style traffic. On a hit, retrieval + prefill + generation collapse to ~80ms total. Risk: stale or wrong answers for personalized/time-sensitive queries.",
    affects: ["retrieval", "prefill", "generation"],
    // Applied as a probabilistic blended reduction across affected stages (illustrative, not literal per-request)
    factor: 0.42, // remaining fraction of combined latency after blending in cache hits
    qualityNote: "No quality loss on cache hits (identical answer reused) — risk is staleness, not accuracy.",
  },
  {
    id: "promptCompression",
    label: "Prompt Compression",
    description: "LLMLingua-style perplexity pruning shrinks the prompt before it reaches the model.",
    tradeoff: "2-4x token reduction → less to tokenize and prefill. ~3-5% quality degradation on tasks needing precise wording.",
    affects: ["tokenize", "prefill"],
    factor: 0.55,
    qualityNote: "Minor quality cost: 3-5% degradation at 3x compression on factual tasks.",
  },
  {
    id: "smallerModel",
    label: "Smaller Model (routing)",
    description: "Route simple queries to a fast/cheap model instead of the large frontier model.",
    tradeoff: "~2x faster prefill, ~1.8x faster tokens/sec. Quality drop only matters on the complex tail — route those to the big model instead.",
    affects: ["prefill", "generation"],
    factor: 0.5,
    qualityNote: "Quality impact only on complex queries misrouted to the small model — mitigate with a routing classifier.",
  },
  {
    id: "streaming",
    label: "Streaming (SSE)",
    description: "Stream tokens as they generate instead of waiting for the full response.",
    tradeoff: "Does NOT reduce total latency — reduces perceived latency. Users see the first token immediately instead of staring at a blank screen.",
    affects: [], // doesn't change total latency at all, handled specially
    factor: 1,
    qualityNote: "Zero quality impact. Zero total-latency impact. Pure UX win for perceived responsiveness.",
  },
];

function computeStageLatency(stageId, baseMs, activeToggles) {
  let ms = baseMs;
  activeToggles.forEach((toggle) => {
    if (toggle.affects.includes(stageId)) {
      ms *= toggle.factor;
    }
  });
  return ms;
}

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export default function LLMOptimizationViz() {
  const [activeIds, setActiveIds] = useState([]);

  const activeToggles = useMemo(
    () => TOGGLES.filter((t) => activeIds.includes(t.id)),
    [activeIds]
  );

  const stageLatencies = useMemo(
    () =>
      BASE_STAGES.map((stage) => ({
        ...stage,
        ms: computeStageLatency(stage.id, stage.baseMs, activeToggles),
      })),
    [activeToggles]
  );

  const totalMs = stageLatencies.reduce((sum, s) => sum + s.ms, 0);
  const baseTotalMs = BASE_STAGES.reduce((sum, s) => sum + s.baseMs, 0);
  const maxBarMs = baseTotalMs; // keep bar widths comparable to baseline
  const isStreaming = activeIds.includes("streaming");
  const perceivedFirstTokenMs = isStreaming
    ? stageLatencies
        .filter((s) => s.id !== "generation")
        .reduce((sum, s) => sum + s.ms, 0)
    : totalMs;

  function toggle(id) {
    setActiveIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div
      style={{
        maxWidth: 700,
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
          Request Pipeline Latency Optimizer
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          Toggle optimizations on and watch the timeline shrink — and read the trade-off behind each win.
        </p>
      </div>

      {/* Total latency readout */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "14px 10px",
            borderRadius: DS.radiusMd,
            border: `1px solid ${CYAN_MID}`,
            background: CYAN_DIM,
          }}
        >
          <div style={{ fontSize: 11, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Latency
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: CYAN,
              fontFamily: "var(--ds-mono), monospace",
              marginTop: 4,
            }}
          >
            {formatMs(totalMs)}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "14px 10px",
            borderRadius: DS.radiusMd,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ fontSize: 11, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Perceived TTFT
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: isStreaming ? GREEN : DS.t1,
              fontFamily: "var(--ds-mono), monospace",
              marginTop: 4,
            }}
          >
            {formatMs(perceivedFirstTokenMs)}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "14px 10px",
            borderRadius: DS.radiusMd,
            border: `1px solid ${DS.border}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ fontSize: 11, color: DS.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Reduction
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: totalMs < baseTotalMs ? GREEN : DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginTop: 4,
            }}
          >
            {totalMs < baseTotalMs ? `−${Math.round((1 - totalMs / baseTotalMs) * 100)}%` : "0%"}
          </div>
        </div>
      </div>

      {/* Stacked timeline bar */}
      <div
        style={{
          background: "rgba(2,6,23,0.72)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "16px 16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: DS.t3,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Stacked Request Timeline
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 36,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${DS.border}`,
          }}
        >
          {stageLatencies.map((stage) => {
            const widthPct = Math.max((stage.ms / maxBarMs) * 100, stage.ms > 0 ? 0.5 : 0);
            return (
              <div
                key={stage.id}
                title={`${stage.label}: ${formatMs(stage.ms)}`}
                style={{
                  width: `${widthPct}%`,
                  background: stage.color,
                  transition: "width 0.3s ease",
                  minWidth: stage.ms > 0 ? 2 : 0,
                }}
              />
            );
          })}
        </div>
        {/* Empty space representing reduction */}
        {totalMs < baseTotalMs && (
          <div
            style={{
              marginTop: 4,
              height: 4,
              width: `${(totalMs / maxBarMs) * 100}%`,
              borderBottom: `2px dashed ${GREEN}`,
            }}
          />
        )}

        {/* Legend with per-stage ms */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginTop: 14,
          }}
        >
          {stageLatencies.map((stage) => (
            <div
              key={stage.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                color: DS.t2,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  background: stage.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{stage.label}</span>
              <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.t3 }}>
                {formatMs(stage.ms)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TOGGLES.map((toggleDef) => {
          const active = activeIds.includes(toggleDef.id);
          return (
            <div
              key={toggleDef.id}
              style={{
                border: `1px solid ${active ? CYAN_MID : DS.border}`,
                borderRadius: DS.radiusMd,
                background: active ? "rgba(6,182,212,0.06)" : "rgba(255,255,255,0.015)",
                padding: "12px 14px",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={() => toggle(toggleDef.id)}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: active ? CYAN : DS.t1 }}>
                    {toggleDef.label}
                  </span>
                  <span style={{ fontSize: 11.5, color: DS.t3 }}>{toggleDef.description}</span>
                </div>
                {/* Switch */}
                <div
                  role="switch"
                  aria-checked={active}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 99,
                    background: active ? CYAN : "rgba(255,255,255,0.12)",
                    position: "relative",
                    flexShrink: 0,
                    transition: "background 0.15s ease",
                    marginLeft: 12,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: active ? 20 : 2,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.15s ease",
                    }}
                  />
                </div>
              </div>

              {active && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.22)",
                    fontSize: 12,
                    color: DS.t2,
                    lineHeight: "17px",
                  }}
                >
                  <span style={{ color: AMBER, fontWeight: 600 }}>Trade-off: </span>
                  {toggleDef.tradeoff}
                  <div style={{ marginTop: 4, color: DS.t3 }}>{toggleDef.qualityNote}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          color: DS.t3,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: DS.radiusMd,
          border: `1px solid ${DS.border}`,
          lineHeight: "18px",
        }}
      >
        Try Semantic Caching alone first — it is the only toggle that can collapse retrieval,
        prefill, and generation simultaneously on a cache hit. Then add Streaming: notice it
        never changes the Total Latency number, only the Perceived TTFT — because streaming
        is a UX trick, not a latency reduction.
      </div>
    </div>
  );
}
