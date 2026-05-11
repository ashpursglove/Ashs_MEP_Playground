/**
 * Simple recent-files registry persisted to localStorage. Most-recently-used
 * is index 0; capped at MAX entries.
 */

const KEY = "pandid:recent-files";
const MAX = 8;

export interface RecentFile {
  path: string;
  name: string;
  openedAt: string;
}

export function loadRecent(): RecentFile[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RecentFile[]) : [];
  } catch {
    return [];
  }
}

function persist(list: RecentFile[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* localStorage may be unavailable in tests; swallow */
  }
}

export function pushRecent(path: string): RecentFile[] {
  const name = path.replace(/^.*[\\/]/, "");
  const existing = loadRecent().filter((r) => r.path !== path);
  const next = [
    { path, name, openedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX);
  persist(next);
  return next;
}

export function removeRecent(path: string): RecentFile[] {
  const next = loadRecent().filter((r) => r.path !== path);
  persist(next);
  return next;
}

export function clearRecent() {
  persist([]);
}
