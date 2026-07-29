import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, Users, Sparkles } from "lucide-react";

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
    { value: "1,000+", label: "Families helped" },
    { value: "300+", label: "Verified caretakers" },
    { value: "4.9", label: "Average rating" },
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* --- HERO SECTION --- */}
<section className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    
    {/* Left Content Side */}
    <div>
      <div className="inline-flex items-center gap-2 bg-blue-50 text-[#003898] px-4 py-2 rounded-full text-sm font-medium">
        About CareLink+
      </div>

      {/* "healthier tomorrow." wrapped in your brand blue color */}
      <h1 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
        Caring today, for a <span className="text-[#003898]">healthier tomorrow.</span>
      </h1>

      <p className="mt-6 max-w-xl text-lg text-slate-600 leading-relaxed">
        CareLink+ was born from a simple belief: every family deserves peace of 
        mind when a loved one needs care. We connect Sri Lankan families with 
        verified, compassionate caretakers — for hospital visits, elderly support, 
        and everything in between.
      </p>

      <div className="mt-8">
        <Link
          href="/find-caretakers"
          className="inline-flex items-center gap-3 rounded-2xl bg-[#003898] px-8 py-4 text-white font-semibold hover:bg-[#002D73] transition"
        >
          Find a caretaker
        </Link>
      </div>
    </div>

    {/* Right Image Side */}
    <div className="relative flex justify-center lg:justify-end">
      <div className="relative overflow-hidden rounded-[70px] w-full max-w-125 aspect-square shadow-sm">
        <Image
          src="/images/about-caregiver.png" 
          alt="Caregiver supporting an elderly woman"
          fill
          priority
          className="object-cover"
        />
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
                {stat.value}
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