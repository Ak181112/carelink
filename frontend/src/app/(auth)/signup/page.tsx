// src/app/(auth)/signup/page.tsx

import RegisterLeftPanel from "@/components/auth/RegisterLeftPanel";
import RegisterForm from "@/components/auth/RegisterForm"; // Import the existing form file

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      <RegisterLeftPanel />
      
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-155 px-8 py-10">
          <RegisterForm /> {/* Render the component here */}
        </div>
      </div>
    </div>
  );
}