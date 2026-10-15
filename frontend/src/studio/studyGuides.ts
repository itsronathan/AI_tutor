export type StudyGuide = { scope: string; prompts: string[]; sources: { title: string; url: string }[] };
export const STUDY_GUIDES: Record<string, StudyGuide> = {
  codes: {
    scope: "Learn how to find and distinguish rules. NYC sources are examples; applying a rule requires the correct jurisdiction and edition.",
    prompts: [
      "Explain zoning and building codes in one sentence each.",
      "Find one heading in each source. What design question could it help answer?",
      "List the information missing from the fictional library example before any rule could be applied.",
    ],
    sources: [{ title: "NYC Zoning Resolution — example jurisdiction", url: "https://zr.planning.nyc.gov/" }, { title: "NYC 2022 Construction Codes — example edition", url: "https://www.nyc.gov/site/buildings/codes/2022-construction-codes.page" }],
  },
  accessibility: {
    scope: "Explore participation across a whole journey. This exercise does not establish ADA compliance.",
    prompts: [
      "In the library example, what might make a door, level change, or sign difficult to use?",
      "Find the difference between scoping (where a requirement applies) and technical criteria (how an element is designed) in the standards.",
      "Describe one barrier and a possible improvement. Label dimensions you have not checked.",
    ],
    sources: [{ title: "DOJ 2010 ADA Standards — scoping and technical requirements", url: "https://www.ada.gov/law-and-regs/design-standards/2010-stds/" }],
  },
  lighting: {
    scope: "Practice predicting and observing light. Sketches alone do not measure performance.",
    prompts: [
      "In the reading room example, where might glare interrupt reading?",
      "Keep the room the same and compare a shaded and unshaded window. Label orientation as an assumption.",
      "What changes after dark? Describe a task light and one observation that could test your idea.",
    ],
    sources: [{ title: "US Department of Energy — lighting and daylighting strategies", url: "https://www.energy.gov/cmei/buildings/zeb-technologies-lighting-daylighting" }],
  },
};
