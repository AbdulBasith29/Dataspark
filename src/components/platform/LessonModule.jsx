import { useEffect, useState } from "react";
import { DS, dsGlassCard } from "../../lib/ds-platform-tokens.js";
import { renderInlineMarkdown } from "../../lib/inline-markdown.jsx";
import { SimpleMarkdown } from "../../lib/simple-markdown.jsx";
import VizLabShell from "./VizLabShell.jsx";
import AsyncActionButton from "../AsyncActionButton.jsx";
import ConfidenceMeter from "./ConfidenceMeter.jsx";
import IntentLessonIntro from "./IntentLessonIntro.jsx";
import { buildDrillPrompt, recordCheckErrors } from "../../lib/adaptive-drills.js";
import {
  LVS_EVENT_NAMES,
  buildConfidenceMetadata,
  computeConfidenceDelta,
  trackConfidence,
} from "../../lib/analytics.js";

const sectionLabel = {
  fontSize: 10,
  color: DS.dim,
  fontFamily: "var(--ds-mono), monospace",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 10,
};

const TARGET_TAG_PATTERN = /(?:#|\/\/)?\s*ds-target:([a-zA-Z0-9_-]+)/;

function parseTargetedCodeSnippet(codeSnippet = "") {
  return codeSnippet.split("\n").map((rawLine, index) => {
    const match = rawLine.match(TARGET_TAG_PATTERN);
    const targetId = match?.[1] || null;
    const displayLine = rawLine.replace(TARGET_TAG_PATTERN, "").replace(/\s+$/, "");
    return { lineNumber: index + 1, displayLine, targetId };
  });
}

function buildDecisionArtifact({ graph, branchPath, clickedTargets, graphChoices, lessonTitle }) {
  const pathStages = branchPath.map((stageId) => graph?.stages?.[stageId]).filter(Boolean);
  const visited = new Set(branchPath);
  const tierFor = (recoveryStageId, passLabel = "Tier 1 (Passed)") => (visited.has(recoveryStageId) ? "Tier 3 (Required Recovery Path Pivot)" : passLabel);

  return {
    title: `${lessonTitle || "Interview Simulation"} · Technical Decision Artifact`,
    generatedAt: new Date().toISOString(),
    performanceMatrix: [
      { dimension: "Initial Problem-Solving Accuracy", result: tierFor("recovery_stage_1_closure") },
      { dimension: "System Scaling & Concurrency Instinct", result: tierFor("recovery_stage_2_locking") },
      { dimension: "Architectural Trade-Off Defense", result: tierFor("recovery_stage_3_tradeoff", "Principal Level (Passed)") },
    ],
    path: pathStages.map((stage, index) => ({
      step: index + 1,
      stageId: stage.id,
      title: stage.title,
      input: clickedTargets[stage.id] || graphChoices[stage.id] || null,
    })),
  };
}

function DecisionArtifactCard({ graph, branchPath, clickedTargets, graphChoices, lessonTitle, accent }) {
  const artifact = buildDecisionArtifact({ graph, branchPath, clickedTargets, graphChoices, lessonTitle });
  const artifactJson = JSON.stringify(artifact, null, 2);
  const downloadHref = `data:application/json;charset=utf-8,${encodeURIComponent(artifactJson)}`;

  return (
    <div style={{
      padding: "16px 18px",
      borderRadius: DS.radiusMd,
      border: `1px solid ${DS.grn}44`,
      background: `${DS.grn}0d`,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div>
        <div style={{ ...sectionLabel, color: DS.grn, marginBottom: 6 }}>Evaluation portfolio</div>
        <div style={{ color: DS.t1, fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Technical Decision Artifact</div>
        <p style={{ margin: 0, color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
          Download this path-specific diagnostic before you leave the module. It records where you passed cleanly and where the interviewer forced a recovery pivot.
        </p>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {artifact.performanceMatrix.map((row) => (
          <div
            key={row.dimension}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 12,
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: DS.radiusSm,
              border: `1px solid ${DS.border}`,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <span style={{ color: DS.t2, fontSize: 13, lineHeight: 1.4 }}>{row.dimension}</span>
            <span style={{
              color: row.result.includes("Recovery") ? "#FCD34D" : DS.grn,
              fontSize: 11,
              fontFamily: "var(--ds-mono), monospace",
              fontWeight: 700,
              textAlign: "right",
            }}>
              {row.result}
            </span>
          </div>
        ))}
      </div>

      <a
        href={downloadHref}
        download={`${(lessonTitle || "dataspark").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-decision-artifact.json`}
        style={{
          alignSelf: "flex-start",
          background: `${accent}22`,
          border: `1px solid ${accent}66`,
          borderRadius: DS.radiusSm,
          padding: "10px 14px",
          color: DS.t1,
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
          fontFamily: "var(--ds-sans), sans-serif",
        }}
      >
        Download artifact →
      </a>
    </div>
  );
}

function InterviewGraphStage({ graph, stage, branchPath, clickedTargets, graphChoices, selectedTarget, selectedChoice, onTargetClick, onChoiceSelect, accent, lessonTitle }) {
  if (!graph || !stage) return null;
  const codeLines = parseTargetedCodeSnippet(stage.code_snippet);
  const choices = Array.isArray(stage.choices) ? stage.choices : [];
  const isClickTarget = stage.type === "click_target";
  const isScenarioChoice = stage.type === "scenaro_choice" || stage.type === "scenario_choice";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {branchPath.map((stageId, index) => {
          const pathStage = graph.stages?.[stageId];
          return (
            <span
              key={`${stageId}-${index}`}
              style={{
                fontSize: 10,
                padding: "5px 9px",
                borderRadius: 999,
                background: index === branchPath.length - 1 ? `${accent}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${index === branchPath.length - 1 ? `${accent}66` : DS.border}`,
                color: index === branchPath.length - 1 ? accent : DS.t3,
                fontFamily: "var(--ds-mono), monospace",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}
            >
              {index + 1}. {pathStage?.badge || pathStage?.title || stageId}
            </span>
          );
        })}
      </div>

      <div>
        <div style={{ ...sectionLabel, color: accent, marginBottom: 6 }}>{stage.title}</div>
        {stage.prompt && (
          <p style={{ margin: 0, color: DS.t2, fontSize: 14, lineHeight: 1.7 }}>
            {stage.prompt}
          </p>
        )}
      </div>

      {stage.code_snippet && (
        <pre
          style={{
            margin: 0,
            padding: "14px 0",
            overflowX: "auto",
            borderRadius: 12,
            border: `1px solid ${DS.border}`,
            background: "rgba(2,6,23,0.72)",
            color: DS.t1,
            fontSize: 13,
            lineHeight: 1.65,
            fontFamily: "var(--ds-mono), monospace",
          }}
        >
          {codeLines.map(({ lineNumber, displayLine, targetId }) => {
            const isSelected = selectedTarget === targetId && Boolean(targetId);
            const clickable = isClickTarget && Boolean(targetId);
            return (
              <button
                key={`${stage.id}-${lineNumber}`}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onTargetClick(targetId)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "42px 1fr",
                  width: "100%",
                  border: "none",
                  borderLeft: isSelected ? `3px solid ${accent}` : "3px solid transparent",
                  background: isSelected ? `${accent}1c` : "transparent",
                  color: DS.t1,
                  cursor: clickable ? "crosshair" : "default",
                  font: "inherit",
                  lineHeight: "inherit",
                  textAlign: "left",
                  padding: "0 14px 0 0",
                }}
                aria-label={clickable ? `Flag line ${lineNumber}` : undefined}
              >
                <span style={{ color: DS.dim, userSelect: "none", textAlign: "right", paddingRight: 12 }}>{lineNumber}</span>
                <code>{displayLine || " "}</code>
              </button>
            );
          })}
        </pre>
      )}

      {isClickTarget && !selectedTarget && (
        <div style={{ color: DS.t3, fontSize: 13, fontFamily: "var(--ds-mono), monospace" }}>
          Click the exact faulty line before the interviewer reveals the next decision point.
        </div>
      )}

      {selectedTarget && stage.validationCopy?.[selectedTarget] && (
        <div style={{
          padding: "12px 14px",
          borderRadius: DS.radiusSm,
          border: `1px solid ${accent}33`,
          background: `${accent}0d`,
          color: DS.t2,
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          {stage.validationCopy[selectedTarget]}
        </div>
      )}

      {isScenarioChoice && choices.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => onChoiceSelect(choice.id)}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: DS.radiusSm,
                  border: `1px solid ${isSelected ? `${accent}66` : DS.border}`,
                  background: isSelected ? `${accent}12` : "rgba(255,255,255,0.02)",
                  color: DS.t2,
                  fontSize: 14,
                  lineHeight: 1.5,
                  cursor: "pointer",
                  fontFamily: "var(--ds-sans), sans-serif",
                }}
              >
                <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.dim, marginRight: 8 }}>{choice.id.toUpperCase()}.</span>
                <strong style={{ color: DS.t1 }}>{choice.label}</strong>
                {choice.description && <span style={{ display: "block", marginTop: 4, color: DS.t3 }}>{choice.description}</span>}
              </button>
            );
          })}
        </div>
      )}

      {stage.rationale && (
        <div style={{
          padding: "13px 15px",
          borderRadius: DS.radiusSm,
          border: `1px solid ${stage.terminal ? `${DS.grn}44` : DS.border}`,
          background: stage.terminal ? `${DS.grn}0d` : "rgba(255,255,255,0.03)",
          color: DS.t2,
          fontSize: 13,
          lineHeight: 1.7,
        }}>
          <strong style={{ color: stage.terminal ? DS.grn : DS.t1 }}>Interviewer rationale: </strong>
          {stage.rationale}
        </div>
      )}

      {stage.terminal && (
        <DecisionArtifactCard
          graph={graph}
          branchPath={branchPath}
          clickedTargets={clickedTargets}
          graphChoices={graphChoices}
          lessonTitle={lessonTitle}
          accent={accent}
        />
      )}
    </div>
  );
}

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
  onOpenPractice,
  intent,
  onAskTutorWithPrompt,
}) {
  const [answers, setAnswers] = useState(() => ({}));
  const [revealed, setRevealed] = useState({});
  const [freeResponse, setFreeResponse] = useState("");
  const [confidenceBefore, setConfidenceBefore] = useState(null);
  const [confidenceAfter, setConfidenceAfter] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(null);
  const [branchPath, setBranchPath] = useState([]);
  const [clickedTargets, setClickedTargets] = useState({});
  const [graphChoices, setGraphChoices] = useState({});

  const interviewGraph = moduleSpec?.interviewGraph || null;
  const graphInitialStageId = interviewGraph?.initialStageId || null;

  useEffect(() => {
    setCurrentStageId(graphInitialStageId);
    setBranchPath(graphInitialStageId ? [graphInitialStageId] : []);
    setClickedTargets({});
    setGraphChoices({});
  }, [lesson?.id, graphInitialStageId]);

  const activeGraphStage = currentStageId ? interviewGraph?.stages?.[currentStageId] : null;
  const selectedTarget = currentStageId ? clickedTargets[currentStageId] : null;
  const selectedGraphChoice = currentStageId ? graphChoices[currentStageId] : null;
  const passedInterviewGraph = !interviewGraph || Boolean(activeGraphStage?.terminal);

  const advanceInterviewGraph = (inputId) => {
    if (!activeGraphStage) return;
    const nextStageId = activeGraphStage.branches?.[inputId] || activeGraphStage.branches?.default;
    if (!nextStageId || !interviewGraph?.stages?.[nextStageId]) return;
    setCurrentStageId(nextStageId);
    setBranchPath((path) => [...path, nextStageId]);
  };

  const handleTargetClick = (targetId) => {
    if (!activeGraphStage) return;
    setClickedTargets((state) => ({ ...state, [activeGraphStage.id]: targetId }));
    advanceInterviewGraph(targetId);
  };

  const handleGraphChoiceSelect = (choiceId) => {
    if (!activeGraphStage) return;
    setGraphChoices((state) => ({ ...state, [activeGraphStage.id]: choiceId }));
    advanceInterviewGraph(choiceId);
  };

  // Guard against null / undefined moduleSpec (e.g. during loading or bad data)
  if (!moduleSpec) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 clamp(16px, 4vw, 28px)" }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: DS.t3, fontSize: 12, cursor: "pointer", padding: "20px 0 8px", fontFamily: "var(--ds-mono), monospace", fontWeight: 600 }}>
          {backLabel}
        </button>
        <p style={{ color: DS.t3, fontSize: 14, marginTop: 40, textAlign: "center" }}>
          Module content is loading — please try again in a moment.
        </p>
      </div>
    );
  }

  const checks = moduleSpec.knowledgeCheck || [];
  let correctCount = 0;
  checks.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correctCount += 1;
  });

  const score = checks.length ? correctCount / checks.length : 1;
  const minCorrect = checks.length ? Math.max(1, Math.round(0.7 * checks.length)) : 0;
  const passedCheck = checks.length === 0 || correctCount >= minCorrect;

  // Free-response gating: user must write ≥ 20 chars before marking complete
  const hasFreeResponse = freeResponse.trim().length >= 20;
  // Complete requires both free-response (if enabled) and knowledge-check pass
  const freeResponseRequired = moduleSpec.freeResponseRequired !== false;
  const canMarkComplete = passedCheck && passedInterviewGraph && (!freeResponseRequired || hasFreeResponse);

  // Derive attempt state for postFail panel: user has submitted at least one wrong answer
  const hasWrongAnswer = Object.entries(answers).some(([i, a]) => a !== checks[Number(i)]?.correctIndex);

  // "Submitted / seen the answer" = learner has revealed at least one explanation.
  const hasSeenAnswer = Object.values(revealed).some(Boolean);

  // Diagnostic only — fire-and-forget, never block UX on analytics.
  const fireConfidence = (stage, confidence) => {
    try {
      trackConfidence({
        eventName: LVS_EVENT_NAMES.confidenceRated,
        page: "lesson_module",
        metadata: buildConfidenceMetadata({
          courseId: course?.id,
          lessonId: lesson?.id,
          stage,
          confidence,
          correct: passedCheck,
        }),
      });
    } catch {
      // Analytics must never break the lesson experience.
    }
  };

  const calibration =
    confidenceBefore != null && confidenceAfter != null
      ? computeConfidenceDelta({ before: confidenceBefore, after: confidenceAfter })
      : null;

  const handleConfidenceBefore = (v) => {
    setConfidenceBefore(v);
    fireConfidence("before_check", v);
  };

  const handleConfidenceAfter = (v) => {
    setConfidenceAfter(v);
    fireConfidence("after_answer", v);
    if (confidenceBefore != null) {
      try {
        const result = computeConfidenceDelta({ before: confidenceBefore, after: v });
        trackConfidence({
          eventName: LVS_EVENT_NAMES.confidenceDelta,
          page: "lesson_module",
          metadata: {
            ...buildConfidenceMetadata({
              courseId: course?.id,
              lessonId: lesson?.id,
              stage: "delta",
              correct: passedCheck,
            }),
            confidence_before: result.before,
            confidence_after: result.after,
            delta: result.delta,
            calibration: result.calibration,
          },
        });
      } catch {
        // Analytics must never break the lesson experience.
      }
    }
  };

  const relatedPractice = Array.isArray(moduleSpec.relatedPractice) ? moduleSpec.relatedPractice : [];

  // Adaptive drill: the specific checks the learner answered incorrectly.
  const wrongChecks = checks
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => answers[i] !== undefined && answers[i] !== q.correctIndex)
    .map(({ q, i }) => ({
      question: q.question,
      chosen: q.options[answers[i]],
      correct: q.options[q.correctIndex],
    }));

  const generateDrill = () => {
    try {
      recordCheckErrors({ courseId: course?.id, lessonId: lesson?.id, lessonTitle: lesson?.title, wrongChecks });
    } catch {
      // Recording errors must never block the drill.
    }
    const prompt = buildDrillPrompt({ lessonTitle: lesson?.title, wrongChecks, relatedPractice });
    if (onAskTutorWithPrompt) onAskTutorWithPrompt(prompt);
    else if (onAskTutor) onAskTutor();
  };

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
              <li key={o} style={{ marginBottom: 6 }}>{renderInlineMarkdown(o)}</li>
            ))}
          </ul>
        )}
      </div>

      <IntentLessonIntro intent={intent} lessonTitle={lesson.title} onCta={onAskTutor} />

      {moduleSpec.tutorPrompts?.preTry && (
        <div style={{
          marginBottom: 16,
          padding: "14px 18px",
          borderRadius: DS.radiusSm,
          background: `${course.color}0d`,
          border: `1px solid ${course.color}28`,
          fontSize: 13,
          color: DS.t2,
          lineHeight: 1.65,
        }}>
          <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, fontWeight: 700, color: course.accent, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Tutor tip · before you try</span>
          {moduleSpec.tutorPrompts.preTry}
        </div>
      )}

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

      <SectionCard
        title={interviewGraph ? "4 · Interview simulation" : "4 · Knowledge check"}
        badge={interviewGraph ? `${branchPath.length} step${branchPath.length === 1 ? "" : "s"}` : `${checks.length} Q`}
        accent={course.accent}
        borderAccent={`${course.color}22`}
      >
        {interviewGraph ? (
          <InterviewGraphStage
            graph={interviewGraph}
            stage={activeGraphStage}
            branchPath={branchPath}
            clickedTargets={clickedTargets}
            graphChoices={graphChoices}
            selectedTarget={selectedTarget}
            selectedChoice={selectedGraphChoice}
            onTargetClick={handleTargetClick}
            onChoiceSelect={handleGraphChoiceSelect}
            accent={course.accent}
            lessonTitle={lesson.title}
          />
        ) : checks.length === 0 ? (
          <p style={{ color: DS.t3, fontSize: 14, margin: 0 }}>No checks for this module yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!hasSeenAnswer && (
              <div style={{
                padding: "12px 14px",
                borderRadius: DS.radiusSm,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.02)",
              }}>
                <ConfidenceMeter
                  label="How confident are you before checking?"
                  value={confidenceBefore ?? undefined}
                  onChange={handleConfidenceBefore}
                />
              </div>
            )}
            {checks.map((q, qi) => (
              <div key={qi} style={{ borderBottom: qi < checks.length - 1 ? `1px solid ${DS.border}` : "none", paddingBottom: qi < checks.length - 1 ? 20 : 0 }}>
                {q.stage && (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginBottom: 8,
                    padding: "4px 9px",
                    borderRadius: 999,
                    border: `1px solid ${course.color}33`,
                    background: `${course.color}10`,
                    color: course.accent,
                    fontSize: 10,
                    fontFamily: "var(--ds-mono), monospace",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    {q.stage}
                  </div>
                )}
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
            {hasSeenAnswer && (
              <div style={{
                padding: "12px 14px",
                borderRadius: DS.radiusSm,
                border: `1px solid ${DS.border}`,
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                <ConfidenceMeter
                  label="How confident now, after seeing the answer?"
                  value={confidenceAfter ?? undefined}
                  onChange={handleConfidenceAfter}
                />
                {calibration && (
                  <div style={{
                    fontSize: 12,
                    color: DS.t3,
                    fontFamily: "var(--ds-mono), monospace",
                  }}>
                    Confidence delta: {calibration.delta > 0 ? `+${calibration.delta}` : calibration.delta}
                    {" · "}
                    <span style={{
                      color: calibration.calibration === "calibrated" ? DS.grn
                        : calibration.calibration === "overconfident" ? "#FB923C"
                        : "#FCD34D",
                    }}>
                      {calibration.calibration}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {hasWrongAnswer && moduleSpec.tutorPrompts?.postFail && (
        <div style={{
          marginBottom: 16,
          padding: "14px 18px",
          borderRadius: DS.radiusSm,
          background: "rgba(248,113,113,0.07)",
          border: "1px solid rgba(248,113,113,0.22)",
          fontSize: 13,
          color: DS.t2,
          lineHeight: 1.65,
        }}>
          <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, fontWeight: 700, color: "#F87171", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Tutor tip · after a wrong answer</span>
          {moduleSpec.tutorPrompts.postFail}
        </div>
      )}

      {hasWrongAnswer && (
        <div style={{
          marginBottom: 16,
          padding: "14px 18px",
          borderRadius: DS.radiusSm,
          background: "rgba(129,140,248,0.07)",
          border: `1px solid ${DS.ind}33`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div style={{ fontSize: 13, color: DS.t2, lineHeight: 1.55, flex: "1 1 240px" }}>
            <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, fontWeight: 700, color: DS.ind, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Adaptive drill</span>
            Turn the {wrongChecks.length} check{wrongChecks.length === 1 ? "" : "s"} you missed into a targeted tutor drill.
          </div>
          <button
            type="button"
            onClick={generateDrill}
            style={{
              background: `${DS.ind}1e`,
              border: `1px solid ${DS.ind}55`,
              borderRadius: DS.radiusSm,
              padding: "10px 18px",
              color: DS.t1,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--ds-sans), sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            Generate my drill →
          </button>
        </div>
      )}

      {moduleSpec.tutorPrompts?.weeklyRecap && (
        <div style={{
          marginBottom: 16,
          padding: "14px 18px",
          borderRadius: DS.radiusSm,
          background: `${DS.grn}0d`,
          border: `1px solid ${DS.grn}28`,
          fontSize: 13,
          color: DS.t2,
          lineHeight: 1.65,
        }}>
          <span style={{ fontFamily: "var(--ds-mono), monospace", fontSize: 10, fontWeight: 700, color: DS.grn, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Weekly recap</span>
          {moduleSpec.tutorPrompts.weeklyRecap}
        </div>
      )}

      {freeResponseRequired && (
        <SectionCard title="5 · Reflect" badge="Required" accent={course.accent} borderAccent={`${course.color}22`}>
          <p style={{ margin: "0 0 10px", color: DS.t3, fontSize: 13, lineHeight: 1.6 }}>
            Before marking complete, write a brief reflection (≥ 20 characters). How would you explain this concept to a teammate?
          </p>
          <textarea
            value={freeResponse}
            onChange={(e) => setFreeResponse(e.target.value)}
            placeholder="Type your reflection here…"
            style={{
              width: "100%",
              minHeight: 90,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${hasFreeResponse ? `${DS.grn}55` : DS.border}`,
              borderRadius: DS.radiusSm,
              padding: 12,
              color: DS.t1,
              fontSize: 14,
              resize: "vertical",
              fontFamily: "var(--ds-sans), sans-serif",
              lineHeight: 1.65,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 11, color: hasFreeResponse ? DS.grn : DS.dim, fontFamily: "var(--ds-mono), monospace", marginTop: 6 }}>
            {freeResponse.trim().length} / 20 characters
          </div>
        </SectionCard>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 48, marginTop: 8, flexWrap: "wrap" }}>
        <AsyncActionButton
          onClick={async () => { onMarkComplete(); }}
          disabled={!canMarkComplete}
          style={{ flex: 1, minWidth: 220 }}
          pendingLabel="Saving…"
          successLabel="Done ✓"
        >
          Mark complete & continue →
        </AsyncActionButton>
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

      {relatedPractice.length > 0 && (
        <div style={{
          ...dsGlassCard({ padding: "20px 22px", marginBottom: 48 }),
          border: `1px solid ${DS.grn}28`,
        }}>
          <div style={{ ...sectionLabel, color: DS.grn }}>
            You learned this — now validate it
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {relatedPractice.map((item, i) => {
              const title = item?.title || item?.label || "Practice exercise";
              const detail = item?.prompt || null;
              return (
                <button
                  key={item?.id || i}
                  type="button"
                  onClick={() => { if (onOpenPractice) onOpenPractice(item); }}
                  style={{
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: DS.radiusSm,
                    border: `1px solid ${DS.border}`,
                    background: "rgba(255,255,255,0.02)",
                    color: DS.t2,
                    fontSize: 14,
                    cursor: onOpenPractice ? "pointer" : "default",
                    fontFamily: "var(--ds-sans), sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontFamily: "var(--ds-mono), monospace", color: DS.grn, marginRight: 8, fontSize: 12 }}>→</span>
                  <strong style={{ color: DS.t1 }}>{title}</strong>
                  {detail && (
                    <span style={{ display: "block", color: DS.t3, fontSize: 13, marginTop: 4 }}>{detail}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
