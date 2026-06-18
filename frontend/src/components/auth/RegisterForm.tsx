"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added for routing
import AccountTypeSelector from "./AccountTypeSelector";
import PasswordInput from "./PasswordInput";
import RegisterSocialLogin from "./RegisterSocialLogin";

export default function RegisterForm() {
  const router = useRouter(); // Initialize the router
  const [accountType, setAccountType] = useState("family");

  // Watch the account type selection. If they choose "caretaker", push them to firstpage #form-section
  useEffect(() => {
    if (accountType === "caretaker") {
      router.push("/caretakers/firstpage#form-section");
    }
  }, [accountType, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Your submit logic for "family" / regular clients
    console.log("Submitting regular client account configuration.");
  };

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

      {/* Wrap input elements inside a form block for handling non-caretaker signups */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          placeholder="Enter your full name"
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5 text-slate-800 focus:outline-none focus:border-[#0052FF]"
        />

        <input
          placeholder="Enter your email address"
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5 text-slate-800 focus:outline-none focus:border-[#0052FF]"
          type="email"
        />

        <input
          placeholder="Enter your phone number"
          className="h-14 w-full rounded-2xl border border-[#DFE1E6] px-5 text-slate-800 focus:outline-none focus:border-[#0052FF]"
          type="tel"
        />

        <PasswordInput placeholder="Create a password" />

        <PasswordInput placeholder="Confirm your password" />

        <div className="mt-4 rounded-2xl bg-[#F4F8FF] p-4 text-sm text-[#42526E]">
          🔒 Your data is encrypted and never shared with third parties.
        </div>

        <button
          type="submit"
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
            transition-colors
          "
        >
          Create account →
        </button>
      </form>

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