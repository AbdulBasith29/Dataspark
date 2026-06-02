import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// --- Constants declared before component to avoid TDZ crashes ---

const ACCENT = "#8B5CF6";
const AMBER = "#F59E0B";
const GREEN = "#34D399";

// ── Data for each test card ────────────────────────────────────────────────

const TESTS = [
  {
    id: "ttest",
    name: "t-Test",
    tagline: "Comparing means (1 or 2 groups)",
    color: DS.ind,
    bg: "rgba(129,140,248,0.08)",
    border: "rgba(129,140,248,0.3)",
    subtypes: [
      { label: "One-sample", desc: "Is the group mean equal to a known reference?" },
      { label: "Two-sample (independent)", desc: "Do two separate groups have the same mean?" },
      { label: "Paired", desc: "Do before/after measurements on the same subjects differ?" },
    ],
    formula: "t = (x̄₁ − x̄₂) / √(s²/n₁ + s²/n₂)",
    formulaDesc: "Difference in sample means divided by the pooled standard error.",
    example: {
      title: "Two-sample: Checkout time (sec)",
      headers: ["Group", "n", "Mean", "SD"],
      rows: [
        ["Control (A)", "120", "48.3", "11.2"],
        ["Treatment (B)", "118", "44.1", "10.8"],
      ],
      result: "t = 2.74,  df = 236,  p = 0.0065",
      interpretation: "Reject H₀: Treatment reduced checkout time significantly.",
    },
    assumptions: [
      "Each observation is independent",
      "Data in each group approximately normal (or n ≥ 30 by CLT)",
      "Two-sample: roughly equal variances (check Levene's test) or use Welch's t",
      "Paired: differences are normally distributed",
    ],
  },
  {
    id: "chisq",
    name: "Chi-Squared (χ²)",
    tagline: "Comparing categorical frequencies",
    color: ACCENT,
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.3)",
    subtypes: [
      { label: "Goodness of fit", desc: "Does observed frequency match an expected distribution?" },
      { label: "Test of independence", desc: "Are two categorical variables independent?" },
    ],
    formula: "χ² = Σ (O − E)² / E",
    formulaDesc: "Sum of squared deviations of observed (O) from expected (E) counts.",
    example: {
      title: "Independence: Clicked ad? × Purchased?",
      headers: ["", "Purchased", "Not purchased"],
      rows: [
        ["Clicked ad", "42", "158"],
        ["Not clicked", "23", "277"],
      ],
      result: "χ²(1) = 12.7,  p = 0.0004",
      interpretation: "Strong evidence ad click and purchase are not independent.",
    },
    assumptions: [
      "Observations are independent",
      "Expected count in each cell ≥ 5 (otherwise use Fisher's exact test)",
      "Data are counts, not percentages or means",
    ],
  },
  {
    id: "anova",
    name: "ANOVA",
    tagline: "Comparing means across 3+ groups",
    color: GREEN,
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.3)",
    subtypes: [
      { label: "One-way ANOVA", desc: "Compare means across 3+ independent groups." },
      { label: "Post-hoc tests", desc: "Tukey HSD or Bonferroni correct for multiple comparisons after rejecting H₀." },
    ],
    formula: "F = MS_between / MS_within",
    formulaDesc:
      "Ratio of variance explained by group membership to unexplained within-group variance.",
    example: {
      title: "Page load time (ms) across 3 designs",
      headers: ["Design", "n", "Mean", "SD"],
      rows: [
        ["Current", "80", "412", "58"],
        ["Redesign A", "80", "388", "62"],
        ["Redesign B", "80", "351", "55"],
      ],
      result: "F(2, 237) = 18.4,  p < 0.0001",
      interpretation: "At least one design differs. Run Tukey HSD to find which pairs.",
    },
    assumptions: [
      "Observations are independent within and across groups",
      "Each group population is approximately normal",
      "Equal population variances (Levene's test; if violated, use Welch's ANOVA)",
    ],
  },
];

// ── Multiple t-test α inflation explainer ────────────────────────────────

const ALPHA_SINGLE = 0.05;
const COMPARISONS = [
  { k: 2, label: "2 groups (1 comparison)" },
  { k: 3, label: "3 groups (3 comparisons)" },
  { k: 4, label: "4 groups (6 comparisons)" },
  { k: 5, label: "5 groups (10 comparisons)" },
];
function familyError(numTests) {
  return 1 - Math.pow(1 - ALPHA_SINGLE, numTests);
}
function numComparisons(k) {
  return (k * (k - 1)) / 2;
}

// ── Decision-tree flow data ───────────────────────────────────────────────

