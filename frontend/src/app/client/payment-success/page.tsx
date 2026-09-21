"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Printer } from "lucide-react";
import { paymentAPI } from "@/services/api";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [payment, setPayment] = useState<any>(null);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const sessionId = params.get("session_id");
    const booking = params.get("booking_id") || "";
    setBookingId(booking);
    if (!sessionId) {
      setStatus("failed");
      return;
    }
    paymentAPI.confirmSession(sessionId)
      .then((data) => {
        setPayment(data.payment);
        setStatus(data.payment?.status === "paid" ? "paid" : "pending");
      })
      .catch(() => setStatus("failed"));
  }, [params]);

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
        {status === "checking" && (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto animate-spin text-[#003898]" size={42} />
            <h1 className="mt-5 text-2xl font-extrabold">Confirming your payment...</h1>
          </div>
        )}

        {status === "paid" && (
          <div>
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={58} />
              <h1 className="mt-4 text-2xl font-extrabold">Payment successful</h1>
              <p className="mt-1 text-slate-500">Your CareLink+ service payment is confirmed.</p>
            </div>
            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <div className="flex justify-between gap-4 border-b pb-3">
                <span className="text-slate-500">Receipt</span>
                <span className="font-mono font-bold">{payment?.receiptNumber}</span>
              </div>
              <div className="mt-4 flex justify-between gap-4">
                <span className="text-slate-500">Amount</span>
                <span className="text-xl font-extrabold text-[#003898]">
                  {payment?.currency} {Number(payment?.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span className="text-slate-500">Paid at</span>
                <span className="font-medium">
                  {payment?.paidAt ? new Date(payment.paidAt).toLocaleString() : "-"}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold">
                <Printer size={18} /> Print receipt
              </button>
              <button onClick={() => router.push(`/client/feedback?bookingId=${bookingId}`)} className="rounded-xl bg-[#003898] py-3 font-semibold text-white">
                Continue to feedback
              </button>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">Payment is processing</h1>
            <p className="mt-2 text-slate-500">Stripe has not yet returned a final payment status.</p>
            <button onClick={() => router.push(`/client/booking-status?bookingId=${bookingId}`)} className="mt-6 rounded-xl border border-[#003898] px-6 py-3 font-semibold text-[#003898]">View booking</button>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">Payment confirmation failed</h1>
            <p className="mt-2 text-slate-500">Your booking is unchanged. You can try payment again.</p>
            <button onClick={() => router.push(`/client/booking-status?bookingId=${bookingId}`)} className="mt-6 rounded-xl bg-[#003898] px-6 py-3 font-semibold text-white">Back to booking</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
