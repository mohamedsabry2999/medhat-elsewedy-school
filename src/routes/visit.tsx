import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { addRegistration } from "@/lib/registrations-store";
import { z } from "zod";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "تسجيل حضور الندوة التعريفية — مدرسة مدحت السويدي" },
      { name: "description", content: "سجل بياناتك لحضور الندوة التعريفية للمدرسة." },
    ],
  }),
  component: VisitPage,
});

const schema = z.object({
  studentName: z.string().trim().min(3, "الاسم مطلوب").max(120),
  nationalId: z.string().trim().regex(/^\d{14}$/, "الرقم القومي يجب أن يكون 14 رقماً"),
  guardianPhone: z.string().trim().regex(/^\d{10,15}$/, "رقم غير صحيح"),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/, "رقم واتساب غير صحيح"),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  eduDept: z.string().trim().min(2, "الإدارة التعليمية مطلوبة").max(120),
  score: z.string().trim().regex(/^\d{1,3}$/, "المجموع غير صحيح"),
  attendees: z.number().min(1).max(3),
  visitDate: z.string().min(1, "اختر موعد الزيارة"),
  notes: z.string().max(500).optional().default(""),
});

const GOVS = ["القاهرة","الجيزة","القليوبية","الإسكندرية","الشرقية","الدقهلية","المنوفية","الغربية","بني سويف","الفيوم","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحيرة","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","شمال سيناء","جنوب سيناء","البحر الأحمر","مطروح","الوادي الجديد"];
const DATES = ["2026-07-20","2026-07-27","2026-08-03","2026-08-10","2026-08-17"];

function VisitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { id: string; date: string }>(null);
  const [form, setForm] = useState({
    studentName: "", nationalId: "", guardianPhone: "", whatsapp: "",
    governorate: "", eduDept: "", score: "", attendees: 1, visitDate: "", notes: "",
  });
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: import("react").FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const rec = addRegistration({ ...parsed.data, notes: parsed.data.notes ?? "" });
      setSubmitting(false);
      setDone({ id: rec.id, date: rec.visitDate });
      toast.success("تم تسجيل حضورك بنجاح");
      setForm({ studentName: "", nationalId: "", guardianPhone: "", whatsapp: "", governorate: "", eduDept: "", score: "", attendees: 1, visitDate: "", notes: "" });
    }, 500);
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="الندوات التعريفية" title="سجل حضور الندوة" subtitle="املأ البيانات التالية وسنتواصل معك لتأكيد الحضور." />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {done && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <div className="font-bold text-green-800">تم استلام طلبك بنجاح</div>
                  <div className="text-sm text-green-700 mt-1">رقم الطلب: <b>{done.id}</b> — موعد الزيارة: <b>{done.date}</b></div>
                  <div className="text-sm text-green-700 mt-1">سيتم التواصل معك قريباً لتأكيد الحضور.</div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                <Field label="اسم الطالب"><Input value={form.studentName} onChange={(e) => upd("studentName", e.target.value)} placeholder="الاسم الرباعي" /></Field>
                <Field label="الرقم القومي"><Input value={form.nationalId} onChange={(e) => upd("nationalId", e.target.value)} placeholder="14 رقم" inputMode="numeric" maxLength={14} /></Field>
                <Field label="رقم ولي الأمر"><Input value={form.guardianPhone} onChange={(e) => upd("guardianPhone", e.target.value)} inputMode="tel" placeholder="01xxxxxxxxx" /></Field>
                <Field label="رقم واتساب"><Input value={form.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} inputMode="tel" placeholder="01xxxxxxxxx" /></Field>
                <Field label="المحافظة">
                  <Select value={form.governorate} onValueChange={(v) => upd("governorate", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                    <SelectContent>{GOVS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="الإدارة التعليمية"><Input value={form.eduDept} onChange={(e) => upd("eduDept", e.target.value)} placeholder="اسم الإدارة" /></Field>
                <Field label="المجموع في الإعدادية"><Input value={form.score} onChange={(e) => upd("score", e.target.value)} inputMode="numeric" placeholder="مثال: 250" /></Field>
                <Field label="عدد الحضور (1 - 3)">
                  <Select value={String(form.attendees)} onValueChange={(v) => upd("attendees", Number(v) as 1 | 2 | 3)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="موعد الزيارة" className="md:col-span-2">
                  <Select value={form.visitDate} onValueChange={(v) => upd("visitDate", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر الموعد" /></SelectTrigger>
                    <SelectContent>{DATES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="ملاحظات إضافية" className="md:col-span-2">
                  <Textarea value={form.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="أي ملاحظات..." rows={4} />
                </Field>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" size="lg" disabled={submitting} className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
                    {submitting ? "جارٍ التسجيل..." : "تأكيد التسجيل"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children, className = "" }: { label: string; children: import("react").ReactNode; className?: string }) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <Label className="font-semibold text-brand">{label}</Label>
      {children}
    </div>
  );
}
