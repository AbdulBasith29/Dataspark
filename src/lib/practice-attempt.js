import { isValidEvaluation, EVALUATION_UNAVAILABLE } from "./evaluation-contract.js";

export async function requestAssessment(question, answer, { signal, endpoint = "/api/ai/evaluate", transport = fetch } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 30000);
  try {
    const response = await transport(endpoint, {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionPrompt: question.title + "\n\n" + question.prompt,
        userAnswer: answer, rubric: question.rubric,
      }),
    });
    const result = await response.json();
    if (!response.ok || !isValidEvaluation(result)) throw new Error(EVALUATION_UNAVAILABLE.message);
    return result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

// Existing storage is a best score per question, not an attempt-history table.
export async function savePracticeScore(client, userId, questionId, score) {
  if (!userId || !Number.isFinite(score)) throw new Error("Sign in to save this assessment.");
  const { data, error } = await client.from("question_progress")
    .select("score").eq("user_id", userId).eq("question_id", questionId).maybeSingle();
  if (error) throw new Error("Could not read saved progress. Please retry.");
  const best = Math.max(Math.round(score), data?.score ?? 0);
  const { error: writeError } = await client.from("question_progress").upsert({
    user_id: userId, question_id: questionId, score: best, completed_at: new Date().toISOString(),
  }, { onConflict: "user_id,question_id" });
  if (writeError) throw new Error("Assessment was not saved. Your answer is still here. Please retry.");
  return best;
}

export function coachingPrompt(question, answer, assessment) {
  return [
    "Help me reason through this SQL practice feedback. Ask one focused question before offering a solution.",
    "Task: " + question.title, question.prompt,
    "Submitted SQL:", answer,
    "Rubric feedback:", assessment.feedback,
    ...assessment.rubricScores.map(row => row.criterion + ": " + (row.met ? "met" : "not met")),
  ].join("\n\n");
}
