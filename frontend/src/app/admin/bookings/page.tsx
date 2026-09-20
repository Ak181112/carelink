"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  CreditCard,
  Hospital,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  Download,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Eye,
} from "lucide-react";

import { adminAPI } from "@/services/api";

/* ============================================================
   TYPES
============================================================ */

interface BookingUser {
  id?: string | null;
  _id?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  profilePhoto?: string | null;
  isActive?: boolean;
}

interface BookingParent {
  id?: string | null;
  _id?: string | null;
  fullName?: string;
  age?: number | null;
  gender?: string | null;
  address?: string;
  district?: string;
  town?: string;
  contactNumber?: string;
  medicalConditions?: string;
  specialRequirements?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  } | null;
}

interface BookingHospital {
  _id?: string | null;
  name?: string;
  address?: string;
  location?: {
    lat?: number | null;
    lng?: number | null;
  };
}

interface BookingPayment {
  id?: string | null;
  amount?: number;
  currency?: string;
  method?: string | null;
  status?: string;
  receiptNumber?: string | null;
  paidAt?: string | null;
  failureReason?: string;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeTransferId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface BookingPricing {
  ratePerKm?: number;
  caretakerServiceCharge?: number;
  adminFeePercent?: number;
  adminFeeAmount?: number;
  distanceCharge?: number;
  total?: number;
  currency?: string;
}

interface BookingOtp {
  generated?: boolean;
  verified?: boolean;
  expiresAt?: string | null;
  verifiedAt?: string | null;
}

interface BookingProgressStage {
  key: string;
  label: string;
  status: "not_started" | "in_progress" | "completed";
  updatedAt?: string | null;
  updatedBy?: string | null;
}

interface BookingProgress {
  currentStage?: string;
  stages?: BookingProgressStage[];
}

interface BookingCompletion {
  caretakerCompleted?: boolean;
  clientCompleted?: boolean;
  caretakerCompletedAt?: string | null;
  clientCompletedAt?: string | null;
}

interface Booking {
  _id: string;

  clientId?: BookingUser | null;
  caretakerId?: BookingUser | null;
  parentId?: BookingParent | null;
  hospitalId?: BookingHospital | null;

  hospitalSnapshot?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  } | null;

  scheduledDate?: string | null;
  startTime?: string | null;
  serviceNotes?: string;

  pickupLocation?: {
    address?: string;
    town?: string;
    lat?: number;
    lng?: number;
    placeId?: string | null;
  } | null;

  distanceKm?: number | null;
  durationMinutes?: number | null;

  pricing?: BookingPricing | null;

  status?: string;

  otp?: BookingOtp | null;

  progress?: BookingProgress | null;

  completion?: BookingCompletion | null;

  caretakerCompletedAt?: string | null;
  clientCompletedAt?: string | null;

  paymentId?: BookingPayment | null;

  cancellationReason?: string;

  createdAt?: string | null;
  updatedAt?: string | null;
}

/* ============================================================
   HELPERS
============================================================ */

function safeDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value?: string | null) {
  const date = safeDate(value);

  if (!date) {
    return "Not scheduled";
  }

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

function formatCurrency(amount?: number | null, currency = "LKR") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDistance(distanceKm?: number | null) {
  if (
    distanceKm === null ||
    distanceKm === undefined ||
    !Number.isFinite(Number(distanceKm))
  ) {
    return "—";
  }

  return `${Number(distanceKm).toFixed(2)} km`;
}

function formatDuration(durationMinutes?: number | null) {
  if (
    durationMinutes === null ||
    durationMinutes === undefined ||
    !Number.isFinite(Number(durationMinutes))
  ) {
    return "—";
  }

  const minutes = Math.round(Number(durationMinutes));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function humanize(value?: string | null) {
  if (!value) return "Not available";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClasses(status?: string) {
  switch (status) {
    case "accepted":
    case "paid":
    case "closed":
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40";

    case "requested":
    case "payment_pending":
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40";

    case "rejected":
    case "cancelled":
    case "failed":
    case "refunded":
      return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40";

    case "in_progress":
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ value }: { value?: string | null }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
        value || undefined,
      )}`}
    >
      {humanize(value)}
    </span>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [savingBooking, setSavingBooking] = useState(false);

  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(
    null,
  );

  const [actionMessage, setActionMessage] = useState("");

  const [actionError, setActionError] = useState("");

  const [editForm, setEditForm] = useState({
    status: "requested",
    scheduledDate: "",
    startTime: "",
    serviceNotes: "",
    cancellationReason: "",
  });

  const startEditingBooking = (booking: Booking) => {
    setActionError("");
    setActionMessage("");

    setEditingBooking(booking);

    const date = safeDate(booking.scheduledDate);

    setEditForm({
      status: booking.status || "requested",

      scheduledDate: date ? date.toISOString().split("T")[0] : "",

      startTime: booking.startTime || "",

      serviceNotes: booking.serviceNotes || "",

      cancellationReason: booking.cancellationReason || "",
    });
  };

  const saveBookingChanges = async () => {
    if (!editingBooking) {
      return;
    }

    try {
      setSavingBooking(true);
      setActionError("");
      setActionMessage("");

      const payload = {
        status: editForm.status,

        scheduledDate: editForm.scheduledDate,

        startTime: editForm.startTime,

        serviceNotes: editForm.serviceNotes,

        cancellationReason: editForm.cancellationReason,
      };

      const response = await adminAPI.updateBooking(
        editingBooking._id,
        payload,
      );

      const updated = response?.booking;

      if (updated) {
        setRows((current) =>
          current.map((booking) =>
            booking._id === updated._id ? updated : booking,
          ),
        );

        setSelectedBooking(updated);
      }

      setEditingBooking(null);

      setActionMessage("Booking updated successfully.");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update booking.",
      );
    } finally {
      setSavingBooking(false);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    const confirmed = window.confirm(
      `Delete booking #${String(booking._id).slice(
        -8,
      )}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingBookingId(booking._id);

      setActionError("");
      setActionMessage("");

      await adminAPI.deleteBooking(booking._id);

      setRows((current) => current.filter((item) => item._id !== booking._id));

      if (selectedBooking?._id === booking._id) {
        setSelectedBooking(null);
      }

      setActionMessage("Booking deleted successfully.");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete booking.",
      );
    } finally {
      setDeletingBookingId(null);
    }
  };

  const downloadBookingPdf = (booking: Booking) => {
    setPrintingBooking(booking);

    window.setTimeout(() => {
      window.print();
    }, 300);
  };
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintingBooking(null);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  /* ==========================================================
     LOAD BOOKINGS
  ========================================================== */

  const loadBookings = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await adminAPI.getBookings();

      const bookings = Array.isArray(data?.bookings) ? data.bookings : [];

      setRows(bookings as Booking[]);
    } catch (err: unknown) {
      console.error("Failed to load admin bookings:", err);

      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /* ==========================================================
     STATUS OPTIONS
  ========================================================== */

  const statusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(rows.map((booking) => booking.status).filter(Boolean)),
    ) as string[];

    return statuses.sort();
  }, [rows]);

  /* ==========================================================
     FILTERED BOOKINGS
  ========================================================== */

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return rows.filter((booking) => {
      const parent = booking.parentId?.fullName || "";

      const caretaker = booking.caretakerId?.name || "";

      const client = booking.clientId?.name || "";

      const hospital =
        booking.hospitalId?.name || booking.hospitalSnapshot?.name || "";

      const bookingId = booking._id || "";

      const matchesSearch =
        !searchValue ||
        parent.toLowerCase().includes(searchValue) ||
        caretaker.toLowerCase().includes(searchValue) ||
        client.toLowerCase().includes(searchValue) ||
        hospital.toLowerCase().includes(searchValue) ||
        bookingId.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  /* ==========================================================
     SUMMARY COUNTS
  ========================================================== */

  const summary = useMemo(() => {
    return {
      total: rows.length,

      active: rows.filter((booking) =>
        ["accepted", "in_progress", "payment_pending"].includes(
          booking.status || "",
        ),
      ).length,

      completed: rows.filter((booking) => booking.status === "closed").length,

      pending: rows.filter((booking) => booking.status === "requested").length,

      revenue: rows.reduce(
        (sum, booking) => sum + Number(booking.pricing?.total || 0),
        0,
      ),
    };
  }, [rows]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-5 w-96 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
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
     PAGE
  ========================================================== */

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#091E42] dark:text-white">
            Booking Management
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Monitor booking lifecycle, pricing, payments and task completion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadBookings(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0052CC] hover:text-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-[#091E42] dark:text-white">
            {summary.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.active}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.completed}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Booking Value
          </p>

          <p className="mt-2 text-2xl font-bold text-[#091E42] dark:text-white">
            {formatCurrency(summary.revenue)}
          </p>
        </div>
      </div>

      {/* ======================================================
          FILTER BAR
      ======================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search booking, parent, caretaker, client or hospital..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All statuses</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {humanize(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredRows.length} of {rows.length} bookings
        </div>
      </div>

      {/* ======================================================
          BOOKINGS TABLE
      ======================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Booking
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Parent / Patient
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Caretaker
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Hospital
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Schedule
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Route
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Payment
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((booking) => {
                const parent =
                  booking.parentId?.fullName || "Parent unavailable";

                const caretaker =
                  booking.caretakerId?.name || "Caretaker unavailable";

                const hospital =
                  booking.hospitalId?.name ||
                  booking.hospitalSnapshot?.name ||
                  "Hospital unavailable";

                const paymentStatus = booking.paymentId?.status || "pending";

                return (
                  <tr
                    key={booking._id}
                    className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          #{String(booking._id).slice(-8)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Created {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {parent}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {booking.parentId?.contactNumber || "No contact"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {caretaker}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {booking.caretakerId?.phone ||
                          booking.caretakerId?.email ||
                          "No contact"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-[220px]">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {hospital}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {booking.hospitalId?.address ||
                            booking.hospitalSnapshot?.address ||
                            "Address unavailable"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatDate(booking.scheduledDate)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {booking.startTime || "Time not set"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatDistance(booking.distanceKm)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDuration(booking.durationMinutes)}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={booking.status} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={paymentStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(
                          booking.pricing?.total,
                          booking.pricing?.currency || "LKR",
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          title="View booking details"
                          aria-label="View booking details"
                          className="
                          inline-flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          text-slate-500
                          transition

                          hover:border-[#0052CC]
                          hover:bg-blue-50
                          hover:text-[#0052CC]

                          dark:border-slate-700
                          dark:bg-slate-900
                          dark:text-slate-300
                          dark:hover:border-blue-800
                          dark:hover:bg-blue-950/30
                          dark:hover:text-blue-400
                        "
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => startEditingBooking(booking)}
                          title="Update booking"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* PDF */}
                        <button
                          type="button"
                          onClick={() => downloadBookingPdf(booking)}
                          title="Booking PDF"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(booking)}
                          disabled={deletingBookingId === booking._id}
                          title="Delete booking"
                          className="inline-flex items-center justify-center rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30"
                        >
                          {deletingBookingId === booking._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty */}
        {filteredRows.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Activity className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              No bookings found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing the search or status filter.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          DETAIL DRAWER
      ======================================================= */}

      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button
            type="button"
            aria-label="Close booking details"
            onClick={() => setSelectedBooking(null)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <aside className="relative z-10 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-slate-400">
                    Booking #{String(selectedBooking._id).slice(-8)}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#091E42] dark:text-white">
                    Booking Details
                  </h2>

                  <div className="mt-2">
                    <StatusBadge value={selectedBooking.status} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* =================================================
                  SCHEDULE
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  Schedule
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Date"
                    value={formatDate(selectedBooking.scheduledDate)}
                  />

                  <InfoRow
                    label="Start Time"
                    value={selectedBooking.startTime || "Not set"}
                  />

                  <InfoRow
                    label="Created"
                    value={formatDateTime(selectedBooking.createdAt)}
                  />
                </div>
              </section>

              {/* =================================================
                  PARENT / PATIENT
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <ShieldCheck className="h-4 w-4" />
                  Parent / Patient
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Name"
                    value={selectedBooking.parentId?.fullName}
                  />

                  <InfoRow
                    label="Age"
                    value={
                      selectedBooking.parentId?.age
                        ? `${selectedBooking.parentId.age} years`
                        : "Not available"
                    }
                  />

                  <InfoRow
                    label="Gender"
                    value={selectedBooking.parentId?.gender}
                  />

                  <InfoRow
                    label="Contact"
                    value={selectedBooking.parentId?.contactNumber}
                  />

                  <InfoRow
                    label="Address"
                    value={selectedBooking.parentId?.address}
                  />

                  <InfoRow
                    label="Medical Conditions"
                    value={
                      selectedBooking.parentId?.medicalConditions ||
                      "None recorded"
                    }
                  />

                  <InfoRow
                    label="Special Requirements"
                    value={
                      selectedBooking.parentId?.specialRequirements ||
                      "None recorded"
                    }
                  />

                  <InfoRow
                    label="Emergency Contact"
                    value={
                      selectedBooking.parentId?.emergencyContact
                        ? `${selectedBooking.parentId.emergencyContact.name || "Unknown"}${selectedBooking.parentId.emergencyContact.phone ? ` (${selectedBooking.parentId.emergencyContact.phone})` : ""}`
                        : "Not available"
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  CARETAKER
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <Activity className="h-4 w-4" />
                  Caretaker
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Name"
                    value={selectedBooking.caretakerId?.name}
                  />

                  <InfoRow
                    label="Email"
                    value={selectedBooking.caretakerId?.email}
                  />

                  <InfoRow
                    label="Phone"
                    value={selectedBooking.caretakerId?.phone}
                  />

                  <InfoRow
                    label="Account Status"
                    value={
                      selectedBooking.caretakerId?.isActive === false
                        ? "Inactive"
                        : "Active"
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  HOSPITAL
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <Hospital className="h-4 w-4" />
                  Hospital
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Hospital"
                    value={
                      selectedBooking.hospitalId?.name ||
                      selectedBooking.hospitalSnapshot?.name
                    }
                  />

                  <InfoRow
                    label="Address"
                    value={
                      selectedBooking.hospitalId?.address ||
                      selectedBooking.hospitalSnapshot?.address
                    }
                  />

                  <InfoRow
                    label="Coordinates"
                    value={
                      selectedBooking.hospitalId?.location
                        ? `${selectedBooking.hospitalId.location.lat ?? "—"}, ${selectedBooking.hospitalId.location.lng ?? "—"}`
                        : selectedBooking.hospitalSnapshot
                          ? `${selectedBooking.hospitalSnapshot.lat ?? "—"}, ${selectedBooking.hospitalSnapshot.lng ?? "—"}`
                          : "Not available"
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  PICKUP + ROUTE
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <MapPin className="h-4 w-4" />
                  Pickup & Route
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Pickup Address"
                    value={selectedBooking.pickupLocation?.address}
                  />

                  <InfoRow
                    label="Pickup Town"
                    value={selectedBooking.pickupLocation?.town}
                  />

                  <InfoRow
                    label="Distance"
                    value={formatDistance(selectedBooking.distanceKm)}
                  />

                  <InfoRow
                    label="Travel Duration"
                    value={formatDuration(selectedBooking.durationMinutes)}
                  />

                  <InfoRow
                    label="Pickup Coordinates"
                    value={
                      selectedBooking.pickupLocation
                        ? `${selectedBooking.pickupLocation.lat ?? "—"}, ${selectedBooking.pickupLocation.lng ?? "—"}`
                        : "Not available"
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  PRICING
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Pricing
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Rate / km"
                    value={formatCurrency(selectedBooking.pricing?.ratePerKm)}
                  />

                  <InfoRow
                    label="Distance Charge"
                    value={formatCurrency(
                      selectedBooking.pricing?.distanceCharge,
                    )}
                  />

                  <InfoRow
                    label="Caretaker Service Charge"
                    value={formatCurrency(
                      selectedBooking.pricing?.caretakerServiceCharge,
                    )}
                  />

                  <InfoRow
                    label={`Admin Fee (${selectedBooking.pricing?.adminFeePercent ?? 15}%)`}
                    value={formatCurrency(
                      selectedBooking.pricing?.adminFeeAmount,
                    )}
                  />

                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Total
                    </span>

                    <span className="text-lg font-bold text-[#003898] dark:text-blue-400">
                      {formatCurrency(
                        selectedBooking.pricing?.total,
                        selectedBooking.pricing?.currency || "LKR",
                      )}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PAYMENT
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  Payment
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Status"
                    value={
                      <StatusBadge value={selectedBooking.paymentId?.status} />
                    }
                  />

                  <InfoRow
                    label="Amount"
                    value={formatCurrency(
                      selectedBooking.paymentId?.amount,
                      selectedBooking.paymentId?.currency || "LKR",
                    )}
                  />

                  <InfoRow
                    label="Method"
                    value={selectedBooking.paymentId?.method}
                  />

                  <InfoRow
                    label="Receipt"
                    value={
                      selectedBooking.paymentId?.receiptNumber || "Not issued"
                    }
                  />

                  <InfoRow
                    label="Paid At"
                    value={formatDateTime(selectedBooking.paymentId?.paidAt)}
                  />

                  {selectedBooking.paymentId?.failureReason && (
                    <InfoRow
                      label="Failure Reason"
                      value={selectedBooking.paymentId.failureReason}
                    />
                  )}
                </div>
              </section>

              {/* =================================================
                  OTP
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Job Verification
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="OTP Generated"
                    value={selectedBooking.otp?.generated ? "Yes" : "No"}
                  />

                  <InfoRow
                    label="OTP Verified"
                    value={selectedBooking.otp?.verified ? "Yes" : "No"}
                  />

                  <InfoRow
                    label="Verified At"
                    value={formatDateTime(selectedBooking.otp?.verifiedAt)}
                  />
                </div>
              </section>

              {/* =================================================
                  PROGRESS
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  Task Progress
                </h3>

                <div className="space-y-3">
                  {(selectedBooking.progress?.stages || []).map((stage) => (
                    <div
                      key={stage.key}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {stage.label}
                        </p>

                        {stage.updatedAt && (
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(stage.updatedAt)}
                          </p>
                        )}
                      </div>

                      <StatusBadge value={stage.status} />
                    </div>
                  ))}
                </div>
              </section>

              {/* =================================================
                  COMPLETION
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Completion
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Caretaker Completed"
                    value={
                      selectedBooking.completion?.caretakerCompleted
                        ? "Yes"
                        : "No"
                    }
                  />

                  <InfoRow
                    label="Caretaker Completion"
                    value={formatDateTime(
                      selectedBooking.completion?.caretakerCompletedAt ||
                        selectedBooking.caretakerCompletedAt,
                    )}
                  />

                  <InfoRow
                    label="Client Completed"
                    value={
                      selectedBooking.completion?.clientCompleted ? "Yes" : "No"
                    }
                  />

                  <InfoRow
                    label="Client Completion"
                    value={formatDateTime(
                      selectedBooking.completion?.clientCompletedAt ||
                        selectedBooking.clientCompletedAt,
                    )}
                  />
                </div>
              </section>

              {/* =================================================
                  NOTES / CANCELLATION
              ================================================== */}

              {(selectedBooking.serviceNotes ||
                selectedBooking.cancellationReason) && (
                <section>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Notes
                  </h3>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                    {selectedBooking.serviceNotes && (
                      <InfoRow
                        label="Service Notes"
                        value={selectedBooking.serviceNotes}
                      />
                    )}

                    {selectedBooking.cancellationReason && (
                      <InfoRow
                        label="Cancellation Reason"
                        value={selectedBooking.cancellationReason}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* =================================================
                  BOOKING AUDIT
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Audit
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Booking ID"
                    value={
                      <span className="font-mono text-xs">
                        {selectedBooking._id}
                      </span>
                    }
                  />

                  <InfoRow
                    label="Created"
                    value={formatDateTime(selectedBooking.createdAt)}
                  />

                  <InfoRow
                    label="Last Updated"
                    value={formatDateTime(selectedBooking.updatedAt)}
                  />
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}

      <section className="admin-print-report hidden">
        {printingBooking && (
          <div className="mx-auto w-full max-w-[794px] bg-white p-8 text-slate-900">
            {/* Header */}
            <div className="border-b-2 border-[#003898] pb-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/carelink-logo.png"
                      alt="CareLink+"
                      className="h-12 w-auto object-contain"
                    />

                    <div>
                      <h1 className="text-2xl font-extrabold text-[#091E42]">
                        CareLink+
                      </h1>

                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Hospital Care Service
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment Receipt
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-[#091E42]">
                    {printingBooking.paymentId?.receiptNumber || "Not issued"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Generated {new Date().toLocaleDateString("en-LK")}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment Status
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {humanize(printingBooking.paymentId?.status || "pending")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Booking
                </p>

                <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                  #{String(printingBooking._id).slice(-8)}
                </p>
              </div>
            </div>

            {/* Booking Information */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Booking Information
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Status</p>
                  <p className="mt-1 font-semibold">
                    {humanize(printingBooking.status)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Scheduled Date
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDate(printingBooking.scheduledDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Start Time
                  </p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.startTime || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Created
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDateTime(printingBooking.createdAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Parent / Patient */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Parent / Patient
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Name</p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.parentId?.fullName || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">Age</p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.parentId?.age ?? "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">Gender</p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.parentId?.gender || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Contact
                  </p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.parentId?.contactNumber || "Not available"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400">
                    Address
                  </p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.parentId?.address || "Not available"}
                  </p>
                </div>
              </div>
            </section>

            {/* Caretaker */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Caretaker
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Name</p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.caretakerId?.name || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">Phone</p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.caretakerId?.phone || "Not available"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400">Email</p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.caretakerId?.email || "Not available"}
                  </p>
                </div>
              </div>
            </section>

            {/* Hospital */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Hospital Visit
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400">
                    Hospital
                  </p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.hospitalId?.name ||
                      printingBooking.hospitalSnapshot?.name ||
                      "Not available"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400">
                    Address
                  </p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.hospitalId?.address ||
                      printingBooking.hospitalSnapshot?.address ||
                      "Not available"}
                  </p>
                </div>
              </div>
            </section>

            {/* Route */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Pickup & Route
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400">
                    Pickup Address
                  </p>
                  <p className="mt-1 font-semibold">
                    {printingBooking.pickupLocation?.address || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Distance
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDistance(printingBooking.distanceKm)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Travel Duration
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDuration(printingBooking.durationMinutes)}
                  </p>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Payment Summary
              </h2>

              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm">
                  <span>Distance Charge</span>
                  <strong>
                    {formatCurrency(
                      printingBooking.pricing?.distanceCharge,
                      printingBooking.pricing?.currency || "LKR",
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm">
                  <span>Caretaker Service Charge</span>
                  <strong>
                    {formatCurrency(
                      printingBooking.pricing?.caretakerServiceCharge,
                      printingBooking.pricing?.currency || "LKR",
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm">
                  <span>
                    Admin Service Fee (
                    {printingBooking.pricing?.adminFeePercent ?? 15}%)
                  </span>
                  <strong>
                    {formatCurrency(
                      printingBooking.pricing?.adminFeeAmount,
                      printingBooking.pricing?.currency || "LKR",
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between bg-slate-50 px-4 py-4">
                  <span className="text-sm font-extrabold text-[#091E42]">
                    Total Paid
                  </span>

                  <strong className="text-lg font-extrabold text-[#003898]">
                    {formatCurrency(
                      printingBooking.paymentId?.amount ??
                        printingBooking.pricing?.total,
                      printingBooking.paymentId?.currency ||
                        printingBooking.pricing?.currency ||
                        "LKR",
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Payment Details */}
            <section className="mt-6">
              <h2 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#091E42]">
                Payment Details
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Payment Method
                  </p>
                  <p className="mt-1 font-semibold">
                    {humanize(
                      printingBooking.paymentId?.method || "Not available",
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Payment Status
                  </p>
                  <p className="mt-1 font-semibold">
                    {humanize(
                      printingBooking.paymentId?.status || "Not available",
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Receipt Number
                  </p>
                  <p className="mt-1 font-mono font-semibold">
                    {printingBooking.paymentId?.receiptNumber || "Not issued"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Paid At
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDateTime(printingBooking.paymentId?.paidAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-8 border-t border-slate-200 pt-5 text-center">
              <p className="text-sm font-bold text-[#091E42]">
                Thank you for using CareLink+
              </p>

              <p className="mt-1 text-xs text-slate-500">
                CareLink+ — Hospital Care Service Management Platform
              </p>
            </div>
          </div>
        )}
      </section>
      {editingBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close edit booking"
            onClick={() => setEditingBooking(null)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <p className="font-mono text-xs text-slate-400">
                  Booking #{String(editingBooking._id).slice(-8)}
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#091E42] dark:text-white">
                  Update Booking
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Booking Status
                </label>

                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="requested">Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="paid">Paid</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Scheduled Date
                  </label>

                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        scheduledDate: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Service Notes
                </label>

                <textarea
                  rows={4}
                  value={editForm.serviceNotes}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      serviceNotes: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Administrative service notes..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Cancellation Reason
                </label>

                <textarea
                  rows={3}
                  value={editForm.cancellationReason}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      cancellationReason: event.target.value,
                    }))
                  }
                  disabled={editForm.status !== "cancelled"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Required when cancelling..."
                />
              </div>

              {actionError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  {actionError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveBookingChanges}
                  disabled={savingBooking}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003898] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#002D73] disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {savingBooking ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {savingBooking ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
