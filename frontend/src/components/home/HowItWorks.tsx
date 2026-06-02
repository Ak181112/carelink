import {
  Users,
  UserRoundSearch,
  CalendarDays,
} from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="bg-[#F7F9FC] py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <p className="text-[#003898] text-sm font-semibold uppercase tracking-wider">
            SIMPLE STEPS
          </p>

          <h2 className="text-5xl font-bold text-slate-900 mt-3">
            How CareLink+ works
          </h2>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Step 1 */}

          <div className="relative bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">

            <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-[#003898] text-white flex items-center justify-center font-semibold">
              1
            </div>

            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-[#003898]" />
            </div>

            <h3 className="text-xl font-semibold text-center mt-8">
              Create a parent profile
            </h3>

            <p className="text-slate-600 text-center mt-4">
              Add your loved one&apos;s health details,
              hospital preferences, and care needs.
            </p>

          </div>

          {/* Step 2 */}

          <div className="relative bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">

            <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-[#003898] text-white flex items-center justify-center font-semibold">
              2
            </div>

            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
              <UserRoundSearch className="w-10 h-10 text-[#003898]" />
            </div>

            <h3 className="text-xl font-semibold text-center mt-8">
              Find a verified caretaker
            </h3>

            <p className="text-slate-600 text-center mt-4">
              Browse recommended caretakers and
              view their skills, reviews & ratings.
            </p>

          </div>

          {/* Step 3 */}

          <div className="relative bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">

            <div className="absolute top-5 left-5 w-10 h-10 rounded-full bg-[#003898] text-white flex items-center justify-center font-semibold">
              3
            </div>

            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarDays className="w-10 h-10 text-[#003898]" />
            </div>

            <h3 className="text-xl font-semibold text-center mt-8">
              Book with confidence
            </h3>

            <p className="text-slate-600 text-center mt-4">
              Request a booking and let our
              caretakers take care of the rest.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}