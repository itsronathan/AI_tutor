// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StudioBrainstorm from "./StudioBrainstorm";

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Studio Brainstorm drafts", () => {
  it("shows one activity at a time and allows skipping ahead without a brief", () => {
    render(<StudioBrainstorm ownerId="guest" />);
    expect(screen.getByRole("heading", { name: "What are you working on?" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Brainstorming exercises" })).not.toBeInTheDocument();
    expect(screen.getByText("Projects").parentElement).not.toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    expect(screen.getByRole("region", { name: "Brainstorming exercises" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Assignment brief/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Export" } });
    expect(screen.getByRole("button", { name: "Finish" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Export your notes" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Brainstorming exercises" })).not.toBeInTheDocument();
  });
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
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("status")).toHaveTextContent("storage is unavailable"); fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Brief & exercises" } });
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("Study light and shelter.");
  });

  it("recovers from malformed saved drafts and rejects whitespace-only briefs", () => {
    localStorage.setItem("studio-brainstorm:v1:guest", '{"brief":42}');
    render(<StudioBrainstorm ownerId="guest" />);
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("");
    fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("status")).toHaveTextContent("Paste your assignment brief");
  });
  it("keeps brainstorming responses when switching lenses and tools", () => {
    render(<StudioBrainstorm ownerId="guest" />);
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Exercises" } }); fireEvent.click(screen.getByRole("checkbox", { name: "Light" }));
    fireEvent.change(screen.getByLabelText("Your response to “Move through light”"), { target: { value: "A dark entry opening to a bright court" } });
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Concepts" } });
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Brief & exercises" } });
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Exercises" } }); fireEvent.click(screen.getByRole("checkbox", { name: "Light" }));
    expect(screen.getByLabelText("Your response to “Move through light”")).toHaveValue("A dark entry opening to a bright court");
  });

  it("lets a student compare directions and removes stale selections when a concept is deleted", () => {
    render(<StudioBrainstorm ownerId="guest" />);
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Concepts" } });
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Concept cards" } }); fireEvent.click(screen.getByRole("button", { name: "Add concept" }));
    fireEvent.change(screen.getByLabelText("Concept name"), { target: { value: "Courtyard" } });
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Compare concepts" } }); fireEvent.click(screen.getByLabelText("Compare Courtyard"));
    fireEvent.click(screen.getByRole("button", { name: "Develop this concept" }));
    expect(screen.getByRole("button", { name: "Current direction" })).toHaveAttribute("aria-pressed", "true");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Concept cards" } }); fireEvent.click(screen.getByRole("button", { name: "Remove concept 1" }));
    expect(screen.queryByRole("button", { name: "Current direction" })).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("studio-brainstorm:v1:guest")!);
    expect(saved.directionId).toBe("");
    expect(saved.comparisonIds).toEqual([]);
  });

  it("preserves planning, critique, and presentation work across reload and includes it in the export", () => {
    const first = render(<StudioBrainstorm ownerId="guest" />);
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Milestones" } });
    fireEvent.click(screen.getByRole("button", { name: "Use starter milestones" }));
    fireEvent.click(screen.getByLabelText("Complete milestone 1"));
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Review & export" } });
    fireEvent.click(screen.getByRole("button", { name: "Use suggested checklist" }));
    fireEvent.click(screen.getByLabelText("Ready: presentation item 1"));
    fireEvent.change(screen.getByLabelText("Project story"), { target: { value: "A gathering place around a shared garden" } });
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Critique notes" } }); fireEvent.click(screen.getByRole("button", { name: "Add critique" }));
    fireEvent.change(screen.getByLabelText("Feedback received"), { target: { value: "Explore a second entrance" } });
    fireEvent.change(screen.getByLabelText("What will you try next?"), { target: { value: "Draw another arrival sequence" } });
    first.unmount();
    render(<StudioBrainstorm ownerId="guest" />);
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Milestones" } });
    expect(screen.getByLabelText("Complete milestone 1")).toBeChecked();
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Review & export" } });
    expect(screen.getByLabelText("Ready: presentation item 1")).toBeChecked();
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Critique notes" } }); expect(screen.getByLabelText("Feedback received")).toHaveValue("Explore a second entrance");
    fireEvent.change(screen.getByLabelText("Activity"), { target: { value: "Export" } }); fireEvent.click(screen.getByText("Preview project notes"));
    const preview = screen.getByText(/Student-authored notes and responses/);
    expect(preview).toHaveTextContent("A gathering place around a shared garden");
    expect(preview).toHaveTextContent("Draw another arrival sequence");
    expect(preview).toHaveTextContent("[x] Read the brief and collect questions");
  });
});
