"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="w-full">

      {/* Icon */}

      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF]">
          <Lock className="h-8 w-8 text-[#003898]" />
        </div>
      </div>

      {/* Heading */}

      <h1 className="text-center text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
        Reset Password
      </h1>

      {/* Subtitle */}

      <p className="mx-auto mt-3 max-w-md text-center text-base leading-7 text-[#64748B]">
        Create a strong new password for your account.
      </p>

      {/* New Password */}

      <div className="mt-8">

        <label className="mb-2 block text-base font-semibold text-[#334155]">
          New Password
        </label>

        <div className="relative">

          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-[#F8FAFC]
              pl-12
              pr-12
              text-sm
              outline-none
              transition
              focus:border-[#003898]
              focus:ring-2
              focus:ring-[#003898]/10
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
              transition-colors
              duration-200
              hover:text-[#003898]
            "
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>

        </div>

      </div>

      {/* Confirm Password */}

      <div className="mt-5">

        <label className="mb-2 block text-base font-semibold text-[#334155]">
          Confirm Password
        </label>

        <div className="relative">

          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-[#F8FAFC]
              pl-12
              pr-12
              text-sm
              outline-none
              transition
              focus:border-[#003898]
              focus:ring-2
              focus:ring-[#003898]/10
            "
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
              transition-colors
              duration-200
              hover:text-[#003898]
            "
          >
            {showConfirm ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>

        </div>

      </div>

      {/* Password Rules */}

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#D6E4FF] bg-[#F8FAFC] p-3">

  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003898]" />

  <p className="text-sm text-[#64748B]">
    Password should contain at least 8 characters, including uppercase,
    lowercase, a number, and a special character.
  </p>

</div>

      {/* Reset Button */}

      <button
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
        "
      >
        Reset Password
      </button>

      {/* Divider */}

      <div className="my-6 flex items-center gap-4">

        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-sm text-slate-500">
          or
        </span>

        <div className="h-px flex-1 bg-slate-200" />

      </div>

      {/* Back */}

      <Link
        href="/login"
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-slate-200
          bg-white
          text-sm
          font-semibold
          text-[#003898]
          transition-colors
          duration-200
          hover:bg-[#F8FAFC]
          hover:border-[#003898]
          focus:outline-none
          focus:ring-2
          focus:ring-[#003898]/20
          focus:ring-offset-2
        "
      >
        ← Back to Login
      </Link>

    </div>
  );
}