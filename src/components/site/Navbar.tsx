import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMG, NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={IMG.logo} alt="شعار المدرسة" className="h-11 w-11 shrink-0 object-contain" />
            <div className="hidden sm:block min-w-0">
              <div className="text-sm lg:text-base font-extrabold text-brand truncate">
                مدرسة مدحت السويدي
              </div>
              <div className="text-[11px] lg:text-xs text-muted-foreground truncate">
                للتكنولوجيا التطبيقية
              </div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center justify-center gap-1 min-w-0">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap",
                    active
                      ? "text-brand bg-secondary"
                      : "text-foreground/80 hover:text-brand hover:bg-secondary/70",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <Button asChild size="sm" className="hidden sm:inline-flex bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
              <Link to="/visit">سجل الآن</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="hidden md:inline-flex">
              <Link to="/admin">
                <LayoutDashboard className="ml-1 h-4 w-4" />
                لوحة التحكم
              </Link>
            </Button>
            <button
              className="xl:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="القائمة"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="xl:hidden pb-4">
            <nav className="grid gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-semibold",
                    pathname === l.to ? "bg-secondary text-brand" : "hover:bg-secondary",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-secondary"
              >
                لوحة التحكم
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
