"use client";

import { Button } from "@/components/ui/button";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { WaitlistDialog } from "../waitlist-dialog";

export function About() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <section id="about" className="overflow-hidden py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid items-center gap-0 overflow-hidden rounded-3xl lg:grid-cols-2">
          {/* Content side */}
          <div className="relative overflow-hidden bg-primary px-8 py-16 lg:px-12 lg:py-24">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-0">
              <div className="absolute right-0 top-0 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-balance text-4xl font-bold text-primary-foreground lg:text-5xl">
                  Kenapa Portofun?
                </h2>
                <div className="space-y-4 text-balance text-lg text-primary-foreground/90 lg:text-xl">
                  <p>
                    Banyak generasi muda sekarang sudah familiar dengan dunia investasi—terutama dari media sosial. Setiap hari, kita melihat rekomendasi saham, tren investasi, dan konten edukasi yang terlihat mudah diikuti.
                  </p>
                  <p>
                    Sekilas terlihat sederhana. Tapi di balik itu, sering kali pemahaman kita belum benar-benar terbentuk. Akhirnya, keputusan lebih sering karena tren—bukan karena benar-benar memahami apa yang dilakukan.
                  </p>
                  <p className="font-semibold">
                    Di sinilah Portofun hadir sebagai solusi edukasi yang terstruktur dan mudah dipahami.
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <div className="flex flex-col gap-3">
                {[
                  "Belajar konsep secara bertahap dengan metode terstruktur",
                  "Memahami hubungan antar konsep dalam investasi",
                  "Melatih cara berpikir sebelum mengambil keputusan",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                      <IconCheck className="size-3 text-primary-foreground" />
                    </div>
                    <p className="text-primary-foreground/90">{feature}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <WaitlistDialog>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    Daftar Sekarang
                  </Button>
                </WaitlistDialog>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="#pricing">
                    Lihat Harga
                    <IconArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="relative aspect-4/3 overflow-hidden bg-muted lg:aspect-auto lg:h-full lg:min-h-[600px]">
            <Image
              src={
                mounted && resolvedTheme === "dark"
                  ? "/assets/learning-page-dark.png"
                  : "/assets/learning-page.png"
              }
              alt="Portofun Dashboard - Platform pembelajaran investasi interaktif"
              fill
              className="object-cover object-left"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
