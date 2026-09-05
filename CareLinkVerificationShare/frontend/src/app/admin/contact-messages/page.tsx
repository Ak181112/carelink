"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Flag,
  Mail,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  StickyNote,
  X,
} from "lucide-react";

import { contactAPI } from "@/services/api";

/* ============================================================
   TYPES
============================================================ */

interface ContactReply {
  _id?: string;
  message: string;
  sentTo: string;
  sentBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  sentAt?: string | null;
  subject?: string;
}

interface ContactMessage {
  _id: string;

  name: string;
  email: string;
  phone?: string;

  subject: string;
  message: string;

  status:
    | "new"
    | "read"
    | "in_progress"
    | "awaiting_user"
    | "resolved"
    | "closed";

  priority?:
    | "low"
    | "normal"
    | "high"
    | "urgent";

  adminNote?: string;

  replies?: ContactReply[];

  readAt?: string | null;
  readBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;

  resolvedAt?: string | null;
  resolvedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;

  lastRepliedAt?: string | null;
  lastRepliedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;

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

function humanize(value?: string | null) {
  if (!value) return "Not available";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function statusClasses(
  status?: string
) {
  switch (status) {
    case "resolved":
    case "closed":
      return "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300";

    case "in_progress":
      return "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300";

    case "awaiting_user":
      return "border-violet-100 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300";

    case "read":
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

    case "new":
      return "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function priorityClasses(
  priority?: string
) {
  switch (priority) {
    case "urgent":
      return "border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300";

    case "high":
      return "border-orange-100 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-300";

    case "low":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";

    default:
      return "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300";
  }
}

/* ============================================================
   BADGES
============================================================ */

function StatusBadge({
  status,
}: {
  status?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
        status
      )}`}
    >
      {humanize(status)}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(
        priority
      )}`}
    >
      <Flag className="h-3 w-3" />
      {humanize(priority || "normal")}
    </span>
  );
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
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="max-w-[70%] text-right text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<
    ContactMessage[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const [replyText, setReplyText] =
    useState("");

  const [replyStatus, setReplyStatus] =
    useState(
      "awaiting_user"
    );

  const [replying, setReplying] =
    useState(false);

  const [prioritySaving, setPrioritySaving] =
    useState(false);

  const [noteSaving, setNoteSaving] =
    useState(false);

  const [adminNote, setAdminNote] =
    useState("");

  /* ==========================================================
     LOAD MESSAGES
  ========================================================== */

  const load = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await contactAPI.list();

        setMessages(
          Array.isArray(data?.messages)
            ? data.messages
            : []
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load contact messages."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  /* ==========================================================
     STATUS OPTIONS
  ========================================================== */

  const statusOptions = [
    "new",
    "read",
    "in_progress",
    "awaiting_user",
    "resolved",
    "closed",
  ];

  const priorityOptions = [
    "low",
    "normal",
    "high",
    "urgent",
  ];

  /* ==========================================================
     FILTER MESSAGES
  ========================================================== */

  const filteredMessages =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return messages.filter(
        (message) => {
          const matchesSearch =
            !value ||
            message.name
              .toLowerCase()
              .includes(value) ||
            message.email
              .toLowerCase()
              .includes(value) ||
            message.subject
              .toLowerCase()
              .includes(value) ||
            message.message
              .toLowerCase()
              .includes(value);

          const matchesStatus =
            statusFilter === "all" ||
            message.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter === "all" ||
            (message.priority ||
              "normal") ===
              priorityFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    }, [
      messages,
      search,
      statusFilter,
      priorityFilter,
    ]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    return {
      total: messages.length,

      newMessages: messages.filter(
        (message) =>
          message.status === "new"
      ).length,

      inProgress: messages.filter(
        (message) =>
          message.status ===
          "in_progress"
      ).length,

      unresolved: messages.filter(
        (message) =>
          ![
            "resolved",
            "closed",
          ].includes(
            message.status
          )
      ).length,
    };
  }, [messages]);

  /* ==========================================================
     STATUS UPDATE
  ========================================================== */

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    try {
      setError("");

      await contactAPI.updateStatus(
        id,
        status
      );

      await load();

      if (
        selectedMessage?._id === id
      ) {
        setSelectedMessage(
          (current) =>
            current
              ? {
                  ...current,
                  status:
                    status as ContactMessage["status"],
                }
              : null
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update message status."
      );
    }
  };

  /* ==========================================================
     MARK AS READ
  ========================================================== */

  const markAsRead = async (
    message: ContactMessage
  ) => {
    try {
      setError("");

      await contactAPI.markAsRead(
        message._id
      );

      await load();

      setSelectedMessage(
        (current) =>
          current
            ? {
                ...current,
                status:
                  current.status === "new"
                    ? "read"
                    : current.status,
                readAt:
                  new Date().toISOString(),
              }
            : null
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark message as read."
      );
    }
  };

  /* ==========================================================
     PRIORITY
  ========================================================== */

  const updatePriority =
    async (
      id: string,
      priority: string
    ) => {
      try {
        setPrioritySaving(true);
        setError("");

        await contactAPI.updatePriority(
          id,
          priority
        );

        await load();

        setSelectedMessage(
          (current) =>
            current
              ? {
                  ...current,
                  priority:
                    priority as ContactMessage["priority"],
                }
              : null
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update priority."
        );
      } finally {
        setPrioritySaving(false);
      }
    };

  /* ==========================================================
     INTERNAL NOTE
  ========================================================== */

  const saveAdminNote =
    async () => {
      if (!selectedMessage) return;

      try {
        setNoteSaving(true);
        setError("");

        await contactAPI.updateNote(
          selectedMessage._id,
          adminNote
        );

        await load();

        setSelectedMessage(
          (current) =>
            current
              ? {
                  ...current,
                  adminNote,
                }
              : null
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save internal note."
        );
      } finally {
        setNoteSaving(false);
      }
    };

  /* ==========================================================
     REPLY
  ========================================================== */

  const sendReply = async () => {
    if (!selectedMessage) return;

    const message =
      replyText.trim();

    if (!message) {
      setError(
        "Please enter a reply message."
      );
      return;
    }

    try {
      setReplying(true);
      setError("");

      const response =
        await contactAPI.reply(
          selectedMessage._id,
          message,
          replyStatus
        );

      const updated =
        response?.contactMessage;

      if (updated) {
        setSelectedMessage(
          updated
        );
      }

      setReplyText("");

      await load();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reply."
      );
    } finally {
      setReplying(false);
    }
  };

