export function dateOnly(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

export function localToday(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function milestoneStatus(due: string, done: boolean, today = localToday()): string {
  if (done) return "Complete";
  if (!dateOnly(due)) return "No date set";
  return due < today ? "Overdue" : due === today ? "Due today" : "Upcoming";
}
