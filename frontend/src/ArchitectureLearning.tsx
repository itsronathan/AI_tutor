import { useState } from "react";
import StudioLessons from "./studio/StudioLessons";
import { normalizeDraft } from "./studio/model";
import { STUDIO_LESSONS, type LessonNotes } from "./studio/lessons";
import "./StudioBrainstorm.css";

export default function ArchitectureLearning({ ownerId }: { ownerId: string }) {
  return <LearningWorkspace key={ownerId} ownerId={ownerId} />;
}

function LearningWorkspace({ ownerId }: { ownerId: string }) {
  const storageKey = `architecture-learning:v1:${ownerId}`;
  const [initial] = useState(() => {
    try {
      return { notes: normalizeDraft({ lessonNotes: JSON.parse(localStorage.getItem(storageKey) || "{}") }).lessonNotes, error: "" };
    } catch {
      return { notes: normalizeDraft({}).lessonNotes, error: "Saved learning notes could not be loaded. Download your notes before leaving." };
    }
  });
  const [notes, setNotes] = useState(initial.notes);
  const [error, setError] = useState(initial.error);
  function save(next: LessonNotes) {
    setNotes(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setError("");
    } catch {
      setError("Notes could not be saved in this browser. Download them before leaving.");
    }
  }
  function download() {
    const text = ["ARCHITECTURE LEARNING NOTES", ...STUDIO_LESSONS.map(lesson => {
      const note = notes[lesson.id];
      return `${lesson.title}\nSelf-marked complete: ${note?.completed ? "Yes" : "No"}\nReflection: ${note?.reflection || ""}\nLearning notes: ${note?.research || ""}`;
    })].join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "architecture-learning-notes.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="studio-page">
    <header className="studio-header"><div className="studio-header-copy">
      <p className="studio-eyebrow">Learning Mode</p>
      <h1>Learn architecture</h1>
      <p>Explore a topic, try a small exercise, and reflect. No project or assignment needed.</p>
      <a href="/studio">Open Studio for project help →</a>
    </div></header>
    <StudioLessons notes={notes} onChange={save} />
    <p className="studio-small">Learning notes stay in this browser, separate from your Studio projects. Earlier project reflections remain in project exports.</p>
    {error && <p role="alert">{error}</p>}
    <button type="button" className="studio-secondary" onClick={download}>Download learning notes</button>
  </main>;
}
