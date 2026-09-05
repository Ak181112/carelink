import Image from "next/image";
import Logo from "@/components/common/Logo";
import PasswordResetSuccess from "@/components/auth/PasswordResetSuccess";

export default function PasswordResetSuccessPage() {
  return (
    <main className="flex min-h-screen bg-white">

      {/* Left Panel */}
      <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

        <Image
          src="/images/password-reset-success.png"
          alt="Password Reset Successful"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay Content */}
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

          <PasswordResetSuccess />

        </div>

      </section>

    </main>
  );
}