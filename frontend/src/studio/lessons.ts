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
  {
    id: "codes", title: "Zoning and safety codes", duration: "25 minutes",
    concept: "Zoning shapes land use and development; building codes address matters such as occupancy, fire protection, and means of egress. Research them separately, then connect findings to a design decision. The applicable rules depend on the jurisdiction, edition, and project conditions.",
    example: "A massing study can respond to a researched zoning envelope while a separate circulation study asks how occupants reach exits. A plausible drawing alone does not demonstrate either requirement is met.",
    steps: ["Identify the site, jurisdiction, proposed use, and project scope. List missing information.", "Find an official zoning source and the applicable building-code source. Record a relevant section and its applicability as a research question.", "Annotate a massing or circulation sketch with the design consequence and what still needs confirmation."],
    reflection: "Which finding is supported by a source, and which interpretation needs review?",
    connection: "Use assigned zoning and life-safety deliverables as a research brief. Confirm the governing edition and project assumptions with your instructor.",
  },
  {
    id: "accessibility", title: "ADA and accessible design", duration: "25 minutes",
    concept: "Accessible design considers how people arrive, move, use facilities, and participate in activities. Study a complete journey rather than treating a ramp as the whole solution. ADA standards include both scoping requirements and technical criteria; local requirements may also apply.",
    example: "Trace a visitor's journey from arrival to reception, changing, pool use, and a toilet. An accessible entrance alone does not resolve the rest of that journey.",
    steps: ["Draw one route through the project's key activities, marking level changes and doors.", "Identify elements to research in the applicable accessibility standards. Separate measured information from assumptions.", "Revise one difficult transition and identify the dimensions or source sections needed to evaluate it."],
    reflection: "Where does the journey still depend on unverified information or exclude participation?",
    connection: "Check the brief's user groups and required activities, then investigate accessible routes and the facilities serving those activities.",
  },
  {
    id: "lighting", title: "Lighting strategies", duration: "20 minutes",
    concept: "Lighting design combines daylight, electric light, and controls to support activities. More sunlight is not always better: compare light distribution, glare, views, and heat gain. Orientation, shading, and room geometry affect the result.",
    example: "Compare an unshaded opening with a shaded opening in the same room section. Ask where a reader sees glare and how task lighting supports use after dark.",
    steps: ["Choose one activity and record the room orientation and occupied hours, labeling unknowns.", "Sketch two lighting strategies under the same assumed conditions. Change one feature and annotate expected trade-offs.", "Plan a physical model, simulation, or observation to test your idea. Treat predicted effects as hypotheses until checked."],
    reflection: "How does your strategy support the activity during the day and after dark?",
    connection: "Check daylight, envelope, and presentation requirements in the assignment before choosing openings or lighting systems.",
  },
] as const;

export type LessonNote = { reflection: string; completed: boolean; research?: string };
export type LessonNotes = Record<string, LessonNote>;
