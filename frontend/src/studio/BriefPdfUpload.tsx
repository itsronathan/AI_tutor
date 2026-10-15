import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../apiBase";

export default function BriefPdfUpload({ hasBrief, onImport }: { hasBrief: boolean; onImport: (text: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ text: string; name: string; warning: string } | null>(null);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => { active.current?.abort(); active.current = null; }, []);
  async function read(file?: File) {
    active.current?.abort(); active.current = null; setPreview(null); setError(""); setBusy(false);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Choose a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Choose a PDF under 10 MB."); return; }
    const controller = new AbortController(); active.current = controller; setBusy(true);
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(apiUrl("/api/studio/import-pdf"), { method: "POST", headers: { "Content-Type": "application/pdf" }, body: file, signal: controller.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.detail || "Could not read this PDF. Try pasting the text.");
      if (typeof result?.text !== "string" || !result.text.trim() || result.text.length > 30000) throw new Error("Invalid extracted text. Try pasting the brief.");
      if (active.current === controller && !controller.signal.aborted) setPreview({ text: result.text, name: file.name, warning: typeof result.warning === "string" ? result.warning : "" });
    } catch (failure) {
      if (active.current === controller) setError(controller.signal.aborted ? "PDF reading timed out. Try again or paste the text." : failure instanceof Error ? failure.message : "Could not read the PDF. Check the backend connection.");
    } finally { clearTimeout(timer); if (active.current === controller) { active.current = null; setBusy(false); } }
  }
  return <section className="studio-pdf-upload" aria-label="Import assignment PDF">
    <label htmlFor="studio-pdf">Insert assignment PDF</label>
    <p className="studio-small">Text PDFs · up to 10 MB / 40 pages. No API key needed.</p>
    <input id="studio-pdf" type="file" accept=".pdf,application/pdf" onChange={event => { void read(event.target.files?.[0]); event.target.value = ""; }} />
    <p className="studio-small">Sent to this app’s server for text extraction. Review before using.</p>
    {busy && <p role="status">Reading PDF…</p>}
    {error && <p role="alert" className="studio-error">{error}</p>}
    {preview && <>
      <p role="status">{preview.name} · {preview.text.length.toLocaleString()} characters ready.</p>
      {preview.warning && <p role="alert">{preview.warning}</p>}
      <details><summary>Preview extracted text</summary><pre className="studio-export-preview">{preview.text}</pre></details>
      {hasBrief && <p className="studio-small">Replaces your brief and resets its AI review and chat.</p>}
      <button type="button" onClick={() => { onImport(preview.text); setPreview(null); }}>{hasBrief ? "Replace brief with PDF text" : "Use PDF text"}</button>
      <button type="button" className="studio-secondary" onClick={() => setPreview(null)}>Discard</button>
    </>}
  </section>;
}
