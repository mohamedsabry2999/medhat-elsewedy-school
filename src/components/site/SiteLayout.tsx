import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { hl } from "./SchoolName";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="bg-gradient-to-b from-brand to-[color-mix(in_oklab,var(--brand)_85%,black)] text-white on-brand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {eyebrow && (
          <div className="text-[var(--accent-red)] font-bold text-sm mb-2 tracking-wider">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold">{hl(title)}</h1>
        {subtitle && <p className="mt-4 text-white/80 text-base md:text-lg max-w-2xl">{hl(subtitle)}</p>}
      </div>
    </section>
  );
}
