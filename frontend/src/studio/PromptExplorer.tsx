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
  const [themes, setThemes] = useState<string[]>(["People"]);
  return <section className="studio-card studio-prompts" aria-label="Brainstorming exercises">
    <p className="studio-eyebrow">When you feel stuck</p>
    <h2>Explore a starting point</h2>
    <p>Pick one or more lenses. Sketch or write a response.</p>
    <fieldset className="studio-lenses"><legend>Brainstorming lenses</legend>
      {THEMES.map(item => <label className="studio-check" key={item}><input type="checkbox" checked={themes.includes(item)}
        onChange={event => setThemes(current => event.target.checked ? [...current, item] : current.filter(value => value !== item))} />{item}</label>)}
    </fieldset>
    {!themes.length && <p className="studio-small">Choose a lens to see prompts. Your responses stay saved.</p>}
    {PROMPTS.filter(prompt => themes.includes(prompt.theme)).map(prompt => <div className="studio-exercise" key={prompt.id}>
      <p className="studio-small">{prompt.theme}</p>
      <h3>{prompt.title}</h3><p>{prompt.question}</p>
      <p className="studio-try-this"><span>Try this:</span> {prompt.exercise}</p>
      <label htmlFor={`response-${prompt.id}`}>Your response to “{prompt.title}”</label>
      <textarea id={`response-${prompt.id}`} rows={3} maxLength={4000} value={notes[prompt.id] || ""}
        onChange={event => onChange({ ...notes, [prompt.id]: event.target.value })} />
      {onAddImage && onRemoveImage && <SketchAttachments promptId={prompt.id} title={prompt.title} images={images[prompt.id] || []}
        onAdd={image => onAddImage(prompt.id, image)} onRemove={id => onRemoveImage(prompt.id, id)} />}
    </div>)}
  </section>;
}
