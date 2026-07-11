import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/site-data";
import { faqJsonLd } from "@/lib/seo";
import { buildCmsHead, cmsLoader, DefaultError, DefaultNotFound } from "@/lib/route-seo";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/faq")({
  loader: cmsLoader("faq"),
  head: ({ loaderData }) =>
    buildCmsHead(
      {
        title: "الأسئلة الشائعة — مدرسة مدحت السويدي للتكنولوجيا التطبيقية",
        description:
          "إجابات على أهم أسئلة أولياء الأمور والطلاب حول التقديم، المصروفات، مدة الدراسة، شهادة AHK، وفرص العمل بعد التخرج.",
        path: "/faq",
      },
      loaderData,
      {
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(faqJsonLd(FAQS)) },
        ],
      },
    ),
  errorComponent: DefaultError,
  notFoundComponent: DefaultNotFound,
  component: FaqPage,
});


function FaqPage() {
  const eyebrow = useContent("faq.header.eyebrow", "الأسئلة الشائعة", { page: "faq", section: "header", label: "Eyebrow" });
  const title = useContent("faq.header.title", "إجابات على أهم أسئلتكم", { page: "faq", section: "header", label: "عنوان الصفحة" });
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="bg-white rounded-2xl px-4 border">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`i-${i}`}>
                <AccordionTrigger className="text-start font-bold text-brand">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-7">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}
