import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

export default function EmailVerified() {
  return (
    <div className="text-center">

      <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#F0FDF4]">
        <CircleCheckBig className="h-14 w-14 text-[#16A34A]" />
      </div>

      <h1 className="mb-4 text-[52px] font-bold leading-tight text-[#091E42]">
        Email Verified
      </h1>

      <p className="mb-10 text-[20px] leading-relaxed text-[#42526E]">
        Your email has been successfully verified.
        Your CareLink+ account is now ready to use.
      </p>

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
          hover:bg-[#003898]
        "
      >
        Continue to Login →
      </Link>

    </div>
  );
}