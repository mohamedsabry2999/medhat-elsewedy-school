import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LayoutDashboard, ClipboardList, Newspaper, Images, Settings, Search, Download, Plus, Home, LogOut, Eye, Trash2, Pencil, Star, EyeOff, Save, RefreshCw, CheckCircle2, AlertTriangle, Clock, Link2, ImageIcon, FileText,
} from "lucide-react";
import {
  listRegistrations, updateRegistrationStatus, cancelRegistration, resyncRegistration, resyncAllPending,
  getSyncSettings, saveSyncSettings, testSheetConnection,
  REGISTRATION_STATUSES, type Registration, type RegistrationStatus, type SyncSettings as SyncSettingsT,
} from "@/lib/registrations.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  useArticles, createArticle, saveArticle, deleteArticle, toggleStatus, toggleFeatured,
  ARTICLE_CATEGORIES, type Article,
} from "@/lib/articles-store";
import {
  useGallery, createGallery, saveGallery, deleteGallery, toggleGalleryStatus,
  type GalleryImage,
} from "@/lib/gallery-store";
import { readSettings, saveSettings, type SiteSettings } from "@/lib/settings-store";
import { useBranches, saveBranch, createBranch, deleteBranch, type Branch } from "@/lib/branches-store";

import { VISIT_DAYS, VISIT_SLOTS, GALLERY_CATEGORIES, IMG } from "@/lib/site-data";
import { isAdminAuthed, logoutAdmin } from "@/lib/admin-auth";
import { FocalPointPicker } from "@/components/admin/FocalPointPicker";
import { MediaLibraryTab } from "@/components/admin/MediaLibraryTab";
import { PagesManagerTab } from "@/components/admin/PagesManagerTab";
import { SmartImage } from "@/components/ui/SmartImage";
import { toYouTubeEmbed } from "@/lib/youtube";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "لوحة التحكم — مدرسة مدحت السويدي" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminGate,
});

function AdminGate() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    isAdminAuthed().then((ok) => {
      if (!alive) return;
      if (!ok) navigate({ to: "/admin-login", replace: true });
      else setReady(true);
    });
    return () => { alive = false; };
  }, [navigate]);
  if (!ready) {
    return (
      <div dir="rtl" className="min-h-screen grid place-items-center bg-secondary/40">
        <div className="text-sm text-muted-foreground">جارٍ التحقق من الصلاحيات...</div>
      </div>
    );
  }
  return <AdminPage />;
}

const STATUSES = REGISTRATION_STATUSES;
const STATUS_COLORS: Record<RegistrationStatus, string> = {
  "جديد": "bg-blue-100 text-blue-700",
  "تم التواصل": "bg-amber-100 text-amber-700",
  "مؤكد": "bg-green-100 text-green-700",
  "حضر": "bg-emerald-100 text-emerald-700",
  "لم يحضر": "bg-red-100 text-red-700",
  "ملغي": "bg-gray-200 text-gray-700",
};

