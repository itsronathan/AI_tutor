import { PROMPTS } from "./prompts";

export type Concept = { id: string; title: string; premise: string; moves: string; experiment: string };
export const MAX_CONCEPTS = 12;
export type StudioDraft = {
  title: string; brief: string; interests: string; experience: string;
  site: string; users: string; requirements: string; openQuestions: string;
  promptNotes: Record<string, string>;
  concepts: Concept[];
  comparisonIds: string[]; directionId: string; decisionNotes: string;
};
export const EMPTY_DRAFT: StudioDraft = {
  title: "", brief: "", interests: "", experience: "",
  site: "", users: "", requirements: "", openQuestions: "",
  promptNotes: {},
  concepts: [],
  comparisonIds: [], directionId: "", decisionNotes: "",
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
