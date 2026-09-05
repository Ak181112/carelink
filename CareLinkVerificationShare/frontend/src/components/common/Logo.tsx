import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-[#003898] flex items-center justify-center shadow-sm">
        <HeartHandshake className="h-6 w-6 text-white" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        <span className="text-slate-900 dark:text-slate-100">Care</span>
        <span className="text-[#003898]">Link+</span>
      </h1>
    </Link>
  );
}