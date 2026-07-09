import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { usePublishedGallery } from "@/lib/gallery-store";
import { GALLERY_CATEGORIES } from "@/lib/site-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "معرض الصور — مدرسة مدحت السويدي" },
      { name: "description", content: "صور من داخل المدرسة والتدريب العملي والفعاليات." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [cat, setCat] = useState("الكل");
  const all = usePublishedGallery();
  const list = useMemo(
    () => (cat === "الكل" ? all : all.filter((g) => g.category === cat)),
    [all, cat],
  );
  return (
    <SiteLayout>
      <PageHeader eyebrow="معرض الصور" title="لحظات من داخل المدرسة" />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {GALLERY_CATEGORIES.map((c) => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} className={cat === c ? "bg-brand text-white" : ""} onClick={() => setCat(c)}>{c}</Button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((g) => (
              <figure key={g.id} className="group relative aspect-square overflow-hidden rounded-xl">
                <img src={g.src} alt={g.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand/90 to-transparent text-white text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="font-bold">{g.title}</div>
                  {g.description && <div className="text-white/80 mt-1">{g.description}</div>}
                </figcaption>
              </figure>
            ))}
          </div>
          {list.length === 0 && <div className="text-center py-16 text-muted-foreground">لا توجد صور في هذا التصنيف حالياً.</div>}
        </div>
      </section>
    </SiteLayout>
  );
}
