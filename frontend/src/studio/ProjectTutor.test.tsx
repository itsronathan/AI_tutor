// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudioBrainstorm from "../StudioBrainstorm";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";
import { projectTutorContext } from "./journey";

const key = "studio-brainstorm:v1:guest";
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const open = () => fireEvent.click(screen.getByRole("button", { name: "Project tutor" }));

it("saves stages and notes without AI, restores them, exports them, and isolates projects", () => {
  const view = render(<StudioBrainstorm ownerId="guest" />);
  open();
  fireEvent.click(screen.getByRole("button", { name: "3. Explore" }));
  fireEvent.change(screen.getByLabelText("Stage notes"), { target: { value: "Test a courtyard model." } });
  fireEvent.click(screen.getByRole("checkbox", { name: /worked through this stage/ }));
  expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
  expect(buildProjectNotes(normalizeDraft(JSON.parse(localStorage.getItem(key)!)))).toContain("Test a courtyard model.");
  view.unmount();
  render(<StudioBrainstorm ownerId="guest" />);
  open();
  expect(screen.getByLabelText("Stage notes")).toHaveValue("Test a courtyard model.");
  expect(screen.getByRole("checkbox", { name: /worked through this stage/ })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Open Concepts" }));
  expect(screen.getByRole("heading", { name: "Your concept board" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "New project" }));
  open();
  expect(screen.getByLabelText("Stage notes")).toHaveValue("");
  expect(screen.getByRole("button", { name: "1. Understand" })).toHaveAttribute("aria-pressed", "true");
});

it("sends current notebook context and stage, saves replies, and cancels on stage change", async () => {
  const brief = "Design a pavilion.";
  localStorage.setItem(key, JSON.stringify(normalizeDraft({ brief,
    concepts: [{ id: "a", title: "Courtyard", premise: "Quiet center" }], directionId: "a",
    assignmentReview: { analysis: { source_brief: brief, summary: brief, requirements: [], questions: [] }, reviewed: true, reviewNotes: "", answers: {}, turns: [] },
  })));
  const reply = { answer: "Test the entrance with a small model.", supporting_quotes: [], remaining_questions: [] };
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(reply)));
  vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" />);
  open();
  fireEvent.click(screen.getByRole("button", { name: "3. Explore" }));
  fireEvent.change(screen.getByLabelText("Stage notes"), { target: { value: "Two entrances to test." } });
  fireEvent.click(screen.getByRole("button", { name: "Suggest a question" }));
  expect(fetchMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
  expect(await screen.findByText(reply.answer)).toBeInTheDocument();
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(payload.question).toContain("Project stage: Explore");
  expect(payload.project_context).toContain("Courtyard");
  expect(payload.project_context).toContain("Two entrances to test.");
  expect(buildProjectNotes(normalizeDraft(JSON.parse(localStorage.getItem(key)!)))).toContain(reply.answer);
  fetchMock.mockImplementation(() => new Promise(() => {}));
  fireEvent.change(screen.getByLabelText("Your question for the assignment tutor"), { target: { value: "What next?" } });
  fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
  const signal = fetchMock.mock.calls[1][1].signal;
  fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
  expect(signal.aborted).toBe(true);
});

it("bounds notebook excerpts and migrates older or malformed journey data", () => {
  const draft = normalizeDraft({ journey: { stage: "invalid", completed: ["brief", "brief", "fake"], notes: { brief: "x".repeat(9000) } } });
  expect(draft.journey.stage).toBe("brief");
  expect(draft.journey.completed).toEqual(["brief"]);
  expect(draft.journey.notes.brief).toHaveLength(4000);
  expect(projectTutorContext(draft).length).toBeLessThanOrEqual(24000);
  expect(normalizeDraft(null).journey.completed).toEqual([]);
});
