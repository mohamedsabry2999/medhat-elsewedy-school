import { Link } from "@tanstack/react-router";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useFeaturedBatches } from "@/lib/graduates-store";
import { SchoolName } from "@/components/site/SchoolName";

export function GraduateBatchesTeaser() {
  const batches = useFeaturedBatches(3);
  if (batches.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 text-brand px-4 py-1.5 text-xs font-bold mb-3">
              <GraduationCap className="h-4 w-4" /> دفعات نفتخر بها
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-brand">دفعات خريجينا</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              نستعرض ذكريات وإنجازات دفعات <SchoolName />.
            </p>
          </div>
          <Link
            to="/graduates"
            className="inline-flex items-center gap-2 text-brand font-bold hover:text-[var(--accent-red)] transition"
          >
            كل الدفعات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <Link
              key={b.id}
              to="/graduates/$slug"
              params={{ slug: b.slug }}
              className="group rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative" style={{ aspectRatio: "16 / 10" }}>
                {b.cover_image_url ? (
                  <SmartImage src={b.cover_image_url} alt={b.cover_image_alt || b.title} fill imageType="article_cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center text-white">
                    <GraduationCap className="h-14 w-14 opacity-70" />
                  </div>
                )}
                {b.graduation_year && (
                  <div className="absolute top-3 right-3 bg-[var(--accent-red)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {b.graduation_year}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="font-black text-lg text-brand group-hover:text-[var(--accent-red)] transition">
                  {b.title}
                </div>
                {b.excerpt && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{b.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
