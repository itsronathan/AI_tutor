export const STUDIO_LESSONS = [
  {
    id: "site", title: "Site analysis", duration: "15 minutes",
    concept: "Start by separating what you observe from what you assume. Access, neighboring uses, light, noise, and existing landscape can suggest design questions. A site observation becomes useful when you explain how it could affect a design choice.",
    example: "If you observe a busy path beside a quiet edge, test an entrance near the path and a place to pause near the edge. Treat this as a possibility to investigate, not a requirement.",
    steps: ["Draw a rough site outline from the information you have. Label unknown information rather than inventing it.", "Add separate layers for access, surroundings, and environmental observations. Mark assumptions with a question mark.", "Sketch two different responses to one observation. Annotate what each response gains and gives up."],
    reflection: "Which observation supports your choice? What would you need to verify on site?",
    connection: "Look for the assigned site, boundaries, and any stated environmental or access constraints.",
  },
  {
    id: "circulation", title: "Circulation and arrival", duration: "15 minutes",
    concept: "Circulation is how people move into, through, and between spaces. Trace a journey to explore entrances, connections, pauses, and potential conflicts between different activities.",
    example: "Compare a direct route through a gathering space with a route along its edge. The first may encourage encounters; the second may let people pass without interrupting an activity.",
    steps: ["Draw the required spaces as simple shapes, using the brief when available.", "Trace two possible journeys from arrival to a destination. Include a person with different access needs and flag questions you cannot resolve yet.", "Mark a crossing, a pause, and a confusing decision point. Redraw one connection to test an improvement."],
    reflection: "Who benefits from your route? Whose journey still needs attention?",
    connection: "Check required entrances, user groups, connections, and any accessibility criteria stated in the brief.",
  },
  {
    id: "scale", title: "Scale and human experience", duration: "20 minutes",
    concept: "Scale relates the size of a space or representation to something else, such as a person, a room, or its surroundings. A scale drawing uses a consistent ratio between represented and actual dimensions. Use figures and known dimensions to question how a space might feel.",
    example: "At 1:100, a 10 m length is represented by 10 cm. A small paper study can compare enclosure and openness, while a dimensioned drawing checks the size you intend.",
    steps: ["Choose a space and a known dimension. If none is given, label your dimension as a working assumption.", "Sketch a section with a person for comparison. Make a second version with a different height or width.", "Build two simple folded-paper enclosures or draw both sections at the same scale. Compare their openings and proportions."],
    reflection: "What changed in the experience when the proportions changed? Which dimensions come from the assignment?",
    connection: "Look for specified dimensions, area limits, and required drawing or model scales. Ask your instructor about missing submission scales.",
  },
  {
    id: "organization", title: "Spatial organization", duration: "20 minutes",
    concept: "Spatial organization describes how spaces relate: next to each other, around a shared space, along a path, or in a sequence. Start with activities and relationships before settling on a final building shape.",
    example: "A shared courtyard and a central indoor room can both connect a group of spaces. Compare how each arrangement changes privacy, movement, and the relationship to the outside.",
    steps: ["Write each required activity on a paper card. Add optional ideas on separately labeled cards.", "Arrange the cards in two ways. Mark spaces that should connect and activities that may conflict.", "Sketch or make a quick block model of each arrangement. Select one relationship to test further, rather than declaring a final solution."],
    reflection: "Which relationship is strongest in each option? What trade-off would you discuss at a critique?",
    connection: "Check the required program, adjacencies, public/private relationships, and deliverables before adding spaces.",
  },
] as const;

export type LessonNote = { reflection: string; completed: boolean };
export type LessonNotes = Record<string, LessonNote>;
