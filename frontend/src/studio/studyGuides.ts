export type StudyGuide = { scope: string; prompts: string[]; sources: { title: string; url: string }[] };
export const STUDY_GUIDES: Record<string, StudyGuide> = {
  codes: {
    scope: "Research organizer, not a compliance assessment. Establish the jurisdiction, adopted edition, project use, and scope before applying a rule. NYC links are a starting point for the supplied Greenpoint assignment, not requirements for every project.",
    prompts: [
      "Project basis: record the site address, jurisdiction, proposed uses, new construction or alteration, and code edition to confirm.",
      "Zoning: find the mapped district and any special districts; record sources for permitted use, floor area, height, setbacks, and relevant waterfront provisions. Do not infer these from the building's appearance.",
      "Life safety: identify occupancy questions, likely occupant-load inputs, exit paths and discharge, fire separation, and protection systems to research. Record section references and unanswered questions rather than assumed limits.",
      "Design response: annotate one change to your massing or circulation. For each claimed requirement, record its source, section, edition, applicability, and date checked; identify who will confirm it.",
    ],
    sources: [{ title: "NYC Zoning Resolution — districts and land-use regulations", url: "https://zr.planning.nyc.gov/" }, { title: "NYC 2022 Construction Codes — including occupancy, fire protection, and egress chapters", url: "https://www.nyc.gov/site/buildings/codes/2022-construction-codes.page" }],
  },
  accessibility: {
    scope: "Use this as an accessibility design study. ADA applicability and local accessibility requirements need confirmation for the specific project; a diagram or completed exercise cannot establish compliance.",
    prompts: [
      "Arrival: trace a continuous route from the relevant site arrival points to the entrance and required activities. Note level changes and missing site information.",
      "Movement and use: investigate doors, maneuvering and turning space, ramps or vertical circulation, surfaces, reach, and controls. Use applicable scoping and technical provisions together.",
      "Equal participation: examine toilets, seating, signage and communication needs. For the natatorium assignment, research pool entry and associated changing facilities rather than stopping at the front door.",
      "Evidence: record the element, applicable standard and section, dimensions still needed, proposed design change, and question for your instructor. Mark unverified measurements clearly.",
    ],
    sources: [{ title: "DOJ 2010 ADA Standards — scoping and technical requirements", url: "https://www.ada.gov/law-and-regs/design-standards/2010-stds/" }],
  },
  lighting: {
    scope: "Compare lighting strategies through sketches and observations. This worksheet does not calculate illuminance, glare, energy performance, or code compliance.",
    prompts: [
      "Context: record location, orientation, obstructions, room use, occupied hours, and what is still unknown.",
      "Option A: describe daylight openings, shading, and surface choices. Sketch a section and identify possible glare and unwanted heat gain.",
      "Option B: change one feature, such as opening position, shading, or task-light placement. Compare views, light distribution, and the user's activity under the same assumed conditions.",
      "After dark and next test: consider ambient and task lighting plus controls. Record what a model, simulation, or measurement should test; avoid inventing lux values or energy savings.",
    ],
    sources: [{ title: "US Department of Energy — lighting and daylighting strategies", url: "https://www.energy.gov/cmei/buildings/zeb-technologies-lighting-daylighting" }],
  },
};
