import { useState } from "react";
import { PROMPTS, THEMES } from "./prompts";
import SketchAttachments from "./SketchAttachments";
import type { PromptImage } from "./promptImages";

export default function PromptExplorer({ notes, onChange, images = {}, onAddImage, onRemoveImage }: {
  notes: Record<string, string>; onChange: (notes: Record<string, string>) => void;
  images?: Record<string, PromptImage[]>;
  onAddImage?: (promptId: string, image: PromptImage) => boolean;
  onRemoveImage?: (promptId: string, id: string) => void;
}) {
  const [themes, setThemes] = useState<string[]>([THEMES[0]]);
  const archived = PROMPTS.filter(prompt => prompt.theme === "People" && (notes[prompt.id]?.trim() || images[prompt.id]?.length));
  return <section className="studio-card studio-prompts" aria-label="Brainstorming exercises">
    <h2>Explore a starting point</h2>
    <p>Pick lenses. Sketch or write.</p>
    <fieldset className="studio-lenses"><legend>Brainstorming lenses</legend>
      {THEMES.map(item => <label className="studio-check" key={item}><input type="checkbox" checked={themes.includes(item)}
        onChange={event => setThemes(current => event.target.checked ? [...current, item] : current.filter(value => value !== item))} />{item}</label>)}
    </fieldset>
    {!themes.length && <p className="studio-small">Choose a lens to see prompts. Your responses stay saved.</p>}
    {PROMPTS.filter(prompt => prompt.theme !== "People" && themes.includes(prompt.theme)).map(prompt => <div className="studio-exercise" key={prompt.id}>
      <p className="studio-small">{prompt.theme}</p>
      <h3>{prompt.title}</h3><p>{prompt.question}</p>
      <details className="studio-help"><summary>Try an exercise</summary><p className="studio-try-this">{prompt.exercise}</p></details>
      <label htmlFor={`response-${prompt.id}`}>Your response to “{prompt.title}”</label>
      <textarea id={`response-${prompt.id}`} rows={3} maxLength={4000} value={notes[prompt.id] || ""}
        onChange={event => onChange({ ...notes, [prompt.id]: event.target.value })} />
      {onAddImage && onRemoveImage && <SketchAttachments promptId={prompt.id} title={prompt.title} images={images[prompt.id] || []}
        onAdd={image => onAddImage(prompt.id, image)} onRemove={id => onRemoveImage(prompt.id, id)} />}
    </div>)}
    {archived.length > 0 && <details className="studio-context"><summary>Previously saved People work</summary>
      {archived.map(prompt => <div key={prompt.id} className="studio-exercise">
        <h3>{prompt.title}</h3><p className="studio-preserve">{notes[prompt.id]}</p>
        {onAddImage && onRemoveImage && <SketchAttachments promptId={prompt.id} title={prompt.title} images={images[prompt.id] || []}
          onAdd={image => onAddImage(prompt.id, image)} onRemove={id => onRemoveImage(prompt.id, id)} />}
      </div>)}
    </details>}
  </section>;
}
