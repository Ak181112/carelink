"use client";

import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
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
      setError(
        err instanceof Error ? err.message : "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Icon */}

      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF]">
          <Lock className="h-8 w-8 text-[#003898]" />
        </div>
      </div>

      {/* Heading */}

      <h1 className="text-center text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
        Forgot Password
      </h1>

      {/* Subtitle */}

      <p className="mt-3 text-center text-base leading-7 text-[#64748B]">
        Enter your registered email address and we&apos;ll send you a secure
        password reset link.
      </p>

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Email */}

      <div className="mt-8">
        <label className="mb-2 block text-base font-semibold text-[#334155]">
          Email
        </label>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-12 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {/* Reset Info */}

      <div className="mt-5">
        <ResetInfoCard />
      </div>

      {/* Submit */}

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
        "
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </span>
        ) : (
          "Send Reset Link"
        )}
      </button>

      {/* Divider */}

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Back */}

      <BackToLoginButton />

      {/* Bottom */}

      <p className="mt-6 text-center text-sm text-[#64748B]">
        Remember your password?{" "}
        <a
          href="/login"
          className="font-semibold text-[#003898] hover:text-[#002E7A]"
        >
          Log In
        </a>
      </p>
    </form>
  );
}