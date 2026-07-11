import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowUp, ArrowDown, Eye, EyeOff, Save, Plus, Trash2, Pencil, ExternalLink, FileText, Search,
} from "lucide-react";
import {
  usePages,
  usePageSections,
  saveSection,
  savePage,
  createSection,
  deleteSection,
  type PageSection,
  type PageMeta,
} from "@/lib/page-sections-store";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { cn } from "@/lib/utils";

const PAGE_PATHS: Record<string, string> = {
  home: "/",
  about: "/about",
  programs: "/programs",
  "study-system": "/study-system",
  admissions: "/admissions",
  visit: "/visit",
  news: "/news",
  gallery: "/gallery",
  faq: "/faq",
  contact: "/contact",
};

export function PagesManagerTab() {
  const pages = usePages();
  const [selectedSlug, setSelectedSlug] = useState<string>("home");
  const selectedPage = pages.find((p) => p.slug === selectedSlug);

  if (!pages.length) {
    return <div className="text-sm text-muted-foreground">جارٍ تحميل الصفحات...</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-brand">إدارة الصفحات</h2>
        <p className="text-sm text-muted-foreground mt-1">
          تحكم في محتوى كل صفحات الموقع: النصوص، العناوين، أزرار CTA، الأقسام، وإعدادات SEO. أي تعديل يظهر فورًا على الموقع بدون إعادة نشر.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Card>
          <CardContent className="p-3 space-y-1">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedSlug(p.slug)}
                className={cn(
                  "w-full text-right px-3 py-2 rounded-md text-sm font-semibold flex items-center justify-between gap-2 transition-colors",
                  selectedSlug === p.slug
                    ? "bg-brand text-white"
                    : "hover:bg-secondary text-foreground",
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{p.title || p.slug}</span>
                </span>
                {!p.is_published && <Badge variant="secondary" className="text-[10px]">مخفية</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>

        {selectedPage && <PageEditor page={selectedPage} />}
      </div>
    </div>
  );
}

function PageEditor({ page }: { page: PageMeta }) {
  const path = PAGE_PATHS[page.slug] ?? `/${page.slug}`;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">صفحة</div>
            <div className="text-xl font-extrabold text-brand">{page.title || page.slug}</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={path} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 ml-1" /> معاينة
            </a>
          </Button>
        </div>

        <Tabs defaultValue="sections">
          <TabsList>
            <TabsTrigger value="sections">الأقسام والمحتوى</TabsTrigger>
            <TabsTrigger value="seo">إعدادات SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="sections" className="mt-5">
            <SectionsManager slug={page.slug} />
          </TabsContent>
          <TabsContent value="seo" className="mt-5">
            <SeoEditor page={page} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SectionsManager({ slug }: { slug: string }) {
  const sections = usePageSections(slug);
  const [editing, setEditing] = useState<PageSection | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter(
      (s) =>
        s.section_key.toLowerCase().includes(q) ||
        (s.title || "").toLowerCase().includes(q) ||
        (s.subtitle || "").toLowerCase().includes(q),
    );
  }, [sections, query]);

  const move = async (s: PageSection, dir: -1 | 1) => {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === s.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    try {
      await Promise.all([
        saveSection(s.id, { sort_order: swap.sort_order }),
        saveSection(swap.id, { sort_order: s.sort_order }),
      ]);
      toast.success("تم تغيير الترتيب");
    } catch (e: any) {
      toast.error(e?.message || "فشل تغيير الترتيب");
    }
  };

  const toggleVisible = async (s: PageSection) => {
    try {
      await saveSection(s.id, { is_visible: !s.is_visible });
      toast.success(s.is_visible ? "تم إخفاء القسم" : "تم إظهار القسم");
    } catch (e: any) {
      toast.error(e?.message || "فشل الحفظ");
    }
  };

  const remove = async (s: PageSection) => {
    if (!window.confirm(`حذف القسم "${s.title || s.section_key}"؟`)) return;
    try {
      await deleteSection(s.id);
      toast.success("تم الحذف");
    } catch (e: any) {
      toast.error(e?.message || "فشل الحذف");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في الأقسام..."
            className="pr-9"
          />
        </div>
        <Button onClick={() => setCreating(true)} className="bg-brand text-white">
          <Plus className="h-4 w-4 ml-1" /> إضافة قسم
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-6">لا توجد أقسام.</div>
        )}
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 border rounded-lg p-3 bg-white hover:bg-secondary/30 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => move(s, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => move(s, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{s.title || <span className="text-muted-foreground italic">بدون عنوان</span>}</span>
                <Badge variant="outline" className="text-[10px]">{s.section_key}</Badge>
                {!s.is_visible && <Badge className="bg-gray-200 text-gray-700 text-[10px]">مخفي</Badge>}
              </div>
              {s.subtitle && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.subtitle}</div>}
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => toggleVisible(s)} title={s.is_visible ? "إخفاء" : "إظهار"}>
                {s.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(s)} title="تعديل">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(s)} title="حذف" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editing && <SectionEditorDialog section={editing} onClose={() => setEditing(null)} />}
      {creating && <CreateSectionDialog slug={slug} onClose={() => setCreating(false)} />}
    </div>
  );
}

