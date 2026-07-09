import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Crop, RotateCcw } from "lucide-react";

type Props = {
  src: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
  aspect?: string; // e.g. "16 / 9"
};

/**
 * Simple focal-point picker: click on the image to set the focus point.
 * The thumbnail preview crops via CSS object-fit / object-position — no
 * pixel distortion, unified card ratio, real crop happens at display time.
 */
export function FocalPointPicker({ src, focalX, focalY, onChange, aspect = "16 / 9" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const update = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    onChange(Math.round(x), Math.round(y));
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        اضغط أو اسحب على الصورة لاختيار نقطة التركيز — سيتم قص المعاينة تلقائيًا حولها.
      </div>
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-lg border cursor-crosshair select-none bg-black/5"
        style={{ aspectRatio: "4 / 3" }}
        onMouseDown={(e) => {
          setDragging(true);
          update(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => dragging && update(e.clientX, e.clientY)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) update(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) update(t.clientX, t.clientY);
        }}
      >
        <img src={src} alt="" className="w-full h-full object-contain pointer-events-none" />
        <div
          className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--accent-red)] shadow-lg pointer-events-none"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onChange(50, 50)}>
          <Crop className="h-4 w-4 ml-1" /> قص تلقائي (توسيط)
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => onChange(50, 50)}>
          <RotateCcw className="h-4 w-4 ml-1" /> إعادة تعيين
        </Button>
        <span className="text-xs text-muted-foreground">
          نقطة التركيز: {focalX}% × {focalY}%
        </span>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1">معاينة كارت الأخبار (16:9)</div>
        <div className="w-full rounded-lg overflow-hidden border" style={{ aspectRatio: aspect }}>
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
          />
        </div>
      </div>
    </div>
  );
}
