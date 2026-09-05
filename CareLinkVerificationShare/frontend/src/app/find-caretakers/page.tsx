
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BadgeCheck } from "lucide-react";


export default function FindCaretakersPage() {
  const caretakers = [
    {
      id: 1,
      name: "Priya Fernando",
      image: "/images/caretaker1.png",
      role: "Hospital Companion",
      location: "Kuliyapitiya",
      experience: "7 Years Experience",
      quote: "Every elderly parent deserves to feel safe, respected and supported throughout every hospital visit.",
      why: "Helping families feel at ease during difficult moments is the most rewarding part of my work.",
    },
    {
      id: 2,
      name: "Nimal Bandara",
      image: "/images/caretaker2.png",
      role: "Patient Assistant",
      location: "Wariyapola",
      experience: "5 Years Experience",
      quote: "A calm companion can make every hospital visit less stressful and more comfortable.",
      why: "I enjoy making every patient feel confident from the moment they leave home until they safely return.",
    },
    {
      id: 3,
      name: "Malini Jayawardena",
      image: "/images/caretaker3.png",
      role: "Hospital Escort",
      location: "Kurunegala",
      experience: "6 Years Experience",
      quote: "Compassion isn't just about care—it's about being present when someone needs you most.",
      why: "I believe every hospital journey should be filled with patience, dignity and kindness.",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* ========================================= */}
        {/* HERO */}
        {/* ========================================= */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              {/* LEFT */}
              <div>

                <div className="inline-flex items-center gap-2 bg-blue-50 text-[#003898] px-4 py-2 rounded-full text-sm font-medium">
  <BadgeCheck className="w-4 h-4" />
  Verified Companions
</div>
                <h1 className="mt-8 text-[72px] leading-[78px] font-bold text-slate-900">
                  Meet the people
                  <br />
                  behind every
                  <span className="text-[#003898]"> safe journey.</span>
                </h1>

                <p className="mt-8 max-w-xl text-xl leading-10 text-slate-600">
                  Every CareLink+ companion is carefully selected to accompany elderly parents during hospital visits,
                  offering reassurance, support and compassionate care from pickup to returning home.
                </p>

                <div className="mt-10">
                  <Link
                    href="#people"
                    className="inline-flex items-center gap-3 rounded-2xl bg-[#003898] px-8 py-4 text-white font-semibold transition hover:bg-[#002D73]"
                  >
                    Meet Our People
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative flex justify-center">
                {/* Decorative Circles */}
                <div className="absolute left-0 bottom-24 h-40 w-40 rounded-full bg-[#EAF1FF]" />
                <div className="absolute left-10 bottom-34 h-20 w-20 rounded-full bg-[#C9DBFF]" />

                {/* Image */}
                <div className="relative overflow-hidden rounded-[70px]">
                  <Image
                    src="/images/find-caretakers-hero.png"
                    alt="Hospital Companion"
                    width={650}
                    height={650}
                    priority
                    className="w-[650px] h-[650px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* MEET OUR PEOPLE */}
        {/* ========================================= */}
        <section id="people" className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-[#003898] text-sm font-semibold uppercase tracking-wider">
                OUR PEOPLE
              </p>
              <h2 className="mt-4 text-5xl font-bold text-slate-900">
                Compassion in every visit.
              </h2>
              <p className="mt-6 max-w-3xl mx-auto text-xl leading-9 text-slate-600">
                Meet some of the dedicated professionals who accompany elderly parents with kindness,
                patience and confidence throughout every hospital journey.
              </p>
            </div>

            {/* Dynamic Rendering of Caretakers */}
            {caretakers.map((caretaker, index) => {
              // Alternate order layout for every odd indexed item (0-indexed, so 2nd person)
              const isEven = index % 2 === 0;

              return (
                <div key={caretaker.id} className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
                  {/* Image Div - Condition changes layout order on desktop screens */}
                  <div className={`flex ${!isEven ? "order-1 lg:order-2 justify-end" : "order-1"}`}>
                    <Image
                      src={caretaker.image}
                      alt={caretaker.name}
                      width={560}
                      height={680}
                      className="rounded-[40px] object-cover shadow-xl"
                    />
                  </div>

                  {/* Content Div */}
                  <div className={!isEven ? "order-2 lg:order-1" : "order-2"}>
                    <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#003898]">
                      {caretaker.role}
                    </span>

                    <h3 className="mt-6 text-5xl font-bold text-slate-900">
                      {caretaker.name}
                    </h3>

                    <div className="mt-5 flex gap-8 text-slate-500">
                      <p>{caretaker.experience}</p>
                      <p>{caretaker.location}</p>
                    </div>

                    <blockquote className="mt-10 border-l-4 border-[#003898] pl-6">
                      <p className="text-2xl italic leading-10 text-slate-700">
                        "{caretaker.quote}"
                      </p>
                    </blockquote>

                    <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
                      <h4 className="font-semibold text-slate-900">
                        Why I do this
                      </h4>
                      <p className="mt-3 leading-8 text-slate-600">
                        {caretaker.why}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================= */}
        {/* CALL TO ACTION */}
        {/* ========================================= */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">
          <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-[#F5F8FF] to-[#EEF4FF]">
            <div className="grid lg:grid-cols-[1fr_1.1fr] items-center min-h-[420px]">
              {/* Left - Image */}
              <div className="relative h-full min-h-[420px]">
                <Image
                  src="/images/peace.png"
                  alt="Hospital Companion"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Right - Content */}
              <div className="p-10 lg:p-14">
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Ready to meet
                  <br />
                  more companions?
                </h2>

                <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
                  Browse our complete network of verified hospital companions and choose the professional who best matches your loved one's needs.
                </p>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 mt-8 rounded-2xl bg-[#003898] px-8 py-4 text-white font-semibold transition hover:bg-[#002D73]"
                >
                  View All Caretakers
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}