import { useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Save, Upload, ImageIcon, Download } from "lucide-react";
import { FocalPointPicker } from "@/components/admin/FocalPointPicker";
import { cn } from "@/lib/utils";
import { IMG, GALLERY, NEWS } from "@/lib/site-data";
import {
  useMediaLibrary,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  toggleMediaStatus,
  uploadMediaFile,
  importSiteImages,
  suggestPreset,
  MEDIA_CATEGORIES,
  USAGE_LOCATIONS,
  DISPLAY_POSITIONS,
  SIZE_PRESETS,
  type MediaAsset,
  type MediaStatus,
} from "@/lib/media-store";

const STATUS_LABEL: Record<MediaStatus, string> = {
  published: "منشورة",
  hidden: "مخفية",
  archived: "أرشيف",
};

const STATUS_CLASS: Record<MediaStatus, string> = {
  published: "bg-green-100 text-green-700",
  hidden: "bg-gray-200 text-gray-700",
  archived: "bg-amber-100 text-amber-700",
};

type Draft = Omit<MediaAsset, "id" | "createdAt" | "updatedAt">;

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  altText: "",
  caption: "",
  storagePath: "",
  imageUrl: "",
  thumbnailUrl: "",
  category: "أخرى",
  status: "published",
  usageLocations: [],
  displayPosition: "",
  focalX: 50,
  focalY: 50,
  aspectRatio: "",
  cropSettings: {},
  width: 0,
  height: 0,
  fileSize: 0,
  mimeType: "",
  sortOrder: 0,
});

