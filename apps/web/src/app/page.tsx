import HeroSection from "@/components/sections/HeroSection";
import AboutTeaser from "@/components/sections/AboutTeaser";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import PackagesTeaser from "@/components/sections/PackagesTeaser";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactCTA from "@/components/sections/ContactCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutTeaser />
      <PortfolioGrid />
      <PackagesTeaser />
      <TestimonialsSection />
      <ContactCTA />
    </>
  );
}
