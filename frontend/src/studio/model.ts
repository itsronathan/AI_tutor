import { PROMPTS } from "./prompts";
import { dateOnly } from "./dates";
import { normalizeReview, type AssignmentReviewState } from "./assignmentReview";

export type Concept = { id: string; title: string; premise: string; moves: string; experiment: string };
export const MAX_CONCEPTS = 12;
export type Precedent = { id: string; title: string; source: string; observation: string; application: string };
export const MAX_PRECEDENTS = 30;
export type Milestone = { id: string; title: string; due: string; done: boolean };
export const MAX_MILESTONES = 50;
export type Critique = { id: string; date: string; reviewer: string; feedback: string; response: string; nextAction: string; done: boolean };
export const MAX_CRITIQUES = 50;
export type PresentationItem = { id: string; label: string; done: boolean };
export const MAX_PRESENTATION_ITEMS = 40;
export type StudioDraft = {
  title: string; brief: string; interests: string; experience: string;
  site: string; users: string; requirements: string; openQuestions: string;
  promptNotes: Record<string, string>;
  concepts: Concept[];
  comparisonIds: string[]; directionId: string; decisionNotes: string;
  precedents: Precedent[];
  milestones: Milestone[];
  critiques: Critique[];
  presentationItems: PresentationItem[]; presentationStory: string; reviewQuestions: string;
  assignmentReview: AssignmentReviewState | null;
};
export const EMPTY_DRAFT: StudioDraft = {
  title: "", brief: "", interests: "", experience: "",
  site: "", users: "", requirements: "", openQuestions: "",
  promptNotes: {},
  concepts: [],
  comparisonIds: [], directionId: "", decisionNotes: "",
  precedents: [],
  milestones: [],
  critiques: [],
  presentationItems: [], presentationStory: "", reviewQuestions: "",
  assignmentReview: null,
};

export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function text(value: unknown, limit = 4000): string {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

export function rows(value: unknown, limit = 50): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.map(record).filter(row => {
    const id = text(row.id, 100);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, limit);
}

// Keep the original storage key and tolerate fields absent from older drafts.
export function normalizeDraft(value: unknown): StudioDraft {
  const source = record(value);
  const concepts = rows(source.concepts, MAX_CONCEPTS).map(row => ({
    id: text(row.id, 100), title: text(row.title, 200), premise: text(row.premise),
    moves: text(row.moves), experiment: text(row.experiment),
  }));
  const conceptIds = new Set(concepts.map(concept => concept.id));
  return {
    title: text(source.title, 200), brief: text(source.brief, 30000),
    interests: text(source.interests), experience: text(source.experience),
    site: text(source.site), users: text(source.users),
    requirements: text(source.requirements), openQuestions: text(source.openQuestions),
    promptNotes: Object.fromEntries(PROMPTS.map(prompt => [prompt.id, text(record(source.promptNotes)[prompt.id])])),
    concepts,
    comparisonIds: Array.isArray(source.comparisonIds)
      ? [...new Set(source.comparisonIds.filter((id): id is string => typeof id === "string" && conceptIds.has(id)))].slice(0, 3) : [],
    directionId: typeof source.directionId === "string" && conceptIds.has(source.directionId) ? source.directionId : "",
    decisionNotes: text(source.decisionNotes),
    precedents: rows(source.precedents, MAX_PRECEDENTS).map(row => ({
      id: text(row.id, 100), title: text(row.title, 200), source: text(row.source, 1000),
      observation: text(row.observation), application: text(row.application),
    })),
    milestones: rows(source.milestones, MAX_MILESTONES).map(row => ({
      id: text(row.id, 100), title: text(row.title, 200), due: dateOnly(row.due), done: row.done === true,
    })),
    critiques: rows(source.critiques, MAX_CRITIQUES).map(row => ({
      id: text(row.id, 100), date: dateOnly(row.date), reviewer: text(row.reviewer, 200),
      feedback: text(row.feedback), response: text(row.response), nextAction: text(row.nextAction), done: row.done === true,
    })),
    presentationItems: rows(source.presentationItems, MAX_PRESENTATION_ITEMS).map(row => ({
      id: text(row.id, 100), label: text(row.label, 300), done: row.done === true,
    })),
    presentationStory: text(source.presentationStory), reviewQuestions: text(source.reviewQuestions),
    assignmentReview: normalizeReview(source.assignmentReview, text(source.brief, 30000)),
  };
}

export function loadDraft(key: string): { draft: StudioDraft; status: string } {
  try {
    const raw = localStorage.getItem(key);
    return { draft: normalizeDraft(raw ? JSON.parse(raw) : null), status: raw ? "Saved draft restored." : "" };
  } catch {
    return { draft: normalizeDraft(null), status: "Could not restore the saved draft. Browser storage may be unavailable or the saved data may be damaged." };
  }
}
