import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PageMetaDTO = {
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  keywords: string;
  robots: string;
  is_published: boolean;
} | null;

export const getPageMeta = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<PageMetaDTO> => {
    try {
      const supabase = createClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
      );
      const { data: row } = await supabase
        .from("pages")
        .select("meta_title, meta_description, og_title, og_description, og_image, keywords, robots, is_published")
        .eq("slug", data.slug)
        .maybeSingle();
      return (row as PageMetaDTO) ?? null;
    } catch (err) {
      console.error("[getPageMeta] failed", err);
      return null;
    }
  });
