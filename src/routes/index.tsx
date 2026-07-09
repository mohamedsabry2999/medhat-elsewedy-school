import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Award, Factory, Users, Wrench, ShieldCheck, GraduationCap,
  Printer, Palette, TrendingUp, ArrowLeft, Calendar, CheckCircle2, ClipboardList, UserCheck, Megaphone,
  BadgeCheck, Globe2, Bus, HeartPulse, Shirt, Gift, Briefcase, Rocket, Lightbulb, Sparkles,
} from "lucide-react";
import { IMG, PROGRAMS, NEWS, FAQS, ACCREDITATIONS, CERTIFICATES, BENEFITS } from "@/lib/site-data";
import ahkLogo from "@/assets/ahk-cairo.png.asset.json";
import moeLogo from "@/assets/moe-egypt.png.asset.json";
import elsewedyLogo from "@/assets/elsewedy-printhouse.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — مدرسة مدحت السويدي للتكنولوجيا التطبيقية" },
      { name: "description", content: "أول مدرسة تكنولوجيا تطبيقية متخصصة في مجال الطباعة في مصر. مناهج معتمدة دوليًا باعتماد الغرفة الألمانية AHK Cairo وتدريب داخل بيئة صناعية حقيقية." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <TrustBadges />
      <QuickStats />
      <AccreditationSection />
      <WhySection />
      <StudySystem />
      <ProgramsSection />
      <BenefitsSection />
      <GraduatesFuture />
      <CertificatesSection />
      <AdmissionSteps />
      <SeminarCTA />
      <NewsSection />
      <GalleryTeaser />
      <FaqSection />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${IMG.hero1})` }} />
      <div className="absolute inset-0 bg-gradient-to-l from-brand/95 via-brand/85 to-brand/70" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
        <div className="min-w-0">
          <Badge className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)] text-white border-0 mb-4">
            وزارة التربية والتعليم والتعليم الفني — رؤية مصر 2030
          </Badge>
          <h1 className="font-extrabold leading-tight text-[clamp(1.6rem,6.5vw,3rem)]">
            مدرسة مدحت السويدي <br />
            <span className="text-[var(--accent-red)]">للتكنولوجيا التطبيقية</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl leading-8">
            أول مدرسة تكنولوجيا تطبيقية متخصصة في مجال الطباعة في مصر، تأسست في ضوء رؤية مصر 2030 لتطوير التعليم الفني وربط الدراسة باحتياجات سوق العمل.
          </p>
          <p className="mt-3 text-white/75 max-w-xl leading-8 text-sm">
            نموذج تعليمي يجمع بين الدراسة النظرية والتدريب العملي داخل بيئة صناعية حقيقية، لإعداد جيل من الفنيين المؤهلين والقادرين على المنافسة في سوق الطباعة المحلي والإقليمي والدولي.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white w-full sm:w-auto">
              <Link to="/visit">سجل لحضور الندوة التعريفية</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white text-brand hover:bg-white/90 w-full sm:w-auto">
              <Link to="/study-system">تعرف على نظام الدراسة</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand w-full sm:w-auto">
              <Link to="/admissions">شروط الالتحاق</Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-4">
          <img src={IMG.hero1} alt="تدريب" className="rounded-2xl object-cover h-64 w-full shadow-2xl" />
          <img src={IMG.hero2} alt="ورشة" className="rounded-2xl object-cover h-64 w-full shadow-2xl mt-8" />
          <img src={IMG.students[0]} alt="طالب" className="rounded-2xl object-cover h-64 w-full shadow-2xl" />
          <img src={IMG.students[3]} alt="طالبة" className="rounded-2xl object-cover h-64 w-full shadow-2xl mt-8" />
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Award, t: "أول مدرسة متخصصة", s: "في تكنولوجيا الطباعة بمصر" },
    { icon: BadgeCheck, t: "اعتماد ألماني", s: "الغرفة الألمانية AHK Cairo" },
    { icon: Factory, t: "تدريب صناعي", s: "داخل دار مدحت السويدي للطباعة" },
    { icon: Globe2, t: "مناهج دولية", s: "معتمدة على مستوى متقدم" },
    { icon: ShieldCheck, t: "مدرسة حكومية", s: "تابعة لوزارة التعليم الفني" },
  ];
  return (
    <section className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {badges.map((b) => (
          <div key={b.t} className="group relative flex items-center gap-4 rounded-2xl border border-brand/10 bg-gradient-to-br from-white to-secondary/40 p-4 shadow-sm hover:shadow-lg hover:border-[var(--accent-red)]/40 transition-all">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-[var(--accent-red)]/10 blur-md group-hover:bg-[var(--accent-red)]/20 transition-colors" />
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-[color-mix(in_oklab,var(--brand)_70%,black)] text-white grid place-items-center shadow-md">
                <b.icon className="h-6 w-6" strokeWidth={2} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-brand leading-tight">{b.t}</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-5">{b.s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickStats() {
  const stats = [
    { icon: Calendar, label: "مدة الدراسة", value: "3 سنوات بنظام الساعات المعتمدة" },
    { icon: GraduationCap, label: "نظام الدراسة", value: "نظري وعملي وميداني" },
    { icon: Factory, label: "الشريك الصناعي", value: "دار مدحت السويدي للطباعة" },
    { icon: Award, label: "الاعتماد", value: "الغرفة الألمانية AHK Cairo" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-secondary text-brand grid place-items-center">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="font-bold text-brand text-sm leading-6">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      {eyebrow && <div className="text-[var(--accent-red)] font-bold text-sm mb-2">{eyebrow}</div>}
      <h2 className="text-2xl md:text-4xl font-extrabold text-brand">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground leading-8">{subtitle}</p>}
    </div>
  );
}

function AccreditationSection() {
  const icons = [BadgeCheck, Globe2, Factory, Award, ShieldCheck];
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-white to-white pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="الاعتماد والثقة"
          title="مناهج معتمدة دوليًا باعتماد الغرفة الألمانية AHK Cairo"
          subtitle="مناهج معتمدة دوليًا بالتعاون مع وزارة التربية والتعليم والتعليم الفني، وباعتماد الغرفة الألمانية AHK Cairo، بما يدعم تأهيل الطلاب لسوق العمل المحلي والإقليمي والدولي."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {ACCREDITATIONS.map((a, i) => {
            const Ico = icons[i] ?? BadgeCheck;
            return (
              <div key={a.title} className="group relative bg-white rounded-2xl border border-brand/10 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--accent-red)] to-brand" />
                <div className="relative h-14 w-14 mb-4 rounded-2xl bg-gradient-to-br from-brand/5 to-[var(--accent-red)]/10 grid place-items-center ring-1 ring-brand/10">
                  <Ico className="h-7 w-7 text-brand" strokeWidth={1.75} />
                </div>
                <div className="font-extrabold text-brand text-sm leading-6">{a.title}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-6">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const items = [
    { icon: Factory, title: "تدريب داخل بيئة صناعية حقيقية", desc: "معامل حديثة وتدريب داخل مصانع الشريك الصناعي دار مدحت السويدي للطباعة." },
    { icon: TrendingUp, title: "ربط الدراسة بسوق العمل", desc: "مناهج مبنية على احتياجات صناعة الطباعة الحقيقية." },
    { icon: Wrench, title: "تأهيل مهني حقيقي", desc: "خريج قادر على العمل الفوري بعد التخرج." },
    { icon: Users, title: "دعم ومتابعة للطلاب", desc: "توجيه وإرشاد مهني وتنمية مهارات شخصية." },
    { icon: Award, title: "اعتماد مهني ودولي", desc: "اعتماد الغرفة الألمانية AHK Cairo ومناهج معتمدة دوليًا." },
    { icon: ShieldCheck, title: "مدرسة حكومية موثوقة", desc: "تابعة لوزارة التربية والتعليم والتعليم الفني بالمصروفات الحكومية." },
  ];
  return (
    <section className="py-20 bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="لماذا نحن؟" title="لماذا مدرسة مدحت السويدي؟" subtitle="ركائز تجعل من الخريج فنياً محترفاً جاهزاً لسوق العمل." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.title} className="border-border/60 hover:border-[var(--accent-red)] transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-brand text-white grid place-items-center mb-4">
                  <it.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-brand">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-7">{it.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudySystem() {
  const parts = [
    { icon: GraduationCap, t: "دراسة نظرية", d: "المواد الثقافية والمواد الفنية المتخصصة." },
    { icon: Wrench, t: "تدريب عملي", d: "داخل معامل وورش المدرسة." },
    { icon: Factory, t: "تدريب ميداني", d: "داخل مصانع دار مدحت السويدي للطباعة." },
    { icon: ClipboardList, t: "تقييمات شهرية", d: "تقييمات إلكترونية نظرية وعملية." },
    { icon: Briefcase, t: "تأهيل لسوق العمل", d: "مهارات شخصية وريادة أعمال." },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="نظام الدراسة" title="ثلاث سنوات بنظام الساعات المعتمدة" subtitle="مناهج معتمدة دوليًا وعلى مستوى متقدم في تخصصات الطباعة المختلفة." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {parts.map((p) => (
            <Card key={p.t} className="text-center">
              <CardContent className="p-6">
                <p.icon className="h-8 w-8 mx-auto text-[var(--accent-red)]" />
                <div className="mt-3 font-bold text-brand">{p.t}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-6">{p.d}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline"><Link to="/study-system">تفاصيل نظام الدراسة <ArrowLeft className="mr-2 h-4 w-4" /></Link></Button>
        </div>
      </div>
    </section>
  );
}

function ProgramsSection() {
  const icons: Record<string, typeof Printer> = {
    "digital-printing": Printer,
    "offset-printing": Factory,
    "quality-prepress": ShieldCheck,
    "maintenance": Wrench,
    "design-marketing": Palette,
  };
  return (
    <section className="py-20 bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="التخصصات" title="خمسة تخصصات في صناعة الطباعة" subtitle="تخصصات مصممة وفق احتياجات سوق العمل الفعلية." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => {
            const Icon = icons[p.slug] ?? Printer;
            return (
              <Card key={p.slug} className="relative overflow-hidden group">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-white text-brand grid place-items-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-brand">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-7">{p.short}</p>
                  <Link to="/programs" className="mt-4 inline-flex items-center text-sm font-bold text-[var(--accent-red)]">
                    التفاصيل <ArrowLeft className="mr-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const icons = [Gift, Shirt, Shirt, Bus, HeartPulse, Factory, Briefcase];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="الشريك الصناعي" title="مميزات يقدمها الشريك الصناعي للطلاب" subtitle="دار مدحت السويدي للطباعة توفر للطلاب حزمة متكاملة من الدعم والخدمات." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Ico = icons[i] ?? Gift;
            return (
              <Card key={b.title} className="border-brand/10">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-[var(--accent-red)]/10 text-[var(--accent-red)] grid place-items-center mb-3">
                    <Ico className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-brand">{b.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-7">{b.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GraduatesFuture() {
  const items = [
    {
      icon: Briefcase,
      title: "فرص العمل المباشرة",
      desc: "العمل داخل المؤسسات والمطابع والشركات المتخصصة في الطباعة والتغليف والصناعات المرتبطة بها.",
    },
    {
      icon: GraduationCap,
      title: "استكمال الدراسة",
      desc: "متابعة الدراسة في الكليات التكنولوجية وكليات التعليم الصناعي والمسارات الأكاديمية المرتبطة بالتخصص.",
    },
    {
      icon: Rocket,
      title: "ريادة الأعمال",
      desc: "تأهيل الطلاب لإطلاق مشروعاتهم الخاصة أو العمل الحر في المجالات الفنية والتقنية المرتبطة بالطباعة.",
    },
    {
      icon: Lightbulb,
      title: "الخبرة المهنية",
      desc: "الخريج يكتسب خبرة عملية حقيقية من خلال التدريب العملي والميداني داخل بيئة صناعية متخصصة.",
    },
  ];
  return (
    <section className="relative py-24 overflow-hidden bg-brand text-white">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[var(--accent-red)]/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[var(--accent-red)] font-bold text-sm mb-3">
            <Sparkles className="h-4 w-4" /> مستقبل الخريجين
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            فرص ومستقبل خريجي <span className="text-[var(--accent-red)]">مدرسة مدحت السويدي</span>
          </h2>
          <p className="mt-4 text-white/80 leading-8">
            بعد تخرج الطلاب من مدرسة مدحت السويدي للتكنولوجيا التطبيقية، تتوفر أمامهم عدة مسارات مهنية وأكاديمية تؤهلهم لبناء مستقبل قوي في مجالات الطباعة والصناعات المرتبطة بها.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={it.title} className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-3xl p-7 pt-14 overflow-hidden hover:bg-white/[0.07] hover:border-[var(--accent-red)]/40 transition-all">
              <div
                className="absolute -top-6 -left-2 text-[9rem] font-black leading-none select-none pointer-events-none bg-gradient-to-b from-white/10 to-transparent bg-clip-text text-transparent"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--accent-red)] to-[color-mix(in_oklab,var(--accent-red)_60%,black)] grid place-items-center shadow-lg shadow-[var(--accent-red)]/30 mb-5">
                <it.icon className="h-8 w-8 text-white" strokeWidth={1.75} />
              </div>
              <h3 className="relative text-lg font-extrabold mb-2">{it.title}</h3>
              <p className="relative text-sm text-white/75 leading-7">{it.desc}</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent-red)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificatesSection() {
  const items = [
    {
      icon: GraduationCap,
      title: "دبلوم المدارس الثانوية الفنية للتكنولوجيا التطبيقية",
      desc: "دبلوم معتمد من مدارس التكنولوجيا التطبيقية يؤهل الطالب لاستكمال مساره الأكاديمي والمهني.",
      tag: "دبلوم رسمي",
      logo: IMG.logo,
    },
    {
      icon: Globe2,
      title: "اعتماد الغرفة الألمانية AHK Cairo",
      desc: "اعتماد مهني دولي يعزز فرص الخريجين في سوق العمل المحلي والإقليمي والدولي.",
      tag: "اعتماد دولي",
      logo: null,
    },
    {
      icon: Factory,
      title: "شهادة خبرة من دار مدحت السويدي للطباعة",
      desc: "إثبات خبرة عملية حقيقية من خلال التدريب داخل الشريك الصناعي دار مدحت السويدي.",
      tag: "خبرة صناعية",
      logo: IMG.logo,
    },
    {
      icon: BadgeCheck,
      title: "مناهج معتمدة دوليًا",
      desc: "مناهج حديثة ومتطورة تواكب احتياجات الصناعة والتقنيات الحديثة على مستوى متقدم.",
      tag: "مناهج دولية",
      logo: null,
    },
  ];
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-white relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-[var(--accent-red)] font-bold text-sm mb-3">
            <BadgeCheck className="h-4 w-4" /> الشهادات والاعتمادات
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand leading-tight">
            الشهادات والاعتمادات التي يحصل عليها الطلاب
          </h2>
          <p className="mt-4 text-muted-foreground leading-8">
            حزمة متكاملة من الشهادات الرسمية والاعتمادات المهنية الدولية تفتح للخريج مسارات وظيفية وأكاديمية متعددة.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((c) => (
            <article key={c.title} className="group relative bg-white rounded-3xl border border-brand/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand via-[var(--accent-red)] to-brand" />
              <div className="p-7 grid grid-cols-[auto_minmax(0,1fr)] gap-5 items-start">
                <div className="shrink-0 h-24 w-24 rounded-2xl bg-gradient-to-br from-secondary/60 to-white border border-brand/10 grid place-items-center p-3 shadow-inner">
                  {c.logo ? (
                    <img src={c.logo} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <c.icon className="h-10 w-10 text-brand" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-[11px] font-bold px-2.5 py-1 mb-2">
                    <c.icon className="h-3 w-3" /> {c.tag}
                  </div>
                  <h3 className="font-extrabold text-brand text-base md:text-lg leading-7">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-7">{c.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}



function AdmissionSteps() {
  const steps = [
    { icon: Megaphone, t: "متابعة إعلان فتح باب التقديم" },
    { icon: ClipboardList, t: "تسجيل البيانات" },
    { icon: Users, t: "حضور الندوة التعريفية" },
    { icon: UserCheck, t: "اجتياز الاختبارات والمقابلات" },
    { icon: CheckCircle2, t: "إعلان المقبولين" },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-[var(--accent-red)] font-bold text-sm mb-2">التقديم والقبول</div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-brand">خطوات التقديم</h2>
          <p className="mt-3 text-muted-foreground">خمس خطوات واضحة من التسجيل حتى القبول.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s.t} className="relative bg-secondary/70 border rounded-xl p-5 text-center">
              <div className="absolute -top-3 right-3 h-8 w-8 rounded-full bg-[var(--accent-red)] grid place-items-center text-sm font-extrabold text-white">
                {i + 1}
              </div>
              <s.icon className="h-8 w-8 mx-auto text-brand" />
              <div className="mt-3 font-bold text-sm text-brand">{s.t}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild size="lg" className="bg-[var(--accent-red)] hover:bg-[var(--accent-red)]/90 text-white">
            <Link to="/admissions">شروط التقديم الكاملة</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SeminarCTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-l from-brand to-[color-mix(in_oklab,var(--brand)_75%,black)] text-white p-8 md:p-12 grid md:grid-cols-[1fr_auto] items-center gap-6">
          <div>
            <div className="text-[var(--accent-red)] font-bold text-sm mb-2">الندوات التعريفية</div>
            <h2 className="text-2xl md:text-3xl font-extrabold">سجل الآن لحضور الندوة التعريفية</h2>
            <p className="mt-3 text-white/85 max-w-xl">الحد الأدنى الحالي لحضور الندوات التعريفية: 190 درجة. أيام الزيارة: السبت، الإثنين، الأربعاء.</p>
          </div>
          <Button asChild size="lg" className="bg-white text-brand hover:bg-white/90"><Link to="/visit">تسجيل الحضور</Link></Button>
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section className="py-20 bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="آخر الأخبار" title="أخبار المدرسة" />
        <div className="grid gap-5 md:grid-cols-3">
          {NEWS.slice(0, 3).map((n) => (
            <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group">
              <Card className="overflow-hidden h-full pt-0">
                <div className="h-44 overflow-hidden">
                  <img src={n.image} alt={n.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="text-[11px]">{n.category}</Badge>
                  <h3 className="mt-3 font-bold text-brand line-clamp-2">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>
                  <div className="mt-4 text-xs text-muted-foreground">{n.date}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline"><Link to="/news">جميع الأخبار</Link></Button>
        </div>
      </div>
    </section>
  );
}

function GalleryTeaser() {
  const imgs = [IMG.hero1, IMG.students[0], IMG.students[3], IMG.hero2, IMG.students[4], IMG.students[6]];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="معرض الصور" title="لحظات من داخل المدرسة" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imgs.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl">
              <img src={src} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline"><Link to="/gallery">المعرض الكامل</Link></Button>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-20 bg-secondary/60">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="الأسئلة الشائعة" title="إجابات على أهم أسئلتكم" />
        <Accordion type="single" collapsible className="bg-white rounded-2xl px-4 shadow-sm">
          {FAQS.slice(0, 6).map((f, i) => (
            <AccordionItem key={i} value={`i-${i}`}>
              <AccordionTrigger className="text-start font-bold text-brand">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-7">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-6">
          <Button asChild variant="outline"><Link to="/faq">جميع الأسئلة</Link></Button>
        </div>
      </div>
    </section>
  );
}
