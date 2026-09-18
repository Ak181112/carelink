import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel />
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white">
  <div className="w-full max-w-130 px-12 mt-12">
    <LoginForm />
  </div>
</div>
    </div>
  );
}