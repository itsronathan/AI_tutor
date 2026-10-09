import type { StudioDraft } from "./model";
import { PROJECT_STAGES, projectTutorContext } from "./journey";
import AssignmentTutorPanel from "./AssignmentTutorPanel";

export default function ProjectTutor({ draft, onChange, onNavigate }: {
  draft: StudioDraft;
  onChange: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  onNavigate: (section: typeof PROJECT_STAGES[number]["tool"]) => void;
}) {
  const journey = draft.journey;
  const stage = PROJECT_STAGES.find(item => item.id === journey.stage)!;
  const index = PROJECT_STAGES.indexOf(stage);
  return <section aria-label="Project tutor">
    <h2>From brief to final review</h2>
    <p>Choose your stage. Work through one next step at a time.</p>
    <nav className="studio-nav" aria-label="Project stages">
      {PROJECT_STAGES.map((item, i) => <button type="button" key={item.id} aria-pressed={item.id === stage.id}
        onClick={() => onChange("journey", { ...journey, stage: item.id })}>{i + 1}. {item.title}{journey.completed.includes(item.id) ? " ✓" : ""}</button>)}
    </nav>
    <div className="studio-layout">
      <section className="studio-card">
        <h3>{stage.title}</h3><p>{stage.task}</p>
        <button type="button" onClick={() => onNavigate(stage.tool)}>Open {stage.tool}</button>
        <label htmlFor="journey-notes">Stage notes</label>
        <textarea id="journey-notes" rows={5} maxLength={4000} value={journey.notes[stage.id] || ""}
          placeholder="What did you try? What needs work?" onChange={e => onChange("journey", { ...journey, notes: { ...journey.notes, [stage.id]: e.target.value } })} />
        <label className="studio-check"><input type="checkbox" checked={journey.completed.includes(stage.id)}
          onChange={e => onChange("journey", { ...journey, completed: e.target.checked ? [...journey.completed, stage.id] : journey.completed.filter(id => id !== stage.id) })} />I’ve worked through this stage.</label>
        <p className="studio-small">{journey.completed.length} / {PROJECT_STAGES.length} stages checked by you. Revisit any stage.</p>
        {index < PROJECT_STAGES.length - 1 && <button type="button" className="studio-secondary" onClick={() => onChange("journey", { ...journey, stage: PROJECT_STAGES[index + 1].id })}>Next stage</button>}
      </section>
      <section className="studio-card">
        <p>AI uses your reviewed brief and notebook excerpts. Requests may incur API charges.</p>
        <details><summary>Notes shared with AI</summary><pre className="studio-export-preview">{projectTutorContext(draft)}</pre></details>
        {!draft.assignmentReview?.reviewed ? <>
          <p>Review your brief to unlock AI guidance. Stage notes work without AI.</p>
          <button type="button" onClick={() => onNavigate("Brief & exercises")}>Review assignment first</button>
        </> : <AssignmentTutorPanel key={stage.id} brief={draft.brief.trim()} review={draft.assignmentReview}
          onChange={value => onChange("assignmentReview", value)} projectContext={projectTutorContext(draft)}
          questionPrefix={`Project stage: ${stage.title}. `} suggestedQuestion={stage.question} />}
      </section>
    </div>
  </section>;
}
