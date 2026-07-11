import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, X, Loader2, RefreshCw } from "lucide-react";
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
  currentUrl?: string;
  onUploaded: (url: string, storagePath: string) => void;
  onClear?: () => void;
  label?: string;
};

export function FileUploader({ kind, folder, currentUrl, onUploaded, onClear, label }: Props) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = kind === "image" ? IMAGE_MIME.join(",") : VIDEO_MIME.join(",");

  const handleFile = async (file: File) => {
    const err = validateFile(file, kind);
    if (err) { toast.error(err); return; }
    setBusy(true);
    try {
      const res = await uploadToMediaBucket(file, folder);
      onUploaded(res.url, res.storagePath);
      toast.success(kind === "image" ? "تم رفع الصورة بنجاح" : "تم رفع الفيديو بنجاح");
    } catch (e) {
      console.error("[upload]", e);
      toast.error("تعذر رفع الملف، برجاء المحاولة مرة أخرى");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  const promptText =
    label ??
    (kind === "image"
      ? "اسحب الصورة هنا أو اضغط لاختيار ملف من جهازك"
      : "اسحب الفيديو هنا أو اضغط لاختيار ملف من جهازك");

  return (
    <div className="space-y-2">
      {currentUrl && (
        <div className="rounded-lg overflow-hidden border bg-muted/30">
          {kind === "image" ? (
            <img src={currentUrl} alt="preview" className="w-full max-h-64 object-contain bg-black/5" />
          ) : (
            <video src={currentUrl} controls className="w-full max-h-64 bg-black" />
          )}
        </div>
      )}

      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={[
          "cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition",
          drag ? "border-[var(--accent-red)] bg-red-50" : "border-muted-foreground/30 hover:border-[var(--accent-red)]/60",
          busy ? "opacity-60 pointer-events-none" : "",
        ].join(" ")}
      >
        {busy ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الرفع...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
            <div>{promptText}</div>
            <div className="text-xs">
              {kind === "image" ? "JPG / PNG / WEBP — حتى 10MB" : "MP4 / WEBM — حتى 100MB"}
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </div>

      {currentUrl && (
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
            <RefreshCw className="h-3.5 w-3.5 ml-1" /> استبدال
          </Button>
          {onClear && (
            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={onClear} disabled={busy}>
              <X className="h-3.5 w-3.5 ml-1" /> حذف
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
