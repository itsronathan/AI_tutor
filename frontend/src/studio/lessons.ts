export const STUDIO_LESSONS = [
  {
    id: "site", title: "Site analysis", duration: "15 minutes",
    concept: "Site analysis means learning about a place before designing for it: how people arrive, what surrounds it, and how sun, sound, and terrain affect it. Start with what is known, then list what you need to discover.",
    example: "Practice site (fictional): a rectangular lot has a street on its south edge, a footpath on its east edge, and trees on its west edge. Its dimensions, slope, noise levels, and surrounding building heights are unknown.",
    steps: ["Draw a rectangle for the practice site, or simply make a list. Add the street, footpath, and trees from the example; no measurements are needed.", "Sort your notes into known, assumed, and unknown. For example: the street is known; traffic noise is an assumption; the slope is unknown.", "Choose one unknown and a way to investigate it: a site visit for sound, a survey for slope, or a map for surroundings. Then suggest one possible entrance and explain what you would check before choosing it."],
    reflection: "What can you say from the example, and what would you need to investigate?",
  },
  {
    id: "circulation", title: "Circulation and arrival", duration: "15 minutes",
    concept: "Circulation is how people move into, through, and between spaces. Trace a journey to explore entrances, connections, pauses, and potential conflicts between different activities.",
    example: "Compare a direct route through a gathering space with a route along its edge. The first may encourage encounters; the second may let people pass without interrupting an activity.",
    steps: ["Imagine a small library. Draw an entrance, reading room, and shared table as simple shapes.", "Trace two possible journeys from arrival to a destination. Include a person with different access needs and flag questions you cannot resolve yet.", "Mark a crossing, a pause, and a confusing decision point. Redraw one connection to test an improvement."],
    reflection: "Who benefits from your route? Whose journey still needs attention?",
  },
  {
    id: "scale", title: "Scale and human experience", duration: "20 minutes",
    concept: "Scale relates the size of a space or representation to something else, such as a person, a room, or its surroundings. A scale drawing uses a consistent ratio between represented and actual dimensions. Use figures and known dimensions to question how a space might feel.",
    example: "At 1:100, a 10 m length is represented by 10 cm. A small paper study can compare enclosure and openness, while a dimensioned drawing checks the size you intend.",
    steps: ["Choose a space and a known dimension. If none is given, label your dimension as a working assumption.", "Sketch a section with a person for comparison. Make a second version with a different height or width.", "Build two simple folded-paper enclosures or draw both sections at the same scale. Compare their openings and proportions."],
    reflection: "What changed in the experience when the proportions changed? Which dimensions did you assume?",
  },
  {
    id: "organization", title: "Spatial organization", duration: "20 minutes",
    concept: "Spatial organization describes how spaces relate: next to each other, around a shared space, along a path, or in a sequence. Start with activities and relationships before settling on a final building shape.",
    example: "A shared courtyard and a central indoor room can both connect a group of spaces. Compare how each arrangement changes privacy, movement, and the relationship to the outside.",
    steps: ["Imagine a community room. Make one card each for reading, gathering, storage, and arrival.", "Arrange the cards in two ways. Mark spaces that should connect and activities that may conflict.", "Sketch or make a quick block model of each arrangement. Select one relationship to test further, rather than declaring a final solution."],
    reflection: "Which relationship is strongest in each option? What trade-off would you discuss at a critique?",
  },
  {
    id: "codes", title: "Zoning and safety codes", duration: "25 minutes",
    concept: "Zoning shapes land use and development; building codes address matters such as occupancy, fire protection, and means of egress. Research them separately, then connect findings to a design decision. The applicable rules depend on the jurisdiction, edition, and project conditions.",
    example: "A massing study can respond to a researched zoning envelope while a separate circulation study asks how occupants reach exits. A plausible drawing alone does not demonstrate either requirement is met.",
    steps: ["Imagine a new neighborhood library. Sort these questions: Is this use allowed here? How do people exit safely? Which concerns zoning and which concerns building codes?", "Browse an official source below. Find a heading related to one question and write down an unfamiliar term. NYC is an example jurisdiction, not a universal rulebook.", "List what you would need before applying a rule: location, governing edition, use, and project scope. No code calculation is needed."],
    reflection: "Which finding is supported by a source, and which interpretation needs review?",
  },
  {
    id: "accessibility", title: "ADA and accessible design", duration: "25 minutes",
    concept: "Accessible design considers how people arrive, move, use facilities, and participate in activities. Study a complete journey rather than treating a ramp as the whole solution. ADA standards include both scoping requirements and technical criteria; local requirements may also apply.",
    example: "Trace a visitor's journey from arrival to reception, changing, pool use, and a toilet. An accessible entrance alone does not resolve the rest of that journey.",
    steps: ["Imagine a library visit: entrance, reception, reading area, and toilet. Sketch the journey and mark possible barriers.", "Identify elements to research in the applicable accessibility standards. Separate measured information from assumptions.", "Revise one difficult transition and identify the dimensions or source sections needed to evaluate it."],
    reflection: "Where does the journey still depend on unverified information or exclude participation?",
  },
  {
    id: "lighting", title: "Lighting strategies", duration: "20 minutes",
    concept: "Lighting design combines daylight, electric light, and controls to support activities. More sunlight is not always better: compare light distribution, glare, views, and heat gain. Orientation, shading, and room geometry affect the result.",
    example: "Compare an unshaded opening with a shaded opening in the same room section. Ask where a reader sees glare and how task lighting supports use after dark.",
    steps: ["Imagine a reading room used during the day and evening. Choose an assumed window orientation and label it as an assumption.", "Sketch two lighting strategies under the same assumed conditions. Change one feature and annotate expected trade-offs.", "Plan a physical model, simulation, or observation to test your idea. Treat predicted effects as hypotheses until checked."],
    reflection: "How does your strategy support the activity during the day and after dark?",
  },
] as const;

export type LessonNote = { reflection: string; completed: boolean; research?: string };
export type LessonNotes = Record<string, LessonNote>;
