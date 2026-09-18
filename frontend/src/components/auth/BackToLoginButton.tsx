import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToLoginButton() {
  return (
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
  );
}