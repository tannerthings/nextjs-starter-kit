import { AccordionComponent } from "@/components/homepage/accordion-component";
import HeroSection from "@/components/homepage/hero-section";
import ParallaxHero from "@/components/homepage/parallax-hero-section";
import MarketingCards from "@/components/homepage/marketing-cards";
import Pricing from "@/components/homepage/pricing";
import SideBySide from "@/components/homepage/side-by-side";
import BackgroundVideo from "@/components/ui/backgroundvideo";
import EmbeddedVideo from "@/components/ui/embeddedvideo";
import PageWrapper from "@/components/wrapper/page-wrapper";
import { polar } from "@/lib/polar";
import MarketingPage from "./(pages)/marketing/page";

export default async function Home() {

  return (
    <PageWrapper>
      
      <div className="flex flex-col justify-center items-center w-full">

        <ParallaxHero />

      </div>
      
      <SideBySide />
      <MarketingCards />
      <AccordionComponent />
    </PageWrapper>
  );

}