import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function ResetLinkSent() {
  return (
    <div className="w-full text-center">

      {/* Icon */}
      <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#F4F8FF]">
        <MailCheck className="h-14 w-14 text-[#0052CC]" />
      </div>

      {/* Heading */}
      <h1 className="mb-4 text-[52px] font-bold leading-tight text-[#091E42]">
        Check your email
      </h1>

      {/* Description */}
      <p className="mx-auto mb-10 max-w-[460px] text-[20px] leading-relaxed text-[#42526E]">
        We have sent a password reset link to your email address.
        Please check your inbox and follow the instructions.
      </p>

      {/* Info Card */}
      <div className="mb-8 rounded-2xl bg-[#F4F8FF] p-6 text-left">
        <p className="font-semibold text-[#091E42]">
          Did not receive the email?
        </p>

        <p className="mt-2 text-[#42526E]">
          Check your spam folder or request a new reset link.
        </p>
      </div>

      {/* Resend Button */}
      <button
        className="
          mb-5
          h-16
          w-full
          rounded-2xl
          bg-[#0052CC]
          text-lg
          font-semibold
          text-white
          transition
          hover:bg-[#003898]
        "
      >
        Resend Email →
      </button>

      {/* Back */}
      <Link
        href="/login"
        className="
          flex
          h-16
          w-full
          items-center
          justify-center
          rounded-2xl
          border
          border-[#DFE1E6]
          text-lg
          font-medium
          text-[#0052CC]
          transition
          hover:bg-[#F8FAFC]
        "
      >
        ← Back to Login
      </Link>

    </div>
  );
}