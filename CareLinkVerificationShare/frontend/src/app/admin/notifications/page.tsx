"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminAPI } from "@/services/api";
import {
  Bell,
  CheckCircle2,
  FileText,
  User,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  CalendarDays,
  CircleAlert,
  Activity,
  CreditCard,
  ClipboardCheck,
  AlertTriangle,
  X,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

interface NotificationUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface NotificationItem {
  _id: string;

  userId?: NotificationUser | string | null;

  title?: string;

  message?: string;

  type?: string;

  isRead?: boolean;

  createdAt?: string | null;

  updatedAt?: string | null;
}

/* ============================================================
   TYPE ICONS
============================================================ */

const typeIcon: Record<
  string,
  React.ReactNode
> = {
  application_submitted: (
    <FileText className="h-5 w-5 text-[#003898] dark:text-blue-400" />
  ),

  application_approved: (
    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  ),

  application_rejected: (
    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
  ),

  profile_updated: (
    <User className="h-5 w-5 text-[#003898] dark:text-blue-400" />
  ),

  general: (
    <Bell className="h-5 w-5 text-[#003898] dark:text-blue-400" />
  ),

  booking_request: (
    <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  ),

  new_booking_request: (
    <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  ),

  booking_accepted: (
    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  ),

  booking_rejected: (
    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
  ),

  booking_cancelled: (
    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
  ),

  booking_completed: (
    <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  ),

  payment_success: (
    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  ),

  payment_pending: (
    <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
  ),

  payment_failed: (
    <CircleAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
  ),

  job_otp: (
    <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
  ),

  task_started: (
    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  ),

  care_progress: (
    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  ),

  task_completed: (
    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
  ),

  emergency: (
    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
  ),
};

/* ============================================================
   HELPERS
============================================================ */

function humanizeType(type?: string) {
  if (!type) {
    return "General";
  }

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function getUserName(
  user?: NotificationUser | string | null
) {
  if (!user) {
    return "N/A";
  }

  if (typeof user === "string") {
    return user;
  }

  return user.name || "N/A";
}

function getUserRole(
  user?: NotificationUser | string | null
) {
  if (!user || typeof user === "string") {
    return "";
  }

  return user.role || "";
}

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

function formatDateTime(
  value?: string | null
) {
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

function getNotificationIcon(
  type?: string
) {
  if (
    type &&
    typeIcon[type]
  ) {
    return typeIcon[type];
  }

  return (
    <Bell className="h-5 w-5 text-[#003898] dark:text-blue-400" />
  );
}

function getTypeCategory(
  notification: NotificationItem
) {
  const type =
    notification.type?.toLowerCase() || "";

  const title =
    notification.title?.toLowerCase() || "";

  const combined =
    `${type} ${title}`;

  if (
    combined.includes("application")
  ) {
    return "application";
  }

  if (
    combined.includes("booking") ||
    combined.includes("task") ||
    combined.includes("care progress") ||
    combined.includes("otp") ||
    combined.includes("hospital")
  ) {
    return "booking";
  }

  if (
    combined.includes("payment") ||
    combined.includes("payout")
  ) {
    return "payment";
  }

  if (
    combined.includes("profile") ||
    combined.includes("user")
  ) {
    return "account";
  }

  if (
    combined.includes("emergency") ||
    combined.includes("alert")
  ) {
    return "emergency";
  }

  return "general";
}

/* ============================================================
   BADGE
============================================================ */

function NotificationTypeBadge({
  type,
}: {
  type?: string;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {humanizeType(type)}
    </span>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* Existing type filter */
  const [filter, setFilter] =
    useState("all");

  /* New category filter */
  const [categoryFilter, setCategoryFilter] =
    useState("all");

  /* New read filter */
  const [readFilter, setReadFilter] =
    useState("all");

  /* New search */
  const [search, setSearch] =
    useState("");

  /* ==========================================================
     LOAD NOTIFICATIONS
  ========================================================== */

  const loadNotifications = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await adminAPI.getNotifications();

        const result =
          Array.isArray(
            data?.notifications
          )
            ? data.notifications
            : [];

        setNotifications(
          result as NotificationItem[]
        );
      } catch (err: unknown) {
        console.error(
          "Failed to load notifications:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load notifications."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /* ==========================================================
     NOTIFICATION TYPE OPTIONS
     
     Dynamic options are generated from the backend data,
     while existing known types remain available.
  ========================================================== */

  const typeOptions = useMemo(() => {
    const existingTypes = [
      "application_submitted",
      "application_approved",
      "application_rejected",
      "profile_updated",
      "general",
      "booking_request",
      "new_booking_request",
      "booking_accepted",
      "booking_rejected",
      "booking_cancelled",
      "booking_completed",
      "payment_success",
      "payment_pending",
      "payment_failed",
      "job_otp",
      "task_started",
      "care_progress",
      "task_completed",
      "emergency",
    ];

    const backendTypes =
      notifications
        .map(
          (notification) =>
            notification.type
        )
        .filter(
          (
            type
          ): type is string =>
            Boolean(type)
        );

    return Array.from(
      new Set([
        ...existingTypes,
        ...backendTypes,
      ])
    ).sort();
  }, [notifications]);

  /* ==========================================================
     FILTERED NOTIFICATIONS
  ========================================================== */

  const filteredNotifications =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return notifications.filter(
        (notification) => {
          const name =
            getUserName(
              notification.userId
            );

          const role =
            getUserRole(
              notification.userId
            );

          const title =
            notification.title || "";

          const message =
            notification.message || "";

          const type =
            notification.type || "";

          const matchesSearch =
            !searchValue ||
            name
              .toLowerCase()
              .includes(searchValue) ||
            role
              .toLowerCase()
              .includes(searchValue) ||
            title
              .toLowerCase()
              .includes(searchValue) ||
            message
              .toLowerCase()
              .includes(searchValue) ||
            type
              .toLowerCase()
              .includes(searchValue);

          const matchesType =
            filter === "all" ||
            notification.type ===
              filter;

          const matchesCategory =
            categoryFilter ===
              "all" ||
            getTypeCategory(
              notification
            ) === categoryFilter;

          const matchesRead =
            readFilter === "all" ||
            (readFilter === "unread"
              ? notification.isRead ===
                false
              : notification.isRead ===
                true);

          return (
            matchesSearch &&
            matchesType &&
            matchesCategory &&
            matchesRead
          );
        }
      );
    }, [
      notifications,
      filter,
      categoryFilter,
      readFilter,
      search,
    ]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    const total =
      notifications.length;

    const unread =
      notifications.filter(
        (notification) =>
          notification.isRead ===
          false
      ).length;

    const application =
      notifications.filter(
        (notification) =>
          getTypeCategory(
            notification
          ) === "application"
      ).length;

    const booking =
      notifications.filter(
        (notification) =>
          getTypeCategory(
            notification
          ) === "booking"
      ).length;

    return {
      total,
      unread,
      application,
      booking,
    };
  }, [notifications]);

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
            />
          ))}
        </div>

        <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />

        <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  /* ==========================================================
     EMPTY / RENDER
  ========================================================== */

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#091E42] dark:text-white">
            System Notifications
          </h1>

          <p className="mt-2 text-[#42526E] dark:text-slate-400">
            Monitor platform events,
            application updates, booking activity
            and system notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadNotifications(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#003898] hover:text-[#003898] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
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

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Notifications
            </p>

            <Bell className="h-5 w-5 text-[#003898] dark:text-blue-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[#091E42] dark:text-white">
            {summary.total}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Complete notification history
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Unread
            </p>

            <CircleAlert className="h-5 w-5 text-amber-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {summary.unread}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Requires attention
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Application Events
            </p>

            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.application}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Caretaker application activity
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Booking Events
            </p>

            <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-violet-600 dark:text-violet-400">
            {summary.booking}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Booking and care activity
          </p>
        </div>
      </div>

      {/* ======================================================
          NOTIFICATION TABLE
      ======================================================= */}

      <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Section Header */}

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#091E42] dark:text-white">
                Recent Notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Platform notification history.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-sm font-semibold text-[#003898] dark:bg-blue-950/40 dark:text-blue-300">
              {filteredNotifications.length} Notifications
            </span>
          </div>

          {/* ==================================================
              FILTER PANEL
          =================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="grid gap-3 xl:grid-cols-4">
              {/* Search */}

              <div className="relative xl:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search notifications..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#003898] focus:ring-4 focus:ring-[#003898]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Type */}

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#003898] dark:text-blue-400" />

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value
                    )
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pl-10 text-sm font-medium text-[#091E42] outline-none focus:border-[#003898] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">
                    All notification types
                  </option>

                  {typeOptions.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {humanizeType(
                          type
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Category */}

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#091E42] outline-none focus:border-[#003898] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">
                  All categories
                </option>

                <option value="application">
                  Applications
                </option>

                <option value="booking">
                  Bookings & Care
                </option>

                <option value="payment">
                  Payments
                </option>

                <option value="account">
                  Account
                </option>

                <option value="emergency">
                  Emergency
                </option>

                <option value="general">
                  General
                </option>
              </select>

              {/* Read state */}

              <select
                value={readFilter}
                onChange={(event) =>
                  setReadFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#091E42] outline-none focus:border-[#003898] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">
                  All read states
                </option>

                <option value="unread">
                  Unread
                </option>

                <option value="read">
                  Read
                </option>
              </select>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Filter className="h-3.5 w-3.5" />

                <span>
                  Showing{" "}
                  {
                    filteredNotifications.length
                  }{" "}
                  of{" "}
                  {notifications.length}
                  {" "}
                  notifications
                </span>
              </div>

              {(search ||
                filter !== "all" ||
                categoryFilter !== "all" ||
                readFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setCategoryFilter(
                      "all"
                    );
                    setReadFilter(
                      "all"
                    );
                  }}
                  className="text-xs font-semibold text-[#003898] hover:underline dark:text-blue-400"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            TABLE
        ===================================================== */}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="border-b border-[#E6EEFF] bg-[#F8FAFF] dark:border-slate-800 dark:bg-slate-950">
              <tr>
                {[
                  "Type",
                  "User",
                  "Title",
                  "Message",
                  "Status",
                  "Time",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#42526E] dark:text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E6EEFF] dark:divide-slate-800">
              {filteredNotifications.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center"
                  >
                    <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

                    <h3 className="mt-4 text-lg font-semibold text-[#091E42] dark:text-white">
                      No notifications found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      There are no notifications matching
                      the selected filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map(
                  (notification) => {
                    const userName =
                      getUserName(
                        notification.userId
                      );

                    const userRole =
                      getUserRole(
                        notification.userId
                      );

                    return (
                      <tr
                        key={
                          notification._id
                        }
                        className={`transition hover:bg-[#F8FBFF] dark:hover:bg-slate-800/50 ${
                          notification.isRead ===
                          false
                            ? "bg-blue-50/30 dark:bg-blue-950/10"
                            : ""
                        }`}
                      >
                        {/* Type */}

                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E6EEFF] bg-[#F8FAFF] dark:border-slate-700 dark:bg-slate-950">
                              {
                                getNotificationIcon(
                                  notification.type
                                )
                              }
                            </div>

                            <NotificationTypeBadge
                              type={
                                notification.type
                              }
                            />
                          </div>
                        </td>

                        {/* User */}

                        <td className="px-5 py-4 align-top">
                          <div className="font-semibold text-[#091E42] dark:text-white">
                            {userName}
                          </div>

                          {userRole && (
                            <div className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                              {userRole.replace(
                                /_/g,
                                " "
                              )}
                            </div>
                          )}
                        </td>

                        {/* Title */}

                        <td className="px-5 py-4 align-top">
                          <div className="max-w-xs font-semibold text-[#091E42] dark:text-slate-100">
                            {notification.title ||
                              "Notification"}
                          </div>
                        </td>

                        {/* Message */}

                        <td className="max-w-xl px-5 py-4 align-top">
                          <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                            {notification.message ||
                              "No message"}
                          </p>
                        </td>

                        {/* Read status */}

                        <td className="px-5 py-4 align-top">
                          {notification.isRead ===
                          false ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              Unread
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Read
                            </span>
                          )}
                        </td>

                        {/* Time */}

                        <td className="whitespace-nowrap px-5 py-4 align-top text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(
                            notification.createdAt
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}