import { useEffect, useRef, useState } from "react";
import { DEMO_BRIEF, DEMO_DIRECTIONS, DEMO_STEPS, demoExport, normalizeDemo, type DemoNotes } from "./demo";
import { STUDIO_LESSONS } from "./lessons";
import { downloadText } from "./inspiration";

export default function StudioDemo({ ownerId, onFinish }: { ownerId: string; onFinish: () => void }) {
  const storageKey = `studio-professor-demo:v1:${ownerId}`;
  const [initial] = useState(() => {
    try { return { notes: normalizeDemo(JSON.parse(localStorage.getItem(storageKey) || "null")), error: "" }; }
    catch { return { notes: normalizeDemo(null), error: "Saved demo notes could not be restored. Export your notes before leaving." }; }
  });
  const [notes, setNotes] = useState(initial.notes);
  const [status, setStatus] = useState(initial.error);
  const [step, setStep] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => { stage.current?.focus({ preventScroll: true }); stage.current?.scrollIntoView?.({ block: "start" }); }, [step]);
  const [showRoute, setShowRoute] = useState(true);
  const lesson = STUDIO_LESSONS[notes.topic];
  const direction = DEMO_DIRECTIONS[notes.direction];
  function update(patch: Partial<DemoNotes>) {
    const next = { ...notes, ...patch }; setNotes(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStatus("Demo notes saved in this browser."); }
    catch { setStatus("Browser storage is unavailable. Export your notes before leaving."); }
  }
  function go(next: number) { setStep(next); }
  return <section className="studio-card studio-section" aria-label="Professor demo">
    <p className="studio-eyebrow">Guided demo · About 8–10 minutes · No API key needed</p>
    <h2>From assignment to a design question</h2>
    <p>Walk through the student experience together, then capture your professor’s feedback. The goal is to support early design thinking and discussion.</p>
    <p className="studio-demo-notice"><strong>Example mode:</strong> the assignment, analysis, ideas, and diagrams below are authored examples, not live AI output or an official RPI assignment. Demo notes are stored separately from your project. Guest notes are shared by people using this browser.</p>
    <nav className="studio-nav" aria-label="Demo steps">{DEMO_STEPS.map((title, index) => <button key={title} type="button" aria-current={step === index ? "step" : undefined} aria-pressed={step === index} disabled={index > 0 && !notes.reviewed} onClick={() => go(index)}>{index + 1}. {title}</button>)}</nav>
    <p role="status">Step {step + 1} of {DEMO_STEPS.length}: {DEMO_STEPS[step]}</p>
    <div ref={stage} tabIndex={-1} className="studio-demo-stage" aria-label={DEMO_STEPS[step]}>
    {step === 0 && <div>
      <h3>1. Start with what the assignment actually asks</h3>
      <blockquote>{DEMO_BRIEF}</blockquote>
      <h4>Example requirement review</h4>
      <ul><li><strong>Program:</strong> “a gathering room, a quiet reading room, and a shared outdoor space”</li><li><strong>Connection:</strong> “Connect all three spaces with a clear arrival route.”</li><li><strong>Deliverables:</strong> “Compare two spatial arrangements and present a diagram and a short explanation of your choice.”</li></ul>
      <h4>Missing information to ask about</h4><p>The brief gives no site dimensions, area targets, orientation, budget, or submission date. A courtyard is a design suggestion, not a stated requirement.</p>
      <p><strong>Discuss:</strong> Does this review help the student identify what is required before jumping to a building shape?</p>
      <label className="studio-check"><input type="checkbox" checked={notes.reviewed} onChange={event => update({ reviewed: event.target.checked })} />I compared the example requirements with the brief.</label>
    </div>}
    {step === 1 && <div>
      <h3>2. Learn a concept, then try it</h3>
      <details><summary>Studio vocabulary: program, parti, and massing</summary><dl><dt><strong>Program</strong></dt><dd>The activities and spaces a project needs to accommodate. Here: gathering, reading, and shared outdoor use.</dd><dt><strong>Parti</strong></dt><dd>A simple diagram of the main organizing idea, such as rooms around a courtyard.</dd><dt><strong>Massing</strong></dt><dd>The arrangement of building volumes. A quick block model tests form before detailed plans.</dd></dl></details>
      <nav className="studio-nav" aria-label="Demo key concepts">{STUDIO_LESSONS.map((item, index) => <button key={item.id} type="button" aria-pressed={notes.topic === index} onClick={() => update({ topic: index })}>{item.title}</button>)}</nav>
      <h4>{lesson.title}</h4><p>{lesson.concept}</p><p><strong>Example:</strong> {lesson.example}</p>
      <p><strong>One-minute demonstration:</strong> {lesson.steps[0]} Talk through what you would draw; the full exercise is available in Learn.</p>
      <label htmlFor="demo-reflection">Student reflection — what would you test in the pavilion?</label><textarea id="demo-reflection" value={notes.reflection} maxLength={4000} rows={3} onChange={event => update({ reflection: event.target.value })} />
      <p><strong>Discuss:</strong> Is this explanation appropriate for the students in your studio? What terminology or depth is missing?</p>
    </div>}
    {step === 2 && <div>
      <h3>3. Compare possibilities before choosing</h3><p>These three authored directions demonstrate the structure of the live inspiration feature. Choose one to explore; no option receives an automatic grade.</p>
      <div className="studio-demo-options">{DEMO_DIRECTIONS.map((item, index) => <article className="studio-demo-option" key={item.title}>
        <h4>{item.title}</h4><p>{item.idea}</p><p><strong>Connection to the brief:</strong> {item.connection}</p><p><strong>Trade-off:</strong> {item.tradeoff}</p><p><strong>Experiment:</strong> {item.test}</p>
        <button type="button" aria-pressed={notes.direction === index} onClick={() => update({ direction: index })}>Explore {item.title.toLowerCase()}</button>
      </article>)}</div>
      <p><strong>Discuss:</strong> Do these alternatives encourage exploration, or steer the student too strongly?</p>
    </div>}
    {step === 3 && <div>
      <h3>4. Read a diagram as a question</h3><p><strong>{direction.title}:</strong> {direction.idea}</p>
      <label className="studio-check"><input type="checkbox" checked={showRoute} onChange={event => setShowRoute(event.target.checked)} />Show possible arrival connections</label>
      <svg className="studio-demo-diagram" viewBox="0 0 440 290" role="img" aria-label={`${direction.title}: conceptual relationships between gathering, reading, and outdoor space${showRoute ? ", with possible arrival connections" : ""}`}>
        <title>{direction.title} — authored relationship diagram, not to scale</title>
        <rect width="440" height="290" fill="#f7f3ea" />
        {showRoute && <g stroke="#0f766e" strokeWidth="3" strokeDasharray="6 5" fill="none"><path d={`M220 260 L${direction.points[2][0]} ${direction.points[2][1]} L${direction.points[0][0]} ${direction.points[0][1]}`} /><path d={`M${direction.points[2][0]} ${direction.points[2][1]} L${direction.points[1][0]} ${direction.points[1][1]}`} /></g>}
        {direction.points.map(([x, y], index) => <g key={index}><ellipse cx={x} cy={y} rx="62" ry="33" fill={index === 2 ? "#d9ead6" : "#e1ecea"} stroke="#345f58" strokeWidth="2" /><text x={x} y={y + 5} textAnchor="middle" fill="#173c35" fontSize="15">{["Gathering", "Reading", "Outdoor"][index]}</text></g>)}
        <text x="220" y="279" textAnchor="middle" fill="#173c35" fontSize="13">Possible arrival · NOT TO SCALE</text>
      </svg>
      <p>The bubbles show relationships, not room sizes or a building plan. Dashed lines suggest connections, not verified accessible routes. Orientation and dimensions remain unknown.</p>
      <p><strong>Next experiment:</strong> {direction.test}</p>
      <label htmlFor="demo-observation">What would you change or test in your own sketch?</label><textarea id="demo-observation" maxLength={4000} rows={3} value={notes.observation} onChange={event => update({ observation: event.target.value })} />
      <p><strong>Discuss:</strong> Is this level of visual help useful before a student makes their own drawing?</p>
    </div>}
    {step === 4 && <div>
      <h3>5. Capture feedback and decide what to improve</h3><p>Selected direction: <strong>{direction.title}</strong>. These notes are for discussion; they are not a student grade and are not sent automatically.</p>
      {([['useful', 'What helped the student get started?'], ['confusing', 'What was unclear, inaccurate, or too directive?'], ['change', 'What should we change first for your studio?']] as const).map(([key, label]) => <div key={key}><label htmlFor={`demo-${key}`}>{label}</label><textarea id={`demo-${key}`} rows={3} maxLength={4000} value={notes[key]} onChange={event => update({ [key]: event.target.value })} /></div>)}
      <button type="button" onClick={() => downloadText(demoExport(notes), "studio-professor-feedback.txt", "text/plain")}>Download demo notes and feedback</button>
      <h4>Continue with a real project</h4><p>Open your assignment, optionally add the syllabus preset, analyze and review the requirements, then use Learn or Concepts. Live AI analysis, inspiration, and drawings require backend API configuration. The demo examples do not become part of your project.</p>
      <button type="button" className="studio-secondary" onClick={onFinish}>Open my assignment workspace</button>
    </div>}
    </div>
    <div className="studio-demo-controls"><button type="button" className="studio-secondary" disabled={step === 0} onClick={() => go(step - 1)}>Previous step</button><button type="button" disabled={step === DEMO_STEPS.length - 1 || !notes.reviewed} onClick={() => go(step + 1)}>Next step</button></div>
    {step === 0 && !notes.reviewed && <p>Review the requirements and check the box above to continue.</p>}
    <p className="studio-small" role="status">{status}</p>
  </section>;
}
