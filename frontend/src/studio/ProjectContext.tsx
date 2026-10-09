import type { StudioDraft } from "./model";

const FIELDS = [
  ["site", "Site observations", "What is known about the site? Note surroundings, access, sun, slope, or noise. Mark unverified observations as assumptions."],
  ["users", "People and activities", "Who might use the project, and what would they do there? Consider different needs and times of day."],
  ["requirements", "Requirements from the brief", "One requirement per line: required spaces, dimensions, materials, or deliverables. Keep these separate from your own ideas."],
  ["openQuestions", "Questions to ask your instructor", "What is unclear or missing? Avoid guessing at requirements."],
] as const;

export default function ProjectContext({ draft, onChange }: {
  draft: StudioDraft;
  onChange: (field: typeof FIELDS[number][0], value: string) => void;
}) {
  return <details className="studio-context">
    <summary>Site, people, and assignment requirements</summary>
    {FIELDS.map(([field, label, help]) => <div key={field}>
      <label htmlFor={`studio-${field}`}>{label}</label>
      <p id={`studio-${field}-help`} className="studio-small">{help}</p>
      <textarea id={`studio-${field}`} rows={3} maxLength={4000}
        aria-describedby={`studio-${field}-help`} value={draft[field]}
        onChange={event => onChange(field, event.target.value)} />
    </div>)}
  </details>;
}
