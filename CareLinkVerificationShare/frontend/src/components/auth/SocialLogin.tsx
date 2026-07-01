export default function SocialLogin() {
  return (
    <>
      {/* Divider */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#DFE1E6]" />

        <span className="text-sm text-[#6B778C]">
          or continue with
        </span>

        <div className="h-px flex-1 bg-[#DFE1E6]" />
      </div>

      {/* Google Button */}
      <div className="mb-8">
        <button
          className="
            flex
            h-14
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-[#DFE1E6]
            bg-white
            text-base
            font-medium
            text-[#091E42]
            transition
            hover:bg-[#F4F5F7]
          "
        >
          <span className="text-xl">G</span>
          Continue with Google
        </button>
      </div>
    </>
  );
}