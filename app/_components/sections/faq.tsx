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
    question: "Berapa modal minimal untuk mulai belajar dan investasi?",
    answer:
      "Untuk belajar, Anda bisa mulai dengan kelas gratis kami. Untuk investasi sungguhan, di Indonesia Anda bisa mulai dengan modal Rp 100.000 saja untuk reksa dana, dan sekitar Rp 1 juta untuk saham. Kami juga menyediakan simulasi trading gratis.",
  },
  {
    question: "Apakah ada jaminan keuntungan setelah mengikuti kursus?",
    answer:
      "Kami tidak bisa menjamin keuntungan karena investasi selalu memiliki risiko. Namun, kami memberikan pengetahuan dan strategi yang terbukti untuk membantu Anda membuat keputusan investasi yang lebih baik dan meminimalkan risiko kerugian.",
  },
  {
    question: "Bagaimana cara akses materinya? Apakah ada batas waktu?",
    answer:
      "Setelah membeli kursus, Anda mendapat akses selamanya ke semua materi. Bisa diakses kapan saja, di mana saja melalui website atau aplikasi mobile. Tidak ada batas waktu, jadi bisa belajar sesuai kecepatan Anda sendiri.",
  },
  {
    question: "Apakah sertifikatnya diakui dan bisa untuk melamar kerja?",
    answer:
      "Ya! Sertifikat Portofun diakui oleh berbagai perusahaan di Indonesia sebagai bukti kompetensi literasi keuangan. Anda bisa menambahkannya di CV, LinkedIn, atau portofolio profesional Anda.",
  },
  {
    question: "Apakah ada komunitas atau forum diskusi?",
    answer:
      "Tentu! Kami punya grup komunitas aktif di Telegram dan Discord tempat Anda bisa diskusi dengan sesama member, sharing pengalaman trading, dan bertanya langsung ke mentor. Ada juga webinar rutin setiap minggu.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), e-wallet (GoPay, OVO, Dana, ShopeePay), kartu kredit/debit, dan cicilan 0% melalui Kredivo. Semua transaksi dijamin aman dan terenkripsi.",
  },
  {
    question: "Apakah ada garansi uang kembali?",
    answer:
      "Ya! Kami menawarkan garansi 30 hari uang kembali 100%. Jika dalam 30 hari Anda merasa kursus tidak sesuai ekspektasi, kami akan mengembalikan uang Anda tanpa pertanyaan.",
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
