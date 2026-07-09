// Gallery CMS store (localStorage).
import { useEffect, useState } from "react";
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
};

const KEY = "meat_gallery_v1";

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
  }));
}

function read(): GalleryImage[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as GalleryImage[];
  } catch {
    return seed();
  }
}

function write(list: GalleryImage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("meat:gallery-changed"));
}

export function listGallery(): GalleryImage[] {
  return read().sort((a, b) => a.order - b.order);
}

export function listPublishedGallery(): GalleryImage[] {
  return listGallery().filter((g) => g.status === "منشورة");
}

export function saveGallery(item: GalleryImage) {
  const list = read();
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  write(list);
}

export function createGallery(data: Omit<GalleryImage, "id" | "createdAt" | "order">) {
  const list = read();
  const item: GalleryImage = {
    ...data,
    id: `g-${Date.now()}`,
    order: list.length,
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  write(list);
  return item;
}

export function deleteGallery(id: string) {
  write(read().filter((g) => g.id !== id));
}

export function toggleGalleryStatus(id: string) {
  write(
    read().map((g) =>
      g.id === id
        ? { ...g, status: g.status === "منشورة" ? "مخفية" : "منشورة" }
        : g,
    ),
  );
}

export function usePublishedGallery(): GalleryImage[] {
  const [list, setList] = useState<GalleryImage[]>([]);
  useEffect(() => {
    setList(listPublishedGallery());
    const on = () => setList(listPublishedGallery());
    window.addEventListener("meat:gallery-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("meat:gallery-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return list;
}

export function useGallery(): GalleryImage[] {
  const [list, setList] = useState<GalleryImage[]>([]);
  useEffect(() => {
    setList(listGallery());
    const on = () => setList(listGallery());
    window.addEventListener("meat:gallery-changed", on);
    return () => window.removeEventListener("meat:gallery-changed", on);
  }, []);
  return list;
}
