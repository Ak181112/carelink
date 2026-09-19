// src/app/(auth)/register/page.tsx

import RegisterLeftPanel from "@/components/auth/RegisterLeftPanel";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <RegisterLeftPanel />
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-[620px] px-8 py-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}