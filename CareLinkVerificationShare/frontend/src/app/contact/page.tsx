import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <ContactHero />

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-3 gap-10">
        <ContactInfo />

        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </>
  );
}