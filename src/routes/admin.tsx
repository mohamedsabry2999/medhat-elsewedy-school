import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  LayoutDashboard, ClipboardList, Newspaper, Images, Settings, Search, Download, Plus, Home, LogOut, Eye, Trash2, Pencil, Star, EyeOff, Save,
} from "lucide-react";
import {
  listRegistrations, updateStatus, deleteRegistration, exportRegistrationsCSV,
  type Registration, type RegistrationStatus,
} from "@/lib/registrations-store";
import {
  useArticles, createArticle, saveArticle, deleteArticle, toggleStatus, toggleFeatured,
  ARTICLE_CATEGORIES, type Article,
} from "@/lib/articles-store";
import {
  useGallery, createGallery, saveGallery, deleteGallery, toggleGalleryStatus,
  type GalleryImage,
} from "@/lib/gallery-store";
import { readSettings, saveSettings, type SiteSettings } from "@/lib/settings-store";
import { VISIT_DAYS, VISIT_SLOTS, GALLERY_CATEGORIES } from "@/lib/site-data";
import { isAdminAuthed, logoutAdmin } from "@/lib/admin-auth";
import { FocalPointPicker } from "@/components/admin/FocalPointPicker";
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
    if (!isAdminAuthed()) {
      navigate({ to: "/admin-login", replace: true });
      return;
    }
    setReady(true);
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

