import { pageSeo } from "@/lib/seo";
import { getPageMeta, type PageMetaDTO } from "@/lib/page-meta.functions";
import { Link } from "@tanstack/react-router";

type SeoDefaults = {
  title: string;
  description: string;
  path: string;
  image?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
};

export function cmsRouteExtras(slug: string, defaults: SeoDefaults) {
  return {
    loader: () => getPageMeta({ data: { slug } }),
    head: ({ loaderData }: { loaderData: PageMetaDTO | undefined }) => {
      const cms = loaderData ?? null;
      const seo = pageSeo({
        title: cms?.meta_title || defaults.title,
        description: cms?.meta_description || defaults.description,
        path: defaults.path,
        image: cms?.og_image || defaults.image,
        ogType: defaults.ogType,
        noindex: defaults.noindex || (cms?.robots?.includes("noindex") ?? false),
      });
      // Override OG title/description if CMS provides distinct values
      if (cms?.og_title) {
        seo.meta = seo.meta.map((m) =>
          m.property === "og:title" || m.name === "twitter:title"
            ? { ...m, content: cms.og_title }
            : m,
        );
      }
      if (cms?.og_description) {
        seo.meta = seo.meta.map((m) =>
          m.property === "og:description" || m.name === "twitter:description"
            ? { ...m, content: cms.og_description }
            : m,
        );
      }
      return seo;
    },
    errorComponent: DefaultError,
    notFoundComponent: DefaultNotFound,
  };
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6" dir="rtl">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-extrabold text-brand mb-2">حدث خطأ</h1>
        <p className="text-muted-foreground mb-4">{error?.message || "تعذر تحميل الصفحة."}</p>
        <Link to="/" className="text-[var(--accent-red)] font-bold hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function DefaultNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6" dir="rtl">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-extrabold text-brand mb-2">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground mb-4">لم نتمكن من العثور على الصفحة المطلوبة.</p>
        <Link to="/" className="text-[var(--accent-red)] font-bold hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
