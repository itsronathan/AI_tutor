import { PROMPTS } from "./prompts";

export type StudioDraft = {
  title: string; brief: string; interests: string; experience: string;
  site: string; users: string; requirements: string; openQuestions: string;
  promptNotes: Record<string, string>;
};
export const EMPTY_DRAFT: StudioDraft = {
  title: "", brief: "", interests: "", experience: "",
  site: "", users: "", requirements: "", openQuestions: "",
  promptNotes: {},
};

export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function text(value: unknown, limit = 4000): string {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

// Keep the original storage key and tolerate fields absent from older drafts.
export function normalizeDraft(value: unknown): StudioDraft {
  const source = record(value);
  return {
    title: text(source.title, 200), brief: text(source.brief, 30000),
    interests: text(source.interests), experience: text(source.experience),
    site: text(source.site), users: text(source.users),
    requirements: text(source.requirements), openQuestions: text(source.openQuestions),
    promptNotes: Object.fromEntries(PROMPTS.map(prompt => [prompt.id, text(record(source.promptNotes)[prompt.id])])),
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
