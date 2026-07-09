import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Flag, Target, Factory, GraduationCap, Handshake } from "lucide-react";
import { IMG } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن المدرسة — مدرسة مدحت السويدي للتكنولوجيا التطبيقية" },
      { name: "description", content: "نبذة عن المدرسة، الرؤية، الرسالة، والأهداف." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="عن المدرسة" title="مدرسة تصنع فنيين محترفين" subtitle="نبني جيلاً من الفنيين المؤهلين عبر تعليم فني تطبيقي حديث مرتبط بسوق العمل." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-brand">نبذة عن المدرسة</h2>
            <p className="mt-4 text-muted-foreground leading-8">
              مدرسة مدحت السويدي للتكنولوجيا التطبيقية هي مدرسة فنية تطبيقية متخصصة في تكنولوجيا الطباعة الرقمية والأوفست،
              تعمل تحت مظلة وزارة التربية والتعليم — قطاع التعليم الفني، بالشراكة مع القطاع الصناعي.
              تهدف المدرسة إلى إعداد جيل من الفنيين المؤهلين للعمل مباشرة بعد التخرج، عبر مناهج
              حديثة وتدريب عملي داخل بيئة صناعية حقيقية.
            </p>
            <p className="mt-4 text-muted-foreground leading-8">
              تعتمد المدرسة على منظومة تعليم مطبق حيث يقضي الطالب جزءاً كبيراً من وقته داخل المعامل والورش
              وخطوط الإنتاج الفعلية، مما يضمن اكتساب مهارات تخصصية عالية الجودة.
            </p>
          </div>
          <img src={IMG.hero1} alt="داخل المدرسة" className="rounded-2xl w-full aspect-video object-cover shadow-xl" />
        </div>
      </section>

      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-5">
          {[
            { icon: Eye, t: "الرؤية", d: "أن نكون نموذجاً رائداً للتعليم الفني التطبيقي المرتبط بالصناعة على مستوى الجمهورية." },
            { icon: Flag, t: "الرسالة", d: "إعداد فنيين مؤهلين مهنياً وأخلاقياً لسوق العمل، عبر شراكة حقيقية بين التعليم والصناعة." },
            { icon: Target, t: "الأهداف", d: "توفير تعليم عملي حديث، وربط الخريج مباشرة بفرص العمل، وبناء شخصية منضبطة قادرة على التطوير." },
          ].map((c) => (
            <Card key={c.t}>
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-brand text-white grid place-items-center mb-4"><c.icon className="h-6 w-6" /></div>
                <h3 className="font-extrabold text-brand text-lg">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-7">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-5">
          {[
            { icon: Handshake, t: "شراكة التعليم والصناعة", d: "بروتوكولات تعاون فعلية مع مصانع ومطابع كبرى تشارك في تطوير المناهج والتدريب." },
            { icon: Factory, t: "دور التدريب الميداني", d: "تدريب حقيقي داخل خطوط الإنتاج تحت إشراف فنيين متخصصين وخبراء صناعة." },
            { icon: GraduationCap, t: "ما يميزنا", d: "مناهج مبنية على احتياج السوق، معامل حديثة، ومتابعة أكاديمية دقيقة لكل طالب." },
          ].map((c) => (
            <Card key={c.t} className="border-border">
              <CardContent className="p-8">
                <c.icon className="h-8 w-8 text-[var(--accent-red)] mb-3" />
                <h3 className="font-bold text-brand">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-7">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
