import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, User, Square, Image as ImageIcon } from "lucide-react";

type Props = {
  src: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
  aspect?: string; // legacy prop
};

const PRESETS: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; x: number; y: number }> = [
  { id: "portrait", label: "طالب Portrait 4:5", icon: User, x: 50, y: 25 },
  { id: "square", label: "طالب مربع 1:1", icon: Square, x: 50, y: 22 },
  { id: "center", label: "توسيط", icon: ImageIcon, x: 50, y: 50 },
];

/**
 * Full focal-point editor: click/drag on the image, X/Y sliders, nudge buttons,
 * quick presets, and previews for how the image will appear across the site
 * (news 16:9 / gallery square / hero mobile 4:5).
 */
export function FocalPointPicker({ src, focalX, focalY, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const setXY = (x: number, y: number) =>
    onChange(Math.max(0, Math.min(100, Math.round(x))), Math.max(0, Math.min(100, Math.round(y))));

  const update = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setXY(((clientX - r.left) / r.width) * 100, ((clientY - r.top) / r.height) * 100);
  };

  const nudge = (dx: number, dy: number) => setXY(focalX + dx, focalY + dy);
  const style = { objectPosition: `${focalX}% ${focalY}%` };

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        اضغط أو اسحب على الصورة لاختيار نقطة التركيز — أو استخدم الأزرار / الشرائح أدناه.
      </div>

      {/* Interactive picker */}
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-lg border cursor-crosshair select-none bg-black/5"
        style={{ aspectRatio: "4 / 3" }}
        onMouseDown={(e) => { setDragging(true); update(e.clientX, e.clientY); }}
        onMouseMove={(e) => dragging && update(e.clientX, e.clientY)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={(e) => { const t = e.touches[0]; if (t) update(t.clientX, t.clientY); }}
        onTouchMove={(e) => { const t = e.touches[0]; if (t) update(t.clientX, t.clientY); }}
      >
        <img src={src} alt="" className="w-full h-full object-contain pointer-events-none" />
        {/* Safe head zone marker */}
        <div className="absolute inset-x-0 top-0 h-[30%] border-b border-dashed border-white/40 pointer-events-none" />
        <div
          className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--accent-red)] shadow-lg pointer-events-none"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
        />
      </div>

      {/* Nudge buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button type="button" size="icon" variant="outline" onClick={() => nudge(0, -5)} aria-label="لأعلى"><ArrowUp className="h-4 w-4" /></Button>
        <div className="flex flex-col gap-2">
          <Button type="button" size="icon" variant="outline" onClick={() => nudge(-5, 0)} aria-label="يسار"><ArrowLeft className="h-4 w-4" /></Button>
        </div>
        <Button type="button" size="icon" variant="ghost" onClick={() => setXY(50, 50)} aria-label="Reset"><RotateCcw className="h-4 w-4" /></Button>
        <div className="flex flex-col gap-2">
          <Button type="button" size="icon" variant="outline" onClick={() => nudge(5, 0)} aria-label="يمين"><ArrowRight className="h-4 w-4" /></Button>
        </div>
        <Button type="button" size="icon" variant="outline" onClick={() => nudge(0, 5)} aria-label="لأسفل"><ArrowDown className="h-4 w-4" /></Button>
      </div>

      {/* Sliders */}
      <div className="grid gap-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>X (أفقي)</span><span>{focalX}%</span></div>
          <Slider value={[focalX]} min={0} max={100} step={1} onValueChange={(v) => setXY(v[0] ?? 50, focalY)} />
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Y (رأسي)</span><span>{focalY}%</span></div>
          <Slider value={[focalY]} min={0} max={100} step={1} onValueChange={(v) => setXY(focalX, v[0] ?? 50)} />
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground w-full">إعدادات جاهزة:</span>
        {PRESETS.map((p) => {
          const Icon = p.icon;
          return (
            <Button key={p.id} type="button" size="sm" variant="outline" onClick={() => setXY(p.x, p.y)}>
              <Icon className="h-3.5 w-3.5 ml-1" /> {p.label}
            </Button>
          );
        })}
        <Button type="button" size="sm" variant="ghost" onClick={() => setXY(50, 50)}>
          <Crop className="h-3.5 w-3.5 ml-1" /> توسيط
        </Button>
      </div>

      {/* Live previews across formats */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <PreviewBox src={src} focalX={focalX} focalY={focalY} label="مربع (المعرض)" ratio="1 / 1" />
        <PreviewBox src={src} focalX={focalX} focalY={focalY} label="خبر 16:9" ratio="16 / 9" />
        <PreviewBox src={src} focalX={focalX} focalY={focalY} label="موبايل 4:5" ratio="4 / 5" />
      </div>
    </div>
  );
}

function PreviewBox({ src, focalX, focalY, label, ratio }: { src: string; focalX: number; focalY: number; label: string; ratio: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground mb-1 text-center">{label}</div>
      <div className="w-full rounded-md overflow-hidden border bg-black/5" style={{ aspectRatio: ratio }}>
        <img src={src} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${focalX}% ${focalY}%` }} />
      </div>
    </div>
  );
}
