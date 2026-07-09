// Gallery CMS store — Supabase-backed with realtime.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GALLERY, type GalleryItem } from "./site-data";

export type GalleryStatus = "منشورة" | "مخفية";

export type GalleryImage = {
  id: string;
  title: string;
  description: string;
  category: string;
  src: string;
  status: GalleryStatus;
  order: number;
  createdAt: string;
  imageAlt?: string;
};

type DBRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  image_alt: string;
  status: string;
  position: number;
  created_at: string;
};

function fromRow(r: DBRow): GalleryImage {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    src: r.image_url,
    status: r.status === "published" ? "منشورة" : "مخفية",
    order: r.position,
    createdAt: r.created_at,
    imageAlt: r.image_alt,
  };
}

function seed(): GalleryImage[] {
  return GALLERY.map((g: GalleryItem, i) => ({
    id: `g-seed-${i}`,
    title: g.caption,
    description: "",
    category: g.category,
    src: g.src,
    status: "منشورة" as GalleryStatus,
    order: i,
    createdAt: new Date().toISOString(),
    imageAlt: g.caption,
  }));
}

let cache: GalleryImage[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

async function refetch() {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("position", { ascending: true });
  if (!error && data) {
    cache = (data as DBRow[]).map(fromRow);
    loaded = true;
    notify();
  }
}

let subscribed = false;
function ensureSubscribed() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  refetch();
  supabase
    .channel("gallery-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "gallery_images" }, () => refetch())
    .subscribe();
}

function currentList(): GalleryImage[] {
  if (!loaded || cache.length === 0) return seed();
  return cache;
}

export function listGallery(): GalleryImage[] {
  return [...currentList()].sort((a, b) => a.order - b.order);
}
export function listPublishedGallery(): GalleryImage[] {
  return listGallery().filter((g) => g.status === "منشورة");
}

function toDb(g: Partial<GalleryImage> & { id?: string }) {
  return {
    title: g.title ?? "",
    description: g.description ?? "",
    category: g.category ?? "",
    image_url: g.src ?? "",
    image_alt: g.imageAlt ?? g.title ?? "",
    status: g.status === "مخفية" ? "hidden" : "published",
    position: g.order ?? 0,
  };
}

export function saveGallery(item: GalleryImage) {
  const isSeed = item.id.startsWith("g-seed-");
  if (isSeed) {
    supabase.from("gallery_images").insert(toDb(item)).then(({ error }) => {
      if (error) console.error("saveGallery insert", error);
    });
  } else {
    supabase.from("gallery_images").update(toDb(item)).eq("id", item.id).then(({ error }) => {
      if (error) console.error("saveGallery update", error);
    });
    const idx = cache.findIndex((x) => x.id === item.id);
    if (idx >= 0) cache[idx] = item;
    notify();
  }
}

export function createGallery(data: Omit<GalleryImage, "id" | "createdAt" | "order">) {
  const position = cache.length;
  supabase.from("gallery_images").insert({ ...toDb({ ...data, order: position }) }).then(({ error }) => {
    if (error) console.error("createGallery", error);
  });
  return { ...data, id: `pending-${Date.now()}`, order: position, createdAt: new Date().toISOString() } as GalleryImage;
}

export function deleteGallery(id: string) {
  if (id.startsWith("g-seed-")) {
    // Seed items live in code — hide locally.
    cache = cache.filter((g) => g.id !== id);
    notify();
    return;
  }
  supabase.from("gallery_images").delete().eq("id", id).then(({ error }) => {
    if (error) console.error("deleteGallery", error);
  });
  cache = cache.filter((g) => g.id !== id);
  notify();
}

export function toggleGalleryStatus(id: string) {
  const g = cache.find((x) => x.id === id) ?? currentList().find((x) => x.id === id);
  if (!g) return;
  const next: GalleryStatus = g.status === "منشورة" ? "مخفية" : "منشورة";
  saveGallery({ ...g, status: next });
}

export function usePublishedGallery(): GalleryImage[] {
  const [list, setList] = useState<GalleryImage[]>(() => listPublishedGallery());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listPublishedGallery());
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}

export function useGallery(): GalleryImage[] {
  const [list, setList] = useState<GalleryImage[]>(() => listGallery());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listGallery());
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}
