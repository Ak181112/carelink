import Link from "next/link";
import { MailCheck, ArrowLeft} from "lucide-react";
import { ShieldCheck } from "lucide-react";
export default function ResetLinkSent() {
  return (
    <div className="w-full">

      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF]">
          <MailCheck className="h-8 w-8 text-[#003898]" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-center text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
        Check Your Email
      </h1>

      {/* Description */}
      <p className="mt-3 text-center text-base leading-7 text-[#64748B]">
        We&apos;ve sent a password reset link to your email address.
        Please check your inbox and follow the instructions to continue.
      </p>

      {/* Info Card */}
      <div className="mt-8 rounded-xl border border-[#D6E4FF] bg-[#F8FAFC] p-3">

        <div className="flex items-start gap-3">

          <ShieldCheck className="mt-0.5 h-5 w-5 text-[#003898]" />

          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Didn&apos;t receive the email?
            </p>

            <p className="mt-0.5 text-sm text-[#64748B]">
              Check your spam folder or request another password reset email.
            </p>
          </div>

        </div>

      </div>

      {/* Resend */}

      <button
        className="
          mt-6
          h-12
          w-full
          rounded-xl
          bg-[#003898]
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition-colors
          duration-200
          hover:bg-[#002E7A]
          focus:outline-none
          focus:ring-2
          focus:ring-[#003898]/20
          focus:ring-offset-2
        "
      >
        Resend Email
      </button>

      {/* Divider */}

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Back */}

      <Link
        href="/login"
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-slate-200
          bg-white
          text-sm
          font-semibold
          text-[#003898]
          transition-colors
          duration-200
          hover:bg-[#F8FAFC]
          hover:border-[#003898]
          focus:outline-none
          focus:ring-2
          focus:ring-[#003898]/20
          focus:ring-offset-2
        "
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>

    </div>
  );
}