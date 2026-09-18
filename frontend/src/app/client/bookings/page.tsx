"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react";
import {
  CalendarDays,
  Clock3,
  Hospital,
  UserRound,
  Eye,
  X,
  Loader2,
  AlertTriangle,
  MapPin,
  WalletCards,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  Activity,
  CreditCard,
  ClipboardCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { bookingAPI } from "@/services/api";

function label(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusConfig(status: string) {
  const configs: Record<
    string,
    {
      label: string;
      className: string;
      icon: ElementType;
      category: string;
    }
  > = {
    requested: {
      label: "Requested",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CircleDashed,
      category: "Upcoming",
    },

    accepted: {
      label: "Accepted",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      category: "Upcoming",
    },

    in_progress: {
      label: "In Progress",
      className: "bg-violet-50 text-violet-700 border-violet-200",
      icon: Activity,
      category: "Active",
    },

    payment_pending: {
      label: "Payment Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: CreditCard,
      category: "Payment",
    },

    paid: {
      label: "Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      category: "Completed",
    },

    closed: {
      label: "Completed",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: ClipboardCheck,
      category: "Completed",
    },

    cancelled: {
      label: "Cancelled",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: X,
      category: "Cancelled",
    },

    rejected: {
      label: "Rejected",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: X,
      category: "Closed",
    },
  };

  return (
    configs[status] || {
      label: label(status),
      className: "bg-slate-50 text-slate-700 border-slate-200",
      icon: CircleDashed,
      category: "Other",
    }
  );
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
    try {
      const data = await bookingAPI.clientList();
      setRows(data.bookings || []);
    } catch (e: any) {
      setMessage(e.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      upcoming: rows.filter((b) => ["requested", "accepted"].includes(b.status))
        .length,
      active: rows.filter((b) => b.status === "in_progress").length,
      completed: rows.filter((b) => ["paid", "closed"].includes(b.status))
        .length,
    }),
    [rows],
  );

  const cancel = async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    try {
      await bookingAPI.updateStatus(
        cancelTarget._id,
        "cancelled",
        "Cancelled by client",
      );
      setCancelTarget(null);
      await load();
    } catch (e: any) {
      setMessage(e.message || "Unable to cancel booking");
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#003898]">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Booking Management
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#091E42] sm:text-4xl">
            My Bookings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Track your hospital visit requests, active services, payments, and
            completed CareLink+ bookings.
          </p>
        </div>

        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total bookings
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#003898]">
            {rows.length}
          </p>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ["Upcoming", stats.upcoming],
          ["Active", stats.active],
          ["Completed", stats.completed],
        ].map(([title, value]) => (
          <div
            key={String(title)}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs uppercase font-bold tracking-wide text-slate-400">
              {title}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#003898]">
              {value}
            </p>
          </div>
        ))}
      </div> */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Upcoming
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#003898]">
                {stats.upcoming}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Requested and accepted visits
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#003898]">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active
              </p>

              <p className="mt-2 text-3xl font-extrabold text-violet-700">
                {stats.active}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Hospital visits currently in progress
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed
              </p>

              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                {stats.completed}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Paid and closed services
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {message}
        </div>
      )}
      {loading ? (
        <div className="py-16 grid place-items-center">
          <Loader2 className="animate-spin text-[#003898]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
          No bookings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((b) => {
            const canCancel = b.status === "requested";
            return (
              // <div
              //   key={b._id}
              //   className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm"
              // >
              //   <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              //     <div className="space-y-3 min-w-0">
              //       <div className="flex flex-wrap items-center gap-2">
              //         <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#003898]">
              //           {label(b.status)}
              //         </span>
              //         <span className="text-xs text-slate-400 font-mono">
              //           #{String(b._id).slice(-8)}
              //         </span>
              //       </div>
              //       <div className="grid sm:grid-cols-2 gap-3 text-sm">
              //         <div className="flex gap-2">
              //           <UserRound size={17} className="text-[#003898]" />
              //           <div>
              //             <span className="text-slate-400">Parent</span>
              //             <p className="font-semibold">
              //               {b.parentId?.fullName || "-"}
              //             </p>
              //           </div>
              //         </div>
              //         <div className="flex gap-2">
              //           <Hospital size={17} className="text-[#003898]" />
              //           <div>
              //             <span className="text-slate-400">Hospital</span>
              //             <p className="font-semibold">
              //               {b.hospitalSnapshot?.name ||
              //                 b.hospitalId?.name ||
              //                 "-"}
              //             </p>
              //           </div>
              //         </div>
              //         <div className="flex gap-2">
              //           <CalendarDays size={17} className="text-[#003898]" />
              //           <div>
              //             <span className="text-slate-400">Date</span>
              //             <p className="font-semibold">
              //               {new Date(b.scheduledDate).toLocaleDateString()}
              //             </p>
              //           </div>
              //         </div>
              //         <div className="flex gap-2">
              //           <Clock3 size={17} className="text-[#003898]" />
              //           <div>
              //             <span className="text-slate-400">Time</span>
              //             <p className="font-semibold">{b.startTime}</p>
              //           </div>
              //         </div>
              //       </div>
              //     </div>
              //     <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[170px]">
              //       <button
              //         onClick={() =>
              //           router.push(`/client/booking-status?bookingId=${b._id}`)
              //         }
              //         className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003898] px-4 py-2.5 font-semibold text-white"
              //       >
              //         <Eye size={17} /> View status
              //       </button>
              //       {canCancel && (
              //         <button
              //           onClick={() => setCancelTarget(b)}
              //           className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 font-semibold text-rose-600 hover:bg-rose-50"
              //         >
              //           <X size={17} /> Cancel
              //         </button>
              //       )}
              //       {b.status === "payment_pending" && (
              //         <button
              //           onClick={() =>
              //             router.push(
              //               `/client/booking-status?bookingId=${b._id}`,
              //             )
              //           }
              //           className="rounded-xl border border-emerald-200 px-4 py-2.5 font-semibold text-emerald-700"
              //         >
              //           Pay now
              //         </button>
              //       )}
              //     </div>
              //   </div>
              // </div>
              <div
                key={b._id}
                className="
    overflow-hidden
    rounded-3xl
    border
    border-slate-200
    bg-white
    shadow-sm
    transition
    hover:-translate-y-0.5
    hover:shadow-lg
  "
              >
                {/* Booking Header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const status = getStatusConfig(b.status);
                        const StatusIcon = status.icon;

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        );
                      })()}

                      <span className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-500">
                        #{String(b._id).slice(-8)}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(
                        b.createdAt || b.scheduledDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-5 sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    {/* Details */}
                    <div className="min-w-0">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003898]">
                            <UserRound className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Parent
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-[#091E42]">
                              {b.parentId?.fullName || "-"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Family member profile
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Hospital className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Hospital
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-[#091E42]">
                              {b.hospitalSnapshot?.name ||
                                b.hospitalId?.name ||
                                "-"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Selected hospital
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Visit date
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#091E42]">
                              {new Date(b.scheduledDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Clock3 className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Start time
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#091E42]">
                              {b.startTime || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Optional pickup location */}
                      {b.pickupLocation?.address && (
                        <div className="mt-6 flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#003898]" />

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Pickup location
                            </p>

                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              {b.pickupLocation.address}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Caretaker information */}
                      {(b.caretakerId?.name || b.caretakerSnapshot?.name) && (
                        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                            Assigned caretaker
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#091E42]">
                            {b.caretakerId?.name || b.caretakerSnapshot?.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex min-w-[180px] flex-col justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/client/booking-status?bookingId=${b._id}`,
                          )
                        }
                        className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#003898]
            px-4
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-[#002f7a]
            hover:shadow-md
          "
                      >
                        <Eye className="h-4 w-4" />
                        View booking
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {b.status === "payment_pending" && (
                        <button
                          onClick={() =>
                            router.push(
                              `/client/booking-status?bookingId=${b._id}`,
                            )
                          }
                          className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-3
              text-sm
              font-bold
              text-emerald-700
              transition
              hover:bg-emerald-100
            "
                        >
                          <WalletCards className="h-4 w-4" />
                          Pay now
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-rose-200
              bg-white
              px-4
              py-3
              text-sm
              font-bold
              text-rose-600
              transition
              hover:bg-rose-50
            "
                        >
                          <X className="h-4 w-4" />
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                  <div className="flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>CareLink+ Booking Management</span>

                    <span>
                      Status:{" "}
                      <strong className="text-slate-500">
                        {getStatusConfig(b.status).category}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[#091E42]">
                    Cancel this booking?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This will cancel the booking request for{" "}
                    <strong className="text-slate-700">
                      {cancelTarget.parentId?.fullName || "this parent"}
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Hospital
                    </p>

                    <p className="mt-1 font-semibold text-[#172B4D]">
                      {cancelTarget.hospitalSnapshot?.name ||
                        cancelTarget.hospitalId?.name ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Visit
                    </p>

                    <p className="mt-1 font-semibold text-[#172B4D]">
                      {cancelTarget.startTime || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Only proceed if you are sure you want to cancel this booking.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  disabled={cancelBusy}
                  onClick={() => setCancelTarget(null)}
                  className="
              rounded-xl
              border
              border-slate-200
              px-4
              py-3
              text-sm
              font-bold
              text-slate-600
              transition
              hover:bg-slate-50
              disabled:opacity-50
            "
                >
                  Keep booking
                </button>

                <button
                  disabled={cancelBusy}
                  onClick={cancel}
                  className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-rose-600
              px-4
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:bg-rose-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                >
                  {cancelBusy && <Loader2 className="h-4 w-4 animate-spin" />}

                  {cancelBusy ? "Cancelling..." : "Yes, cancel booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
