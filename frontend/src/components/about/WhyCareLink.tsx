export default function WhyCareLink() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600">
            Why CareLink+
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Why Families Trust Us
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            We provide reliable, compassionate, and professional care
            services for your loved ones.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-4 text-4xl">🛡️</div>

            <h3 className="text-2xl font-bold text-slate-900">
              Verified & Trained
            </h3>

            <p className="mt-4 text-gray-600">
              Every caretaker undergoes verification and screening
              before joining our platform.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-4 text-4xl">❤️</div>

            <h3 className="text-2xl font-bold text-slate-900">
              Compassionate Care
            </h3>

            <p className="mt-4 text-gray-600">
              We connect families with caregivers who genuinely care
              about the wellbeing of elderly patients.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-4 text-4xl">🔒</div>

            <h3 className="text-2xl font-bold text-slate-900">
              Safe & Reliable
            </h3>

            <p className="mt-4 text-gray-600">
              Secure bookings, transparent communication, and trusted
              support whenever you need assistance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}