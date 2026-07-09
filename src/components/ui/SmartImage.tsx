import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SmartImageType =
  | "auto"
  | "student_portrait"
  | "student_group"
  | "training_landscape"
  | "logo"
  | "certificate"
  | "article_cover"
  | "gallery"
  | "hero";

export type SmartImageProps = {
  src: string;
  alt: string;
  focalX?: number | null;
  focalY?: number | null;
  mobileFocalX?: number | null;
  mobileFocalY?: number | null;
  imageType?: SmartImageType;
  cropMode?: "cover" | "contain";
  aspectRatio?: string; // e.g. "16 / 9", "1 / 1", "4 / 5"
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  fill?: boolean; // absolute inset-0 (parent controls sizing)
  onClick?: () => void;
};

const HEAD_SAFE_TYPES = new Set<SmartImageType>([
  "student_portrait",
  "student_group",
  "gallery",
  "hero",
]);

/** Sensible fallbacks so we never crop a student's head. */
function resolveFocal(p: SmartImageProps): { x: number; y: number } {
  if (typeof p.focalX === "number" && typeof p.focalY === "number") {
    return { x: p.focalX, y: p.focalY };
  }
  if (HEAD_SAFE_TYPES.has(p.imageType ?? "auto")) return { x: 50, y: 25 };
  if (p.imageType === "article_cover") return { x: 50, y: 35 };
  if (p.imageType === "training_landscape") return { x: 50, y: 40 };
  return { x: 50, y: 50 };
}


function useIsMobile(): boolean {
  const [m, setM] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

export function SmartImage(props: SmartImageProps) {
  const {
    src, alt, aspectRatio, className, imgClassName,
    loading = "lazy", fill = false, onClick,
    imageType = "auto",
  } = props;

  const isMobile = useIsMobile();
  const desktop = resolveFocal(props);
  const mobile =
    typeof props.mobileFocalX === "number" && typeof props.mobileFocalY === "number"
      ? { x: props.mobileFocalX, y: props.mobileFocalY }
      : desktop;
  const focal = isMobile ? mobile : desktop;

  const isContain = (props.cropMode ?? (imageType === "logo" || imageType === "certificate" ? "contain" : "cover")) === "contain";
  const objectFitClass = isContain ? "object-contain" : "object-cover";

  const style: React.CSSProperties = {
    objectPosition: `${focal.x}% ${focal.y}%`,
  };

  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        onClick={onClick}
        className={cn("absolute inset-0 h-full w-full", objectFitClass, imgClassName, className)}
        style={style}
        draggable={false}
      />
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden w-full", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn("absolute inset-0 h-full w-full", objectFitClass, imgClassName)}
        style={style}
        draggable={false}
      />
    </div>
  );
}

/** Guess an image type from natural dimensions. */
export function detectImageType(width: number, height: number, category?: string): SmartImageType {
  if (category === "الاعتمادات والشهادات") return "certificate";
  if (category === "صور الطلاب") return "student_portrait";
  if (!width || !height) return "auto";
  const ratio = height / width;
  if (ratio >= 1.15) return "student_portrait"; // portrait
  if (ratio <= 0.6) return "training_landscape"; // wide
  return "auto";
}

/** Default focal point for a detected type. */
export function defaultFocalFor(type: SmartImageType): { x: number; y: number } {
  if (HEAD_SAFE_TYPES.has(type)) return { x: 50, y: 25 };
  if (type === "training_landscape") return { x: 50, y: 40 };
  return { x: 50, y: 50 };
}
