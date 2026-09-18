import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#003898] px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              Trusted care. Anytime, anywhere.
            </div>

            {/* Heading */}
            {/* FIXED leading-none or leading-[78px] so large text lines do not overlap */}
            <h1 className="mt-8 text-[72px] leading-[78px] font-bold text-slate-900">
              Care, planned
              <br />
              with{" "}
              <span className="text-[#003898]">
                calm.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-xl text-xl leading-10 text-slate-600">
              CareLink+ connects families with verified caretakers
              for hospital visits and elderly care, so your loved
              ones are never alone.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-5">
              <Link
                href="/find-caretakers"
                className="inline-flex items-center gap-3 rounded-2xl bg-[#003898] px-8 py-4 text-white font-semibold hover:bg-[#002D73] transition"
              >
                Find a caretaker
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-50 transition"
              >
                Create parent profile
              </Link>
            </div>

            {/* Trusted Families */}
            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-3">
                <Image
                  src="/images/avatar1.png"
                  alt="User"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white"
                />
                <Image
                  src="/images/avatar2.png"
                  alt="User"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white"
                />
                <Image
                  src="/images/avatar3.png"
                  alt="User"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white"
                />
              </div>

              <p className="text-slate-600 text-lg">
                Trusted by{" "}
                <span className="font-bold text-[#003898]">
                  1,000+
                </span>
                {" "}families across Sri Lanka
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex justify-center items-center">
            {/* Concentric circles */}
            <div className="absolute left-0 bottom-28 w-40 h-40 rounded-full bg-[#EAF1FF] z-0" />
            <div className="absolute left-10 bottom-38 w-20 h-20 rounded-full bg-[#C9DBFF] z-0" />

            {/* Main Image */}
            <div className="relative overflow-hidden rounded-[70px] z-10">
              {/* FIXED layout styling instead of tailwind-unrecognized classes */}
              <Image
                src="/images/hero-caregiver.png"
                alt="Caregiver helping elderly patient"
                width={650}
                height={650}
                priority
                className="w-[650px] h-[650px] object-cover"
              />
            </div>

            {/* Support Card */}
            <div className="absolute bottom-4 right-0 bg-white rounded-[28px] shadow-xl px-8 py-5 flex items-center gap-4 z-20">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#003898]" />
              </div>

              <div>
                <h3 className="text-[42px] font-bold leading-none text-slate-900">
                  24/7
                </h3>
                <p className="mt-1 text-slate-600">
                  Emergency Support
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}