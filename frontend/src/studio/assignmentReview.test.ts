import { describe, expect, it } from "vitest";
import { normalizeReview, parseAnalysis, parseReply } from "./assignmentReview";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";

const analysis = { source_brief: "Submit two sections.", summary: "Study a design in section.",
  requirements: [{ category: "deliverable", requirement: "Two sections", quote: "Submit two sections." }],
  questions: [{ question: "What scale?", reason: "The scale is not specified.", ask: "instructor" }] };

describe("saved assignment context", () => {
  it("does not restore review data for an older assignment", () => {
    expect(normalizeReview({ analysis, reviewed: true }, "A new brief")).toBeNull();
    expect(normalizeDraft({ brief: "A new brief", assignmentReview: { analysis } }).assignmentReview).toBeNull();
  });
  it("rejects unsupported quotes and malformed AI results", () => {
    expect(parseAnalysis({ ...analysis, requirements: [{ ...analysis.requirements[0], quote: "Build a tower." }] })).toBeNull();
    expect(parseReply({ answer: "Build a tower.", supporting_quotes: ["Build a tower."], remaining_questions: [] }, analysis.source_brief)).toBeNull();
    expect(parseAnalysis({ requirements: "not an array" })).toBeNull();
  });
  it("exports the review, student clarifications, and labeled AI answers", () => {
    const draft = normalizeDraft({ brief: analysis.source_brief, assignmentReview: {
      analysis, reviewed: true, answers: { "0": "1:100" }, reviewNotes: "Scale confirmed in class.",
      turns: [{ question: "How should I start?", reply: { answer: "Compare two enclosure studies.", supporting_quotes: [], remaining_questions: [] } }],
    } });
    const notes = buildProjectNotes(draft);
    expect(notes).toContain("AI ASSIGNMENT REVIEW");
    expect(notes).toContain("Scale confirmed in class.");
    expect(notes).toContain("1:100");
    expect(notes).toContain("Compare two enclosure studies.");
  });
});
