// Idempotently ensures the fixed admin auth user exists so the login page can
// sign in with Supabase. Safe to call publicly because it only ever provisions
// the single hardcoded email/password with no privilege beyond what RLS grants
// via public.is_admin().
import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "mohamedsabryabdelfatah@gmail.com";
const ADMIN_PASSWORD = "meat2026";

export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("[ensureAdminUser] listUsers", listErr);
    return { ok: false as const };
  }
  const exists = list.users.some((u) => (u.email ?? "").toLowerCase() === ADMIN_EMAIL);
  if (exists) return { ok: true as const };

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error("[ensureAdminUser] createUser", error);
    return { ok: false as const };
  }
  return { ok: true as const };
});
