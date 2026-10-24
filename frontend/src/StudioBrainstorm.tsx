import { useRef, useState, type FormEvent } from "react";
import { normalizeDraft, type StudioDraft } from "./studio/model";
import { loadProjects, MAX_PROJECTS, type ProjectLibrary } from "./studio/projects";
import RequirementsChecklist from "./studio/RequirementsChecklist";
import PromptExplorer from "./studio/PromptExplorer";
import ConceptBoard from "./studio/ConceptBoard";
import ConceptComparison from "./studio/ConceptComparison";
import PrecedentJournal from "./studio/PrecedentJournal";
import MilestonePlanner from "./studio/MilestonePlanner";
import CritiqueLog from "./studio/CritiqueLog";
import ProjectExport from "./studio/ProjectExport";
import PresentationPrep from "./studio/PresentationPrep";
import AssignmentTutorPanel from "./studio/AssignmentTutorPanel";

import CoursePreset from "./studio/CoursePresetPanel";
import InspirationPanel from "./studio/InspirationPanel";
import ProjectTutor from "./studio/ProjectTutor";
import FocusedHelp from "./studio/FocusedHelpPanel";
import BriefPdfUpload from "./studio/BriefPdfUpload";
import { MAX_PROMPT_IMAGES } from "./studio/promptImages";
import "./StudioBrainstorm.css";

const GROUPS = {
Project: ["Brief & exercises", "Brief review", "Project tutor", "Focused help"],
Explore: ["Exercises", "Concepts", "Concept cards", "Compare concepts", "References"],
Finish: ["Plan", "Milestones", "Review & export", "Critique notes", "Export"],
} as const;
type Activity = typeof GROUPS[keyof typeof GROUPS][number];
const LABELS: Record<Activity, string> = { "Brief & exercises": "Assignment brief", "Brief review": "Review requirements", "Project tutor": "Project tutor", "Focused help": "Focused help", Exercises: "Exercises", Concepts: "Generate images", "Concept cards": "Concept cards", "Compare concepts": "Compare concepts", References: "References", Plan: "Requirements", Milestones: "Milestones", "Review & export": "Pin-up prep", "Critique notes": "Critique notes", Export: "Export notes" };

export default function StudioBrainstorm({ ownerId }: { ownerId: string }) {
  return <StudioWorkspace key={ownerId} ownerId={ownerId} />;
}

