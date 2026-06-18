import BookingCard from "./BookingCard";

export default function CaretakerProfileHero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">

          <div className="flex gap-6 items-center">
            <div className="w-32 h-32 rounded-full bg-slate-200"></div>

            <div>
              <h1 className="text-4xl font-bold">
                Nirmala Perera
              </h1>

              <p className="text-gray-500 mt-2">
                Elderly Care Specialist
              </p>

              <div className="mt-4 flex gap-4 text-sm">
                <span>⭐ 4.8 Rating</span>
                <span>5+ Years Experience</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-gray-600 leading-relaxed">
            Dedicated and compassionate caretaker with extensive experience
            supporting elderly patients during hospital visits and medical
            appointments.
          </p>

        </div>

        <BookingCard />

      </div>
    </section>
  );
}