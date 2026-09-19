"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

import AccountTypeSelector from "./AccountTypeSelector";
import PasswordInput from "./PasswordInput";
import RegisterSocialLogin from "./RegisterSocialLogin";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterForm() {
  const [accountType, setAccountType] = useState("family_member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        role: accountType,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => router.push("/login"), 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">

      <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
  Create Account
</h1>



      <p className="mt-3 text-base leading-7 text-[#64748B]">
        Join CareLink+ and connect with trusted care services in just a few simple steps.
      </p>

      <div className="mt-6">
        <AccountTypeSelector
          value={accountType}
          onChange={setAccountType}
        />
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 space-y-4">

        {/* Name */}

        <div className="relative">

          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10"
          />

        </div>

        {/* Email */}

        <div className="relative">

          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10"
          />

        </div>

        {/* Phone */}

        <div className="relative">

          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10"
          />

        </div>

        <PasswordInput
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

      </div>

      {/* Security */}

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#D6E4FF] bg-[#F8FAFC] p-3">

        <ShieldCheck className="mt-0.5 h-4.5 w-4.5 text-[#003898]" />

        <p className="text-sm text-[#64748B]">
          Your personal information is securely encrypted and protected at every step.
        </p>

      </div>

      {/* Button */}

      <button
        type="submit"
        disabled={loading}
className="
mt-6
h-12
w-full
rounded-xl
bg-[#003898]
text-sm
font-semibold
text-white
shadow-sm
transition-colors
duration-200
hover:bg-[#002E7A]
focus:outline-none
focus:ring-2
focus:ring-[#003898]/20
focus:ring-offset-2
disabled:cursor-not-allowed
disabled:opacity-60
"      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div className="mt-6">
        <RegisterSocialLogin />
      </div>

      <p className="mt-6 text-center text-sm text-[#64748B]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#003898] hover:text-[#002E7A]"
        >
          Sign In
        </Link>
      </p>

    </form>
  );
}