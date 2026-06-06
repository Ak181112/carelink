import Image from "next/image";

export default function ContactHero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 items-center gap-12">

        <div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600">
            We&apos;re Here to Help
          </span>

          <h1 className="mt-6 text-5xl font-bold text-slate-900 leading-tight">
            Get in touch
            <br />
            with <span className="text-blue-600">CareLink+</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-lg">
            Have a question, need assistance, or want to learn more about our
            services? Our team is ready to support you.
          </p>
        </div>

        <div>
          <Image
            src="/images/about-hero.jpg"
            alt="Contact CareLink"
            width={700}
            height={500}
            className="rounded-3xl w-full"
          />
        </div>

      </div>
    </section>
  );
}