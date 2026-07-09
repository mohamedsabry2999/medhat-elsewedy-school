import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { IMG, NAV_LINKS } from "@/lib/site-data";
import { useSiteSettings } from "@/lib/settings-store";
import { useBranches } from "@/lib/branches-store";

export function Footer() {
  const s = useSiteSettings();
  const branches = useBranches();

  return (
    <footer className="bg-brand text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={IMG.logo} alt="شعار مدرسة مدحت السويدي للتكنولوجيا التطبيقية" className="h-14 w-14 bg-white/95 rounded-lg p-1" />
            <div>
              <div className="font-extrabold text-lg">مدرسة مدحت السويدي للتكنولوجيا التطبيقية</div>
              <div className="text-white/70 text-xs">Medhat Elsewedy School for Applied Technology</div>
            </div>
          </div>
          <p className="mt-4 text-white/75 text-sm leading-7 max-w-md">{s.footerDescription}</p>
        </div>


        <div>
          <div className="font-bold mb-3">روابط سريعة</div>
          <ul className="space-y-2 text-sm text-white/80">
            {NAV_LINKS.slice(0, 6).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-bold mb-3">تواصل معنا</div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2" dir="ltr"><Phone className="h-4 w-4 mt-0.5" /> {s.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5" /> {s.email}</li>
            {branches.map((b) => (
              <li key={b.id} className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> <span className="min-w-0 break-words"><strong className="text-white">{b.name}:</strong> {b.address}</span></li>
            ))}
          </ul>
          <div className="flex gap-3 mt-4">
            {s.facebook && (
              <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Facebook className="h-4 w-4" /></a>
            )}
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Instagram className="h-4 w-4" /></a>
            )}
            {s.youtube && (
              <a href={s.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Youtube className="h-4 w-4" /></a>
            )}
            {s.whatsapp && (
              <a href={s.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><MessageCircle className="h-4 w-4" /></a>
            )}
          </div>

        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/60 flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} مدرسة مدحت السويدي للتكنولوجيا التطبيقية. جميع الحقوق محفوظة.</span>
          <span>وزارة التربية والتعليم — قطاع التعليم الفني</span>
        </div>
      </div>
    </footer>
  );
}
