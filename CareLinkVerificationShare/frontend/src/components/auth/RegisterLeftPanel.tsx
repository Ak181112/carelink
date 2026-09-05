import Image from "next/image";
import Logo from "@/components/common/Logo";
import { ShieldCheck } from "lucide-react";

export default function RegisterLeftPanel() {
  return (
    <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">

      <Image
        src="/images/caregiver-reg.png"
        alt="Caregiver"
        fill
        className="object-cover"
      />


<div className="absolute inset-0 flex flex-col justify-between pt-8 pr-12 pb-12 pl-6">
        <Logo />

        

        <div className="space-y-6">

          <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F8FF]">
  <ShieldCheck className="h-5 w-5 text-[#003898]" />
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

          <p className="text-sm text-white drop-shadow">
            © 2026 CareLink+. All rights reserved.
          </p>

        </div>

      </div>

    </div>
  );
}