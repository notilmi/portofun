import { Button } from "@/components/ui/button";
import { IconArrowRight, IconBook, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 size-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <IconSparkles className="size-4 text-primary" />
            <span className="text-muted-foreground">
              Platform Edukasi Finansial #1 di Indonesia
            </span>
          </div>

          {/* Main heading */}
          <div className="flex flex-col gap-4">
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
              Kuasai Investasi &{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Literasi Keuangan
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground lg:text-xl">
              Belajar investasi saham, reksa dana, dan manajemen keuangan dari
              para ahli. Wujudkan kebebasan finansial dengan pembelajaran yang
              praktis dan mudah dipahami.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/learning-center/dashboard">
                <IconBook data-icon="inline-start" />
                Mulai Belajar Gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Pelajari Lebih Lanjut
                <IconArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-muted-foreground">
                Investor Aktif
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm text-muted-foreground">
                Materi Pembelajaran
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">
                Rating Pengguna
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
