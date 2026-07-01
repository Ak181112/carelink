import { SendHorizontal } from "lucide-react"; // Imported for button design parity

export default function ContactHero() {
  return (
    <section className="bg-white pt-16 pb-12 text-center">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Pill Badge matching your global styling */}
        <span className="inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#003898]">
          We&apos;re listening
        </span>

        {/* Crisp design-matched heading */}
        <h1 className="mt-6 text-[54px] font-bold text-slate-900 tracking-tight leading-none">
          Get in touch
        </h1>

        {/* Fluid balanced descriptor paragraph */}
        <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Have a question, feedback, or need urgent care support? Reach out — we respond within a few hours.
        </p>
        
      </div>
    </section>
  );
}