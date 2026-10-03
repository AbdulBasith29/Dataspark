// A service failure is never a grade. Shared by hosted and local evaluators.
export const EVALUATION_UNAVAILABLE = {
  error: "evaluation_unavailable",
  message: "AI feedback is unavailable. Your answer is still editable. Please try again.",
};

export function isValidEvaluation(value) {
  return Number.isFinite(value?.score) && value.score >= 0 && value.score <= 100
    && typeof value.totalScore === "string"
    && typeof value.feedback === "string" && value.feedback.trim().length > 0
    && Array.isArray(value.rubricScores) && value.rubricScores.length > 0
    && value.rubricScores.every(item =>
      typeof item?.criterion === "string" && item.criterion.trim().length > 0
      && typeof item.met === "boolean"
      && ["low", "medium", "high"].includes(item.confidence));
}
