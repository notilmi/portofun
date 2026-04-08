import {
  Navbar,
  Hero,
  Features,
  About,
  // HowItWorks,
  // Testimonials,
  // FAQ,
  CTA,
  Footer,
} from "./_components/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-background">
        <Hero />
        <Features />
        <About />
        {/*<HowItWorks />*/}
        {/*<Testimonials />*/}
        {/*<FAQ />*/}
        <CTA />
        <Footer />
      </main>
    </>
  );
}
