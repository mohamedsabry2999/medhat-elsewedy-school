// Media library store — Supabase Storage + media_assets table.
// Signed URLs (1 year) are stored alongside the storage path so images
// render everywhere via a plain <img src>, without leaking service keys.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ============================== Types ============================== */

export type MediaStatus = "published" | "hidden" | "archived";

export type MediaAsset = {
  id: string;
  title: string;
  description: string;
  altText: string;
  caption: string;
  storagePath: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  status: MediaStatus;
  usageLocations: string[];
  displayPosition: string;
  focalX: number;
  focalY: number;
  aspectRatio: string;
  cropSettings: Record<string, unknown>;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  title: string;
  description: string;
  alt_text: string;
  caption: string;
  storage_path: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  status: string;
  usage_locations: string[] | null;
  display_position: string;
  focal_x: number;
  focal_y: number;
  aspect_ratio: string;
  crop_settings: Record<string, unknown> | null;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/* ============================== Constants ============================== */

export const MEDIA_CATEGORIES = [
  "صور الطلاب",
  "التدريب العملي",
  "التدريب الميداني",
  "الورش والمعامل",
  "الندوات التعريفية",
  "الأنشطة الطلابية",
  "الأخبار",
  "الهيرو / أعلى الموقع",
  "الفروع",
  "الاعتمادات والشهادات",
  "أخرى",
] as const;

export const USAGE_LOCATIONS = [
  "الصفحة الرئيسية — Hero",
  "الصفحة الرئيسية — Trust / اعتماد",
  "الصفحة الرئيسية — التخصصات",
  "الصفحة الرئيسية — آخر الأخبار",
  "الصفحة الرئيسية — معرض مختصر",
  "صفحة عن المدرسة",
  "صفحة نظام الدراسة",
  "صفحة التخصصات",
  "صفحة التقديم والقبول",
  "صفحة الندوات التعريفية",
  "صفحة الأخبار",
  "صورة مقال",
  "صفحة تفاصيل المقال",
  "معرض الصور العام",
  "صفحة تواصل معنا",
  "الفوتر",
  "لوحة التحكم فقط",
] as const;

export const DISPLAY_POSITIONS = [
  "",
  "Hero Main Image",
  "Hero Background",
  "Hero Side Image",
  "About Main Image",
  "Study System Image",
  "Program Card Image",
  "News Card Image",
  "Article Cover Image",
  "Gallery Item",
  "Footer Logo",
  "Certificate Logo",
  "Branch Image",
] as const;

export type SizePreset = {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
  fit: "cover" | "contain";
};

export const SIZE_PRESETS: SizePreset[] = [
  { id: "hero-desktop", label: "Hero Desktop (21:9)", ratio: "21 / 9", width: 1920, height: 800, fit: "cover" },
  { id: "hero-mobile", label: "Hero Mobile (4:5)", ratio: "4 / 5", width: 1080, height: 1400, fit: "cover" },
  { id: "news-thumb", label: "News Thumbnail (16:9)", ratio: "16 / 9", width: 1200, height: 675, fit: "cover" },
  { id: "article-cover", label: "Article Cover (16:9)", ratio: "16 / 9", width: 1600, height: 900, fit: "cover" },
  { id: "gallery-square", label: "Gallery Square (1:1)", ratio: "1 / 1", width: 1000, height: 1000, fit: "cover" },
  { id: "gallery-landscape", label: "Gallery Landscape (3:2)", ratio: "3 / 2", width: 1200, height: 800, fit: "cover" },
  { id: "program-card", label: "Program Card (4:3)", ratio: "4 / 3", width: 800, height: 600, fit: "cover" },
  { id: "logo-cert", label: "Logo / Certificate", ratio: "2 / 1", width: 800, height: 400, fit: "contain" },
  { id: "branch", label: "Branch / Location", ratio: "12 / 7", width: 1200, height: 700, fit: "cover" },
];

/**
 * Suggest a preset id for a given display position or usage location.
 */
export function suggestPreset(displayPosition: string): SizePreset | null {
  switch (displayPosition) {
    case "Hero Main Image":
    case "Hero Background":
      return SIZE_PRESETS[0];
    case "Hero Side Image":
      return SIZE_PRESETS[6];
    case "News Card Image":
      return SIZE_PRESETS[2];
    case "Article Cover Image":
      return SIZE_PRESETS[3];
    case "Gallery Item":
      return SIZE_PRESETS[5];
    case "Program Card Image":
      return SIZE_PRESETS[6];
    case "Footer Logo":
    case "Certificate Logo":
      return SIZE_PRESETS[7];
    case "Branch Image":
      return SIZE_PRESETS[8];
    default:
      return null;
  }
}

/* ============================== Mapping ============================== */

function fromRow(r: Row): MediaAsset {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    altText: r.alt_text,
    caption: r.caption,
    storagePath: r.storage_path,
    imageUrl: r.image_url,
    thumbnailUrl: r.thumbnail_url || r.image_url,
    category: r.category,
    status: (r.status as MediaStatus) || "published",
    usageLocations: r.usage_locations ?? [],
    displayPosition: r.display_position ?? "",
    focalX: r.focal_x ?? 50,
    focalY: r.focal_y ?? 50,
    aspectRatio: r.aspect_ratio ?? "",
    cropSettings: r.crop_settings ?? {},
    width: r.width ?? 0,
    height: r.height ?? 0,
    fileSize: r.file_size ?? 0,
    mimeType: r.mime_type ?? "",
    sortOrder: r.sort_order ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toDb(a: Partial<MediaAsset>) {
  const out: Record<string, unknown> = {};
  if (a.title !== undefined) out.title = a.title;
  if (a.description !== undefined) out.description = a.description;
  if (a.altText !== undefined) out.alt_text = a.altText;
  if (a.caption !== undefined) out.caption = a.caption;
  if (a.storagePath !== undefined) out.storage_path = a.storagePath;
  if (a.imageUrl !== undefined) out.image_url = a.imageUrl;
  if (a.thumbnailUrl !== undefined) out.thumbnail_url = a.thumbnailUrl;
  if (a.category !== undefined) out.category = a.category;
  if (a.status !== undefined) out.status = a.status;
  if (a.usageLocations !== undefined) out.usage_locations = a.usageLocations;
  if (a.displayPosition !== undefined) out.display_position = a.displayPosition;
  if (a.focalX !== undefined) out.focal_x = a.focalX;
  if (a.focalY !== undefined) out.focal_y = a.focalY;
  if (a.aspectRatio !== undefined) out.aspect_ratio = a.aspectRatio;
  if (a.cropSettings !== undefined) out.crop_settings = a.cropSettings;
  if (a.width !== undefined) out.width = a.width;
  if (a.height !== undefined) out.height = a.height;
  if (a.fileSize !== undefined) out.file_size = a.fileSize;
  if (a.mimeType !== undefined) out.mime_type = a.mimeType;
  if (a.sortOrder !== undefined) out.sort_order = a.sortOrder;
  return out;
}

/* ============================== Cache + realtime ============================== */

const BUCKET = "media";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // ~1 year
let cache: MediaAsset[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

async function refetch() {
  const { data, error } = await supabase
    .from("media_assets")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("*" as any)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (!error && data) {
    cache = (data as unknown as Row[]).map(fromRow);
    loaded = true;
    notify();
  } else if (error) {
    console.error("[media] fetch error", error);
  }
}

let subscribed = false;
function ensureSubscribed() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  void refetch();
  supabase
    .channel("media-assets-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "media_assets" }, () => {
      void refetch();
    })
    .subscribe();
}

/* ============================== Upload ============================== */

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function slugifyFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "image";
  return `${safe}${ext}`;
}