const SECTIONS = [
  { id: "overview", label: "الرئيسية", icon: LayoutDashboard },
  { id: "pages", label: "إدارة الصفحات", icon: FileText },
  { id: "registrations", label: "التسجيلات والندوات", icon: ClipboardList },
  { id: "articles", label: "إدارة المقالات", icon: Newspaper },
  { id: "gallery", label: "معرض الصور", icon: Images },
  { id: "media", label: "مكتبة الصور والوسائط", icon: ImageIcon },
  { id: "settings", label: "إعدادات الموقع", icon: Settings },
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<(typeof SECTIONS)[number]["id"]>("overview");
  const [regs, setRegs] = useState<Registration[]>([]);
  const fetchRegs = useServerFn(listRegistrations);

  const refreshRegs = useCallback(async () => {
    try {
      const data = await fetchRegs();
      setRegs(data);
    } catch (err) {
      console.error(err);
      toast.error("تعذر تحميل التسجيلات");
    }
  }, [fetchRegs]);

  useEffect(() => { void refreshRegs(); }, [refreshRegs]);

  // Realtime updates for registrations
  useEffect(() => {
    const channel = supabase
      .channel("registrations-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => {
        void refreshRegs();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refreshRegs]);

  const handleLogout = async () => {
    await logoutAdmin();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/admin-login", replace: true });
  };

  const stats = {
    total: regs.length,
    new: regs.filter((r) => r.status === "جديد").length,
    confirmed: regs.filter((r) => r.status === "مؤكد").length,
    attended: regs.filter((r) => r.status === "حضر").length,
    missed: regs.filter((r) => r.status === "لم يحضر").length,
    pendingSync: regs.filter((r) => r.sync_status !== "synced").length,
  };

  return (
    <div className="min-h-screen bg-secondary/40 flex" dir="rtl">
      <aside className="w-64 bg-brand text-white shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <img src={IMG.logo} alt="شعار المدرسة" className="h-12 w-12 shrink-0 object-contain bg-white/95 rounded-lg p-1" />
          <div className="min-w-0">
            <div className="font-extrabold truncate">لوحة التحكم</div>
            <div className="text-xs text-white/70 truncate">مدرسة مدحت السويدي</div>
          </div>
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
          <Button size="sm" variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10" onClick={handleLogout}>
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
            <Select value={section} onValueChange={(v) => setSection(v as (typeof SECTIONS)[number]["id"])}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{SECTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {section === "overview" && <Overview stats={stats} regs={regs.slice(0, 5)} />}
          {section === "pages" && <PagesManagerTab />}
          {section === "registrations" && <RegistrationsTab regs={regs} onChange={refreshRegs} />}
          {section === "articles" && <ArticlesTab />}
          {section === "gallery" && <GalleryTab />}
          {section === "media" && <MediaLibraryTab />}
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

function Overview({ stats, regs }: { stats: { total: number; new: number; confirmed: number; attended: number; missed: number; pendingSync: number }; regs: Registration[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="إجمالي التسجيلات" value={stats.total} tone="text-brand" />
        <StatCard label="طلبات جديدة" value={stats.new} tone="text-blue-600" />
        <StatCard label="زيارات مؤكدة" value={stats.confirmed} tone="text-green-600" />
        <StatCard label="حضر" value={stats.attended} tone="text-emerald-600" />
        <StatCard label="لم يحضر" value={stats.missed} tone="text-red-600" />
        <StatCard label="بانتظار المزامنة" value={stats.pendingSync} tone="text-amber-600" />
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
                  <TableHead className="text-right">اليوم</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المزامنة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">{r.student_name}</TableCell>
                    <TableCell>{r.governorate}</TableCell>
                    <TableCell>{r.visit_day}</TableCell>
                    <TableCell>{r.visit_date}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell><SyncBadge status={r.sync_status} /></TableCell>
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

function SyncBadge({ status }: { status: Registration["sync_status"] }) {
  if (status === "synced") return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" /> متزامن</Badge>;
  if (status === "failed") return <Badge className="bg-red-100 text-red-700 gap-1"><AlertTriangle className="h-3 w-3" /> فشل</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 gap-1"><Clock className="h-3 w-3" /> قيد الانتظار</Badge>;
}

/* ============================== REGISTRATIONS ============================== */

function csvEscape(v: string | number) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportCSV(rows: Registration[]) {
  const headers = ["رقم الطلب","تاريخ التسجيل","اسم الطالب","الرقم القومي","ولي الأمر","واتساب","المحافظة","الإدارة","المجموع","عدد الحضور","يوم الزيارة","الفترة","المقر","الحالة","المزامنة","ملاحظات"];
  const body = rows.map((r) => [
    r.registration_code, r.created_at, r.student_name, r.national_id, r.guardian_phone, r.whatsapp,
    r.governorate, r.edu_dept, r.score, r.attendees, r.visit_day, r.time_slot,
    r.visit_location, r.status, r.sync_status, r.notes,
  ].map(csvEscape).join(","));
  return "\uFEFF" + [headers.join(","), ...body].join("\n");
}

function RegistrationsTab({ regs, onChange }: { regs: Registration[]; onChange: () => Promise<void> }) {
  const updStatus = useServerFn(updateRegistrationStatus);
  const doCancel = useServerFn(cancelRegistration);
  const doResync = useServerFn(resyncRegistration);
  const doResyncAll = useServerFn(resyncAllPending);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("الكل");
  const [dayFilter, setDayFilter] = useState<string>("الكل");
  const [slotFilter, setSlotFilter] = useState<string>("الكل");
  const [syncFilter, setSyncFilter] = useState<string>("الكل");
  const [detail, setDetail] = useState<Registration | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  const filtered = useMemo(() => regs.filter((r) => {
    const matchesQ = !q || [r.student_name, r.national_id, r.guardian_phone, r.whatsapp, r.registration_code].some((v) => v?.includes(q));
    const matchesS = statusFilter === "الكل" || r.status === statusFilter;
    const matchesD = dayFilter === "الكل" || r.visit_day === dayFilter;
    const matchesT = slotFilter === "الكل" || r.time_slot === slotFilter;
    const matchesSync = syncFilter === "الكل" || r.sync_status === syncFilter;
    return matchesQ && matchesS && matchesD && matchesT && matchesSync;
  }), [regs, q, statusFilter, dayFilter, slotFilter, syncFilter]);

  const doExport = () => {
    const csv = exportCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير البيانات");
  };

  const changeStatus = async (id: string, next: RegistrationStatus) => {
    setBusyId(id);
    try {
      await updStatus({ data: { id, status: next } });
      toast.success("تم تحديث الحالة ومزامنتها");
      await onChange();
    } catch (e) {
      console.error(e);
      toast.error("تعذر تحديث الحالة");
    } finally {
      setBusyId(null);
    }
  };

  const cancelOne = async (id: string) => {
    if (!confirm("إلغاء هذا التسجيل نهائيًا؟")) return;
    setBusyId(id);
    try {
      await doCancel({ data: { id } });
      toast.success("تم الإلغاء");
      await onChange();
    } catch (e) {
      console.error(e);
      toast.error("تعذر تنفيذ الإلغاء");
    } finally {
      setBusyId(null);
    }
  };

  const resyncOne = async (id: string) => {
    setBusyId(id);
    try {
      const res = await doResync({ data: { id } });
      if (res.ok) toast.success("تمت إعادة المزامنة بنجاح");
      else toast.error(`فشلت المزامنة: ${res.error ?? "خطأ غير معروف"}`);
      await onChange();
    } catch (e) {
      console.error(e);
      toast.error("تعذر إعادة المزامنة");
    } finally {
      setBusyId(null);
    }
  };

  const resyncAll = async () => {
    setBusyAll(true);
    try {
      const res = await doResyncAll();
      toast.success(`نجاح: ${res.success} — فشل: ${res.failure}`);
      await onChange();
    } catch (e) {
      console.error(e);
      toast.error("تعذر تنفيذ المزامنة الشاملة");
    } finally {
      setBusyAll(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم/الرقم القومي/الهاتف/رقم الطلب..." className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل الحالات</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dayFilter} onValueChange={setDayFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="اليوم" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل الأيام</SelectItem>
            {VISIT_DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={slotFilter} onValueChange={setSlotFilter}>
          <SelectTrigger className="w-56"><SelectValue placeholder="الفترة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل الفترات</SelectItem>
            {VISIT_SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={syncFilter} onValueChange={setSyncFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="المزامنة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل حالات المزامنة</SelectItem>
            <SelectItem value="synced">متزامن</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="failed">فشل</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={doExport}><Download className="h-4 w-4 ml-1" /> تصدير CSV</Button>
        <Button variant="outline" disabled={busyAll} onClick={resyncAll}>
          <RefreshCw className={cn("h-4 w-4 ml-1", busyAll && "animate-spin")} /> مزامنة الكل
        </Button>
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">ولي الأمر</TableHead>
                <TableHead className="text-right">واتساب</TableHead>
                <TableHead className="text-right">المحافظة</TableHead>
                <TableHead className="text-right">اليوم/الفترة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المزامنة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs" dir="ltr">{r.registration_code}</TableCell>
                  <TableCell><div className="font-semibold">{r.student_name}</div><div className="text-xs text-muted-foreground">{r.national_id}</div></TableCell>
                  <TableCell dir="ltr" className="text-right">{r.guardian_phone}</TableCell>
                  <TableCell dir="ltr" className="text-right">{r.whatsapp}</TableCell>
                  <TableCell>{r.governorate}</TableCell>
                  <TableCell className="text-xs max-w-[180px]"><div>{r.visit_day}</div><div className="text-muted-foreground">{r.time_slot}</div></TableCell>
                  <TableCell>
                    <Select value={r.status} disabled={busyId === r.id} onValueChange={(v) => changeStatus(r.id, v as RegistrationStatus)}>
                      <SelectTrigger className={cn("h-8 w-28 border-0 text-xs", STATUS_COLORS[r.status])}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <SyncBadge status={r.sync_status} />
                      {r.sync_status === "failed" && r.sync_error && (
                        <div className="text-[10px] text-red-600 max-w-[160px] truncate" title={r.sync_error}>{r.sync_error}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setDetail(r)} title="عرض"><Eye className="h-4 w-4" /></Button>
                      {r.sync_status !== "synced" && (
                        <Button size="icon" variant="ghost" disabled={busyId === r.id} onClick={() => resyncOne(r.id)} title="إعادة المزامنة">
                          <RefreshCw className={cn("h-4 w-4", busyId === r.id && "animate-spin")} />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" disabled={busyId === r.id} onClick={() => cancelOne(r.id)} title="إلغاء">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">لا توجد نتائج</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle className="text-brand">تفاصيل التسجيل</DialogTitle></DialogHeader>
          {detail && (
            <div className="grid gap-3 text-sm">
              <Row k="رقم الطلب" v={detail.registration_code} />
              <Row k="اسم الطالب" v={detail.student_name} />
              <Row k="الرقم القومي" v={detail.national_id} />
              <Row k="ولي الأمر" v={detail.guardian_phone} />
              <Row k="واتساب" v={detail.whatsapp} />
              <Row k="المحافظة" v={detail.governorate} />
              <Row k="الإدارة التعليمية" v={detail.edu_dept} />
              <Row k="المجموع" v={detail.score} />
              <Row k="عدد الحضور" v={String(detail.attendees)} />
              <Row k="يوم الزيارة" v={detail.visit_day} />
              <Row k="التاريخ" v={detail.visit_date} />
              <Row k="الفترة" v={detail.time_slot} />
              <Row k="المقر" v={detail.visit_location || "—"} />
              <Row k="الحالة" v={detail.status} />
              <Row k="حالة المزامنة" v={detail.sync_status === "synced" ? "متزامن" : detail.sync_status === "failed" ? `فشل: ${detail.sync_error ?? ""}` : "قيد الانتظار"} />
              <Row k="ملاحظات" v={detail.notes || "—"} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b pb-2">
      <div className="text-muted-foreground">{k}</div>
      <div className="font-semibold text-brand break-words">{v}</div>
    </div>
  );
}

/* ============================== ARTICLES ============================== */

const emptyArticle = (): Omit<Article, "createdAt"> => ({
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: ARTICLE_CATEGORIES[0] ?? "أخبار المدرسة",
  image: "",
  focalX: 50,
  focalY: 50,
  date: new Date().toISOString().slice(0, 10),
  status: "مسودة",
  featured: false,
  author: "",
});

function ArticlesTab() {
  const articles = useArticles();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [editor, setEditor] = useState<{ open: boolean; article: Omit<Article, "createdAt"> | null; isNew: boolean }>({
    open: false, article: null, isNew: true,
  });

  const filtered = useMemo(() => articles.filter((a) => {
    return (cat === "الكل" || a.category === cat) && (!q || a.title.includes(q));
  }), [articles, q, cat]);

  const openNew = () => setEditor({ open: true, article: emptyArticle(), isNew: true });
  const openEdit = (a: Article) => {
    const { createdAt, ...rest } = a;
    void createdAt;
    setEditor({ open: true, article: rest, isNew: false });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-extrabold text-brand text-xl">إدارة المقالات</h2>
        <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={openNew}>
          <Plus className="h-4 w-4 ml-1" /> إضافة مقال
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بعنوان المقال..." className="pr-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-48"><SelectValue placeholder="التصنيف" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل التصنيفات</SelectItem>
            {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-right w-24">المعاينة</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">مميز</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.slug}>
                  <TableCell>
                    <div className="w-20 h-12 rounded overflow-hidden bg-secondary">
                      {a.image ? (
                        <img src={a.image} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${a.focalX ?? 50}% ${a.focalY ?? 50}%` }} />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold max-w-xs truncate">{a.title}</TableCell>
                  <TableCell><Badge variant="secondary">{a.category}</Badge></TableCell>
                  <TableCell className="text-xs">{a.date}</TableCell>
                  <TableCell>
                    <Badge className={a.status === "منشور" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}>{a.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => toggleFeatured(a.slug)} title="تبديل التمييز">
                      <Star className={cn("h-4 w-4", a.featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(a)} title="تعديل"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { toggleStatus(a.slug); toast.success("تم تحديث الحالة"); }} title="نشر/إخفاء">
                        {a.status === "منشور" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-600" onClick={() => { if (confirm("حذف هذا المقال؟")) { deleteArticle(a.slug); toast.success("تم الحذف"); } }} title="حذف">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">لا توجد مقالات</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>

      {editor.article && (
        <ArticleEditor
          open={editor.open}
          article={editor.article}
          isNew={editor.isNew}
          onClose={() => setEditor({ open: false, article: null, isNew: true })}
        />
      )}
    </div>
  );
}

function ArticleEditor({
  open, article, isNew, onClose,
}: {
  open: boolean;
  article: Omit<Article, "createdAt">;
  isNew: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState(article);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(article); }, [article]);

  const onFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: String(reader.result), focalX: 50, focalY: 50 }));
    };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!form.title.trim()) return toast.error("العنوان مطلوب");
    if (!form.image) return toast.error("يرجى رفع صورة المقال الرئيسية");
    if (isNew) {
      const { slug, ...data } = form;
      void slug;
      createArticle(data);
      toast.success("تمت إضافة المقال");
    } else {
      saveArticle(form);
      toast.success("تم حفظ التعديلات");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader><DialogTitle className="text-brand">{isNew ? "إضافة مقال" : "تعديل مقال"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>عنوان المقال</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>ملخص قصير</Label>
            <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>محتوى المقال</Label>
            <Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>التصنيف</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>تاريخ النشر</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>الكاتب (اختياري)</Label>
              <Input value={form.author ?? ""} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Article["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="مسودة">مسودة</SelectItem>
                  <SelectItem value="منشور">منشور</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={!!form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} id="feat" />
            <Label htmlFor="feat">تحديد كمقال مميز</Label>
          </div>

          <div className="grid gap-2">
            <Label>صورة المقال الرئيسية</Label>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-sm" />
            {form.image && (
              <div className="mt-2">
                <FocalPointPicker
                  src={form.image}
                  focalX={form.focalX ?? 50}
                  focalY={form.focalY ?? 50}
                  onChange={(x, y) => setForm({ ...form, focalX: x, focalY: y })}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={submit}>
            <Save className="h-4 w-4 ml-1" /> حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================== GALLERY ============================== */

const emptyGallery = (): Omit<GalleryImage, "id" | "createdAt" | "order"> => ({
  title: "",
  description: "",
  category: GALLERY_CATEGORIES[1] ?? "التدريب العملي",
  src: "",
  status: "منشورة",
  focalX: 50,
  focalY: 25,
  mobileFocalX: null,
  mobileFocalY: null,
  imageType: "student_portrait",
  cropMode: "cover",
});


function GalleryTab() {
  const items = useGallery();
  const [cat, setCat] = useState("الكل");
  const [editor, setEditor] = useState<{ open: boolean; item: GalleryImage | null; isNew: boolean }>({
    open: false, item: null, isNew: true,
  });

  const filtered = useMemo(
    () => (cat === "الكل" ? items : items.filter((g) => g.category === cat)),
    [items, cat],
  );

  const openNew = () => setEditor({
    open: true,
    item: { ...emptyGallery(), id: "", createdAt: "", order: items.length } as GalleryImage,
    isNew: true,
  });
  const openEdit = (g: GalleryImage) => setEditor({ open: true, item: g, isNew: false });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-extrabold text-brand text-xl">إدارة معرض الصور</h2>
        <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={openNew}>
          <Plus className="h-4 w-4 ml-1" /> إضافة صورة
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {GALLERY_CATEGORIES.map((c) => (
          <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} className={cat === c ? "bg-brand text-white" : ""} onClick={() => setCat(c)}>{c}</Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((g) => (
          <Card key={g.id} className="overflow-hidden pt-0">
            <div className="aspect-square overflow-hidden bg-secondary/50 relative">
              {g.src && (
                <SmartImage
                  src={g.src}
                  alt={g.title}
                  focalX={g.focalX}
                  focalY={g.focalY}
                  imageType={g.imageType as never}
                  cropMode={g.cropMode}
                  fill
                />
              )}
              <Badge className={cn(
                "absolute top-2 right-2 z-10",
                g.status === "منشورة" ? "bg-green-600 text-white" : "bg-gray-600 text-white",
              )}>{g.status}</Badge>
            </div>

            <CardContent className="p-3 space-y-2">
              <div className="font-bold text-brand text-sm line-clamp-1">{g.title || "بدون عنوان"}</div>
              <Badge variant="secondary" className="text-xs">{g.category}</Badge>
              <div className="flex gap-1 pt-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { toggleGalleryStatus(g.id); toast.success("تم التحديث"); }}>
                  {g.status === "منشورة" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="text-red-600" onClick={() => { if (confirm("حذف الصورة؟")) { deleteGallery(g.id); toast.success("تم الحذف"); } }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">لا توجد صور</div>
        )}
      </div>

      {editor.item && (
        <GalleryEditor
          open={editor.open}
          item={editor.item}
          isNew={editor.isNew}
          onClose={() => setEditor({ open: false, item: null, isNew: true })}
        />
      )}
    </div>
  );
}

function GalleryEditor({
  open, item, isNew, onClose,
}: { open: boolean; item: GalleryImage; isNew: boolean; onClose: () => void }) {
  const [form, setForm] = useState(item);
  useEffect(() => { setForm(item); }, [item]);

  const onFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, src: String(reader.result) }));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!form.src) return toast.error("يرجى رفع صورة");
    if (!form.title.trim()) return toast.error("العنوان مطلوب");
    if (isNew) {
      const { id, createdAt, order, ...data } = form;
      void id; void createdAt; void order;
      createGallery(data);
      toast.success("تمت إضافة الصورة");
    } else {
      saveGallery(form);
      toast.success("تم الحفظ");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader><DialogTitle className="text-brand">{isNew ? "إضافة صورة" : "تعديل صورة"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>ملف الصورة</Label>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-sm" />
          </div>
          {form.src && (
            <div className="grid gap-2">
              <Label>نقطة تركيز الصورة (يمنع قص رأس الطالب)</Label>
              <FocalPointPicker
                src={form.src}
                focalX={form.focalX}
                focalY={form.focalY}
                onChange={(x, y) => setForm({ ...form, focalX: x, focalY: y })}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>عنوان الصورة</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>الوصف</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>التصنيف</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.filter((c) => c !== "الكل").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>نوع الصورة</Label>
              <Select value={form.imageType} onValueChange={(v) => setForm({ ...form, imageType: v, cropMode: v === "logo" || v === "certificate" ? "contain" : "cover" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student_portrait">صورة طالب Portrait</SelectItem>
                  <SelectItem value="student_group">مجموعة طلاب</SelectItem>
                  <SelectItem value="training_landscape">تدريب / ورشة</SelectItem>
                  <SelectItem value="gallery">صورة معرض</SelectItem>
                  <SelectItem value="logo">شعار / Logo</SelectItem>
                  <SelectItem value="certificate">شهادة</SelectItem>
                  <SelectItem value="auto">تلقائي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as GalleryImage["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="منشورة">منشورة</SelectItem>
                  <SelectItem value="مخفية">مخفية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>وضع القص</Label>
              <Select value={form.cropMode} onValueChange={(v) => setForm({ ...form, cropMode: v as "cover" | "contain" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (ملء الإطار)</SelectItem>
                  <SelectItem value="contain">Contain (إظهار الصورة كاملة)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={submit}>
            <Save className="h-4 w-4 ml-1" /> حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================== SETTINGS ============================== */

function SettingsTab() {
  const [s, setS] = useState<SiteSettings>(readSettings());
  useEffect(() => { setS(readSettings()); }, []);

  const save = () => {
    saveSettings(s);
    toast.success("تم حفظ الإعدادات — تم تحديث الفوتر وصفحة التواصل");
  };

  return (
    <div className="grid gap-6 max-w-3xl">
      <SyncSettingsPanel />

      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-extrabold text-brand text-xl">فيديو تعريفي عن المدرسة</h2>
              <p className="text-sm text-muted-foreground mt-1">
                أضف رابط فيديو يوتيوب ليظهر داخل الصفحة الرئيسية. يقبل روابط youtube.com/watch, youtu.be, أو /embed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="youtube-intro-enabled"
                checked={s.youtubeIntroEnabled}
                onCheckedChange={(v) => setS({ ...s, youtubeIntroEnabled: v })}
              />
              <Label htmlFor="youtube-intro-enabled" className="text-sm">إظهار الفيديو في الصفحة الرئيسية</Label>
            </div>
          </div>

          <div className="grid gap-4">
            <SField
              label="رابط فيديو اليوتيوب"
              value={s.youtubeIntroUrl}
              onChange={(v) => setS({ ...s, youtubeIntroUrl: v })}
              dir="ltr"
            />
            <SField
              label="عنوان قسم الفيديو"
              value={s.youtubeIntroTitle}
              onChange={(v) => setS({ ...s, youtubeIntroTitle: v })}
            />
            <SField
              label="وصف قسم الفيديو"
              value={s.youtubeIntroDescription}
              onChange={(v) => setS({ ...s, youtubeIntroDescription: v })}
              textarea
            />
            {s.youtubeIntroUrl && !toYouTubeEmbed(s.youtubeIntroUrl) && (
              <p className="text-sm text-red-600">رابط يوتيوب غير صالح — تأكد من نسخ الرابط كاملاً.</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={save}>
              <Save className="h-4 w-4 ml-1" /> حفظ إعدادات الفيديو
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div>
            <h2 className="font-extrabold text-brand text-xl">إعدادات الموقع</h2>
            <p className="text-sm text-muted-foreground mt-1">أي تعديل هنا ينعكس تلقائيًا على الفوتر وصفحة تواصل معنا.</p>
          </div>

          <div className="grid gap-4">
            <SField label="رقم الهاتف" value={s.phone} onChange={(v) => setS({ ...s, phone: v })} dir="ltr" />
            <SField label="البريد الإلكتروني" value={s.email} onChange={(v) => setS({ ...s, email: v })} dir="ltr" />
            <SField label="رقم واتساب (رابط كامل)" value={s.whatsapp} onChange={(v) => setS({ ...s, whatsapp: v })} dir="ltr" />
            <SField label="وصف الفوتر" value={s.footerDescription} onChange={(v) => setS({ ...s, footerDescription: v })} textarea />
            <SField label="نص الدعوة الرئيسية" value={s.mainCta} onChange={(v) => setS({ ...s, mainCta: v })} />
            <div className="grid gap-4 md:grid-cols-3">
              <SField label="فيسبوك" value={s.facebook} onChange={(v) => setS({ ...s, facebook: v })} dir="ltr" />
              <SField label="انستجرام" value={s.instagram} onChange={(v) => setS({ ...s, instagram: v })} dir="ltr" />
              <SField label="يوتيوب" value={s.youtube} onChange={(v) => setS({ ...s, youtube: v })} dir="ltr" />
            </div>
          </div>

          <BranchesEditor />


          <div className="flex justify-end">
            <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={save}>
              <Save className="h-4 w-4 ml-1" /> حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BranchesEditor() {
  const branches = useBranches();
  const [drafts, setDrafts] = useState<Record<string, Branch>>({});
  const getVal = (b: Branch): Branch => drafts[b.id] ?? b;
  const update = (b: Branch, patch: Partial<Branch>) =>
    setDrafts((d) => ({ ...d, [b.id]: { ...getVal(b), ...patch } }));

  return (
    <div className="border-t pt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-brand">فروع المدرسة</h3>
          <p className="text-sm text-muted-foreground">تظهر تلقائيًا في صفحة تواصل معنا والفوتر.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            createBranch({
              name: "فرع جديد",
              address: "",
              usage: "",
              position: branches.length + 1,
            })
          }
        >
          + إضافة فرع
        </Button>
      </div>
      <div className="grid gap-4">
        {branches.map((b) => {
          const v = getVal(b);
          return (
            <div key={b.id} className="rounded-lg border p-4 space-y-3">
              <SField label="اسم الفرع" value={v.name} onChange={(x) => update(b, { name: x })} />
              <SField label="العنوان" value={v.address} onChange={(x) => update(b, { address: x })} textarea />
              <SField label="الاستخدام / وصف الفرع" value={v.usage} onChange={(x) => update(b, { usage: x })} textarea />
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => {
                    if (confirm("حذف هذا الفرع؟")) deleteBranch(b.id);
                  }}
                >
                  حذف
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    saveBranch(v);
                    toast.success("تم حفظ الفرع");
                  }}
                >
                  حفظ الفرع
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function SyncSettingsPanel() {
  const load = useServerFn(getSyncSettings);
  const save = useServerFn(saveSyncSettings);
  const test = useServerFn(testSheetConnection);

  const [form, setForm] = useState<SyncSettingsT | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    load().then(setForm).catch((e) => {
      console.error(e);
      toast.error("تعذر تحميل إعدادات المزامنة");
    });
  }, [load]);

  if (!form) {
    return (
      <Card><CardContent className="p-6"><div className="text-sm text-muted-foreground">جارٍ التحميل...</div></CardContent></Card>
    );
  }

  const submit = async () => {
    setSaving(true);
    try {
      await save({ data: { sheet_id: form.sheet_id, webhook_url: form.webhook_url, tab_name: form.tab_name } });
      toast.success("تم حفظ إعدادات المزامنة");
    } catch (e) {
      toast.error((e as Error).message || "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const doTest = async () => {
    setTesting(true);
    try {
      const res = await test();
      if (res.ok) toast.success("الاتصال بالشيت يعمل بنجاح ✅");
      else toast.error(`فشل الاختبار: ${res.error ?? "غير معروف"}`);
    } catch (e) {
      toast.error((e as Error).message || "تعذر الاختبار");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 md:p-8 space-y-5">
        <div>
          <h2 className="font-extrabold text-brand text-xl flex items-center gap-2">
            <Link2 className="h-5 w-5" /> مزامنة Google Sheets
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            أنشئ Google Apps Script منشور كـ Web App وضع رابط الـ Webhook هنا. كل تسجيل جديد أو تحديث حالة يُضاف/يُحدَّث تلقائيًا في الشيت.
          </p>
        </div>

        <div className="grid gap-4">
          <SField label="معرف الشيت (Sheet ID)" value={form.sheet_id} onChange={(v) => setForm({ ...form, sheet_id: v })} dir="ltr" />
          <SField label="رابط الـ Webhook (Apps Script Web App URL)" value={form.webhook_url} onChange={(v) => setForm({ ...form, webhook_url: v })} dir="ltr" />
          <SField label="اسم التبويب في الشيت (Tab / Sheet name)" value={form.tab_name} onChange={(v) => setForm({ ...form, tab_name: v })} />
        </div>

        <div className="rounded-md bg-secondary/60 border p-4 text-xs leading-6 text-brand">
          <div className="font-bold mb-1">إعداد Google Apps Script (مرة واحدة):</div>
          <ol className="list-decimal pr-5 space-y-1">
            <li>افتح الشيت &lt; Extensions &lt; Apps Script.</li>
            <li>الصق كود يستقبل POST JSON ويضيف صف عند action=create ويُحدّث الصف المطابق لـ registration_id عند action=update.</li>
            <li>Deploy &lt; New deployment &lt; Web app &lt; Execute as: Me &lt; Who has access: Anyone.</li>
            <li>انسخ الرابط والصقه هنا ثم اضغط "اختبار الاتصال".</li>
          </ol>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={testing || !form.webhook_url} onClick={doTest}>
            <RefreshCw className={cn("h-4 w-4 ml-1", testing && "animate-spin")} /> اختبار الاتصال
          </Button>
          <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" disabled={saving} onClick={submit}>
            <Save className="h-4 w-4 ml-1" /> حفظ إعدادات المزامنة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SField({
  label, value, onChange, textarea, dir,
}: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; dir?: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} dir={dir} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} dir={dir} />
      )}
    </div>
  );
}
