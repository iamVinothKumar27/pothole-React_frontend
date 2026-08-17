// Local session for Google OAuth sign-in (bypasses Firebase entirely). The
// credential here is a session token our own backend issued after verifying
// the user's Google access token — see /api/auth/google. Persisted to
// localStorage so the session survives a page reload.
const STORAGE_KEY = "google_oauth_session";

export function loadGoogleSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session?.credential || !session?.exp || session.exp * 1000 <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveGoogleSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearGoogleSession() {
  localStorage.removeItem(STORAGE_KEY);
}
