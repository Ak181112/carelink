import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import AboutHero from "@/components/about/aboutHero";
import MissionVision from "@/components/about/MissionVission";
import WhyCareLink from "@/components/about/WhyCareLink";
import Journey from "@/components/about/Journey";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <AboutHero />
        <MissionVision />
        <WhyCareLink />
        <Journey />
      </main>

      <Footer />
    </>
  );
}