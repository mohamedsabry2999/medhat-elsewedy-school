import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  LayoutDashboard, ClipboardList, Newspaper, Images, Settings, Search, Download, Plus, Home, LogOut,
} from "lucide-react";
import { listRegistrations, updateStatus, type Registration, type RegistrationStatus } from "@/lib/registrations-store";
import { NEWS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "لوحة التحكم — مدرسة مدحت السويدي" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

const STATUSES: RegistrationStatus[] = ["جديد", "تم التواصل", "مؤكد", "حضر", "لم يحضر"];
const STATUS_COLORS: Record<RegistrationStatus, string> = {
  "جديد": "bg-blue-100 text-blue-700",
  "تم التواصل": "bg-amber-100 text-amber-700",
  "مؤكد": "bg-green-100 text-green-700",
  "حضر": "bg-emerald-100 text-emerald-700",
  "لم يحضر": "bg-red-100 text-red-700",
};

const SECTIONS = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "registrations", label: "طلبات التسجيل", icon: ClipboardList },
  { id: "news", label: "إدارة الأخبار", icon: Newspaper },
  { id: "gallery", label: "إدارة المعرض", icon: Images },
  { id: "settings", label: "إعدادات المحتوى", icon: Settings },
] as const;

function AdminPage() {
  const [section, setSection] = useState<(typeof SECTIONS)[number]["id"]>("overview");
  const [regs, setRegs] = useState<Registration[]>([]);
  const refresh = () => setRegs(listRegistrations());
  useEffect(() => { refresh(); }, []);

  const stats = {
    total: regs.length,
    new: regs.filter((r) => r.status === "جديد").length,
    confirmed: regs.filter((r) => r.status === "مؤكد").length,
    news: NEWS.length,
  };

  return (
    <div className="min-h-screen bg-secondary/40 flex" dir="rtl">
      <aside className="w-64 bg-brand text-white shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="font-extrabold">لوحة التحكم</div>
          <div className="text-xs text-white/70">مدرسة مدحت السويدي</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "w-full text-right flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold",
                section === s.id ? "bg-[var(--accent-red)] text-white" : "text-white/85 hover:bg-white/10",
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
            <Link to="/"><Home className="h-4 w-4 ml-1" /> عرض الموقع</Link>
          </Button>
          <Button size="sm" variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10" onClick={() => toast.info("تسجيل الخروج (عرض)")}>
            <LogOut className="h-4 w-4 ml-1" /> تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-5 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">مرحباً بك</div>
            <div className="font-extrabold text-brand">مدير النظام</div>
          </div>
          <div className="md:hidden">
            <Select value={section} onValueChange={(v) => setSection(v as any)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{SECTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {section === "overview" && <Overview stats={stats} regs={regs.slice(0, 5)} />}
          {section === "registrations" && <RegistrationsTab regs={regs} onChange={refresh} />}
          {section === "news" && <NewsTab />}
          {section === "gallery" && <GalleryTab />}
          {section === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("mt-2 text-3xl font-extrabold", tone)}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Overview({ stats, regs }: { stats: any; regs: Registration[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="عدد طلبات التسجيل" value={stats.total} tone="text-brand" />
        <StatCard label="الطلبات الجديدة" value={stats.new} tone="text-blue-600" />
        <StatCard label="الزيارات المؤكدة" value={stats.confirmed} tone="text-green-600" />
        <StatCard label="عدد الأخبار" value={stats.news} tone="text-[var(--accent-red)]" />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-brand">آخر طلبات التسجيل</div>
            <Badge variant="secondary">{regs.length} طلب</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">المحافظة</TableHead>
                  <TableHead className="text-right">موعد الزيارة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">{r.studentName}</TableCell>
                    <TableCell>{r.governorate}</TableCell>
                    <TableCell>{r.visitDate}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RegistrationsTab({ regs, onChange }: { regs: Registration[]; onChange: () => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("الكل");
  const filtered = regs.filter((r) => {
    const matchesQ = !q || [r.studentName, r.nationalId, r.governorate, r.whatsapp].some((v) => v.includes(q));
    const matchesF = filter === "الكل" || r.status === filter;
    return matchesQ && matchesF;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الرقم القومي..." className="pr-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل الحالات</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => toast.info("سيتم تفعيل التصدير قريباً")}><Download className="h-4 w-4 ml-1" /> تصدير</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">واتساب</TableHead>
                  <TableHead className="text-right">المحافظة</TableHead>
                  <TableHead className="text-right">المجموع</TableHead>
                  <TableHead className="text-right">الحضور</TableHead>
                  <TableHead className="text-right">الموعد</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-semibold">{r.studentName}</div>
                      <div className="text-xs text-muted-foreground">{r.nationalId}</div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-right">{r.whatsapp}</TableCell>
                    <TableCell>{r.governorate}</TableCell>
                    <TableCell>{r.score}</TableCell>
                    <TableCell>{r.attendees}</TableCell>
                    <TableCell>{r.visitDate}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => { updateStatus(r.id, v as RegistrationStatus); toast.success("تم تحديث الحالة"); onChange(); }}>
                        <SelectTrigger className={cn("h-8 w-32 border-0", STATUS_COLORS[r.status])}><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">لا توجد نتائج</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NewsTab() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-brand">إدارة الأخبار</h2>
        <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={() => toast.info("سيتم تفعيل إضافة الأخبار عند ربط قاعدة البيانات")}><Plus className="h-4 w-4 ml-1" /> إضافة خبر</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">التصنيف</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {NEWS.map((n) => (
              <TableRow key={n.slug}>
                <TableCell className="font-semibold">{n.title}</TableCell>
                <TableCell><Badge variant="secondary">{n.category}</Badge></TableCell>
                <TableCell>{n.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}

function GalleryTab() {
  return (
    <Card><CardContent className="p-8 text-center text-muted-foreground">
      <Images className="h-10 w-10 mx-auto text-brand" />
      <div className="mt-3 font-bold text-brand">إدارة معرض الصور</div>
      <p className="mt-2 text-sm">سيتم تفعيل رفع وإدارة الصور عند ربط قاعدة البيانات.</p>
      <Button className="mt-4" onClick={() => toast.info("قريباً")}><Plus className="h-4 w-4 ml-1" /> رفع صور</Button>
    </CardContent></Card>
  );
}

function SettingsTab() {
  return (
    <Card><CardContent className="p-8">
      <div className="font-bold text-brand mb-2">إعدادات المحتوى</div>
      <p className="text-sm text-muted-foreground">إعدادات عامة للموقع (اسم المدرسة، بيانات التواصل، الروابط الاجتماعية) — قيد التطوير.</p>
    </CardContent></Card>
  );
}
