import ForgotPasswordLeftPanel from "@/components/auth/ForgotPasswordLeftPanel";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <ForgotPasswordLeftPanel />

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-[560px] px-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}