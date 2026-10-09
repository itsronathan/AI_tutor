// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudioBrainstorm from "../StudioBrainstorm";
import * as images from "./promptImages";
import { normalizeDraft } from "./model";
import { buildProjectNotes } from "./exportNotes";

const sketch = { id: "sketch-1", name: "arrival.png", data: "data:image/jpeg;base64,/9j/" };
const upload = () => fireEvent.change(screen.getByLabelText("Image for Follow an arrival"), { target: { files: [new File(["image"], "arrival.png", { type: "image/png" })] } });
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("attaches, restores, exports a reference, and removes a sketch without losing notes", async () => {
  vi.spyOn(images, "readSketch").mockResolvedValue(sketch);
  const view = render(<StudioBrainstorm ownerId="guest" />);
  fireEvent.change(screen.getByLabelText("Your response to “Follow an arrival”"), { target: { value: "Keep the welcoming entrance." } });
  upload();
  expect(await screen.findByAltText(/Sketch for Follow an arrival/)).toBeInTheDocument();
  const saved = normalizeDraft(JSON.parse(localStorage.getItem("studio-brainstorm:v1:guest")!));
  expect(buildProjectNotes(saved)).toContain("Follow an arrival: arrival.png");
  view.unmount();
  render(<StudioBrainstorm ownerId="guest" />);
  expect(screen.getByAltText(/Sketch for Follow an arrival/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Remove arrival.png" }));
  expect(screen.queryByAltText(/Sketch for Follow an arrival/)).not.toBeInTheDocument();
  expect(screen.getByLabelText("Your response to “Follow an arrival”")).toHaveValue("Keep the welcoming entrance.");
});

it("does not attach a late image to a different project", async () => {
  let resolve!: (value: images.PromptImage) => void;
  vi.spyOn(images, "readSketch").mockImplementation(() => new Promise(done => { resolve = done; }));
  render(<StudioBrainstorm ownerId="guest" />);
  upload();
  fireEvent.click(screen.getByRole("button", { name: "New project" }));
  await act(async () => resolve(sketch));
  expect(screen.queryByAltText(/Sketch for Follow an arrival/)).not.toBeInTheDocument();
});

it("rejects unsupported files and unsafe saved image URLs, and caps attachment count", async () => {
  await expect(images.readSketch(new File(["svg"], "image.svg", { type: "image/svg+xml" }))).rejects.toThrow("JPG");
  const draft = normalizeDraft({ promptImages: { "people-arrival": [
    { ...sketch, id: "bad", data: "https://example.com/image.jpg" },
    ...Array.from({ length: 8 }, (_, i) => ({ ...sketch, id: String(i) })),
  ] } });
  expect(draft.promptImages["people-arrival"].length).toBeLessThanOrEqual(6);
  expect(draft.promptImages["people-arrival"].some(image => image.id === "bad")).toBe(false);
});
