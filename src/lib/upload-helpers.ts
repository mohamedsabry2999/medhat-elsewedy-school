// Generic upload helpers for the shared "media" Supabase Storage bucket.
// Reused by admin editors that need to accept files from disk in addition
// to external URLs (graduates covers, batch images, batch videos, etc.).

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // ~1 year

export const IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const VIDEO_MIME = ["video/mp4", "video/webm"];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

function slugifyFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const safe =
    base
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "file";
  return `${safe}${ext}`;
}

export type UploadKind = "image" | "video";

export type UploadedFile = {
  url: string;
  storagePath: string;
  size: number;
  mimeType: string;
};

export function validateFile(file: File, kind: UploadKind): string | null {
  if (kind === "image") {
    if (!IMAGE_MIME.includes(file.type)) {
      return "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP.";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return "حجم الصورة كبير جدًا (الحد الأقصى 10MB).";
    }
  } else {
    if (!VIDEO_MIME.includes(file.type)) {
      return "صيغة الفيديو غير مدعومة. استخدم MP4 أو WEBM.";
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return "حجم الفيديو كبير، يفضل رفعه على YouTube وإضافة الرابط.";
    }
  }
  return null;
}

export async function uploadToMediaBucket(
  file: File,
  folder: string,
): Promise<UploadedFile> {
  const id = crypto.randomUUID();
  const path = `${folder.replace(/^\/+|\/+$/g, "")}/${id}-${slugifyFileName(file.name)}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
  if (upErr) throw upErr;

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !signed) throw signErr ?? new Error("Failed to sign URL");

  return {
    url: signed.signedUrl,
    storagePath: path,
    size: file.size,
    mimeType: file.type,
  };
}