function SectionEditorDialog({ section, onClose }: { section: PageSection; onClose: () => void }) {
  const [form, setForm] = useState<PageSection>(section);
  const [saving, setSaving] = useState(false);
  const [dataJsonText, setDataJsonText] = useState(JSON.stringify(section.data_json || {}, null, 2));

  const setField = <K extends keyof PageSection>(key: K, val: PageSection[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      let data_json = form.data_json;
      try {
        data_json = JSON.parse(dataJsonText || "{}");
      } catch {
        toast.error("صيغة JSON للبيانات الإضافية غير صحيحة");
        setSaving(false);
        return;
      }
      await saveSection(section.id, {
        title: form.title,
        subtitle: form.subtitle,
        content: form.content,
        image_url: form.image_url,
        video_url: form.video_url,
        cta_text: form.cta_text,
        cta_url: form.cta_url,
        cta_text_2: form.cta_text_2,
        cta_url_2: form.cta_url_2,
        sort_order: Number(form.sort_order) || 0,
        is_visible: form.is_visible,
        data_json,
      });
      toast.success("تم حفظ التعديلات بنجاح");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل قسم: {section.section_key}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="media">الصورة والفيديو</TabsTrigger>
            <TabsTrigger value="cta">أزرار CTA</TabsTrigger>
            <TabsTrigger value="advanced">متقدم</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div>
              <Label>العنوان الرئيسي</Label>
              <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div>
              <Label>العنوان الفرعي</Label>
              <Input value={form.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
            </div>
            <div>
              <Label>المحتوى</Label>
              <RichTextEditor value={form.content} onChange={(v) => setField("content", v)} />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div>
              <Label>رابط الصورة (URL)</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setField("image_url", e.target.value)}
                placeholder="https://..."
              />
              {form.image_url && (
                <img src={form.image_url} alt="" className="mt-2 h-32 rounded-md object-cover border" />
              )}
            </div>
            <div>
              <Label>رابط فيديو (YouTube)</Label>
              <Input
                value={form.video_url}
                onChange={(e) => setField("video_url", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </TabsContent>

          <TabsContent value="cta" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>نص زر CTA الأول</Label>
                <Input value={form.cta_text} onChange={(e) => setField("cta_text", e.target.value)} />
              </div>
              <div>
                <Label>رابط زر CTA الأول</Label>
                <Input value={form.cta_url} onChange={(e) => setField("cta_url", e.target.value)} placeholder="/visit" />
              </div>
              <div>
                <Label>نص زر CTA الثاني</Label>
                <Input value={form.cta_text_2} onChange={(e) => setField("cta_text_2", e.target.value)} />
              </div>
              <div>
                <Label>رابط زر CTA الثاني</Label>
                <Input value={form.cta_url_2} onChange={(e) => setField("cta_url_2", e.target.value)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>ترتيب القسم</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setField("sort_order", Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_visible} onCheckedChange={(v) => setField("is_visible", v)} />
                <Label>ظاهر على الموقع</Label>
              </div>
            </div>
            <div>
              <Label>بيانات JSON إضافية (متقدم)</Label>
              <Textarea
                value={dataJsonText}
                onChange={(e) => setDataJsonText(e.target.value)}
                rows={6}
                className="font-mono text-xs"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                للاستخدامات الخاصة مثل: badge, titleHighlight, cta3_text, cta3_url
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button onClick={save} disabled={saving} className="bg-brand text-white">
            <Save className="h-4 w-4 ml-1" /> {saving ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateSectionDialog({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!key.trim()) {
      toast.error("أدخل معرّف القسم");
      return;
    }
    setSaving(true);
    try {
      await createSection(slug, { section_key: key.trim(), title, sort_order: 900 });
      toast.success("تم إضافة القسم");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "فشل الإضافة");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة قسم جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>معرّف القسم (بالإنجليزية بدون مسافات)</Label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="my-section" dir="ltr" />
          </div>
          <div>
            <Label>العنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button onClick={create} disabled={saving} className="bg-brand text-white">
            <Save className="h-4 w-4 ml-1" /> {saving ? "..." : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeoEditor({ page }: { page: PageMeta }) {
  const [form, setForm] = useState<PageMeta>(page);
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof PageMeta>(key: K, val: PageMeta[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await savePage(page.id, {
        title: form.title,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        og_title: form.og_title,
        og_description: form.og_description,
        og_image: form.og_image,
        keywords: form.keywords,
        robots: form.robots,
        is_published: form.is_published,
      });
      toast.success("تم حفظ إعدادات SEO");
    } catch (e: any) {
      toast.error(e?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>اسم الصفحة (داخل لوحة التحكم)</Label>
        <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>SEO Title</Label>
          <Input value={form.meta_title} onChange={(e) => setField("meta_title", e.target.value)} />
        </div>
        <div>
          <Label>Robots</Label>
          <Input value={form.robots} onChange={(e) => setField("robots", e.target.value)} placeholder="index,follow" />
        </div>
      </div>
      <div>
        <Label>Meta Description</Label>
        <Textarea value={form.meta_description} onChange={(e) => setField("meta_description", e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Open Graph Title</Label>
          <Input value={form.og_title} onChange={(e) => setField("og_title", e.target.value)} />
        </div>
        <div>
          <Label>Open Graph Image URL</Label>
          <Input value={form.og_image} onChange={(e) => setField("og_image", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Open Graph Description</Label>
        <Textarea value={form.og_description} onChange={(e) => setField("og_description", e.target.value)} rows={2} />
      </div>
      <div>
        <Label>Keywords (كلمات مفتاحية اختيارية)</Label>
        <Input value={form.keywords} onChange={(e) => setField("keywords", e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={form.is_published} onCheckedChange={(v) => setField("is_published", v)} />
        <Label>الصفحة منشورة</Label>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-brand text-white">
          <Save className="h-4 w-4 ml-1" /> {saving ? "جارٍ الحفظ..." : "حفظ إعدادات SEO"}
        </Button>
      </div>
    </div>
  );
}
