import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Search, Eye, EyeOff, Star, Save, ImagePlus, Video, Image as ImageIcon, X,
} from "lucide-react";
import {
  useAllBatches, createBatch, updateBatch, deleteBatch,
  useBatchMedia, createMedia, updateMedia, deleteMedia,
  BATCH_MEDIA_CATEGORIES, type GraduateBatch, type BatchStatus, type GraduateMedia,
} from "@/lib/graduates-store";
import { toYouTubeEmbed } from "@/lib/youtube";
import { SmartImage } from "@/components/ui/SmartImage";
import { FileUploader } from "@/components/admin/FileUploader";
import { MultiFileUploader } from "@/components/admin/MultiFileUploader";

const STATUS_OPTIONS: BatchStatus[] = ["منشورة", "مسودة", "مخفية"];

export function GraduatesTab() {
  const batches = useAllBatches();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<GraduateBatch | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return batches;
    return batches.filter((b) =>
      b.title.includes(t) ||
      b.slug.includes(t) ||
      String(b.graduation_year ?? "").includes(t),
    );
  }, [batches, q]);

  const onDelete = async (b: GraduateBatch) => {
    if (!confirm(`حذف دفعة "${b.title}" نهائيًا؟ سيتم حذف كل صورها وفيديوهاتها.`)) return;
    await deleteBatch(b.id);
    toast.success("تم الحذف");
  };

  const onToggleStatus = async (b: GraduateBatch) => {
    const next: BatchStatus = b.status === "منشورة" ? "مخفية" : "منشورة";
    await updateBatch(b.id, { status: next });
    toast.success(`الحالة الآن: ${next}`);
  };

  const onToggleFeatured = async (b: GraduateBatch) => {
    await updateBatch(b.id, { featured_on_home: !b.featured_on_home });
    toast.success(b.featured_on_home ? "تمت إزالة التمييز" : "تم التمييز في الرئيسية");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث باسم الدفعة أو السنة..." className="pr-9" />
        </div>
        <Button onClick={() => setCreating(true)} className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90">
          <Plus className="h-4 w-4 ml-1" /> إضافة دفعة جديدة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الدفعة</TableHead>
                  <TableHead className="text-right">السنة</TableHead>
                  <TableHead className="text-right">الخريجون</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">في الرئيسية</TableHead>
                  <TableHead className="text-right">الترتيب</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد دفعات. اضغط "إضافة دفعة جديدة" للبدء.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold">{b.title}</TableCell>
                    <TableCell>{b.graduation_year ?? "—"}</TableCell>
                    <TableCell>{b.graduates_count ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={
                        b.status === "منشورة" ? "bg-green-100 text-green-700" :
                        b.status === "مخفية" ? "bg-gray-200 text-gray-700" :
                        "bg-amber-100 text-amber-700"
                      }>{b.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onToggleFeatured(b)}
                        title={b.featured_on_home ? "إزالة من الرئيسية" : "تمييز في الرئيسية"}
                      >
                        <Star className={b.featured_on_home ? "h-5 w-5 text-amber-500 fill-amber-400" : "h-5 w-5 text-muted-foreground"} />
                      </button>
                    </TableCell>
                    <TableCell>{b.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(b)} title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onToggleStatus(b)} title="نشر/إخفاء">
                          {b.status === "منشورة" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDelete(b)} title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {creating && <BatchCreateDialog onClose={() => setCreating(false)} />}
      {editing && <BatchEditDialog batch={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ============================== CREATE DIALOG ============================== */

function BatchCreateDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");
  const [excerpt, setExcerpt] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim()) { toast.error("العنوان مطلوب"); return; }
    setBusy(true);
    const b = await createBatch({
      title: title.trim(),
      graduation_year: year ? Number(year) : null,
      excerpt,
      status: "مسودة",
    });
    setBusy(false);
    if (b) {
      toast.success("تم إنشاء الدفعة");
      onClose();
    } else {
      toast.error("تعذر إنشاء الدفعة");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader><DialogTitle>إضافة دفعة جديدة</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>اسم الدفعة</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: دفعة 2025" />
          </div>
          <div>
            <Label>سنة التخرج</Label>
            <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
          </div>
          <div>
            <Label>وصف مختصر</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={busy} className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90">
            {busy ? "جارٍ الحفظ..." : "إنشاء"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================== EDIT DIALOG ============================== */

function BatchEditDialog({ batch, onClose }: { batch: GraduateBatch; onClose: () => void }) {
  const [form, setForm] = useState<GraduateBatch>(batch);
  const [busy, setBusy] = useState(false);
  const media = useBatchMedia(batch.id);
  const images = media.filter((m) => m.media_type === "image");
  const videos = media.filter((m) => m.media_type === "video");

  const save = async () => {
    setBusy(true);
    await updateBatch(batch.id, {
      title: form.title,
      slug: form.slug,
      graduation_year: form.graduation_year,
      graduates_count: form.graduates_count,
      excerpt: form.excerpt,
      description: form.description,
      cover_image_url: form.cover_image_url,
      cover_image_alt: form.cover_image_alt,
      status: form.status,
      featured_on_home: form.featured_on_home,
      sort_order: form.sort_order,
      published_at: form.published_at,
    });
    setBusy(false);
    toast.success("تم الحفظ");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>تعديل دفعة: {batch.title}</DialogTitle></DialogHeader>

        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">بيانات الدفعة</TabsTrigger>
            <TabsTrigger value="images" className="flex-1">صور الدفعة ({images.length})</TabsTrigger>
            <TabsTrigger value="videos" className="flex-1">فيديوهات الدفعة ({videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>اسم الدفعة</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>سنة التخرج</Label>
                <Input type="number" value={form.graduation_year ?? ""} onChange={(e) => setForm({ ...form, graduation_year: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label>عدد الخريجين</Label>
                <Input type="number" value={form.graduates_count ?? ""} onChange={(e) => setForm({ ...form, graduates_count: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label>ترتيب الظهور</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>وصف مختصر</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Label>وصف كامل</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} />
              </div>
              <div className="sm:col-span-2">
                <Label>صورة الغلاف</Label>
                <Tabs defaultValue={form.cover_image_url ? "url" : "upload"} className="mt-2">
                  <TabsList>
                    <TabsTrigger value="url">رابط خارجي</TabsTrigger>
                    <TabsTrigger value="upload">رفع من الجهاز</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="pt-3">
                    <Input
                      value={form.cover_image_url}
                      onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="pt-3">
                    <FileUploader
                      kind="image"
                      folder="graduates/covers"
                      currentUrl={form.cover_image_url || undefined}
                      onUploaded={(url) => setForm({ ...form, cover_image_url: url })}
                      onClear={() => setForm({ ...form, cover_image_url: "" })}
                      label="اسحب صورة الغلاف هنا أو اضغط لاختيار ملف من جهازك"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="sm:col-span-2">
                <Label>Alt Text لصورة الغلاف</Label>
                <Input value={form.cover_image_alt} onChange={(e) => setForm({ ...form, cover_image_alt: e.target.value })} />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BatchStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.featured_on_home} onCheckedChange={(v) => setForm({ ...form, featured_on_home: v })} />
                <Label>ظهور في الصفحة الرئيسية</Label>
              </div>
            </div>
            {form.cover_image_url && (
              <div className="rounded-lg overflow-hidden border relative" style={{ aspectRatio: "16 / 9" }}>
                <SmartImage src={form.cover_image_url} alt={form.cover_image_alt || form.title} fill imageType="article_cover" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="pt-4">
            <MediaImagesEditor batchId={batch.id} images={images} />
          </TabsContent>
          <TabsContent value="videos" className="pt-4">
            <MediaVideosEditor batchId={batch.id} videos={videos} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          <Button onClick={save} disabled={busy} className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90">
            <Save className="h-4 w-4 ml-1" /> {busy ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================== MEDIA - IMAGES ============================== */

function MediaImagesEditor({ batchId, images }: { batchId: string; images: GraduateMedia[] }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [cat, setCat] = useState<string>(BATCH_MEDIA_CATEGORIES[0]);

  const add = async () => {
    if (!url.trim()) { toast.error("رابط الصورة مطلوب"); return; }
    await createMedia({
      batch_id: batchId, media_type: "image",
      image_url: url.trim(), alt_text: alt.trim(), category: cat,
      sort_order: images.length,
    });
    setUrl(""); setAlt("");
    toast.success("تمت إضافة الصورة");
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه الصورة؟")) return;
    await deleteMedia(id);
    toast.success("تم الحذف");
  };

  const toggle = async (m: GraduateMedia) => {
    await updateMedia(m.id, { status: m.status === "published" ? "hidden" : "published" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label>مصدر الصورة</Label>
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">رفع من الجهاز</TabsTrigger>
              <TabsTrigger value="url">رابط خارجي</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-3">
              <FileUploader
                kind="image"
                folder={`graduates/${batchId}/images`}
                currentUrl={url || undefined}
                onUploaded={(u) => setUrl(u)}
                onClear={() => setUrl("")}
              />
            </TabsContent>
            <TabsContent value="url" className="pt-3">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </TabsContent>
          </Tabs>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Alt Text</Label>
              <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
            </div>
            <div>
              <Label>التصنيف</Label>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BATCH_MEDIA_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={add} className="bg-brand hover:bg-brand/90 text-white">
            <ImagePlus className="h-4 w-4 ml-1" /> إضافة صورة
          </Button>
        </CardContent>
      </Card>

      {images.length === 0 ? (
        <div className="text-center text-muted-foreground py-6">لا توجد صور بعد.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((m) => (
            <div key={m.id} className="relative rounded-lg overflow-hidden border group">
              <div className="relative" style={{ aspectRatio: "1 / 1" }}>
                <SmartImage src={m.image_url} alt={m.alt_text || ""} focalX={m.focal_x} focalY={m.focal_y} fill imageType="gallery" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-2 flex items-center justify-between gap-1">
                <span className="text-[10px] truncate">{m.category || "—"}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggle(m)} title="نشر/إخفاء" className="p-1 hover:bg-white/10 rounded">
                    {m.status === "published" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => remove(m.id)} title="حذف" className="p-1 hover:bg-red-500/50 rounded">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== MEDIA - VIDEOS ============================== */

function MediaVideosEditor({ batchId, videos }: { batchId: string; videos: GraduateMedia[] }) {
  const [title, setTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [mode, setMode] = useState<"youtube" | "upload">("youtube");

  const reset = () => { setTitle(""); setYtUrl(""); setFileUrl(""); setDesc(""); };

  const add = async () => {
    if (mode === "youtube") {
      const embed = toYouTubeEmbed(ytUrl);
      if (!embed) { toast.error("رابط يوتيوب غير صالح"); return; }
      await createMedia({
        batch_id: batchId, media_type: "video",
        title: title.trim(), description: desc, video_url: ytUrl.trim(), embed_url: embed,
        sort_order: videos.length,
      });
    } else {
      if (!fileUrl) { toast.error("يرجى رفع ملف الفيديو أولًا"); return; }
      await createMedia({
        batch_id: batchId, media_type: "video",
        title: title.trim(), description: desc, video_url: fileUrl, embed_url: "",
        sort_order: videos.length,
      });
    }
    reset();
    toast.success("تمت إضافة الفيديو");
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الفيديو؟")) return;
    await deleteMedia(id);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <Label>عنوان الفيديو</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>مصدر الفيديو</Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "youtube" | "upload")} className="mt-2">
              <TabsList>
                <TabsTrigger value="youtube">رابط YouTube</TabsTrigger>
                <TabsTrigger value="upload">رفع من الجهاز</TabsTrigger>
              </TabsList>
              <TabsContent value="youtube" className="pt-3">
                <Input value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </TabsContent>
              <TabsContent value="upload" className="pt-3">
                <FileUploader
                  kind="video"
                  folder={`graduates/${batchId}/videos`}
                  currentUrl={fileUrl || undefined}
                  onUploaded={(u) => setFileUrl(u)}
                  onClear={() => setFileUrl("")}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <Label>وصف قصير (اختياري)</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          </div>
          <Button onClick={add} className="bg-brand hover:bg-brand/90 text-white">
            <Video className="h-4 w-4 ml-1" /> إضافة فيديو
          </Button>
        </CardContent>
      </Card>

      {videos.length === 0 ? (
        <div className="text-center text-muted-foreground py-6">لا توجد فيديوهات بعد.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {videos.map((v) => (
            <Card key={v.id} className="overflow-hidden pt-0">
              <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                {v.embed_url ? (
                  <iframe src={v.embed_url} title={v.title} loading="lazy" allowFullScreen className="absolute inset-0 h-full w-full" />
                ) : (
                  <video src={v.video_url} controls className="absolute inset-0 h-full w-full bg-black" />
                )}
              </div>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{v.title || "بدون عنوان"}</div>
                  {v.description && <div className="text-xs text-muted-foreground truncate">{v.description}</div>}
                </div>
                <Button size="sm" variant="ghost" className="text-red-600 shrink-0" onClick={() => remove(v.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

