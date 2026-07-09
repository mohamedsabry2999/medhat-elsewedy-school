// Server functions for registrations and sync settings.
// Public: submitRegistration (form). Admin-only: list/update/settings/resync.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

/* ----------------------------- Types & schemas ----------------------------- */

export const REGISTRATION_STATUSES = [
  "جديد",
  "تم التواصل",
  "مؤكد",
  "حضر",
  "لم يحضر",
  "ملغي",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export type SyncStatus = "pending" | "synced" | "failed";

export type Registration = {
  id: string;
  registration_code: string;
  student_name: string;
  national_id: string;
  guardian_phone: string;
  whatsapp: string;
  governorate: string;
  edu_dept: string;
  score: string;
  attendees: number;
  visit_day: string;
  time_slot: string;
  visit_date: string;
  visit_location: string;
  notes: string;
  status: RegistrationStatus;
  source: string;
  sync_status: SyncStatus;
  sync_error: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
};

const submitSchema = z.object({
  studentName: z.string().trim().min(3).max(120),
  nationalId: z.string().trim().regex(/^\d{14}$/),
  guardianPhone: z.string().trim().regex(/^\d{10,15}$/),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/),
  governorate: z.string().trim().min(1).max(60),
  eduDept: z.string().trim().min(2).max(120),
  score: z.string().trim().regex(/^\d{1,3}$/),
  attendees: z.number().int().min(1).max(3),
  visitDay: z.string().trim().min(1).max(30),
  timeSlot: z.string().trim().min(1).max(120),
  visitDate: z.string().trim().min(1).max(20),
  visitLocation: z.string().trim().max(200).optional().default(""),
  notes: z.string().max(500).optional().default(""),
});

/* --------------------------------- Helpers --------------------------------- */

function serverPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

function rowValues(r: Registration): (string | number)[] {
  return [
    r.registration_code,
    r.created_at,
    r.student_name,
    r.national_id,
    r.guardian_phone,
    r.whatsapp,
    r.governorate,
    r.edu_dept,
    r.score,
    r.attendees,
    r.visit_day,
    r.time_slot,
    r.visit_location,
    r.status,
    r.notes,
    r.source,
    r.updated_at,
  ];
}

function sheetsAuthHeaders(): Record<string, string> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const connKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lovableKey || !connKey) {
    throw new Error("google_sheets_not_connected");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connKey,
    "Content-Type": "application/json",
  };
}

async function findRowIndexByCode(
  spreadsheetId: string,
  tabName: string,
  code: string,
): Promise<number | null> {
  const url = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${tabName}!A:A`;
  const res = await fetch(url, { headers: sheetsAuthHeaders() });
  if (!res.ok) return null;
  const body = (await res.json()) as { values?: string[][] };
  const values = body.values ?? [];
  for (let i = 0; i < values.length; i++) {
    if ((values[i]?.[0] ?? "") === code) return i + 1; // 1-indexed row
  }
  return null;
}

async function pushToSheet(
  action: "create" | "update",
  r: Registration,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: settings } = await supabaseAdmin
    .from("sync_settings")
    .select("sheet_id, tab_name")
    .eq("id", 1)
    .maybeSingle();

  const spreadsheetId = settings?.sheet_id?.trim();
  const tabName = settings?.tab_name?.trim() || "Registrations";

  if (!spreadsheetId) {
    return { ok: false, error: "sheet_id_not_configured" };
  }

  try {
    const headers = sheetsAuthHeaders();
    const values = rowValues(r);

    if (action === "update") {
      const rowIdx = await findRowIndexByCode(spreadsheetId, tabName, r.registration_code);
      if (rowIdx) {
        const range = `${tabName}!A${rowIdx}:Q${rowIdx}`;
        const url = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`;
        const res = await fetch(url, {
          method: "PUT",
          headers,
          body: JSON.stringify({ values: [values] }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
        }
        return { ok: true };
      }
      // fall through to append if row not found
    }

    const appendUrl = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${tabName}!A:Q:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
    const res = await fetch(appendUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ values: [values] }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message.slice(0, 300) };
  }
}


async function markSync(id: string, ok: boolean, error?: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("registrations")
    .update(
      ok
        ? { sync_status: "synced", sync_error: null, synced_at: new Date().toISOString() }
        : { sync_status: "failed", sync_error: error ?? "unknown" },
    )
    .eq("id", id);
}

/* -------------------------------- Public API ------------------------------- */

