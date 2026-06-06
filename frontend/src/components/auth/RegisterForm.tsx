"use client";

import { useState } from "react";
import Link from "next/link";
import AccountTypeSelector from "./AccountTypeSelector";
import PasswordInput from "./PasswordInput";
import RegisterSocialLogin from "./RegisterSocialLogin";

export default function RegisterForm() {
  const [accountType, setAccountType] =
    useState("family");

  return (
    <div>

      <h1 className="text-[52px] font-bold text-[#091E42]">
        Create your account
      </h1>

      <p className="mt-3 text-lg text-[#6B7280]">
        Join CareLink+ and get started in just a few simple steps.
      </p>

      <div className="mt-8">
        <AccountTypeSelector
          value={accountType}
          onChange={setAccountType}
        />
      </div>

      <div className="mt-8 space-y-4">

        <input
          placeholder="Enter your full name"
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5"
        />

        <input
          placeholder="Enter your email address"
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5"
        />

        <input
          placeholder="Enter your phone number"
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5"
        />

        <PasswordInput placeholder="Create a password" />

        <PasswordInput placeholder="Confirm your password" />

      </div>

      <div className="mt-4 rounded-2xl bg-[#F4F8FF] p-4 text-sm text-[#42526E]">
        🔒 Your data is encrypted and never shared with third parties.
      </div>

      <button
        className="
          mt-6
          h-16
          w-full
          rounded-2xl
          bg-[#0052FF]
          text-xl
          font-semibold
          text-white
          hover:bg-[#003FC7]
        "
      >
        Create account →
      </button>

      <RegisterSocialLogin />

      <p className="mt-8 text-center text-[#42526E]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0052FF]"
        >
          Sign in
        </Link>
      </p>

    </div>
  );
}