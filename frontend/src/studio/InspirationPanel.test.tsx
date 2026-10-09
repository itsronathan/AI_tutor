// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudioBrainstorm from "../StudioBrainstorm";
import { COURSE_BRIEF, COURSE_MARKER } from "./coursePreset";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";

const key = "studio-brainstorm:v1:guest";
const brief = "Design a community pavilion.";
const direction = { title: "Courtyard", idea: "Explore a court.", requirement_connection: "Connect the pavilion to outdoors.", supporting_quotes: [brief], trade_off: "Less enclosed area.", experiment: "Fold a paper study.", unresolved: "Confirm boundaries." };
const record = { created_at: "2026-09-29T12:00:00Z", provider: "OpenAI", model: "test-model", prompt: "Test prompt", input: JSON.stringify({ brief }) };
const result = { directions: [direction, { ...direction, title: "Spine" }, { ...direction, title: "Cluster" }], record };
function seed() {
  localStorage.setItem(key, JSON.stringify(normalizeDraft({ brief, interests: "Keep my notes", assignmentReview: {
    analysis: { source_brief: brief, summary: brief, requirements: [], questions: [{ question: "Where?", reason: "Unknown", ask: "student" }] },
    reviewed: true, reviewNotes: "Keep the tree", answers: { 0: "Riverbank" }, turns: [],
  } })));
}
function openConcepts() { fireEvent.click(screen.getByRole("button", { name: "Concepts" })); }
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("adds the preset without overwriting text, clears review and prevents duplicate application", () => {
  seed(); render(<StudioBrainstorm ownerId="guest" />);
  fireEvent.click(screen.getByText(/Optional course preset:/));
  fireEvent.click(screen.getByRole("button", { name: "Add course preset to brief" }));
  const saved = JSON.parse(localStorage.getItem(key)!);
  expect(saved.brief).toBe(`${brief}\n\n${COURSE_BRIEF}`);
  expect(saved.interests).toBe("Keep my notes");
  expect(saved.assignmentReview).toBeNull();
  expect(screen.getByRole("button", { name: "Course preset added" })).toBeDisabled();
  expect(saved.brief).toContain("35%");
  expect(saved.brief).toContain(COURSE_MARKER);
});

it("requires review before inspiration and drawing requests", () => {
  render(<StudioBrainstorm ownerId="guest" />); openConcepts();
  expect(screen.getByRole("button", { name: "Generate three directions" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Generate concept drawing" })).toBeDisabled();
});

it("generates alternatives, adopts a concept, requests a selected drawing, and exports provenance", async () => {
  seed();
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(result)))
    .mockResolvedValueOnce(new Response(JSON.stringify({ image: "data:image/png;base64,iVBORw0KGgo=", record: { ...record, model: "image-test", size: "1024x1024", quality: "low" } })));
  vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" />); openConcepts();
  fireEvent.change(screen.getByLabelText("What would you like to explore?"), { target: { value: "Public space" } });
  fireEvent.click(screen.getByRole("button", { name: "Generate three directions" }));
  expect(await screen.findByRole("heading", { name: "Courtyard" })).toBeInTheDocument();
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(payload.brief).toBe(brief); expect(payload.review_notes).toBe("Keep the tree");
  expect(payload.clarifications[0].answer).toBe("Riverbank");
  fireEvent.click(screen.getAllByRole("button", { name: "Add to concept board" })[0]);
  expect(screen.getByLabelText("Concept name")).toHaveValue("Courtyard");
  fireEvent.click(screen.getAllByRole("button", { name: "Select for drawing" })[0]);
  fireEvent.change(screen.getByLabelText("Drawing type"), { target: { value: "perspective" } });
  fireEvent.change(screen.getByLabelText(/Refinement for this drawing/), { target: { value: "More open" } });
  fireEvent.click(screen.getByRole("button", { name: "Generate concept drawing" }));
  expect(await screen.findByAltText(/AI concept study for Spine/)).toBeInTheDocument();
  const drawing = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(drawing.direction.title).toBe("Spine"); expect(drawing.drawing_type).toBe("perspective"); expect(drawing.refinement).toBe("More open");
  const saved = normalizeDraft(JSON.parse(localStorage.getItem(key)!));
  expect(saved.explorations).toHaveLength(2);
  expect(buildProjectNotes(saved)).toContain("image-test");
  expect(localStorage.getItem(key)).not.toContain("data:image");
  fireEvent.click(screen.getByRole("button", { name: "Brief & exercises" }));
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "New assignment" } });
  openConcepts();
  expect(screen.getByRole("button", { name: "Generate concept drawing" })).toBeDisabled();
  expect(JSON.parse(localStorage.getItem(key)!).explorations).toHaveLength(2);
});

it("discards canceled late results when leaving the panel", async () => {
  seed();
  let resolve!: (r: Response) => void;
  const fetchMock = vi.fn<(url: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(() => new Promise(done => { resolve = done; }));
  vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" />); openConcepts();
  fireEvent.click(screen.getByRole("button", { name: "Generate three directions" }));
  fireEvent.click(screen.getByRole("button", { name: "Brief & exercises" }));
  expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  await act(async () => resolve(new Response(JSON.stringify(result))));
  expect(JSON.parse(localStorage.getItem(key)!).explorations).toHaveLength(0);
});

it("shows backend errors without inventing directions", async () => {
  seed(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Configure backend API key" }), { status: 503 })));
  render(<StudioBrainstorm ownerId="guest" />); openConcepts();
  fireEvent.click(screen.getByRole("button", { name: "Generate three directions" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Configure backend API key");
  expect(JSON.parse(localStorage.getItem(key)!).explorations).toHaveLength(0);
});

it("opens visible image tools from architecture lessons without making an AI request", () => {
  const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
  render(<StudioBrainstorm ownerId="guest" learningMode />);
  fireEvent.click(screen.getByRole("button", { name: "Create concept images" }));
  expect(screen.getByRole("region", { name: "Generate images" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Exterior concept sketch" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Generate concept drawing" })).toBeDisabled();
  expect(fetchMock).not.toHaveBeenCalled();
});
