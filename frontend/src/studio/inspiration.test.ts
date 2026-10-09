import { expect, it } from "vitest";
import { normalizeExplorations, parseDirections, parseRecord } from "./inspiration";
import { COURSE_BRIEF } from "./coursePreset";

it("keeps the preset within the brief limit and preserves conflicting source requirements", () => {
  expect(COURSE_BRIEF.length).toBeLessThan(30000);
  expect(COURSE_BRIEF).toContain("scale TBD");
  expect(COURSE_BRIEF).toContain("35%");
  expect(COURSE_BRIEF).toContain("52,949");
});
it("rejects fabricated quotes and damaged process records", () => {
  const d = { title: "Idea", idea: "Explore", requirement_connection: "Connection", supporting_quotes: ["Invented"], trade_off: "Trade-off", experiment: "Try", unresolved: "Unknown" };
  expect(parseDirections([d, d, d], "An actual assignment.")).toBeNull();
  expect(parseRecord({ created_at: "not a date" })).toBeNull();
  expect(normalizeExplorations([{ id: "broken", context: "not json" }])).toEqual([]);
});
