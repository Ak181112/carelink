"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import ResetInfoCard from "./ResetInfoCard";
import BackToLoginButton from "./BackToLoginButton";
import { authAPI } from "@/services/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      router.push("/reset-link-sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[700px] rounded-[28px] bg-white p-14 shadow-sm border border-[#E5E7EB]">
      <div className="mb-8 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#EEF4FF]">
          <Lock className="h-12 w-12 text-[#003898]" />
        </div>
      </div>

      <h1 className="text-center text-[54px] font-bold text-[#091E42]">
        Forgot your password?
      </h1>

      <p className="mx-auto mt-4 max-w-[500px] text-center text-lg text-[#6B7280]">
        No worries! Enter your email address and we&apos;ll
        send you a link to reset your password.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <div className="mt-10">
        <label className="mb-3 block font-semibold text-[#091E42]">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-16 w-full rounded-2xl border border-[#DFE1E6] pl-14 pr-5 outline-none focus:border-[#0052CC]"
          />
        </div>
      </div>

      <div className="mt-6">
        <ResetInfoCard />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 h-16 w-full rounded-2xl bg-[#0052CC] text-lg font-semibold text-white transition hover:bg-[#003898] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send reset link →"}
      </button>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[#6B7280]">or</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <BackToLoginButton />

      <p className="mt-8 text-center text-[#6B7280]">
        Remember your password?{" "}
        <a href="/login" className="font-semibold text-[#0052CC]">Log in</a>
      </p>
    </form>
  );
}
