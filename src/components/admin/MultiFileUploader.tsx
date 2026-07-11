import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";
import {
  uploadToMediaBucket,
  validateFile,
  IMAGE_MIME,
  VIDEO_MIME,
  type UploadKind,
} from "@/lib/upload-helpers";

type Props = {
  kind: UploadKind;
  folder: string;
  maxFiles?: number;
  onUploaded: (file: { url: string; storagePath: string; name: string }) => void | Promise<void>;
  label?: string;
};

export function MultiFileUploader({ kind, folder, maxFiles = 20, onUploaded, label }: Props) {
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = kind === "image" ? IMAGE_MIME.join(",") : VIDEO_MIME.join(",");

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    if (files.length > maxFiles) {
      toast.error(`الحد الأقصى ${maxFiles} ملف في المرة الواحدة`);
      files = files.slice(0, maxFiles);
    }
    // Validate all first
    for (const f of files) {
      const err = validateFile(f, kind);
      if (err) { toast.error(`${f.name}: ${err}`); return; }
    }
    setProgress({ done: 0, total: files.length });
    let ok = 0, fail = 0;
    // Upload in parallel batches of 4 to keep things snappy but not overload
    const CONCURRENCY = 4;
    let idx = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, async () => {
      while (idx < files.length) {
        const my = idx++;
        const f = files[my];
        try {
          const res = await uploadToMediaBucket(f, folder);
          await onUploaded({ url: res.url, storagePath: res.storagePath, name: f.name });
          ok++;
        } catch (e) {
          console.error("[bulk-upload]", e);
          fail++;
          toast.error(`فشل رفع: ${f.name}`);
        } finally {
          setProgress((p) => p ? { ...p, done: p.done + 1 } : p);
        }
      }
    });
    await Promise.all(workers);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    if (ok) toast.success(`تم رفع ${ok} ملف${fail ? ` (فشل ${fail})` : ""}`);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    void handleFiles(files);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    void handleFiles(files);
  };

  const busy = !!progress;
  const promptText =
    label ??
    (kind === "image"
      ? `اسحب حتى ${maxFiles} صورة هنا أو اضغط لاختيار ملفات من جهازك`
      : `اسحب حتى ${maxFiles} فيديو هنا أو اضغط لاختيار ملفات من جهازك`);

  return (
    <div
      onClick={() => !busy && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={[
        "cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition",
        drag ? "border-[var(--accent-red)] bg-red-50" : "border-muted-foreground/30 hover:border-[var(--accent-red)]/60",
        busy ? "opacity-70 pointer-events-none" : "",
      ].join(" ")}
    >
      {busy ? (
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>جارٍ الرفع... {progress!.done}/{progress!.total}</div>
          <div className="w-full max-w-xs h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-[var(--accent-red)] transition-all"
              style={{ width: `${(progress!.done / progress!.total) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <UploadCloud className="h-6 w-6" />
          <div>{promptText}</div>
          <div className="text-xs">
            {kind === "image" ? "JPG / PNG / WEBP — حتى 10MB لكل صورة" : "MP4 / WEBM — حتى 100MB لكل فيديو"}
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
