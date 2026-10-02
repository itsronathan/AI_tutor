import type { StudioDraft } from "./model";

export default function ConceptComparison({ draft, onChange }: {
  draft: StudioDraft;
  onChange: <K extends "comparisonIds" | "directionId" | "decisionNotes">(field: K, value: StudioDraft[K]) => void;
}) {
  const selected = draft.concepts.filter(concept => draft.comparisonIds.includes(concept.id));
  const direction = draft.concepts.find(concept => concept.id === draft.directionId);
  return <section className="studio-card studio-section" aria-label="Compare concepts">
    <h2>Compare your directions</h2>
    <p>Choose up to three cards. Look for trade-offs and questions to test; there is no automatic score.</p>
    {!draft.concepts.length && <p className="studio-empty">Add a concept card to start comparing.</p>}
    <div className="studio-choices">
      {draft.concepts.map((concept, index) => <label className="studio-check" key={concept.id}>
        <input type="checkbox" checked={draft.comparisonIds.includes(concept.id)}
          disabled={selected.length >= 3 && !draft.comparisonIds.includes(concept.id)}
          onChange={event => onChange("comparisonIds", event.target.checked
            ? [...draft.comparisonIds, concept.id] : draft.comparisonIds.filter(id => id !== concept.id))} />
        Compare {concept.title.trim() || `Concept ${index + 1}`}
      </label>)}
    </div>
    {selected.length > 0 && <div className="studio-table-scroll" tabIndex={0} role="region" aria-label="Concept comparison table">
      <table className="studio-table">
        <caption>Your ideas side by side</caption>
        <thead><tr><th scope="col">Consideration</th>{selected.map(concept => <th scope="col" key={concept.id}>{concept.title || "Untitled concept"}</th>)}</tr></thead>
        <tbody>
          {([ ["premise", "Connection to the brief"], ["moves", "Spatial moves"], ["experiment", "Next experiment"] ] as const).map(([key, label]) =>
            <tr key={key}><th scope="row">{label}</th>{selected.map(concept => <td key={concept.id}>{concept[key].trim() || "Still to explore"}</td>)}</tr>)}
          <tr><th scope="row">Choose a direction</th>{selected.map(concept => <td key={concept.id}>
            <button type="button" aria-pressed={draft.directionId === concept.id} onClick={() => onChange("directionId", concept.id)}>
              {draft.directionId === concept.id ? "Current direction" : "Develop this concept"}
            </button>
          </td>)}</tr>
        </tbody>
      </table>
    </div>}
    {direction && <p className="studio-selection">Current direction: <strong>{direction.title || "Untitled concept"}</strong>{" "}
      <button className="studio-secondary" type="button" onClick={() => onChange("directionId", "")}>Keep the choice open</button>
    </p>}
    <label htmlFor="studio-decision">What makes a direction worth pursuing?</label>
    <textarea id="studio-decision" rows={3} maxLength={4000} value={draft.decisionNotes}
      placeholder="Record strengths, trade-offs, and what you still need to test."
      onChange={event => onChange("decisionNotes", event.target.value)} />
  </section>;
}
