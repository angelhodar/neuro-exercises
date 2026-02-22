import CtaSection from "./cta";
import FeaturesSection from "./features";
import { Footer } from "./footer";
import HeroSection from "./hero";
import MultimediaSection from "./multimedia";
import { Nav } from "./nav";
import WorkflowSection from "./workflow";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MultimediaSection />
        <WorkflowSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
