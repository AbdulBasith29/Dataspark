import { useState } from "react";
import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";
import { SimpleMarkdown } from "../../lib/simple-markdown.jsx";
import VizLabShell from "./VizLabShell.jsx";

const sectionLabel = {
  fontSize: 10,
  color: DS.dim,
  fontFamily: "var(--ds-mono), monospace",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 10,
};

function SectionCard({ title, badge, children, accent, borderAccent }) {
  return (
    <section
      style={{
        ...dsGlassCard({ padding: "22px 22px 26px", marginBottom: 20 }),
        border: `1px solid ${borderAccent || DS.border}`,
      }}
      aria-labelledby={`lesson-section-${title.replace(/\s/g, "-")}`}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div id={`lesson-section-${title.replace(/\s/g, "-")}`} style={{ ...sectionLabel, color: accent || DS.ind, marginBottom: 0 }}>
          {title}
        </div>
        {badge && (
          <span style={{
            fontSize: 10,
            padding: "4px 10px",
            borderRadius: 999,
            background: `${accent || DS.ind}14`,
            color: accent || DS.ind,
            fontFamily: "var(--ds-mono), monospace",
            fontWeight: 600,
            border: `1px solid ${(accent || DS.ind)}30`,
          }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * @param {{
 *   course: { id: string, title: string, color: string, accent: string },
 *   lesson: { id: string, title: string, duration?: string },
 *   moduleSpec: import("../../data/lesson-modules.js").LessonModuleSpec,
 *   VizComponent: React.ComponentType | null,
 *   vizComingSoon?: boolean,
 *   onBack: () => void,
 *   backLabel: string,
 *   onMarkComplete: () => void,
 *   onAskTutor: () => void,
 * }} props
 */
export default function LessonModule({
  course,
  lesson,
  moduleSpec,
  VizComponent,
  vizComingSoon = false,
  onBack,
  backLabel,
  onMarkComplete,
  onAskTutor,
}) {
  const [answers, setAnswers] = useState(() => ({}));
  const [revealed, setRevealed] = useState({});

  const checks = moduleSpec.knowledgeCheck || [];
  let correctCount = 0;
  checks.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correctCount += 1;
  });

  const score = checks.length ? correctCount / checks.length : 1;
  const minCorrect = checks.length ? Math.max(1, Math.round(0.7 * checks.length)) : 0;
  const passedCheck = checks.length === 0 || correctCount >= minCorrect;

  const durationBadge = moduleSpec.durationLabel || lesson.duration || "18–20 min";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: DS.t3,
          fontSize: 12,
          cursor: "pointer",
          padding: "20px 0 8px",
          fontFamily: "var(--ds-mono), monospace",
          fontWeight: 600,
        }}
      >
        {backLabel}
      </button>
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontSize: 10,
          color: course.accent,
          fontFamily: "var(--ds-mono), monospace",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          marginBottom: 8,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
        >
          <span>{course.title}</span>
          <span style={{ color: DS.border }}>|</span>
          <span style={{ color: DS.grn }}>Module · {durationBadge}</span>
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: DS.t1, margin: 0, letterSpacing: "-0.02em" }}>
          {lesson.title}
        </h1>
        {moduleSpec.outcomes?.length > 0 && (
          <ul style={{
            margin: "14px 0 0",
            paddingLeft: 20,
            color: DS.t3,
            fontSize: 14,
            lineHeight: 1.65,
          }}
          >
            {moduleSpec.outcomes.map((o) => (
              <li key={o} style={{ marginBottom: 6 }}>{o}</li>
            ))}
          </ul>
        )}
      </div>

      <SectionCard title="1 · Learn" badge="Read first" accent={course.accent} borderAccent={`${course.color}28`}>
        <SimpleMarkdown text={moduleSpec.learnMarkdown} accent={course.accent} />
      </SectionCard>

      <SectionCard title="2 · Watch or deep dive" badge={moduleSpec.video ? "Video" : "Written"} accent={course.accent} borderAccent={`${course.color}22`}>
        {moduleSpec.video ? (
          <>
            <p style={{ margin: "0 0 12px", color: DS.t3, fontSize: 14, lineHeight: 1.6 }}>
              <strong style={{ color: DS.t1 }}>{moduleSpec.video.title}</strong>
              {" · "}
              {moduleSpec.video.channel}
            </p>
            <div style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              borderRadius: DS.radiusMd,
              overflow: "hidden",
              border: `1px solid ${DS.border}`,
              background: "#000",
            }}
            >
              <iframe
                title={moduleSpec.video.title}
                src={`https://www.youtube-nocookie.com/embed/${moduleSpec.video.youtubeId}?rel=0${moduleSpec.video.startSeconds != null ? `&start=${moduleSpec.video.startSeconds}` : ""}`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div style={{ marginTop: 14 }}>
              <SimpleMarkdown text={moduleSpec.videoFallbackMarkdown} accent={course.accent} />
            </div>
          </>
        ) : (
          <SimpleMarkdown text={moduleSpec.videoFallbackMarkdown} accent={course.accent} />
        )}
      </SectionCard>

      <SectionCard title="3 · Try it" badge={VizComponent ? "Interactive" : "Practice"} accent={course.accent} borderAccent={`${course.color}22`}>
        <p style={{ margin: "0 0 16px", color: DS.t2, fontSize: 15, lineHeight: 1.75 }}>
          {moduleSpec.tryGuidance}
        </p>
        {VizComponent ? (
          <VizLabShell accent={course.accent} accentSoft={`${course.color}14`}>
            <VizComponent />
          </VizLabShell>
        ) : vizComingSoon ? (
          <div style={{
            ...dsGlassCard({ padding: "28px 24px", textAlign: "center" }),
            border: `1px dashed ${course.color}40`,
          }}
          >
            <div style={{ fontSize: 10, color: course.accent, fontFamily: "var(--ds-mono), monospace", fontWeight: 700, letterSpacing: 1.4, marginBottom: 10 }}>INTERACTIVE LAB · COMING SOON</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: DS.t1, marginBottom: 8 }}>Visualization in production</div>
            <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
              This topic is slated for an interactive diagram. Until it ships, use the <strong style={{ color: DS.t1 }}>knowledge check</strong> above and the <strong style={{ color: DS.t1 }}>tutor</strong> with the same predict→verify loop.
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: DS.t3, fontSize: 14, lineHeight: 1.65 }}>
            No primary visualization is mapped for this lesson yet. Use the <strong style={{ color: DS.t1 }}>Practice</strong> tab and the tutor to run the same <strong style={{ color: course.accent }}>predict → verify</strong> loop.
          </p>
        )}
      </SectionCard>

      <SectionCard title="4 · Knowledge check" badge={`${checks.length} Q`} accent={course.accent} borderAccent={`${course.color}22`}>
        {checks.length === 0 ? (
          <p style={{ color: DS.t3, fontSize: 14, margin: 0 }}>No checks for this module yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {checks.map((q, qi) => (
              <div key={qi} style={{ borderBottom: qi < checks.length - 1 ? `1px solid ${DS.border}` : "none", paddingBottom: qi < checks.length - 1 ? 20 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: DS.t1, marginBottom: 12, lineHeight: 1.5 }}>{q.question}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        style={{
                          textAlign: "left",
                          padding: "12px 14px",
                          borderRadius: DS.radiusSm,
                          border: `1px solid ${selected ? `${course.color}55` : DS.border}`,
                          background: selected ? `${course.color}12` : "rgba(255,255,255,0.02)",
                          color: DS.t2,
                          fontSize: 14,
                          lineHeight: 1.5,
                          cursor: "pointer",
                          fontFamily: "var(--ds-sans), sans-serif",
                        }}
                      >
                        <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.dim, marginRight: 8 }}>{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answers[qi] !== undefined && (
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => ({ ...r, [qi]: true }))}
                    style={{
                      marginTop: 10,
                      background: "transparent",
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.radiusSm,
                      padding: "6px 12px",
                      color: DS.t3,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "var(--ds-mono), monospace",
                    }}
                  >
                    {revealed[qi] ? "Explanation" : "Show explanation"}
                  </button>
                )}
                {revealed[qi] && (
                  <p style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: answers[qi] === q.correctIndex ? DS.grn : "#F87171",
                    lineHeight: 1.6,
                    background: "rgba(255,255,255,0.03)",
                    padding: 12,
                    borderRadius: DS.radiusSm,
                    border: `1px solid ${DS.border}`,
                  }}
                  >
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
            <div style={{
              fontSize: 13,
              color: passedCheck ? DS.grn : DS.t3,
              fontFamily: "var(--ds-mono), monospace",
              marginTop: 4,
            }}
            >
              Score: {correctCount}/{checks.length}
              {" "}
              ({Math.round(score * 100)}%)
              {!passedCheck && ` — need ${minCorrect}/${checks.length} correct to mark complete`}
            </div>
          </div>
        )}
      </SectionCard>

      <div style={{ display: "flex", gap: 10, marginBottom: 48, marginTop: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={!passedCheck}
          onClick={onMarkComplete}
          title={!passedCheck ? `Answer all questions; need at least ${minCorrect} correct` : undefined}
          style={{
            flex: 1,
            minWidth: 220,
            background: passedCheck ? DS.indB : "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: DS.radiusSm,
            padding: "14px 0",
            color: passedCheck ? "#fff" : DS.dim,
            fontSize: 14,
            fontWeight: 700,
            cursor: passedCheck ? "pointer" : "not-allowed",
            fontFamily: "var(--ds-sans), sans-serif",
            boxShadow: passedCheck ? DS.shadowCta : "none",
          }}
        >
          Mark complete & continue →
        </button>
        <button
          type="button"
          onClick={onAskTutor}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${DS.border}`,
            borderRadius: DS.radiusSm,
            padding: "14px 22px",
            color: DS.t1,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--ds-sans), sans-serif",
          }}
        >
          Ask tutor
        </button>
      </div>
    </div>
  );
}
