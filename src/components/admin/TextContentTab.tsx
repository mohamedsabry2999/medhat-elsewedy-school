import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Save, Send, RotateCcw, History, Pencil, Trash2, Plus, FileText } from "lucide-react";
import {
  useAllContentBlocks, saveContentDraft, publishContent, restoreDefault,
  deleteContentBlock, createContentBlock, listContentVersions,
  type ContentBlock, type ContentBlockType, type ContentVersion,
} from "@/lib/content-store";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const TYPES: { value: ContentBlockType | "الكل"; label: string }[] = [
  { value: "الكل", label: "كل الأنواع" },
  { value: "text", label: "نص" },
  { value: "textarea", label: "فقرة" },
  { value: "richtext", label: "محتوى غني" },
  { value: "button", label: "زر" },
  { value: "label", label: "Label" },
  { value: "message", label: "رسالة" },
  { value: "seo", label: "SEO" },
  { value: "alt", label: "Alt Text" },
];

export function TextContentTab() {
  const { rows, loaded } = useAllContentBlocks();
  const [q, setQ] = useState("");
  const [pageFilter, setPageFilter] = useState<string>("الكل");
  const [typeFilter, setTypeFilter] = useState<string>("الكل");
  const [statusFilter, setStatusFilter] = useState<string>("الكل");
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [creating, setCreating] = useState(false);

  const pages = useMemo(() => {
    const set = new Set(rows.map((r) => r.page_slug));
    return ["الكل", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (pageFilter !== "الكل" && r.page_slug !== pageFilter) return false;
      if (typeFilter !== "الكل" && r.type !== typeFilter) return false;
      if (statusFilter === "مسودة" && r.status !== "draft") return false;
      if (statusFilter === "منشور" && r.status !== "published") return false;
      if (statusFilter === "معدّل" && r.current_value === r.default_value) return false;
      if (statusFilter === "افتراضي" && r.current_value !== r.default_value) return false;
      if (!query) return true;
      return (
        r.content_key.toLowerCase().includes(query) ||
        (r.label || "").toLowerCase().includes(query) ||
        (r.current_value || "").toLowerCase().includes(query) ||
        (r.default_value || "").toLowerCase().includes(query)
      );
    });
  }, [rows, q, pageFilter, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    modified: rows.filter((r) => r.current_value !== r.default_value).length,
    drafts: rows.filter((r) => r.status === "draft").length,
  }), [rows]);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-brand">إدارة النصوص والمحتوى</h2>
          <p className="text-sm text-muted-foreground mt-1">
            تحكم في كل نص ظاهر على الموقع. أي نص جديد يظهر تلقائيًا هنا فور زيارة الصفحة التي تحتوي عليه.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="bg-brand text-white">
          <Plus className="h-4 w-4 ml-1" /> إضافة نص جديد
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="إجمالي النصوص" value={stats.total} tone="text-brand" />
        <StatBox label="نصوص معدّلة" value={stats.modified} tone="text-green-600" />
        <StatBox label="مسودات" value={stats.drafts} tone="text-amber-600" />
        <StatBox label="افتراضي" value={stats.total - stats.modified} tone="text-muted-foreground" />
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالكلمة أو بـ Content Key..." className="pr-9" />
            </div>
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="الصفحة" /></SelectTrigger>
              <SelectContent>
                {pages.map((p) => <SelectItem key={p} value={p}>{p === "الكل" ? "كل الصفحات" : p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الحالات</SelectItem>
                <SelectItem value="منشور">منشورة</SelectItem>
                <SelectItem value="مسودة">بها مسودة</SelectItem>
                <SelectItem value="معدّل">معدّلة</SelectItem>
                <SelectItem value="افتراضي">غير معدّلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!loaded && <div className="text-sm text-muted-foreground text-center py-6">جارٍ التحميل...</div>}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصفحة/القسم</TableHead>
                  <TableHead className="text-right">Label</TableHead>
                  <TableHead className="text-right">Content Key</TableHead>
                  <TableHead className="text-right">النص الحالي</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && loaded && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">لا توجد نتائج</TableCell></TableRow>
                )}
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">
                      <div className="font-semibold">{r.page_slug}</div>
                      <div className="text-muted-foreground">{r.section_key}</div>
                    </TableCell>
                    <TableCell className="text-sm">{r.label || "—"}</TableCell>
                    <TableCell className="text-[11px] font-mono" dir="ltr">{r.content_key}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: escapeHtml(stripHtml(r.current_value || r.default_value)) }} />
                    </TableCell>
                    <TableCell className="text-xs"><Badge variant="outline">{r.type}</Badge></TableCell>
                    <TableCell>
                      {r.status === "draft" ? (
                        <Badge className="bg-amber-100 text-amber-700">مسودة</Badge>
                      ) : r.current_value !== r.default_value ? (
                        <Badge className="bg-green-100 text-green-700">معدّل</Badge>
                      ) : (
                        <Badge variant="secondary">افتراضي</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button
                          size="sm" variant="ghost"
                          onClick={async () => {
                            if (!confirm("حذف هذا النص؟ سيتم استخدام النص الافتراضي في الكود.")) return;
                            try { await deleteContentBlock(r.id); toast.success("تم الحذف"); }
                            catch (e: any) { toast.error(e?.message || "فشل الحذف"); }
                          }}
                          className="text-red-600 hover:text-red-700"
                        ><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing && <EditorDialog block={editing} onClose={() => setEditing(null)} />}
      {creating && <CreateDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</div>
    </CardContent></Card>
  );
}