function StudioWorkspace({ ownerId }: { ownerId: string }) {
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

  const [section, setSection] = useState<Activity>("Brief & exercises");

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
    currentDraft.current = next.draft; setDraft(next.draft);  setUndo(null);
    setSection("Brief & exercises");
    persistLibrary({ ...libraryRef.current, activeId: id }, "Project opened. Saved in this browser.");
  }

  function createProject(duplicate: boolean) {
    if (libraryRef.current.projects.length >= MAX_PROJECTS) return;
    const next = normalizeDraft(duplicate ? { ...currentDraft.current, title: `${currentDraft.current.title || "Untitled project"} (copy)` } : null);
    const id = crypto.randomUUID();
    persistLibrary({ activeId: id, projects: [...libraryRef.current.projects, { id, draft: next }] }, duplicate ? "Project duplicated." : "New project created.");
    currentDraft.current = next; setDraft(next);  setUndo(null); setSection("Brief & exercises");
  }

  function navigate(target: Activity) {
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
    
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.brief.trim()) {
      setStatus("Paste your assignment brief before saving.");
      return;
    }
    navigate("Brief review");
    persist(draft, "Draft saved in this browser.");
  }

  const group = (Object.keys(GROUPS) as (keyof typeof GROUPS)[]).find(key => (GROUPS[key] as readonly string[]).includes(section))!;
  return (
    <main className="studio-page">
      <header className="studio-simple-header">
        <div><p className="studio-eyebrow">Architecture studio</p><h1>{draft.title.trim() || "Your studio"}</h1></div>
        <details className="studio-project-menu"><summary>Projects</summary>
          <section className="studio-project-controls" aria-label="Project library">
            <label htmlFor="studio-project-picker">Open project</label>
            <select id="studio-project-picker" value={library.activeId} onChange={e => openProject(e.target.value)}>
              {library.projects.map((p, i) => <option key={p.id} value={p.id}>{p.draft.title || "Untitled project " + (i + 1)}</option>)}
            </select>
            <button type="button" disabled={library.projects.length >= MAX_PROJECTS} onClick={() => createProject(false)}>New project</button>
            <button type="button" disabled={library.projects.length >= MAX_PROJECTS} onClick={() => createProject(true)}>Duplicate project</button>
          </section>
        </details>
      </header>
      <nav className="studio-primary-tabs" aria-label="Studio workspace">
        {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map(key => <button type="button" key={key} aria-pressed={group === key}
          onClick={() => navigate(GROUPS[key][0])}>{key}</button>)}
      </nav>
      <div className="studio-activity-picker">
        <label htmlFor="studio-activity">Activity</label>
        <select id="studio-activity" value={section} onChange={e => navigate(e.target.value as Activity)}>
          {GROUPS[group].map(item => <option key={item} value={item}>{LABELS[item]}</option>)}
        </select>
      </div>
      <p className="studio-status" role="status">{status}</p>
      {undo && <aside className="studio-undo"><span>{undo.message}</span><button type="button" onClick={undo.restore}>Undo deletion</button></aside>}
      <details className="studio-storage-note"><summary>About saving</summary><p>Autosaved in this browser. No account sync; guest drafts are shared here.</p></details>
      <div key={library.activeId} ref={sectionStart} tabIndex={-1} className="studio-section-start">
      {section === "Project tutor" && <ProjectTutor draft={draft} onChange={update} onNavigate={navigate} />}
      {section === "Focused help" && <FocusedHelp draft={draft} onChange={update} onOpenBrief={() => navigate("Brief review")} />}

      {section === "Brief & exercises" && <>
        <form className="studio-card" onSubmit={save}>
          <h2>What are you working on?</h2>
          <label htmlFor="studio-title">Project name <span>(optional)</span></label>
          <input id="studio-title" value={draft.title} maxLength={200}
            placeholder="e.g. Community pavilion"
            onChange={event => update("title", event.target.value)} />
          <BriefPdfUpload hasBrief={!!draft.brief.trim()} onImport={value => update("brief", value)} />
          <label htmlFor="studio-brief">Assignment brief <span>(required)</span></label>
          <p id="studio-brief-help">Or paste below. Edits reset AI review and chat.</p>
          <textarea id="studio-brief" required rows={5} maxLength={30000}
            aria-describedby="studio-brief-help" value={draft.brief}
            onChange={event => update("brief", event.target.value)} />

          <details className="studio-help"><summary>Add context</summary>
          <label htmlFor="studio-interests">What catches your interest? <span>(optional)</span></label>
          <textarea id="studio-interests" rows={3} maxLength={4000} value={draft.interests}
            placeholder="A material, place, or idea…"
            onChange={event => update("interests", event.target.value)} />
          <label htmlFor="studio-experience">What might someone experience here? <span>(optional)</span></label>
          <textarea id="studio-experience" rows={3} maxLength={4000} value={draft.experience}
            placeholder="Arrival, gathering, quiet…"
            onChange={event => update("experience", event.target.value)} />
          </details>
          <button type="submit">Continue</button>
        </form>
      </>}
      {section === "Brief review" && <><CoursePreset brief={draft.brief} onApply={value => update("brief", value)} /><AssignmentTutorPanel brief={draft.brief.trim()} review={draft.assignmentReview} onChange={value => update("assignmentReview", value)} /></>}
      {section === "Exercises" && <PromptExplorer notes={draft.promptNotes} onChange={value => update("promptNotes", value)} images={draft.promptImages}
            onAddImage={(promptId, image) => {
              const images = currentDraft.current.promptImages || {};
              if (Object.values(images).flat().length >= MAX_PROMPT_IMAGES) return false;
              update("promptImages", { ...images, [promptId]: [...(images[promptId] || []), image] }); return true;
            }} onRemoveImage={(promptId, id) => {
              const images = currentDraft.current.promptImages;
              update("promptImages", { ...images, [promptId]: images[promptId].filter(image => image.id !== id) });
            }} />}
      {section === "Concepts" && <InspirationPanel draft={draft} onChange={update} onOpenBrief={() => navigate("Brief review")} />}
      {section === "Concept cards" && <ConceptBoard concepts={draft.concepts} onChange={value => update("concepts", value)} />}
      {section === "Compare concepts" && <ConceptComparison draft={draft} onChange={update} />}
      {section === "References" && <PrecedentJournal precedents={draft.precedents} onChange={value => update("precedents", value)} />}
      {section === "Plan" && <RequirementsChecklist draft={draft} onChange={value => update("requirementItems", value)} />}
      {section === "Milestones" && <MilestonePlanner milestones={draft.milestones} onChange={value => update("milestones", value)} />}
      {section === "Review & export" && <PresentationPrep draft={draft} onChange={update} />}
      {section === "Critique notes" && <CritiqueLog critiques={draft.critiques} onChange={value => update("critiques", value)} />}
      {section === "Export" && <ProjectExport draft={draft} />}
      </div>
    </main>
  );
}
