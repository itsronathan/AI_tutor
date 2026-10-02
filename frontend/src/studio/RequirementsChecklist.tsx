import type { StudioDraft, RequirementItem } from "./model";

export default function RequirementsChecklist({ draft, onChange }: { draft: StudioDraft; onChange: (items: RequirementItem[]) => void }) {
  const items = draft.requirementItems;
  function edit(id: string, change: Partial<RequirementItem>) { onChange(items.map(item => item.id === id ? { ...item, ...change } : item)); }
  const imported = draft.assignmentReview?.reviewed ? draft.assignmentReview.analysis.requirements.filter(r => !items.some(i => i.sourceBrief === draft.brief && i.quote === r.quote && i.label === r.requirement)) : [];
  return <section className="studio-card studio-section" aria-label="Requirements checklist">
    <h2>Assignment requirements checklist</h2>
    <p>Record requirements from your brief, link them to a concept or deliverable, and check your progress. Completion is your own assessment.</p>
    <p>{items.filter(i => i.done).length} of {items.length} marked complete</p>
    {items.map((item, index) => <article className="studio-item" key={item.id}>
      <label htmlFor={`requirement-${item.id}`}>Requirement {index + 1}</label>
      <textarea id={`requirement-${item.id}`} value={item.label} maxLength={1000} onChange={e => edit(item.id, { label: e.target.value })} />
      {item.quote && <blockquote>{item.quote}</blockquote>}
      <p className="studio-small">{item.quote ? "Imported from reviewed AI analysis; check against the brief." : "Student-entered requirement."}</p>
      {item.sourceBrief !== draft.brief && <p className="studio-error">The brief has changed. Recheck this requirement and its completion status.</p>}
      <label htmlFor={`link-${item.id}`}>Related concept for requirement {index + 1}</label>
      <select id={`link-${item.id}`} value={item.conceptId} onChange={e => edit(item.id, { conceptId: e.target.value })}>
        <option value="">No concept linked</option>
        {draft.concepts.map(c => <option key={c.id} value={c.id}>{c.title || "Untitled concept"}</option>)}
      </select>
      <label htmlFor={`evidence-${item.id}`}>Deliverable or evidence for requirement {index + 1}</label>
      <input id={`evidence-${item.id}`} value={item.evidence} maxLength={1000} placeholder="e.g. Show the arrival route in the floor plan" onChange={e => edit(item.id, { evidence: e.target.value })} />
      <label className="studio-check"><input type="checkbox" checked={item.done} onChange={e => edit(item.id, { done: e.target.checked })} />Complete requirement {index + 1}</label>
      {item.sourceBrief !== draft.brief && <button type="button" onClick={() => edit(item.id, { sourceBrief: draft.brief, done: false })}>I rechecked this requirement</button>}
      <button type="button" className="studio-secondary" onClick={() => onChange(items.filter(i => i.id !== item.id))}>Remove requirement {index + 1}</button>
    </article>)}
    <button type="button" disabled={items.length >= 80} onClick={() => onChange([...items, { id: crypto.randomUUID(), label: "", done: false, conceptId: "", evidence: "", quote: "", sourceBrief: draft.brief }])}>Add requirement</button>
    <button type="button" disabled={!imported?.length || items.length >= 80} onClick={() => onChange([...items, ...imported!.map(r => ({ id: crypto.randomUUID(), label: r.requirement, quote: r.quote, sourceBrief: draft.brief, done: false, conceptId: "", evidence: "" }))].slice(0, 80))}>Import reviewed requirements</button>
    <p className="studio-small">Up to 80 items. Import becomes available after you review an AI assignment analysis. Existing items are kept.</p>
  </section>;
}
