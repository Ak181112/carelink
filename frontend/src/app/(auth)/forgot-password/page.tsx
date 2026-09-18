// src/app/(auth)/forgot-password/page.tsx

import ForgotPasswordLeftPanel from "@/components/auth/ForgotPasswordLeftPanel";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <ForgotPasswordLeftPanel />

      {/* Right Panel */}
      <section className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-130 px-6 py-8 sm:px-8 sm:py-10">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}