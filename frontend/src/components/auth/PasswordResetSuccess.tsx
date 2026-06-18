import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

export default function PasswordResetSuccess() {
  return (
    <div className="text-center">

      {/* Success Icon */}
      <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#F0FDF4]">
        <CircleCheckBig className="h-14 w-14 text-[#16A34A]" />
      </div>

      {/* Heading */}
      <h1 className="mb-4 text-[52px] font-bold leading-tight text-[#091E42]">
        Password Updated
      </h1>

      {/* Description */}
      <p className="mx-auto mb-10 max-w-[450px] text-[20px] leading-relaxed text-[#42526E]">
        Your password has been successfully reset.
        You can now log in using your new password.
      </p>

      {/* Info Card */}
      <div className="mb-8 rounded-2xl bg-[#F4F8FF] p-5 text-left">
        <p className="font-semibold text-[#091E42]">
          Security Tip
        </p>

        <p className="mt-2 text-[#42526E]">
          Keep your password secure and avoid sharing it with anyone.
        </p>
      </div>

      {/* Login Button */}
      <Link
        href="/login"
        className="
          flex
          h-16
          w-full
          items-center
          justify-center
          rounded-2xl
          bg-[#0052CC]
          text-lg
          font-semibold
          text-white
          transition
          hover:bg-[#003898]
        "
      >
        Continue to Login →
      </Link>

    </div>
  );
}