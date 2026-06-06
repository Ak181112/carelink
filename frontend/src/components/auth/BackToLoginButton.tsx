import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToLoginButton() {
  return (
    <Link
      href="/login"
      className="
        flex
        h-16
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-[#DFE1E6]
        font-medium
        text-[#003898]
      "
    >
      <ArrowLeft className="h-5 w-5" />
      Back to login
    </Link>
  );
}