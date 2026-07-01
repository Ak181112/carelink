import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">

      <div className="overflow-hidden rounded-[40px] bg-linear-to-r from-[#F5F8FF] to-[#EEF4FF]">

        <div className="grid lg:grid-cols-[1.1fr_1fr] items-center min-h-90">

          {/* Left Side */}

          <div className="p-10 lg:p-14">

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#003898] font-medium shadow-sm">

              <Heart className="w-4 h-4" />

              We&apos;re here for you

            </div>

            <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">

              Compassionate care when
              
              you need it most.

            </h2>

            <p className="mt-5 text-lg text-slate-600 max-w-md">

              Whether it&apos;s a planned hospital visit
              or an urgent need, CareLink+ is just
              a click away.

            </p>

            <Link
              href="/find-caretakers"
              className="
                inline-flex
                items-center
                gap-3
                mt-8
                rounded-2xl
                bg-[#003898]
                px-8
                py-4
                text-white
                font-semibold
                hover:bg-[#002D73]
                transition
              "
            >
              Find a caretaker

              <ArrowRight className="w-5 h-5" />
            </Link>

          </div>

          {/* Right Side */}

          <div className="relative h-full min-h-90">

            <Image
              src="/images/helping-hands.png"
              alt="Compassionate Care"
              fill
              priority
              className="object-cover"
            />

          </div>

        </div>

      </div>

    </section>
  );
}