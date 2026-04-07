import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconCheck, IconSparkles, IconCrown } from "@tabler/icons-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "Gratis",
    period: "Selamanya",
    description: "Untuk Anda yang ingin mulai belajar dasar investasi",
    features: [
      "Akses 20+ materi dasar",
      "Video pembelajaran berkualitas",
      "Quiz dan latihan interaktif",
      "Akses komunitas Telegram",
      "Artikel mingguan",
    ],
    cta: "Mulai Gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Rp 299.000",
    period: "per bulan",
    description: "Untuk investor serius yang ingin mendalami strategi trading",
    features: [
      "Semua fitur Basic",
      "Akses 200+ materi lengkap",
      "Live webinar mingguan",
      "Simulasi portfolio real-time",
      "Analisis saham premium",
      "Mentoring grup 1x/bulan",
      "Sertifikat resmi",
      "Template spreadsheet keuangan",
    ],
    cta: "Mulai Trial 14 Hari",
    highlighted: true,
    badge: "Paling Populer",
    icon: IconSparkles,
  },
  {
    name: "Lifetime",
    price: "Rp 2.499.000",
    period: "sekali bayar",
    description: "Investasi terbaik untuk pembelajaran seumur hidup",
    features: [
      "Semua fitur Pro",
      "Akses selamanya tanpa batas",
      "Mentoring 1-on-1 dengan expert",
      "Private group Discord eksklusif",
      "Early access materi baru",
      "Konsultasi portfolio personal",
      "Prioritas customer support",
      "Update gratis selamanya",
      "Akses exclusive workshop",
    ],
    cta: "Beli Sekarang",
    highlighted: false,
    badge: "Best Value",
    icon: IconCrown,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Harga
          </div>
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            Pilih Paket yang Sesuai dengan Kebutuhan Anda
          </h2>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Investasi terbaik adalah investasi pada diri sendiri. Mulai dari
            gratis atau upgrade untuk akses penuh ke semua fitur premium.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const BadgeIcon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlighted
                    ? "border-primary shadow-lg shadow-primary/20 lg:scale-105"
                    : "border-border/50"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                      {BadgeIcon && <BadgeIcon className="size-3.5" />}
                      {plan.badge}
                    </div>
                  </div>
                )}

                <CardHeader className="space-y-4 p-6 pb-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== "Selamanya" && (
                      <span className="text-muted-foreground">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6 p-6 pt-2">
                  <Button
                    size="lg"
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href="/learning-center/dashboard">{plan.cta}</Link>
                  </Button>

                  <div className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <IconCheck className="size-3 text-primary" />
                        </div>
                        <p className="text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Semua paket dilindungi dengan{" "}
            <span className="font-semibold text-foreground">
              garansi uang kembali 30 hari
            </span>
            . Tidak puas? Uang Anda kembali 100%.
          </p>
        </div>
      </div>
    </section>
  );
}
