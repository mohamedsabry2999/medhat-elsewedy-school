import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/site-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة — مدرسة مدحت السويدي" },
      { name: "description", content: "إجابات على أهم الأسئلة حول الدراسة والقبول." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="الأسئلة الشائعة" title="إجابات على أهم أسئلتكم" />
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
