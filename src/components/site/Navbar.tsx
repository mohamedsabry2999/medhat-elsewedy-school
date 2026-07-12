import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMG, NAV_LINKS } from "@/lib/site-data";
import { useContent } from "@/lib/content-store";
import { cn } from "@/lib/utils";

function TopBar() {
  return (
    <div className="hidden lg:block bg-brand text-white/95 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <a href="tel:01050360883" className="flex items-center gap-1.5 hover:text-[var(--accent-red)] transition-colors">
            <Phone className="h-3.5 w-3.5" />
            <span dir="ltr">01050360883</span>
          </a>
          <a href="mailto:school@elsewedyprint.com" className="flex items-center gap-1.5 hover:text-[var(--accent-red)] transition-colors">
            <Mail className="h-3.5 w-3.5" />
            <span>school@elsewedyprint.com</span>
          </a>
        </div>
        <div className="hidden xl:flex items-center gap-4 text-white/80">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> فرع الحي الخامس عشر
          </span>
          <span className="text-white/30">•</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> فرع المنطقة الصناعية
          </span>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const brandLine1 = useContent("navbar.brand.line1", "مدرسة مدحت السويدي", { page: "navbar", section: "brand", label: "اسم المدرسة — سطر أول", type: "text" });
  const brandLine2 = useContent("navbar.brand.line2", "للتكنولوجيا التطبيقية", { page: "navbar", section: "brand", label: "اسم المدرسة — سطر ثاني", type: "text" });
  const ctaShort = useContent("navbar.cta.short", "سجل الآن", { page: "navbar", section: "cta", label: "زر التسجيل (شريط علوي)", type: "button" });
  const ctaLong = useContent("navbar.cta.long", "سجل الآن لحضور الندوة التعريفية", { page: "navbar", section: "cta", label: "زر التسجيل (قائمة موبايل)", type: "button" });

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <TopBar />
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 xl:gap-6 h-[96px] md:h-[116px] lg:h-[132px]">
          {/* Brand Area (right in RTL): Logo protected, text shrinks */}
          <Link
            to="/"
            className="flex items-center gap-3 sm:gap-4 min-w-0 shrink"
          >
            <img
              src={IMG.logo}
              alt="شعار مدرسة مدحت السويدي للتكنولوجيا التطبيقية"
              className="shrink-0 h-[64px] w-auto sm:h-[76px] md:h-[92px] lg:h-[108px] object-contain"
            />
            <div className="hidden sm:flex 2xl:flex flex-col min-w-0 leading-tight">
              <span className="text-sm md:text-base lg:text-lg xl:text-xl font-extrabold text-brand truncate">
                {brandLine1}
              </span>
              <span className="text-[11px] md:text-xs lg:text-[13px] text-muted-foreground truncate">
                {brandLine2}
              </span>
            </div>
          </Link>

          {/* Desktop nav — from xl with tight spacing, from 2xl looser */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 shrink min-w-0">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "relative px-2 2xl:px-3 py-2 rounded-md text-[12px] 2xl:text-[13px] font-semibold transition-colors whitespace-nowrap",
                    active
                      ? "text-[var(--accent-red)]"
                      : "text-foreground/75 hover:text-brand",
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-2 2xl:inset-x-3 -bottom-0.5 h-0.5 bg-[var(--accent-red)] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Area (left): Register + burger — never shrinks */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white font-bold px-4 md:px-5 h-10"
            >
              <Link to="/visit">{ctaShort}</Link>
            </Button>
            <button
              className="xl:hidden inline-flex items-center justify-center h-11 w-11 rounded-md hover:bg-secondary text-brand border border-border/60"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <>
          <div
            className="xl:hidden fixed inset-0 top-[96px] md:top-[116px] lg:top-[calc(132px+2.25rem)] bg-black/40 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="xl:hidden fixed inset-x-0 top-[96px] md:top-[116px] lg:top-[calc(132px+2.25rem)] z-50 bg-white border-t border-border shadow-xl max-h-[calc(100vh-96px)] overflow-y-auto">

            <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-4 grid gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-bold transition-colors",
                    pathname === l.to
                      ? "bg-secondary text-[var(--accent-red)]"
                      : "text-foreground hover:bg-secondary hover:text-brand",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Button
                asChild
                size="lg"
                className="mt-3 bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white font-bold w-full"
              >
                <Link to="/visit">{ctaLong}</Link>
              </Button>
              <div className="mt-4 grid gap-2 pt-4 border-t border-border text-xs text-muted-foreground">
                <a href="tel:01050360883" className="flex items-center gap-2 hover:text-brand">
                  <Phone className="h-4 w-4 text-[var(--accent-red)]" />
                  <span dir="ltr">01050360883</span>
                </a>
                <a href="mailto:school@elsewedyprint.com" className="flex items-center gap-2 hover:text-brand">
                  <Mail className="h-4 w-4 text-[var(--accent-red)]" />
                  <span>school@elsewedyprint.com</span>
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
