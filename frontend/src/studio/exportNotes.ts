import type { StudioDraft } from "./model";
import { PROMPTS } from "./prompts";
import { STUDIO_LESSONS } from "./lessons";

export function exportFilename(title: string): string {
  const slug = title.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `${slug || "studio-project"}-notes.txt`;
}

export function buildProjectNotes(draft: StudioDraft): string {
  const field = (label: string, value: string) => `${label}\n${value.trim() || "Not recorded yet."}\n`;
  const conceptName = (id: string) => draft.concepts.find(item => item.id === id)?.title || "Untitled concept";
  return [
    draft.title.trim() || "Studio project notes",
    "Student-authored notes and responses to guided exercises. AI assignment reviews, if present, are labeled separately.\n",
    field("ASSIGNMENT BRIEF", draft.brief), field("INTERESTS", draft.interests),
    field("INTENDED EXPERIENCE", draft.experience), field("SITE OBSERVATIONS", draft.site),
    field("PEOPLE AND ACTIVITIES", draft.users), field("REQUIREMENTS FROM THE BRIEF", draft.requirements),
    field("QUESTIONS FOR THE INSTRUCTOR", draft.openQuestions),
    ...(draft.assignmentReview ? [
      "AI ASSIGNMENT REVIEW\n",
      field("Review status", draft.assignmentReview.reviewed ? "Reviewed by the student" : "Not yet reviewed by the student"),
      field("AI summary", draft.assignmentReview.analysis.summary),
      ...draft.assignmentReview.analysis.requirements.map(item => `[${item.category}] ${item.requirement}\nSource quote: ${item.quote}\n`),
      field("Student corrections / additional context", draft.assignmentReview.reviewNotes),
      ...draft.assignmentReview.analysis.questions.map((item, index) =>
        `Clarification (${item.ask}): ${item.question}\nWhy: ${item.reason}\nAnswer: ${draft.assignmentReview!.answers[index]?.trim() || "Still open"}\n`),
      "ASSIGNMENT TUTOR CONVERSATION\n",
      ...draft.assignmentReview.turns.map(turn => [
        field("Student question", turn.question), field("AI response", turn.reply.answer),
        field("Supporting quotes from the brief", turn.reply.supporting_quotes.join("\n")),
        field("Still to clarify", turn.reply.remaining_questions.join("\n")),
      ].join("\n")),
    ] : []),
    "BRAINSTORMING RESPONSES\n",
    ...PROMPTS.filter(prompt => draft.promptNotes[prompt.id]?.trim()).map(prompt =>
      `${prompt.theme}: ${prompt.title}\nPrompt: ${prompt.question}\nExercise: ${prompt.exercise}\n${field("Response", draft.promptNotes[prompt.id])}`),
    "ARCHITECTURE LEARNING REFLECTIONS (student-authored; optional exercises)\n",
    ...STUDIO_LESSONS.filter(lesson => draft.lessonNotes[lesson.id]?.reflection.trim() || draft.lessonNotes[lesson.id]?.completed).map(lesson =>
      `${lesson.title}\nExercise: ${lesson.steps.join(" ")}\nSelf-marked complete: ${draft.lessonNotes[lesson.id].completed ? "Yes" : "No"}\n${field("Reflection", draft.lessonNotes[lesson.id].reflection)}`),
    "CONCEPTS\n",
    ...draft.concepts.map((concept, index) => [
      `${index + 1}. ${concept.title || "Untitled concept"}`,
      field("Core idea / brief connection", concept.premise), field("Spatial moves", concept.moves), field("Next experiment", concept.experiment),
    ].join("\n")),
    field("CONCEPTS COMPARED", draft.comparisonIds.map(conceptName).join("\n")),
    field("CURRENT DIRECTION", draft.directionId ? conceptName(draft.directionId) : "Choice is still open."),
    field("DECISION NOTES", draft.decisionNotes),
    "REFERENCES\n",
    ...draft.precedents.map((item, index) => [
      `${index + 1}. ${item.title || "Untitled reference"}`, field("Source / citation", item.source),
      field("Observation", item.observation), field("Possible application", item.application),
    ].join("\n")),
    "MILESTONES\n",
    ...draft.milestones.map(item => `[${item.done ? "x" : " "}] ${item.title || "Untitled milestone"} — ${item.due || "No date set"}`),
    "\nCRITIQUE LOG\n",
    ...draft.critiques.map((item, index) => [
      `${index + 1}. ${item.date || "Undated"} — ${item.reviewer || "Reviewer not recorded"}`,
      field("Feedback received", item.feedback), field("Interpretation / questions", item.response),
      field(`Follow-up (${item.done ? "complete" : "open"})`, item.nextAction),
    ].join("\n")),
    field("PRESENTATION STORY", draft.presentationStory), field("QUESTIONS FOR REVIEW", draft.reviewQuestions),
    "PRESENTATION CHECKLIST\n",
    ...draft.presentationItems.map(item => `[${item.done ? "x" : " "}] ${item.label || "Untitled presentation item"}`),
  ].join("\n");
}
