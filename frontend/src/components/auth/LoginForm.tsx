"use client";

import { useState } from "react";
import Link from "next/link";
import SocialLogin from "./SocialLogin";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="w-full">
      <h1 className="mb-4 text-[42px] font-bold leading-12 text-[#091E42]">
        Welcome back
      </h1>

      <p className="mb-10 text-[18px] leading-8 text-[#42526E]">
        Log in to your CareLink+ account
        <br />
        and continue where you left off.
      </p>

      {/* Email */}
      <div className="mb-6">
        <label className="mb-3 block text-base font-semibold text-[#091E42]">
          Email
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          className="
            h-14
            w-full
            rounded-2xl
            border
            border-[#DFE1E6]
            px-6
            text-base
            outline-none
            transition
            focus:border-[#0052CC]
          "
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label className="mb-3 block text-base font-semibold text-[#091E42]">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="
              h-14
              w-full
              rounded-2xl
              border
              border-[#DFE1E6]
              px-6
              text-base
              outline-none
              transition
              focus:border-[#0052CC]
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-5
              top-1/2
              -translate-y-1/2
              text-[#42526E]
            "
          >
            👁️
          </button>
        </div>
      </div>

      {/* Remember me */}
      <div className="mb-8 flex items-center justify-between">
        <label className="flex items-center gap-3 text-[#42526E]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="h-5 w-5 accent-[#0052CC]"
          />

          Remember me
        </label>

        <Link
          href="/forgot-password"
          className="font-medium text-[#0052CC]"
        >
          Forgot password?
        </Link>
      </div>

      {/* Login Button */}
      <button
        className="
          mb-10
          h-14
          w-full
          rounded-2xl
          bg-[#0052CC]
          text-base
          font-semibold
          text-white
          transition
          hover:bg-[#0747A6]
        "
      >
        Log in →
      </button>

      <SocialLogin />

      <p className="text-center text-base text-[#42526E]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#0052CC]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}