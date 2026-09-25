import { MAX_PRECEDENTS, type Precedent } from "./model";
import { referenceUrl } from "./links";

const FIELDS = [
  ["title", "Reference name", "Building, drawing, artwork, landscape, or reading"],
  ["source", "Source or citation", "Paste an http(s) link, or note the author, publication, and page"],
  ["observation", "What do you notice?", "Describe a specific spatial relationship or design move"],
  ["application", "What could you test in your project?", "Explain the principle you could explore and how your situation differs"],
] as const;

export default function PrecedentJournal({ precedents, onChange }: {
  precedents: Precedent[]; onChange: (value: Precedent[]) => void;
}) {
  return <section className="studio-card studio-section" aria-label="Reference journal">
    <h2>Precedent and inspiration journal</h2>
    <p>Keep a source and a specific observation alongside each reference. Links are provided by you and are not automatically verified.</p>
    {!precedents.length && <p className="studio-empty">Add a reference that helps you ask a better design question.</p>}
    <div className="studio-grid">{precedents.map((item, index) => <article key={item.id} className="studio-item">
      <h3>Reference {index + 1}</h3>
      {FIELDS.map(([field, label, placeholder]) => <div key={field}>
        <label htmlFor={`reference-${item.id}-${field}`}>{label}</label>
        <textarea id={`reference-${item.id}-${field}`} rows={field === "title" || field === "source" ? 1 : 3}
          maxLength={field === "title" ? 200 : field === "source" ? 1000 : 4000}
          value={item[field]} placeholder={placeholder}
          onChange={event => onChange(precedents.map(row => row.id === item.id ? { ...row, [field]: event.target.value } : row))} />
      </div>)}
      {referenceUrl(item.source) && <a className="studio-source-link" href={referenceUrl(item.source)!} target="_blank" rel="noopener noreferrer">Open reference {index + 1} ↗</a>}
      <button type="button" className="studio-secondary" onClick={() => {
        if (window.confirm(`Remove reference “${item.title || index + 1}”?`)) onChange(precedents.filter(row => row.id !== item.id));
      }}>Remove reference {index + 1}</button>
    </article>)}</div>
    <button type="button" disabled={precedents.length >= MAX_PRECEDENTS} onClick={() => onChange([
      ...precedents, { id: crypto.randomUUID(), title: "", source: "", observation: "", application: "" },
    ])}>Add reference</button>
    <p className="studio-small">{precedents.length} / {MAX_PRECEDENTS} references</p>
  </section>;
}
