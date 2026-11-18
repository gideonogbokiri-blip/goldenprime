// Safe localStorage wrapper. Some mobile/in-app browsers (e.g. Android WebView,
// private browsing) throw a SecurityError on any storage access — if that
// happens we silently fall back to no persistence instead of crashing the app.
export const storage = {
  get(key: string): string | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
};
