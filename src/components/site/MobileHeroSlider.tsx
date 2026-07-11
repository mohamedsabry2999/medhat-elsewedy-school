import { useCallback, useEffect, useRef, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  src: string;
  alt: string;
  focalX: number;
  focalY: number;
};

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
};

/**
 * Mobile-first auto-playing hero slider.
 * - One image at a time on mobile, 4:3 card, head-safe focal points.
 * - Auto-advances every `intervalMs` (default 3.5s), pauses on user swipe.
 * - Supports touch swipe (left/right) and small thumbnail row + dots.
 */
export function MobileHeroSlider({ slides, intervalMs = 3500, className }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, intervalMs, count]);

  if (count === 0) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) {
      // RTL: swipe left → next
      go(index + (dx < 0 ? 1 : -1));
    }
    // resume auto-play shortly after
    window.setTimeout(() => setPaused(false), 800);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/15 bg-brand/40"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
          {slides.map((s, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                i === index ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={i !== index}
            >
              <SmartImage
                src={s.src}
                alt={s.alt}
                focalX={s.focalX}
                focalY={s.focalY}
                imageType="student_portrait"
                fill
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
          {/* subtle brand overlay for legibility if text overlaps */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand/60 to-transparent pointer-events-none" />

          {/* Dots */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`صورة ${i + 1}`}
                onClick={() => {
                  setPaused(true);
                  go(i);
                  window.setTimeout(() => setPaused(false), 4000);
                }}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-[var(--accent-red)]"
                    : "w-2 bg-white/70 hover:bg-white",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2x2 thumbnail grid under the main image — tapping selects that slide */}
      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPaused(true);
                go(i);
                window.setTimeout(() => setPaused(false), 4000);
              }}
              className={cn(
                "relative rounded-xl overflow-hidden ring-1 transition-all",
                i === index
                  ? "ring-[var(--accent-red)] ring-2 scale-[1.02]"
                  : "ring-white/20 opacity-80 hover:opacity-100",
              )}
              aria-label={`اختر صورة ${i + 1}`}
            >
              <SmartImage
                src={s.src}
                alt={s.alt}
                focalX={s.focalX}
                focalY={s.focalY}
                imageType="student_portrait"
                aspectRatio="1 / 1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
