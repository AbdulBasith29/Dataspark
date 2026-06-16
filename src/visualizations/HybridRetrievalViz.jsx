import { useState, useMemo } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ─── Constants (declared before component to avoid TDZ crashes) ───────────────

const CYAN = "#06B6D4";
const CYAN_BRIGHT = "#22D3EE";
const CYAN_DIM = "rgba(6,182,212,0.13)";
const CYAN_MID = "rgba(6,182,212,0.22)";

const AMBER = "#FBBF24";
const GREEN = "#34D399";
const PURPLE = "#A78BFA";

// Two example queries demonstrating dense vs sparse strengths/weaknesses.
const QUERIES = {
  conceptual: {
    id: "conceptual",
    label: "\"how do I fix a memory leak in Python?\"",
    description: "A conceptual question — dense retrieval shines here because it captures paraphrase and synonym relationships.",
    // doc id -> { dense rank (1 = best) or null if not retrieved, sparse rank or null }
    docs: [
      { id: "doc_gc", title: "Understanding Python garbage collection & reference cycles", denseRank: 1, sparseRank: 4 },
      { id: "doc_heap", title: "Heap allocation patterns that cause unbounded growth", denseRank: 2, sparseRank: null },
      { id: "doc_leak_kw", title: "Troubleshooting 'memory leak' reports in production logs", denseRank: 3, sparseRank: 1 },
      { id: "doc_objref", title: "Object reference counting and weakref best practices", denseRank: 4, sparseRank: null },
      { id: "doc_fix_py", title: "How to fix common Python performance issues", denseRank: 5, sparseRank: 2 },
      { id: "doc_unrelated", title: "Setting up a Python virtual environment", denseRank: null, sparseRank: 3 },
    ],
  },
  identifier: {
    id: "identifier",
    label: "\"CVE-2024-1234 patch status\"",
    description: "An exact-identifier query — sparse (BM25) retrieval shines because the CVE ID is an opaque token with no semantic neighborhood.",
    docs: [
      { id: "doc_cve_advisory", title: "Security Advisory: CVE-2024-1234 — remote code execution patch", denseRank: 3, sparseRank: 1 },
      { id: "doc_patch_mgmt", title: "General patch management and vulnerability remediation guide", denseRank: 1, sparseRank: null },
      { id: "doc_vuln_remediation", title: "Vulnerability remediation playbook for security teams", denseRank: 2, sparseRank: null },
      { id: "doc_cve_changelog", title: "Changelog entry referencing CVE-2024-1234 fix in v2.3.1", denseRank: 4, sparseRank: 2 },
      { id: "doc_other_cve", title: "CVE-2023-9981 advisory (unrelated vulnerability)", denseRank: 5, sparseRank: 3 },
      { id: "doc_general_sec", title: "Security best practices for container deployments", denseRank: null, sparseRank: 4 },
    ],
  },
};

const RRF_K = 60;

function rrfScoreFromRank(rank, k = RRF_K) {
  if (rank == null) return 0;
  return 1 / (k + rank);
}

// Compute fused score per doc given an alpha weighting between dense and sparse,
// expressed through weighted RRF contributions (still rank-based, avoids needing
// raw incomparable scores — matches the lesson's emphasis on RRF over raw-score blending).
function computeFusion(docs, alpha) {
  return docs
    .map((d) => {
      const denseContribution = rrfScoreFromRank(d.denseRank) * alpha * 2;
      const sparseContribution = rrfScoreFromRank(d.sparseRank) * (1 - alpha) * 2;
      return {
        ...d,
        denseContribution,
        sparseContribution,
        fused: denseContribution + sparseContribution,
      };
    })
    .sort((a, b) => b.fused - a.fused);
}

function RankedList({ title, color, docs, rankKey }) {
  const sorted = [...docs]
    .filter((d) => d[rankKey] != null)
    .sort((a, b) => a[rankKey] - b[rankKey]);
  return (
    <div
      style={{
        background: "rgba(2,6,23,0.72)",
        border: `1px solid ${DS.border}`,
        borderRadius: DS.radiusMd,
        padding: "12px 14px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {sorted.map((d) => (
          <div key={d.id} style={{ display: "flex", gap: 8, fontSize: 11.5, alignItems: "flex-start" }}>
            <span style={{ color, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, flexShrink: 0, width: 18 }}>
              #{d[rankKey]}
            </span>
            <span style={{ color: DS.t2, lineHeight: "16px" }}>{d.title}</span>
          </div>
        ))}
        {sorted.length === 0 && <div style={{ fontSize: 11.5, color: DS.dim }}>No results.</div>}
      </div>
    </div>
  );
}

