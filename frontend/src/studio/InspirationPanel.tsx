import { useEffect, useRef, useState } from "react";
import AiAvailability from "./AiAvailability";
import { MAX_CONCEPTS, type StudioDraft } from "./model";
import { request } from "./assignmentApi";
import { downloadText, MAX_RECORDS, parseDirections, parseRecord, reviewContext, type Direction, type Exploration } from "./inspiration";

export default function InspirationPanel({ draft, onChange, onOpenBrief }: {
  draft: StudioDraft; onChange: <K extends keyof StudioDraft>(key: K, value: StudioDraft[K]) => void; onOpenBrief: () => void;
}) {
  const [focus, setFocus] = useState("");
  const [selected, setSelected] = useState(0);
  const [kind, setKind] = useState("parti");
  const [refinement, setRefinement] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [image, setImage] = useState<{ src: string; id: string; context: string; title: string } | null>(null);
  const active = useRef<AbortController | null>(null);
  const latest = useRef({ draft, onChange });
  useEffect(() => { latest.current = { draft, onChange }; }, [draft, onChange]);
  const context = JSON.stringify(reviewContext(draft.brief, draft.assignmentReview));
  const valid = !!draft.assignmentReview?.reviewed;
  const run = [...draft.explorations].reverse().find(r => r.kind === "inspiration" && r.context === context);
  const directions = run?.directions || [];
  const chosen = directions[selected];
  useEffect(() => {
    active.current?.abort(); active.current = null; setBusy(false); setError(""); setSelected(0); setRefinement("");
  }, [context]);
  useEffect(() => () => { active.current?.abort(); active.current = null; }, []);

  async function generate(drawing: boolean) {
    if (!valid || active.current || (drawing && !chosen)) return;
    const controller = new AbortController(); active.current = controller;
    setBusy(true); setError(""); setNotice("");
    let timeout = false;
    const timer = setTimeout(() => { timeout = true; controller.abort(); }, drawing ? 200000 : 120000);
    const question = focus.trim() || "Suggest three contrasting early design directions tied to my reviewed assignment.";
    const payload = { ...reviewContext(draft.brief, draft.assignmentReview), question,
      ...(drawing ? { direction: chosen, drawing_type: kind, refinement } : {}) };
    try {
      const raw = await request(drawing ? "concept-drawing" : "inspiration", payload, controller.signal) as Record<string, unknown>;
      if (active.current !== controller || controller.signal.aborted || JSON.stringify(reviewContext(latest.current.draft.brief, latest.current.draft.assignmentReview)) !== context) return;
      const record = parseRecord(raw?.record);
      const items = drawing ? [] : parseDirections(raw?.directions, draft.brief);
      if (!record || !items) throw new Error("The service returned an invalid result. Please try again.");
      if (drawing && (typeof raw.image !== "string" || raw.image.length > 14000000 || !/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/=]*$/.test(raw.image))) throw new Error("The image response was invalid. Please try again.");
      const id = crypto.randomUUID();
      const entry: Exploration = { id, kind: drawing ? "drawing" : "inspiration", context, record, directions: items,
        description: drawing ? `${kind} study: ${chosen.title}` : question };
      latest.current.onChange("explorations", [...latest.current.draft.explorations, entry].slice(-MAX_RECORDS));
      if (drawing) setImage({ src: raw.image as string, id, context, title: chosen.title });
      else setSelected(0);
      setNotice(drawing ? "Drawing ready. Download the PNG before leaving this tab." : "Three directions ready to compare. These are AI suggestions, not required solutions.");
    } catch (e) {
      if (active.current === controller) setError(timeout ? "Generation timed out. You can retry; the provider may still finish the earlier request." : controller.signal.aborted ? "Request canceled." : e instanceof Error ? e.message : "Generation failed.");
    } finally {
      clearTimeout(timer); if (active.current === controller) { active.current = null; setBusy(false); }
    }
  }
  function adopt(direction: Direction) {
    onChange("concepts", [...draft.concepts, { id: crypto.randomUUID(), title: direction.title,
      premise: `[AI starting point — develop in your own words]\n${direction.idea}\n${direction.requirement_connection}`,
      moves: `Trade-off: ${direction.trade_off}\nStill to resolve: ${direction.unresolved}`, experiment: direction.experiment }]);
    setNotice("Added to your concept board below. Edit and compare it with your other concepts.");
  }
  return <section className="studio-card studio-section" aria-label="Design inspiration">
    <h2>Explore design directions</h2>
    <AiAvailability />
    <p>Explore three AI ideas from your brief. These aren’t researched precedents.</p>
    {!valid && <><p>Analyze and review your assignment before generating ideas or drawings.</p><button type="button" onClick={onOpenBrief}>Review assignment first</button></>}
    <label htmlFor="inspiration-focus">What would you like to explore?</label>
    <textarea id="inspiration-focus" maxLength={2000} rows={3} value={focus} disabled={busy}
      placeholder="For example: connect public space to the waterfront while keeping pool circulation clear."
      onChange={e => setFocus(e.target.value)} />
    <p className="studio-small">Generation sends your brief, reviewed requirements, corrections, clarification answers, and this focus to OpenAI. Drawings also send the selected direction and refinement. Each request may incur API charges.</p>
    <button type="button" disabled={!valid || busy} onClick={() => void generate(false)}>{busy ? "Generating…" : "Generate three directions"}</button>
    {busy && <button type="button" className="studio-secondary" onClick={() => { active.current?.abort(); active.current = null; setBusy(false); setNotice("Canceled locally. The provider may still process and charge for this request."); }}>Cancel generation</button>}
    {error && <p role="alert" className="studio-error">{error}</p>}
    <p aria-live="polite">{notice}</p>
    {directions.length > 0 && <>
      <div className="studio-grid">{directions.map((d, i) => <article key={`${run!.id}-${i}`} className="studio-item">
        <h3>{d.title}</h3><p>{d.idea}</p><h4>Connection to requirements</h4><p>{d.requirement_connection}</p>
        {d.supporting_quotes.map((q, j) => <blockquote key={j}>{q}</blockquote>)}
        <h4>Trade-off</h4><p>{d.trade_off}</p><h4>Try a sketch or model</h4><p>{d.experiment}</p><h4>Still unresolved</h4><p>{d.unresolved}</p>
        <button type="button" disabled={busy} aria-pressed={selected === i} onClick={() => setSelected(i)}>{selected === i ? "Selected for drawing" : "Select for drawing"}</button>
        <button type="button" className="studio-secondary" disabled={draft.concepts.length >= MAX_CONCEPTS || busy} onClick={() => adopt(d)}>Add to concept board</button>
      </article>)}</div>
    </>}
    <section aria-label="Generate images" className="studio-analysis">
      <h3>Generate images</h3>
      <p>Choose a drawing type, add details, and generate a PNG.</p>
      {!valid ? <p>Review your assignment in Brief &amp; exercises first.</p> : !chosen ? <p>Generate ideas above, then select one to draw.</p> : <p><strong>Selected direction:</strong> {chosen.title}</p>}
      <p>Concept studies: not to scale, verified plans, or replacements for required models. Check against your brief.</p>
      <label htmlFor="drawing-type">Drawing type</label><select id="drawing-type" disabled={busy} value={kind} onChange={e => setKind(e.target.value)}>
        <option value="parti">Parti / organizing idea</option><option value="bubble">Program bubble diagram</option><option value="massing">Rough massing illustration</option>
        <option value="perspective">Exterior concept sketch</option>
      </select>
      <label htmlFor="drawing-refinement">Refinement for this drawing (optional)</label>
      <textarea id="drawing-refinement" rows={2} maxLength={1000} disabled={busy} value={refinement} onChange={e => setRefinement(e.target.value)} placeholder="Try a more open courtyard connection." />
      <p className="studio-small">Creates a new image each time. May take several minutes.</p>
      <button type="button" disabled={busy || !valid || !chosen} onClick={() => void generate(true)}>Generate concept drawing</button>
    </section>
    {image && <figure>
      <img className="studio-concept-image" src={image.src} alt={`AI concept study for ${image.title}; not to scale`} />
      <figcaption>AI concept study: {image.title}. Not to scale or verified for compliance.{image.context !== context && " This image uses an earlier assignment context."}</figcaption>
      <a className="studio-source-link" href={image.src} download={`studio-concept-${image.id}.png`}>Download concept drawing (PNG)</a>
    </figure>}
    <p className="studio-small">Download images before leaving this panel. Your project keeps {MAX_RECORDS} generation records; export to keep older ones.</p>
    <details className="studio-context"><summary>AI process record ({draft.explorations.length})</summary>
      <p>Includes prompts, input snapshots, text outputs, provider/model, timestamps, and image settings. PNGs are downloaded separately. Failed or canceled calls and other AI applications are not included.</p>
      <button type="button" disabled={!draft.explorations.length} onClick={() => {
        try { downloadText(JSON.stringify(draft.explorations, null, 2), "studio-ai-process.json", "application/json"); setNotice("Process-record download requested."); }
        catch { setError("Download failed. Copy the record preview below."); }
      }}>Download AI process record</button>
      {draft.explorations.map(r => <details key={r.id}><summary>{r.description} · {r.record.created_at}{r.context !== context ? " · Earlier context" : ""}</summary><pre className="studio-export-preview">{JSON.stringify(r, null, 2)}</pre></details>)}
    </details>
  </section>;
}
