import { useState } from "react";
import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";
import { SimpleMarkdown } from "../../lib/simple-markdown.jsx";

const DIFF_COLORS = {
  Easy: { bg: "rgba(52,211,153,0.12)", text: "#34D399", border: "rgba(52,211,153,0.25)" },
  Medium: { bg: "rgba(251,191,36,0.12)", text: "#FBBF24", border: "rgba(251,191,36,0.25)" },
  Hard: { bg: "rgba(248,113,113,0.12)", text: "#F87171", border: "rgba(248,113,113,0.25)" },
};

function DifficultyBadge({ difficulty }) {
  const c = DIFF_COLORS[difficulty] || DIFF_COLORS.Medium;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: "var(--ds-mono), monospace",
        letterSpacing: "0.04em",
      }}
    >
      {difficulty}
    </span>
  );
}

function Chip({ label, accent }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 6,
        background: accent ? `${accent}18` : "rgba(255,255,255,0.04)",
        color: accent || DS.t3,
        border: `1px solid ${accent ? `${accent}30` : DS.border}`,
        fontFamily: "var(--ds-mono), monospace",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function SpinnerButton({ onClick, disabled, loading, accent, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "13px 0",
        background: disabled ? "rgba(255,255,255,0.06)" : accent,
        border: "none",
        borderRadius: DS.radiusSm,
        color: disabled ? DS.dim : "#fff",
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "var(--ds-sans), sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 4px 18px ${accent}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.15s ease, box-shadow 0.15s ease",
        opacity: loading ? 0.75 : 1,
      }}
    >
      {loading && (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            display: "inline-block",
            animation: "ds-spin 0.7s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}

function RubricList({ evalResult, question }) {
  if (!evalResult && !question?.rubric?.length) return null;

  if (evalResult && Array.isArray(evalResult.rubricScores) && evalResult.rubricScores.length) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
        {evalResult.rubricScores.map((rs, i) => (
          <li
            key={i}
            style={{
              fontSize: 12,
              fontFamily: "var(--ds-mono), monospace",
              color: rs.met ? DS.grn : DS.t3,
              padding: "7px 10px",
              borderRadius: 8,
              background: rs.met ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${rs.met ? "rgba(52,211,153,0.18)" : DS.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}>{rs.met ? "✓" : "○"}</span>
            <span style={{ flex: 1 }}>{rs.criterion}</span>
            {rs.confidence && (
              <span style={{ color: DS.dim, flexShrink: 0 }}>({rs.confidence})</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (Array.isArray(question?.rubric) && question.rubric.length) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
        {question.rubric.map((criterion, i) => (
          <li
            key={i}
            style={{
              fontSize: 12,
              fontFamily: "var(--ds-mono), monospace",
              color: DS.t3,
              padding: "7px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${DS.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}>○</span>
            <span>{criterion}</span>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

export default function PracticeQuestion({
  question,
  courseAccent,
  onSubmit,
  evalLoading,
  evalResult,
  evalError,
  onAskTutor,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("answer");
  const [hintsOpen, setHintsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const accent = courseAccent || DS.indB;

  if (!question) return null;

  const canSubmit = userAnswer.trim().length > 0 && !evalLoading && !submitted;
  const showModelTab = submitted;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitted(true);
    await onSubmit?.(userAnswer.trim());
  };

  const TabButton = ({ id, label, disabled: tabDisabled }) => {
    const isActive = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => !tabDisabled && setActiveTab(id)}
        disabled={tabDisabled}
        style={{
          padding: "9px 18px",
          background: "none",
          border: "none",
          borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
          color: isActive ? accent : tabDisabled ? DS.dim : DS.t3,
          fontSize: 13,
          fontWeight: isActive ? 700 : 500,
          fontFamily: "var(--ds-sans), sans-serif",
          cursor: tabDisabled ? "not-allowed" : "pointer",
          transition: "color 0.15s, border-color 0.15s",
          marginBottom: -1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <style>{`
        @keyframes ds-spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { .pq-layout { flex-direction: column !important; } }
      `}</style>
      <div
        className="pq-layout"
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          minHeight: 0,
          gap: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            flex: "0 0 50%",
            minWidth: 0,
            overflowY: "auto",
            borderRight: `1px solid ${DS.border}`,
            borderLeft: `3px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "24px 24px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <DifficultyBadge difficulty={question.difficulty} />
              {question.estimatedMinutes && (
                <Chip label={`${question.estimatedMinutes} min`} />
              )}
              {question.company && (
                <Chip label={question.company} accent={accent} />
              )}
            </div>

            <h2
              style={{
                fontSize: "clamp(16px, 2.5vw, 22px)",
                fontWeight: 800,
                color: DS.t1,
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                fontFamily: "var(--ds-sans), sans-serif",
              }}
            >
              {question.title}
            </h2>

            {Array.isArray(question.tags) && question.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                {question.tags.map((t) => (
                  <Chip key={t} label={t} />
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              padding: "0 24px",
              fontSize: 14,
              color: DS.t2,
              lineHeight: 1.8,
              fontFamily: "var(--ds-sans), sans-serif",
            }}
          >
            <SimpleMarkdown text={question.prompt} accent={accent} />
          </div>

          {Array.isArray(question.hints) && question.hints.length > 0 && (
            <div style={{ padding: "0 24px 0" }}>
              <button
                type="button"
                onClick={() => setHintsOpen((v) => !v)}
                style={{
                  background: "none",
                  border: `1px solid ${DS.border}`,
                  borderRadius: DS.radiusSm,
                  padding: "8px 14px",
                  color: DS.t3,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--ds-mono), monospace",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transition: "transform 0.2s",
                    transform: hintsOpen ? "rotate(90deg)" : "rotate(0deg)",
                    fontSize: 10,
                    lineHeight: 1,
                  }}
                >
                  ▶
                </span>
                {hintsOpen ? "Hide hints" : `Show hints (${question.hints.length})`}
              </button>
              {hintsOpen && (
                <ul
                  style={{
                    margin: "10px 0 0",
                    paddingLeft: 20,
                    color: DS.t2,
                    fontSize: 13,
                    lineHeight: 1.7,
                    fontFamily: "var(--ds-sans), sans-serif",
                  }}
                >
                  {question.hints.map((h, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div
            style={{
              height: 1,
              background: DS.border,
              margin: "20px 24px",
            }}
          />

          {evalResult && !evalLoading && (
            <div style={{ padding: "0 24px" }}>
              <div
                style={{
                  ...dsGlassCard({
                    padding: "18px 20px",
                    marginBottom: 20,
                    border: `1px solid ${accent}35`,
                  }),
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: accent,
                    fontFamily: "var(--ds-mono), monospace",
                    letterSpacing: "0.12em",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  AI Scorecard
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 42,
                      fontWeight: 900,
                      color: DS.t1,
                      lineHeight: 1,
                      fontFamily: "var(--ds-mono), monospace",
                    }}
                  >
                    {Math.round(evalResult.score)}
                  </span>
                  <span
                    style={{
                      color: DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                      fontSize: 13,
                    }}
                  >
                    {evalResult.totalScore}
                  </span>
                </div>
                {evalResult.feedback && (
                  <p
                    style={{
                      fontSize: 13,
                      color: DS.t2,
                      lineHeight: 1.65,
                      margin: "0 0 14px",
                      fontFamily: "var(--ds-sans), sans-serif",
                    }}
                  >
                    {evalResult.feedback}
                  </p>
                )}
                <RubricList evalResult={evalResult} question={question} />
              </div>
            </div>
          )}

          {evalError && (
            <div style={{ padding: "0 24px" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "#FCA5A5",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: DS.radiusSm,
                  padding: "10px 14px",
                  fontFamily: "var(--ds-sans), sans-serif",
                  margin: "0 0 20px",
                }}
              >
                {evalError}
              </p>
            </div>
          )}

          {evalLoading && !evalResult && (
            <div style={{ padding: "0 24px 20px" }}>
              <div
                style={{
                  ...dsGlassCard({
                    padding: "18px 20px",
                    border: `1px solid ${accent}25`,
                  }),
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: accent,
                    fontFamily: "var(--ds-mono), monospace",
                    letterSpacing: "0.12em",
                    marginBottom: 10,
                    textTransform: "uppercase",
                  }}
                >
                  AI Scorecard
                </div>
                <p
                  style={{
                    color: DS.t3,
                    fontSize: 13,
                    fontFamily: "var(--ds-sans), sans-serif",
                    margin: 0,
                  }}
                >
                  Scoring your answer…
                </p>
              </div>
            </div>
          )}

          <div style={{ padding: "0 24px 24px", marginTop: "auto" }}>
            <button
              type="button"
              onClick={onAskTutor}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${DS.border}`,
                borderRadius: DS.radiusSm,
                padding: "9px 16px",
                color: DS.t2,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--ds-sans), sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>💬</span>
              Ask AI tutor
            </button>
          </div>
        </div>

        <div
          style={{
            flex: "0 0 50%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            background: "rgba(2,6,23,0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${DS.border}`,
              padding: "0 20px",
              flexShrink: 0,
            }}
          >
            <TabButton id="answer" label="Your Answer" />
            <TabButton
              id="model"
              label="Model Answer"
              disabled={!showModelTab}
            />
          </div>

          {activeTab === "answer" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "16px 20px 20px",
                minHeight: 0,
              }}
            >
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={
                  question.type === "code"
                    ? "Write your code here…"
                    : "Write your answer — explain your reasoning, tradeoffs, and approach…"
                }
                disabled={submitted}
                spellCheck={question.type !== "code"}
                style={{
                  flex: 1,
                  minHeight: 320,
                  background: "rgba(2,6,23,0.72)",
                  border: `1px solid ${DS.border}`,
                  borderRadius: DS.radiusMd,
                  padding: "16px 18px",
                  color: DS.t1,
                  fontSize: 13,
                  lineHeight: 1.75,
                  resize: "vertical",
                  fontFamily:
                    question.type === "code"
                      ? "var(--ds-mono), monospace"
                      : "var(--ds-sans), sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: submitted ? 0.65 : 1,
                  marginBottom: 14,
                  caretColor: accent,
                }}
              />

              <SpinnerButton
                onClick={handleSubmit}
                disabled={!canSubmit}
                loading={evalLoading}
                accent={accent}
              >
                {evalLoading ? "Scoring…" : submitted ? "Submitted" : "Submit & Score"}
              </SpinnerButton>
            </div>
          )}

          {activeTab === "model" && showModelTab && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: DS.grn,
                  fontFamily: "var(--ds-mono), monospace",
                  letterSpacing: "0.12em",
                  marginBottom: 14,
                  textTransform: "uppercase",
                }}
              >
                Model Answer
              </div>

              {question.modelAnswer ? (
                question.type === "code" ? (
                  <pre
                    style={{
                      background: "rgba(2,6,23,0.72)",
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.radiusMd,
                      padding: "16px 18px",
                      color: DS.t1,
                      fontSize: 13,
                      lineHeight: 1.7,
                      fontFamily: "var(--ds-mono), monospace",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: "0 0 20px",
                    }}
                  >
                    {question.modelAnswer}
                  </pre>
                ) : (
                  <SimpleMarkdown text={question.modelAnswer} accent={accent} />
                )
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: DS.t3,
                    lineHeight: 1.7,
                    fontFamily: "var(--ds-sans), sans-serif",
                    fontStyle: "italic",
                    marginBottom: 20,
                  }}
                >
                  No model answer available. Review your AI scorecard and use the tutor to go deeper.
                </p>
              )}

              {(Array.isArray(question.rubric) && question.rubric.length > 0) && (
                <>
                  <div
                    style={{
                      height: 1,
                      background: DS.border,
                      margin: "16px 0",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: DS.t3,
                      fontFamily: "var(--ds-mono), monospace",
                      letterSpacing: "0.12em",
                      marginBottom: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    Evaluation Criteria
                  </div>
                  <RubricList evalResult={evalResult} question={question} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
