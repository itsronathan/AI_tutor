import { COURSE_BRIEF, COURSE_ISSUES, COURSE_MARKER, COURSE_SOURCE } from "./coursePreset";

export default function CoursePreset({ brief, onApply }: { brief: string; onApply: (brief: string) => void }) {
  const fits = brief.length + COURSE_BRIEF.length + 2 <= 30000;
  const applied = brief.includes(COURSE_MARKER);
  return <details className="studio-card studio-section">
    <summary>Optional course preset: ARCH 4820 · Fall 2026</summary>
    <p>New York City Natatorium &amp; Recreation Center, Greenpoint. Curated from {COURSE_SOURCE}; source pages are included below. General Studio projects can leave this preset unused.</p>
    <h3>Questions to confirm with your instructor</h3>
    <ul>{COURSE_ISSUES.map(issue => <li key={issue}>{issue}</li>)}</ul>
    <details><summary>Preview the course requirements and source pages</summary><pre className="studio-export-preview">{COURSE_BRIEF}</pre></details>
    <p>This appends the course summary to your brief, preserving your text. It clears the current AI review and conversation so you can analyze the combined requirements again. Earlier inspiration records remain as history.</p>
    <button type="button" disabled={applied || !fits} onClick={() => onApply([brief.trim(), COURSE_BRIEF].filter(Boolean).join("\n\n"))}>
      {applied ? "Course preset added" : "Add course preset to brief"}
    </button>
    {!fits && !applied && <p role="alert">There is not enough room in the 30,000-character brief. Shorten your brief before adding the preset.</p>}
  </details>;
}
