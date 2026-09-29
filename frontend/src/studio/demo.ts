export const DEMO_BRIEF = "Design a small waterfront community pavilion with a gathering room, a quiet reading room, and a shared outdoor space. Connect all three spaces with a clear arrival route. Compare two spatial arrangements and present a diagram and a short explanation of your choice.";
export const DEMO_STEPS = ["Read the brief", "Learn key concepts", "Compare ideas", "Explore a diagram", "Professor feedback"];
export const DEMO_DIRECTIONS = [
  { title: "Shared courtyard", idea: "Arrange the rooms around the shared outdoor space.", connection: "Connects all three spaces through a common outdoor center.", tradeoff: "Outdoor connections may need shelter; the brief does not specify weather protection.", test: "Trace a rainy-day arrival and sketch a covered threshold.", points: [[100, 95], [340, 95], [220, 210]] },
  { title: "Connecting spine", idea: "Place the rooms along a clear shared route to the waterfront.", connection: "Makes the arrival route the organizing element between all three spaces.", tradeoff: "The quiet room may be disturbed by passing groups.", test: "Draw a section through the path and quiet room; test a buffer between them.", points: [[90, 120], [220, 120], [350, 120]] },
  { title: "Separate clusters", idea: "Separate the active and quiet rooms, connected by the outdoor space.", connection: "Uses the required shared outdoor space to connect two distinct activities.", tradeoff: "Longer connections may make arrival less obvious.", test: "Sketch the view from the entrance and test whether both destinations are visible.", points: [[85, 80], [355, 200], [220, 140]] },
] as const;
export type DemoNotes = { reviewed: boolean; direction: number; topic: number; reflection: string; observation: string; useful: string; confusing: string; change: string };
export const EMPTY_DEMO: DemoNotes = { reviewed: false, direction: 0, topic: 0, reflection: "", observation: "", useful: "", confusing: "", change: "" };
export function normalizeDemo(raw: unknown): DemoNotes {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const notes = { ...EMPTY_DEMO, reviewed: value.reviewed === true };
  for (const key of ["reflection", "observation", "useful", "confusing", "change"] as const) notes[key] = typeof value[key] === "string" ? value[key].slice(0, 4000) : "";
  notes.direction = Number.isInteger(value.direction) && Number(value.direction) >= 0 && Number(value.direction) < 3 ? Number(value.direction) : 0;
  notes.topic = Number.isInteger(value.topic) && Number(value.topic) >= 0 && Number(value.topic) < 4 ? Number(value.topic) : 0;
  return notes;
}
export function demoExport(notes: DemoNotes) {
  return `ARCHITECTURE STUDIO — PROFESSOR DEMO\nAuthored examples; no live AI generation or assessment.\n\nSample assignment\n${DEMO_BRIEF}\n\nBrief reviewed: ${notes.reviewed ? "Yes" : "No"}\nSelected direction: ${DEMO_DIRECTIONS[notes.direction].title}\n\nStudent reflection\n${notes.reflection}\n\nDiagram observation / next experiment\n${notes.observation}\n\nProfessor feedback\nUseful: ${notes.useful}\nUnclear or inaccurate: ${notes.confusing}\nPriority change: ${notes.change}\n\nConcept diagrams are not to scale and do not demonstrate code compliance.\n`;
}
