import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Wrench, Factory, Globe2 } from "lucide-react";

export const Route = createFileRoute("/study-system")({
  head: () => ({
    meta: [
      { title: "نظام الدراسة — مدرسة مدحت السويدي" },
      { name: "description", content: "شرح نظام الدراسة لثلاث سنوات: نظري، عملي، وتدريب ميداني." },
    ],
  }),
  component: StudySystemPage,
});

function StudySystemPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="نظام الدراسة" title="ثلاث سنوات تصنع فنياً محترفاً" subtitle="منظومة متكاملة تجمع بين المعرفة النظرية والتطبيق العملي والتدريب الميداني." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Globe2, t: "مواد ثقافية", d: "لغات ومهارات عامة تدعم شخصية الطالب.", pct: "10%" },
            { icon: BookOpen, t: "مواد نظرية تخصصية", d: "أساسيات ومفاهيم الطباعة والصناعة.", pct: "20%" },
            { icon: Wrench, t: "تدريب عملي", d: "داخل معامل وورش المدرسة الحديثة.", pct: "40%" },
            { icon: Factory, t: "تدريب ميداني", d: "داخل المصانع والمطابع الفعلية.", pct: "30%" },
          ].map((c) => (
            <Card key={c.t}>
              <CardContent className="p-8 text-center">
                <c.icon className="h-8 w-8 mx-auto text-brand" />
                <div className="mt-3 text-3xl font-extrabold text-[var(--accent-red)]">{c.pct}</div>
                <div className="mt-2 font-bold text-brand">{c.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-7">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-brand mb-8 text-center">خريطة السنوات الدراسية</h2>
          <ol className="relative border-r-2 border-brand/20 pr-6 space-y-8">
            {[
              { y: "السنة الأولى", d: "التأسيس: مواد ثقافية، أساسيات التخصص، تعرف على بيئة المدرسة والورش." },
              { y: "السنة الثانية", d: "التعمق: تدريب عملي مكثف داخل المعامل، وبدء التدريب الميداني الجزئي." },
              { y: "السنة الثالثة", d: "الاحتراف: تدريب ميداني موسع داخل الصناعة، ومشروع تخرج تطبيقي." },
            ].map((s, i) => (
              <li key={s.y} className="relative">
                <span className="absolute -right-8 top-1 h-4 w-4 rounded-full bg-[var(--accent-red)]" />
                <div className="text-sm text-muted-foreground">مرحلة {i + 1}</div>
                <div className="text-lg font-extrabold text-brand">{s.y}</div>
                <p className="mt-1 text-muted-foreground leading-7">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="text-center mt-10">
            <Button asChild className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white"><Link to="/admissions">قدم الآن</Link></Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
