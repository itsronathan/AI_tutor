import { useState } from "react";
import { STUDIO_LESSONS, type LessonNotes } from "./lessons";
import type { StudioDraft } from "./model";
import AssignmentTutorPanel from "./AssignmentTutorPanel";

export default function StudioLessons({ draft, onChange, onOpenBrief }: {
  draft: StudioDraft;
  onChange: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  onOpenBrief: () => void;
}) {
  const [selected, setSelected] = useState<string>(STUDIO_LESSONS[0].id);
  const lesson = STUDIO_LESSONS.find(item => item.id === selected)!;
  const note = draft.lessonNotes[lesson.id];
  const completed = STUDIO_LESSONS.filter(item => draft.lessonNotes[item.id]?.completed).length;
  const reviewed = draft.assignmentReview?.reviewed;
  function updateNote(patch: Partial<LessonNotes[string]>) {
    onChange("lessonNotes", { ...draft.lessonNotes, [lesson.id]: { ...note, ...patch } });
  }
  return <section aria-label="Architecture lessons">
    <p>Short introductory lessons with optional studio exercises. These are general learning materials, not an RPI syllabus or assignment requirements.</p>
    <p>{completed} of {STUDIO_LESSONS.length} exercises marked complete by you. This is a personal checklist, not a grade.</p>
    <nav className="studio-nav" aria-label="Architecture topics">
      {STUDIO_LESSONS.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id}
        onClick={() => setSelected(item.id)}>{item.title}</button>)}
    </nav>
    <div className="studio-layout">
      <article className="studio-card">
        <p className="studio-eyebrow">Learn · Try · Reflect</p>
        <h2>{lesson.title}</h2><p>{lesson.concept}</p>
        <h3>A possible example</h3><p>{lesson.example}</p>
        <h3>Try it · About {lesson.duration}</h3>
        <ol>{lesson.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <h3>Connect it to your assignment</h3><p>{lesson.connection}</p>
        <label htmlFor="lesson-reflection">Your reflection: {lesson.reflection}</label>
        <textarea id="lesson-reflection" rows={5} maxLength={4000} value={note.reflection}
          placeholder="Describe your sketch or model, what you noticed, and what to try next."
          onChange={event => updateNote({ reflection: event.target.value })} />
        <label className="studio-check"><input type="checkbox" checked={note.completed}
          onChange={event => updateNote({ completed: event.target.checked })} />I tried this exercise and reflected on it.</label>
        <p className="studio-small">Reflections are saved with your Studio project and included in its notebook export. They stay here when you edit the brief; revisit them if requirements change.</p>
      </article>
      <aside className="studio-card">
        <h2>Apply this lesson to your project</h2>
        <p>{reviewed ? `Using the reviewed assignment for ${draft.title.trim() || "your Studio project"}.` : "You can use every lesson without AI. To get assignment-specific help, paste and review your brief in Studio first."}</p>
        <button type="button" className="studio-secondary" onClick={onOpenBrief}>Open assignment brief</button>
        {reviewed && <>
          <p className="studio-small">Your question will include the selected lesson and exercise. Your saved brief, corrections, and clarification answers provide the assignment context. Reflections are not sent automatically; include any observations you want to discuss in your question.</p>
          <AssignmentTutorPanel key={lesson.id} brief={draft.brief.trim()} review={draft.assignmentReview}
            questionPrefix={`Learning topic: ${lesson.title}. Concept: ${lesson.concept}\nExercise: ${lesson.steps.join(" ")}\nHelp me learn through an explanation, a small sketch/model experiment, and a reflection question. Distinguish suggestions from requirements.\nMy question: `}
            onChange={value => onChange("assignmentReview", value)} />
        </>}
      </aside>
    </div>
  </section>;
}
