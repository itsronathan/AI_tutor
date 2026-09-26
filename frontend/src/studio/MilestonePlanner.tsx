import { MAX_MILESTONES, type Milestone } from "./model";
import { milestoneStatus } from "./dates";

const STARTERS = ["Read the brief and collect questions", "Explore the site and user needs", "Sketch three concept directions", "Test a direction in plan, section, or model", "Prepare questions and work for a critique"];

export default function MilestonePlanner({ milestones, onChange }: {
  milestones: Milestone[]; onChange: (value: Milestone[]) => void;
}) {
  function edit(id: string, patch: Partial<Milestone>) {
    onChange(milestones.map(item => item.id === id ? { ...item, ...patch } : item));
  }
  return <section className="studio-card studio-section" aria-label="Milestone planner">
    <h2>Break the project into milestones</h2>
    <p>Set your own dates from the course brief. Suggested milestones are editable starting points.</p>
    <p>{milestones.filter(item => item.done).length} of {milestones.length} complete</p>
    {!milestones.length && <button type="button" className="studio-secondary" onClick={() => onChange(STARTERS.map(title => ({
      id: crypto.randomUUID(), title, due: "", done: false,
    })))}>Use starter milestones</button>}
    {milestones.map((item, index) => <div className="studio-item studio-milestone" key={item.id}>
      <div>
        <label htmlFor={`milestone-${item.id}`}>Milestone {index + 1}</label>
        <input id={`milestone-${item.id}`} maxLength={200} value={item.title} onChange={event => edit(item.id, { title: event.target.value })} />
      </div>
      <div>
        <label htmlFor={`due-${item.id}`}>Due date for milestone {index + 1}</label>
        <input id={`due-${item.id}`} type="date" max="9999-12-31" value={item.due} onChange={event => edit(item.id, { due: event.target.value })} />
        <p className="studio-small">{milestoneStatus(item.due, item.done)}</p>
      </div>
      <label className="studio-check"><input type="checkbox" checked={item.done} onChange={event => edit(item.id, { done: event.target.checked })} />Complete milestone {index + 1}</label>
      <button type="button" className="studio-secondary" onClick={() => {
        if (window.confirm(`Remove milestone “${item.title || index + 1}”?`)) onChange(milestones.filter(row => row.id !== item.id));
      }}>Remove milestone {index + 1}</button>
    </div>)}
    <button type="button" disabled={milestones.length >= MAX_MILESTONES} onClick={() => onChange([
      ...milestones, { id: crypto.randomUUID(), title: "", due: "", done: false },
    ])}>Add milestone</button>
    <p className="studio-small">Up to {MAX_MILESTONES} milestones. Dates are shown in your local calendar.</p>
  </section>;
}
