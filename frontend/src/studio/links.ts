export function referenceUrl(source: string): string | null {
  try {
    const url = new URL(source.trim());
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
