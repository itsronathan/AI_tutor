import { MAX_PRESENTATION_ITEMS, type StudioDraft } from "./model";

const SUGGESTIONS = [
  "Explain the project question and connection to the brief",
  "Show the site and the people the project serves",
  "Select drawings or models that explain the spatial idea",
  "Show an experiment and what changed because of it",
  "Credit references and check drawing labels / scales where relevant",
  "Identify unresolved questions for the review",
];

export default function PresentationPrep({ draft, onChange }: {
  draft: StudioDraft;
  onChange: <K extends "presentationItems" | "presentationStory" | "reviewQuestions">(field: K, value: StudioDraft[K]) => void;
}) {
  const items = draft.presentationItems;
  return <section className="studio-card studio-section" aria-label="Presentation preparation">
    <h2>Prepare for your pin-up</h2>
    <p>Build a checklist from your actual assignment. The starter list is a suggestion, not an instructor’s rubric.</p>
    {draft.requirements.trim() && <details className="studio-context"><summary>Review your recorded assignment requirements</summary><p className="studio-preserve">{draft.requirements}</p></details>}
    <label htmlFor="studio-story">Your short project story</label>
    <textarea id="studio-story" rows={4} maxLength={4000} value={draft.presentationStory}
      placeholder="What question are you exploring? What spatial move expresses it? What evidence can you show?"
      onChange={event => onChange("presentationStory", event.target.value)} />
    <label htmlFor="studio-review-questions">What feedback would help you most?</label>
    <textarea id="studio-review-questions" rows={3} maxLength={4000} value={draft.reviewQuestions}
      placeholder="Write specific questions to bring to the review."
      onChange={event => onChange("reviewQuestions", event.target.value)} />
    <h3>Your presentation checklist</h3>
    <p>{items.filter(item => item.done).length} of {items.length} ready</p>
    {!items.length && <button type="button" className="studio-secondary" onClick={() => onChange("presentationItems", SUGGESTIONS.map(label => ({
      id: crypto.randomUUID(), label, done: false,
    })))}>Use suggested checklist</button>}
    {items.map((item, index) => <div className="studio-item" key={item.id}>
      <label htmlFor={`presentation-${item.id}`}>Presentation item {index + 1}</label>
      <input id={`presentation-${item.id}`} maxLength={300} value={item.label}
        onChange={event => onChange("presentationItems", items.map(row => row.id === item.id ? { ...row, label: event.target.value } : row))} />
      <label className="studio-check"><input type="checkbox" checked={item.done}
        onChange={event => onChange("presentationItems", items.map(row => row.id === item.id ? { ...row, done: event.target.checked } : row))} />Ready: presentation item {index + 1}</label>
      <button type="button" className="studio-secondary" onClick={() => {
        if (window.confirm(`Remove presentation item ${index + 1}?`)) onChange("presentationItems", items.filter(row => row.id !== item.id));
      }}>Remove presentation item {index + 1}</button>
    </div>)}
    <button type="button" disabled={items.length >= MAX_PRESENTATION_ITEMS} onClick={() => onChange("presentationItems", [
      ...items, { id: crypto.randomUUID(), label: "", done: false },
    ])}>Add presentation item</button>
    <p className="studio-small">Up to {MAX_PRESENTATION_ITEMS} items.</p>
  </section>;
}
