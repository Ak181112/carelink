import ForgotPasswordLeftPanel from "../../../components/auth/ForgotPasswordLeftPanel";
import VerificationSent from "../../../components/auth/VerificationSent";

export default function VerificationSentPage() {
  return (
    <div className="flex min-h-screen">
      <ForgotPasswordLeftPanel />

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-130 px-8">
          <VerificationSent />
        </div>
      </div>
    </div>
  );
}