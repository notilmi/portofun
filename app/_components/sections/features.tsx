import { Card, CardContent } from "@/components/ui/card";
import {
  IconChartLine,
  IconCertificate,
  IconSchool,
  IconPigMoney,
  IconTrendingUp,
  IconUsersGroup,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconSchool,
    title: "Materi Komprehensif",
    description:
      "Pelajari investasi saham, reksa dana, obligasi, dan instrumen keuangan lainnya dengan materi yang mudah dipahami.",
  },
  {
    icon: IconChartLine,
    title: "Analisis Fundamental & Teknikal",
    description:
      "Kuasai cara membaca laporan keuangan, analisis grafik, dan strategi investasi yang terbukti efektif.",
  },
  {
    icon: IconPigMoney,
    title: "Perencanaan Keuangan",
    description:
      "Belajar mengatur keuangan pribadi, budgeting, dan membangun dana darurat untuk masa depan yang lebih baik.",
  },
  {
    icon: IconTrendingUp,
    title: "Simulasi Portfolio",
    description:
      "Praktikkan strategi investasi dengan simulasi portfolio tanpa risiko kehilangan uang sungguhan.",
  },
  {
    icon: IconCertificate,
    title: "Sertifikat Resmi",
    description:
      "Dapatkan sertifikat yang diakui setelah menyelesaikan setiap kursus untuk menunjang karir Anda.",
  },
  {
    icon: IconUsersGroup,
    title: "Komunitas Investor",
    description:
      "Bergabung dengan ribuan investor Indonesia, sharing pengalaman, dan belajar bersama mencapai tujuan finansial.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Fitur Unggulan
          </div>
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            Semua yang Anda Butuhkan untuk Sukses Berinvestasi
          </h2>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Platform kami menyediakan tools dan sumber daya lengkap untuk
            membuat perjalanan belajar investasi Anda efektif dan menyenangkan.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border/50">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
