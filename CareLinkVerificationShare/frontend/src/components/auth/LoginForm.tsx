"use client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import SocialLogin from "./SocialLogin";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">

<h1 className="-mt-2 mb-4 text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
  Welcome Back
</h1>

      <p className="mb-6 text-base leading-7 text-[#64748B]">
Sign in to your CareLink+ account to continue.      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Email */}

      <div className="mb-4">
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
      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-4 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10"
    />
  </div>
</div>

      {/* Password */}

      <div className="mb-6">
  <label className="mb-2 block text-base font-semibold text-[#334155]">
    Password
  </label>

  <div className="relative">

    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

    <input
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-12 text-sm outline-none transition focus:border-[#003898] focus:ring-2 focus:ring-[#003898]/10"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#003898]"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>

  </div>
</div>

      {/* Remember */}

      <div className="mb-6 flex items-center justify-between">

        <label className="flex items-center gap-2 text-sm text-[#64748B]">

          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="h-4 w-4 accent-[#003898]"
          />

          Remember me

        </label>

        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#003898] hover:text-[#002E7A]"
        >
          Forgot password?
        </Link>

      </div>

      {/* Login */}

      <button
        type="submit"
        disabled={loading}
        className="
  mb-4
  h-12
  w-full
  rounded-xl
  bg-[#003898]
  text-sm
  font-semibold
  text-white
  shadow-lg
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
        {loading ? "Logging in..." : "Log In"}
      </button>

      {/* Social */}

      <div className="mb-4">
        <SocialLogin />
      </div>

      {/* Signup */}

      <p className="text-center text-sm text-[#64748B]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#003898] hover:text-[#002E7A]"
        >
          Sign Up
        </Link>
      </p>

    </form>
  );
}