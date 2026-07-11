import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, CalendarCheck, Calendar, Users, GraduationCap, X, PlayCircle } from "lucide-react";
import { getBatchBySlug, useBatchMedia, usePublishedBatches, type GraduateBatch } from "@/lib/graduates-store";
import { SmartImage } from "@/components/ui/SmartImage";
import { SITE_URL, SITE_NAME, pageSeo } from "@/lib/seo";
import { toYouTubeEmbed } from "@/lib/youtube";

export const Route = createFileRoute("/graduates/$slug")({
  head: ({ params }) => {
    const title = `دفعة ${decodeURIComponent(params.slug)} — ${SITE_NAME}`;
    return pageSeo({
      title,
      description: "تفاصيل دفعة من خريجي مدرسة مدحت السويدي للتكنولوجيا التطبيقية، مع صور وفيديوهات حفل التخرج.",
      path: `/graduates/${params.slug}`,
      ogType: "article",
    });
  },
  component: BatchDetail,
});

function BatchDetail() {
  const { slug } = Route.useParams();
  const allPublished = usePublishedBatches();
  const [batch, setBatch] = useState<GraduateBatch | undefined>(() => getBatchBySlug(slug));
  const [ready, setReady] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const found = allPublished.find((b) => b.slug === slug);
    setBatch(found);
    if (allPublished.length > 0) setReady(true);
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, [slug, allPublished]);

  const media = useBatchMedia(batch?.id);
  const images = media.filter((m) => m.media_type === "image" && m.status === "published");
  const videos = media.filter((m) => m.media_type === "video" && m.status === "published");

  if (!ready) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl p-12 text-center text-muted-foreground">جارٍ التحميل...</div>
      </SiteLayout>
    );
  }

  if (!batch) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl p-12 text-center">
          <h1 className="text-2xl font-bold text-brand">الدفعة غير موجودة</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/graduates">العودة لدفعات الخريجين</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/graduates" className="inline-flex items-center gap-1 text-sm text-[var(--accent-red)] font-bold mb-4">
          <ArrowRight className="h-4 w-4 rotate-180" /> جميع الدفعات
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1"><GraduationCap className="h-3.5 w-3.5" /> دفعات الخريجين</Badge>
          {batch.graduation_year && (
            <Badge className="bg-[var(--accent-red)] text-white gap-1">
              <Calendar className="h-3.5 w-3.5" /> دفعة {batch.graduation_year}
            </Badge>
          )}
          {batch.graduates_count != null && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3.5 w-3.5" /> {batch.graduates_count} خريج
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-brand">{batch.title}</h1>

        {batch.cover_image_url && (
          <div className="mt-6 rounded-2xl overflow-hidden relative" style={{ aspectRatio: "16 / 9" }}>
            <SmartImage
              src={batch.cover_image_url}
              alt={batch.cover_image_alt || batch.title}
              imageType="article_cover"
              fill
            />
          </div>
        )}

        {batch.excerpt && (
          <p className="mt-6 text-lg text-brand font-semibold leading-9">{batch.excerpt}</p>
        )}
        {batch.description && (
          <div className="mt-4 text-base text-muted-foreground leading-9 whitespace-pre-wrap">{batch.description}</div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="mt-12">
            <h2 className="font-extrabold text-brand text-2xl mb-4 flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-[var(--accent-red)]" /> فيديوهات حفل التخرج
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((v) => {
                const embed = v.embed_url || toYouTubeEmbed(v.video_url) || "";
                if (!embed) return null;
                return (
                  <Card key={v.id} className="overflow-hidden pt-0">
                    <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                      <iframe
                        src={embed}
                        title={v.title || batch.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                    {(v.title || v.description) && (
                      <CardContent className="p-4">
                        {v.title && <div className="font-bold text-brand">{v.title}</div>}
                        {v.description && <div className="mt-1 text-sm text-muted-foreground">{v.description}</div>}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Gallery */}
        {images.length > 0 && (
          <section className="mt-12">
            <h2 className="font-extrabold text-brand text-2xl mb-4">معرض صور الدفعة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setLightbox({ src: img.image_url, alt: img.alt_text || img.title || batch.title })}
                  className="relative overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-[var(--accent-red)]"
                  style={{ aspectRatio: "1 / 1" }}
                  aria-label={img.alt_text || img.title || "صورة من حفل التخرج"}
                >
                  <SmartImage
                    src={img.image_url}
                    alt={img.alt_text || img.title || batch.title}
                    focalX={img.focal_x}
                    focalY={img.focal_y}
                    imageType="gallery"
                    fill
                  />
                  {img.category && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {img.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-brand text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-extrabold text-xl">تعرّف على مدرستنا وسجّل الآن</div>
            <div className="text-white/80 text-sm mt-1">احضر ندوتنا التعريفية وتعرّف على التخصصات والاعتمادات.</div>
          </div>
          <Button asChild className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
            <Link to="/visit"><CalendarCheck className="h-4 w-4 ml-1" /> التسجيل في الندوة</Link>
          </Button>
        </div>
      </article>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-0">
          {lightbox && (
            <div className="relative">
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-black/80 text-white h-9 w-9 rounded-full grid place-items-center"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
