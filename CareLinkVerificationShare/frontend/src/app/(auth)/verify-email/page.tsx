"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    authAPI.verifyEmail(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/email-verified"), 2000);
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      });
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