// Insert via anon publishable key so RLS INSERT policy applies. Then sync via admin client.
export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((raw) => submitSchema.parse(raw))
  .handler(async ({ data }) => {
    const insertPayload = {
      student_name: data.studentName,
      national_id: data.nationalId,
      guardian_phone: data.guardianPhone,
      whatsapp: data.whatsapp,
      governorate: data.governorate,
      edu_dept: data.eduDept,
      score: data.score,
      attendees: data.attendees,
      visit_day: data.visitDay,
      time_slot: data.timeSlot,
      visit_date: data.visitDate,
      visit_location: data.visitLocation ?? "",
      notes: data.notes ?? "",
      source: "website",
    };

    // Insert via admin client: Zod already validated inputs, and the anon role
    // has no SELECT policy so `.select().single()` after INSERT would fail RLS.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Diagnostic: attempt raw fetch as service role to confirm creds path.
    try {
      const rr = await fetch(`${process.env.SUPABASE_URL}/rest/v1/registrations`, {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(insertPayload),
      });
      console.log("[submitRegistration] raw fetch status:", rr.status, "body:", (await rr.text()).slice(0, 200));
    } catch (e) {
      console.log("[submitRegistration] raw fetch err:", (e as Error).message);
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("registrations")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !inserted) {
      console.error("[submitRegistration] insert failed", error);
      throw new Error("تعذر حفظ التسجيل، يرجى المحاولة لاحقًا.");
    }

    const full = inserted as Registration;
    const result = await pushToSheet("create", full);
    await markSync(full.id, result.ok, result.ok ? undefined : result.error);

    return {
      id: inserted.id,
      registration_code: inserted.registration_code,
      visit_day: inserted.visit_day,
      time_slot: inserted.time_slot,
      visit_date: inserted.visit_date,
    };
  });

/* -------------------------------- Admin API -------------------------------- */

export const listRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Registration[];
  });

export const updateRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ id: z.string().uuid(), status: z.enum(REGISTRATION_STATUSES) }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("registrations")
      .update({ status: data.status, sync_status: "pending", sync_error: null })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message ?? "not_found");
    const result = await pushToSheet("update", row as Registration);
    await markSync(row.id, result.ok, result.ok ? undefined : result.error);
    return { ok: true };
  });

export const cancelRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("registrations")
      .update({
        status: "ملغي",
        sync_status: "pending",
        sync_error: null,
        notes: "تم الإلغاء بواسطة الأدمن",
      })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error || !row) throw new Error(error?.message ?? "not_found");
    const result = await pushToSheet("update", row as Registration);
    await markSync(row.id, result.ok, result.ok ? undefined : result.error);
    return { ok: true };
  });

export const resyncRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("registrations")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "not_found");
    const result = await pushToSheet("update", row as Registration);
    await markSync(row.id, result.ok, result.ok ? undefined : result.error);
    return { ok: result.ok, error: result.ok ? null : result.error };
  });

export const resyncAllPending = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("registrations")
      .select("*")
      .in("sync_status", ["pending", "failed"])
      .limit(200);
    if (error) throw new Error(error.message);
    let success = 0;
    let failure = 0;
    for (const row of (rows ?? []) as Registration[]) {
      const result = await pushToSheet("update", row);
      await markSync(row.id, result.ok, result.ok ? undefined : result.error);
      if (result.ok) success++;
      else failure++;
    }
    return { success, failure, total: rows?.length ?? 0 };
  });

/* ----------------------------- Sync settings ------------------------------ */

export type SyncSettings = {
  sheet_id: string;
  webhook_url: string;
  tab_name: string;
  updated_at: string;
};

export const getSyncSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sync_settings")
      .select("sheet_id, webhook_url, tab_name, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? {
      sheet_id: "",
      webhook_url: "",
      tab_name: "Registrations",
      updated_at: new Date().toISOString(),
    }) as SyncSettings;
  });

export const saveSyncSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z
      .object({
        sheet_id: z.string().trim().max(200).default(""),
        webhook_url: z.string().trim().max(500).default(""),
        tab_name: z.string().trim().min(1).max(60).default("Registrations"),
      })
      .parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("sync_settings")
      .update({
        sheet_id: data.sheet_id,
        webhook_url: data.webhook_url,
        tab_name: data.tab_name,
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const testSheetConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings } = await supabaseAdmin
      .from("sync_settings")
      .select("sheet_id, tab_name")
      .eq("id", 1)
      .maybeSingle();
    const spreadsheetId = settings?.sheet_id?.trim();
    const tabName = settings?.tab_name?.trim() || "Registrations";
    if (!spreadsheetId) {
      return { ok: false, error: "لم يتم إعداد Sheet ID بعد." };
    }
    try {
      const url = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title`;
      const res = await fetch(url, { headers: sheetsAuthHeaders() });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
      }
      const body = (await res.json()) as { properties?: { title?: string } };
      return {
        ok: true,
        error: null as string | null,
        title: body.properties?.title ?? "",
        tab: tabName,
      };
    } catch (err) {
      return { ok: false, error: (err as Error).message.slice(0, 300) };
    }
  });

