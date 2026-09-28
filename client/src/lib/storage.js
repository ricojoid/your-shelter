// localStorage can be unavailable (private mode, blocked storage) — never let that break the app.
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}

export const KEYS = {
  composer: 'ys:composer:v1',
  shelf: 'ys:shelf:v1',
  lastBoard: 'ys:last-board',
  view: 'ys:view',
  introSeen: 'ys:intro-seen',
};
