import { useState } from "react";
import type { StudioDraft } from "./model";
import { buildProjectNotes, exportFilename } from "./exportNotes";

export default function ExportNotes({ draft }: { draft: StudioDraft }) {
  const [message, setMessage] = useState("");
  const notes = buildProjectNotes(draft);
  function download() {
    let url: string | undefined;
    const link = document.createElement("a");
    try {
      url = URL.createObjectURL(new Blob([notes], { type: "text/plain;charset=utf-8" }));
      link.href = url;
      link.download = exportFilename(draft.title);
      document.body.appendChild(link);
      link.click();
      setMessage("Download requested. You can also copy the preview below.");
    } catch {
      setMessage("Could not start the download. Open the preview below to select and copy your notes.");
    } finally {
      link.remove();
      if (url) { const objectUrl = url; setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); }
    }
  }
  return <section className="studio-card studio-section" aria-label="Export project notes">
    <h2>Take your notes to studio</h2>
    <p>Download a plain-text snapshot of your current project, including unsaved edits if browser storage is unavailable.</p>
    <button type="button" onClick={download}>Download project notes (.txt)</button>
    <p aria-live="polite">{message}</p>
    <details className="studio-context"><summary>Preview project notes</summary><pre className="studio-export-preview">{notes}</pre></details>
  </section>;
}