  /* ==========================================================
     OPEN MESSAGE
  ========================================================== */

  const openMessage =
    async (
      message: ContactMessage
    ) => {
      setSelectedMessage(
        message
      );

      setReplyText("");

      setAdminNote(
        message.adminNote ||
          ""
      );

      setReplyStatus(
        message.status ===
          "resolved"
          ? "resolved"
          : "awaiting_user"
      );

      if (
        message.status === "new"
      ) {
        await markAsRead(
          message
        );
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

        <div className="h-5 w-96 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({
            length: 4,
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
          <h1 className="text-3xl font-bold tracking-tight text-[#091E42] dark:text-white">
            Contact Messages
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Manage customer enquiries,
            support responses and message
            resolution.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            load(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0052CC] hover:text-[#0052CC] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
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
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="shrink-0 rounded-lg p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          SUMMARY
      ======================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Messages
          </p>

          <p className="mt-2 text-3xl font-bold text-[#091E42] dark:text-white">
            {summary.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {summary.newMessages}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            In Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.inProgress}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Unresolved
          </p>

          <p className="mt-2 text-3xl font-bold text-violet-600 dark:text-violet-400">
            {summary.unresolved}
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
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, email, subject or message..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">
              All statuses
            </option>

            {statusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {humanize(status)}
                </option>
              )
            )}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">
              All priorities
            </option>

            {priorityOptions.map(
              (priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {humanize(priority)}
                </option>
              )
            )}
          </select>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing{" "}
          {filteredMessages.length} of{" "}
          {messages.length} messages
        </p>
      </div>

      {/* ======================================================
          MESSAGE LIST
      ======================================================= */}

      <div className="space-y-4">
        {filteredMessages.map(
          (message) => (
            <article
              key={message._id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
                message.status === "new"
                  ? "border-amber-200 dark:border-amber-900/50"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-[#091E42] dark:text-white">
                      {message.subject}
                    </h2>

                    <StatusBadge
                      status={
                        message.status
                      }
                    />

                    <PriorityBadge
                      priority={
                        message.priority ||
                        "normal"
                      }
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {message.name}
                    {" · "}
                    {message.email}

                    {message.phone
                      ? ` · ${message.phone}`
                      : ""}
                  </p>

                  <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {message.message}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                    <span>
                      Received{" "}
                      {formatDateTime(
                        message.createdAt
                      )}
                    </span>

                    {message.replies &&
                      message.replies
                        .length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {
                            message.replies
                              .length
                          }{" "}
                          {message.replies
                            .length === 1
                            ? "reply"
                            : "replies"}
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openMessage(
                        message
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#0052CC] hover:bg-blue-50 hover:text-[#0052CC] dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                  >
                    <Eye className="h-4 w-4" />
                    View
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {message.status ===
                    "new" && (
                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(
                          message
                        )
                      }
                      title="Mark as read"
                      aria-label="Mark as read"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        )}

        {filteredMessages.length ===
          0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <Mail className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              No contact messages found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing your search or
              filters.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          DETAIL DRAWER
      ======================================================= */}

      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close message details"
            onClick={() =>
              setSelectedMessage(
                null
              )
            }
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* Drawer */}

          <aside className="relative z-10 h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {/* Header */}

            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-slate-400">
                    Message #
                    {String(
                      selectedMessage._id
                    ).slice(-8)}
                  </p>

                  <h2 className="mt-1 truncate text-xl font-bold text-[#091E42] dark:text-white">
                    {selectedMessage.subject}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge
                      status={
                        selectedMessage.status
                      }
                    />

                    <PriorityBadge
                      priority={
                        selectedMessage.priority ||
                        "normal"
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMessage(
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
              {/* =================================================
                  CUSTOMER
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Customer Information
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Name"
                    value={
                      selectedMessage.name
                    }
                  />

                  <InfoRow
                    label="Email"
                    value={
                      selectedMessage.email
                    }
                  />

                  <InfoRow
                    label="Phone"
                    value={
                      selectedMessage.phone ||
                      "Not provided"
                    }
                  />

                  <InfoRow
                    label="Received"
                    value={formatDateTime(
                      selectedMessage.createdAt
                    )}
                  />
                </div>
              </section>

              {/* =================================================
                  MESSAGE
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Original Message
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {selectedMessage.message}
                  </p>
                </div>
              </section>

              {/* =================================================
                  STATUS
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Message Status
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={
                      selectedMessage.status
                    }
                    onChange={async (
                      event
                    ) => {
                      await updateStatus(
                        selectedMessage._id,
                        event.target.value
                      );
                    }}
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {statusOptions.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {humanize(
                            status
                          )}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      markAsRead(
                        selectedMessage
                      )
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Read
                  </button>
                </div>

                {selectedMessage.readAt && (
                  <p className="mt-2 text-xs text-slate-400">
                    Read{" "}
                    {formatDateTime(
                      selectedMessage.readAt
                    )}
                    {selectedMessage
                      .readBy?.name
                      ? ` by ${selectedMessage.readBy.name}`
                      : ""}
                  </p>
                )}
              </section>

              {/* =================================================
                  PRIORITY
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Priority
                </h3>

                <select
                  value={
                    selectedMessage.priority ||
                    "normal"
                  }
                  disabled={
                    prioritySaving
                  }
                  onChange={(event) =>
                    updatePriority(
                      selectedMessage._id,
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {priorityOptions.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {humanize(
                          priority
                        )}
                      </option>
                    )
                  )}
                </select>
              </section>

              {/* =================================================
                  REPLY HISTORY
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <MessageCircle className="h-4 w-4" />
                  Conversation
                </h3>

                <div className="space-y-4">
                  {/* Original */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedMessage.name}
                      </p>

                      <span className="text-xs text-slate-400">
                        {formatDateTime(
                          selectedMessage.createdAt
                        )}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {
                        selectedMessage.message
                      }
                    </p>
                  </div>

                  {/* Replies */}

                  {(
                    selectedMessage.replies ||
                    []
                  ).map(
                    (reply, index) => (
                      <div
                        key={
                          reply._id ||
                          `${reply.sentAt}-${index}`
                        }
                        className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-950/20"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                            {reply.sentBy
                              ?.name ||
                              "CareLink+ Support"}
                          </p>

                          <span className="text-xs text-slate-400">
                            {formatDateTime(
                              reply.sentAt
                            )}
                          </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                          {reply.message}
                        </p>
                      </div>
                    )
                  )}

                  {(
                    selectedMessage.replies ||
                    []
                  ).length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-400 dark:border-slate-700">
                      No replies have been
                      sent yet.
                    </p>
                  )}
                </div>
              </section>

              {/* =================================================
                  SEND REPLY
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <Send className="h-4 w-4" />
                  Reply by Email
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="To"
                    value={
                      selectedMessage.email
                    }
                  />

                  <InfoRow
                    label="Subject"
                    value={
                      selectedMessage.subject
                        .toLowerCase()
                        .startsWith("re:")
                        ? selectedMessage.subject
                        : `Re: ${selectedMessage.subject}`
                    }
                  />

                  <div className="pt-4">
                    <textarea
                      value={replyText}
                      onChange={(event) =>
                        setReplyText(
                          event.target.value
                        )
                      }
                      rows={7}
                      maxLength={10000}
                      placeholder="Write your response to the customer..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          After reply
                        </label>

                        <select
                          value={
                            replyStatus
                          }
                          onChange={(
                            event
                          ) =>
                            setReplyStatus(
                              event.target.value
                            )
                          }
                          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          <option value="awaiting_user">
                            Awaiting User
                          </option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="resolved">
                            Resolved
                          </option>

                          <option value="closed">
                            Closed
                          </option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-xs text-slate-400">
                          {replyText.length}
                          /10000
                        </span>

                        <button
                          type="button"
                          onClick={
                            sendReply
                          }
                          disabled={
                            replying ||
                            !replyText.trim()
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003898] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0747A6] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {replying ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  INTERNAL NOTE
              ================================================== */}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <StickyNote className="h-4 w-4" />
                  Internal Admin Note
                </h3>

                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="This note is private and will never be sent to the customer."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={
                      saveAdminNote
                    }
                    disabled={
                      noteSaving
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#0052CC] hover:text-[#0052CC] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:text-blue-400"
                  >
                    {noteSaving
                      ? "Saving..."
                      : "Save Note"}
                  </button>
                </div>
              </section>

              {/* =================================================
                  RESOLUTION AUDIT
              ================================================== */}

              {(selectedMessage.resolvedAt ||
                selectedMessage.lastRepliedAt) && (
                <section>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Audit Information
                  </h3>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                    {selectedMessage.lastRepliedAt && (
                      <InfoRow
                        label="Last Replied"
                        value={formatDateTime(
                          selectedMessage.lastRepliedAt
                        )}
                      />
                    )}

                    {selectedMessage
                      .lastRepliedBy
                      ?.name && (
                      <InfoRow
                        label="Replied By"
                        value={
                          selectedMessage
                            .lastRepliedBy
                            .name
                        }
                      />
                    )}

                    {selectedMessage.resolvedAt && (
                      <InfoRow
                        label="Resolved"
                        value={formatDateTime(
                          selectedMessage.resolvedAt
                        )}
                      />
                    )}

                    {selectedMessage
                      .resolvedBy
                      ?.name && (
                      <InfoRow
                        label="Resolved By"
                        value={
                          selectedMessage
                            .resolvedBy
                            .name
                        }
                      />
                    )}
                  </div>
                </section>
              )}

              {/* =================================================
                  CLOSE
              ================================================== */}

              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMessage(
                      null
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
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