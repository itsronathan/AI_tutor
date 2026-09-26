export const REQUIREMENT_CATEGORIES = ["site", "users", "program", "deliverable", "deadline", "constraint", "assessment"] as const;
export type Requirement = { category: typeof REQUIREMENT_CATEGORIES[number]; requirement: string; quote: string };
export type ClarifyingQuestion = { question: string; reason: string; ask: "student" | "instructor" };
export type AssignmentAnalysis = { source_brief: string; summary: string; requirements: Requirement[]; questions: ClarifyingQuestion[] };
export type AssignmentReply = { answer: string; supporting_quotes: string[]; remaining_questions: string[] };
export type AssignmentTurn = { question: string; reply: AssignmentReply };
export type AssignmentReviewState = {
  analysis: AssignmentAnalysis; reviewed: boolean; reviewNotes: string;
  answers: Record<string, string>; turns: AssignmentTurn[];
};

const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const validText = (value: unknown, max: number): value is string => typeof value === "string" && !!value.trim() && value.length <= max;
const quoteInBrief = (quote: string, brief: string) => brief.replace(/\s+/g, " ").includes(quote.trim().replace(/\s+/g, " "));

export function parseAnalysis(value: unknown): AssignmentAnalysis | null {
  const raw = object(value);
  if (!validText(raw.source_brief, 30000) || !validText(raw.summary, 3000)
    || !Array.isArray(raw.requirements) || raw.requirements.length > 40
    || !Array.isArray(raw.questions) || raw.questions.length > 8) return null;
  const requirements: Requirement[] = [];
  for (const entry of raw.requirements) {
    const row = object(entry);
    if (!REQUIREMENT_CATEGORIES.some(category => category === row.category)
      || !validText(row.requirement, 1000) || !validText(row.quote, 1500)
      || !quoteInBrief(row.quote, raw.source_brief)) return null;
    requirements.push({ category: row.category as Requirement["category"], requirement: row.requirement, quote: row.quote });
  }
  const questions: ClarifyingQuestion[] = [];
  for (const entry of raw.questions) {
    const row = object(entry);
    if (!validText(row.question, 500) || !validText(row.reason, 800) || (row.ask !== "student" && row.ask !== "instructor")) return null;
    questions.push({ question: row.question, reason: row.reason, ask: row.ask });
  }
  return { source_brief: raw.source_brief, summary: raw.summary, requirements, questions };
}

export function parseReply(value: unknown, brief: string): AssignmentReply | null {
  const raw = object(value);
  if (!validText(raw.answer, 6000) || !Array.isArray(raw.supporting_quotes) || raw.supporting_quotes.length > 8
    || !Array.isArray(raw.remaining_questions) || raw.remaining_questions.length > 5) return null;
  if (!raw.supporting_quotes.every((quote): quote is string => validText(quote, 1500) && quoteInBrief(quote, brief))
    || !raw.remaining_questions.every((question): question is string => validText(question, 800))) return null;
  return { answer: raw.answer, supporting_quotes: raw.supporting_quotes, remaining_questions: raw.remaining_questions };
}

export function normalizeReview(value: unknown, brief: string): AssignmentReviewState | null {
  const raw = object(value);
  const analysis = parseAnalysis(raw.analysis);
  // A changed assignment must be analyzed again; never reuse old requirements or answers.
  if (!analysis || analysis.source_brief !== brief.trim()) return null;
  const answers = object(raw.answers);
  const turns: AssignmentTurn[] = [];
  if (Array.isArray(raw.turns)) {
    for (const entry of raw.turns.slice(-20)) {
      const row = object(entry);
      const reply = parseReply(row.reply, brief);
      if (validText(row.question, 2000) && reply) turns.push({ question: row.question, reply });
    }
  }
  return {
    analysis, reviewed: raw.reviewed === true,
    reviewNotes: typeof raw.reviewNotes === "string" ? raw.reviewNotes.slice(0, 4000) : "",
    answers: Object.fromEntries(analysis.questions.map((_, index) => [String(index), typeof answers[index] === "string" ? answers[index].slice(0, 2000) : ""])),
    turns,
  };
}