export type UploadResult = {
  storagePath: string;
  imageUrl: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
};

export async function uploadMediaFile(file: File): Promise<UploadResult> {
  const { width, height } = await readImageDimensions(file);
  const id = crypto.randomUUID();
  const path = `${id}-${slugifyFileName(file.name)}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (upErr) throw upErr;

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !signed) throw signErr ?? new Error("Failed to sign URL");

  return {
    storagePath: path,
    imageUrl: signed.signedUrl,
    width,
    height,
    fileSize: file.size,
    mimeType: file.type,
  };
}

export async function refreshSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);
  if (error || !data) throw error ?? new Error("Failed to refresh signed URL");
  return data.signedUrl;
}

/* ============================== CRUD ============================== */

export async function createMediaAsset(
  data: Omit<MediaAsset, "id" | "createdAt" | "updatedAt">,
): Promise<MediaAsset | null> {
  const { data: row, error } = await supabase
    .from("media_assets")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(toDb(data) as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("*" as any)
    .single();
  if (error) { console.error("createMediaAsset", error); return null; }
  const asset = fromRow(row as unknown as Row);
  cache = [asset, ...cache];
  notify();
  return asset;
}

export async function updateMediaAsset(id: string, patch: Partial<MediaAsset>): Promise<void> {
  const { error } = await supabase
    .from("media_assets")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(toDb(patch) as any)
    .eq("id", id);
  if (error) { console.error("updateMediaAsset", error); return; }
  cache = cache.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m));
  notify();
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const asset = cache.find((m) => m.id === id);
  if (asset?.storagePath) {
    await supabase.storage.from(BUCKET).remove([asset.storagePath]).catch(() => {});
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) { console.error("deleteMediaAsset", error); return; }
  cache = cache.filter((m) => m.id !== id);
  notify();
}

export async function toggleMediaStatus(id: string): Promise<void> {
  const m = cache.find((x) => x.id === id);
  if (!m) return;
  const next: MediaStatus = m.status === "published" ? "hidden" : "published";
  await updateMediaAsset(id, { status: next });
}

/* ============================== Hooks ============================== */

export function useMediaLibrary(): { items: MediaAsset[]; loaded: boolean } {
  const [items, setItems] = useState<MediaAsset[]>(() => cache);
  const [isLoaded, setLoaded] = useState<boolean>(loaded);
  useEffect(() => {
    ensureSubscribed();
    const on = () => { setItems([...cache]); setLoaded(loaded); };
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return { items, loaded: isLoaded };
}

/** Only published assets — for public-facing pages. */
export function usePublishedMedia(): MediaAsset[] {
  const { items } = useMediaLibrary();
  return useMemo(() => items.filter((m) => m.status === "published"), [items]);
}

/** Published assets matching a specific display_position. */
export function useMediaByPosition(position: string): MediaAsset[] {
  const items = usePublishedMedia();
  return useMemo(
    () => items
      .filter((m) => m.displayPosition === position)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [items, position],
  );
}

/** Published assets matching any of the given usage locations. */
export function useMediaByUsage(location: string): MediaAsset[] {
  const items = usePublishedMedia();
  return useMemo(
    () => items
      .filter((m) => m.usageLocations.includes(location))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [items, location],
  );
}
