import { MAX_CRITIQUES, type Critique } from "./model";
import { localToday } from "./dates";

export default function CritiqueLog({ critiques, onChange }: {
  critiques: Critique[]; onChange: (value: Critique[]) => void;
}) {
  function edit(id: string, patch: Partial<Critique>) {
    onChange(critiques.map(item => item.id === id ? { ...item, ...patch } : item));
  }
  return <section className="studio-card studio-section" aria-label="Critique log">
    <h2>Turn critique into a next step</h2>
    <p>Record feedback in your own words. Keep what was said separate from your interpretation and the experiment you choose to try.</p>
    <p>{critiques.filter(item => item.nextAction.trim() && !item.done).length} follow-up actions open</p>
    {!critiques.length && <p className="studio-empty">Use this after a desk critique, peer conversation, or review.</p>}
    {critiques.map((item, index) => <article className="studio-item" key={item.id}>
      <h3>Critique {index + 1}</h3>
      <div className="studio-grid">
        <div><label htmlFor={`critique-${item.id}-date`}>Date of critique {index + 1}</label>
          <input id={`critique-${item.id}-date`} type="date" max="9999-12-31" value={item.date} onChange={event => edit(item.id, { date: event.target.value })} /></div>
        <div><label htmlFor={`critique-${item.id}-reviewer`}>Reviewer or setting</label>
          <input id={`critique-${item.id}-reviewer`} value={item.reviewer} maxLength={200} placeholder="e.g. Peer review or desk critique" onChange={event => edit(item.id, { reviewer: event.target.value })} /></div>
      </div>
      {([ ["feedback", "Feedback received"], ["response", "Your interpretation or questions"], ["nextAction", "What will you try next?"] ] as const).map(([field, label]) => <div key={field}>
        <label htmlFor={`critique-${item.id}-${field}`}>{label}</label>
        <textarea id={`critique-${item.id}-${field}`} rows={3} maxLength={4000} value={item[field]}
          onChange={event => edit(item.id, { [field]: event.target.value })} />
      </div>)}
      <label className="studio-check"><input type="checkbox" checked={item.done}
        onChange={event => edit(item.id, { done: event.target.checked })} />Follow-up completed for critique {index + 1}</label>
      <button type="button" className="studio-secondary" onClick={() => {
        if (window.confirm(`Remove critique ${index + 1} and its notes?`)) onChange(critiques.filter(row => row.id !== item.id));
      }}>Remove critique {index + 1}</button>
    </article>)}
    <button type="button" disabled={critiques.length >= MAX_CRITIQUES} onClick={() => onChange([
      ...critiques, { id: crypto.randomUUID(), date: localToday(), reviewer: "", feedback: "", response: "", nextAction: "", done: false },
    ])}>Add critique</button>
    <p className="studio-small">{critiques.length} / {MAX_CRITIQUES} critique entries</p>
  </section>;
}
