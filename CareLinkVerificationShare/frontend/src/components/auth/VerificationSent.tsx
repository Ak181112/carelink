import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerificationSent() {
  return (
    <div className="text-center">

      <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#F4F8FF]">
        <Mail className="h-14 w-14 text-[#0052CC]" />
      </div>

      <h1 className="mb-4 text-[52px] font-bold leading-tight text-[#091E42]">
        Verify your email
      </h1>

      <p className="mb-10 text-[20px] leading-relaxed text-[#42526E]">
        We&apos;ve sent a verification link to your email address.
        Please check your inbox and click the link to activate your account.
      </p>

      <div className="mb-8 rounded-2xl bg-[#F4F8FF] p-5 text-left">
        <p className="font-semibold text-[#091E42]">
          Didn&apos;t receive the email?
        </p>

        <p className="mt-2 text-[#42526E]">
          Check your spam folder or request another verification email.
        </p>
      </div>

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
          hover:bg-[#003898]
        "
      >
        Resend Verification Email →
      </button>

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
          text-[#0052CC]
          font-medium
        "
      >
        Back to Login
      </Link>

    </div>
  );
}