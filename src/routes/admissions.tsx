import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap, Info } from "lucide-react";
import { buildCmsHead, cmsLoader, DefaultError, DefaultNotFound } from "@/lib/route-seo";
import { useContent } from "@/lib/content-store";

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
  const eyebrow = useContent("admissions.header.eyebrow", "التقديم والقبول", { page: "admissions", section: "header", label: "Eyebrow" });
  const title = useContent("admissions.header.title", "شروط الالتحاق بالمدرسة", { page: "admissions", section: "header", label: "عنوان الصفحة" });
  const subtitle = useContent("admissions.header.subtitle", "كل ما تحتاج معرفته للالتحاق بمدرسة مدحت السويدي للتكنولوجيا التطبيقية.", { page: "admissions", section: "header", label: "Subtitle", type: "textarea" });
  const reqsTitle = useContent("admissions.reqs.title", "شروط الالتحاق", { page: "admissions", section: "reqs", label: "عنوان شروط الالتحاق" });
  const noticeTitle = useContent("admissions.notice.title", "تنبيه هام", { page: "admissions", section: "notice", label: "عنوان التنبيه" });
  const noticeDesc = useContent("admissions.notice.desc", "الحد الأدنى الحالي لحضور الندوات التعريفية: 190 درجة. يرجى التسجيل عبر النموذج الرسمي لاختيار الموعد المناسب.", { page: "admissions", section: "notice", label: "نص التنبيه", type: "textarea" });
  const ctaTitle = useContent("admissions.cta.title", "سجل بياناتك لحضور الندوة التعريفية", { page: "admissions", section: "cta", label: "عنوان CTA" });
  const ctaDesc = useContent("admissions.cta.desc", "اطلع على نظام الدراسة وشروط القبول من فريق المدرسة مباشرة.", { page: "admissions", section: "cta", label: "وصف CTA", type: "textarea" });
  const ctaBtn = useContent("admissions.cta.button", "تسجيل الحضور", { page: "admissions", section: "cta", label: "زر CTA", type: "button" });
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-6 w-6 text-[var(--accent-red)]" />
                <h2 className="text-xl font-extrabold text-brand">{reqsTitle}</h2>
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
                <div className="font-bold text-brand">{noticeTitle}</div>
                <p className="text-sm text-muted-foreground mt-1 leading-7">
                  {noticeDesc}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-brand text-white border-0">
            <CardContent className="p-8 grid md:grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <div className="font-extrabold text-lg">{ctaTitle}</div>
                <p className="text-white/80 mt-2">{ctaDesc}</p>
              </div>
              <Button asChild size="lg" className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
                <Link to="/visit">{ctaBtn}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
