"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, Users, Sparkles } from "lucide-react";
import CountUp from "react-countup";

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Compassion first",
      desc: "Every match is rooted in empathy and dignity.",
    },
    {
      icon: ShieldCheck,
      title: "Verified trust",
      desc: "Background-checked caretakers, vetted thoroughly.",
    },
    {
      icon: Users,
      title: "Family-centered",
      desc: "We treat your loved ones like our own.",
    },
    {
      icon: Sparkles,
      title: "Quality care",
      desc: "Trained, experienced, and continually reviewed.",
    },
  ];

 const stats = [
  {
    value: 1000,
    suffix: "+",
    label: "Families helped",
  },
  {
    value: 300,
    suffix: "+",
    label: "Verified caretakers",
  },
  {
    value: 4.9,
    suffix: "",
    decimals: 1,
    label: "Average rating",
  },
];

  return (
    <main className="bg-white min-h-screen">
      {/* --- HERO SECTION --- */}
{/* ================= HERO SECTION ================= */}
<section className="relative overflow-hidden bg-white">
  <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
    <div className="grid lg:grid-cols-2 gap-14 items-center">

      {/* Left */}
      <div>

        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#003898] px-4 py-2 rounded-full text-sm font-medium">
          <ShieldCheck className="w-4 h-4" />
          About CareLink+
        </div>

        <h1 className="mt-8 text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
          Caring today,
          <br />
          for a{" "}
          <span className="text-[#003898]">
            healthier tomorrow.
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-xl leading-9 text-slate-600">
          CareLink+ was built with one simple mission—to give every Sri Lankan
          family complete peace of mind. We connect families with trusted,
          verified caretakers who provide compassionate assistance for hospital
          visits, elderly care, and everyday support whenever it&apos;s needed most.
        </p>

        <div className="mt-10 flex flex-wrap gap-5">

          <Link
            href="/find-caretakers"
            className="inline-flex items-center gap-3 rounded-2xl bg-[#003898] px-8 py-4 text-white font-semibold hover:bg-[#002D73] transition"
          >
            Find a Caretaker
          </Link>

          <Link
            href="/contact"
            className="rounded-2xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-50 transition"
          >
            Contact Us
          </Link>

        </div>

      </div>

      {/* Right */}
      <div className="relative flex justify-center lg:justify-end">

        <div className="absolute -left-6 bottom-24 w-40 h-40 rounded-full bg-[#EAF1FF]" />

        <div className="absolute left-12 bottom-36 w-20 h-20 rounded-full bg-[#C9DBFF]" />

        <div className="relative overflow-hidden rounded-[48px] shadow-2xl ring-1 ring-slate-200 z-10">

          <Image
            src="/images/about-caregiver.png"
            alt="Professional caregiver supporting an elderly woman"
            width={620}
            height={620}
            priority
            className="w-[620px] h-[620px] object-cover"
          />

        </div>

        {/* Floating Card */}

        

      </div>

    </div>
  </div>
</section>
      {/* --- OUR VALUES SECTION --- */}
      <section className="bg-[#F7F9FC] py-24">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <p className="text-[#003898] text-sm font-semibold uppercase tracking-wider">
              OUR VALUES
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mt-3">
              What we stand for
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-3xl bg-white p-8 shadow-xs border border-slate-50 flex flex-col items-start transition-all hover:shadow-md"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Icon className="h-6 w-6 text-[#003898]" />
                  </div>

                  <h3 className="font-bold text-xl text-slate-900">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
    {stats.map((stat, index) => (
      <div key={index} className="flex flex-col items-center">

        <span className="text-5xl lg:text-6xl font-bold text-[#003898]">
          <CountUp
            end={stat.value}
            duration={2.5}
            separator=","
            suffix={stat.suffix}
            decimals={stat.decimals ?? 0}
            enableScrollSpy
            scrollSpyOnce
          />
        </span>

        <span className="mt-3 text-slate-600 font-medium text-lg">
          {stat.label}
        </span>

      </div>
    ))}
  </div>
</section>
    </main>
  );
}