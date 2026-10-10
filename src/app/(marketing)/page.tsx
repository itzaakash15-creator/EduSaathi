import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Impact } from "@/components/landing/impact";
import { Testimonials } from "@/components/landing/testimonials";
import { Categories } from "@/components/landing/categories";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function MarketingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Impact />
        <Testimonials />
        <Categories />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
