import ForgotPasswordLeftPanel from "../../../components/auth/ForgotPasswordLeftPanel";
import ResetPasswordForm from "../../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <ForgotPasswordLeftPanel />

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-[520px] px-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}