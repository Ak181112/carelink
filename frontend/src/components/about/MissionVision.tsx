export default function MissionVision() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            Our Purpose
          </h2>

          <p className="mt-4 text-gray-600">
            We exist to make elderly care simpler, safer and more reliable.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              Our Mission
            </h3>

            <p className="mt-4 text-gray-600">
              To provide safe, reliable and compassionate caretaker services
              that ensure comfort and peace of mind.
            </p>
          </div>

          <div className="rounded-3xl border p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              Our Vision
            </h3>

            <p className="mt-4 text-gray-600">
              To become Sri Lanka&apos;s most trusted platform for care management.
            </p>
          </div>

          <div className="rounded-3xl border p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              Our Values
            </h3>

            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✓ Trust & Safety</li>
              <li>✓ Compassion</li>
              <li>✓ Respect & Dignity</li>
              <li>✓ Reliability</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}