export function MediaLibraryTab() {
  const { items, loaded } = useMediaLibrary();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("الكل");
  const [usage, setUsage] = useState<string>("الكل");
  const [statusF, setStatusF] = useState<string>("الكل");
  const [editor, setEditor] = useState<{ open: boolean; asset: MediaAsset | Draft | null; isNew: boolean }>({
    open: false, asset: null, isNew: true,
  });

  const filtered = useMemo(() => {
    return items.filter((m) => {
      if (q && !m.title.toLowerCase().includes(q.toLowerCase()) && !m.altText.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "الكل" && m.category !== cat) return false;
      if (usage !== "الكل" && !m.usageLocations.includes(usage)) return false;
      if (statusF === "غير مستخدمة") {
        if (m.usageLocations.length > 0 || m.displayPosition) return false;
      } else if (statusF !== "الكل") {
        const targetStatus = statusF === "منشورة" ? "published" : statusF === "مخفية" ? "hidden" : "archived";
        if (m.status !== targetStatus) return false;
      }
      return true;
    });
  }, [items, q, cat, usage, statusF]);

  const openNew = () => setEditor({ open: true, asset: emptyDraft(), isNew: true });
  const openEdit = (a: MediaAsset) => setEditor({ open: true, asset: a, isNew: false });
  const close = () => setEditor({ open: false, asset: null, isNew: true });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="font-extrabold text-brand text-xl">مكتبة الصور والوسائط</h2>
          <p className="text-sm text-muted-foreground">إدارة كاملة لصور الموقع — رفع، قص، نقطة تركيز، وتحديد مكان الظهور.</p>
        </div>
        <Button className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white" onClick={openNew}>
          <Plus className="h-4 w-4 ml-1" /> إضافة صورة
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="pr-9" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل التصنيفات</SelectItem>
                {MEDIA_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={usage} onValueChange={setUsage}>
              <SelectTrigger><SelectValue placeholder="مكان الظهور" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الأماكن</SelectItem>
                {USAGE_LOCATIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الحالات</SelectItem>
                <SelectItem value="منشورة">منشورة</SelectItem>
                <SelectItem value="مخفية">مخفية</SelectItem>
                <SelectItem value="أرشيف">أرشيف</SelectItem>
                <SelectItem value="غير مستخدمة">غير مستخدمة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((m) => (
          <Card key={m.id} className="overflow-hidden pt-0">
            <div className="aspect-square overflow-hidden bg-secondary/50 relative">
              {m.imageUrl ? (
                <img
                  src={m.imageUrl}
                  alt={m.altText || m.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${m.focalX}% ${m.focalY}%` }}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <Badge className={cn("absolute top-2 right-2", STATUS_CLASS[m.status])}>{STATUS_LABEL[m.status]}</Badge>
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="font-bold text-brand text-sm line-clamp-1">{m.title || "بدون عنوان"}</div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">{m.category}</Badge>
                {m.displayPosition && <Badge variant="outline" className="text-xs">{m.displayPosition}</Badge>}
              </div>
              {m.usageLocations.length > 0 && (
                <div className="text-[10px] text-muted-foreground line-clamp-2">
                  يظهر في: {m.usageLocations.slice(0, 2).join("، ")}
                  {m.usageLocations.length > 2 ? ` +${m.usageLocations.length - 2}` : ""}
                </div>
              )}
              <div className="flex gap-1 pt-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(m)} title="تعديل"><Pencil className="h-4 w-4" /></Button>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => { void toggleMediaStatus(m.id); toast.success("تم التحديث"); }}
                  title="نشر / إخفاء"
                >
                  {m.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon" variant="ghost" className="text-red-600"
                  onClick={() => {
                    const inUse = m.usageLocations.length > 0 || !!m.displayPosition;
                    const msg = inUse
                      ? "هذه الصورة مستخدمة في أماكن داخل الموقع. هل تريد حذفها؟"
                      : "حذف الصورة؟";
                    if (confirm(msg)) { void deleteMediaAsset(m.id); toast.success("تم الحذف"); }
                  }}
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            {loaded ? "لا توجد صور مطابقة" : "جاري التحميل..."}
          </div>
        )}
      </div>

      {editor.asset && (
        <MediaEditorDialog
          open={editor.open}
          asset={editor.asset}
          isNew={editor.isNew}
          onClose={close}
        />
      )}
    </div>
  );
}

function MediaEditorDialog({
  open, asset, isNew, onClose,
}: { open: boolean; asset: MediaAsset | Draft; isNew: boolean; onClose: () => void }) {
  const [form, setForm] = useState<MediaAsset | Draft>(asset);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const suggested = form.displayPosition ? suggestPreset(form.displayPosition) : null;
  const currentPreset = SIZE_PRESETS.find((p) => p.ratio === form.aspectRatio) ?? suggested ?? null;

  const onFile = async (f: File | null) => {
    if (!f) return;
    setBusy(true);
    try {
      const up = await uploadMediaFile(f);
      setForm((p) => ({
        ...p,
        storagePath: up.storagePath,
        imageUrl: up.imageUrl,
        thumbnailUrl: up.imageUrl,
        width: up.width,
        height: up.height,
        fileSize: up.fileSize,
        mimeType: up.mimeType,
        title: p.title || f.name.replace(/\.[^.]+$/, ""),
        altText: p.altText || "طالب من مدرسة مدحت السويدي للتكنولوجيا التطبيقية أثناء التدريب العملي",
      }));
      toast.success("تم رفع الصورة");
    } catch (err) {
      console.error(err);
      toast.error("فشل رفع الصورة");
    } finally {
      setBusy(false);
    }
  };

  const toggleUsage = (loc: string, on: boolean) => {
    setForm((p) => {
      const set = new Set(p.usageLocations);
      if (on) set.add(loc); else set.delete(loc);
      return { ...p, usageLocations: [...set] };
    });
  };

  const applyPreset = (preset: typeof SIZE_PRESETS[number]) => {
    setForm((p) => ({ ...p, aspectRatio: preset.ratio }));
  };

  const submit = async () => {
    if (!form.imageUrl || !form.storagePath) return toast.error("يرجى رفع صورة أولاً");
    if (!form.title.trim()) return toast.error("العنوان مطلوب");
    if (form.status === "published" && !form.altText.trim()) return toast.error("النص البديل مطلوب للصور المنشورة");
    setBusy(true);
    try {
      if (isNew) {
        await createMediaAsset(form);
        toast.success("تمت إضافة الصورة");
      } else if ("id" in form) {
        await updateMediaAsset(form.id, form);
        toast.success("تم حفظ التعديلات");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-brand">{isNew ? "إضافة صورة جديدة" : "تعديل الصورة"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>ملف الصورة</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                <Upload className="h-4 w-4 ml-1" /> {form.imageUrl ? "استبدال الصورة" : "رفع صورة"}
              </Button>
              {form.width > 0 && (
                <div className="text-xs text-muted-foreground">
                  {form.width}×{form.height}px · {(form.fileSize / 1024).toFixed(0)}KB
                </div>
              )}
            </div>
          </div>

          {form.imageUrl && (
            <FocalPointPicker
              src={form.imageUrl}
              focalX={form.focalX}
              focalY={form.focalY}
              onChange={(x, y) => setForm((p) => ({ ...p, focalX: x, focalY: y }))}
              aspect={currentPreset?.ratio ?? "16 / 9"}
            />
          )}

          <div className="grid gap-2">
            <Label>عنوان الصورة *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid gap-2">
            <Label>النص البديل Alt Text *</Label>
            <Input
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              placeholder="وصف الصورة لمحركات البحث وقارئات الشاشة"
            />
          </div>

          <div className="grid gap-2">
            <Label>الوصف</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid gap-2">
            <Label>تعليق Caption</Label>
            <Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>التصنيف</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEDIA_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MediaStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">منشورة</SelectItem>
                  <SelectItem value="hidden">مخفية</SelectItem>
                  <SelectItem value="archived">أرشيف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ترتيب</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>مكان الظهور الأساسي (Display Position)</Label>
            <Select value={form.displayPosition || "none"} onValueChange={(v) => setForm({ ...form, displayPosition: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— بدون —</SelectItem>
                {DISPLAY_POSITIONS.filter(Boolean).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {suggested && (
              <div className="text-xs text-muted-foreground">
                المقاس المقترح: <button type="button" className="text-brand underline" onClick={() => applyPreset(suggested)}>{suggested.label}</button>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>المقاس / نسبة الأبعاد</Label>
            <div className="flex flex-wrap gap-2">
              {SIZE_PRESETS.map((p) => (
                <Button
                  key={p.id} type="button" size="sm"
                  variant={form.aspectRatio === p.ratio ? "default" : "outline"}
                  className={form.aspectRatio === p.ratio ? "bg-brand text-white" : ""}
                  onClick={() => applyPreset(p)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>أماكن الظهور في الموقع</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-lg p-3 max-h-56 overflow-y-auto">
              {USAGE_LOCATIONS.map((loc) => (
                <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={form.usageLocations.includes(loc)}
                    onCheckedChange={(v) => toggleUsage(loc, !!v)}
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>إلغاء</Button>
          <Button
            className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white"
            onClick={() => void submit()} disabled={busy}
          >
            <Save className="h-4 w-4 ml-1" /> {busy ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
