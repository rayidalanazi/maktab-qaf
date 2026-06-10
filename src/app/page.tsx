import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Compare } from "@/components/landing/Compare";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSnap } from "@/components/landing/PricingSnap";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Compare />
        <Features />
        <HowItWorks />
        <PricingSnap />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
