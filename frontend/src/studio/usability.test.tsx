// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StudioBrainstorm from "../StudioBrainstorm";
import AiAvailability from "./AiAvailability";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

it("migrates the legacy project, duplicates independently, and restores the selected project", () => {
  localStorage.setItem("studio-brainstorm:v1:guest", JSON.stringify({ title: "Pavilion", brief: "Keep this assignment" }));
  const view = render(<StudioBrainstorm ownerId="guest" />);
  click("Duplicate project");
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "Copy assignment" } });
  click("New project");
  expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("");
  fireEvent.change(screen.getByLabelText("Open project"), { target: { value: "original" } });
  expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("Keep this assignment");
  view.unmount();
  render(<StudioBrainstorm ownerId="guest" />);
  expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("Keep this assignment");
  const library = JSON.parse(localStorage.getItem("studio-brainstorm:v1:guest:projects")!);
  expect(library.projects).toHaveLength(3);
  expect(library.projects[1].draft.brief).toBe("Copy assignment");
});

it("isolates projects when the signed-in owner changes without an outer remount", () => {
  const view = render(<StudioBrainstorm ownerId="a" />);
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "A's notes" } });
  view.rerender(<StudioBrainstorm ownerId="b" />);
  expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("");
});

it("undo restores a removed concept without discarding subsequent work", () => {
  render(<StudioBrainstorm ownerId="guest" />);
  click("Concepts"); click("Add concept");
  fireEvent.change(screen.getByLabelText("Concept name"), { target: { value: "Courtyard" } });
  fireEvent.click(screen.getByLabelText("Compare Courtyard")); click("Develop this concept");
  click("Remove concept 1"); click("Add concept");
  fireEvent.change(screen.getByLabelText("Concept name"), { target: { value: "Threshold" } });
  click("Undo deletion");
  expect(screen.getAllByLabelText("Concept name").map(e => (e as HTMLTextAreaElement).value)).toEqual(["Threshold", "Courtyard"]);
  expect(screen.getByRole("button", { name: "Current direction" })).toBeInTheDocument();
});

it("keeps unsaved projects in memory when browser storage fails", () => {
  render(<StudioBrainstorm ownerId="guest" />);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Full"); });
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "Keep in memory" } });
  click("New project");
  fireEvent.change(screen.getByLabelText("Open project"), { target: { value: "original" } });
  expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("Keep in memory");
  expect(screen.getByRole("status")).toHaveTextContent("storage is unavailable");
});

it("imports reviewed requirements once, exports evidence, and flags changed briefs", () => {
  const draft = normalizeDraft({ brief: "Include a section.", assignmentReview: { reviewed: true, analysis: { source_brief: "Include a section.", summary: "Draw a section", requirements: [{ category: "deliverable", requirement: "Section drawing", quote: "Include a section." }], questions: [] } } });
  localStorage.setItem("studio-brainstorm:v1:guest", JSON.stringify(draft));
  render(<StudioBrainstorm ownerId="guest" />); click("Plan"); click("Import reviewed requirements");
  expect(screen.getByRole("button", { name: "Import reviewed requirements" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Deliverable or evidence for requirement 1"), { target: { value: "Sheet A2" } });
  fireEvent.click(screen.getByLabelText("Complete requirement 1"));
  click("Brief & exercises");
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "Include two sections." } });
  click("Plan"); expect(screen.getByText(/The brief has changed/)).toBeInTheDocument();
  const saved = normalizeDraft(JSON.parse(localStorage.getItem("studio-brainstorm:v1:guest")!));
  expect(buildProjectNotes(saved)).toContain("Sheet A2");
  expect(buildProjectNotes(saved)).toContain("Brief changed: recheck this item.");
  click("I rechecked this requirement");
  expect(screen.getByLabelText("Complete requirement 1")).not.toBeChecked();
});

it("checks AI configuration without sending project data and distinguishes an unreachable service", async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ configured: false }))).mockRejectedValueOnce(new Error("Offline"));
  vi.stubGlobal("fetch", fetchMock);
  render(<AiAvailability />); click("Check AI connection");
  expect(await screen.findByText(/AI is not configured yet/)).toBeInTheDocument();
  expect(fetchMock.mock.calls[0][0]).toContain("/api/studio/availability");
  expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  click("Check AI connection");
  expect(await screen.findByText(/Could not check the AI service/)).toBeInTheDocument();
});
