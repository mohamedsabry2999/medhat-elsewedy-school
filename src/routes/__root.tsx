import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">حدث خطأ ما</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حاول تحديث الصفحة أو العودة للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a2540" },
      { title: "مدرسة مدحت السويدي للتكنولوجيا التطبيقية | MEAT" },
      {
        name: "description",
        content:
          "أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر — مناهج معتمدة دوليًا باعتماد AHK Cairo، بالتعاون مع وزارة التربية والتعليم والتعليم الفني.",
      },
      { property: "og:site_name", content: "مدرسة مدحت السويدي للتكنولوجيا التطبيقية" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_EG" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "مدرسة مدحت السويدي للتكنولوجيا التطبيقية | MEAT" },
      { name: "twitter:title", content: "مدرسة مدحت السويدي للتكنولوجيا التطبيقية | MEAT" },
      { property: "og:description", content: "أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر — مناهج معتمدة دوليًا باعتماد AHK Cairo، بالتعاون مع وزارة التربية والتعليم والتعليم الفني." },
      { name: "twitter:description", content: "أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر — مناهج معتمدة دوليًا باعتماد AHK Cairo، بالتعاون مع وزارة التربية والتعليم والتعليم الفني." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/4CMQCcvJ6Tg98o3LvVdF4VYsnuo1/social-images/social-1783596425361-ChatGPT_Image_Jul_9,_2026,_12_36_00_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/4CMQCcvJ6Tg98o3LvVdF4VYsnuo1/social-images/social-1783596425361-ChatGPT_Image_Jul_9,_2026,_12_36_00_PM.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Readex+Pro:wght@600;700;800&family=Tajawal:wght@400;500;700;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "مدرسة مدحت السويدي للتكنولوجيا التطبيقية",
          alternateName: "Medhat Elsewedy Applied Technology School",
          url: "https://medhat-elsewedy-school.lovable.app",
          logo: "https://medhat-elsewedy-school.lovable.app/og-image.jpg",
          image: "https://medhat-elsewedy-school.lovable.app/og-image.jpg",
          description:
            "أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر، معتمدة من AHK Cairo وبالتعاون مع وزارة التربية والتعليم والتعليم الفني.",
          telephone: "+201050360883",
          email: "school@elsewedyprint.com",
          address: [
            { "@type": "PostalAddress", streetAddress: "الحي الخامس عشر", addressLocality: "العاشر من رمضان", addressRegion: "الشرقية", addressCountry: "EG" },
            { "@type": "PostalAddress", streetAddress: "المنطقة الصناعية A6", addressLocality: "العاشر من رمضان", addressRegion: "الشرقية", addressCountry: "EG" },
          ],
          areaServed: "EG",
          inLanguage: "ar",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "مدرسة مدحت السويدي للتكنولوجيا التطبيقية",
          url: "https://medhat-elsewedy-school.lovable.app",
          inLanguage: "ar",
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
