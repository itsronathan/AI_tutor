import type { StudioDraft } from "./model";

export const PROJECT_STAGES = [
  { id: "brief", title: "Understand", task: "Read your brief. Record deliverables and unknowns.", tool: "Brief & exercises", question: "Help me break down this brief and choose my first task." },
  { id: "research", title: "Research", task: "Observe the site, people, and useful references.", tool: "References", question: "What should I investigate before choosing a design direction?" },
  { id: "explore", title: "Explore", task: "Sketch alternatives. Compare their trade-offs.", tool: "Concepts", question: "Help me compare my ideas and choose a sketch or model experiment." },
  { id: "develop", title: "Develop", task: "Test your chosen idea against the brief.", tool: "Plan", question: "What should I develop next, and which requirements need evidence?" },
  { id: "refine", title: "Refine", task: "Use critique feedback to plan your next revision.", tool: "Review & export", question: "Help me prioritize my critique feedback and plan a revision." },
  { id: "present", title: "Present", task: "Check deliverables and explain your design decisions.", tool: "Review & export", question: "Help me prepare my final presentation and identify unfinished work." },
] as const;
export type ProjectStage = typeof PROJECT_STAGES[number]["id"];
export type Journey = { stage: ProjectStage; completed: ProjectStage[]; notes: Record<string, string> };

// Bound each category so a large notebook cannot crowd out all later categories.
export function projectTutorContext(draft: StudioDraft): string {
  const section = (name: string, value: unknown) => `${name}: ${JSON.stringify(value).slice(0, 2400)}`;
  return [
    "Student notebook excerpts. Sections may be shortened; missing evidence does not mean work was not done.",
    section("Current stage and notes", { stage: draft.journey.stage, notes: draft.journey.notes[draft.journey.stage], completed: draft.journey.completed }),
    section("Site, users, interests, experience, open questions", [draft.site, draft.users, draft.interests, draft.experience, draft.openQuestions]),
    section("Chosen concept and decision", [draft.concepts.find(c => c.id === draft.directionId), draft.decisionNotes]),
    section("Concepts", draft.concepts),
    section("References (not verified)", draft.precedents),
    section("Requirements and evidence", draft.requirementItems.map(({ label, done, evidence, sourceBrief }) => ({ label, done, evidence, briefChanged: sourceBrief !== draft.brief }))),
    section("Milestones", draft.milestones),
    section("Recent critique", draft.critiques.slice(-5)),
    section("Presentation", [draft.presentationStory, draft.presentationItems, draft.reviewQuestions]),
    `Earlier stage notes: ${JSON.stringify(Object.fromEntries(PROJECT_STAGES.filter(stage => stage.id !== draft.journey.stage).map(stage => [stage.title, draft.journey.notes[stage.id]]))).slice(0, 1200)}`,
  ].join("\n").slice(0, 24000);
}
