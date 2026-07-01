import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="space-y-4">

      {/* Card 1: Phone */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-[#003898]" />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
          <p className="text-slate-900 font-bold text-[17px] mt-0.5">+94 37 2 345 678</p>
        </div>
      </div>

      {/* Card 2: Email */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-[#003898]" />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
          <p className="text-slate-900 font-bold text-[17px] mt-0.5">support@carelink.lk</p>
        </div>
      </div>

      {/* Card 3: Office Location */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-[#003898]" />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Office</span>
          <p className="text-slate-900 font-bold text-[17px] mt-0.5">Kurunegala, Sri Lanka</p>
        </div>
      </div>

      {/* Card 4: Emergency Line */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#003898]" />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Emergency Line</span>
          <p className="text-slate-900 font-bold text-[17px] mt-0.5">24/7 available</p>
        </div>
      </div>

    </div>
  );
}