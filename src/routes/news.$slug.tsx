import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { getArticle, listPublishedArticles, type Article } from "@/lib/articles-store";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SmartImage } from "@/components/ui/SmartImage";


export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => {
    const url = `${SITE_URL}/news/${params.slug}`;
    const title = `خبر ${decodeURIComponent(params.slug)} — ${SITE_NAME}`;
    const description = `اقرأ آخر أخبار وفعاليات مدرسة مدحت السويدي للتكنولوجيا التطبيقية.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "ar_EG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: NewsDetail,
});


function NewsDetail() {
  const { slug } = Route.useParams();
  const [item, setItem] = useState<Article | undefined>(undefined);
  const [related, setRelated] = useState<Article[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const found = getArticle(slug);
    setItem(found);
    if (found) {
      setRelated(
        listPublishedArticles()
          .filter((a) => a.slug !== found.slug && a.category === found.category)
          .slice(0, 3),
      );
    }
    setReady(true);
  }, [slug]);

  if (!ready) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl p-12 text-center text-muted-foreground">جارٍ التحميل...</div>
      </SiteLayout>
    );
  }

  if (!item || item.status !== "منشور") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl p-12 text-center">
          <h1 className="text-2xl font-bold text-brand">الخبر غير موجود</h1>
          <Button asChild variant="outline" className="mt-4"><Link to="/news">العودة للأخبار</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/news" className="inline-flex items-center gap-1 text-sm text-[var(--accent-red)] font-bold mb-4">
          <ArrowRight className="h-4 w-4 rotate-180" /> جميع الأخبار
        </Link>
        <Badge variant="secondary">{item.category}</Badge>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-brand">{item.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">
          {item.date}{item.author ? ` • ${item.author}` : ""}
        </div>
        <div className="mt-6 rounded-2xl overflow-hidden relative" style={{ aspectRatio: "16 / 9" }}>
          <SmartImage
            src={item.image}
            alt={item.title}
            focalX={item.focalX}
            focalY={item.focalY}
            imageType="article_cover"
            fill
          />
        </div>

        {item.excerpt && (
          <p className="mt-6 text-lg text-brand font-semibold leading-9">{item.excerpt}</p>
        )}
        <div className="mt-4 text-base text-muted-foreground leading-9 whitespace-pre-wrap">{item.body}</div>

        <div className="mt-10 rounded-2xl bg-brand text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-extrabold text-xl">سجّل الآن في الندوة التعريفية</div>
            <div className="text-white/80 text-sm mt-1">تعرّف على المدرسة وتخصصاتها ونظام الدراسة والاعتمادات.</div>
          </div>
          <Button asChild className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
            <Link to="/visit"><CalendarCheck className="h-4 w-4 ml-1" /> التسجيل في الندوة</Link>
          </Button>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-extrabold text-brand text-xl mb-4">مقالات مشابهة</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to="/news/$slug" params={{ slug: r.slug }}>
                  <Card className="overflow-hidden h-full pt-0">
                    <div className="w-full overflow-hidden relative" style={{ aspectRatio: "16 / 9" }}>
                      <SmartImage src={r.image} alt={r.title} focalX={r.focalX} focalY={r.focalY} imageType="article_cover" fill />
                    </div>

                    <CardContent className="p-4">
                      <div className="font-bold text-brand text-sm line-clamp-2">{r.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{r.date}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
