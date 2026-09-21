"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import { authAPI } from "@/services/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    authAPI
      .verifyEmail(token)
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
    <main className="flex min-h-screen items-center justify-center bg-white">

      <div className="w-full max-w-[520px] px-6 py-8 sm:px-8">

        {/* Loading */}

        {status === "loading" && (
          <div className="text-center">

            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF]">
                <Loader2 className="h-8 w-8 animate-spin text-[#003898]" />
              </div>
            </div>

            <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
              Verifying Your Email
            </h1>

            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#64748B]">
              Please wait while we securely verify your email address.
            </p>

          </div>
        )}

        {/* Success */}

        {status === "success" && (
          <div className="text-center">

            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CircleCheckBig className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
              Email Verified
            </h1>

            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#64748B]">
              Your email has been verified successfully.
              Redirecting you to the next step...
            </p>

          </div>
        )}

        {/* Error */}

        {status === "error" && (
          <div className="text-center">

            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <CircleX className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight text-[#00245E]">
              Verification Failed
            </h1>

            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#64748B]">
              {message}
            </p>

            <Link
              href="/login"
              className="
                mt-8
                flex
                h-12
                w-full
                items-center
                justify-center
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
              Go to Login
            </Link>

          </div>
        )}

      </div>

    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}