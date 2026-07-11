import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { usePublishedArticles, ARTICLE_CATEGORIES } from "@/lib/articles-store";
import { buildCmsHead, cmsLoader, DefaultError, DefaultNotFound } from "@/lib/route-seo";
import { SmartImage } from "@/components/ui/SmartImage";
import { useContent } from "@/lib/content-store";


export const Route = createFileRoute("/news/")({
  loader: cmsLoader("news"),
  head: ({ loaderData }) =>
    buildCmsHead(
      {
        title: "أخبار مدرسة مدحت السويدي — الفعاليات والزيارات والإنجازات",
        description:
          "آخر أخبار مدرسة مدحت السويدي للتكنولوجيا التطبيقية: الفعاليات، الزيارات الصناعية، والإنجازات الطلابية والأكاديمية.",
        path: "/news",
      },
      loaderData,
    ),
  errorComponent: DefaultError,
  notFoundComponent: DefaultNotFound,
  component: NewsPage,
});


function NewsPage() {
  const [cat, setCat] = useState<string>("الكل");
  const [q, setQ] = useState("");
  const articles = usePublishedArticles();
  const list = useMemo(() => {
    return articles.filter(
      (n) =>
        (cat === "الكل" || n.category === cat) &&
        (!q || n.title.includes(q) || n.excerpt.includes(q)),
    );
  }, [articles, cat, q]);
  const eyebrow = useContent("news.header.eyebrow", "الأخبار", { page: "news", section: "header", label: "Eyebrow" });
  const title = useContent("news.header.title", "آخر أخبار المدرسة", { page: "news", section: "header", label: "عنوان الصفحة" });
  const subtitle = useContent("news.header.subtitle", "فعاليات، زيارات، تدريب ميداني، وإعلانات القبول.", { page: "news", section: "header", label: "Subtitle", type: "textarea" });
  const empty = useContent("news.empty", "لا توجد أخبار مطابقة.", { page: "news", section: "state", label: "رسالة فارغة", type: "message" });
  const searchPlaceholder = useContent("news.search.placeholder", "ابحث في الأخبار...", { page: "news", section: "search", label: "Placeholder البحث" });

  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
            <div className="flex flex-wrap gap-2">
              {["الكل", ...ARTICLE_CATEGORIES].map((c) => (
                <Button key={c} variant={cat === c ? "default" : "outline"} size="sm" onClick={() => setCat(c)} className={cat === c ? "bg-brand text-white" : ""}>{c}</Button>
              ))}
            </div>
            <div className="relative md:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأخبار..." className="pr-9" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((n) => (
              <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group">
                <Card className="overflow-hidden h-full pt-0">
                  <div className="w-full overflow-hidden bg-secondary/50 relative" style={{ aspectRatio: "16 / 9" }}>
                    <SmartImage
                      src={n.image}
                      alt={n.title}
                      focalX={n.focalX}
                      focalY={n.focalY}
                      imageType="article_cover"
                      fill
                      imgClassName="group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{n.category}</Badge>
                      {n.featured && <Badge className="bg-[var(--accent-red)] text-white"><Star className="h-3 w-3 ml-1" /> مميز</Badge>}
                    </div>
                    <h3 className="mt-3 font-bold text-brand line-clamp-2">{n.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-6">{n.excerpt}</p>
                    <div className="mt-4 text-xs text-muted-foreground">{n.date}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {list.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">لا توجد أخبار مطابقة.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
