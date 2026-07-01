import Image from "next/image";
import Logo from "@/components/common/Logo";

export default function RegisterLeftPanel() {
  return (
    <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

      <Image
        src="/images/register-caregiver.png"
        alt="Caregiver"
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-white/50" />

      <div className="absolute inset-0 flex flex-col justify-between p-14">

        <Logo />

        <div className="max-w-[420px]">

          <h2 className="text-[62px] leading-[1.05] font-medium text-[#091E42]">
            Caring today,
            <br />
            for a healthier
            <br />
            tomorrow.
          </h2>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-[#0052FF] text-3xl">♥</span>

            <div className="h-[3px] w-12 rounded-full bg-[#0052FF]" />
          </div>

          <p className="mt-6 text-lg leading-relaxed text-[#42526E]">
            Join CareLink+ and be part of
            a community that truly cares.
          </p>

        </div>

        <div className="space-y-6">

          <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F8FF]">
              🛡️
            </div>

            <div>
              <p className="font-semibold text-[#091E42]">
                Trusted by 1,000+ families
              </p>

              <p className="text-sm text-[#42526E]">
                across Sri Lanka
              </p>
            </div>

          </div>

          <p className="text-sm text-[#42526E]">
            © 2026 CareLink+. All rights reserved.
          </p>

        </div>

      </div>

    </div>
  );
}