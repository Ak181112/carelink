import { Suspense } from "react";
import ForgotPasswordLeftPanel from "../../../components/auth/ForgotPasswordLeftPanel";
import ResetPasswordForm from "../../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <ForgotPasswordLeftPanel />

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-[520px] px-8">
          {/* the form reads the reset token from the query string, which is only
              available on the client, so it must not be prerendered */}
          <Suspense
            fallback={
              <div className="py-16 text-center text-[#42526E]">Loading...</div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
