"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // A missing token is known during render, so it is the initial state rather
  // than something an effect has to set after the first paint
  const [result, setResult] = useState<{
    status: "loading" | "success" | "error";
    message: string;
  }>(() =>
    token
      ? { status: "loading", message: "" }
      : { status: "error", message: "Invalid verification link" },
  );

  const { status, message } = result;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    authAPI.verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setResult({ status: "success", message: "" });
        setTimeout(() => router.push("/email-verified"), 2000);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setResult({
          status: "error",
          message: err.message || "Verification failed",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="max-w-md w-full mx-4 bg-white rounded-3xl p-12 shadow-sm border border-[#DFE1E6] text-center">
        {status === "loading" && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 mx-auto mb-6">
              <div className="h-10 w-10 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#091E42]">Verifying your email...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50 mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-[#091E42]">Email Verified!</h1>
            <p className="mt-3 text-[#42526E]">Redirecting to login...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
              <span className="text-5xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-[#091E42]">Verification Failed</h1>
            <p className="mt-3 text-[#42526E]">{message}</p>
            <Link href="/login" className="mt-6 inline-block rounded-2xl bg-[#0052CC] px-8 py-3 text-white font-semibold">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  // the verification token lives in the query string, which is client-only,
  // so this page cannot be prerendered without a Suspense boundary
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="max-w-md w-full mx-4 bg-white rounded-3xl p-12 shadow-sm border border-[#DFE1E6] text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 mx-auto mb-6">
              <div className="h-10 w-10 border-4 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#091E42]">Verifying your email...</h1>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
