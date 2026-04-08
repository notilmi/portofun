import { Button } from "@/components/ui/button";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { WaitlistDialog } from "../waitlist-dialog";

export function CTA() {
  return (
    <section className="px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-8 py-16 lg:px-16 lg:py-24">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-0">
            <div className="absolute right-0 top-0 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <IconSparkles className="size-4 text-primary-foreground" />
              <span className="font-medium text-primary-foreground">
                Promo Terbatas
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-balance text-4xl font-bold text-primary-foreground lg:text-5xl">
                Siap Wujudkan Kebebasan Finansial?
              </h2>
              <p className="mx-auto text-balance text-lg text-primary-foreground/90">
                Tanpa pemahaman yang cukup, keputusan yang diambil bisa beresiko
                dan tidak berkelanjutan
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <WaitlistDialog>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Daftar Waitlist Gratis
                  <IconArrowRight data-icon="inline-end" />
                </Button>
              </WaitlistDialog>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="#features">Lihat Fitur</Link>
              </Button>
            </div>

            <p className="text-sm text-primary-foreground/70">
              Tanpa kartu kredit • Bisa batal kapan saja • Garansi uang kembali
              30 hari
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
