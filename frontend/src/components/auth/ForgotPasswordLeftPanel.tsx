import Image from "next/image";

export default function ForgotPasswordLeftPanel() {
  return (
    <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

      <Image
        src="/images/forgot-password-bg.png"
        alt="Forgot Password"
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-white/50" />

    </div>
  );
}