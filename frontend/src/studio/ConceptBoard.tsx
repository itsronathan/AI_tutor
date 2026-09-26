import { MAX_CONCEPTS, type Concept } from "./model";

const FIELDS = [
  ["title", "Concept name", "A working title is enough."],
  ["premise", "Core idea and connection to the brief", "What are you exploring, and which need or requirement does it address?"],
  ["moves", "Possible spatial moves", "Describe arrangements, paths, thresholds, light, or material relationships."],
  ["experiment", "Next sketch or model experiment", "What small test could help you learn whether this idea works?"],
] as const;

export default function ConceptBoard({ concepts, onChange }: {
  concepts: Concept[]; onChange: (concepts: Concept[]) => void;
}) {
  return <section className="studio-card studio-section" aria-label="Concept board">
    <h2>Your concept board</h2>
    <p>Develop a few possibilities before settling on one. These cards contain your own ideas.</p>
    {!concepts.length && <p className="studio-empty">No concepts yet. Try a brainstorming exercise, then capture one direction here.</p>}
    <div className="studio-grid">
      {concepts.map((concept, index) => <article className="studio-item" key={concept.id}>
        <h3>Concept {index + 1}</h3>
        {FIELDS.map(([field, label, placeholder]) => <div key={field}>
          <label htmlFor={`concept-${concept.id}-${field}`}>{label}</label>
          <textarea id={`concept-${concept.id}-${field}`} rows={field === "title" ? 1 : 3}
            maxLength={field === "title" ? 200 : 4000} placeholder={placeholder} value={concept[field]}
            onChange={event => onChange(concepts.map(item => item.id === concept.id ? { ...item, [field]: event.target.value } : item))} />
        </div>)}
        <button type="button" className="studio-secondary" onClick={() => {
          if (window.confirm(`Remove concept “${concept.title || index + 1}” and its notes?`)) {
            onChange(concepts.filter(item => item.id !== concept.id));
          }
        }}>Remove concept {index + 1}</button>
      </article>)}
    </div>
    <button type="button" disabled={concepts.length >= MAX_CONCEPTS} onClick={() => onChange([
      ...concepts, { id: crypto.randomUUID(), title: "", premise: "", moves: "", experiment: "" },
    ])}>Add concept</button>
    <p className="studio-small">{concepts.length} / {MAX_CONCEPTS} concept cards</p>
  </section>;
}
