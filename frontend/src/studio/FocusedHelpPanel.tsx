import { normalizeDraft, type StudioDraft } from "./model";
import { HELP_TOPICS, focusedHelpContext } from "./focusedHelp";
import AssignmentTutorPanel from "./AssignmentTutorPanel";

export default function FocusedHelpPanel({ draft, onChange, onOpenBrief }: {
  draft: StudioDraft;
  onChange: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  onOpenBrief: () => void;
}) {
  // Also tolerate an older draft retained by a running development preview.
  const current = draft.focusedHelp ? draft : normalizeDraft(draft);
  const focus = current.focusedHelp;
  const topic = HELP_TOPICS.find(item => item.id === focus.topic)!;
  const note = focus.notes[topic.id] || { issue: "", details: "" };
  const context = focusedHelpContext(current);
  const updateNote = (field: "issue" | "details", value: string) => onChange("focusedHelp", { ...focus, notes: { ...focus.notes, [topic.id]: { ...note, [field]: value } } });
  return <section aria-label="Focused design help">
    <h2>One issue. Your existing concept.</h2>
    <p>Choose a topic and describe where you’re stuck.</p>
    <nav className="studio-nav" aria-label="Help topics">
      {HELP_TOPICS.map(item => <button type="button" key={item.id} aria-pressed={topic.id === item.id}
        onClick={() => onChange("focusedHelp", { ...focus, topic: item.id })}>{item.title}</button>)}
    </nav>
    <div className="studio-layout">
      <section className="studio-card">
        <label htmlFor="focus-concept">Concept to work with</label>
        <select id="focus-concept" value={focus.conceptId} onChange={e => onChange("focusedHelp", { ...focus, conceptId: e.target.value })}>
          <option value="">{draft.directionId ? "Use my current direction" : "Describe my concept below"}</option>
          {draft.concepts.map(item => <option key={item.id} value={item.id}>{item.title || "Untitled concept"}</option>)}
        </select>
        <label htmlFor="focus-description">Your concept / what to keep</label>
        <textarea id="focus-description" rows={3} maxLength={4000} value={focus.concept} placeholder="Describe your idea, even if it isn't on the concept board."
          onChange={e => onChange("focusedHelp", { ...focus, concept: e.target.value })} />
        <label htmlFor="focus-issue">What do you need help with?</label>
        <textarea id="focus-issue" rows={3} maxLength={2000} value={note.issue} onChange={e => updateNote("issue", e.target.value)} />
        <label htmlFor="focus-details">{topic.label}</label>
        <textarea id="focus-details" rows={5} maxLength={6000} value={note.details} placeholder={topic.hint} onChange={e => updateNote("details", e.target.value)} />
        {topic.id === "programming" && <p className="studio-small">Space programming means rooms, activities, areas, and adjacencies.</p>}
      </section>
      <section className="studio-card">
        <p>AI receives your brief, concept, and note excerpts. API charges may apply.</p>
        {(topic.id === "zoning" || topic.id === "accessibility") && <p className="studio-small">Provide the applicable source. No live code lookup or compliance approval.</p>}
        <details><summary>Notes shared with AI</summary><pre className="studio-export-preview">{context}</pre></details>
        {!draft.assignmentReview?.reviewed ? <>
          <p>Review your assignment to unlock AI help. Your topic notes save without AI.</p>
          <button type="button" onClick={onOpenBrief}>Review assignment first</button>
        </> : <AssignmentTutorPanel key={`${topic.id}:${focus.conceptId}:${draft.directionId}`} brief={draft.brief.trim()} review={draft.assignmentReview}
          onChange={value => onChange("assignmentReview", value)} projectContext={context} helpTopic={topic.id}
          questionPrefix={`Focused help — ${topic.title}. `} suggestedQuestion={topic.question} />}
      </section>
    </div>
  </section>;
}
