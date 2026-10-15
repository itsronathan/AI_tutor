import { loadDraft, normalizeDraft, record, rows, text, type StudioDraft } from "./model";

export type Project = { id: string; draft: StudioDraft };
export type ProjectLibrary = { activeId: string; projects: Project[] };
export const MAX_PROJECTS = 20;
export function loadProjects(key: string): { library: ProjectLibrary; status: string } {
  try {
    const raw = localStorage.getItem(`${key}:projects`);
    if (raw) {
      const source = record(JSON.parse(raw));
      const projects = rows(source.projects, MAX_PROJECTS).map(row => ({ id: text(row.id, 100), draft: normalizeDraft(row.draft) }));
      if (!projects.length) throw new Error("Empty project library");
      return { library: { projects, activeId: projects.some(p => p.id === source.activeId) ? String(source.activeId) : projects[0].id }, status: "Saved project restored." };
    }
  } catch {
    const legacy = loadDraft(key);
    return { library: { activeId: "original", projects: [{ id: "original", draft: legacy.draft }] }, status: "Could not restore the project library. The last draft is available; export it before continuing." };
  }
  const legacy = loadDraft(key);
  return { library: { activeId: "original", projects: [{ id: "original", draft: legacy.draft }] }, status: legacy.status };
}
