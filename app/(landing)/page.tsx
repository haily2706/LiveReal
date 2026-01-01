
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { HeroSection } from "@/app/(landing)/components/hero-section";
import { HowItWorks } from "@/app/(landing)/components/how-it-works";
import { FeaturesSection } from "@/app/(landing)/components/features-section";
import { HBarWalletSection } from "@/app/(landing)/components/hbar-wallet-section";
import { GiftGallery } from "@/app/(landing)/components/gift-gallery";
import { Testimonials } from "@/app/(landing)/components/testimonials";
import { PricingSection } from "@/app/(landing)/components/pricing-section";
import { CTASection } from "@/app/(landing)/components/cta-section";
import { Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/app/(landing)/components/footer";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
  
      <div className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Features */}
        <FeaturesSection />

        {/* HBar Wallet Section */}
        <HBarWalletSection />

        {/* Gift Gallery */}
        <GiftGallery />

        {/* Testimonials */}
        <Testimonials />

        {/* Pricing */}
        <PricingSection />

        {/* CTA */}
        <CTASection />
      </div>

      <Footer />
    </div>
  );
}

