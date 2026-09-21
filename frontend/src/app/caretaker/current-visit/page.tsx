"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { bookingAPI, emergencyAPI } from "@/services/api";

const stages = [
  ["task_started", "Task Started"],
  ["at_hospital", "At Hospital"],
  ["consultation_completed", "Consultation Completed"],
  ["back_to_home", "Back to Home"],
  ["task_completed", "Task Completed"],
] as const;

function CurrentVisitContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");
  const [booking, setBooking] = useState<any>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [emergency, setEmergency] = useState(false);

  const load = async () => {
    if (!bookingId) return;
    try {
      const d = await bookingAPI.get(bookingId);
      setBooking(d.booking);
    } catch (e: any) {
      setMessage(e.message);
    }
  };
  useEffect(() => {
    load();
  }, [bookingId]);

  const verify = async () => {
    setBusy(true);
    setMessage("");
    try {
      const d = await bookingAPI.verifyOtp(booking._id, code);
      setBooking(d.booking);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const triggerEmergency = async () => {
    setBusy(true);
    try {
      await emergencyAPI.trigger({
        bookingId: booking._id,
        message: "Caretaker requested emergency assistance.",
      });
      setEmergency(true);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const advance = async (stage: string) => {
    setBusy(true);
    setMessage("");
    try {
      const d = await bookingAPI.updateProgress(booking._id, stage);
      setBooking(d.booking);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!bookingId)
    return (
      <div className="p-8">Open a current booking from the Bookings page.</div>
    );
  if (!booking)
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-[#003898]" />
      </div>
    );

  const progress = booking.progress?.stages || [];
  const currentIndex = progress.findIndex(
    (s: any) => s.status === "in_progress",
  );
  const nextStage =
    currentIndex >= 0
      ? stages[currentIndex + 1]
      : booking.caretakerCompletedAt
        ? undefined
        : stages[0];
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <main className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Current hospital visit
          </h1>
          <p className="text-slate-500 mt-1">
            Complete each operational stage in order.
          </p>
        </div>

        {booking.status === "accepted" && !booking.otp?.verifiedAt && (
          <div className="rounded-2xl bg-white border shadow-sm p-5 sm:p-7">
            <h2 className="text-xl font-bold flex gap-2 items-center">
              <ShieldCheck className="text-[#003898]" />
              Secure job start
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Enter the 6-digit OTP provided by the family member to verify the
              booking and start the hospital visit.
            </p>

            <div className="mt-5 max-w-md space-y-3">
              <div>
                <label
                  htmlFor="job-otp"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Family member OTP
                </label>

                <input
                  id="job-otp"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center tracking-[0.4em] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#003898]"
                />
              </div>

              <button
                onClick={verify}
                disabled={code.length !== 6 || busy}
                className="w-full rounded-xl bg-emerald-600 text-white py-3 font-semibold disabled:opacity-50"
              >
                {busy ? "Verifying..." : "Verify OTP & Start Task"}
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_330px] gap-6">
          <section className="rounded-2xl bg-white border shadow-sm p-5 sm:p-7">
            <h2 className="text-xl font-bold">Live progress</h2>
            <div className="mt-6 space-y-1">
              {progress.map((s: any, i: number) => (
                <div key={s.key} className="flex items-stretch gap-4">
                  <div className="flex flex-col items-center">
                    {s.status === "completed" ? (
                      <CheckCircle2 size={22} className="text-emerald-600" />
                    ) : s.status === "in_progress" ? (
                      <Clock3 size={22} className="text-[#003898]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                    {i < progress.length - 1 && (
                      <div
                        className={`w-px min-h-12 ${s.status === "completed" ? "bg-emerald-300" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`font-bold ${s.status === "in_progress" ? "text-[#003898]" : "text-slate-900"}`}
                    >
                      {s.label}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {s.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {booking.status === "in_progress" && nextStage && (
              <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="font-semibold text-[#003898]">
                  Next: {nextStage[1]}
                </p>
                <button
                  onClick={() => advance(nextStage[0])}
                  disabled={busy}
                  className="mt-3 rounded-xl bg-[#003898] text-white px-5 py-3 font-semibold"
                >
                  Update progress
                </button>
              </div>
            )}
            {booking.caretakerCompletedAt && (
              <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 p-4">
                You completed your side of the task. Wait for the client to
                confirm completion before payment.
              </div>
            )}
          </section>
          <aside className="space-y-5">
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <p className="text-xs font-bold uppercase text-slate-400">
                Assignment
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-slate-400">Parent</span>
                  <p className="font-semibold">{booking.parentId?.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Hospital</span>
                  <p className="font-semibold">
                    {booking.hospitalSnapshot?.name}
                  </p>
                  <p className="text-slate-500">
                    {booking.hospitalSnapshot?.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <MapPin size={17} className="text-[#003898]" />
                  <p>{booking.pickupLocation?.address}</p>
                </div>
                <a
                  href={`tel:${booking.clientId?.phone || ""}`}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold"
                >
                  <Phone size={17} /> Call family
                </a>
              </div>
            </div>
            <div className="rounded-2xl bg-white border shadow-sm p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Emergency assistance</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Alert the family and administrators immediately.
                  </p>
                  {emergency ? (
                    <p className="mt-3 text-sm font-semibold text-emerald-700">
                      Emergency alert sent.
                    </p>
                  ) : (
                    <button
                      onClick={triggerEmergency}
                      disabled={busy}
                      className="mt-3 rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white"
                    >
                      Trigger emergency alert
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
        {message && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
            {message}
          </div>
        )}
        <button
          onClick={() => router.push("/caretaker/bookings")}
          className="text-[#003898] font-semibold"
        >
          ← Back to bookings
        </button>
      </main>
    </div>
  );
}

export default function CurrentVisitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <CurrentVisitContent />
    </Suspense>
  );
}
