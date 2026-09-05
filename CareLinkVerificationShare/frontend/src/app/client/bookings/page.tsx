"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Hospital, UserRound, Eye, X, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { bookingAPI } from "@/services/api";

function label(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ClientBookingsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const data = await bookingAPI.clientList(); setRows(data.bookings || []); }
    catch (e: any) { setMessage(e.message || "Unable to load bookings"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    upcoming: rows.filter((b) => ["requested", "accepted"].includes(b.status)).length,
    active: rows.filter((b) => b.status === "in_progress").length,
    completed: rows.filter((b) => ["paid", "closed"].includes(b.status)).length,
  }), [rows]);

  const cancel = async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    try {
      await bookingAPI.updateStatus(cancelTarget._id, "cancelled", "Cancelled by client");
      setCancelTarget(null);
      await load();
    } catch (e: any) { setMessage(e.message || "Unable to cancel booking"); }
    finally { setCancelBusy(false); }
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42]">My Bookings</h1>
        <p className="mt-2 text-slate-500">Track requests, live visits, payments, and completed services.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['Upcoming', stats.upcoming], ['Active', stats.active], ['Completed', stats.completed]].map(([title, value]) => (
          <div key={String(title)} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs uppercase font-bold tracking-wide text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-[#003898]">{value}</p>
          </div>
        ))}
      </div>

      {message && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>}
      {loading ? <div className="py-16 grid place-items-center"><Loader2 className="animate-spin text-[#003898]" /></div> : rows.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">No bookings yet.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((b) => {
            const canCancel = b.status === "requested";
            return (
              <div key={b._id} className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#003898]">{label(b.status)}</span>
                      <span className="text-xs text-slate-400 font-mono">#{String(b._id).slice(-8)}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex gap-2"><UserRound size={17} className="text-[#003898]"/><div><span className="text-slate-400">Parent</span><p className="font-semibold">{b.parentId?.fullName || "-"}</p></div></div>
                      <div className="flex gap-2"><Hospital size={17} className="text-[#003898]"/><div><span className="text-slate-400">Hospital</span><p className="font-semibold">{b.hospitalSnapshot?.name || b.hospitalId?.name || "-"}</p></div></div>
                      <div className="flex gap-2"><CalendarDays size={17} className="text-[#003898]"/><div><span className="text-slate-400">Date</span><p className="font-semibold">{new Date(b.scheduledDate).toLocaleDateString()}</p></div></div>
                      <div className="flex gap-2"><Clock3 size={17} className="text-[#003898]"/><div><span className="text-slate-400">Time</span><p className="font-semibold">{b.startTime}</p></div></div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[170px]">
                    <button onClick={() => router.push(`/client/booking-status?bookingId=${b._id}`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003898] px-4 py-2.5 font-semibold text-white"><Eye size={17}/> View status</button>
                    {canCancel && <button onClick={() => setCancelTarget(b)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 font-semibold text-rose-600 hover:bg-rose-50"><X size={17}/> Cancel</button>}
                    {b.status === "payment_pending" && <button onClick={() => router.push(`/client/booking-status?bookingId=${b._id}`)} className="rounded-xl border border-emerald-200 px-4 py-2.5 font-semibold text-emerald-700">Pay now</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-rose-50"><AlertTriangle className="text-rose-600"/></div><div><h2 className="text-xl font-extrabold text-slate-900">Cancel booking?</h2><p className="text-sm text-slate-500">Are you sure you want to cancel this booking?</p></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3"><button disabled={cancelBusy} onClick={() => setCancelTarget(null)} className="rounded-xl border py-3 font-semibold">Keep booking</button><button disabled={cancelBusy} onClick={cancel} className="rounded-xl bg-rose-600 py-3 font-semibold text-white">{cancelBusy ? "Cancelling..." : "Yes, cancel"}</button></div>
        </div>
      </div>}
    </div>
  );
}
