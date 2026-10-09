import type { StudioDraft } from "./model";
import { PROMPTS } from "./prompts";
import { STUDIO_LESSONS } from "./lessons";
import { PROJECT_STAGES } from "./journey";
import { HELP_TOPICS } from "./focusedHelp";

export function exportFilename(title: string): string {
  const slug = title.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `${slug || "studio-project"}-notes.txt`;
}

export function buildProjectNotes(draft: StudioDraft): string {
  const field = (label: string, value: string) => `${label}\n${value.trim() || "Not recorded yet."}\n`;
  const conceptName = (id: string) => draft.concepts.find(item => item.id === id)?.title || "Untitled concept";
  return [
    draft.title.trim() || "Studio project notes",
    "Student-authored notes and responses to guided exercises. AI starting points and assignment reviews, if present, are labeled separately.\n",
    field("ASSIGNMENT BRIEF", draft.brief), field("INTERESTS", draft.interests),
    field("INTENDED EXPERIENCE", draft.experience), field("SITE OBSERVATIONS", draft.site),
    field("PEOPLE AND ACTIVITIES", draft.users), field("REQUIREMENTS FROM THE BRIEF", draft.requirements),
    field("QUESTIONS FOR THE INSTRUCTOR", draft.openQuestions),
    "FOCUSED DESIGN HELP (student notes)\n",
    field("Concept to preserve", draft.focusedHelp.concept),
    field("Selected concept", draft.focusedHelp.conceptId || draft.directionId ? conceptName(draft.focusedHelp.conceptId || draft.directionId) : "Not selected"),
    ...HELP_TOPICS.filter(topic => draft.focusedHelp.notes[topic.id]?.issue || draft.focusedHelp.notes[topic.id]?.details).map(topic => `${topic.title}\n${field("Issue", draft.focusedHelp.notes[topic.id].issue)}${field("Details / source excerpt (unverified)", draft.focusedHelp.notes[topic.id].details)}`),
    "PROJECT JOURNEY (student-tracked)\n",
    field("Current stage", draft.journey.stage),
    ...PROJECT_STAGES.map(stage => `[${draft.journey.completed.includes(stage.id) ? "x" : " "}] ${stage.title}\n${draft.journey.notes[stage.id] || "No notes yet."}\n`),
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
    "AI INSPIRATION AND DRAWING PROCESS RECORD (successful generations; images downloaded separately)\n",
    ...draft.explorations.map(run => JSON.stringify(run, null, 2)),
    ...PROMPTS.filter(prompt => draft.promptNotes[prompt.id]?.trim()).map(prompt =>
      `${prompt.theme}: ${prompt.title}\nPrompt: ${prompt.question}\nExercise: ${prompt.exercise}\n${field("Response", draft.promptNotes[prompt.id])}`),
    "ARCHITECTURE LEARNING REFLECTIONS (student-authored; optional exercises)\n",
    ...STUDIO_LESSONS.filter(lesson => draft.lessonNotes[lesson.id]?.reflection.trim() || draft.lessonNotes[lesson.id]?.completed || draft.lessonNotes[lesson.id]?.research?.trim()).map(lesson =>
      `${lesson.title}\nExercise: ${lesson.steps.join(" ")}\nSelf-marked complete: ${draft.lessonNotes[lesson.id].completed ? "Yes" : "No"}\n${field("Reflection", draft.lessonNotes[lesson.id].reflection)}\n${field("Working notes and source evidence (student notes, not verified)", draft.lessonNotes[lesson.id].research || "")}`),
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
    "ASSIGNMENT REQUIREMENTS CHECKLIST\n",
    ...draft.requirementItems.map(item => `[${item.done ? "x" : " "}] ${item.label || "Untitled requirement"}\n${item.sourceBrief !== draft.brief ? "Brief changed: recheck this item.\n" : ""}Source quote: ${item.quote || "Student-entered"}\nConcept: ${item.conceptId ? conceptName(item.conceptId) : "Not linked"}\nEvidence / deliverable: ${item.evidence || "Not recorded"}\n`),
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
