"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { bookingAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { Booking } from "@/types";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  formatBookingDate,
  formatLkr,
  nameOf,
  parentNameOf,
} from "@/lib/bookingUtils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "New Requests" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function CaretakerBookingsContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") ?? "",
  );
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [otpFor, setOtpFor] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const fetchBookings = useCallback(
    () => bookingAPI.getAssigned(statusFilter || undefined),
    [statusFilter],
  );

  const { data, loading, reload } = useApiData(fetchBookings);
  const bookings: Booking[] = data?.bookings ?? [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const act = async (id: string, run: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await run();
      showToast(success);
      reload();
      return true;
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Action failed");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Why are you declining this booking?");
    if (reason === null) return;

    if (!reason.trim()) {
      showToast("A reason is required to decline a booking");
      return;
    }

    act(id, () => bookingAPI.reject(id, reason), "Booking declined");
  };

  const handleStart = async (id: string) => {
    if (otp.trim().length !== 6) {
      showToast("Enter the 6-digit OTP the client gives you at pickup");
      return;
    }

    const ok = await act(id, () => bookingAPI.start(id, otp.trim()), "Visit started");
    if (ok) {
      setOtpFor(null);
      setOtp("");
    }
  };

  const handleEmergency = (id: string) => {
    const message = prompt("Describe the emergency. Admins will be alerted immediately.");
    if (!message?.trim()) return;

    act(id, () => bookingAPI.triggerEmergency(id, message), "Emergency reported");
  };

  return (
    <div>
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-[#091E42] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">My Bookings</h1>
        <p className="mt-1 text-[#42526E]">
          Hospital visits clients have requested from you.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              statusFilter === f.value
                ? "bg-[#0052CC] text-white"
                : "border border-[#DFE1E6] bg-white text-[#42526E] hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#42526E]">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-16 text-center">
          <span className="text-6xl">📅</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">No bookings here</h3>
          <p className="mt-2 text-[#42526E]">
            Stay marked available so clients can find and book you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const parentProfile =
              typeof b.parentProfileId === "object" ? b.parentProfileId : null;

            return (
              <div key={b._id} className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#091E42]">
                      {b.hospitalLocation.hospitalName}
                    </h3>
                    <p className="mt-0.5 text-sm text-[#42526E]">
                      For {parentNameOf(b.parentProfileId)} · booked by {nameOf(b.parentId)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.emergencyTriggered && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        🚨 Emergency
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-[#6B7280]">Date &amp; time</p>
                    <p className="font-medium text-[#091E42]">
                      {formatBookingDate(b.bookingDate)}, {b.bookingTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Duration</p>
                    <p className="font-medium text-[#091E42]">{b.estimatedHours} hours</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">You earn</p>
                    <p className="font-medium text-[#091E42]">{formatLkr(b.caretakerCharge)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Client pays</p>
                    <p className="font-bold text-[#091E42]">{formatLkr(b.totalCost)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-sm text-[#42526E]">
                  <p>
                    <span className="font-medium text-[#091E42]">Pickup:</span>{" "}
                    {b.pickupLocation.address}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium text-[#091E42]">Hospital:</span>{" "}
                    {b.hospitalLocation.address}
                  </p>
                  {parentProfile?.contactNumber && (
                    <p className="mt-1">
                      <span className="font-medium text-[#091E42]">Contact:</span>{" "}
                      {parentProfile.contactNumber}
                    </p>
                  )}
                  {parentProfile?.medicalConditions && (
                    <p className="mt-1">
                      <span className="font-medium text-[#091E42]">Medical:</span>{" "}
                      {parentProfile.medicalConditions}
                    </p>
                  )}
                  {b.notes && (
                    <p className="mt-1">
                      <span className="font-medium text-[#091E42]">Notes:</span> {b.notes}
                    </p>
                  )}
                </div>

                {otpFor === b._id && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-[#EEF4FF] p-4">
                    <label className="mb-2 block text-sm font-medium text-[#091E42]">
                      Ask the client for their 6-digit pickup OTP
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        placeholder="000000"
                        className="h-11 w-40 rounded-xl border border-[#DFE1E6] px-4 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-[#0052CC]"
                      />
                      <button
                        onClick={() => handleStart(b._id)}
                        disabled={busyId === b._id}
                        className="h-11 rounded-xl bg-[#0052CC] px-5 text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60"
                      >
                        Verify &amp; Start
                      </button>
                      <button
                        onClick={() => { setOtpFor(null); setOtp(""); }}
                        className="h-11 rounded-xl border border-[#DFE1E6] px-5 text-sm font-medium text-[#42526E] hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => act(b._id, () => bookingAPI.accept(b._id), "Booking accepted")}
                        disabled={busyId === b._id}
                        className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleReject(b._id)}
                        disabled={busyId === b._id}
                        className="rounded-xl border border-red-200 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        ❌ Decline
                      </button>
                    </>
                  )}

                  {b.status === "accepted" && otpFor !== b._id && (
                    <button
                      onClick={() => { setOtpFor(b._id); setOtp(""); }}
                      className="rounded-xl bg-[#0052CC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0747A6]"
                    >
                      🚗 Start Visit (enter OTP)
                    </button>
                  )}

                  {b.status === "in_progress" && (
                    <button
                      onClick={() => act(b._id, () => bookingAPI.complete(b._id), "Visit completed")}
                      disabled={busyId === b._id}
                      className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      🏁 Complete Visit
                    </button>
                  )}

                  {["accepted", "in_progress"].includes(b.status) && !b.emergencyTriggered && (
                    <button
                      onClick={() => handleEmergency(b._id)}
                      disabled={busyId === b._id}
                      className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      🚨 Report Emergency
                    </button>
                  )}
                </div>

                {b.status === "completed" && (
                  <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    Completed in {b.durationMinutes} minutes · payment {b.paymentStatus}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CaretakerBookingsPage() {
  // the dashboard links here with ?status=pending, which is client-only state
  return (
    <Suspense
      fallback={<div className="py-16 text-center text-[#42526E]">Loading bookings...</div>}
    >
      <CaretakerBookingsContent />
    </Suspense>
  );
}
