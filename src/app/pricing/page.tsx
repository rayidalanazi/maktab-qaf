import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { PricingHero } from "@/components/pricing/Hero";
import { TrustStrip } from "@/components/pricing/TrustStrip";
import { BundleGrid } from "@/components/pricing/BundleGrid";
import { Calculator } from "@/components/pricing/Calculator";
import { ROI } from "@/components/pricing/ROI";
import { Objections } from "@/components/pricing/Objections";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { FinalCTA } from "@/components/pricing/FinalCTA";

export const metadata: Metadata = {
  title: "الأسعار | قاف — منصة إدارة مكاتب المحاماة",
  description:
    "ابدأ بـ 49 ر.س. كبّر مكتبك لما تكبر شغلتك. تجربة 14 يوم مجاناً، بدون بطاقة، إلغاء بأي وقت.",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <PricingHero />
        <TrustStrip />
        <BundleGrid />
        <Calculator />
        <ROI />
        <Objections />
        <PricingFAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
