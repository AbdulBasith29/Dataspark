/**
 * Shared contract for the AI tutor's answer evaluation.
 *
 * Both providers are constrained to this schema at the API level — Claude via a
 * forced tool call, Gemini via responseSchema JSON mode — so the handler never
 * has to coax JSON out of prose. `normalizeEvaluation` is still the gate every
 * response passes through: schema enforcement guarantees shape, not sanity.
 *
 * Filename is underscore-prefixed so Vercel treats it as a helper, not a route.
 */

export const EVALUATION_TOOL_NAME = "submit_evaluation";

export const VERDICTS = ["correct", "partial", "incorrect"];

const CONFIDENCES = ["low", "medium", "high"];

const MAX_GAPS = 6;
const MAX_EXPLANATION_CHARS = 2000;
const MAX_HINT_CHARS = 400;

const FIELD_DESCRIPTIONS = {
  score:
    "0-100. Rubric coverage and reasoning quality combined. Be strict: a fluent answer that misses the core idea scores below 50.",
  verdict:
    "'correct' when every rubric point is genuinely met, 'partial' when the core idea is there but incomplete, 'incorrect' when the central reasoning is wrong or missing.",
  gaps:
    "Concepts the answer is missing or got wrong, each a short noun phrase (e.g. 'selection bias in the control group'). Empty array when nothing is missing.",
  follow_up_hint:
    "One Socratic nudge toward the biggest gap — a question or pointer, never the answer itself. Empty string when the answer needs no follow-up.",
  explanation:
    "2-4 sentences addressed to the learner explaining the score. Reference what they actually wrote.",
  rubricScores: "One entry per rubric criterion, in the order given.",
};

/** JSON Schema for Claude's forced tool call. */
export const EVALUATION_INPUT_SCHEMA = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: FIELD_DESCRIPTIONS.score,
    },
    verdict: {
      type: "string",
      enum: VERDICTS,
      description: FIELD_DESCRIPTIONS.verdict,
    },
    gaps: {
      type: "array",
      items: { type: "string" },
      description: FIELD_DESCRIPTIONS.gaps,
    },
    follow_up_hint: {
      type: "string",
      description: FIELD_DESCRIPTIONS.follow_up_hint,
    },
    explanation: {
      type: "string",
      description: FIELD_DESCRIPTIONS.explanation,
    },
    rubricScores: {
      type: "array",
      description: FIELD_DESCRIPTIONS.rubricScores,
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          met: { type: "boolean" },
          confidence: { type: "string", enum: CONFIDENCES },
        },
        required: ["criterion", "met", "confidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["score", "verdict", "gaps", "follow_up_hint", "explanation", "rubricScores"],
  additionalProperties: false,
};

/**
 * Gemini's responseSchema accepts only the OpenAPI subset — no
 * additionalProperties, no minimum/maximum — so it is spelled out separately
 * rather than derived, to keep what we send to each provider obvious.
 */
export const EVALUATION_GEMINI_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer", description: FIELD_DESCRIPTIONS.score },
    verdict: {
      type: "string",
      enum: VERDICTS,
      description: FIELD_DESCRIPTIONS.verdict,
    },
    gaps: {
      type: "array",
      items: { type: "string" },
      description: FIELD_DESCRIPTIONS.gaps,
    },
    follow_up_hint: {
      type: "string",
      description: FIELD_DESCRIPTIONS.follow_up_hint,
    },
    explanation: { type: "string", description: FIELD_DESCRIPTIONS.explanation },
    rubricScores: {
      type: "array",
      description: FIELD_DESCRIPTIONS.rubricScores,
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          met: { type: "boolean" },
          confidence: { type: "string", enum: CONFIDENCES },
        },
        required: ["criterion", "met", "confidence"],
      },
    },
  },
  required: ["score", "verdict", "gaps", "follow_up_hint", "explanation", "rubricScores"],
};

export const EVALUATION_SYSTEM_PROMPT = [
  "You are a strict data-science interview evaluator.",
  "Grade the learner's answer against the rubric and report it with the submit_evaluation schema.",
  "Judge substance, not length or confidence of tone: a short answer that nails the reasoning outscores a long one that circles it.",
  "The learner reads your explanation directly, so write to them in second person.",
].join(" ");

export function buildEvaluationPrompt(questionPrompt, userAnswer, rubric) {
  const rubricText = rubric.map((r, i) => `${i + 1}. ${r}`).join("\n");
  return [
    "Evaluate this answer against the rubric.",
    "",
    "QUESTION:",
    questionPrompt,
    "",
    "RUBRIC:",
    rubricText,
    "",
    "ANSWER:",
    userAnswer,
  ].join("\n");
}

/** Matches the banding used elsewhere in the platform for the score caption. */
function bandLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Review Required";
}

function clampScore(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function normalizeVerdict(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return VERDICTS.includes(v) ? v : null;
}

function normalizeText(value, maxChars) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > maxChars ? `${trimmed.slice(0, maxChars).trimEnd()}…` : trimmed;
}

function normalizeGaps(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((gap) => normalizeText(gap, 200))
    .filter(Boolean)
    .slice(0, MAX_GAPS);
}

function normalizeRubricScores(value, rubric) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => entry && typeof entry === "object")
    .map((entry, i) => {
      const criterion = normalizeText(entry.criterion, 300) || rubric[i] || "";
      const confidence = CONFIDENCES.includes(entry.confidence) ? entry.confidence : "low";
      return criterion ? { criterion, met: entry.met === true, confidence } : null;
    })
    .filter(Boolean);
}

/**
 * Validates and coerces a provider payload into the response contract.
 * Returns null when the payload is unusable, which is the caller's cue to retry.
 */
export function normalizeEvaluation(raw, rubric = []) {
  if (!raw || typeof raw !== "object") return null;

  const score = clampScore(raw.score);
  const verdict = normalizeVerdict(raw.verdict);
  const explanation = normalizeText(raw.explanation, MAX_EXPLANATION_CHARS);

  // These three carry the result; without them there is nothing to show.
  if (score === null || !verdict || !explanation) return null;

  const hint = normalizeText(raw.follow_up_hint, MAX_HINT_CHARS);

  return {
    score,
    verdict,
    gaps: normalizeGaps(raw.gaps),
    follow_up_hint: hint || null,
    explanation,
    rubricScores: normalizeRubricScores(raw.rubricScores, rubric),
    totalScore: bandLabel(score),
    feedback: explanation,
    degraded: false,
  };
}

/**
 * Last resort after an enforced call and one retry both failed to produce a
 * usable payload. Any prose the model did return is surfaced rather than
 * discarded — unscored feedback still beats a blank card.
 */
export function degradedEvaluation(rawText = "") {
  const explanation =
    normalizeText(rawText, MAX_EXPLANATION_CHARS) ||
    "The AI evaluator could not score this answer. Compare your response against the rubric and the model answer.";

  return {
    score: null,
    verdict: null,
    gaps: [],
    follow_up_hint: null,
    explanation,
    rubricScores: [],
    totalScore: null,
    feedback: explanation,
    degraded: true,
  };
}

/** No provider key configured — a deployment problem, not a grading result. */
export function unavailableEvaluation() {
  return degradedEvaluation(
    "AI evaluation is temporarily unavailable. Review the rubric and compare against the model answer."
  );
}
