"use client";

import { useCallback, useState } from "react";
import { paymentAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { Payment } from "@/types";
import { formatBookingDate, formatLkr } from "@/lib/bookingUtils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
  { value: "chargedback", label: "Charged back" },
];

const STATUS_STYLES: Record<Payment["status"], string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  refunded: "bg-gray-200 text-gray-600",
  cancelled: "bg-gray-200 text-gray-600",
  failed: "bg-red-100 text-red-600",
  chargedback: "bg-orange-100 text-orange-700",
};

export default function PaymentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const fetchPayments = useCallback(
    () => paymentAPI.getAll(statusFilter || undefined),
    [statusFilter],
  );

  const { data, loading, reload } = useApiData(fetchPayments);
  const payments: Payment[] = data?.payments ?? [];
  const totals = data?.totals ?? { collected: 0, refunded: 0 };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const payerName = (p: Payment) =>
    typeof p.payerId === "object" && p.payerId ? p.payerId.name : "—";

  const bookingOf = (p: Payment) =>
    typeof p.bookingId === "object" && p.bookingId ? p.bookingId : null;

  const caretakerName = (p: Payment) => {
    const ref = bookingOf(p)?.caretakerId;
    return typeof ref === "object" && ref ? ref.name : "—";
  };

  const term = search.toLowerCase();
  const filtered = payments.filter(
    (p) =>
      !term ||
      payerName(p).toLowerCase().includes(term) ||
      caretakerName(p).toLowerCase().includes(term) ||
      p._id.toLowerCase().includes(term) ||
      (bookingOf(p)?.hospitalLocation.hospitalName ?? "").toLowerCase().includes(term),
  );

  const handleRefund = async (p: Payment) => {
    if (!confirm(`Refund ${formatLkr(p.amount)} to ${payerName(p)}?`)) return;

    setBusyId(p._id);
    try {
      await paymentAPI.refund(p._id);
      showToast("Payment refunded");
      reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Refund failed");
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Payment Management</h1>
        <p className="mt-1 text-[#42526E]">
          Card payments taken through PayHere for completed hospital visits.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Collected",
            value: formatLkr(totals.collected),
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Refunded",
            value: formatLkr(totals.refunded),
            color: "bg-gray-100 text-gray-600",
          },
          {
            label: "Net revenue",
            value: formatLkr(totals.collected - totals.refunded),
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Awaiting payment",
            value: payments.filter((p) => p.status === "pending").length,
            color: "bg-yellow-50 text-yellow-700",
          },
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
          placeholder="Search by payer, caretaker, hospital or payment ID..."
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
          <div className="py-16 text-center text-[#42526E]">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-5xl">💳</span>
            <p className="mt-3 text-[#42526E]">No payments yet</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Card payments appear here once a client pays for a visit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#DFE1E6] bg-[#F8FAFC]">
                <tr>
                  {["Payer", "Caretaker", "Visit", "Amount", "Method", "Status", "Date", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#42526E]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DFE1E6]">
                {filtered.map((p) => {
                  const booking = bookingOf(p);

                  return (
                    <tr key={p._id} className="hover:bg-[#F8FAFC]">
                      <td className="px-5 py-4 font-medium text-[#091E42]">{payerName(p)}</td>
                      <td className="px-5 py-4 text-[#42526E]">{caretakerName(p)}</td>
                      <td className="px-5 py-4 text-[#42526E]">
                        {booking?.hospitalLocation.hospitalName ?? "—"}
                        {booking && (
                          <span className="block text-xs text-[#6B7280]">
                            {formatBookingDate(booking.bookingDate)}, {booking.bookingTime}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-[#091E42]">
                        {formatLkr(p.amount)}
                      </td>
                      <td className="px-5 py-4 text-[#42526E]">
                        <span className="capitalize">{p.paymentMethod ?? p.provider}</span>
                        {p.cardMaskedNumber && (
                          <span className="block text-xs text-[#6B7280]">
                            {p.cardMaskedNumber}
                          </span>
                        )}
                        <span className="block text-xs text-[#6B7280]">{p.orderId}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}
                        >
                          {p.status}
                        </span>
                        {p.statusMessage && (
                          <span className="block max-w-64 text-xs text-[#6B7280]">
                            {p.statusMessage}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#42526E]">
                        {new Date(p.paidAt ?? p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        {p.status === "paid" && (
                          <button
                            onClick={() => handleRefund(p)}
                            disabled={busyId === p._id}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
