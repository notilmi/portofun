"use client";

import { Button } from "@/components/ui/button";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { IconArrowRight, IconBook } from "@tabler/icons-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { WaitlistDialog } from "../waitlist-dialog";

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Main heading */}
          <div className="flex flex-col gap-4">
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
              Designed To Educate,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Built To Invest
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground lg:text-xl">
              Belajar portofolio investasi dengan cara yang lebih fun,
              interaktif & mudah dipahami
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <WaitlistDialog>
              <Button size="lg">
                <IconBook data-icon="inline-start" />
                Daftar Waitlist
              </Button>
            </WaitlistDialog>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Pelajari Lebih Lanjut
                <IconArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          {/*<div className="mt-8 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
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
          </div>*/}
        </div>
        <div className="hidden md:flex justify-center">
          <MacbookScroll
            src={
              mounted && resolvedTheme === "dark"
                ? "/assets/dashboard-dark.png"
                : "/assets/dashboard.png"
            }
            showGradient={true}
          />
        </div>
      </div>
    </section>
  );
}
