import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Info } from "lucide-react";
import { submitRegistration } from "@/lib/registrations.functions";
import { VISIT_SLOTS, BRANCHES } from "@/lib/site-data";
import { z } from "zod";
import { useContent } from "@/lib/content-store";

import { buildCmsHead, cmsLoader, DefaultError, DefaultNotFound } from "@/lib/route-seo";

export const Route = createFileRoute("/visit")({
  loader: cmsLoader("visit"),
  head: ({ loaderData }) =>
    buildCmsHead(
      {
        title: "سجل حضور الندوة التعريفية — مدرسة مدحت السويدي",
        description:
          "احجز مكانك في الندوة التعريفية لمدرسة مدحت السويدي للتكنولوجيا التطبيقية — تعرّف على التخصصات، نظام الدراسة، وشروط القبول من داخل المدرسة.",
        path: "/visit",
      },
      loaderData,
    ),
  errorComponent: DefaultError,
  notFoundComponent: DefaultNotFound,
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
  visitDay: z.string().min(1, "اختر يوم الزيارة"),
  timeSlot: z.string().min(1, "اختر الفترة"),
  visitDate: z.string().min(1, "اختر تاريخ الزيارة"),
  visitLocation: z.string().min(1, "اختر مقر الزيارة"),
  notes: z.string().max(500).optional().default(""),
});

