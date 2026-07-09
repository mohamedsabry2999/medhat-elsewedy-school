import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NEWS, NEWS_CATEGORIES } from "@/lib/site-data";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "الأخبار — مدرسة مدحت السويدي" },
      { name: "description", content: "أحدث أخبار المدرسة والفعاليات والزيارات." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [cat, setCat] = useState<string>("الكل");
  const list = cat === "الكل" ? NEWS : NEWS.filter((n) => n.category === cat);
  return (
    <SiteLayout>
      <PageHeader eyebrow="الأخبار" title="آخر أخبار المدرسة" subtitle="فعاليات، زيارات، تدريب ميداني، وإعلانات القبول." />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {["الكل", ...NEWS_CATEGORIES].map((c) => (
              <Button key={c} variant={cat === c ? "default" : "outline"} size="sm" onClick={() => setCat(c)} className={cat === c ? "bg-brand text-white" : ""}>{c}</Button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((n) => (
              <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group">
                <Card className="overflow-hidden h-full pt-0">
                  <div className="h-48 overflow-hidden"><img src={n.image} alt={n.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <CardContent className="p-5">
                    <Badge variant="secondary">{n.category}</Badge>
                    <h3 className="mt-3 font-bold text-brand line-clamp-2">{n.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-6">{n.excerpt}</p>
                    <div className="mt-4 text-xs text-muted-foreground">{n.date}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
