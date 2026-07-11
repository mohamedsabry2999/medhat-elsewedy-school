import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PageSection = {
  id: string;
  page_slug: string;
  section_key: string;
  section_type: string;
  title: string;
  subtitle: string;
  content: string;
  data_json: Record<string, any>;
  image_url: string;
  video_url: string;
  cta_text: string;
  cta_url: string;
  cta_text_2: string;
  cta_url_2: string;
  sort_order: number;
  is_visible: boolean;
};

export type PageMeta = {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  keywords: string;
  robots: string;
  is_published: boolean;
};

const cachedSections: Record<string, PageSection[]> = {};
let cachedPages: PageMeta[] | null = null;
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

async function fetchSections(slug: string) {
  const { data, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_slug", slug)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[page-sections] fetch failed", error);
    return;
  }
  cachedSections[slug] = (data ?? []) as unknown as PageSection[];
  notify();
}

async function fetchAllPages() {
  const { data, error } = await supabase.from("pages").select("*").order("slug", { ascending: true });
  if (error) {
    console.error("[pages] fetch failed", error);
    return;
  }
  cachedPages = (data ?? []) as unknown as PageMeta[];
  notify();
}

let realtimeStarted = false;
function ensureRealtime() {
  if (realtimeStarted || typeof window === "undefined") return;
  realtimeStarted = true;
  supabase
    .channel("cms-pages-sections")
    .on("postgres_changes", { event: "*", schema: "public", table: "page_sections" }, (payload: any) => {
      const slug: string | undefined = payload?.new?.page_slug ?? payload?.old?.page_slug;
      if (slug) void fetchSections(slug);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "pages" }, () => {
      void fetchAllPages();
    })
    .subscribe();
}

export function usePageSections(slug: string): PageSection[] {
  const [, setTick] = useState(0);
  useEffect(() => {
    ensureRealtime();
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    if (!cachedSections[slug]) void fetchSections(slug);
    return () => {
      listeners.delete(l);
    };
  }, [slug]);
  return cachedSections[slug] ?? [];
}

export function useSection(slug: string, key: string): PageSection | undefined {
  const sections = usePageSections(slug);
  return sections.find((s) => s.section_key === key);
}

export function usePages(): PageMeta[] {
  const [, setTick] = useState(0);
  useEffect(() => {
    ensureRealtime();
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    if (!cachedPages) void fetchAllPages();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return cachedPages ?? [];
}

export async function saveSection(id: string, patch: Partial<PageSection>) {
  const { error } = await supabase.from("page_sections").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createSection(slug: string, section: Partial<PageSection>) {
  const key = section.section_key || `custom-${Date.now()}`;
  const { error } = await supabase.from("page_sections").insert({
    page_slug: slug,
    section_key: key,
    section_type: section.section_type || "generic",
    title: section.title || "",
    subtitle: section.subtitle || "",
    content: section.content || "",
    image_url: section.image_url || "",
    video_url: section.video_url || "",
    cta_text: section.cta_text || "",
    cta_url: section.cta_url || "",
    cta_text_2: section.cta_text_2 || "",
    cta_url_2: section.cta_url_2 || "",
    sort_order: section.sort_order ?? 999,
    is_visible: section.is_visible ?? true,
    data_json: section.data_json ?? {},
  });
  if (error) throw error;
}

export async function deleteSection(id: string) {
  const { error } = await supabase.from("page_sections").delete().eq("id", id);
  if (error) throw error;
}

export async function savePage(id: string, patch: Partial<PageMeta>) {
  const { error } = await supabase.from("pages").update(patch).eq("id", id);
  if (error) throw error;
}
