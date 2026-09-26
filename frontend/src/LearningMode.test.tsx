// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LearningMode from "./LearningMode";

vi.mock("./LearningModel", () => ({ default: () => <p>Existing textbook learning</p> }));
vi.mock("./context/AuthContext", () => ({ useAuth: () => ({ user: { uid: "student-a" }, loading: false }) }));
afterEach(() => { cleanup(); localStorage.clear(); });

it("keeps textbook learning as the default and switches to the signed-in Studio draft", () => {
  localStorage.setItem("studio-brainstorm:v1:student-a", JSON.stringify({ lessonNotes: { site: { reflection: "My site notes" } } }));
  render(<MemoryRouter initialEntries={["/learning"]}><LearningMode /></MemoryRouter>);
  expect(screen.getByText("Existing textbook learning")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Learning mode"), { target: { value: "architecture" } });
  expect(screen.getByLabelText(/^Your reflection:/)).toHaveValue("My site notes");
  expect(screen.queryByText("Existing textbook learning")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Learning mode"), { target: { value: "textbook" } });
  expect(screen.getByText("Existing textbook learning")).toBeInTheDocument();
});

it("opens architecture lessons directly from the course URL", () => {
  render(<MemoryRouter initialEntries={["/learning?course=architecture"]}><LearningMode /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Architectural Design Studio" })).toBeInTheDocument();
  expect(screen.getByLabelText("Learning mode")).toHaveValue("architecture");
});
