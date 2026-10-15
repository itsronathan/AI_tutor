import { describe, expect, it } from "vitest";
import { normalizeDraft } from "./model";
import { buildProjectNotes, exportFilename } from "./exportNotes";

describe("project notes export", () => {
  it("includes the student's context, experiments, references, and follow-up work", () => {
    const draft = normalizeDraft({
      brief: "A riverside pavilion", site: "Sloping ground", requirements: "One gathering space",
      promptNotes: { "people-arrival": "A visitor pauses by the water" },
      concepts: [{ id: "c1", title: "Water threshold", experiment: "Three section studies" }], directionId: "c1",
      precedents: [{ id: "p1", title: "A source", source: "Book, p. 14", observation: "Framed views" }],
      milestones: [{ id: "m1", title: "Make a model", due: "2026-10-01", done: true }],
      critiques: [{ id: "r1", feedback: "Clarify the entrance", nextAction: "Test a new approach" }],
    });
    const result = buildProjectNotes(draft);
    for (const expected of ["riverside pavilion", "Sloping ground", "One gathering space", "pauses by the water", "Water threshold", "Three section studies", "Book, p. 14", "[x] Make a model", "Clarify the entrance", "Test a new approach"]) {
      expect(result).toContain(expected);
    }
  });
  it("creates portable filenames and useful empty-project notes", () => {
    expect(exportFilename("../Studio: Fall/2026")).toBe("Studio-Fall-2026-notes.txt");
    expect(exportFilename("")).toBe("studio-project-notes.txt");
    expect(buildProjectNotes(normalizeDraft(null))).not.toContain("undefined");
  });
});
