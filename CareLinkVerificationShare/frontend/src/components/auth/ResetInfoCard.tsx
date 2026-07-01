import { ShieldCheck } from "lucide-react";

export default function ResetInfoCard() {
  return (
    <div className="flex gap-4 rounded-2xl bg-[#F4F8FF] p-5">

      <ShieldCheck className="h-7 w-7 text-[#0052CC]" />

      <div>
        <p className="font-semibold text-[#091E42]">
          We&apos;ll send a password reset link to your email.
        </p>

        <p className="mt-1 text-sm text-[#6B7280]">
          Please check your inbox and spam folder.
        </p>
      </div>

    </div>
  );
}