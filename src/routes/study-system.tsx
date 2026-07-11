import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Wrench, Factory, Globe2, Users, Lightbulb, ClipboardCheck, Briefcase, GraduationCap, BadgeCheck } from "lucide-react";
import { buildCmsHead, cmsLoader, DefaultError, DefaultNotFound } from "@/lib/route-seo";
import { useContent } from "@/lib/content-store";
import { hl } from "@/components/site/SchoolName";

export const Route = createFileRoute("/study-system")({
  loader: cmsLoader("study-system"),
  head: ({ loaderData }) =>
    buildCmsHead(
      {
        title: "نظام الدراسة بالساعات المعتمدة — التعليم المزدوج | MEAT",
        description:
          "نظام الساعات المعتمدة داخل مدرسة مدحت السويدي: تعليم مزدوج نظري وعملي، تدريب ميداني بالمصانع، تقييمات إلكترونية دورية، ومناهج معتمدة من AHK Cairo.",
        path: "/study-system",
      },
      loaderData,
    ),
  errorComponent: DefaultError,
  notFoundComponent: DefaultNotFound,
  component: StudySystemPage,
});


function StudySystemPage() {
  const eyebrow = useContent("study-system.header.eyebrow", "نظام الدراسة", { page: "study-system", section: "header", label: "Eyebrow" });
  const title = useContent("study-system.header.title", "نظام الساعات المعتمدة", { page: "study-system", section: "header", label: "عنوان الصفحة" });
  const subtitle = useContent("study-system.header.subtitle", "مناهج معتمدة دوليًا وعلى مستوى متقدم في تخصصات الطباعة المختلفة.", { page: "study-system", section: "header", label: "Subtitle", type: "textarea" });
  const intro = useContent("study-system.intro", "تعمل مدرسة مدحت السويدي للتكنولوجيا التطبيقية بنظام الساعات المعتمدة، وتقدم مناهج معتمدة دوليًا وعلى مستوى متقدم في تخصصات الطباعة المختلفة، بالتعاون مع وزارة التربية والتعليم والتعليم الفني وباعتماد الغرفة الألمانية AHK Cairo.", { page: "study-system", section: "intro", label: "فقرة التقديم", type: "textarea" });
  const ctaApply = useContent("study-system.cta.apply", "قدم الآن", { page: "study-system", section: "cta", label: "زر قدم الآن", type: "button" });
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground leading-8">
            {hl(intro)}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-[var(--accent-red)] font-bold text-sm mb-2">مكونات التعلم</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand">يجمع نظام الدراسة بين</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, t: "المواد الثقافية", d: "التابعة لوزارة التربية والتعليم والتعليم الفني." },
              { icon: Globe2, t: "المواد الفنية المتخصصة", d: "في تكنولوجيا الطباعة والتخصصات المرتبطة بها." },
              { icon: Wrench, t: "التدريب العملي", d: "داخل معامل وورش المدرسة الحديثة." },
              { icon: Factory, t: "التدريب الميداني", d: "داخل مصانع الشريك الصناعي دار مدحت السويدي للطباعة." },
              { icon: Users, t: "تنمية المهارات الشخصية", d: "محاضرات لبناء شخصية الطالب ومهارات التواصل." },
              { icon: Briefcase, t: "التوجيه والإرشاد المهني", d: "توجيه الطلاب لمسارات وظيفية مناسبة." },
              { icon: Lightbulb, t: "الابتكار وريادة الأعمال", d: "برامج تدعم روح المبادرة والابتكار." },
              { icon: GraduationCap, t: "كورسات اللغة الإنجليزية", d: "لرفع الكفاءة اللغوية للطلاب." },
            ].map((c) => (
              <Card key={c.t}>
                <CardContent className="p-6">
                  <c.icon className="h-7 w-7 text-[var(--accent-red)]" />
                  <div className="mt-3 font-bold text-brand">{c.t}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-7">{c.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-[var(--accent-red)] font-bold text-sm mb-2">رحلة الطالب</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand">من الدراسة إلى سوق العمل</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { icon: BookOpen, t: "دراسة نظرية" },
              { icon: Wrench, t: "تدريب عملي" },
              { icon: Factory, t: "تدريب ميداني" },
              { icon: ClipboardCheck, t: "تقييمات شهرية" },
              { icon: Briefcase, t: "تأهيل لسوق العمل" },
            ].map((s, i) => (
              <div key={s.t} className="relative bg-white rounded-xl border p-5 text-center">
                <div className="absolute -top-3 right-3 h-7 w-7 rounded-full bg-[var(--accent-red)] grid place-items-center text-xs font-extrabold text-white">
                  {i + 1}
                </div>
                <s.icon className="h-7 w-7 mx-auto text-brand" />
                <div className="mt-3 font-bold text-sm text-brand">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-brand/20">
            <CardContent className="p-8 flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-brand text-white grid place-items-center">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-extrabold text-brand text-lg">تقييمات إلكترونية شهرية</div>
                <p className="mt-2 text-muted-foreground leading-8">
                  تقوم المدرسة بالتعاون مع وزارة التربية والتعليم والتعليم الفني بتنفيذ تقييمات إلكترونية نظرية وعملية شهرية
                  لمتابعة مستوى الطلاب وضمان جودة المخرجات التعليمية.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 rounded-2xl bg-brand text-white p-6 flex items-start gap-4">
            <BadgeCheck className="h-6 w-6 text-[var(--accent-red)] mt-1" />
            <div className="text-sm leading-7">
              مناهج معتمدة دوليًا بالتعاون مع وزارة التربية والتعليم والتعليم الفني، وباعتماد الغرفة الألمانية AHK Cairo،
              بما يدعم تأهيل الطلاب لسوق العمل المحلي والإقليمي والدولي.
            </div>
          </div>

          <div className="text-center mt-10">
            <Button asChild className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
              <Link to="/admissions">{ctaApply}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
