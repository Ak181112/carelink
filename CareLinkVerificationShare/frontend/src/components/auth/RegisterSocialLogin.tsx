export default function RegisterSocialLogin() {
  return (
    <>
      <div className="my-8 flex items-center gap-4">

        <div className="h-px flex-1 bg-[#DFE1E6]" />

        <span className="text-[#6B7280]">
          or continue with
        </span>

        <div className="h-px flex-1 bg-[#DFE1E6]" />

      </div>

      <button
        className="
          h-[60px]
          w-full
          rounded-2xl
          border
          border-[#DFE1E6]
          bg-white
          font-medium
          text-[#091E42]
        "
      >
        Continue with Google
      </button>
    </>
  );
}