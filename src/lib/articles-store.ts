// Articles CMS store — Supabase-backed with realtime.
// Preserves the previous sync-looking API (used by admin and public pages).
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NEWS, NEWS_CATEGORIES, type NewsItem } from "./site-data";

export type ArticleStatus = "منشور" | "مسودة";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  thumbnail?: string;
  focalX?: number;
  focalY?: number;
  date: string; // YYYY-MM-DD
  status: ArticleStatus;
  featured?: boolean;
  author?: string;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  imageAlt?: string;
};

type DBRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  thumbnail: string | null;
  focal_x: number;
  focal_y: number;
  status: string;
  featured: boolean;
  author: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
  image_alt: string;
  created_at: string;
};

function fromRow(r: DBRow): Article {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    category: r.category,
    image: r.image,
    thumbnail: r.thumbnail ?? undefined,
    focalX: Number(r.focal_x),
    focalY: Number(r.focal_y),
    date: r.published_at,
    status: r.status === "published" ? "منشور" : "مسودة",
    featured: r.featured,
    author: r.author,
    createdAt: r.created_at,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    ogImage: r.og_image,
    imageAlt: r.image_alt,
  };
}

function seed(): Article[] {
  return NEWS.map((n: NewsItem) => ({
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    body: n.body,
    category: n.category,
    image: n.image,
    focalX: 50,
    focalY: 50,
    date: n.date,
    status: "منشور" as ArticleStatus,
    featured: false,
    author: "إدارة المدرسة",
    createdAt: new Date(n.date).toISOString(),
  }));
}

let cache: Article[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

async function refetch() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });
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
    .channel("articles-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => refetch())
    .subscribe();
}

function currentList(): Article[] {
  if (!loaded || cache.length === 0) return seed();
  return cache;
}

export function listArticles(): Article[] {
  return [...currentList()].sort((a, b) => (a.date < b.date ? 1 : -1));
}
export function listPublishedArticles(): Article[] {
  return listArticles().filter((a) => a.status === "منشور");
}
export function getArticle(slug: string): Article | undefined {
  return currentList().find((a) => a.slug === slug);
}

function slugify(t: string): string {
  const base = t.trim().toLowerCase().replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "").slice(0, 60);
  return base || `article-${Date.now()}`;
}

function toDb(a: Partial<Article> & { slug: string }) {
  return {
    slug: a.slug,
    title: a.title ?? "",
    excerpt: a.excerpt ?? "",
    body: a.body ?? "",
    category: a.category ?? "",
    image: a.image ?? "",
    thumbnail: a.thumbnail ?? null,
    focal_x: a.focalX ?? 50,
    focal_y: a.focalY ?? 50,
    status: a.status === "منشور" ? "published" : "draft",
    featured: !!a.featured,
    author: a.author ?? "إدارة المدرسة",
    published_at: a.date ?? new Date().toISOString().slice(0, 10),
    seo_title: a.seoTitle ?? "",
    seo_description: a.seoDescription ?? "",
    og_image: a.ogImage ?? "",
    image_alt: a.imageAlt ?? "",
  };
}

export function saveArticle(a: Omit<Article, "createdAt"> & { createdAt?: string }): Article {
  const rec: Article = { ...a, createdAt: a.createdAt ?? new Date().toISOString() };
  supabase.from("articles").upsert(toDb(rec), { onConflict: "slug" }).then(({ error }) => {
    if (error) console.error("saveArticle", error);
  });
  const idx = cache.findIndex((x) => x.slug === rec.slug);
  if (idx >= 0) cache[idx] = rec; else cache = [rec, ...cache];
  loaded = true;
  notify();
  return rec;
}

export function createArticle(data: Omit<Article, "slug" | "createdAt">): Article {
  let slug = slugify(data.title);
  const existing = new Set(cache.map((x) => x.slug));
  let i = 1;
  while (existing.has(slug)) slug = `${slugify(data.title)}-${i++}`;
  return saveArticle({ ...data, slug });
}

export function deleteArticle(slug: string) {
  supabase.from("articles").delete().eq("slug", slug).then(({ error }) => {
    if (error) console.error("deleteArticle", error);
  });
  cache = cache.filter((a) => a.slug !== slug);
  notify();
}

export function toggleStatus(slug: string) {
  const a = cache.find((x) => x.slug === slug);
  if (!a) return;
  const next: ArticleStatus = a.status === "منشور" ? "مسودة" : "منشور";
  saveArticle({ ...a, status: next });
}

export function toggleFeatured(slug: string) {
  const a = cache.find((x) => x.slug === slug);
  if (!a) return;
  saveArticle({ ...a, featured: !a.featured });
}

export function usePublishedArticles(): Article[] {
  const [list, setList] = useState<Article[]>(() => listPublishedArticles());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listPublishedArticles());
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}

export function useArticles(): Article[] {
  const [list, setList] = useState<Article[]>(() => listArticles());
  useEffect(() => {
    ensureSubscribed();
    const on = () => setList(listArticles());
    listeners.add(on);
    on();
    return () => { listeners.delete(on); };
  }, []);
  return list;
}

export const ARTICLE_CATEGORIES = [
  ...NEWS_CATEGORIES,
  "فعاليات",
  "زيارات",
].filter((v, i, a) => a.indexOf(v) === i);
