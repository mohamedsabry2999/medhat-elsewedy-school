import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Factory, Briefcase } from "lucide-react";
import { PROGRAMS } from "@/lib/site-data";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "التخصصات — مدرسة مدحت السويدي" },
      { name: "description", content: "التخصصات الدراسية بالمدرسة: الطباعة الرقمية، الأوفست، والتخصصات المستقبلية." },
    ],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="التخصصات" title="مسارات دراسية عملية" subtitle="تخصصات مصممة وفق احتياجات سوق العمل في صناعة الطباعة والتغليف." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {PROGRAMS.map((p, i) => (
            <Card key={p.slug} className="overflow-hidden">
              <CardContent className="p-8 grid lg:grid-cols-[1fr_2fr] gap-8">
                <div>
                  <div className="text-sm text-muted-foreground">تخصص #{i + 1}</div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-extrabold text-brand">{p.title}</h2>
                    {p.status === "coming" ? (
                      <Badge className="bg-[var(--accent-red)] text-white hover:bg-[var(--accent-red)]">قريباً</Badge>
                    ) : (
                      <Badge variant="secondary">متاح</Badge>
                    )}
                  </div>
                  <p className="mt-3 text-muted-foreground leading-7">{p.description}</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Block title="ما يتعلمه الطالب" items={p.learn} />
                  <Block title="مجالات التدريب" items={p.training} icon={<Factory className="h-4 w-4" />} />
                  <Block title="الفرص الوظيفية" items={p.careers} icon={<Briefcase className="h-4 w-4" />} />
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="text-center">
            <Button asChild size="lg" className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
              <Link to="/admissions">تعرف على شروط التقديم</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Block({ title, items, icon }: { title: string; items: string[]; icon?: import("react").ReactNode }) {
  return (
    <div className="bg-secondary/70 rounded-xl p-5">
      <div className="flex items-center gap-2 font-bold text-brand mb-3">{icon}{title}</div>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-[var(--accent-red)] shrink-0" />{it}</li>
        ))}
      </ul>
    </div>
  );
}
