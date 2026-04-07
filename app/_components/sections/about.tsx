import { Button } from "@/components/ui/button";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

const benefits = [
  "Kurikulum dirancang oleh praktisi pasar modal bersertifikat",
  "Materi pembelajaran berbahasa Indonesia yang mudah dipahami",
  "Studi kasus nyata dari Bursa Efek Indonesia (BEI)",
  "Akses selamanya ke materi dan update terbaru",
  "Live webinar dengan fund manager dan analis profesional",
  "Mentoring langsung dari investor berpengalaman",
];

export function About() {
  return (
    <section id="about" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              {/* Placeholder for the open book image */}
              <div className="flex size-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <IconCheck className="size-24" />
                  <p className="text-sm">Image: /assets/open-book.png</p>
                </div>
              </div>
              {/* Uncomment when image is added */}
              {/* <Image
                src="/assets/open-book.png"
                alt="Open book representing learning"
                fill
                className="object-cover"
              /> */}
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 -z-10 size-48 rounded-2xl bg-primary/10 blur-3xl" />
          </div>

          {/* Content side */}
          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-foreground">
                Tentang Portofun
              </div>
              <h2 className="text-balance text-4xl font-bold lg:text-5xl">
                Investasi Cerdas Dimulai dari Edukasi yang Tepat
              </h2>
              <p className="text-balance text-lg text-muted-foreground">
                Portofun hadir untuk menjembatani kesenjangan literasi keuangan
                di Indonesia. Kami percaya bahwa setiap orang berhak mendapatkan
                akses ke edukasi finansial berkualitas untuk mencapai kebebasan
                finansial mereka.
              </p>
            </div>

            {/* Benefits list */}
            <div className="flex flex-col gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <IconCheck className="size-3 text-primary" />
                  </div>
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button size="lg" asChild>
                <Link href="/learning-center/dashboard">
                  Mulai Belajar Investasi
                  <IconArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
