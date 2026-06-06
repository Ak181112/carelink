import Image from "next/image";


export default function AboutHero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        
        {/* Left Side */}
        <div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600">
            About CareLink+
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900">
            Caring for parents,
            <br />
            <span className="text-blue-600">
              like our own.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-gray-600 leading-relaxed">
            CareLink+ connects families with verified and compassionate
            caretakers for hospital visits and elderly care.
          </p>
        </div>

        {/* Right Side */}
        <div>
          <Image
            src="/images/about-hero.jpg"
            alt="Caregiver helping elderly parent"
            width={600}
            height={500}
            className="w-full rounded-3xl"
            />
        </div>

      </div>
    </section>
  );
}