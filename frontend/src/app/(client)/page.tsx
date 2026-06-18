import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/common/Footer";

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTASection />
      <Footer />
    </main>
  );
}