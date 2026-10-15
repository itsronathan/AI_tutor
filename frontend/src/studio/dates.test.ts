import { describe, expect, it } from "vitest";
import { dateOnly, localToday, milestoneStatus } from "./dates";

describe("milestone dates", () => {
  it("rejects invalid dates without shifting valid dates", () => {
    expect(dateOnly("2026-02-30")).toBe("");
    expect(dateOnly("2028-02-29")).toBe("2028-02-29");
    expect(dateOnly("not a date")).toBe("");
  });
  it("uses calendar comparisons and completed work is never overdue", () => {
    expect(milestoneStatus("2026-09-24", false, "2026-09-25")).toBe("Overdue");
    expect(milestoneStatus("2026-09-25", false, "2026-09-25")).toBe("Due today");
    expect(milestoneStatus("2026-09-24", true, "2026-09-25")).toBe("Complete");
    expect(milestoneStatus("", false)).toBe("No date set");
  });
  it("formats the local calendar day", () => expect(localToday(new Date(2026, 8, 25, 23, 59))).toBe("2026-09-25"));
});
