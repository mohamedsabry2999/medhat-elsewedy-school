// Text Content Manager — every hardcoded string on the site can go through here.
//
// Public components call useContent(key, defaultValue) — the hook returns
// current_value when the key exists, otherwise the defaultValue is used and
// the key is auto-registered in the background so admins can edit it from the
// dashboard without any code change.
//
// Admin dashboard reads/writes via listContentBlocks/saveContent* helpers.
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContentBlockType =
  | "text" | "textarea" | "richtext" | "button" | "label" | "message" | "seo" | "alt";

export type ContentBlock = {
  id: string;
  content_key: string;
  page_slug: string;
  section_key: string;
  label: string;
  type: ContentBlockType;
  default_value: string;
  current_value: string;
  draft_value: string | null;
  status: "published" | "draft";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentVersion = {
  id: string;
  content_key: string;
  old_value: string;
  new_value: string;
  status: string;
  updated_by: string | null;
  created_at: string;
};

// ============================================================================
// In-memory cache with reactive subscriptions (avoids a query per useContent)
// ============================================================================

type CacheState = {
  loaded: boolean;
  loading: boolean;
  byKey: Map<string, ContentBlock>;
};

const state: CacheState = { loaded: false, loading: false, byKey: new Map() };
const listeners = new Set<() => void>();
const pendingRegister = new Map<string, RegisterInput>();
let registerTimer: ReturnType<typeof setTimeout> | null = null;

type RegisterInput = {
  content_key: string;
  page_slug: string;
  section_key: string;
  label: string;
  type: ContentBlockType;
  default_value: string;
};

function emit() { listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }
function snapshot() { return state; }
const serverSnapshot: CacheState = { loaded: false, loading: false, byKey: new Map() };

async function ensureLoaded() {
  if (state.loaded || state.loading) return;
  state.loading = true;
  try {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("*")
      .order("page_slug", { ascending: true })
      .order("section_key", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const map = new Map<string, ContentBlock>();
    for (const row of (data ?? []) as ContentBlock[]) map.set(row.content_key, row);
    state.byKey = map;
    state.loaded = true;
  } catch (err) {
    console.warn("[content-store] load failed", err);
  } finally {
    state.loading = false;
    emit();
  }
}

// Realtime — reload cache on any change
let channel: ReturnType<typeof supabase.channel> | null = null;
function ensureRealtime() {
  if (channel || typeof window === "undefined") return;
  channel = supabase
    .channel("content_blocks_stream")
    .on("postgres_changes", { event: "*", schema: "public", table: "content_blocks" }, (payload) => {
      const row = (payload.new ?? payload.old) as ContentBlock | undefined;
      if (!row) return;
      if (payload.eventType === "DELETE") state.byKey.delete(row.content_key);
      else state.byKey.set(row.content_key, payload.new as ContentBlock);
      emit();
    })
    .subscribe();
}

function scheduleRegister(input: RegisterInput) {
  pendingRegister.set(input.content_key, input);
  if (registerTimer) return;
  registerTimer = setTimeout(async () => {
    registerTimer = null;
    const batch = Array.from(pendingRegister.values());
    pendingRegister.clear();
    if (!batch.length) return;
    // Insert-only with onConflict do nothing — RLS lets anon INSERT but not update.
    const rows = batch.map((b) => ({
      content_key: b.content_key,
      page_slug: b.page_slug,
      section_key: b.section_key,
      label: b.label || b.content_key,
      type: b.type,
      default_value: b.default_value,
      current_value: b.default_value,
      status: "published" as const,
    }));
    try {
      const { error } = await supabase
        .from("content_blocks")
        .upsert(rows, { onConflict: "content_key", ignoreDuplicates: true });
      if (error) console.warn("[content-store] auto-register failed", error);
    } catch (err) {
      console.warn("[content-store] auto-register failed", err);
    }
  }, 800);
}

// ============================================================================
// Public hook: useContent(key, defaultValue)
// ============================================================================

export type UseContentOptions = {
  page?: string;
  section?: string;
  label?: string;
  type?: ContentBlockType;
};

export function useContent(
  contentKey: string,
  defaultValue: string,
  opts: UseContentOptions = {},
): string {
  useEffect(() => {
    ensureLoaded();
    ensureRealtime();
  }, []);

  const snap = useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);
  const row = snap.byKey.get(contentKey);

  // Auto-register missing key so admin can edit it later.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!snap.loaded) return;
    if (row) return;
    const [page = "global", section = "general"] = contentKey.split(".");
    scheduleRegister({
      content_key: contentKey,
      page_slug: opts.page ?? page,
      section_key: opts.section ?? section,
      label: opts.label ?? contentKey,
      type: opts.type ?? "text",
      default_value: defaultValue,
    });
  }, [snap.loaded, row, contentKey, defaultValue, opts.page, opts.section, opts.label, opts.type]);

  if (!row) return defaultValue;
  // Never show drafts to visitors.
  return row.status === "published" ? (row.current_value || defaultValue) : (row.current_value || defaultValue);
}

