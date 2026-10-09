import type { StudioDraft } from "./model";
import { projectTutorContext } from "./journey";

export const HELP_TOPICS = [
  { id: "zoning", title: "Zoning", label: "Location, zoning district, and source excerpt", hint: "Add the municipality, district, adopted rules, and the section you want to understand.", question: "Help me identify zoning questions affecting this concept and what I need to verify." },
  { id: "programming", title: "Space programming", label: "Spaces, users, and area targets", hint: "List spaces, activities, capacities, areas with units, and which spaces should be near each other.", question: "Help me organize the program, check missing spaces, and test adjacencies within my concept." },
  { id: "accessibility", title: "Accessibility", label: "Route, users, and applicable source excerpt", hint: "Describe arrival, level changes, circulation, and any rule you need help interpreting.", question: "Help me examine accessible routes within my concept and identify information to verify." },
  { id: "lighting", title: "Lighting", label: "Orientation, openings, and activities", hint: "Describe daylight, glare concerns, and how each space is used.", question: "Suggest a lighting study that supports my concept and addresses the issue I described." },
  { id: "circulation", title: "Circulation", label: "Entrances, routes, and connections", hint: "Describe who moves through the project, destinations, and any bottlenecks.", question: "Help me test movement and connections while keeping my main design idea." },
] as const;
export type HelpTopic = typeof HELP_TOPICS[number]["id"];
export type FocusedHelpState = { topic: HelpTopic; conceptId: string; concept: string; notes: Record<string, { issue: string; details: string }> };

export function focusedHelpContext(draft: StudioDraft): string {
  const focus = draft.focusedHelp;
  const concept = draft.concepts.find(item => item.id === (focus.conceptId || draft.directionId));
  return [
    "Focused design consultation. Keep the student's existing concept as the starting point.",
    `Topic: ${focus.topic}`,
    `Issue: ${focus.notes[focus.topic]?.issue || "Not specified"}`,
    `Topic details (student-supplied, unverified): ${focus.notes[focus.topic]?.details || "Not supplied"}`,
    `Student's concept description: ${focus.concept || "Not supplied"}`,
    `Selected concept excerpt: ${JSON.stringify(concept || null).slice(0, 4500)}`,
    projectTutorContext({ ...draft, directionId: focus.conceptId || draft.directionId }).slice(0, 9000),
  ].join("\n").slice(0, 24000);
}
