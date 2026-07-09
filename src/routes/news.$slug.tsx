import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NEWS } from "@/lib/site-data";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const item = NEWS.find((n) => n.slug === params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.item.title} — مدرسة مدحت السويدي` },
          { name: "description", content: loaderData.item.excerpt },
          { property: "og:image", content: loaderData.item.image },
        ]
      : [{ title: "خبر غير موجود" }, { name: "robots", content: "noindex" }],
  }),
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl p-12 text-center">
        <h1 className="text-2xl font-bold">تعذر تحميل الخبر</h1>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl p-12 text-center">
        <h1 className="text-2xl font-bold text-brand">الخبر غير موجود</h1>
        <Button asChild variant="outline" className="mt-4"><Link to="/news">العودة للأخبار</Link></Button>
      </div>
    </SiteLayout>
  ),
  component: NewsDetail,
});

function NewsDetail() {
  const { item } = Route.useLoaderData();
  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/news" className="inline-flex items-center gap-1 text-sm text-[var(--accent-red)] font-bold mb-4">
          <ArrowRight className="h-4 w-4 rotate-180" /> جميع الأخبار
        </Link>
        <Badge variant="secondary">{item.category}</Badge>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-brand">{item.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">{item.date}</div>
        <img src={item.image} alt={item.title} className="mt-6 rounded-2xl w-full aspect-video object-cover" />
        <p className="mt-6 text-lg text-muted-foreground leading-9">{item.body}</p>
      </article>
    </SiteLayout>
  );
}
