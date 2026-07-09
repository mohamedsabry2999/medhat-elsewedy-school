// Articles CMS store (localStorage). Merges with seed NEWS for public display.
import { useEffect, useState } from "react";
import { NEWS, NEWS_CATEGORIES, type NewsItem } from "./site-data";

export type ArticleStatus = "منشور" | "مسودة";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  thumbnail?: string; // optional cropped thumb (data URL)
  focalX?: number; // 0-100
  focalY?: number; // 0-100
  date: string; // YYYY-MM-DD
  status: ArticleStatus;
  featured?: boolean;
  author?: string;
  createdAt: string;
};

const KEY = "meat_articles_v1";

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

function read(): Article[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Article[];
  } catch {
    return seed();
  }
}

function write(list: Article[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("meat:articles-changed"));
}

export function listArticles(): Article[] {
  return read().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function listPublishedArticles(): Article[] {
  return listArticles().filter((a) => a.status === "منشور");
}

export function getArticle(slug: string): Article | undefined {
  return read().find((a) => a.slug === slug);
}

function slugify(t: string): string {
  const base = t
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "")
    .slice(0, 60);
  return base || `article-${Date.now()}`;
}

export function saveArticle(a: Omit<Article, "createdAt"> & { createdAt?: string }): Article {
  const list = read();
  const idx = list.findIndex((x) => x.slug === a.slug);
  const rec: Article = {
    ...a,
    createdAt: a.createdAt ?? new Date().toISOString(),
  };
  if (idx >= 0) list[idx] = rec;
  else list.push(rec);
  write(list);
  return rec;
}

export function createArticle(data: Omit<Article, "slug" | "createdAt">): Article {
  const list = read();
  let slug = slugify(data.title);
  let i = 1;
  while (list.some((x) => x.slug === slug)) slug = `${slugify(data.title)}-${i++}`;
  return saveArticle({ ...data, slug });
}

export function deleteArticle(slug: string) {
  write(read().filter((a) => a.slug !== slug));
}

export function toggleStatus(slug: string) {
  write(
    read().map((a) =>
      a.slug === slug ? { ...a, status: a.status === "منشور" ? "مسودة" : "منشور" } : a,
    ),
  );
}

export function toggleFeatured(slug: string) {
  write(read().map((a) => (a.slug === slug ? { ...a, featured: !a.featured } : a)));
}

export function usePublishedArticles(): Article[] {
  const [list, setList] = useState<Article[]>([]);
  useEffect(() => {
    setList(listPublishedArticles());
    const on = () => setList(listPublishedArticles());
    window.addEventListener("meat:articles-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("meat:articles-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return list;
}

export function useArticles(): Article[] {
  const [list, setList] = useState<Article[]>([]);
  useEffect(() => {
    setList(listArticles());
    const on = () => setList(listArticles());
    window.addEventListener("meat:articles-changed", on);
    return () => window.removeEventListener("meat:articles-changed", on);
  }, []);
  return list;
}

export const ARTICLE_CATEGORIES = [
  ...NEWS_CATEGORIES,
  "فعاليات",
  "زيارات",
].filter((v, i, a) => a.indexOf(v) === i);