function stripHtml(html: string) {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}
function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

function EditorDialog({ block, onClose }: { block: ContentBlock; onClose: () => void }) {
  const [value, setValue] = useState(block.draft_value ?? block.current_value ?? block.default_value);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isRich = block.type === "richtext";

  const doPublish = async () => {
    setSaving(true);
    try { await publishContent(block.id, value); toast.success("تم النشر"); onClose(); }
    catch (e: any) { toast.error(e?.message || "فشل النشر"); } finally { setSaving(false); }
  };
  const doDraft = async () => {
    setSaving(true);
    try { await saveContentDraft(block.id, value); toast.success("تم حفظ المسودة (لا تظهر للزوار)"); onClose(); }
    catch (e: any) { toast.error(e?.message || "فشل الحفظ"); } finally { setSaving(false); }
  };
  const doRestore = async () => {
    if (!confirm("استعادة النص الافتراضي؟")) return;
    setSaving(true);
    try { await restoreDefault(block.id); toast.success("تم الاستعادة"); onClose(); }
    catch (e: any) { toast.error(e?.message || "فشل الاستعادة"); } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل نص: {block.label || block.content_key}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-muted-foreground">Key:</span> <code className="text-[11px]" dir="ltr">{block.content_key}</code></div>
            <div><span className="text-muted-foreground">النوع:</span> <Badge variant="outline">{block.type}</Badge></div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">النص الافتراضي (من الكود)</Label>
            <div className="mt-1 p-2 rounded border bg-muted/40 text-xs max-h-24 overflow-y-auto whitespace-pre-wrap">{stripHtml(block.default_value) || "—"}</div>
          </div>

          <div>
            <Label>النص الجديد</Label>
            {isRich ? (
              <RichTextEditor value={value} onChange={setValue} />
            ) : block.type === "textarea" || block.type === "message" ? (
              <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} />
            ) : (
              <Input value={value} onChange={(e) => setValue(e.target.value)} />
            )}
          </div>

          {block.draft_value != null && (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs">
              <div className="font-bold text-amber-800 mb-1">يوجد مسودة محفوظة (غير منشورة)</div>
              <div className="whitespace-pre-wrap text-amber-900 max-h-24 overflow-y-auto">{stripHtml(block.draft_value)}</div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowHistory((v) => !v)}>
              <History className="h-4 w-4 ml-1" /> {showHistory ? "إخفاء" : "عرض"} تاريخ التعديلات
            </Button>
            <Button size="sm" variant="ghost" onClick={doRestore} className="text-muted-foreground">
              <RotateCcw className="h-4 w-4 ml-1" /> استعادة النص الافتراضي
            </Button>
          </div>

          {showHistory && <VersionsList contentKey={block.content_key} onRestore={(v) => setValue(v)} />}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="outline" onClick={doDraft} disabled={saving}>
            <Save className="h-4 w-4 ml-1" /> حفظ كمسودة
          </Button>
          <Button onClick={doPublish} disabled={saving} className="bg-brand text-white">
            <Send className="h-4 w-4 ml-1" /> نشر
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionsList({ contentKey, onRestore }: { contentKey: string; onRestore: (v: string) => void }) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    listContentVersions(contentKey)
      .then((v) => { if (alive) setVersions(v); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [contentKey]);

  if (loading) return <div className="text-xs text-muted-foreground">جارٍ تحميل السجل...</div>;
  if (!versions.length) return <div className="text-xs text-muted-foreground">لا يوجد تاريخ تعديلات بعد.</div>;
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto border rounded p-2">
      {versions.map((v) => (
        <div key={v.id} className="text-xs border-b last:border-0 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">{new Date(v.created_at).toLocaleString("ar-EG")}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{v.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => onRestore(v.new_value)} className="h-6 px-2 text-[11px]">
                استخدام هذه النسخة
              </Button>
            </div>
          </div>
          <div className="text-foreground whitespace-pre-wrap line-clamp-3">{stripHtml(v.new_value)}</div>
        </div>
      ))}
    </div>
  );
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [page, setPage] = useState("global");
  const [section, setSection] = useState("general");
  const [type, setType] = useState<ContentBlockType>("text");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!key.trim()) { toast.error("أدخل Content Key"); return; }
    setSaving(true);
    try {
      await createContentBlock({
        content_key: key.trim(), page_slug: page, section_key: section,
        label: label || key, type, default_value: value, current_value: value,
      });
      toast.success("تمت الإضافة");
      onClose();
    } catch (e: any) { toast.error(e?.message || "فشل الإضافة"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>إضافة نص جديد</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Content Key</Label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="home.hero.title" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الصفحة</Label><Input value={page} onChange={(e) => setPage(e.target.value)} dir="ltr" /></div>
            <div><Label>القسم</Label><Input value={section} onChange={(e) => setSection(e.target.value)} dir="ltr" /></div>
          </div>
          <div>
            <Label>Label للأدمن</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label>النوع</Label>
            <Select value={type} onValueChange={(v) => setType(v as ContentBlockType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.filter(t => t.value !== "الكل").map((t) => <SelectItem key={String(t.value)} value={String(t.value)}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>النص</Label>
            {type === "richtext" ? (
              <RichTextEditor value={value} onChange={setValue} />
            ) : type === "textarea" || type === "message" ? (
              <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} />
            ) : (
              <Input value={value} onChange={(e) => setValue(e.target.value)} />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button onClick={create} disabled={saving} className="bg-brand text-white">
            <Save className="h-4 w-4 ml-1" /> حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
