import { describe, expect, it } from "vitest";
import { normalizeDraft } from "./model";

describe("studio draft migration", () => {
  it("preserves an original brief while adding safe defaults for new tools", () => {
    const draft = normalizeDraft({ title: "Studio I", brief: "A pavilion", interests: "Light", experience: "Calm" });
    expect(draft.brief).toBe("A pavilion");
    expect(draft.concepts).toEqual([]);
    expect(draft.site).toBe("");
  });
  it("removes deleted concepts from comparisons and the current direction", () => {
    const draft = normalizeDraft({ concepts: [{ id: "kept", title: "Courtyard" }], comparisonIds: ["deleted", "kept", "kept"], directionId: "deleted" });
    expect(draft.comparisonIds).toEqual(["kept"]);
    expect(draft.directionId).toBe("");
  });
  it("rejects malformed collection entries and caps the comparison at three", () => {
    const draft = normalizeDraft({ concepts: [null, {}, ...["a", "b", "c", "d"].map(id => ({ id }))], comparisonIds: ["a", "b", "c", "d"] });
    expect(draft.concepts).toHaveLength(4);
    expect(draft.comparisonIds).toHaveLength(3);
  });
});
