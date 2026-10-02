import type { AssignmentReviewState } from "./assignmentReview";

export type Direction = { title: string; idea: string; requirement_connection: string; supporting_quotes: string[]; trade_off: string; experiment: string; unresolved: string };
export type ProcessRecord = { created_at: string; provider: string; model: string; prompt: string; input: string; size?: string; quality?: string };
export type Exploration = { id: string; kind: "inspiration" | "drawing"; context: string; record: ProcessRecord; directions: Direction[]; description: string };
export const MAX_RECORDS = 12;
const obj = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const str = (v: unknown, max: number): v is string => typeof v === "string" && !!v.trim() && v.length <= max;

export function reviewContext(brief: string, review: AssignmentReviewState | null) {
  return { brief: brief.trim(), analysis: review?.analysis, reviewed: !!review?.reviewed, review_notes: review?.reviewNotes || "",
    clarifications: review?.analysis.questions.flatMap((q, i) => review.answers[i]?.trim() ? [{ question: q.question, answer: review.answers[i].trim() }] : []) || [],
    history: [] };
}

export function parseDirections(value: unknown, brief: string): Direction[] | null {
  if (!Array.isArray(value) || value.length !== 3) return null;
  const list: Direction[] = [];
  for (const entry of value) {
    const row = obj(entry);
    if (!str(row.title, 200) || !str(row.idea, 1500) || !str(row.requirement_connection, 1500)
      || !str(row.trade_off, 1000) || !str(row.experiment, 1000) || !str(row.unresolved, 1000)
      || !Array.isArray(row.supporting_quotes) || row.supporting_quotes.length < 1 || row.supporting_quotes.length > 4
      || !row.supporting_quotes.every(q => str(q, 1500) && brief.replace(/\s+/g, " ").includes(q.trim().replace(/\s+/g, " ")))) return null;
    list.push({ title: row.title, idea: row.idea, requirement_connection: row.requirement_connection, supporting_quotes: row.supporting_quotes as string[], trade_off: row.trade_off, experiment: row.experiment, unresolved: row.unresolved });
  }
  return list;
}

export function parseRecord(value: unknown): ProcessRecord | null {
  const r = obj(value);
  if (!str(r.created_at, 100) || !Number.isFinite(Date.parse(r.created_at)) || r.provider !== "OpenAI"
    || !str(r.model, 200) || !str(r.prompt, 100000) || !str(r.input, 150000)) return null;
  return { created_at: r.created_at, provider: r.provider, model: r.model, prompt: r.prompt, input: r.input,
    ...(str(r.size, 40) ? { size: r.size } : {}), ...(str(r.quality, 40) ? { quality: r.quality } : {}) };
}

export function normalizeExplorations(value: unknown): Exploration[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_RECORDS).flatMap(v => {
    const row = obj(v); const record = parseRecord(row.record);
    if (!record || !str(row.id, 100) || !str(row.context, 150000) || !str(row.description, 1000)
      || (row.kind !== "inspiration" && row.kind !== "drawing")) return [];
    try {
      const brief = obj(JSON.parse(row.context)).brief;
      if (!str(brief, 30000)) return [];
      const directions = row.kind === "inspiration" ? parseDirections(row.directions, brief) : [];
      return directions ? [{ id: row.id, kind: row.kind, context: row.context, record, directions, description: row.description } as Exploration] : [];
    } catch { return []; }
  });
}

export function downloadText(text: string, filename: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