const DECISION_STEPS = [
  {
    q: "What type of outcome variable?",
    options: [
      { label: "Continuous (mean)", next: 1 },
      { label: "Categorical (counts)", next: 3 },
    ],
  },
  {
    q: "How many groups are you comparing?",
    options: [
      { label: "1 group vs reference", next: "One-sample t-test" },
      { label: "2 independent groups", next: "Two-sample t-test" },
      { label: "Same subjects, 2 time points", next: "Paired t-test" },
      { label: "3 or more groups", next: 2 },
    ],
  },
  {
    q: "One factor or multiple factors?",
    options: [
      { label: "One factor", next: "One-way ANOVA" },
      { label: "Multiple factors", next: "Factorial ANOVA / mixed models" },
    ],
  },
  {
    q: "How many categorical variables?",
    options: [
      { label: "1 variable (vs expected)", next: "Chi-squared goodness of fit" },
      { label: "2 variables (contingency)", next: "Chi-squared test of independence" },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function StatTestsViz() {
  const [activeTest, setActiveTest] = useState("ttest");
  const [activeTab, setActiveTab] = useState("overview"); // overview | example | assumptions
  const [decisionStep, setDecisionStep] = useState(0);
  const [decisionPath, setDecisionPath] = useState([]);
  const [showAlphaInflation, setShowAlphaInflation] = useState(false);

  const test = TESTS.find((t) => t.id === activeTest);

  const handleDecision = (option) => {
    const nextPath = [...decisionPath, option.label];
    if (typeof option.next === "number") {
      setDecisionStep(option.next);
      setDecisionPath(nextPath);
    } else {
      // Terminal answer — store as string
      setDecisionStep(option.next);
      setDecisionPath(nextPath);
    }
  };

  const resetDecision = () => {
    setDecisionStep(0);
    setDecisionPath([]);
  };

  const isDecisionTerminal = typeof decisionStep === "string";
  const currentDecisionNode = isDecisionTerminal ? null : DECISION_STEPS[decisionStep];

  return (
    <div style={{ fontFamily: "var(--ds-sans), sans-serif", color: DS.t1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: DS.t1, marginBottom: 4 }}>
        Statistical Test Selector
      </div>
      <p
        style={{
          fontSize: 12,
          color: DS.t3,
          fontFamily: "var(--ds-mono), monospace",
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        Navigate the decision tree to choose the right test, then explore each
        test's formula, worked example, and assumptions below.
      </p>

      {/* ── Decision tree ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--ds-mono), monospace",
            color: DS.t3,
            marginBottom: 8,
          }}
        >
          Test selection flowchart
        </div>

        {/* Breadcrumb path */}
        {decisionPath.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginBottom: 10,
            }}
          >
            {decisionPath.map((step, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--ds-mono), monospace",
                    color: DS.dim,
                    background: "rgba(255,255,255,0.04)",
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  {step}
                </span>
                {i < decisionPath.length - 1 && (
                  <span style={{ color: DS.dim, fontSize: 10 }}>→</span>
                )}
              </span>
            ))}
          </div>
        )}

        {isDecisionTerminal ? (
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: ACCENT,
                marginBottom: 6,
              }}
            >
              Recommended test: {decisionStep}
            </div>
            <button
              type="button"
              onClick={resetDecision}
              style={{
                fontSize: 11,
                padding: "5px 12px",
                borderRadius: 7,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.04)",
                color: DS.t3,
                cursor: "pointer",
              }}
            >
              ↩ Start over
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: DS.t1,
                marginBottom: 10,
              }}
            >
              {currentDecisionNode.q}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {currentDecisionNode.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDecision(opt)}
                  style={{
                    padding: "6px 13px",
                    borderRadius: 8,
                    border: `1px solid ${DS.border}`,
                    background: "rgba(139,92,246,0.08)",
                    color: DS.t2,
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Test selector tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {TESTS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setActiveTest(t.id); setActiveTab("overview"); }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${activeTest === t.id ? t.border : DS.border}`,
              background: activeTest === t.id ? t.bg : "rgba(255,255,255,0.02)",
              color: activeTest === t.id ? t.color : DS.t3,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              cursor: "pointer",
              fontWeight: activeTest === t.id ? 700 : 400,
              transition: "all 0.15s",
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* ── Active test card ── */}
      <div
        style={{
          background: test.bg,
          border: `1px solid ${test.border}`,
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
        }}
      >
        {/* Card header */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: test.color }}>
            {test.name}
          </div>
          <div style={{ fontSize: 11, color: DS.t3, marginTop: 2 }}>{test.tagline}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {test.subtypes.map((sub) => (
              <span
                key={sub.label}
                title={sub.desc}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.06)",
                  color: DS.t2,
                  cursor: "help",
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                {sub.label}
              </span>
            ))}
          </div>
        </div>

        {/* Inner tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["overview", "example", "assumptions"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 10,
                padding: "4px 10px",
                borderRadius: 6,
                border: "none",
                background: activeTab === tab ? "rgba(255,255,255,0.10)" : "transparent",
                color: activeTab === tab ? DS.t1 : DS.dim,
                cursor: "pointer",
                fontFamily: "var(--ds-mono), monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Overview (formula) */}
        {activeTab === "overview" && (
          <div>
            <div
              style={{
                background: "rgba(2,6,23,0.72)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 10,
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 15,
                color: test.color,
                textAlign: "center",
                letterSpacing: "0.03em",
              }}
            >
              {test.formula}
            </div>
            <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.6 }}>
              {test.formulaDesc}
            </div>
          </div>
        )}

        {/* Tab: Example */}
        {activeTab === "example" && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                marginBottom: 8,
              }}
            >
              {test.example.title}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: 11,
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                <thead>
                  <tr>
                    {test.example.headers.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "6px 10px",
                          borderBottom: `1px solid ${DS.border}`,
                          color: DS.t3,
                          textAlign: "left",
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {test.example.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: "6px 10px",
                            borderBottom: `1px solid rgba(255,255,255,0.04)`,
                            color: ci === 0 ? DS.t2 : DS.t1,
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                marginTop: 10,
                background: "rgba(2,6,23,0.72)",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "var(--ds-mono), monospace",
                fontSize: 12,
                color: test.color,
              }}
            >
              {test.example.result}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: DS.t2, lineHeight: 1.55 }}>
              {test.example.interpretation}
            </div>
          </div>
        )}

        {/* Tab: Assumptions */}
        {activeTab === "assumptions" && (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {test.assumptions.map((a, i) => (
              <li
                key={i}
                style={{ fontSize: 12, color: DS.t2, lineHeight: 1.65, marginBottom: 5 }}
              >
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Multiple t-test inflation explainer ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${DS.border}`,
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          onClick={() => setShowAlphaInflation((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: DS.t2 }}>
            Why not just run multiple t-tests for 3+ groups?
          </span>
          <span
            style={{
              fontSize: 12,
              color: DS.dim,
              transform: showAlphaInflation ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              display: "inline-block",
            }}
          >
            ▾
          </span>
        </button>

        {showAlphaInflation && (
          <div style={{ padding: "0 16px 16px 16px", borderTop: `1px solid ${DS.border}` }}>
            <p style={{ fontSize: 12, color: DS.t2, lineHeight: 1.6, marginTop: 12 }}>
              Each individual t-test has a 5% chance of a false positive (Type I error) when α = 0.05.
              Running multiple tests inflates the{" "}
              <strong style={{ color: DS.t1 }}>family-wise error rate</strong> — the probability
              of at least one false positive across all comparisons.
            </p>

            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: 11,
                  fontFamily: "var(--ds-mono), monospace",
                }}
              >
                <thead>
                  <tr>
                    {["Scenario", "Comparisons", "Family error rate"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "6px 10px",
                          borderBottom: `1px solid ${DS.border}`,
                          color: DS.t3,
                          textAlign: "left",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISONS.map((row) => {
                    const nc = numComparisons(row.k);
                    const fe = familyError(nc);
                    const isBad = fe > 0.10;
                    return (
                      <tr key={row.k}>
                        <td style={{ padding: "6px 10px", color: DS.t2, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                          {row.label}
                        </td>
                        <td style={{ padding: "6px 10px", color: DS.t1, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                          {nc}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            color: isBad ? AMBER : GREEN,
                            fontWeight: isBad ? 700 : 400,
                            borderBottom: `1px solid rgba(255,255,255,0.04)`,
                          }}
                        >
                          {(fe * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 12, color: DS.t3, lineHeight: 1.6, marginTop: 10 }}>
              ANOVA controls this by testing all groups simultaneously under one H₀: all means are
              equal. If ANOVA rejects, use post-hoc tests (Tukey HSD, Bonferroni) to identify
              which specific pairs differ — those correct for multiple comparisons.
            </p>
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: 11,
          color: DS.dim,
          lineHeight: 1.6,
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        Interview tip: When asked to compare groups, state the test, its assumptions, and why you
        didn't use a simpler alternative (e.g., "I used ANOVA rather than multiple t-tests to
        control the family-wise error rate, then ran Tukey HSD for pairwise contrasts").
      </p>
    </div>
  );
}
