"use client";
import { useEffect, useState } from "react";
import { adminAPI, paymentAPI } from "@/services/api";
import { Loader2, WalletCards } from "lucide-react";
export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = async () => {
    try {
      setMessage("");

      const [p, s] = await Promise.all([
        adminAPI.getPayments(),
        paymentAPI.adminSummary(),
      ]);

      setRows(p.payments || []);
      setSummary(s.summary || null);
    } catch (e: unknown) {
      setMessage(
        e instanceof Error ? e.message : "Failed to load payment information.",
      );
    }
  };
  useEffect(() => {
    load();
  }, []);
  const withdraw = async () => {
    setBusy(true);
    setMessage("");
    try {
      await paymentAPI.adminPayout(Number(amount));
      setAmount("");
      await load();
      setMessage("Admin payout created successfully.");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#091E42]">
          Payment Management
        </h1>
        <p className="mt-1 text-slate-500">
          Review receipts, platform balance, and administrator withdrawals.
        </p>
      </div>
      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-[#003898]">
          {message}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <WalletCards className="mt-1 text-[#003898] dark:text-blue-400" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Available CareLink+ Admin Balance
              </p>

              <div className="mt-2">
                <span className="text-3xl font-extrabold text-[#003898] dark:text-blue-400">
                  {summary?.currency || "LKR"}{" "}
                  {Number(summary?.availableAdminBalance || 0).toLocaleString(
                    "en-LK",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Admin Fee
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {Number(summary?.adminFeePercent || 0).toFixed(0)}%
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Admin Revenue
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {summary?.currency || "LKR"}{" "}
                    {Number(summary?.adminRevenue || 0).toLocaleString(
                      "en-LK",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gross Paid Revenue
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {summary?.currency || "LKR"}{" "}
                    {Number(summary?.grossRevenue || 0).toLocaleString(
                      "en-LK",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Caretaker Earnings
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {summary?.currency || "LKR"}{" "}
                    {Number(summary?.caretakerEarnings || 0).toLocaleString(
                      "en-LK",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">
            Withdraw from platform
          </p>

          <div className="mt-3 flex gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
              placeholder="Amount"
              className="min-w-0 flex-1 rounded-xl border px-4 py-3"
            />

            <button
              onClick={withdraw}
              disabled={
                busy ||
                Number(amount) <= 0 ||
                Number(amount) > Number(summary?.availableAdminBalance || 0)
              }
              className="rounded-xl bg-[#003898] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" /> : "Withdraw"}
            </button>
          </div>

          {/* Available admin balance */}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Available to withdraw:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {summary?.currency || "LKR"}{" "}
              {Number(summary?.availableAdminBalance || 0).toLocaleString(
                "en-LK",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </span>
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b text-left text-sm text-slate-500">
              <th className="p-4">Receipt</th>
              <th className="p-4">Booking</th>
              <th className="p-4">Client</th>
              <th className="p-4">Caretaker</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4">Paid at</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="p-4 font-mono text-sm">
                  {p.receiptNumber || "Pending"}
                </td>
                <td className="p-4 font-mono text-xs">
                  {String(p.bookingId?._id || p.bookingId).slice(-8)}
                </td>
                <td className="p-4">{p.clientId?.name || "-"}</td>
                <td className="p-4">{p.caretakerId?.name || "-"}</td>
                <td className="p-4 font-semibold">
                  {p.currency} {Number(p.amount || 0).toLocaleString()}
                </td>
                <td className="p-4">{p.method}</td>
                <td className="p-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
