// src/app/(auth)/reset-link-sent/page.tsx

import Image from "next/image";
import Logo from "@/components/common/Logo";
import ResetLinkSent from "@/components/auth/ResetLinkSent";

export default function ResetLinkSentPage() {
  return (
    <main className="flex min-h-screen bg-white">

      {/* Left Side */}
      <div className="relative hidden lg:block lg:w-1/2">

        <Image
          src="/images/reset-link.png"
          alt="Reset password email"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay Content */}

        <div className="absolute inset-0 flex flex-col justify-between pt-8 pb-12 pl-6 pr-12">

          <Logo />

          <p className="text-sm text-white drop-shadow">
            © 2026 CareLink+. All rights reserved.
          </p>

        </div>

      </div>

      {/* Right Side */}

      <section className="flex w-full items-center justify-center lg:w-1/2">

        <div className="w-full max-w-[520px] px-6 py-8 sm:px-8 sm:py-10">

          <ResetLinkSent />

        </div>

      </section>

    </main>
  );
}