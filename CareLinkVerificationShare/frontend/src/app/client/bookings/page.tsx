"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { bookingAPI, paymentAPI } from "@/services/api";
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
import NewBookingForm from "@/components/booking/NewBookingForm";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

/**
 * PayHere's checkout is a signed form POST rather than a plain redirect, so the
 * browser has to submit the exact fields the server signed. Lives outside the
 * component because touching the DOM is not something React may do in render.
 */
const postToPayHere = (action: string, fields: Record<string, string>) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
};

function ClientBookingsContent() {
  const searchParams = useSearchParams();
  // ?caretaker=<id> arrives from the "Book this caretaker" button
  const [creatingFor, setCreatingFor] = useState<string | null>(
    () => searchParams.get("caretaker"),
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // PayHere sends the browser back with ?payment=success|cancelled
  const [toast, setToast] = useState(() => {
    const outcome = searchParams.get("payment");
    if (outcome === "success") return "Payment received. Thank you!";
    if (outcome === "cancelled") return "Payment cancelled — the booking is unchanged.";
    return "";
  });

  const fetchBookings = useCallback(
    () => bookingAPI.getMine(statusFilter || undefined),
    [statusFilter],
  );

  const { data, loading, reload } = useApiData(fetchBookings);
  const bookings: Booking[] = data?.bookings ?? [];

  const fetchPaymentConfig = useCallback(() => paymentAPI.getConfig(), []);
  const { data: paymentConfig } = useApiData(fetchPaymentConfig);
  const cardPaymentsEnabled: boolean = paymentConfig?.payhereEnabled ?? false;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleCancel = async (booking: Booking) => {
    const reason = prompt("Why are you cancelling this booking?");
    if (reason === null) return;

    setBusyId(booking._id);
    try {
      await bookingAPI.cancel(booking._id, reason);
      showToast("Booking cancelled");
      reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setBusyId(null);
    }
  };

  const handlePay = async (booking: Booking) => {
    setBusyId(booking._id);
    try {
      const { action, fields } = await paymentAPI.createCheckout(booking._id);
      // hands the browser over to PayHere's hosted checkout
      postToPayHere(action, fields);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Could not start the payment");
      setBusyId(null);
    }
  };

  const handleEmergency = async (booking: Booking) => {
    const message = prompt("Describe the emergency. Admins will be alerted immediately.");
    if (!message?.trim()) return;

    setBusyId(booking._id);
    try {
      await bookingAPI.triggerEmergency(booking._id, message);
      showToast("Emergency reported. An admin has been alerted.");
      reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to report");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-[#091E42] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#091E42]">My Bookings</h1>
          <p className="mt-1 text-[#42526E]">
            Hospital visits you have arranged for your family.
          </p>
        </div>

        <button
          onClick={() => setCreatingFor("")}
          className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0747A6]"
        >
          + New Booking
        </button>
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
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">No bookings yet</h3>
          <p className="mt-2 text-[#42526E]">
            Find an approved caretaker and arrange a hospital visit.
          </p>
          <Link
            href="/client/caretakers"
            className="mt-6 inline-block rounded-xl bg-[#0052CC] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0747A6]"
          >
            Find Caretakers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#091E42]">
                    {b.hospitalLocation.hospitalName}
                  </h3>
                  <p className="mt-0.5 text-sm text-[#42526E]">
                    For {parentNameOf(b.parentProfileId)} · with {nameOf(b.caretakerId)}
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
                  <p className="text-xs text-[#6B7280]">Distance</p>
                  <p className="font-medium text-[#091E42]">{b.roadDistanceKm} km</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Total</p>
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
                {b.notes && (
                  <p className="mt-1">
                    <span className="font-medium text-[#091E42]">Notes:</span> {b.notes}
                  </p>
                )}
              </div>

              {b.status === "accepted" && b.pickupOtp && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-[#EEF4FF] p-4">
                  <p className="text-sm text-[#42526E]">
                    Read this pickup OTP to the caretaker when they arrive. It proves they
                    collected {parentNameOf(b.parentProfileId)}.
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold tracking-[0.3em] text-[#0052CC]">
                    {b.pickupOtp}
                  </p>
                </div>
              )}

              {b.status === "rejected" && b.rejectedReason && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <strong>Declined:</strong> {b.rejectedReason}
                </div>
              )}

              {b.status === "completed" && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                  <span>
                    Visit finished in {b.durationMinutes} minutes · payment {b.paymentStatus}
                  </span>
                  {typeof b.caretakerId === "object" && (
                    <Link
                      href="/client/caretakers"
                      className="font-semibold text-[#0052CC] hover:underline"
                    >
                      Rate this caretaker →
                    </Link>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {["in_progress", "completed"].includes(b.status) &&
                  b.paymentStatus === "pending" &&
                  (cardPaymentsEnabled ? (
                    <button
                      onClick={() => handlePay(b)}
                      disabled={busyId === b._id}
                      className="rounded-xl bg-[#0052CC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60"
                    >
                      {busyId === b._id
                        ? "Opening checkout..."
                        : `💳 Pay ${formatLkr(b.totalCost)}`}
                    </button>
                  ) : (
                    <span className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-[#42526E]">
                      Pay {formatLkr(b.totalCost)} in cash to the caretaker
                    </span>
                  ))}

                {["pending", "accepted"].includes(b.status) && (
                  <button
                    onClick={() => handleCancel(b)}
                    disabled={busyId === b._id}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Cancel Booking
                  </button>
                )}

                {["accepted", "in_progress"].includes(b.status) && !b.emergencyTriggered && (
                  <button
                    onClick={() => handleEmergency(b)}
                    disabled={busyId === b._id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    🚨 Report Emergency
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {creatingFor !== null && (
        <NewBookingForm
          presetCaretakerId={creatingFor || undefined}
          onClose={() => setCreatingFor(null)}
          onCreated={() => {
            setCreatingFor(null);
            showToast("Booking request sent to the caretaker");
            reload();
          }}
        />
      )}
    </div>
  );
}

export default function ClientBookingsPage() {
  // reads ?caretaker= from the query string, which is client-only
  return (
    <Suspense
      fallback={<div className="py-16 text-center text-[#42526E]">Loading bookings...</div>}
    >
      <ClientBookingsContent />
    </Suspense>
  );
}
