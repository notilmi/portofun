import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { IconStar } from "@tabler/icons-react";

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Karyawan Swasta, Jakarta",
    content:
      "Dari yang gak ngerti apa-apa soal saham, sekarang portfolio saya udah untung 40% dalam setahun! Materinya mudah dipahami dan instrukturnya sabar banget.",
    rating: 5,
    initials: "BS",
  },
  {
    name: "Siti Nurhaliza",
    role: "Ibu Rumah Tangga, Surabaya",
    content:
      "Sebagai IRT, saya bisa belajar sambil ngurus anak. Sekarang saya bisa bantu suami kelola keuangan keluarga dengan lebih baik. Terima kasih Portofun!",
    rating: 5,
    initials: "SN",
  },
  {
    name: "Andi Wijaya",
    role: "Fresh Graduate, Bandung",
    content:
      "Baru lulus kuliah langsung ikut kelas Portofun. Sekarang saya udah mulai investasi reksa dana dan nabung buat masa depan. Investasi terbaik!",
    rating: 5,
    initials: "AW",
  },
  {
    name: "Dewi Lestari",
    role: "Pengusaha UMKM, Yogyakarta",
    content:
      "Kursus perencanaan keuangan dari Portofun membantu saya pisahkan uang usaha dan pribadi. Bisnis makin berkembang, keuangan lebih teratur!",
    rating: 5,
    initials: "DL",
  },
  {
    name: "Rudi Hartono",
    role: "Profesional IT, Tangerang",
    content:
      "Dulu investasi cuma ikut-ikutan temen, sering rugi. Setelah belajar analisis teknikal di Portofun, profit konsisten tiap bulan. Mantap!",
    rating: 5,
    initials: "RH",
  },
  {
    name: "Maya Kusuma",
    role: "Mahasiswa, Semarang",
    content:
      "Masih kuliah tapi udah bisa nabung dan investasi berkat Portofun. Materinya cocok banget buat pemula seperti saya. Highly recommended!",
    rating: 5,
    initials: "MK",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-muted/30 px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Testimoni
          </div>
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            Dipercaya oleh Ribuan Investor Indonesia
          </h2>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Bergabunglah dengan ribuan alumni Portofun yang telah berhasil
            mencapai tujuan finansial mereka melalui investasi cerdas.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/50">
              <CardContent className="flex flex-col gap-4 p-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <IconStar
                      key={i}
                      className="size-4 fill-primary text-primary"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground">{testimonial.content}</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
