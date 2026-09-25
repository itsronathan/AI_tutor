import { useState } from "react";
import { PROMPTS, THEMES } from "./prompts";

export default function PromptExplorer({ notes, onChange }: {
  notes: Record<string, string>; onChange: (notes: Record<string, string>) => void;
}) {
  const [theme, setTheme] = useState<string>("People");
  return <section className="studio-card" aria-label="Brainstorming exercises">
    <p className="studio-eyebrow">When you feel stuck</p>
    <h2>Explore a starting point</h2>
    <p>Choose a lens and respond with a sketch or a few words. These are guided exercises, not AI-generated recommendations.</p>
    <label htmlFor="studio-theme">Brainstorming lens</label>
    <select id="studio-theme" value={theme} onChange={event => setTheme(event.target.value)}>
      {THEMES.map(item => <option key={item}>{item}</option>)}
    </select>
    {PROMPTS.filter(prompt => prompt.theme === theme).map(prompt => <div className="studio-exercise" key={prompt.id}>
      <h3>{prompt.title}</h3><p>{prompt.question}</p>
      <p><strong>Try this:</strong> {prompt.exercise}</p>
      <label htmlFor={`response-${prompt.id}`}>Your response to “{prompt.title}”</label>
      <textarea id={`response-${prompt.id}`} rows={3} maxLength={4000} value={notes[prompt.id] || ""}
        onChange={event => onChange({ ...notes, [prompt.id]: event.target.value })} />
    </div>)}
  </section>;
}
