import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Calendar, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "التقديم والقبول — مدرسة مدحت السويدي" },
      { name: "description", content: "شروط التقديم، الحد الأدنى للقبول، والمستندات المطلوبة." },
    ],
  }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="التقديم والقبول" title="شروط ومراحل الالتحاق" subtitle="كل ما تحتاج معرفته للالتحاق بالمدرسة." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="h-6 w-6 text-[var(--accent-red)]" />
                <h2 className="text-xl font-extrabold text-brand">شروط التقديم</h2>
              </div>
              <ul className="space-y-3">
                {[
                  "الحصول على الشهادة الإعدادية للعام الحالي.",
                  "الحد الأدنى للقبول: 190 درجة.",
                  "اجتياز الكشف الطبي والمقابلة الشخصية.",
                  "حضور الندوة التعريفية مع ولي الأمر.",
                  "الالتزام بلائحة المدرسة وضوابط التدريب الميداني.",
                ].map((s) => (
                  <li key={s} className="flex gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-brand shrink-0" />{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-[var(--accent-red)]" />
                <h2 className="text-xl font-extrabold text-brand">المستندات المطلوبة</h2>
              </div>
              <ul className="space-y-3">
                {[
                  "أصل شهادة الإعدادية + صورتين.",
                  "شهادة ميلاد كمبيوتر حديثة.",
                  "6 صور شخصية حديثة.",
                  "صورة بطاقة ولي الأمر.",
                  "استمارة التقديم مستوفاة البيانات.",
                ].map((s) => (
                  <li key={s} className="flex gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-brand shrink-0" />{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          <Card className="bg-brand text-white border-0">
            <CardContent className="p-8 grid md:grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2"><Calendar className="h-5 w-5" /><span className="font-bold">مواعيد الندوات التعريفية</span></div>
                <p className="text-white/85">تعقد الندوات التعريفية أسبوعياً، ويمكنك اختيار الموعد المناسب من صفحة التسجيل.</p>
              </div>
              <Button asChild size="lg" className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white"><Link to="/visit">سجل الآن</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
