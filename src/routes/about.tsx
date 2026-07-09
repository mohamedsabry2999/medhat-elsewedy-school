import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Flag, Target, Factory, GraduationCap, Handshake, BadgeCheck } from "lucide-react";
import { IMG, CERTIFICATES } from "@/lib/site-data";
import { pageSeo, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => {
    const seo = pageSeo({
      title: "عن مدرسة مدحت السويدي — نشأة، رؤية، وشراكة صناعية",
      description:
        "نشأة مدرسة مدحت السويدي للتكنولوجيا التطبيقية، رؤيتها ورسالتها، وشراكتها الصناعية مع دار مدحت السويدي للطباعة لتأهيل فنيين محترفين لسوق العمل.",
      path: "/about",
    });
    return {
      ...seo,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الرئيسية", path: "/" },
              { name: "عن المدرسة", path: "/about" },
            ]),
          ),
        },
      ],
    };
  },
  component: AboutPage,
});


function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="عن المدرسة"
        title="نشأة المدرسة ونبذة عنها"
        subtitle="أول مدرسة تكنولوجيا تطبيقية متخصصة في مجال الطباعة في مصر."
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-brand">نشأة المدرسة</h2>
            <p className="mt-4 text-muted-foreground leading-8">
              تم تأسيس مدرسة مدحت السويدي للتكنولوجيا التطبيقية على يد المهندس مدحت حافظ السويدي،
              رئيس مجلس إدارة دار مدحت السويدي للطباعة، عام 2022 - 2023، في ضوء رؤية مصر 2030 لتطوير
              منظومة التعليم الفني والتدريب المهني.
            </p>
            <p className="mt-4 text-muted-foreground leading-8">
              وجاء تأسيس المدرسة بهدف سد الفجوة بين العملية التعليمية النظرية والاحتياجات الفعلية لسوق العمل،
              من خلال إطلاق أول مدرسة تكنولوجيا تطبيقية متخصصة في مجال الطباعة بالتعاون مع
              وزارة التربية والتعليم والتعليم الفني.
            </p>
            <p className="mt-4 text-muted-foreground leading-8">
              تهدف المدرسة إلى إعداد جيل من الفنيين المؤهلين والقادرين على المنافسة في سوق العمل بمجال
              الطباعة محليًا وإقليميًا ودوليًا، من خلال تنمية مهارات الطلاب وإكسابهم الخبرة العملية اللازمة.
            </p>
          </div>
          <img src={IMG.hero1} alt="داخل المدرسة" className="rounded-2xl w-full aspect-video object-cover shadow-xl" />
        </div>
      </section>

      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-5">
          {[
            { icon: Eye, t: "الرؤية", d: "أن تكون المدرسة نموذجًا رائدًا في التعليم الفني المتخصص في مجال الطباعة، وأن تساهم في إعداد كوادر قادرة على دعم الصناعة والمنافسة محليًا وإقليميًا ودوليًا." },
            { icon: Flag, t: "الرسالة", d: "تأهيل الطلاب بالمهارات الفنية والسلوكية اللازمة للعمل في صناعة الطباعة، من خلال مناهج معتمدة وتدريب عملي داخل بيئة صناعية حقيقية." },
            { icon: Target, t: "أهداف المدرسة", d: "سد الفجوة بين التعليم واحتياجات سوق العمل، وإعداد فنيين مؤهلين، وربط الخريج مباشرة بفرص عمل حقيقية داخل قطاع الطباعة." },
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
            { icon: Handshake, t: "الشريك الصناعي", d: "دار مدحت السويدي للطباعة توفر بيئة تدريب صناعية حقيقية، ومكافآت، وتأمين صحي، ومسارات وظيفية للخريجين." },
            { icon: Factory, t: "التدريب الميداني", d: "تدريب داخل خطوط الإنتاج الفعلية تحت إشراف فنيين متخصصين وخبراء صناعة." },
            { icon: GraduationCap, t: "التعليم المرتبط بسوق العمل", d: "مناهج معتمدة دوليًا باعتماد الغرفة الألمانية AHK Cairo، مرتبطة باحتياجات صناعة الطباعة." },
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

      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-[var(--accent-red)] font-bold text-sm mb-2">الشهادات والاعتمادات</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand">شهادات معتمدة تفتح أبواب المستقبل</h2>
            <p className="mt-3 text-muted-foreground leading-8">
              تعتمد المدرسة على مناهج معتمدة دوليًا، مع إبراز اعتماد الغرفة الألمانية AHK Cairo ضمن عناصر الثقة والاعتماد المهني للمدرسة.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {CERTIFICATES.map((c) => (
              <Card key={c.title}>
                <CardContent className="p-5">
                  <BadgeCheck className="h-6 w-6 text-[var(--accent-red)] mb-3" />
                  <div className="font-bold text-brand text-sm leading-6">{c.title}</div>
                  <p className="mt-2 text-xs text-muted-foreground leading-6">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
