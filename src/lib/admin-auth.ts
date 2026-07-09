// Admin auth backed by Supabase. RLS uses public.is_admin() which checks JWT email.
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_EMAIL = "mohamedsabryabdelfatah@gmail.com";

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  if (email.trim().toLowerCase() !== ALLOWED_EMAIL) return false;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: ALLOWED_EMAIL,
    password,
  });
  if (error || !data.session) return false;
  return true;
}

export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function isAdminAuthed(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  return (data.user?.email ?? "").toLowerCase() === ALLOWED_EMAIL;
}
