// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import BriefPdfUpload from "./BriefPdfUpload";
import PromptExplorer from "./PromptExplorer";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const upload = () => fireEvent.change(screen.getByLabelText("Upload PDF"), { target: { files: [new File(["%PDF-"], "brief.pdf", { type: "application/pdf" })] } });

it("keeps earlier People responses accessible without a People lens", () => {
  render(<PromptExplorer notes={{ "people-arrival": "A welcoming threshold" }} onChange={vi.fn()} />);
  expect(screen.queryByRole("checkbox", { name: "People" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Previously saved People work"));
  expect(screen.getByText("A welcoming threshold")).toBeVisible();
});

it("previews PDF text and only replaces the brief on explicit use", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: "Design a pavilion.", warning: "Check tables." }))));
  const onImport = vi.fn();
  render(<BriefPdfUpload hasBrief onImport={onImport} />);
  upload();
  const use = await screen.findByRole("button", { name: "Replace brief with PDF text" });
  expect(onImport).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Check tables.");
  fireEvent.click(use);
  expect(onImport).toHaveBeenCalledWith("Design a pavilion.");
});

it("preserves existing work after a failed upload and ignores unmounted requests", async () => {
  const onImport = vi.fn();
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "No readable text found." }), { status: 422 }));
  vi.stubGlobal("fetch", fetchMock);
  const view = render(<BriefPdfUpload hasBrief onImport={onImport} />);
  upload();
  expect(await screen.findByRole("alert")).toHaveTextContent("No readable text");
  expect(onImport).not.toHaveBeenCalled();
  let resolve!: (value: Response) => void;
  fetchMock.mockImplementation(() => new Promise<Response>(done => { resolve = done; }));
  upload();
  const signal = fetchMock.mock.calls[1][1].signal;
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(new Response(JSON.stringify({ text: "Late result" }))));
  expect(onImport).not.toHaveBeenCalled();
});

it("shows multiple lenses together and allows an empty selection", () => {
  render(<PromptExplorer notes={{}} onChange={vi.fn()} />);
  expect(screen.queryByRole("checkbox", { name: "People" })).not.toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: "Movement" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Light" }));
  expect(screen.getByText("Work with an edge")).toBeInTheDocument();
  expect(screen.getByText("Move through light")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Site" }));
  expect(screen.queryByText("Work with an edge")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Light" }));
  expect(screen.getByText(/Choose a lens to begin/)).toBeInTheDocument();
});
