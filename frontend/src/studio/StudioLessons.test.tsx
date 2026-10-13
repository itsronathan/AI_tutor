// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ArchitectureLearning from "../ArchitectureLearning";
import StudioBrainstorm from "../StudioBrainstorm";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";

const key = "architecture-learning:v1:guest";
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("persists learning independently of projects and isolates owners on rerender", () => {
  const projectKey = "studio-brainstorm:v1:guest";
  const project = JSON.stringify(normalizeDraft({ brief: "Private assignment", lessonNotes: { site: { reflection: "Earlier project reflection", completed: true } } }));
  localStorage.setItem(projectKey, project);
  const view = render(<ArchitectureLearning ownerId="guest" />);
  expect(screen.queryByText("Private assignment")).not.toBeInTheDocument();
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("");
  fireEvent.change(screen.getByLabelText(/^Your reflection:/), { target: { value: "Find a survey for the slope." } });
  fireEvent.click(screen.getByRole("checkbox", { name: /I tried this exercise/ }));
  fireEvent.click(screen.getByRole("button", { name: "Circulation and arrival" }));
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("");
  expect(localStorage.getItem(projectKey)).toBe(project);
  expect(buildProjectNotes(normalizeDraft(JSON.parse(project)))).toContain("Earlier project reflection");
  view.rerender(<ArchitectureLearning ownerId="another-student" />);
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("");
  view.rerender(<ArchitectureLearning ownerId="guest" />);
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("Find a survey for the slope.");
  expect(screen.getByText(/1 of 7 exercises/)).toBeInTheDocument();
});

it("offers a site exercise without site knowledge, an assignment, or AI", () => {
  const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
  render(<ArchitectureLearning ownerId="guest" />);
  expect(screen.getByText(/Practice site \(fictional\)/)).toBeInTheDocument();
  expect(screen.getByText(/No site or drawing experience needed/)).toBeInTheDocument();
  expect(screen.queryByText(/15 minutes/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Assignment brief/)).not.toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("keeps Learn outside the project workspace with a separate navigation link", () => {
  render(<StudioBrainstorm ownerId="guest" />);
  expect(screen.queryByRole("button", { name: "Learn" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Learn architecture/ })).toHaveAttribute("href", "/learning?course=architecture");
  expect(screen.getByRole("button", { name: "Focused help" })).toBeInTheDocument();
});

it("restores learning notes per topic and includes them in downloads", () => {
  localStorage.setItem(key, JSON.stringify({ codes: { research: "Zoning concerns land use", completed: false, reflection: "Check the jurisdiction" } }));
  const create = vi.fn().mockReturnValue("blob:notes");
  vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  render(<ArchitectureLearning ownerId="guest" />);
  fireEvent.click(screen.getByRole("button", { name: "Zoning and safety codes" }));
  fireEvent.click(screen.getByText("Explore further"));
  expect(screen.getByLabelText("Learning notes")).toHaveValue("Zoning concerns land use");
  fireEvent.click(screen.getByRole("button", { name: "Download learning notes" }));
  expect(create).toHaveBeenCalledWith(expect.any(Blob));
  expect(create.mock.calls[0][0].size).toBeGreaterThan(0);
});

it("reports failed saves while retaining the current reflection", () => {
  render(<ArchitectureLearning ownerId="guest" />);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota"); });
  fireEvent.change(screen.getByLabelText(/^Your reflection:/), { target: { value: "Keep this note" } });
  expect(screen.getByRole("alert")).toHaveTextContent("Notes could not be saved");
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("Keep this note");
});

it("handles corrupt storage and normalizes malformed legacy notes", () => {
  localStorage.setItem(key, "{broken");
  render(<ArchitectureLearning ownerId="guest" />);
  expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");
  expect(normalizeDraft({ lessonNotes: { site: { reflection: 42, completed: "true" }, unknown: {} } }).lessonNotes.site)
    .toEqual({ reflection: "", completed: false, research: "" });
});
