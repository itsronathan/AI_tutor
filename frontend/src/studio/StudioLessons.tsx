import { useState } from "react";
import { STUDIO_LESSONS, type LessonNotes } from "./lessons";
import type { StudioDraft } from "./model";
import AssignmentTutorPanel from "./AssignmentTutorPanel";
import { STUDY_GUIDES } from "./studyGuides";

export default function StudioLessons({ draft, onChange, onOpenBrief, onOpenConcepts }: {
  draft: StudioDraft;
  onChange: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  onOpenBrief: () => void;
  onOpenConcepts: () => void;
}) {
  const [selected, setSelected] = useState<string>(STUDIO_LESSONS[0].id);
  const lesson = STUDIO_LESSONS.find(item => item.id === selected)!;
  const note = draft.lessonNotes[lesson.id] || { reflection: "", completed: false };
  const guide = STUDY_GUIDES[lesson.id];
  const completed = STUDIO_LESSONS.filter(item => draft.lessonNotes[item.id]?.completed).length;
  const reviewed = draft.assignmentReview?.reviewed;
  function updateNote(patch: Partial<LessonNotes[string]>) {
    onChange("lessonNotes", { ...draft.lessonNotes, [lesson.id]: { ...note, ...patch } });
  }
  return <section aria-label="Architecture lessons">
    <p>Pick a topic and try an exercise. General guidance, not course requirements.</p>
    <p>{completed} of {STUDIO_LESSONS.length} exercises complete. Self-tracked, not graded.</p>
    <nav className="studio-nav" aria-label="Architecture topics">
      {STUDIO_LESSONS.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id}
        onClick={() => setSelected(item.id)}>{item.title}</button>)}
    </nav>
    <div className="studio-layout">
      <article className="studio-card">
        <p className="studio-eyebrow">Learn · Try · Reflect</p>
        <h2>{lesson.title}</h2><p>{lesson.concept}</p>
        <h3>Example</h3><p>{lesson.example}</p>
        <h3>Try it · About {lesson.duration}</h3>
        <ol>{lesson.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <h3>Your assignment</h3><p>{lesson.connection}</p>
        {guide && <section aria-label="Project study worksheet">
          <h3>Project worksheet</h3><p>{guide.scope}</p>
          <ol>{guide.prompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ol>
          <h4>Official starting sources</h4>
          <ul>{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
          <p className="studio-small">Source links checked September 29, 2026. Verify current editions and applicability for your project.</p>
          <label htmlFor="lesson-research">Working notes and source evidence</label>
          <textarea id="lesson-research" rows={7} maxLength={8000} value={note.research || ""} onChange={event => updateNote({ research: event.target.value })} placeholder="Record findings, source sections, assumptions, design changes, and questions to verify." />
          <p className="studio-small">Saved and exported. Paste relevant notes into tutor questions.</p>
        </section>}
        <label htmlFor="lesson-reflection">Your reflection: {lesson.reflection}</label>
        <textarea id="lesson-reflection" rows={5} maxLength={4000} value={note.reflection}
          placeholder="Describe your sketch or model, what you noticed, and what to try next."
          onChange={event => updateNote({ reflection: event.target.value })} />
        <label className="studio-check"><input type="checkbox" checked={note.completed}
          onChange={event => updateNote({ completed: event.target.checked })} />I tried this exercise and reflected on it.</label>
        <p className="studio-small">Saved and exported. Revisit reflections when your brief changes.</p>
      </article>
      <aside className="studio-card">
        <h2>Apply to your project</h2>
        <p>{reviewed ? `Using the reviewed assignment for ${draft.title.trim() || "your Studio project"}.` : "Lessons work without AI. Review your brief for project-specific tutoring."}</p>
        <button type="button" className="studio-secondary" onClick={onOpenBrief}>Open assignment brief</button>
        <h3>Explore your idea visually</h3>
        <p>Create diagrams and concept sketches from a reviewed brief.</p>
        <button type="button" className="studio-secondary" onClick={onOpenConcepts}>Create concept images</button>
        {reviewed && <>
          <p className="studio-small">The tutor receives this lesson, exercise, brief, corrections, and answers. Add reflections to your question yourself.</p>
          <AssignmentTutorPanel key={lesson.id} brief={draft.brief.trim()} review={draft.assignmentReview}
            questionPrefix={`Learning topic: ${lesson.title}. Concept: ${lesson.concept}\nExercise: ${lesson.steps.join(" ")}\nHelp me learn through an explanation, a small sketch/model experiment, and a reflection question. Distinguish suggestions from requirements. ${guide ? "Do not certify compliance or invent code limits, citations, measurements, or simulation results. Identify missing jurisdiction, edition, and project conditions when relevant; request the applicable source excerpt before interpreting a specific rule." : ""}\nMy question: `}
            onChange={value => onChange("assignmentReview", value)} />
        </>}
      </aside>
    </div>
  </section>;
}
