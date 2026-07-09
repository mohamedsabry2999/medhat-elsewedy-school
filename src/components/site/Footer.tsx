import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { IMG, NAV_LINKS, CONTACT } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="bg-brand text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={IMG.logo} alt="شعار" className="h-14 w-14 bg-white/95 rounded-lg p-1" />
            <div>
              <div className="font-extrabold text-lg">مدرسة مدحت السويدي للتكنولوجيا التطبيقية</div>
              <div className="text-white/70 text-xs">Medhat Elsewedy School for Applied Technology</div>
            </div>
          </div>
          <p className="mt-4 text-white/75 text-sm leading-7 max-w-md">
            تعليم فني متطور يربط الدراسة بسوق العمل. نعد جيلاً جديداً من الفنيين المؤهلين في مجالات
            الطباعة الرقمية والأوفست عبر تدريب عملي حقيقي داخل بيئة صناعية.
          </p>
        </div>

        <div>
          <div className="font-bold mb-3">روابط سريعة</div>
          <ul className="space-y-2 text-sm text-white/80">
            {NAV_LINKS.slice(0, 6).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-bold mb-3">تواصل معنا</div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5" /> {CONTACT.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5" /> {CONTACT.email}</li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5" /> {CONTACT.address}</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"><Youtube className="h-4 w-4" /></a>
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
