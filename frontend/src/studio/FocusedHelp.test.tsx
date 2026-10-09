// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudioBrainstorm from "../StudioBrainstorm";
import { normalizeDraft } from "./model";
import { focusedHelpContext } from "./focusedHelp";
import { buildProjectNotes } from "./exportNotes";

const key = "studio-brainstorm:v1:guest";
const open = () => fireEvent.click(screen.getByRole("button", { name: "Focused help" }));
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("keeps separate topic notes, restores and exports them without AI, and isolates projects", () => {
  const view = render(<StudioBrainstorm ownerId="guest" />);
  open();
  fireEvent.change(screen.getByLabelText("Your concept / what to keep"), { target: { value: "Keep my courtyard." } });
  fireEvent.change(screen.getByLabelText("What do you need help with?"), { target: { value: "Check setbacks." } });
  fireEvent.click(screen.getByRole("button", { name: "Space programming" }));
  expect(screen.getByLabelText("What do you need help with?")).toHaveValue("");
  fireEvent.change(screen.getByLabelText("Spaces, users, and area targets"), { target: { value: "Reading room, 50 m²." } });
  expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
  const saved = normalizeDraft(JSON.parse(localStorage.getItem(key)!));
  expect(buildProjectNotes(saved)).toContain("Check setbacks.");
  expect(buildProjectNotes(saved)).toContain("Reading room, 50 m².");
  view.unmount();
  render(<StudioBrainstorm ownerId="guest" />);
  open();
  expect(screen.getByLabelText("Spaces, users, and area targets")).toHaveValue("Reading room, 50 m².");
  expect(screen.getByLabelText("Your concept / what to keep")).toHaveValue("Keep my courtyard.");
  fireEvent.click(screen.getByRole("button", { name: "New project" }));
  open();
  expect(screen.getByLabelText("Your concept / what to keep")).toHaveValue("");
});

it("sends the chosen concept and topic, stores replies, and cancels when switching topics", async () => {
  const brief = "Design a pavilion.";
  localStorage.setItem(key, JSON.stringify(normalizeDraft({ brief,
    concepts: [{ id: "a", title: "Courtyard", premise: "Quiet center" }, { id: "b", title: "Linear", premise: "A long path" }], directionId: "b",
    assignmentReview: { analysis: { source_brief: brief, summary: brief, requirements: [], questions: [] }, reviewed: true, reviewNotes: "", answers: {}, turns: [] },
  })));
  const reply = { answer: "Test a room adjacency diagram.", supporting_quotes: [], remaining_questions: [] };
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(reply)));
  vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" />);
  open();
  fireEvent.click(screen.getByRole("button", { name: "Space programming" }));
  fireEvent.change(screen.getByLabelText("Concept to work with"), { target: { value: "a" } });
  fireEvent.change(screen.getByLabelText("Spaces, users, and area targets"), { target: { value: "Library beside courtyard" } });
  fireEvent.click(screen.getByRole("button", { name: "Suggest a question" }));
  expect(fetchMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
  expect(await screen.findByText(reply.answer)).toBeInTheDocument();
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(payload.help_topic).toBe("programming");
  expect(payload.project_context).toContain('Selected concept excerpt: {"id":"a"');
  expect(payload.project_context).toContain("Library beside courtyard");
  expect(buildProjectNotes(normalizeDraft(JSON.parse(localStorage.getItem(key)!)))).toContain(reply.answer);
  fetchMock.mockImplementation(() => new Promise(() => {}));
  fireEvent.change(screen.getByLabelText("Your question for the assignment tutor"), { target: { value: "Which room next?" } });
  fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
  const signal = fetchMock.mock.calls[1][1].signal;
  fireEvent.click(screen.getByRole("button", { name: "Zoning" }));
  expect(signal.aborted).toBe(true);
});

it("migrates old drafts, removes stale concept links, and bounds large context", () => {
  const draft = normalizeDraft({ focusedHelp: { topic: "fake", conceptId: "deleted", concept: "x".repeat(9000), notes: { zoning: { issue: "x".repeat(9000), details: "x".repeat(10000) } } } });
  expect(draft.focusedHelp.topic).toBe("zoning");
  expect(draft.focusedHelp.conceptId).toBe("");
  expect(draft.focusedHelp.notes.zoning.details).toHaveLength(6000);
  expect(focusedHelpContext(draft).length).toBeLessThanOrEqual(24000);
  expect(normalizeDraft(null).focusedHelp.topic).toBe("zoning");
});
