import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/site-data";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — مدرسة مدحت السويدي" },
      { name: "description", content: "قنوات التواصل مع المدرسة." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(120),
  phone: z.string().trim().regex(/^\d{10,15}$/, "رقم غير صحيح"),
  subject: z.string().trim().min(3, "الموضوع مطلوب").max(200),
  message: z.string().trim().min(10, "الرسالة قصيرة").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const submit = (e: import("react").FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return toast.error(p.error.issues[0]?.message ?? "تحقق من البيانات");
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("تم إرسال رسالتك بنجاح، سنتواصل معك قريباً");
      setForm({ name: "", phone: "", subject: "", message: "" });
    }, 400);
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="تواصل معنا" title="نحن هنا للإجابة على استفساراتك" />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Info icon={Phone} title="الهاتف" value={CONTACT.phone} />
            <Info icon={MessageCircle} title="واتساب" value={CONTACT.whatsapp} action={<Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white mt-2"><a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">فتح واتساب</a></Button>} />
            <Info icon={Mail} title="البريد الإلكتروني" value={CONTACT.email} />
            <Info icon={MapPin} title="العنوان" value={CONTACT.address} />
            <Info icon={Clock} title="مواعيد العمل" value={CONTACT.hours} />
          </div>

          <Card className="lg:col-span-2">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-extrabold text-brand mb-4">نموذج التواصل</h2>
              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label>الاسم</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>رقم الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" /></div>
                <div className="grid gap-2 md:col-span-2"><Label>الموضوع</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div className="grid gap-2 md:col-span-2"><Label>الرسالة</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={sending} className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
                    {sending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="rounded-2xl overflow-hidden border h-72 bg-secondary grid place-items-center text-muted-foreground">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto text-brand" />
              <div className="mt-2 font-bold">خريطة الموقع</div>
              <div className="text-xs">{CONTACT.address}</div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({ icon: Icon, title, value, action }: { icon: any; title: string; value: string; action?: import("react").ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary text-brand grid place-items-center shrink-0"><Icon className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="font-bold text-brand break-words">{value}</div>
            {action}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
