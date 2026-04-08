import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Apakah Portofun cocok untuk pemula yang belum pernah investasi?",
    answer:
      "Sangat cocok! Materi kami dirancang mulai dari level dasar hingga advanced. Kami akan mengajarkan dari dasar-dasar investasi, cara membuka rekening sekuritas, hingga strategi investasi yang lebih kompleks. Semua dijelaskan dengan bahasa yang mudah dipahami.",
  },
  {
    question: "Apakah Portofun benar-benar gratis?",
    answer:
      "Ya, Portofun sepenuhnya gratis! Anda bisa mengakses semua materi pembelajaran, simulasi trading, dan fitur lainnya tanpa biaya apapun. Tidak ada biaya tersembunyi atau pembayaran di masa depan.",
  },
  {
    question: "Berapa modal minimal untuk mulai belajar dan investasi?",
    answer:
      "Untuk belajar di Portofun, tidak ada biaya sama sekali - semuanya gratis! Untuk investasi sungguhan di pasar modal Indonesia, Anda bisa mulai dengan modal Rp 100.000 untuk reksa dana, dan sekitar Rp 1 juta untuk saham. Kami juga menyediakan simulasi trading gratis untuk berlatih tanpa risiko.",
  },
  {
    question: "Bagaimana cara akses materinya? Apakah ada batas waktu?",
    answer:
      "Setelah mendaftar, Anda mendapat akses penuh ke semua materi pembelajaran. Bisa diakses kapan saja, di mana saja melalui website. Karena Portofun gratis, tidak ada batas waktu - Anda bisa belajar sesuai kecepatan Anda sendiri.",
  },
  {
    question: "Mengapa Portofun gratis? Apa model bisnisnya?",
    answer:
      "Portofun dibuat dengan misi untuk meningkatkan literasi keuangan di Indonesia. Kami percaya bahwa edukasi finansial berkualitas harus dapat diakses oleh semua orang tanpa hambatan biaya. Platform ini dikembangkan sebagai proyek edukasi untuk membantu masyarakat Indonesia memahami investasi dengan lebih baik.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto max-w-4xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Pertanyaan Umum
          </div>
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            Punya pertanyaan? Kami punya jawabannya. Jika tidak menemukan yang
            Anda cari, jangan ragu hubungi tim support kami.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
