// Simple client-side admin auth (no backend). Suitable for now; swap for
// Lovable Cloud auth later without changing call sites.

const KEY = "meat_admin_session_v1";
const ALLOWED_EMAIL = "mohamedsabryabdelfatah@gmail.com";
const ADMIN_PASSWORD = "meat2026"; // change here to rotate

export function loginAdmin(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === ALLOWED_EMAIL &&
    password === ADMIN_PASSWORD;
  if (!ok) return false;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ email: ALLOWED_EMAIL, at: Date.now() }),
    );
  }
  return true;
}

export function logoutAdmin() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    const s = JSON.parse(raw) as { email?: string };
    return s.email === ALLOWED_EMAIL;
  } catch {
    return false;
  }
}