const STATUSES: RegistrationStatus[] = ["جديد", "تم التواصل", "مؤكد", "حضر", "لم يحضر", "ملغي"];
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
  { id: "registrations", label: "التسجيلات والندوات", icon: ClipboardList },
  { id: "articles", label: "إدارة المقالات", icon: Newspaper },
  { id: "gallery", label: "معرض الصور", icon: Images },
  { id: "settings", label: "إعدادات الموقع", icon: Settings },
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<(typeof SECTIONS)[number]["id"]>("overview");
  const [regs, setRegs] = useState<Registration[]>([]);
  const refreshRegs = () => setRegs(listRegistrations());
  useEffect(() => { refreshRegs(); }, []);
  const handleLogout = () => {
    logoutAdmin();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/admin-login", replace: true });
  };

  const stats = {
    total: regs.length,
    new: regs.filter((r) => r.status === "جديد").length,
    confirmed: regs.filter((r) => r.status === "مؤكد").length,
    attended: regs.filter((r) => r.status === "حضر").length,
    missed: regs.filter((r) => r.status === "لم يحضر").length,
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
            <Select value={section} onValueChange={(v) => setSection(v as any)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{SECTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {section === "overview" && <Overview stats={stats} regs={regs.slice(0, 5)} />}
          {section === "registrations" && <RegistrationsTab regs={regs} onChange={refreshRegs} />}
          {section === "articles" && <ArticlesTab />}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="إجمالي التسجيلات" value={stats.total} tone="text-brand" />
        <StatCard label="طلبات جديدة" value={stats.new} tone="text-blue-600" />
        <StatCard label="زيارات مؤكدة" value={stats.confirmed} tone="text-green-600" />
        <StatCard label="حضر" value={stats.attended} tone="text-emerald-600" />
        <StatCard label="لم يحضر" value={stats.missed} tone="text-red-600" />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {regs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold">{r.studentName}</TableCell>
                    <TableCell>{r.governorate}</TableCell>
                    <TableCell>{r.visitDay}</TableCell>
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

/* ============================== REGISTRATIONS ============================== */

function RegistrationsTab({ regs, onChange }: { regs: Registration[]; onChange: () => void }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("الكل");
  const [dayFilter, setDayFilter] = useState<string>("الكل");
  const [slotFilter, setSlotFilter] = useState<string>("الكل");
  const [detail, setDetail] = useState<Registration | null>(null);

  const filtered = useMemo(() => regs.filter((r) => {
    const matchesQ = !q || [r.studentName, r.nationalId, r.guardianPhone, r.whatsapp].some((v) => v?.includes(q));
    const matchesS = statusFilter === "الكل" || r.status === statusFilter;
    const matchesD = dayFilter === "الكل" || r.visitDay === dayFilter;
    const matchesT = slotFilter === "الكل" || r.timeSlot === slotFilter;
    return matchesQ && matchesS && matchesD && matchesT;
  }), [regs, q, statusFilter, dayFilter, slotFilter]);

  const doExport = () => {
    const csv = exportRegistrationsCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير البيانات");
  };

  const doDelete = (id: string) => {
    deleteRegistration(id);
    toast.success("تم حذف التسجيل");
    onChange();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو الرقم القومي أو الهاتف..." className="pr-9" />
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
        <Button variant="outline" onClick={doExport}><Download className="h-4 w-4 ml-1" /> تصدير CSV</Button>
      </div>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">ولي الأمر</TableHead>
                <TableHead className="text-right">واتساب</TableHead>
                <TableHead className="text-right">المحافظة</TableHead>
                <TableHead className="text-right">اليوم</TableHead>
                <TableHead className="text-right">الفترة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><div className="font-semibold">{r.studentName}</div><div className="text-xs text-muted-foreground">{r.nationalId}</div></TableCell>
                  <TableCell dir="ltr" className="text-right">{r.guardianPhone}</TableCell>
                  <TableCell dir="ltr" className="text-right">{r.whatsapp}</TableCell>
                  <TableCell>{r.governorate}</TableCell>
                  <TableCell>{r.visitDay}</TableCell>
                  <TableCell className="text-xs max-w-[180px]">{r.timeSlot}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => { updateStatus(r.id, v as RegistrationStatus); toast.success("تم تحديث الحالة"); onChange(); }}>
                      <SelectTrigger className={cn("h-8 w-28 border-0 text-xs", STATUS_COLORS[r.status])}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setDetail(r)} title="عرض"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => doDelete(r.id)} title="حذف"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">لا توجد نتائج</TableCell></TableRow>
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
              <Row k="اسم الطالب" v={detail.studentName} />
              <Row k="الرقم القومي" v={detail.nationalId} />
              <Row k="ولي الأمر" v={detail.guardianPhone} />
              <Row k="واتساب" v={detail.whatsapp} />
              <Row k="المحافظة" v={detail.governorate} />
              <Row k="الإدارة التعليمية" v={detail.eduDept} />
              <Row k="المجموع" v={detail.score} />
              <Row k="عدد الحضور" v={String(detail.attendees)} />
              <Row k="يوم الزيارة" v={detail.visitDay} />
              <Row k="التاريخ" v={detail.visitDate} />
              <Row k="الفترة" v={detail.timeSlot} />
              <Row k="الحالة" v={detail.status} />
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
              {g.src && <img src={g.src} alt={g.title} className="w-full h-full object-cover" />}
              <Badge className={cn(
                "absolute top-2 right-2",
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
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle className="text-brand">{isNew ? "إضافة صورة" : "تعديل صورة"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>ملف الصورة</Label>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-sm" />
            {form.src && (
              <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
                <img src={form.src} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
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
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as GalleryImage["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="منشورة">منشورة</SelectItem>
                  <SelectItem value="مخفية">مخفية</SelectItem>
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
    <Card>
      <CardContent className="p-6 md:p-8 max-w-2xl space-y-5">
        <div>
          <h2 className="font-extrabold text-brand text-xl">إعدادات الموقع</h2>
          <p className="text-sm text-muted-foreground mt-1">أي تعديل هنا ينعكس تلقائيًا على الفوتر وصفحة تواصل معنا.</p>
        </div>

        <div className="grid gap-4">
          <Field label="رقم الهاتف" value={s.phone} onChange={(v) => setS({ ...s, phone: v })} dir="ltr" />
          <Field label="البريد الإلكتروني" value={s.email} onChange={(v) => setS({ ...s, email: v })} dir="ltr" />
          <Field label="عنوان فرع الحي الخامس عشر" value={s.branch1} onChange={(v) => setS({ ...s, branch1: v })} textarea />
          <Field label="عنوان فرع المنطقة الصناعية" value={s.branch2} onChange={(v) => setS({ ...s, branch2: v })} textarea />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="فيسبوك" value={s.facebook} onChange={(v) => setS({ ...s, facebook: v })} dir="ltr" />
            <Field label="انستجرام" value={s.instagram} onChange={(v) => setS({ ...s, instagram: v })} dir="ltr" />
            <Field label="يوتيوب" value={s.youtube} onChange={(v) => setS({ ...s, youtube: v })} dir="ltr" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={save}>
            <Save className="h-4 w-4 ml-1" /> حفظ الإعدادات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
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
