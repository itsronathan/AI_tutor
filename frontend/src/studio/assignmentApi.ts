import { apiUrl } from "../apiBase";
import { parseAnalysis, parseReply, type AssignmentReviewState } from "./assignmentReview";

async function request(path: string, body: unknown, signal: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(apiUrl(`/api/studio/${path}`), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Could not reach the assignment tutor. Check that the backend is running and try again.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Assignment analysis is not available on this backend yet. Run the updated backend and try again.");
    throw new Error(typeof payload?.detail === "string" ? payload.detail : "The assignment tutor could not complete the request. Please try again.");
  }
  return payload;
}

export async function analyzeBrief(brief: string, signal: AbortSignal) {
  const analysis = parseAnalysis(await request("analyze", { brief }, signal));
  if (!analysis || analysis.source_brief !== brief) throw new Error("The analysis did not match this assignment. Please try again.");
  return analysis;
}

export async function askAboutBrief(brief: string, review: AssignmentReviewState, question: string, signal: AbortSignal) {
  const reply = parseReply(await request("follow-up", {
    brief, analysis: review.analysis, reviewed: review.reviewed, review_notes: review.reviewNotes,
    clarifications: review.analysis.questions.flatMap((item, index) => {
      const answer = review.answers[index]?.trim();
      return answer ? [{ question: item.question, answer }] : [];
    }),
    history: review.turns.slice(-6), question,
  }, signal), brief);
  if (!reply) throw new Error("The tutor returned an invalid answer. Please try again.");
  return reply;
}
