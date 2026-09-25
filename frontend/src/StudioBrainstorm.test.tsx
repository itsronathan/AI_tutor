// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StudioBrainstorm from "./StudioBrainstorm";

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Studio Brainstorm drafts", () => {
  it("autosaves partial work before the student has an assignment brief", () => {
    const first = render(<StudioBrainstorm ownerId="guest" />);
    fireEvent.change(screen.getByLabelText(/What catches your interest/), { target: { value: "Light through a courtyard" } });
    first.unmount();
    render(<StudioBrainstorm ownerId="guest" />);
    expect(screen.getByLabelText(/What catches your interest/)).toHaveValue("Light through a courtyard");
  });
  it("restores a saved brief for its owner without showing it to another owner", () => {
    const first = render(<StudioBrainstorm ownerId="student-a" />);
    fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "Design a gathering space." } });
    fireEvent.click(screen.getByRole("button", { name: "Save project draft" }));
    expect(screen.getByRole("status")).toHaveTextContent("Draft saved");
    first.unmount();
    const second = render(<StudioBrainstorm ownerId="student-a" />);
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("Design a gathering space.");
    second.unmount();
    render(<StudioBrainstorm ownerId="student-b" />);
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("");
  });

  it("keeps the notes available and reports a failed save", () => {
    render(<StudioBrainstorm ownerId="guest" />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "Study light and shelter." } });
    fireEvent.click(screen.getByRole("button", { name: "Save project draft" }));
    expect(screen.getByRole("status")).toHaveTextContent("storage is unavailable");
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("Study light and shelter.");
  });

  it("recovers from malformed saved drafts and rejects whitespace-only briefs", () => {
    localStorage.setItem("studio-brainstorm:v1:guest", '{"brief":42}');
    render(<StudioBrainstorm ownerId="guest" />);
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("");
    fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save project draft" }));
    expect(screen.getByRole("status")).toHaveTextContent("Paste your assignment brief");
  });
});
