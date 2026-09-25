import type { StudioDraft } from "./model";
import { PROMPTS } from "./prompts";

export function exportFilename(title: string): string {
  const slug = title.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `${slug || "studio-project"}-notes.txt`;
}

export function buildProjectNotes(draft: StudioDraft): string {
  const field = (label: string, value: string) => `${label}\n${value.trim() || "Not recorded yet."}\n`;
  const conceptName = (id: string) => draft.concepts.find(item => item.id === id)?.title || "Untitled concept";
  return [
    draft.title.trim() || "Studio project notes",
    "Student-authored notes and responses to guided exercises. Not an AI design assessment.\n",
    field("ASSIGNMENT BRIEF", draft.brief), field("INTERESTS", draft.interests),
    field("INTENDED EXPERIENCE", draft.experience), field("SITE OBSERVATIONS", draft.site),
    field("PEOPLE AND ACTIVITIES", draft.users), field("REQUIREMENTS FROM THE BRIEF", draft.requirements),
    field("QUESTIONS FOR THE INSTRUCTOR", draft.openQuestions),
    "BRAINSTORMING RESPONSES\n",
    ...PROMPTS.filter(prompt => draft.promptNotes[prompt.id]?.trim()).map(prompt =>
      `${prompt.theme}: ${prompt.title}\nPrompt: ${prompt.question}\nExercise: ${prompt.exercise}\n${field("Response", draft.promptNotes[prompt.id])}`),
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
  ].join("\n");
}
