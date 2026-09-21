"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
} from "lucide-react";
import { bookingAPI, paymentAPI } from "@/services/api";

const statusLabel: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};
const bookingStatusLabel: Record<string, string> = {
  requested: "Requested",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
  in_progress: "In progress",
  payment_pending: "Payment pending",
  paid: "Paid",
  closed: "Closed",
};

function BookingStatusContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [otp, setOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [generatingOtp, setGeneratingOtp] = useState(false);

  const load = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    try {
      const data = await bookingAPI.get(bookingId);
      setBooking(data.booking);

      if (data.booking?.otp?.expiresAt) {
        setOtpExpiresAt(data.booking.otp.expiresAt);
      } else {
        setOtpExpiresAt(null);
      }
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateOtp = async () => {
    if (!booking?._id) return;

    setMessage("");
    setGeneratingOtp(true);

    try {
      const data = await bookingAPI.generateOtp(booking._id);

      setOtp(String(data.otp || ""));
      setOtpExpiresAt(data.expiresAt || null);

      // Refresh booking metadata without replacing the displayed OTP.
      const refreshed = await bookingAPI.get(booking._id);
      setBooking(refreshed.booking);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setGeneratingOtp(false);
    }
  };
  useEffect(() => {
    load();
    const i = setInterval(load, 10000);
    return () => clearInterval(i);
  }, [bookingId]);

  const clientCanComplete =
    booking?.caretakerCompletedAt && !booking?.clientCompletedAt;
  // const paymentReady = booking?.status === "payment_pending" && booking?.paymentId;
  const paymentReady = booking?.status === "payment_pending";
  const otpIsVerified = Boolean(booking?.otp?.verifiedAt);

  const otpIsActive =
    Boolean(otpExpiresAt) &&
    new Date(otpExpiresAt as string).getTime() > Date.now() &&
    !otpIsVerified;

  const otpExpired =
    Boolean(otpExpiresAt) &&
    new Date(otpExpiresAt as string).getTime() <= Date.now();

  const confirmCompletion = async () => {
    try {
      const data = await bookingAPI.clientComplete(booking._id);
      setBooking(data.booking);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  // const goPayment = async () => {
  //   if (!booking?.paymentId) return;
  //   setMessage("");
  //   try { const data=await paymentAPI.createCheckout(booking.paymentId); window.location.href=data.url; }
  //   catch(e:any){setMessage(e.message);}
  // };
  const goPayment = async () => {
    if (!booking?._id) return;

    setMessage("");

    try {
      let paymentId = booking.paymentId;

      /*
       * Repair older payment-pending bookings that reached
       * this state before the payment record was created.
       */
      if (!paymentId) {
        const repaired = await bookingAPI.clientComplete(booking._id);

        paymentId = repaired.paymentId || repaired.booking?.paymentId;

        setBooking(repaired.booking);

        if (!paymentId) {
          throw new Error("Unable to prepare the payment for this booking.");
        }
      }

      const data = await paymentAPI.createCheckout(paymentId);

      if (!data?.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = data.url;
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Unable to start payment.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-[#003898]" />
      </div>
    );
  if (!booking)
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto rounded-2xl bg-red-50 p-5 text-red-700">
          {message || "Booking not found."}
        </div>
      </div>
    );

  const stages = booking.progress?.stages || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Hospital visit progress
            </h1>
            <p className="text-slate-500 mt-1">
              You can follow each service stage and confirm final completion.
            </p>
          </div>
          <span className="px-4 py-2 rounded-full bg-white border font-semibold text-slate-700 w-fit">
            {bookingStatusLabel[booking.status] || booking.status}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <section className="rounded-2xl bg-white border shadow-sm p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold">Care progress</h2>
              <button
                onClick={load}
                className="text-sm text-[#003898] font-semibold"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {stages.map((stage: any, index: number) => {
                const done = stage.status === "completed";
                const active = stage.status === "in_progress";
                return (
                  <div key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <CheckCircle2 className="text-emerald-600" />
                      ) : active ? (
                        <Clock3 className="text-[#003898]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                      )}
                      {index < stages.length - 1 && (
                        <div
                          className={`w-px flex-1 min-h-12 ${done ? "bg-emerald-300" : "bg-slate-200"}`}
                        />
                      )}
                    </div>
                    <div className="pb-5">
                      <p
                        className={`font-bold ${active ? "text-[#003898]" : "text-slate-900"}`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {statusLabel[stage.status]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            {booking.status === "accepted" && !otpIsVerified && (
              <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Secure job start
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Caretaker OTP
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Generate the OTP and give it to your caretaker when they
               arrive.
                    </p>
                  </div>
                </div>

                {otp ? (
                  <div className="mt-5">
                    <div className="rounded-2xl border-2 border-[#003898] bg-[#EEF4FF] px-5 py-4 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        Your job OTP
                      </p>

                      <p className="mt-2 text-4xl font-extrabold tracking-[0.35em] text-[#003898]">
                        {otp}
                      </p>

                      {otpExpiresAt && (
                        <p className="mt-2 text-sm font-medium text-slate-600">
                          Valid until{" "}
                          {new Date(otpExpiresAt).toLocaleTimeString("en-LK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    {otpIsActive && (
                      <p className="mt-3 text-xs text-slate-500 text-center">
                        This OTP is active for 15 minutes. A new OTP cannot be
generated until this one expires.
                      </p>
                    )}

                    {otpExpired && (
                      <button
                        type="button"
                        onClick={generateOtp}
                        disabled={generatingOtp}
                        className="mt-4 w-full rounded-xl bg-[#003898] text-white py-3 font-semibold disabled:opacity-60"
                      >
                        {generatingOtp ? "Generating..." : "Generate New OTP"}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={generateOtp}
                    disabled={generatingOtp || otpIsActive}
                    className="mt-5 w-full rounded-xl bg-[#003898] text-white py-3 font-semibold disabled:opacity-60"
                  >
                    {generatingOtp ? "Generating..." : "Generate OTP"}
                  </button>
                )}
              </div>
            )}
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <p className="text-xs font-bold uppercase text-slate-400">
                Visit details
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Parent</p>
                  <p className="font-semibold">{booking.parentId?.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Caretaker</p>
                  <p className="font-semibold">{booking.caretakerId?.name}</p>
                </div>
                <div className="flex gap-2">
                  <MapPin size={17} className="text-[#003898]" />
                  <div>
                    <p className="font-semibold">
                      {booking.hospitalSnapshot?.name}
                    </p>
                    <p className="text-slate-500">
                      {booking.hospitalSnapshot?.address}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400">Pickup</p>
                  <p className="font-semibold">
                    {booking.pickupLocation?.address}
                  </p>
                </div>
              </div>
              <a
                href={`tel:${booking.caretakerId?.phone || ""}`}
                className="mt-5 inline-flex items-center justify-center gap-2 w-full rounded-xl border py-3 font-semibold"
              >
                <Phone size={17} /> Contact caretaker
              </a>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <p className="text-xs font-bold uppercase text-slate-400">
                Price
              </p>
              <p className="text-3xl font-extrabold text-[#003898] mt-2">
                LKR {Number(booking.pricing?.total || 0).toLocaleString()}
              </p>
              <div className="text-sm text-slate-500 mt-2">
                {booking.distanceKm} km · {booking.pricing?.adminFeePercent}%
                admin fee
              </div>
              {clientCanComplete && (
                <button
                  onClick={confirmCompletion}
                  className="mt-5 w-full rounded-xl bg-emerald-600 text-white py-3 font-semibold"
                >
                  Confirm task completed
                </button>
              )}
              {paymentReady && (
                <button
                  onClick={goPayment}
                  className="mt-3 w-full rounded-xl bg-[#003898] text-white py-3 font-semibold flex items-center justify-center gap-2"
                >
                  <CreditCard size={17} /> Pay securely with Stripe
                </button>
              )}
              {booking.status === "paid" && (
                <button
                  onClick={() =>
                    router.push(`/client/feedback?bookingId=${booking._id}`)
                  }
                  className="mt-3 w-full rounded-xl border border-[#003898] text-[#003898] py-3 font-semibold"
                >
                  Continue to feedback
                </button>
              )}
            </div>
          </aside>
        </div>
        {message && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
            {message}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <BookingStatusContent />
    </Suspense>
  );
}
