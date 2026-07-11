// Graduates CMS — Supabase-backed with realtime.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BatchStatus = "منشورة" | "مسودة" | "مخفية";

export type GraduateBatch = {
  id: string;
  title: string;
  slug: string;
  graduation_year: number | null;
  graduates_count: number | null;
  excerpt: string;
  description: string;
  cover_image_url: string;
  cover_image_alt: string;
  status: BatchStatus;
  featured_on_home: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GraduateMedia = {
  id: string;
  batch_id: string;
  media_type: "image" | "video";
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  embed_url: string;
  alt_text: string;
  category: string;
  focal_x: number;
  focal_y: number;
  status: "published" | "hidden";
  sort_order: number;
};

export const BATCH_MEDIA_CATEGORIES = [
  "صور الطلاب",
  "صور التكريم",
  "صور المسرح",
  "صور أولياء الأمور",
  "صور جماعية",
  "كواليس الحفل",
];

function fromBatchRow(r: Record<string, unknown>): GraduateBatch {
  const status = String(r.status ?? "draft");
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    slug: String(r.slug ?? ""),
    graduation_year: r.graduation_year == null ? null : Number(r.graduation_year),
    graduates_count: r.graduates_count == null ? null : Number(r.graduates_count),
    excerpt: String(r.excerpt ?? ""),
    description: String(r.description ?? ""),
    cover_image_url: String(r.cover_image_url ?? ""),
    cover_image_alt: String(r.cover_image_alt ?? ""),
    status: status === "published" ? "منشورة" : status === "hidden" ? "مخفية" : "مسودة",
    featured_on_home: !!r.featured_on_home,
    sort_order: Number(r.sort_order ?? 0),
    published_at: (r.published_at as string) ?? null,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function fromMediaRow(r: Record<string, unknown>): GraduateMedia {
  return {
    id: String(r.id),
    batch_id: String(r.batch_id),
    media_type: (r.media_type as "image" | "video") ?? "image",
    title: String(r.title ?? ""),
    description: String(r.description ?? ""),
    image_url: String(r.image_url ?? ""),
    video_url: String(r.video_url ?? ""),
    embed_url: String(r.embed_url ?? ""),
    alt_text: String(r.alt_text ?? ""),
    category: String(r.category ?? ""),
    focal_x: Number(r.focal_x ?? 0.5),
    focal_y: Number(r.focal_y ?? 0.35),
    status: (r.status as "published" | "hidden") ?? "published",
    sort_order: Number(r.sort_order ?? 0),
  };
}

function statusToDb(s: BatchStatus): string {
  if (s === "منشورة") return "published";
  if (s === "مخفية") return "hidden";
  return "draft";
}

let batchesCache: GraduateBatch[] = [];
let mediaCache: GraduateMedia[] = [];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

async function refetchBatches() {
  const { data, error } = await supabase
    .from("graduate_batches")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("graduation_year", { ascending: false });
  if (!error && data) {
    batchesCache = (data as Record<string, unknown>[]).map(fromBatchRow);
    notify();
  }
}

async function refetchMedia() {
  const { data, error } = await supabase
    .from("graduate_batch_media")
    .select("*")
    .order("sort_order", { ascending: true });
  if (!error && data) {
    mediaCache = (data as Record<string, unknown>[]).map(fromMediaRow);
    notify();
  }
}

let subscribed = false;
function ensureSubscribed() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  refetchBatches();
  refetchMedia();
  supabase
    .channel("graduate-batches-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "graduate_batches" }, refetchBatches)
    .on("postgres_changes", { event: "*", schema: "public", table: "graduate_batch_media" }, refetchMedia)
    .subscribe();
}

function slugify(t: string): string {
  const base = t.trim().toLowerCase().replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "").slice(0, 60);
  return base || `batch-${Date.now()}`;
}

/* ==== Batches CRUD ==== */

export async function createBatch(input: Partial<GraduateBatch> & { title: string }): Promise<GraduateBatch | null> {
  let slug = input.slug?.trim() || slugify(input.title);
  const existing = new Set(batchesCache.map((b) => b.slug));
  let i = 1;
  const base = slug;
  while (existing.has(slug)) slug = `${base}-${i++}`;

  const { data, error } = await supabase
    .from("graduate_batches")
    .insert({
      title: input.title,
      slug,
      graduation_year: input.graduation_year ?? null,
      graduates_count: input.graduates_count ?? null,
      excerpt: input.excerpt ?? "",
      description: input.description ?? "",
      cover_image_url: input.cover_image_url ?? "",
      cover_image_alt: input.cover_image_alt ?? "",
      status: statusToDb(input.status ?? "مسودة"),
      featured_on_home: !!input.featured_on_home,
      sort_order: input.sort_order ?? 0,
      published_at: input.published_at ?? new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) { console.error("createBatch", error); return null; }
  await refetchBatches();
  return fromBatchRow(data as Record<string, unknown>);
}

export async function updateBatch(id: string, patch: Partial<GraduateBatch>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.slug !== undefined) payload.slug = patch.slug;
  if (patch.graduation_year !== undefined) payload.graduation_year = patch.graduation_year;
  if (patch.graduates_count !== undefined) payload.graduates_count = patch.graduates_count;
  if (patch.excerpt !== undefined) payload.excerpt = patch.excerpt;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.cover_image_url !== undefined) payload.cover_image_url = patch.cover_image_url;
  if (patch.cover_image_alt !== undefined) payload.cover_image_alt = patch.cover_image_alt;
  if (patch.status !== undefined) payload.status = statusToDb(patch.status);
  if (patch.featured_on_home !== undefined) payload.featured_on_home = patch.featured_on_home;
  if (patch.sort_order !== undefined) payload.sort_order = patch.sort_order;
  if (patch.published_at !== undefined) payload.published_at = patch.published_at;
  const { error } = await supabase.from("graduate_batches").update(payload as never).eq("id", id);
  if (error) console.error("updateBatch", error);
  await refetchBatches();
}

