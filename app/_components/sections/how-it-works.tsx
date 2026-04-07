import { Card, CardContent } from "@/components/ui/card";
import {
  IconUserCheck,
  IconBook,
  IconChartBar,
  IconTrophy,
} from "@tabler/icons-react";

const steps = [
  {
    icon: IconUserCheck,
    step: "01",
    title: "Daftar Gratis",
    description:
      "Buat akun gratis dalam hitungan detik. Tidak perlu kartu kredit untuk memulai trial.",
  },
  {
    icon: IconBook,
    step: "02",
    title: "Pilih Kursus",
    description:
      "Pilih dari 200+ materi pembelajaran mulai dari dasar hingga advanced sesuai tujuan finansial Anda.",
  },
  {
    icon: IconChartBar,
    step: "03",
    title: "Praktik & Simulasi",
    description:
      "Terapkan ilmu dengan simulasi trading dan portfolio management tanpa risiko kehilangan uang.",
  },
  {
    icon: IconTrophy,
    step: "04",
    title: "Raih Kesuksesan",
    description:
      "Dapatkan sertifikat, bergabung dengan komunitas, dan wujudkan tujuan finansial Anda.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Cara Kerja
          </div>
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            Mulai Perjalanan Investasi Anda dalam 4 Langkah Mudah
          </h2>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Proses yang simpel dan terstruktur untuk membimbing Anda dari pemula
            hingga menjadi investor yang percaya diri.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative pt-6">
                <Card className="relative h-full border-border/50 overflow-visible">
                  <CardContent className="flex flex-col gap-4 p-6">
                    {/* Step number */}
                    <div className="absolute -top-5 left-6 flex size-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg">
                      {index + 1}
                    </div>
                    
                    <div className="mt-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
