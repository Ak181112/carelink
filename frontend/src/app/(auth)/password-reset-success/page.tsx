import ForgotPasswordLeftPanel from "../../../components/auth/ForgotPasswordLeftPanel";
import PasswordResetSuccess from "../../../components/auth/PasswordResetSuccess";

export default function PasswordResetSuccessPage() {
  return (
    <div className="flex min-h-screen">
      <ForgotPasswordLeftPanel />

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-[520px] px-8">
          <PasswordResetSuccess />
        </div>
      </div>
    </div>
  );
}