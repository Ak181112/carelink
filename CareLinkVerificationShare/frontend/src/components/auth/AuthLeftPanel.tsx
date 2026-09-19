import Image from "next/image";
import Logo from "@/components/common/Logo";

export default function AuthLeftPanel() {
  return (
    <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/login-final.png"
        alt="Caregiver"
        fill
        priority
        className="object-cover"
      />

   
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between pt-8 pr-12 pb-12 pl-6">

        {/* Top Logo */}
        <div>
          <Logo />
        </div>

        {/* Footer */}
        <div>
          <p className="text-sm text-white drop-shadow">
            © 2026 CareLink+. All rights reserved.
          </p>
        </div>

      </div>

    </div>
  );
}