import { ShieldCheck } from "lucide-react";

export default function ResetInfoCard() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#D6E4FF] bg-[#F8FAFC] p-3">

      <ShieldCheck className="mt-0.5 h-5 w-5 text-[#003898]" />

      <div>
        <p className="text-sm font-semibold text-[#0F172A]">
          We&apos;ll send a password reset link to your email.
        </p>

        <p className="mt-0.5 text-sm text-[#64748B]">
          Please check your inbox and spam folder after submitting your request.
        </p>
      </div>

    </div>
  );
}