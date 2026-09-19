import Image from "next/image";
import Logo from "@/components/common/Logo";
import VerificationSent from "@/components/auth/VerificationSent";

export default function VerificationSentPage() {
  return (
    <main className="flex min-h-screen bg-white">

      {/* Left Panel */}
      <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

        <Image
          src="/images/verification-sent.png"
          alt="Verify Email"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between pt-8 pr-12 pb-12 pl-6">

          {/* Logo */}
          <Logo />

          {/* Footer */}
          <p className="text-sm text-white drop-shadow">
            © 2026 CareLink+. All rights reserved.
          </p>

        </div>

      </div>

      {/* Right Panel */}
      <section className="flex w-full items-center justify-center lg:w-1/2 bg-white">

        <div className="w-full max-w-[520px] px-6 py-8 sm:px-8 sm:py-10">

          <VerificationSent />

        </div>

      </section>

    </main>
  );
}