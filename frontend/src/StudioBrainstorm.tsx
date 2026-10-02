import { useRef, useState, type FormEvent } from "react";
import { normalizeDraft, type StudioDraft } from "./studio/model";
import { loadProjects, MAX_PROJECTS, type ProjectLibrary } from "./studio/projects";
import RequirementsChecklist from "./studio/RequirementsChecklist";
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
import CoursePreset from "./studio/CoursePresetPanel";
import InspirationPanel from "./studio/InspirationPanel";
import "./StudioBrainstorm.css";

const SECTIONS = ["Brief & exercises", "Learn", "Concepts", "References", "Plan", "Review & export"] as const;

export default function StudioBrainstorm({ ownerId, learningMode = false }: { ownerId: string; learningMode?: boolean }) {
  return <StudioWorkspace key={ownerId} ownerId={ownerId} learningMode={learningMode} />;
}

function StudioWorkspace({ ownerId, learningMode }: { ownerId: string; learningMode: boolean }) {
  const storageKey = `studio-brainstorm:v1:${ownerId}`;
  const [initial] = useState(() => loadProjects(storageKey));
  const [library, setLibrary] = useState(initial.library);
  const libraryRef = useRef(initial.library);
  const initialDraft = initial.library.projects.find(p => p.id === initial.library.activeId)!.draft;
  const [draft, setDraft] = useState(initialDraft);
  const currentDraft = useRef(initialDraft);
  const [undo, setUndo] = useState<{ message: string; restore: () => void } | null>(null);
  const sectionStart = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(initial.status);
  const [summary, setSummary] = useState<StudioDraft | null>(null);
  const [section, setSection] = useState<typeof SECTIONS[number]>(learningMode ? "Learn" : "Brief & exercises");

  function persistLibrary(next: ProjectLibrary, message: string) {
    libraryRef.current = next;
    setLibrary(next);
    try {
      localStorage.setItem(`${storageKey}:projects`, JSON.stringify(next));
      // Keep the previous single-draft format as a recovery copy.
      localStorage.setItem(storageKey, JSON.stringify(next.projects.find(p => p.id === next.activeId)!.draft));
      setStatus(message);
    } catch {
      setStatus("Browser storage is unavailable. Your notes are still here, but will be lost when you leave.");
    }
  }

  function persist(next: StudioDraft, message: string) {
    const current = libraryRef.current;
    persistLibrary({ ...current, projects: current.projects.map(p => p.id === current.activeId ? { ...p, draft: next } : p) }, message);
  }

  function openProject(id: string) {
    const next = libraryRef.current.projects.find(p => p.id === id);
    if (!next) return;
    currentDraft.current = next.draft; setDraft(next.draft); setSummary(null); setUndo(null);
    setSection(learningMode ? "Learn" : "Brief & exercises");
    persistLibrary({ ...libraryRef.current, activeId: id }, "Project opened. Saved in this browser.");
  }

  function createProject(duplicate: boolean) {
    if (libraryRef.current.projects.length >= MAX_PROJECTS) return;
    const next = normalizeDraft(duplicate ? { ...currentDraft.current, title: `${currentDraft.current.title || "Untitled project"} (copy)` } : null);
    const id = crypto.randomUUID();
    persistLibrary({ activeId: id, projects: [...libraryRef.current.projects, { id, draft: next }] }, duplicate ? "Project duplicated." : "New project created.");
    currentDraft.current = next; setDraft(next); setSummary(null); setUndo(null); setSection("Brief & exercises");
  }

  function navigate(target: typeof SECTIONS[number]) {
    setSection(target);
    requestAnimationFrame(() => { sectionStart.current?.scrollIntoView?.({ block: "start" }); sectionStart.current?.focus(); });
  }

  function update<K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) {
    const limits = { concepts: 12, precedents: 30, milestones: 50, critiques: 50, presentationItems: 40, requirementItems: 80 };
    if (field in limits && Array.isArray(value)) {
      type ListKey = keyof typeof limits;
      const key = field as ListKey;
      const previous = currentDraft.current;
      const remaining = new Set((value as { id: string }[]).map(row => row.id));
      const removed = previous[key].filter(row => !remaining.has(row.id));
      if (removed.length) setUndo({ message: "Item removed. You can undo the latest deletion in this project.", restore: () => {
        const now = currentDraft.current;
        const existing = new Set(now[key].map(row => row.id));
        const restored = [...now[key], ...removed.filter(row => !existing.has(row.id))];
        if (restored.length > limits[key]) { setStatus("Make room in this list before restoring the deleted item."); return; }
        const result = normalizeDraft({ ...now, [key]: restored,
          ...(key === "concepts" ? { comparisonIds: [...new Set([...now.comparisonIds, ...previous.comparisonIds])], directionId: now.directionId || previous.directionId } : {}),
        });
        currentDraft.current = result; setDraft(result); persist(result, "Deleted item restored."); setUndo(null);
      } });
    }
    const next = normalizeDraft({ ...currentDraft.current, [field]: value });
    currentDraft.current = next;
    setDraft(next);
    persist(next, "Changes saved in this browser.");
    setSummary(null);
  }

  const nextStep: { section: typeof SECTIONS[number]; reason: string } = !draft.brief.trim()
    ? { section: "Brief & exercises", reason: "Start by adding your assignment brief." }
    : !draft.concepts.some(c => c.premise.trim())
      ? { section: "Concepts", reason: "Capture a first design possibility. You can write your own concept without AI." }
      : !draft.milestones.some(m => !m.done)
        ? { section: "Plan", reason: "Choose a concrete sketch, model, or research task to work on next." }
        : { section: "Review & export", reason: "Prepare your project story and the questions you want feedback on." };

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
        <div className="studio-header-copy">
        <p className="studio-eyebrow">AI Tutor / Architecture workspace</p>
        <h1>{learningMode ? "Architectural Design Studio" : "Studio Brainstorm"}</h1>
        <p>{learningMode ? "Learn a concept. Test it through a sketch or model. Reflect on your choices." : "Start with the brief. Find a question worth exploring."}</p>
        <p className="studio-header-caption">Observe. Make. Question. Refine.</p>
        </div>
        <div className="studio-drawing" aria-hidden="true">
          <svg viewBox="0 0 320 200" fill="none">
            <path d="M20 148 150 73 297 158 168 232" stroke="currentColor" strokeDasharray="3 5" opacity=".25" />
            <path d="M61 107 149 56 257 118 169 169Z" fill="#deded3" stroke="currentColor" />
            <path d="M61 107V64L149 13V56M61 64 169 126 257 75V118M169 126V169M149 13 257 75" stroke="currentColor" />
            <path d="M89 91V70L150 35 228 80V101L167 137Z" fill="#eeeae1" stroke="currentColor" />
            <path d="m89 70 78 45 61-35M167 115v22M150 35v21l78 45M150 56 89 91" stroke="currentColor" />
            <path d="m117 107 32-19 50 29-32 19Z" fill="#b35232" fillOpacity=".2" stroke="#a34428" />
            <path d="m35 67-13 8m13 26-13 8m6-37v34m238 30 9 5m-99 52 9 5m-5-2 90-52" stroke="currentColor" opacity=".5" />
          </svg>
          <span>FIG. 01 / SPATIAL STUDY · NTS</span>
        </div>
      </header>
      <div className="studio-title-block" aria-label="Project overview">
        <div><span>Project</span><strong>{draft.title.trim() || "Untitled studio project"}</strong></div>
        <div><span>Brief</span><strong>{draft.assignmentReview?.reviewed ? "Reviewed" : draft.brief.trim() ? "In progress" : "Ready to begin"}</strong></div>
        <div><span>Studies</span><strong>{draft.concepts.length} concept{draft.concepts.length === 1 ? "" : "s"}</strong></div>
      </div>
      <section className="studio-project-controls" aria-label="Project library">
        <label htmlFor="studio-project-picker">Open project</label>
        <select id="studio-project-picker" value={library.activeId} onChange={e => openProject(e.target.value)}>
          {library.projects.map((p, index) => <option key={p.id} value={p.id}>{p.draft.title || `Untitled project ${index + 1}`}</option>)}
        </select>
        <button type="button" disabled={library.projects.length >= MAX_PROJECTS} onClick={() => createProject(false)}>New project</button>
        <button type="button" disabled={library.projects.length >= MAX_PROJECTS} onClick={() => createProject(true)}>Duplicate project</button>
        <p className="studio-small">{library.projects.length} / {MAX_PROJECTS} projects in this browser.</p>
      </section>
      <aside className="studio-next-step">
        <div><strong>Suggested next step</strong><p>{nextStep.reason} You can visit any section at any time.</p></div>
        <button type="button" onClick={() => navigate(nextStep.section)}>Continue your project</button>
      </aside>
      <nav className="studio-nav studio-workflow" aria-label="Studio tools">
        {SECTIONS.map((label, index) => <button type="button" key={label} aria-pressed={section === label}
          onClick={() => navigate(label)}><span aria-hidden="true" className="studio-step-number">0{index + 1}</span>{label}</button>)}
      </nav>
      <p className="studio-status" role="status">{status}</p>
      {undo && <aside className="studio-undo"><span>{undo.message}</span><button type="button" onClick={undo.restore}>Undo deletion</button></aside>}
      <p className="studio-small">Edits save automatically in this browser only; not synced to your account. Guest drafts are shared by people using this browser.</p>
      <div key={library.activeId} ref={sectionStart} tabIndex={-1} className="studio-section-start">
      {section === "Learn" && <StudioLessons draft={draft} onChange={update} onOpenBrief={() => navigate("Brief & exercises")} onOpenConcepts={() => navigate("Concepts")} />}
      {section === "Brief & exercises" && <>
      <CoursePreset brief={draft.brief} onApply={value => update("brief", value)} />
      <div className="studio-layout">
        <form className="studio-card" onSubmit={save}>
          <details open><summary>Project brief and context</summary>
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
          </details>
        </form>
        <aside className="studio-side">
          <details open><summary>Brainstorming exercises</summary><PromptExplorer notes={draft.promptNotes} onChange={value => update("promptNotes", value)} /></details>
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
        <details open><summary>AI inspiration and images</summary><InspirationPanel draft={draft} onChange={update} onOpenBrief={() => navigate("Brief & exercises")} /></details>
        <ConceptBoard concepts={draft.concepts} onChange={value => update("concepts", value)} />
        <ConceptComparison draft={draft} onChange={update} />
      </>}
      {section === "References" && <PrecedentJournal precedents={draft.precedents} onChange={value => update("precedents", value)} />}
      {section === "Plan" && <>
        <details open><summary>Requirements</summary><RequirementsChecklist draft={draft} onChange={value => update("requirementItems", value)} /></details>
        <details open><summary>Milestones</summary><MilestonePlanner milestones={draft.milestones} onChange={value => update("milestones", value)} /></details>
      </>}
      {section === "Review & export" && <>
        <details open><summary>Pin-up preparation</summary><PresentationPrep draft={draft} onChange={update} /></details>
        <details open><summary>Critique notes</summary><CritiqueLog critiques={draft.critiques} onChange={value => update("critiques", value)} /></details>
        <ProjectExport draft={draft} />
      </>}
      </div>
    </main>
  );
}
