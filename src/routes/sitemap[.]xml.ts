import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://highschool-heartbeat.lovable.app";

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/about", priority: "0.8", changefreq: "monthly" as const },
  { path: "/programs", priority: "0.9", changefreq: "monthly" as const },
  { path: "/study-system", priority: "0.8", changefreq: "monthly" as const },
  { path: "/admissions", priority: "0.9", changefreq: "monthly" as const },
  { path: "/visit", priority: "0.9", changefreq: "weekly" as const },
  { path: "/news", priority: "0.8", changefreq: "daily" as const },
  { path: "/gallery", priority: "0.7", changefreq: "weekly" as const },
  { path: "/faq", priority: "0.6", changefreq: "monthly" as const },
  { path: "/contact", priority: "0.7", changefreq: "monthly" as const },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let articleUrls = "";
        try {
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await supabase
            .from("articles")
            .select("slug, updated_at")
            .eq("status", "published");
          if (data) {
            articleUrls = data
              .map(
                (a: { slug: string; updated_at: string }) =>
                  `  <url>\n    <loc>${BASE_URL}/news/${a.slug}</loc>\n    <lastmod>${a.updated_at.slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
              )
              .join("\n");
          }
        } catch (e) {
          console.error("sitemap articles fetch failed", e);
        }

        const staticUrls = STATIC_PATHS.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        ).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls}\n${articleUrls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
