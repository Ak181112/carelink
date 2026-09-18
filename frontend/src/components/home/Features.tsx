import {
  ShieldCheck,
  Hospital,
  HeartHandshake,
  Lock,
} from "lucide-react";

export default function Features() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Verified Caretakers",
      desc: "Background checked and identity verified.",
    },
    {
      icon: Hospital,
      title: "Hospital Assistance",
      desc: "Specialized support during hospital visits.",
    },
    {
      icon: HeartHandshake,
      title: "Personalized Matching",
      desc: "Recommendations based on care needs.",
    },
    {
      icon: Lock,
      title: "Safe & Secure",
      desc: "Your family data stays protected.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-8 shadow-sm"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Icon className="h-7 w-7 text-[#003898]" />
              </div>

              <h3 className="font-bold text-xl">
                {item.title}
              </h3>

              <p className="mt-3 text-slate-600">
                {item.desc}
              </p>
            </div>
          );
        })}

      </div>
    </section>
  );
}