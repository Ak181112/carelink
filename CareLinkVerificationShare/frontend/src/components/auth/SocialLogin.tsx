import { FcGoogle } from "react-icons/fc";

export default function SocialLogin() {
  return (
    <>
      {/* Divider */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#DFE1E6]" />

        <span className="text-sm text-[#6B778C]">
          Or continue with
        </span>

        <div className="h-px flex-1 bg-[#DFE1E6]" />
      </div>

      {/* Google Button */}
      <div className="mb-6">
        <button
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            border
            border-[#E2E8F0]
            bg-white
            text-sm
            font-medium
            text-[#091E42]
            transition-colors
duration-200
hover:bg-[#F8FAFC]
focus:outline-none
focus:ring-2
focus:ring-[#003898]/20
focus:ring-offset-2
          "
        >
          <FcGoogle className="h-6 w-6 shrink-0" />
          Continue with Google
        </button>
      </div>
    </>
  );
}