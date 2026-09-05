"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";

import { emergencyAPI } from "@/services/api";

/* ============================================================
   TYPES
============================================================ */

interface EmergencyUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface EmergencyParent {
  _id?: string;
  fullName?: string;
  contactNumber?: string;
  address?: string;
  district?: string;
  town?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  age?: number;
  gender?: string;
  medicalConditions?: string;
  specialRequirements?: string;
}

interface EmergencyHospital {
  _id?: string;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

interface EmergencyBooking {
  _id?: string;

  clientId?: EmergencyUser | string | null;

  caretakerId?: EmergencyUser | string | null;

  parentId?: EmergencyParent | string | null;

  hospitalId?: EmergencyHospital | string | null;

  scheduledDate?: string | null;

  startTime?: string | null;

  status?: string;

  pickupLocation?: {
    address?: string;
    town?: string;
    lat?: number;
    lng?: number;
    placeId?: string | null;
  } | null;

  hospitalSnapshot?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  } | null;
}

interface EmergencyAlert {
  _id: string;

  bookingId?:
    | EmergencyBooking
    | string
    | null;

  triggeredBy?:
    | EmergencyUser
    | string
    | null;

  message?: string;

  priority?:
    | "critical"
    | "high"
    | "normal";

  contactName?: string;

  contactPhone?: string;

  location?: {
    address?: string;
    lat?: number | null;
    lng?: number | null;
  } | null;

  status?: "active" | "resolved";

  resolvedAt?: string | null;

  resolvedBy?:
    | EmergencyUser
    | string
    | null;

  createdAt?: string | null;

  updatedAt?: string | null;
}

/* ============================================================
   HELPERS
============================================================ */

function safeDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateTime(value?: string | null) {
  const date = safeDate(value);

  if (!date) {
    return "Not available";
  }

  return date.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  const date = safeDate(value);

  if (!date) {
    return "Not available";
  }

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function humanize(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function getUserName(
  user?: EmergencyUser | string | null
) {
  if (!user) {
    return "Unknown";
  }

  if (typeof user === "string") {
    return user;
  }

  return user.name || "Unknown";
}

function getUserPhone(
  user?: EmergencyUser | string | null
) {
  if (!user || typeof user === "string") {
    return "";
  }

  return user.phone || "";
}

function getParent(
  parent?:
    | EmergencyParent
    | string
    | null
) {
  if (
    !parent ||
    typeof parent === "string"
  ) {
    return null;
  }

  return parent;
}

function getHospitalName(
  booking?: EmergencyBooking | null
) {
  if (!booking) {
    return "Not available";
  }

  if (
    booking.hospitalId &&
    typeof booking.hospitalId !==
      "string"
  ) {
    return (
      booking.hospitalId.name ||
      booking.hospitalSnapshot?.name ||
      "Not available"
    );
  }

  return (
    booking.hospitalSnapshot?.name ||
    "Not available"
  );
}

function getHospitalAddress(
  booking?: EmergencyBooking | null
) {
  if (!booking) {
    return "Not available";
  }

  if (
    booking.hospitalId &&
    typeof booking.hospitalId !==
      "string"
  ) {
    return (
      booking.hospitalId.address ||
      booking.hospitalSnapshot?.address ||
      "Not available"
    );
  }

  return (
    booking.hospitalSnapshot?.address ||
    "Not available"
  );
}

function getBooking(
  booking?:
    | EmergencyBooking
    | string
    | null
) {
  if (
    !booking ||
    typeof booking === "string"
  ) {
    return null;
  }

  return booking;
}

function getBookingId(
  booking?:
    | EmergencyBooking
    | string
    | null
) {
  if (!booking) {
    return "";
  }

  if (typeof booking === "string") {
    return booking;
  }

  return booking._id || "";
}

/* ============================================================
   PRIORITY STYLES
============================================================ */

function getPriorityClasses(
  priority?: string
) {
  switch (priority) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300";

    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300";

    case "normal":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300";

    default:
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300";
  }
}

/* ============================================================
   STATUS STYLES
============================================================ */

function getStatusClasses(
  status?: string
) {
  return status === "resolved"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300";
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminEmergencyPage() {
  const [alerts, setAlerts] =
    useState<EmergencyAlert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [selectedAlert, setSelectedAlert] =
    useState<EmergencyAlert | null>(
      null
    );

  const [resolvingId, setResolvingId] =
    useState<string | null>(null);

  /* ==========================================================
     LOAD ALERTS
  ========================================================== */

  const load = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setMessage("");

        const data =
          await emergencyAPI.adminList();

        const result =
          Array.isArray(data?.alerts)
            ? data.alerts
            : [];

        setAlerts(
          result as EmergencyAlert[]
        );
      } catch (error: unknown) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load emergency alerts."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ==========================================================
     INITIAL LOAD + AUTO REFRESH
  ========================================================== */

  useEffect(() => {
    load();

    const intervalId =
      window.setInterval(() => {
        load();
      }, 15000);

    return () =>
      window.clearInterval(
        intervalId
      );
  }, [load]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    const active =
      alerts.filter(
        (alert) =>
          alert.status === "active"
      ).length;

    const resolved =
      alerts.filter(
        (alert) =>
          alert.status === "resolved"
      ).length;

    const critical =
      alerts.filter(
        (alert) =>
          alert.status === "active" &&
          (alert.priority ||
            "critical") ===
            "critical"
      ).length;

    const high =
      alerts.filter(
        (alert) =>
          alert.status === "active" &&
          alert.priority === "high"
      ).length;

    return {
      total: alerts.length,
      active,
      resolved,
      critical,
      high,
    };
  }, [alerts]);

  /* ==========================================================
     FILTERED ALERTS
  ========================================================== */

  const filteredAlerts =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return alerts.filter(
        (alert) => {
          const booking =
            getBooking(
              alert.bookingId
            );

          const parent =
            getParent(
              booking?.parentId
            );

          const triggeredByName =
            getUserName(
              alert.triggeredBy
            );

          const clientName =
            getUserName(
              booking?.clientId
            );

          const caretakerName =
            getUserName(
              booking?.caretakerId
            );

          const hospitalName =
            getHospitalName(
              booking
            );

          const bookingId =
            getBookingId(
              alert.bookingId
            );

          const matchesSearch =
            !searchValue ||
            triggeredByName
              .toLowerCase()
              .includes(searchValue) ||
            clientName
              .toLowerCase()
              .includes(searchValue) ||
            caretakerName
              .toLowerCase()
              .includes(searchValue) ||
            hospitalName
              .toLowerCase()
              .includes(searchValue) ||
            bookingId
              .toLowerCase()
              .includes(searchValue) ||
            (
              alert.message ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              alert.contactName ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              parent?.fullName ||
              ""
            )
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter ===
              "all" ||
            alert.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter ===
              "all" ||
            (alert.priority ||
              "critical") ===
              priorityFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    }, [
      alerts,
      search,
      statusFilter,
      priorityFilter,
    ]);

  /* ==========================================================
     RESOLVE ALERT
  ========================================================== */

  const resolve = async (
    alert: EmergencyAlert
  ) => {
    if (
      !alert._id ||
      alert.status === "resolved"
    ) {
      return;
    }

    try {
      setResolvingId(
        alert._id
      );

      setMessage("");

      const response =
        await emergencyAPI.resolve(
          alert._id
        );

      const updatedAlert =
        response?.alert;

      if (updatedAlert) {
        setAlerts((current) =>
          current.map(
            (item) =>
              item._id ===
              alert._id
                ? updatedAlert
                : item
          )
        );

        setSelectedAlert(
          updatedAlert
        );
      } else {
        await load();
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to resolve emergency alert."
      );
    } finally {
      setResolvingId(null);
    }
  };

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="space-y-7">
        <div>
          <div className="h-9 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-7">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30">
              <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#091E42] dark:text-white">
                Emergency Alerts
              </h1>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Monitor and resolve emergency assistance
                requests.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            load(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:text-rose-400"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {message && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{message}</span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
            className="rounded-lg p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Alerts
            </p>

            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[#091E42] dark:text-white">
            {summary.total}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            All emergency requests
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-900/40 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active
            </p>

            <Clock3 className="h-5 w-5 text-rose-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-rose-600 dark:text-rose-400">
            {summary.active}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Require administrator attention
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Critical
            </p>

            <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-rose-600 dark:text-rose-400">
            {summary.critical}
          </p>

          <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
            Highest priority active alerts
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              High Priority
            </p>

            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-orange-600 dark:text-orange-400">
            {summary.high}
          </p>

          <p className="mt-1 text-xs text-orange-500 dark:text-orange-400">
            Active high-priority alerts
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Resolved
            </p>

            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.resolved}
          </p>

          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            Completed emergency handling
          </p>
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ======================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search alert, patient, user, booking or hospital..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-rose-950/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="resolved">
              Resolved
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-rose-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">
              All Priorities
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="normal">
              Normal
            </option>
          </select>
        </div>

        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing{" "}
          {
            filteredAlerts.length
          }{" "}
          of{" "}
          {alerts.length} alerts
        </div>
      </section>

      {/* ======================================================
          ALERT LIST
      ======================================================= */}

      {filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <ShieldAlert className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
            No emergency alerts found
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            There are no emergency requests matching the
            selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(
            (alert) => {
              const booking =
                getBooking(
                  alert.bookingId
                );

              const parent =
                getParent(
                  booking?.parentId
                );

              const clientName =
                getUserName(
                  booking?.clientId
                );

              const caretakerName =
                getUserName(
                  booking?.caretakerId
                );

              const triggeredByName =
                getUserName(
                  alert.triggeredBy
                );

              const priority =
                alert.priority ||
                "critical";

              return (
                <article
                  key={alert._id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
                    alert.status ===
                      "active" &&
                    priority ===
                      "critical"
                      ? "border-rose-300 dark:border-rose-900/60"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    {/* Left */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            alert.status ===
                            "active"
                              ? "bg-rose-50 dark:bg-rose-950/30"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              alert.status ===
                              "active"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-slate-400"
                            }`}
                          />
                        </div>

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${getPriorityClasses(
                            priority
                          )}`}
                        >
                          {humanize(
                            priority
                          )}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            alert.status
                          )}`}
                        >
                          {humanize(
                            alert.status
                          )}
                        </span>
                      </div>

                      <h2 className="mt-4 text-lg font-bold text-[#091E42] dark:text-white">
                        {alert.message ||
                          "Emergency assistance requested"}
                      </h2>

                      {/* Patient / requester */}

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Patient
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {parent?.fullName ||
                              clientName ||
                              "Not available"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Triggered By
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {triggeredByName}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Hospital
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {getHospitalName(
                              booking
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Contact / booking */}

                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="flex items-start gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Emergency Contact
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                              {alert.contactName ||
                                parent?.emergencyContact?.name ||
                                "Not available"}
                            </p>

                            {(alert.contactPhone ||
                              parent?.emergencyContact?.phone) && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {alert.contactPhone ||
                                  parent?.emergencyContact?.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Location
                            </p>

                            <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                              {alert.location?.address ||
                                booking?.pickupLocation?.address ||
                                "Not available"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Caretaker
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                              {caretakerName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Requested
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                              {formatDateTime(
                                alert.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-slate-400">
                        <span>
                          Booking #
                          {getBookingId(
                            alert.bookingId
                          ).slice(-8) ||
                            "N/A"}
                        </span>

                        <span>
                          Booking status:{" "}
                          {humanize(
                            booking?.status
                          )}
                        </span>

                        {booking?.scheduledDate && (
                          <span>
                            Scheduled:{" "}
                            {formatDate(
                              booking.scheduledDate
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAlert(
                            alert
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {alert.status ===
                        "active" && (
                        <button
                          type="button"
                          onClick={() =>
                            resolve(
                              alert
                            )
                          }
                          disabled={
                            resolvingId ===
                            alert._id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {resolvingId ===
                          alert._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}

                          {resolvingId ===
                          alert._id
                            ? "Resolving..."
                            : "Resolve"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      {/* ======================================================
          DETAILS DRAWER
      ======================================================= */}

      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close emergency details"
            onClick={() =>
              setSelectedAlert(
                null
              )
            }
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          {/* Drawer */}

          <aside className="relative z-10 h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {/* Drawer header */}

            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${getPriorityClasses(
                        selectedAlert.priority ||
                          "critical"
                      )}`}
                    >
                      {humanize(
                        selectedAlert.priority ||
                          "critical"
                      )}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        selectedAlert.status
                      )}`}
                    >
                      {humanize(
                        selectedAlert.status
                      )}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-[#091E42] dark:text-white">
                    Emergency Alert Details
                  </h2>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    Alert #
                    {String(
                      selectedAlert._id
                    ).slice(-8)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedAlert(
                      null
                    )
                  }
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-7 p-6">
              {(() => {
                const booking =
                  getBooking(
                    selectedAlert.bookingId
                  );

                const parent =
                  getParent(
                    booking?.parentId
                  );

                const triggeredBy =
                  getUserName(
                    selectedAlert.triggeredBy
                  );

                const clientName =
                  getUserName(
                    booking?.clientId
                  );

                const caretakerName =
                  getUserName(
                    booking?.caretakerId
                  );

                return (
                  <>
                    {/* =================================================
                        EMERGENCY MESSAGE
                    ================================================== */}

                    <section>
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                              Emergency Request
                            </p>

                            <p className="mt-2 text-base font-semibold leading-7 text-rose-900 dark:text-rose-200">
                              {selectedAlert.message ||
                                "Emergency assistance requested"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        PATIENT
                    ================================================== */}

                    <section>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Patient Information
                      </h3>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                        <InfoRow
                          label="Patient"
                          value={
                            parent?.fullName ||
                            clientName
                          }
                        />

                        <InfoRow
                          label="Age"
                          value={
                            parent?.age
                              ? String(
                                  parent.age
                                )
                              : "Not available"
                          }
                        />

                        <InfoRow
                          label="Gender"
                          value={
                            parent?.gender ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Contact Number"
                          value={
                            parent?.contactNumber ||
                            getUserPhone(
                              booking?.clientId
                            ) ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Address"
                          value={
                            parent?.address ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Medical Conditions"
                          value={
                            parent?.medicalConditions ||
                            "Not provided"
                          }
                        />

                        <InfoRow
                          label="Special Requirements"
                          value={
                            parent?.specialRequirements ||
                            "Not provided"
                          }
                        />
                      </div>
                    </section>

                    {/* =================================================
                        EMERGENCY CONTACT
                    ================================================== */}

                    <section>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Emergency Contact
                      </h3>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                        <InfoRow
                          label="Name"
                          value={
                            selectedAlert.contactName ||
                            parent
                              ?.emergencyContact
                              ?.name ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Phone"
                          value={
                            selectedAlert.contactPhone ||
                            parent
                              ?.emergencyContact
                              ?.phone ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Relationship"
                          value={
                            parent
                              ?.emergencyContact
                              ?.relationship ||
                            "Not available"
                          }
                        />
                      </div>
                    </section>

                    {/* =================================================
                        BOOKING
                    ================================================== */}

                    <section>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Booking Information
                      </h3>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                        <InfoRow
                          label="Booking ID"
                          value={
                            <span className="font-mono text-xs">
                              {getBookingId(
                                selectedAlert.bookingId
                              ) ||
                                "Not available"}
                            </span>
                          }
                        />

                        <InfoRow
                          label="Client"
                          value={
                            clientName
                          }
                        />

                        <InfoRow
                          label="Caretaker"
                          value={
                            caretakerName
                          }
                        />

                        <InfoRow
                          label="Booking Status"
                          value={
                            humanize(
                              booking?.status
                            )
                          }
                        />

                        <InfoRow
                          label="Scheduled Date"
                          value={
                            booking?.scheduledDate
                              ? formatDate(
                                  booking.scheduledDate
                                )
                              : "Not available"
                          }
                        />

                        <InfoRow
                          label="Start Time"
                          value={
                            booking?.startTime ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Hospital"
                          value={
                            getHospitalName(
                              booking
                            )
                          }
                        />

                        <InfoRow
                          label="Hospital Address"
                          value={
                            getHospitalAddress(
                              booking
                            )
                          }
                        />
                      </div>
                    </section>

                    {/* =================================================
                        LOCATION
                    ================================================== */}

                    <section>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Emergency Location
                      </h3>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                        <InfoRow
                          label="Address"
                          value={
                            selectedAlert.location
                              ?.address ||
                            booking
                              ?.pickupLocation
                              ?.address ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Town"
                          value={
                            booking
                              ?.pickupLocation
                              ?.town ||
                            parent?.town ||
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Latitude"
                          value={
                            selectedAlert.location
                              ?.lat ??
                            booking
                              ?.pickupLocation
                              ?.lat ??
                            "Not available"
                          }
                        />

                        <InfoRow
                          label="Longitude"
                          value={
                            selectedAlert.location
                              ?.lng ??
                            booking
                              ?.pickupLocation
                              ?.lng ??
                            "Not available"
                          }
                        />
                      </div>
                    </section>

                    {/* =================================================
                        INCIDENT
                    ================================================== */}

                    <section>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Incident Information
                      </h3>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                        <InfoRow
                          label="Triggered By"
                          value={
                            triggeredBy
                          }
                        />

                        <InfoRow
                          label="Created"
                          value={formatDateTime(
                            selectedAlert.createdAt
                          )}
                        />

                        <InfoRow
                          label="Status"
                          value={
                            humanize(
                              selectedAlert.status
                            )
                          }
                        />

                        <InfoRow
                          label="Priority"
                          value={
                            humanize(
                              selectedAlert.priority ||
                                "critical"
                            )
                          }
                        />

                        {selectedAlert.resolvedAt && (
                          <InfoRow
                            label="Resolved At"
                            value={formatDateTime(
                              selectedAlert.resolvedAt
                            )}
                          />
                        )}

                        {selectedAlert.resolvedBy && (
                          <InfoRow
                            label="Resolved By"
                            value={getUserName(
                              selectedAlert.resolvedBy
                            )}
                          />
                        )}
                      </div>
                    </section>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    {selectedAlert.status ===
                      "active" && (
                      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-rose-900 dark:text-rose-200">
                              Emergency alert is still active
                            </p>

                            <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                              Resolve this alert only after the
                              emergency request has been handled.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              resolve(
                                selectedAlert
                              )
                            }
                            disabled={
                              resolvingId ===
                              selectedAlert._id
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {resolvingId ===
                            selectedAlert._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}

                            {resolvingId ===
                            selectedAlert._id
                              ? "Resolving..."
                              : "Mark Resolved"}
                          </button>
                        </div>
                      </section>
                    )}
                  </>
                );
              })()}

              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedAlert(
                      null
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}