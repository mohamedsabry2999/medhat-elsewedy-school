import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { usePublishedArticles, ARTICLE_CATEGORIES } from "@/lib/articles-store";
import { pageSeo } from "@/lib/seo";
import { SmartImage } from "@/components/ui/SmartImage";


export const Route = createFileRoute("/news/")({
  head: () => {
    const seo = pageSeo({
      title: "أخبار مدرسة مدحت السويدي — الفعاليات والزيارات والإنجازات",
      description:
        "آخر أخبار مدرسة مدحت السويدي للتكنولوجيا التطبيقية: الفعاليات، الزيارات الصناعية، والإنجازات الطلابية والأكاديمية.",
      path: "/news",
    });
    return { ...seo };
  },
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

  return (
    <SiteLayout>
      <PageHeader eyebrow="الأخبار" title="آخر أخبار المدرسة" subtitle="فعاليات، زيارات، تدريب ميداني، وإعلانات القبول." />
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
                  <div className="w-full overflow-hidden bg-secondary/50" style={{ aspectRatio: "16 / 9" }}>
                    <img
                      src={n.image}
                      alt={n.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      style={{ objectPosition: `${n.focalX ?? 50}% ${n.focalY ?? 50}%` }}
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