const DAY_MAP: Record<number, string> = { 0: "الأحد", 1: "الإثنين", 2: "الثلاثاء", 3: "الأربعاء", 4: "الخميس", 5: "الجمعة", 6: "السبت" };
const ALLOWED_DOW = new Set([6, 1, 3]); // Sat, Mon, Wed
function buildVisitDates(): { value: string; label: string; day: string }[] {
  const out: { value: string; label: string; day: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(2026, 7, 31); // Aug 31, 2026
  const cur = new Date(today);
  while (cur <= end) {
    if (ALLOWED_DOW.has(cur.getDay())) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${d}`;
      const day = DAY_MAP[cur.getDay()];
      out.push({ value: iso, label: `${day} — ${iso}`, day });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
const VISIT_DATES = buildVisitDates();

const GOVS = ["القاهرة","الجيزة","القليوبية","الإسكندرية","الشرقية","الدقهلية","المنوفية","الغربية","بني سويف","الفيوم","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","البحيرة","كفر الشيخ","دمياط","بورسعيد","الإسماعيلية","السويس","شمال سيناء","جنوب سيناء","البحر الأحمر","مطروح","الوادي الجديد"];

function VisitPage() {
  const submitFn = useServerFn(submitRegistration);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { code: string; date: string; day: string; slot: string }>(null);
  const eyebrow = useContent("visit.header.eyebrow", "الندوات التعريفية", { page: "visit", section: "header", label: "Eyebrow" });
  const title = useContent("visit.header.title", "سجل حضور الندوة", { page: "visit", section: "header", label: "عنوان الصفحة" });
  const subtitle = useContent("visit.header.subtitle", "الحد الأدنى الحالي لحضور الندوات التعريفية: 190 درجة.", { page: "visit", section: "header", label: "Subtitle", type: "textarea" });
  const infoLine = useContent("visit.info.line", "أيام الزيارة المتاحة: السبت، الإثنين، الأربعاء. الفترات: من 9:00 إلى 11:00 صباحًا، أو من 11:30 إلى 1:30 ظهرًا.", { page: "visit", section: "info", label: "معلومات المواعيد", type: "textarea" });
  const infoWarn = useContent("visit.info.warn", "يرجى التأكد من مقر الزيارة المحدد في رسالة التأكيد قبل الحضور.", { page: "visit", section: "info", label: "تنبيه المقر", type: "message" });
  const successToast = useContent("visit.form.success", "تم تسجيل بياناتكم بنجاح، ونتشرف بزيارتكم في الموعد المحدد.", { page: "visit", section: "form", label: "رسالة نجاح", type: "message" });
  const errorToast = useContent("visit.form.error", "تعذر إرسال التسجيل، يرجى المحاولة لاحقًا.", { page: "visit", section: "form", label: "رسالة خطأ", type: "message" });
  const successTitle = useContent("visit.success.title", "تم تسجيل بياناتكم بنجاح", { page: "visit", section: "success", label: "عنوان النجاح" });
  const successNote = useContent("visit.success.note", "ونتشرف بزيارتكم في الموعد المحدد.", { page: "visit", section: "success", label: "ملاحظة النجاح" });
  const btnSubmit = useContent("visit.form.submit", "تأكيد التسجيل", { page: "visit", section: "form", label: "زر التأكيد", type: "button" });
  const btnSubmitting = useContent("visit.form.submitting", "جارٍ التسجيل...", { page: "visit", section: "form", label: "زر التأكيد (أثناء الإرسال)", type: "button" });
  const [form, setForm] = useState({
    studentName: "", nationalId: "", guardianPhone: "", whatsapp: "",
    governorate: "", eduDept: "", score: "", attendees: 1,
    visitDay: "", timeSlot: "", visitDate: "", visitLocation: "", notes: "",
  });
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
      return;
    }
    setSubmitting(true);
    try {
      const rec = await submitFn({ data: { ...parsed.data, notes: parsed.data.notes ?? "" } });
      setDone({ code: rec.registration_code, date: rec.visit_date, day: rec.visit_day, slot: rec.time_slot });
      toast.success(successToast);
      setForm({ studentName: "", nationalId: "", guardianPhone: "", whatsapp: "", governorate: "", eduDept: "", score: "", attendees: 1, visitDay: "", timeSlot: "", visitDate: "", visitLocation: "", notes: "" });
    } catch (err) {
      console.error(err);
      toast.error(errorToast);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="الندوات التعريفية" title="سجل حضور الندوة" subtitle="الحد الأدنى الحالي لحضور الندوات التعريفية: 190 درجة." />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-lg border bg-secondary/50 p-4 text-sm text-brand flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              أيام الزيارة المتاحة: السبت، الإثنين، الأربعاء. الفترات: من 9:00 إلى 11:00 صباحًا، أو من 11:30 إلى 1:30 ظهرًا.
              <div className="mt-1 text-muted-foreground">يرجى التأكد من مقر الزيارة المحدد في رسالة التأكيد قبل الحضور.</div>
            </div>
          </div>

          {done && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <div className="font-bold text-green-800">تم تسجيل بياناتكم بنجاح</div>
                  <div className="text-sm text-green-700 mt-1">
                    رقم الطلب: <b dir="ltr">{done.code}</b> — اليوم: <b>{done.day}</b> — التاريخ: <b>{done.date}</b> — الفترة: <b>{done.slot}</b>
                  </div>
                  <div className="text-sm text-green-700 mt-1">ونتشرف بزيارتكم في الموعد المحدد.</div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                <Field label="اسم الطالب بالكامل"><Input value={form.studentName} onChange={(e) => upd("studentName", e.target.value)} placeholder="الاسم الرباعي" /></Field>
                <Field label="الرقم القومي للطالب"><Input value={form.nationalId} onChange={(e) => upd("nationalId", e.target.value)} placeholder="14 رقم" inputMode="numeric" maxLength={14} /></Field>
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
                <Field label="تاريخ الزيارة">
                  <Select
                    value={form.visitDate}
                    onValueChange={(v) => {
                      const found = VISIT_DATES.find((d) => d.value === v);
                      setForm((f) => ({ ...f, visitDate: v, visitDay: found?.day ?? "" }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="اختر تاريخ الزيارة" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {VISIT_DATES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="الفترة الزمنية">
                  <Select value={form.timeSlot} onValueChange={(v) => upd("timeSlot", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر الفترة" /></SelectTrigger>
                    <SelectContent>{VISIT_SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="مقر الزيارة" className="md:col-span-2">
                  <Select value={form.visitLocation} onValueChange={(v) => upd("visitLocation", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر مقر الزيارة" /></SelectTrigger>
                    <SelectContent>{BRANCHES.map((b) => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
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
