import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../apiBase";

export default function AiAvailability() {
  const [message, setMessage] = useState("AI connection not checked. Analysis and image generation need a configured AI service.");
  const [busy, setBusy] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  async function check() {
    if (active.current) return;
    const controller = new AbortController(); active.current = controller; setBusy(true);
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(apiUrl("/api/studio/availability"), { signal: controller.signal });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (typeof data.configured !== "boolean") throw new Error();
      setMessage(data.configured
        ? "AI service configured. Account credit and model access are checked when you generate; requests may incur charges."
        : "AI is not configured yet. A backend API key is needed for analysis and image generation.");
    } catch {
      setMessage("Could not check the AI service. Make sure the backend is running, then retry.");
    } finally { clearTimeout(timer); active.current = null; setBusy(false); }
  }
  return <aside className="studio-ai-availability" aria-label="AI availability">
    <p aria-live="polite">{message}</p>
    <p className="studio-small">You can still use exercises, lessons, concept cards, checklists, and exports without AI.</p>
    <button type="button" disabled={busy} onClick={() => void check()}>{busy ? "Checking connection…" : "Check AI connection"}</button>
  </aside>;
}
