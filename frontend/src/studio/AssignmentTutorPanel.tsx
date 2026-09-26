import { useEffect, useRef, useState } from "react";
import { analyzeBrief, askAboutBrief } from "./assignmentApi";
import type { AssignmentReviewState } from "./assignmentReview";

export default function AssignmentTutorPanel({ brief, review, onChange, questionPrefix = "" }: {
  brief: string; review: AssignmentReviewState | null;
  onChange: (value: AssignmentReviewState) => void;
  questionPrefix?: string;
}) {
  const [busy, setBusy] = useState<"analysis" | "answer" | null>(null);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const active = useRef<AbortController | null>(null);
  const latest = useRef({ brief, review, onChange });
  useEffect(() => { latest.current = { brief, review, onChange }; }, [brief, review, onChange]);
  useEffect(() => {
    active.current?.abort();
    active.current = null;
    setBusy(null);
    setError("");
    setQuestion("");
  }, [brief]);
  useEffect(() => () => { active.current?.abort(); active.current = null; }, []);

  async function run(kind: "analysis" | "answer") {
    const source = brief.trim();
    const asked = question.trim();
    if (active.current || !source || (kind === "answer" && (!review?.reviewed || !asked))) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(kind);
    setError("");
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 120000);
    try {
      if (kind === "analysis") {
        const analysis = await analyzeBrief(source, controller.signal);
        if (!controller.signal.aborted && active.current === controller && latest.current.brief.trim() === source) {
          latest.current.onChange({ analysis, reviewed: false, reviewNotes: "", answers: {}, turns: [] });
        }
      } else if (review) {
        const contextualQuestion = questionPrefix + asked;
        const reply = await askAboutBrief(source, review, contextualQuestion, controller.signal);
        const current = latest.current.review;
        if (!controller.signal.aborted && active.current === controller && current?.analysis.source_brief === source && latest.current.brief.trim() === source) {
          latest.current.onChange({ ...current, turns: [...current.turns, { question: contextualQuestion, reply }].slice(-20) });
          setQuestion("");
        }
      }
    } catch (failure) {
      if (active.current === controller) {
        if (timedOut) setError("The tutor took too long to respond. Your notes are still here; please try again.");
        else if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "The request failed. Please try again.");
      }
    } finally {
      clearTimeout(timeout);
      if (active.current === controller) { active.current = null; setBusy(null); }
    }
  }

  return <section className="studio-analysis" aria-label="Assignment analysis and tutor">
    <h3>Understand the assignment first</h3>
    <p>Review the requirements before asking the tutor about your project. Analysis sends your brief to the AI service; follow-up sends the brief, review notes, clarification answers, and recent conversation.</p>
    {!review && <>
      <button type="button" disabled={!brief.trim() || !!busy} onClick={() => void run("analysis")}>
        {busy === "analysis" ? "Analyzing assignment…" : "Analyze assignment"}
      </button>
      <p className="studio-small">The tutor will look for required spaces, constraints, deliverables, dates, and important unanswered questions.</p>
    </>}
    {busy && <p aria-live="polite">{busy === "analysis" ? "Reading the assignment requirements…" : "Answering using your reviewed assignment…"}{" "}
      <button className="studio-secondary" type="button" onClick={() => {
        active.current?.abort(); active.current = null; setBusy(null); setError("Request canceled. You can try again.");
      }}>Cancel request</button>
    </p>}
    {error && <p className="studio-error" role="alert">{error}</p>}
    {review && <>
      <h3>Assignment summary</h3>
      <p className="studio-preserve">{review.analysis.summary}</p>
      <h3>Requirements found in the brief</h3>
      <p className="studio-small">Check this AI review against the original brief. Each item includes its source text.</p>
      {!review.analysis.requirements.length && <p>No explicit requirements were identified. Check whether the full assignment was pasted.</p>}
      <ul className="studio-requirements">{review.analysis.requirements.map((item, index) => <li key={index}>
        <span className="studio-category">{item.category}</span>
        <p>{item.requirement}</p><blockquote>{item.quote}</blockquote>
      </li>)}</ul>
      <label htmlFor="studio-review-notes">Corrections or additional context</label>
      <textarea id="studio-review-notes" rows={3} maxLength={4000} value={review.reviewNotes} disabled={!!busy}
        placeholder="Note anything misread or clarified by your instructor."
        onChange={event => onChange({ ...review, reviewNotes: event.target.value })} />
      <label className="studio-check"><input type="checkbox" checked={review.reviewed} disabled={!!busy}
        onChange={event => onChange({ ...review, reviewed: event.target.checked })} />I have reviewed these requirements against my assignment.</label>
      {!review.reviewed && <p className="studio-small">Review the requirements to unlock clarification answers and the assignment tutor.</p>}
      {review.reviewed && <>
        <h3>Fill in what is still unknown</h3>
        <p>You can leave questions open and return later. Instructor questions need an answer from your course, rather than a guess.</p>
        {!review.analysis.questions.length && <p>No essential clarification questions were identified. You can ask your own below.</p>}
        {review.analysis.questions.map((item, index) => <div className="studio-clarification" key={index}>
          <label htmlFor={`assignment-answer-${index}`}>{item.question}</label>
          <p className="studio-small">{item.ask === "instructor" ? "Check with your instructor" : "Your design choice"} · {item.reason}</p>
          <textarea id={`assignment-answer-${index}`} rows={2} maxLength={2000} disabled={!!busy}
            placeholder={item.ask === "instructor" ? "Record the instructor’s clarification when available" : "Your answer, or leave open for now"}
            value={review.answers[index] || ""} onChange={event => onChange({ ...review, answers: { ...review.answers, [index]: event.target.value } })} />
        </div>)}
        <h3>Ask about this assignment</h3>
        <p>The tutor uses the brief and your clarification answers. Earlier replies reflect the context available when you asked.</p>
        <div className="studio-conversation" aria-label="Assignment conversation">
          {review.turns.map((turn, index) => <article className="studio-turn" key={index}>
            <h4>You asked</h4><p className="studio-preserve">{turn.question}</p>
            <h4>Assignment tutor</h4><p className="studio-preserve">{turn.reply.answer}</p>
            {turn.reply.supporting_quotes.length > 0 && <details><summary>Supporting text from the brief</summary>
              {turn.reply.supporting_quotes.map((quote, quoteIndex) => <blockquote key={quoteIndex}>{quote}</blockquote>)}
            </details>}
            {turn.reply.remaining_questions.length > 0 && <><h4>Still to clarify</h4><ul>{turn.reply.remaining_questions.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul></>}
          </article>)}
        </div>
        <label htmlFor="assignment-question">Your question for the assignment tutor</label>
        <textarea id="assignment-question" rows={3} maxLength={2000 - questionPrefix.length} value={question} disabled={!!busy}
          placeholder="e.g. What should I explore first while meeting these requirements?"
          onChange={event => setQuestion(event.target.value)} />
        <button type="button" disabled={!!busy || !question.trim()} onClick={() => void run("answer")}>{busy === "answer" ? "Answering…" : "Ask assignment tutor"}</button>
        <p className="studio-small">The most recent 20 answers are kept in this browser. The tutor receives the last six turns for context. Export your notes to keep a snapshot.</p>
      </>}
    </>}
  </section>;
}
