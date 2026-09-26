// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudioBrainstorm from "../StudioBrainstorm";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";
import { STUDIO_LESSONS } from "./lessons";

const key = "studio-brainstorm:v1:guest";
const brief = "Design a pavilion. Submit a site model.";
function seed(reviewed = true) {
  localStorage.setItem(key, JSON.stringify(normalizeDraft({
    brief, interests: "Courtyards", assignmentReview: {
      analysis: { source_brief: brief, summary: "Design a pavilion.", requirements: [], questions: [
        { question: "Which site?", reason: "No site specified.", ask: "instructor" },
      ] }, reviewed, reviewNotes: "Instructor approved the riverbank.", answers: { 0: "The riverbank" }, turns: [],
    },
  })));
}
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("supports lessons without AI, persists separate reflections, exports them, and isolates owners", () => {
  const view = render(<StudioBrainstorm ownerId="guest" learningMode />);
  expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/^Your reflection:/), { target: { value: "Verify the noisy edge on site." } });
  fireEvent.click(screen.getByRole("checkbox", { name: /I tried this exercise/ }));
  fireEvent.click(screen.getByRole("button", { name: "Circulation and arrival" }));
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("");
  fireEvent.change(screen.getByLabelText(/^Your reflection:/), { target: { value: "Keep a clear route along the edge." } });
  const saved = normalizeDraft(JSON.parse(localStorage.getItem(key)!));
  expect(buildProjectNotes(saved)).toContain("Verify the noisy edge on site.");
  expect(buildProjectNotes(saved)).toContain("Keep a clear route along the edge.");
  view.unmount();
  const restored = render(<StudioBrainstorm ownerId="guest" learningMode />);
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("Verify the noisy edge on site.");
  expect(screen.getByText(/1 of 4 exercises/)).toBeInTheDocument();
  restored.unmount();
  render(<StudioBrainstorm ownerId="another-student" learningMode />);
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("");
});

it("requires review and invalidates assignment help after brief edits while preserving reflections", () => {
  seed(false);
  render(<StudioBrainstorm ownerId="guest" learningMode />);
  expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/^Your reflection:/), { target: { value: "Check access." } });
  fireEvent.click(screen.getByRole("button", { name: "Open assignment brief" }));
  fireEvent.click(screen.getByRole("checkbox", { name: /I have reviewed/ }));
  fireEvent.click(screen.getByRole("button", { name: "Learn" }));
  expect(screen.getByRole("button", { name: "Ask assignment tutor" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Open assignment brief" }));
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "A different assignment." } });
  fireEvent.click(screen.getByRole("button", { name: "Learn" }));
  expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("Check access.");
});

it("sends the selected lesson with the reviewed brief and clarifications, and shares replies with Studio", async () => {
  seed();
  const reply = { answer: "Try two alternative arrival diagrams.", supporting_quotes: ["Design a pavilion."], remaining_questions: [] };
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(reply)));
  vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" learningMode />);
  fireEvent.click(screen.getByRole("button", { name: "Circulation and arrival" }));
  fireEvent.change(screen.getByLabelText("Your question for the assignment tutor"), { target: { value: "How can I start?" } });
  fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
  expect(await screen.findByText(reply.answer)).toBeInTheDocument();
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(fetchMock.mock.calls[0][0]).toContain("/api/studio/follow-up");
  expect(payload.question).toContain("Learning topic: Circulation and arrival");
  expect(payload.question).toContain("How can I start?");
  expect(payload.brief).toBe(brief);
  expect(payload.review_notes).toContain("riverbank");
  expect(payload.clarifications[0].answer).toBe("The riverbank");
  fireEvent.click(screen.getByRole("button", { name: "Open assignment brief" }));
  expect(screen.getByText(reply.answer)).toBeInTheDocument();
  expect(screen.getByLabelText(/What catches your interest/)).toHaveValue("Courtyards");
});

it("cancels pending lesson requests when changing topics and fits every topic in the API question limit", async () => {
  seed();
  let resolve!: (response: Response) => void;
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(() => new Promise<Response>(done => { resolve = done; }));
  vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" learningMode />);
  for (const lesson of STUDIO_LESSONS) {
    fireEvent.click(screen.getByRole("button", { name: lesson.title }));
    expect(Number(screen.getByLabelText("Your question for the assignment tutor").getAttribute("maxlength"))).toBeGreaterThan(500);
  }
  fireEvent.change(screen.getByLabelText("Your question for the assignment tutor"), { target: { value: "Help me start." } });
  fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
  fireEvent.click(screen.getByRole("button", { name: "Site analysis" }));
  expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  await act(async () => resolve(new Response(JSON.stringify({ answer: "Old reply", supporting_quotes: [], remaining_questions: [] }))));
  expect(screen.queryByText("Old reply")).not.toBeInTheDocument();
});

it("normalizes old and malformed lesson notes without importing unknown topics", () => {
  const notes = normalizeDraft({ lessonNotes: { site: { reflection: 42, completed: "true" }, unknown: { reflection: "ignore" } } }).lessonNotes;
  expect(notes.site).toEqual({ reflection: "", completed: false });
  expect(Object.keys(notes)).toHaveLength(4);
});
