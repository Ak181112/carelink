import Image from "next/image";
import Logo from "@/components/common/Logo";

export default function AuthLeftPanel() {
  return (
    <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/login-caregiver.png"
        alt="Caregiver"
        fill
        priority
        className="object-cover"
      />

   
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-12">

        {/* Top Logo */}
        <div>
          <Logo />
        </div>

       {/* Middle Quote Section */}
<div className="absolute left-14 bottom-24 max-w-[500px]">

  <h2 className="text-[48px] font-bold leading-tight text-[#091E42]">
    Compassion
    <br />
    connects us all.
  </h2>

  <div className="mt-6 flex items-center gap-4">
    <span className="text-2xl text-[#0052CC]">♥</span>
    <div className="h-[3px] w-10 bg-[#0052CC] rounded-full" />
  </div>

  <p className="mt-6 text-[18px] leading-relaxed text-[#42526E]">
    CareLink+ connects families with trusted caretakers for peace of mind, every day.
  </p>

</div>
        {/* Footer */}
        <div>
          <p className="text-sm text-[#42526E]">
            © 2026 CareLink+. All rights reserved.
          </p>
        </div>

      </div>

    </div>
  );
}