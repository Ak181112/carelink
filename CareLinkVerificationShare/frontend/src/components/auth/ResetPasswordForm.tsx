"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/services/api";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset link");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      router.push("/password-reset-success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Icon */}
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#F4F8FF]">
        <Lock className="h-14 w-14 text-[#0052CC]" />
      </div>

      {/* Heading */}
      <h1 className="mb-4 text-[52px] font-bold leading-tight text-[#091E42]">
        Reset password
      </h1>

      <p className="mb-10 text-[20px] leading-relaxed text-[#42526E]">
        Create a new password for your account.
      </p>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* New Password */}
      <div className="mb-6">
        <label className="mb-3 block font-semibold text-[#091E42]">
          New password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="
              h-16
              w-full
              rounded-2xl
              border
              border-[#DFE1E6]
              px-14
              outline-none
              focus:border-[#0052CC]
            "
          />

          <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="mb-8">
        <label className="mb-3 block font-semibold text-[#091E42]">
          Confirm password
        </label>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="
              h-16
              w-full
              rounded-2xl
              border
              border-[#DFE1E6]
              px-14
              outline-none
              focus:border-[#0052CC]
            "
          />

          <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-5 top-1/2 -translate-y-1/2"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Password Rules */}
      <div className="mb-8 rounded-2xl bg-[#F4F8FF] p-5">
        <p className="text-[#42526E]">
          Password must be at least 6 characters.
        </p>
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="
          mb-5
          h-16
          w-full
          rounded-2xl
          bg-[#0052CC]
          text-lg
          font-semibold
          text-white
          transition
          hover:bg-[#003898]
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        {loading ? "Resetting..." : "Reset Password →"}
      </button>

      <Link
        href="/login"
        className="
          flex
          h-16
          items-center
          justify-center
          rounded-2xl
          border
          border-[#DFE1E6]
          text-[#0052CC]
          font-medium
        "
      >
        ← Back to Login
      </Link>

    </form>
  );
}