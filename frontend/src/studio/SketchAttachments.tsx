import { useEffect, useRef, useState } from "react";
import { readSketch, type PromptImage } from "./promptImages";

export default function SketchAttachments({ promptId, title, images, onAdd, onRemove }: {
  promptId: string; title: string; images: PromptImage[];
  onAdd: (image: PromptImage) => boolean; onRemove: (id: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function attach(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const image = await readSketch(file);
      if (mounted.current && !onAdd(image)) setError("Six sketch images per project. Remove one before adding another.");
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : "Could not attach this image."); }
    finally { if (mounted.current) setBusy(false); }
  }
  return <div className="studio-sketches">
    <input ref={input} hidden type="file" id={`sketch-${promptId}`} aria-label={`Image for ${title}`} accept="image/jpeg,image/png,image/webp"
      onChange={e => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
    <button type="button" className="studio-secondary" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Preparing image…" : "Attach sketch"}</button>
    <p className="studio-small">Optional · JPG, PNG, WebP. Six per project. Compressed copies stay in this browser; not sent to AI. Keep originals.</p>
    {error && <p role="alert" className="studio-error">{error}</p>}
    {images.map(image => <figure key={image.id}>
      <img src={image.data} alt={`Sketch for ${title}: ${image.name}`} />
      <figcaption>{image.name}</figcaption>
      <a href={image.data} download={`${image.name.replace(/\.[^.]+$/, "")}-studio.jpg`}>Download sketch</a>
      <button type="button" className="studio-secondary" onClick={() => onRemove(image.id)}>Remove {image.name}</button>
    </figure>)}
  </div>;
}
