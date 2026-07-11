import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap, Info } from "lucide-react";
import { buildCmsHead, cmsLoader, DefaultError, DefaultNotFound } from "@/lib/route-seo";

export const Route = createFileRoute("/admissions")({
  loader: cmsLoader("admissions"),
  head: ({ loaderData }) =>
    buildCmsHead(
      {
        title: "شروط القبول والتقديم 2026 — مدرسة مدحت السويدي",
        description:
          "شروط الالتحاق بمدرسة مدحت السويدي للتكنولوجيا التطبيقية 2026: المتطلبات، الاختبارات، المصروفات الحكومية، وخطوات التقديم عبر وزارة التربية والتعليم.",
        path: "/admissions",
      },
      loaderData,
    ),
  errorComponent: DefaultError,
  notFoundComponent: DefaultNotFound,
  component: AdmissionsPage,
});


const REQUIREMENTS = [
  "الحصول على شهادة الإعدادية الحديثة.",
  "تحقيق الحد الأدنى للقبول الذي تحدده وزارة التربية والتعليم والتعليم الفني كل عام.",
  "ألا يزيد سن المتقدم عن 18 عامًا في شهر أكتوبر من سنة التقديم.",
  "اجتياز الاختبارات الإلكترونية المعدة من قبل الوزارة.",
  "اجتياز اختبارات اللغة العربية واللغة الإنجليزية والرياضيات والحاسب الآلي واختبار الذكاء IQ.",
  "اجتياز اختبارات القدرات والمقابلات الشخصية.",
  "القبول يتم بناءً على نتيجة الاختبارات والمقابلات الشخصية ووفقًا للسعة المستهدفة للمدرسة.",
  "تقبل المدرسة الطلاب من جميع المحافظات.",
  "التقديم عبر موقع وزارة التربية والتعليم والتعليم الفني أو من خلال مقر المدرسة عند الإعلان عن فتح باب التقديم.",
];

function AdmissionsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="التقديم والقبول"
        title="شروط الالتحاق بالمدرسة"
        subtitle="كل ما تحتاج معرفته للالتحاق بمدرسة مدحت السويدي للتكنولوجيا التطبيقية."
      />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-6 w-6 text-[var(--accent-red)]" />
                <h2 className="text-xl font-extrabold text-brand">شروط الالتحاق</h2>
              </div>
              <ul className="space-y-3">
                {REQUIREMENTS.map((s) => (
                  <li key={s} className="flex gap-2 text-sm leading-7">
                    <CheckCircle2 className="h-5 w-5 text-[var(--accent-red)] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5">
            <CardContent className="p-6 flex items-start gap-3">
              <Info className="h-5 w-5 text-[var(--accent-red)] mt-1 shrink-0" />
              <div>
                <div className="font-bold text-brand">تنبيه هام</div>
                <p className="text-sm text-muted-foreground mt-1 leading-7">
                  الحد الأدنى الحالي لحضور الندوات التعريفية: <b>190 درجة</b>. يرجى التسجيل عبر النموذج الرسمي لاختيار الموعد المناسب.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-brand text-white border-0">
            <CardContent className="p-8 grid md:grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <div className="font-extrabold text-lg">سجل بياناتك لحضور الندوة التعريفية</div>
                <p className="text-white/80 mt-2">اطلع على نظام الدراسة وشروط القبول من فريق المدرسة مباشرة.</p>
              </div>
              <Button asChild size="lg" className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
                <Link to="/visit">تسجيل الحضور</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
