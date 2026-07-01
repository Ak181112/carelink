import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import AboutHero from "@/components/about/AboutHero";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <AboutHero />
      </main>

      <Footer />
    </>
  );
}