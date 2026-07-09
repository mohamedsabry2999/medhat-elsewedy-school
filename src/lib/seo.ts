// SEO helpers and constants
export const SITE_URL = "https://medhat-elsewedy-school.lovable.app";
export const SITE_NAME = "مدرسة مدحت السويدي للتكنولوجيا التطبيقية";
export const SITE_NAME_EN = "Medhat Elsewedy Applied Technology School";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type MetaEntry = Record<string, string>;

interface PageSeoInput {
  title: string;
  description: string;
  path: string; // starts with /
  image?: string; // absolute URL
  ogType?: "website" | "article";
  noindex?: boolean;
}

export function pageSeo({
  title,
  description,
  path,
  image,
  ogType = "website",
  noindex,
}: PageSeoInput) {
  const url = `${SITE_URL}${path}`;
  const meta: MetaEntry[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: ogType },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "ar_EG" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push(
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: image },
    );
  }
  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }
  const links = [{ rel: "canonical", href: url }];
  return { meta, links };
}

// JSON-LD builders
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: SITE_NAME_EN,
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  image: DEFAULT_OG_IMAGE,
  description:
    "أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر — مناهج معتمدة دوليًا باعتماد الغرفة الألمانية AHK Cairo، بالتعاون مع وزارة التربية والتعليم والتعليم الفني.",
  telephone: "+201050360883",
  email: "school@elsewedyprint.com",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "الحي الخامس عشر",
      addressLocality: "العاشر من رمضان",
      addressRegion: "الشرقية",
      addressCountry: "EG",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "المنطقة الصناعية A6",
      addressLocality: "العاشر من رمضان",
      addressRegion: "الشرقية",
      addressCountry: "EG",
    },
  ],
  areaServed: "EG",
  inLanguage: "ar",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "ar",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/news?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleJsonLd(a: {
  title: string;
  description: string;
  image: string;
  slug: string;
  date?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: [a.image],
    datePublished: a.date,
    author: a.author ? { "@type": "Person", name: a.author } : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/news/${a.slug}`,
    inLanguage: "ar",
  };
}
