import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Calendar, ArrowLeft } from "lucide-react";
import { usePublishedBatches } from "@/lib/graduates-store";
import { SmartImage } from "@/components/ui/SmartImage";
import { pageSeo } from "@/lib/seo";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/graduates")({
  head: () =>
    pageSeo({
      title: "دفعات الخريجين | مدرسة مدحت السويدي للتكنولوجيا التطبيقية",
      description:
        "تعرف على دفعات خريجي مدرسة مدحت السويدي للتكنولوجيا التطبيقية، وصور وفيديوهات حفلات التخرج وإنجازات الطلاب.",
      path: "/graduates",
    }),
  component: GraduatesPage,
});

function GraduatesPage() {
  const batches = usePublishedBatches();
  const sorted = [...batches].sort((a, b) => (b.graduation_year ?? 0) - (a.graduation_year ?? 0));

  const eyebrow = useContent("graduates.header.eyebrow", "فخر المدرسة", { page: "graduates", section: "header", label: "Eyebrow" });
  const title = useContent("graduates.header.title", "دفعات الخريجين", { page: "graduates", section: "header", label: "عنوان الصفحة" });
  const subtitle = useContent("graduates.header.subtitle", "نعتز بخريجي مدرسة مدحت السويدي للتكنولوجيا التطبيقية، فهم ثمرة رحلة تعليمية وتدريبية تجمع بين المعرفة الفنية والخبرة العملية داخل بيئة صناعية متخصصة.", { page: "graduates", section: "header", label: "Subtitle", type: "textarea" });
  const emptyTitle = useContent("graduates.empty.title", "قريبًا", { page: "graduates", section: "state", label: "عنوان فارغ" });
  const emptyDesc = useContent("graduates.empty.desc", "سيتم قريبًا إضافة دفعات الخريجين وصور وفيديوهات حفلات التخرج.", { page: "graduates", section: "state", label: "وصف فارغ", type: "textarea" });
  const detailsCta = useContent("graduates.card.details", "عرض تفاصيل الدفعة", { page: "graduates", section: "card", label: "زر التفاصيل", type: "button" });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {sorted.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-brand/50" />
              <h2 className="mt-4 text-xl font-extrabold text-brand">{emptyTitle}</h2>
              <p className="mt-2 text-muted-foreground">
                {emptyDesc}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((b) => (
              <Card key={b.id} className="overflow-hidden pt-0 h-full flex flex-col group">
                <Link
                  to="/graduates/$slug"
                  params={{ slug: b.slug }}
                  className="block relative overflow-hidden"
                  style={{ aspectRatio: "16 / 10" }}
                >
                  {b.cover_image_url ? (
                    <SmartImage
                      src={b.cover_image_url}
                      alt={b.cover_image_alt || b.title}
                      imageType="article_cover"
                      fill
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand to-[color-mix(in_oklab,var(--brand)_70%,black)]">
                      <GraduationCap className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                  {b.graduation_year && (
                    <div className="absolute top-3 right-3 bg-[var(--accent-red)] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                      دفعة {b.graduation_year}
                    </div>
                  )}
                </Link>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-brand text-lg line-clamp-2">{b.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {b.graduation_year && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {b.graduation_year}
                      </span>
                    )}
                    {b.graduates_count != null && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {b.graduates_count} خريج
                      </span>
                    )}
                  </div>
                  {b.excerpt && (
                    <p className="mt-3 text-sm text-muted-foreground leading-7 line-clamp-3">{b.excerpt}</p>
                  )}
                  <div className="mt-auto pt-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/graduates/$slug" params={{ slug: b.slug }}>
                        عرض تفاصيل الدفعة
                        <ArrowLeft className="h-4 w-4 mr-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
