// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StudioBrainstorm from "../StudioBrainstorm";

const brief = "Design a community pavilion. Submit two sections by October 20.";
const analysis = {
  source_brief: brief, summary: "A pavilion explored through sections.",
  requirements: [{ category: "deliverable", requirement: "Submit two sections.", quote: "Submit two sections by October 20." }],
  questions: [{ question: "Which site should be used?", reason: "A site is not specified.", ask: "instructor" }],
};
const reply = { answer: "Try sections that compare open and sheltered gathering spaces.", supporting_quotes: ["Submit two sections by October 20."], remaining_questions: [] };
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function enterBrief() {
  fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: brief } });
}

describe("assignment tutor workflow", () => {
  it("reviews requirements before follow-up, sends clarifications, and restores the conversation", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response(analysis)).mockResolvedValueOnce(response(reply));
    vi.stubGlobal("fetch", fetchMock);
    const first = render(<StudioBrainstorm ownerId="guest" />);
    expect(screen.getByRole("button", { name: "Analyze assignment" })).toBeDisabled();
    enterBrief();
    fireEvent.click(screen.getByRole("button", { name: "Analyze assignment" }));
    expect(await screen.findByText(analysis.summary)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ask assignment tutor" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Corrections or additional context"), { target: { value: "The instructor approved a riverside site." } });
    fireEvent.click(screen.getByRole("checkbox", { name: "I have reviewed these requirements against my assignment." }));
    fireEvent.change(screen.getByLabelText("Which site should be used?"), { target: { value: "The riverbank" } });
    fireEvent.change(screen.getByLabelText("Your question for the assignment tutor"), { target: { value: "What should I sketch first?" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask assignment tutor" }));
    expect(await screen.findByText(reply.answer)).toBeInTheDocument();
    const payload = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(payload.brief).toBe(brief);
    expect(payload.analysis).toEqual(analysis);
    expect(payload.reviewed).toBe(true);
    expect(payload.review_notes).toContain("riverside");
    expect(payload.clarifications).toEqual([{ question: "Which site should be used?", answer: "The riverbank" }]);
    first.unmount();
    render(<StudioBrainstorm ownerId="guest" />);
    expect(screen.getByText(reply.answer)).toBeInTheDocument();
    expect(screen.getByLabelText("Which site should be used?")).toHaveValue("The riverbank");
    fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "A new library assignment" } });
    expect(screen.queryByText(reply.answer)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze assignment" })).toBeEnabled();
    expect(JSON.parse(localStorage.getItem("studio-brainstorm:v1:guest")!).assignmentReview).toBeNull();
  });

  it("keeps other draft edits made while an analysis request is pending", async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(done => { resolve = done; })));
    render(<StudioBrainstorm ownerId="guest" />);
    enterBrief();
    fireEvent.click(screen.getByRole("button", { name: "Analyze assignment" }));
    fireEvent.change(screen.getByLabelText(/What catches your interest/), { target: { value: "Courtyard light" } });
    await act(async () => { resolve(response(analysis)); });
    expect(await screen.findByText(analysis.summary)).toBeInTheDocument();
    expect(screen.getByLabelText(/What catches your interest/)).toHaveValue("Courtyard light");
    expect(JSON.parse(localStorage.getItem("studio-brainstorm:v1:guest")!).interests).toBe("Courtyard light");
  });

  it("discards an old response if the assignment changes while it is being analyzed", async () => {
    let resolve!: (value: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>(done => { resolve = done; }));
    vi.stubGlobal("fetch", fetchMock);
    render(<StudioBrainstorm ownerId="guest" />);
    enterBrief();
    fireEvent.click(screen.getByRole("button", { name: "Analyze assignment" }));
    fireEvent.change(screen.getByLabelText(/Assignment brief/), { target: { value: "A different assignment" } });
    await act(async () => { resolve(response(analysis)); });
    expect(screen.queryByText(analysis.summary)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Assignment brief/)).toHaveValue("A different assignment");
    expect(screen.getByRole("button", { name: "Analyze assignment" })).toBeEnabled();
  });

  it("shows configuration errors without pretending the assignment was analyzed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ detail: "Studio AI is not configured. Set a valid OPENAI_API_KEY on the backend." }, 503)));
    render(<StudioBrainstorm ownerId="guest" />);
    enterBrief();
    fireEvent.click(screen.getByRole("button", { name: "Analyze assignment" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Studio AI is not configured");
    expect(screen.queryByText("Assignment summary")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Analyze assignment" })).toBeEnabled());
  });
});
