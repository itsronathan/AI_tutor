import { useState } from "react";
import { STUDIO_LESSONS, type LessonNotes } from "./lessons";
import { STUDY_GUIDES } from "./studyGuides";

export default function StudioLessons({ notes, onChange }: {
  notes: LessonNotes;
  onChange: (notes: LessonNotes) => void;
}) {
  const [selected, setSelected] = useState<string>(STUDIO_LESSONS[0].id);
  const lesson = STUDIO_LESSONS.find(item => item.id === selected)!;
  const note = notes[lesson.id] || { reflection: "", completed: false };
  const guide = STUDY_GUIDES[lesson.id];
  const completed = STUDIO_LESSONS.filter(item => notes[item.id]?.completed).length;
  function updateNote(patch: Partial<LessonNotes[string]>) {
    onChange({ ...notes, [lesson.id]: { ...note, ...patch } });
  }
  return <section aria-label="Architecture lessons">
    <p>{completed} of {STUDIO_LESSONS.length} exercises complete. Go at your own pace.</p>
    <nav className="studio-nav" aria-label="Architecture topics">
      {STUDIO_LESSONS.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id}
        onClick={() => setSelected(item.id)}>{item.title}</button>)}
    </nav>
    <article className="studio-card">
      <p className="studio-eyebrow">Learn · Try · Reflect</p>
      <h2>{lesson.title}</h2><p>{lesson.concept}</p>
      <h3>Example</h3><p>{lesson.example}</p>
      <h3>Try it</h3>
      <p className="studio-small">{lesson.id === "site" ? "No site or drawing experience needed. This is a first observation exercise, not a full site analysis." : `Allow about ${lesson.duration}, or take longer. Use the example or a familiar place.`}</p>
      <ol>{lesson.steps.map(step => <li key={step}>{step}</li>)}</ol>
      {guide && <details>
        <summary>Explore further</summary>
        <p>{guide.scope}</p>
        <ol>{guide.prompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ol>
        <h3>Read more</h3>
        <ul>{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
        <label htmlFor="lesson-research">Learning notes</label>
        <textarea id="lesson-research" rows={4} maxLength={8000} value={note.research || ""}
          onChange={event => updateNote({ research: event.target.value })} placeholder="New terms, source references, and questions." />
      </details>}
      <label htmlFor="lesson-reflection">Your reflection: {lesson.reflection}</label>
      <textarea id="lesson-reflection" rows={4} maxLength={4000} value={note.reflection}
        placeholder="What did you notice? What would you explore next?"
        onChange={event => updateNote({ reflection: event.target.value })} />
      <label className="studio-check"><input type="checkbox" checked={note.completed}
        onChange={event => updateNote({ completed: event.target.checked })} />I tried this exercise and reflected on it.</label>
    </article>
  </section>;
}
