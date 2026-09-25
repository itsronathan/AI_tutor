import { useState, type FormEvent } from "react";
import "./StudioBrainstorm.css";

type Draft = { title: string; brief: string; interests: string; experience: string };
const EMPTY: Draft = { title: "", brief: "", interests: "", experience: "" };

function readDraft(key: string): Draft {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "null");
    if (value && typeof value === "object" && Object.keys(EMPTY).every(
      field => typeof (value as Record<string, unknown>)[field] === "string",
    )) return value as Draft;
  } catch { /* An unavailable or invalid draft starts with an empty form. */ }
  return { ...EMPTY };
}

export default function StudioBrainstorm({ ownerId }: { ownerId: string }) {
  const storageKey = `studio-brainstorm:v1:${ownerId}`;
  const [draft, setDraft] = useState(() => readDraft(storageKey));
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState<Draft | null>(null);

  function update(field: keyof Draft, value: string) {
    setDraft(current => ({ ...current, [field]: value }));
    setStatus("Unsaved changes");
    setSummary(null);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.brief.trim()) {
      setStatus("Paste your assignment brief before saving.");
      return;
    }
    setSummary({ ...draft });
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setStatus("Draft saved in this browser.");
    } catch {
      setStatus("Browser storage is unavailable. Your notes are still here, but will be lost when you leave.");
    }
  }

  return (
    <main className="studio-page">
      <header className="studio-header">
        <p className="studio-eyebrow">Architecture · Early prototype</p>
        <h1>Studio Brainstorm</h1>
        <p>Start with the brief. Find a question worth exploring.</p>
      </header>
      <div className="studio-layout">
        <form className="studio-card" onSubmit={save}>
          <h2>Set up your project</h2>
          <p>You don’t need a concept yet. Capture what you know and leave the rest open.</p>
          <label htmlFor="studio-title">Project or course name <span>(optional)</span></label>
          <input id="studio-title" value={draft.title} maxLength={200}
            placeholder="e.g. Design Studio — Community gathering space"
            onChange={event => update("title", event.target.value)} />
          <label htmlFor="studio-brief">Assignment brief <span>(required)</span></label>
          <p id="studio-brief-help">Paste the assignment, including any site, users, required spaces, and deliverables. PDF upload will come later.</p>
          <textarea id="studio-brief" required rows={9} maxLength={30000}
            aria-describedby="studio-brief-help" value={draft.brief}
            onChange={event => update("brief", event.target.value)} />
          <label htmlFor="studio-interests">What catches your interest? <span>(optional)</span></label>
          <textarea id="studio-interests" rows={3} maxLength={4000} value={draft.interests}
            placeholder="A site detail, a material, a memory, a question — or simply ‘I’m not sure yet.’"
            onChange={event => update("interests", event.target.value)} />
          <label htmlFor="studio-experience">What might someone experience here? <span>(optional)</span></label>
          <textarea id="studio-experience" rows={3} maxLength={4000} value={draft.experience}
            placeholder="Think about arrival, movement, gathering, or finding a quiet place. It’s okay to leave this open."
            onChange={event => update("experience", event.target.value)} />
          <button type="submit">Save project draft</button>
          <p className="studio-status" role="status">{status}</p>
          <p className="studio-small">Saved on this browser only; not synced to your account. Guest drafts are shared by people using this browser.</p>
        </form>
        <aside className="studio-side">
          <section className="studio-card">
            <p className="studio-eyebrow">A first sketch</p>
            <h2>Try three ways in</h2>
            <p>These are general starting exercises, not AI feedback on your brief.</p>
            <ol>
              <li><strong>Follow a person.</strong> Sketch one person’s journey through the site. Where might they pause?</li>
              <li><strong>Explore a contrast.</strong> Draw how an open space could become sheltered, or a busy space become quiet.</li>
              <li><strong>Change one thing.</strong> Make three tiny sketches with different entrances, gathering spaces, or relationships to the ground.</li>
            </ol>
            <p>Choose one sketch and write the question it helps you investigate.</p>
          </section>
          <section className="studio-card">
            <h2>What comes next</h2>
            <p>This first version captures your starting point. AI follow-up questions and concept directions are planned for the next step.</p>
          </section>
        </aside>
      </div>
      {summary && <section className="studio-card studio-summary" aria-label="Project starting point">
        <h2>{summary.title.trim() || "Your project starting point"}</h2>
        <h3>Assignment brief</h3><p>{summary.brief}</p>
        <h3>Your interests</h3><p>{summary.interests.trim() || "Still open — explore through sketches."}</p>
        <h3>Intended experience</h3><p>{summary.experience.trim() || "Still open — start with one person’s journey."}</p>
      </section>}
    </main>
  );
}