export async function deleteBatch(id: string): Promise<void> {
  const { error } = await supabase.from("graduate_batches").delete().eq("id", id);
  if (error) console.error("deleteBatch", error);
  await refetchBatches();
  await refetchMedia();
}

/* ==== Media CRUD ==== */

export async function createMedia(input: Partial<GraduateMedia> & { batch_id: string; media_type: "image" | "video" }): Promise<void> {
  const { error } = await supabase.from("graduate_batch_media").insert({
    batch_id: input.batch_id,
    media_type: input.media_type,
    title: input.title ?? "",
    description: input.description ?? "",
    image_url: input.image_url ?? "",
    video_url: input.video_url ?? "",
    embed_url: input.embed_url ?? "",
    alt_text: input.alt_text ?? "",
    category: input.category ?? "",
    focal_x: input.focal_x ?? 0.5,
    focal_y: input.focal_y ?? 0.35,
    status: input.status ?? "published",
    sort_order: input.sort_order ?? 0,
  });
  if (error) console.error("createMedia", error);
  await refetchMedia();
}

export async function updateMedia(id: string, patch: Partial<GraduateMedia>): Promise<void> {
  const { error } = await supabase.from("graduate_batch_media").update(patch).eq("id", id);
  if (error) console.error("updateMedia", error);
  await refetchMedia();
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await supabase.from("graduate_batch_media").delete().eq("id", id);
  if (error) console.error("deleteMedia", error);
  await refetchMedia();
}

/* ==== Reads / hooks ==== */

export function listBatches(): GraduateBatch[] { return [...batchesCache]; }
export function listPublishedBatches(): GraduateBatch[] {
  return batchesCache.filter((b) => b.status === "منشورة");
}
export function getBatchBySlug(slug: string): GraduateBatch | undefined {
  return batchesCache.find((b) => b.slug === slug);
}
export function mediaForBatch(batchId: string): GraduateMedia[] {
  return mediaCache.filter((m) => m.batch_id === batchId);
}

export function useAllBatches(): GraduateBatch[] {
  const [list, setList] = useState<GraduateBatch[]>(() => listBatches());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listBatches());
    listeners.add(on); on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}

export function usePublishedBatches(): GraduateBatch[] {
  const [list, setList] = useState<GraduateBatch[]>(() => listPublishedBatches());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listPublishedBatches());
    listeners.add(on); on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}

export function useBatchMedia(batchId: string | undefined): GraduateMedia[] {
  const [list, setList] = useState<GraduateMedia[]>(() => (batchId ? mediaForBatch(batchId) : []));
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(batchId ? mediaForBatch(batchId) : []);
    listeners.add(on); on();
    return () => { listeners.delete(on); };
  }, [batchId]);
  return list;
}