// ============================================================================
// Admin API
// ============================================================================

export async function listContentBlocks(): Promise<ContentBlock[]> {
  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .order("page_slug", { ascending: true })
    .order("section_key", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContentBlock[];
}

export function useAllContentBlocks(): { rows: ContentBlock[]; loaded: boolean } {
  useEffect(() => { ensureLoaded(); ensureRealtime(); }, []);
  const snap = useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);
  const rows = Array.from(snap.byKey.values()).sort((a, b) => {
    if (a.page_slug !== b.page_slug) return a.page_slug.localeCompare(b.page_slug);
    if (a.section_key !== b.section_key) return a.section_key.localeCompare(b.section_key);
    return a.sort_order - b.sort_order;
  });
  return { rows, loaded: snap.loaded };
}

async function recordVersion(block: ContentBlock, newValue: string, status: string) {
  try {
    await supabase.from("content_versions").insert({
      content_key: block.content_key,
      old_value: block.current_value,
      new_value: newValue,
      status,
    });
  } catch (err) { console.warn("[content-store] version log failed", err); }
}

export async function saveContentDraft(id: string, draftValue: string): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from("content_blocks").select("*").eq("id", id).maybeSingle();
  if (fetchErr || !row) throw fetchErr ?? new Error("not found");
  const block = row as ContentBlock;
  await recordVersion(block, draftValue, "draft");
  const { error } = await supabase
    .from("content_blocks")
    .update({ draft_value: draftValue, status: "draft" })
    .eq("id", id);
  if (error) throw error;
}

export async function publishContent(id: string, newValue: string): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from("content_blocks").select("*").eq("id", id).maybeSingle();
  if (fetchErr || !row) throw fetchErr ?? new Error("not found");
  const block = row as ContentBlock;
  await recordVersion(block, newValue, "published");
  const { error } = await supabase
    .from("content_blocks")
    .update({ current_value: newValue, draft_value: null, status: "published" })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreDefault(id: string): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from("content_blocks").select("*").eq("id", id).maybeSingle();
  if (fetchErr || !row) throw fetchErr ?? new Error("not found");
  const block = row as ContentBlock;
  await recordVersion(block, block.default_value, "published");
  const { error } = await supabase
    .from("content_blocks")
    .update({ current_value: block.default_value, draft_value: null, status: "published" })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteContentBlock(id: string): Promise<void> {
  const { error } = await supabase.from("content_blocks").delete().eq("id", id);
  if (error) throw error;
}

export async function updateContentMeta(id: string, patch: Partial<Pick<ContentBlock,
  "label" | "page_slug" | "section_key" | "type" | "sort_order">>) {
  const { error } = await supabase.from("content_blocks").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createContentBlock(input: Omit<RegisterInput, "type"> & {
  type?: ContentBlockType; current_value?: string;
}): Promise<void> {
  const row = {
    content_key: input.content_key.trim(),
    page_slug: input.page_slug || "global",
    section_key: input.section_key || "general",
    label: input.label || input.content_key,
    type: (input.type ?? "text") as ContentBlockType,
    default_value: input.default_value,
    current_value: input.current_value ?? input.default_value,
    status: "published" as const,
  };
  const { error } = await supabase.from("content_blocks").insert(row);
  if (error) throw error;
}

export async function listContentVersions(contentKey: string): Promise<ContentVersion[]> {
  const { data, error } = await supabase
    .from("content_versions")
    .select("*")
    .eq("content_key", contentKey)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ContentVersion[];
}
