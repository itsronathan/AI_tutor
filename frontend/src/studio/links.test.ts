import { describe, expect, it } from "vitest";
import { referenceUrl } from "./links";

describe("reference links", () => {
  it("allows explicit web links", () => expect(referenceUrl(" https://example.org/project ")).toBe("https://example.org/project"));
  it.each(["javascript:alert(1)", "data:text/html,hello", "file:///local", "Book, p. 42", "https://user:password@example.org"])("keeps %s as plain text", source => {
    expect(referenceUrl(source)).toBeNull();
  });
});
