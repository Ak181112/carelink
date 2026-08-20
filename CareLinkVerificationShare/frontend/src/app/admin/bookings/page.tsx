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
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-gray-200 text-gray-600",
};

function BookingManagementContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") ?? "",
  );
  const [selected, setSelected] = useState<Booking | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const fetchBookings = useCallback(
    () => bookingAPI.getAll(statusFilter || undefined),
    [statusFilter],
  );

  const { data, loading, reload } = useApiData(fetchBookings);
  const bookings: Booking[] = data?.bookings ?? [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const term = search.toLowerCase();
  const filtered = bookings.filter(
    (b) =>
      !term ||
      nameOf(b.parentId, "").toLowerCase().includes(term) ||
      nameOf(b.caretakerId, "").toLowerCase().includes(term) ||
      parentNameOf(b.parentProfileId, "").toLowerCase().includes(term) ||
      b.hospitalLocation.hospitalName.toLowerCase().includes(term) ||
      b._id.toLowerCase().includes(term),
  );

  const handlePayment = async (id: string, paymentStatus: string) => {
    setBusyId(id);
    try {
      await bookingAPI.updatePayment(id, paymentStatus);
      showToast(`Payment marked as ${paymentStatus}`);
      setSelected(null);
      reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update payment");
    } finally {
      setBusyId(null);
    }
  };

  const revenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalCost, 0);

  const emergencies = bookings.filter((b) => b.emergencyTriggered).length;

  return (
    <div>
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-[#091E42] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Booking Management</h1>
        <p className="mt-1 text-[#42526E]">
          Every hospital visit arranged through CareLink+.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total bookings", value: bookings.length, color: "bg-blue-50 text-blue-600" },
          {
            label: "Active now",
            value: bookings.filter((b) => ["accepted", "in_progress"].includes(b.status)).length,
            color: "bg-purple-50 text-purple-600",
          },
          { label: "Collected revenue", value: formatLkr(revenue), color: "bg-green-50 text-green-600" },
          { label: "Emergencies", value: emergencies, color: "bg-red-50 text-red-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#DFE1E6] bg-white p-5">
            <p className={`inline-block rounded-lg px-2 py-0.5 text-xs font-medium ${s.color}`}>
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-[#091E42]">
              {loading ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#DFE1E6] bg-white p-5 sm:flex-row">
        <input
          placeholder="Search by client, caretaker, parent or hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC] sm:w-48"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DFE1E6] bg-white">
        {loading ? (
          <div className="py-16 text-center text-[#42526E]">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-5xl">📅</span>
            <p className="mt-3 text-[#42526E]">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#DFE1E6] bg-[#F8FAFC]">
                <tr>
                  {["Client", "Parent", "Caretaker", "Hospital", "When", "Total", "Payment", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#42526E]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DFE1E6]">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4 font-medium text-[#091E42]">
                      {nameOf(b.parentId)}
                      {b.emergencyTriggered && <span className="ml-1.5">🚨</span>}
                    </td>
                    <td className="px-5 py-4 text-[#42526E]">{parentNameOf(b.parentProfileId)}</td>
                    <td className="px-5 py-4 text-[#42526E]">{nameOf(b.caretakerId)}</td>
                    <td className="px-5 py-4 text-[#42526E]">{b.hospitalLocation.hospitalName}</td>
                    <td className="px-5 py-4 text-xs text-[#42526E]">
                      {formatBookingDate(b.bookingDate)}
                      <br />
                      {b.bookingTime}
                    </td>
                    <td className="px-5 py-4 font-medium text-[#091E42]">
                      {formatLkr(b.totalCost)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STYLES[b.paymentStatus]}`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                      >
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(b)}
                        className="rounded-lg bg-[#0052CC] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0747A6]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="text-xl font-bold text-[#091E42]">Booking Detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5 p-6 text-sm">
              {selected.emergencyTriggered && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <strong>🚨 Emergency reported:</strong> {selected.emergencyMessage}
                </div>
              )}

              <div className="space-y-2">
                {[
                  ["Client", nameOf(selected.parentId)],
                  ["Parent", parentNameOf(selected.parentProfileId)],
                  ["Caretaker", nameOf(selected.caretakerId)],
                  ["Hospital", selected.hospitalLocation.hospitalName],
                  ["Hospital address", selected.hospitalLocation.address],
                  ["Pickup address", selected.pickupLocation.address],
                  ["When", `${formatBookingDate(selected.bookingDate)} at ${selected.bookingTime}`],
                  ["Estimated hours", `${selected.estimatedHours} h`],
                  ["Distance", `${selected.roadDistanceKm} km @ ${formatLkr(selected.ratePerKm)}/km`],
                  ["OTP verified", selected.otpVerified ? "Yes" : "No"],
                  [
                    "Actual duration",
                    selected.durationMinutes ? `${selected.durationMinutes} min` : "—",
                  ],
                  ["Notes", selected.notes || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-[#42526E]">{label}</span>
                    <span className="text-right font-medium text-[#091E42]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-[#F8FAFC] p-4">
                <div className="flex justify-between">
                  <span className="text-[#42526E]">Caretaker charge</span>
                  <span>{formatLkr(selected.caretakerCharge)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-[#42526E]">Service fee</span>
                  <span>{formatLkr(selected.adminServiceFee)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 font-bold text-[#091E42]">
                  <span>Total</span>
                  <span>{formatLkr(selected.totalCost)}</span>
                </div>
              </div>

              {selected.rejectedReason && (
                <div className="rounded-xl bg-red-50 p-3 text-red-700">
                  <strong>Declined:</strong> {selected.rejectedReason}
                </div>
              )}
              {selected.cancelledReason && (
                <div className="rounded-xl bg-gray-100 p-3 text-[#42526E]">
                  <strong>Cancelled:</strong> {selected.cancelledReason}
                </div>
              )}

              {selected.statusHistory && selected.statusHistory.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-[#091E42]">Status history</h3>
                  <ol className="space-y-1.5">
                    {selected.statusHistory.map((h, i) => (
                      <li key={`${h.status}-${h.changedAt}-${i}`} className="flex gap-3 text-xs">
                        <span className="text-[#6B7280]">
                          {new Date(h.changedAt).toLocaleString()}
                        </span>
                        <span className="font-medium text-[#091E42]">{h.status}</span>
                        {h.note && <span className="text-[#42526E]">— {h.note}</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-semibold text-[#091E42]">
                  Payment — currently {selected.paymentStatus}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["pending", "paid", "refunded"]
                    .filter((s) => s !== selected.paymentStatus)
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => handlePayment(selected._id, s)}
                        disabled={busyId === selected._id}
                        className="rounded-xl border border-[#DFE1E6] px-5 py-2 text-sm font-medium text-[#091E42] hover:border-[#0052CC] hover:bg-[#F4F8FF] disabled:opacity-60"
                      >
                        Mark as {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingManagement() {
  // the dashboard links here with ?status=..., which is client-only state
  return (
    <Suspense
      fallback={<div className="py-16 text-center text-[#42526E]">Loading bookings...</div>}
    >
      <BookingManagementContent />
    </Suspense>
  );
}