export default function HybridRetrievalViz() {
  const [queryId, setQueryId] = useState("conceptual");
  const [alpha, setAlpha] = useState(0.5);

  const query = QUERIES[queryId];

  const fused = useMemo(() => computeFusion(query.docs, alpha), [query, alpha]);

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
          Hybrid Retrieval: Two Lanes, One Fused Ranking
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: DS.t3 }}>
          A query runs through dense (semantic) and sparse (BM25) retrieval in parallel, then a fusion step
          combines both ranked lists. Adjust the weighting and watch the final ranking shift.
        </p>
      </div>

      {/* Query selector */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {Object.values(QUERIES).map((q) => {
          const active = q.id === queryId;
          return (
            <button
              key={q.id}
              onClick={() => setQueryId(q.id)}
              style={{
                padding: "7px 14px",
                borderRadius: DS.radiusSm,
                border: `1.5px solid ${active ? CYAN : DS.border}`,
                background: active ? CYAN_DIM : "rgba(255,255,255,0.02)",
                color: active ? CYAN_BRIGHT : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.15s ease",
              }}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: CYAN_DIM,
          border: `1px solid rgba(6,182,212,0.25)`,
          borderRadius: DS.radiusMd,
          padding: "9px 14px",
          marginBottom: 18,
          fontSize: 12.5,
          color: DS.t2,
          textAlign: "center",
        }}
      >
        {query.description}
      </div>

      {/* Two parallel lanes */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }} className="ds-g2">
        <RankedList title="Dense / Semantic (vector search)" color={CYAN_BRIGHT} docs={query.docs} rankKey="denseRank" />
        <RankedList title="Sparse / BM25 (keyword search)" color={AMBER} docs={query.docs} rankKey="sparseRank" />
      </div>

      {/* Alpha slider */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12.5, color: DS.t2, fontFamily: "var(--ds-sans), sans-serif", display: "block", marginBottom: 6 }}>
          Fusion weighting — α = {alpha.toFixed(2)} ({Math.round(alpha * 100)}% dense / {Math.round((1 - alpha) * 100)}% sparse)
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={alpha}
          onChange={(e) => setAlpha(+e.target.value)}
          style={{ width: "100%", accentColor: CYAN }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: DS.dim, fontFamily: "var(--ds-mono), monospace" }}>
          <span>0.0 — pure sparse (BM25 only)</span>
          <span>0.5 — balanced</span>
          <span>1.0 — pure dense</span>
        </div>
      </div>

      {/* Fused ranking */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: DS.radiusMd,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, color: GREEN, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Fused Final Ranking (weighted Reciprocal Rank Fusion)
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {fused.map((d, i) => {
            const maxFused = fused[0].fused || 1;
            const pct = Math.max(4, Math.round((d.fused / maxFused) * 100));
            return (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 22,
                    flexShrink: 0,
                    fontFamily: "var(--ds-mono), monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: i === 0 ? GREEN : DS.t3,
                  }}
                >
                  #{i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: DS.t1, marginBottom: 4, lineHeight: "16px" }}>{d.title}</div>
                  <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
                    <div
                      style={{
                        width: `${pct * (d.denseContribution / (d.fused || 1))}%`,
                        background: CYAN_BRIGHT,
                        transition: "width 0.25s ease",
                      }}
                    />
                    <div
                      style={{
                        width: `${pct * (d.sparseContribution / (d.fused || 1))}%`,
                        background: AMBER,
                        transition: "width 0.25s ease",
                      }}
                    />
                  </div>
                </div>
                <div style={{ width: 56, flexShrink: 0, fontSize: 10.5, fontFamily: "var(--ds-mono), monospace", color: DS.t3, textAlign: "right" }}>
                  {d.fused.toFixed(3)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: DS.t3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: CYAN_BRIGHT, display: "inline-block" }} /> dense contribution
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: AMBER, display: "inline-block" }} /> sparse contribution
          </span>
        </div>
      </div>

      {/* Explanation footer */}
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
        Each lane contributes <code style={{ fontFamily: "var(--ds-mono), monospace" }}>1 / (k + rank)</code> per
        document (k=60, the standard RRF constant), scaled by α for dense and (1−α) for sparse — this sidesteps
        the problem of comparing an unbounded BM25 score to a 0–1 cosine similarity directly. Try the identifier
        query at α=1.0 (pure dense): the real CVE advisory drops out of the top spot because the model treats
        "CVE-2024-1234" as just another opaque token. Pull α toward 0 and BM25's exact-match signal pulls it back
        to the top — this is exactly why production systems default to a hybrid, not either lane alone.
      </div>
    </div>
  );
}
