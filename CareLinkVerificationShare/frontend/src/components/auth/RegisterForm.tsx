"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AccountTypeSelector from "./AccountTypeSelector";
import PasswordInput from "./PasswordInput";
import RegisterSocialLogin from "./RegisterSocialLogin";
import { useAuth } from "@/contexts/AuthContext";

import { formatPhoneNumber, isValidPhoneNumber } from "@/lib/phoneUtils";
import { formatName, formatEmail } from "@/lib/inputUtils";

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

    if (phone && !isValidPhoneNumber(phone)) {
      setError("Phone number must be a 10-digit Sri Lankan number starting with 07 (e.g. 0712345678)");
      return;
    }
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
      await register({ name, email, password, phone, role: accountType });
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => router.push("/verification-sent"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-[52px] font-bold text-[#091E42]">
        Create your account
      </h1>

      <p className="mt-3 text-lg text-[#6B7280]">
        Join CareLink+ and get started in just a few simple steps.
      </p>

      <div className="mt-8">
        <AccountTypeSelector value={accountType} onChange={setAccountType} />
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <input
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(formatName(e.target.value))}
          required
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5"
        />
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(formatEmail(e.target.value))}
          required
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5"
        />
        <input
          type="tel"
          placeholder="Phone number (e.g. 0712345678)"
          value={phone}
          maxLength={10}
          onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5"
        />
        <PasswordInput
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-[#F4F8FF] p-4 text-sm text-[#42526E]">
        🔒 Your data is encrypted and never shared with third parties.
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-16 w-full rounded-2xl bg-[#0052FF] text-xl font-semibold text-white hover:bg-[#003FC7] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create account →"}
      </button>

      <RegisterSocialLogin />

      <p className="mt-8 text-center text-[#42526E]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#0052FF]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
