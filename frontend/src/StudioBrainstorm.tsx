import { useRef, useState, type FormEvent } from "react";
import { loadDraft, normalizeDraft, type StudioDraft } from "./studio/model";
import ProjectContext from "./studio/ProjectContext";
import PromptExplorer from "./studio/PromptExplorer";
import ConceptBoard from "./studio/ConceptBoard";
import ConceptComparison from "./studio/ConceptComparison";
import PrecedentJournal from "./studio/PrecedentJournal";
import MilestonePlanner from "./studio/MilestonePlanner";
import CritiqueLog from "./studio/CritiqueLog";
import ProjectExport from "./studio/ProjectExport";
import PresentationPrep from "./studio/PresentationPrep";
import AssignmentTutorPanel from "./studio/AssignmentTutorPanel";
import StudioLessons from "./studio/StudioLessons";
import "./StudioBrainstorm.css";

const SECTIONS = ["Brief & exercises", "Learn", "Concepts", "References", "Plan", "Review & export"] as const;

export default function StudioBrainstorm({ ownerId, learningMode = false }: { ownerId: string; learningMode?: boolean }) {
  const storageKey = `studio-brainstorm:v1:${ownerId}`;
  const [initial] = useState(() => loadDraft(storageKey));
  const [draft, setDraft] = useState(initial.draft);
  const currentDraft = useRef(initial.draft);
  const [status, setStatus] = useState(initial.status);
  const [summary, setSummary] = useState<StudioDraft | null>(null);
  const [section, setSection] = useState<typeof SECTIONS[number]>(learningMode ? "Learn" : "Brief & exercises");

  function persist(next: StudioDraft, message: string) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStatus(message);
    } catch {
      setStatus("Browser storage is unavailable. Your notes are still here, but will be lost when you leave.");
    }
  }

  function update<K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) {
    const next = normalizeDraft({ ...currentDraft.current, [field]: value });
    currentDraft.current = next;
    setDraft(next);
    persist(next, "Changes saved in this browser.");
    setSummary(null);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.brief.trim()) {
      setStatus("Paste your assignment brief before saving.");
      return;
    }
    setSummary({ ...draft });
    persist(draft, "Draft saved in this browser.");
  }

  return (
    <main className="studio-page">
      <header className="studio-header">
        <p className="studio-eyebrow">Architecture · Early prototype</p>
        <h1>{learningMode ? "Architectural Design Studio" : "Studio Brainstorm"}</h1>
        <p>{learningMode ? "Learn a concept. Test it through a sketch or model. Reflect on your choices." : "Start with the brief. Find a question worth exploring."}</p>
      </header>
      <nav className="studio-nav" aria-label="Studio tools">
        {SECTIONS.map(label => <button type="button" key={label} aria-pressed={section === label}
          onClick={() => setSection(label)}>{label}</button>)}
      </nav>
      <p className="studio-status" role="status">{status}</p>
      <p className="studio-small">Edits save automatically in this browser only; not synced to your account. Guest drafts are shared by people using this browser.</p>
      {section === "Learn" && <StudioLessons draft={draft} onChange={update} onOpenBrief={() => setSection("Brief & exercises")} />}
      {section === "Brief & exercises" && <>
      <div className="studio-layout">
        <form className="studio-card" onSubmit={save}>
          <h2>Set up your project</h2>
          <p>You don’t need a concept yet. Capture what you know and leave the rest open.</p>
          <label htmlFor="studio-title">Project or course name <span>(optional)</span></label>
          <input id="studio-title" value={draft.title} maxLength={200}
            placeholder="e.g. Design Studio — Community gathering space"
            onChange={event => update("title", event.target.value)} />
          <label htmlFor="studio-brief">Assignment brief <span>(required)</span></label>
          <p id="studio-brief-help">Paste the assignment, including any site, users, required spaces, and deliverables. PDF upload will come later. Changing the brief clears its AI review, clarification answers, and conversation.</p>
          <textarea id="studio-brief" required rows={9} maxLength={30000}
            aria-describedby="studio-brief-help" value={draft.brief}
            onChange={event => update("brief", event.target.value)} />
          <AssignmentTutorPanel brief={draft.brief.trim()} review={draft.assignmentReview} onChange={value => update("assignmentReview", value)} />
          <label htmlFor="studio-interests">What catches your interest? <span>(optional)</span></label>
          <textarea id="studio-interests" rows={3} maxLength={4000} value={draft.interests}
            placeholder="A site detail, a material, a memory, a question — or simply ‘I’m not sure yet.’"
            onChange={event => update("interests", event.target.value)} />
          <label htmlFor="studio-experience">What might someone experience here? <span>(optional)</span></label>
          <textarea id="studio-experience" rows={3} maxLength={4000} value={draft.experience}
            placeholder="Think about arrival, movement, gathering, or finding a quiet place. It’s okay to leave this open."
            onChange={event => update("experience", event.target.value)} />
          <ProjectContext draft={draft} onChange={update} />
          <button type="submit">Save project draft</button>
        </form>
        <aside className="studio-side">
          <PromptExplorer notes={draft.promptNotes} onChange={value => update("promptNotes", value)} />
          <section className="studio-card">
            <h2>A workspace for your ideas</h2>
            <p>Use Concepts to develop and compare directions, References to collect inspiration, and Plan to set your next steps. Prepare for critiques in Review &amp; export.</p>
            <p className="studio-small">The exercises here are written prompts. Use Analyze assignment to review the brief with AI before asking the assignment tutor for help. PDF upload is not available yet.</p>
          </section>
        </aside>
      </div>
      {summary && <section className="studio-card studio-summary" aria-label="Project starting point">
        <h2>{summary.title.trim() || "Your project starting point"}</h2>
        <h3>Assignment brief</h3><p>{summary.brief}</p>
        <h3>Your interests</h3><p>{summary.interests.trim() || "Still open — explore through sketches."}</p>
        <h3>Intended experience</h3><p>{summary.experience.trim() || "Still open — start with one person’s journey."}</p>
      </section>}
      </>}
      {section === "Concepts" && <>
        <ConceptBoard concepts={draft.concepts} onChange={value => update("concepts", value)} />
        <ConceptComparison draft={draft} onChange={update} />
      </>}
      {section === "References" && <PrecedentJournal precedents={draft.precedents} onChange={value => update("precedents", value)} />}
      {section === "Plan" && <MilestonePlanner milestones={draft.milestones} onChange={value => update("milestones", value)} />}
      {section === "Review & export" && <>
        <PresentationPrep draft={draft} onChange={update} />
        <CritiqueLog critiques={draft.critiques} onChange={value => update("critiques", value)} />
        <ProjectExport draft={draft} />
      </>}
    </main>
  );
}
