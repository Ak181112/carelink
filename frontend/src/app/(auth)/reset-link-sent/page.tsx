import ResetLinkSent from "../../../components/auth/ResetLinkSent";
import ForgotPasswordLeftPanel from "@/components/auth/ForgotPasswordLeftPanel";

export default function ResetLinkSentPage() {
  return (
    <div className="flex min-h-screen">
      <ForgotPasswordLeftPanel />

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-130 px-8">
          <ResetLinkSent />
        </div>
      </div>
    </div>
  );
}