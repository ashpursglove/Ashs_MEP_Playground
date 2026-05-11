/**
 * Tiny runtime helper that abstracts Tauri vs browser. Both paths are supported
 * because `npm run dev` opens Vite in a regular browser tab (no Rust required).
 */

let cachedIsTauri: boolean | null = null;

export function isTauriRuntime(): boolean {
  if (cachedIsTauri !== null) return cachedIsTauri;
  cachedIsTauri =
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
  return cachedIsTauri;
}
