// "use client";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   BarChart3,
//   CheckCircle2,
//   ChevronRight,
//   MessageSquareText,
//   RefreshCw,
//   Search,
//   Star,
//   ThumbsUp,
//   UserRound,
//   X,
// } from "lucide-react";

// import { feedbackAPI } from "@/services/api";
// export default function AdminFeedbackPage(){const [rows,setRows]=useState<any[]>([]);useEffect(()=>{feedbackAPI.listAdmin().then(d=>setRows(d.feedback||[]));},[]);return <div><h1 className="text-3xl font-bold text-[#091E42]">Feedback Monitoring</h1><p className="text-slate-500 mt-1">Real client feedback from paid bookings.</p><div className="mt-6 space-y-4">{rows.map(f=><div key={f._id} className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="font-bold">{f.clientId?.name} → {f.caretakerId?.name}</p><p className="text-amber-500 mt-1">{"★".repeat(f.rating)}<span className="text-slate-300">{"★".repeat(5-f.rating)}</span></p></div><span className="text-sm text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span></div><p className="mt-4 text-slate-700">{f.comment||"No written comment"}</p></div>)}</div></div>}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  MessageSquareText,
  RefreshCw,
  Search,
  Star,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";

import { feedbackAPI } from "@/services/api";

/* ============================================================
   TYPES
============================================================ */

interface FeedbackUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

interface Feedback {
  _id: string;

  clientId?: FeedbackUser | string | null;

  caretakerId?: FeedbackUser | string | null;

  bookingId?:
    | string
    | {
        _id?: string;
      }
    | null;

  rating: number;

  comment?: string;

  wouldRecommend?: boolean;

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
    return "Not available";
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

function getUserName(
  user?: FeedbackUser | string | null
) {
  if (!user) return "Unknown";

  if (typeof user === "string") {
    return user;
  }

  return user.name || "Unknown";
}

function getUserEmail(
  user?: FeedbackUser | string | null
) {
  if (!user || typeof user === "string") {
    return "";
  }

  return user.email || "";
}

function getBookingId(
  bookingId?: string | { _id?: string } | null
) {
  if (!bookingId) return "";

  if (typeof bookingId === "string") {
    return bookingId;
  }

  return bookingId._id || "";
}

function getInitials(name: string) {
  if (!name || name === "Unknown") {
    return "U";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getRatingLabel(rating: number) {
  switch (rating) {
    case 5:
      return "Excellent";

    case 4:
      return "Very Good";

    case 3:
      return "Good";

    case 2:
      return "Needs Improvement";

    case 1:
      return "Poor";

    default:
      return "Not Rated";
  }
}

function getRatingClasses(rating: number) {
  if (rating >= 5) {
    return "text-emerald-600 dark:text-emerald-400";
  }

  if (rating >= 4) {
    return "text-blue-600 dark:text-blue-400";
  }

  if (rating >= 3) {
    return "text-amber-600 dark:text-amber-400";
  }

  return "text-rose-600 dark:text-rose-400";
}

/* ============================================================
   STAR DISPLAY
============================================================ */

function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const starClass =
    size === "md"
      ? "h-5 w-5"
      : "h-4 w-4";

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({
        length: 5,
      }).map((_, index) => {
        const filled =
          index < rating;

        return (
          <Star
            key={index}
            className={`${starClass} ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-700"
            }`}
          />
        );
      })}
    </div>
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

      <span className="max-w-[65%] text-right text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminFeedbackPage() {
  const [rows, setRows] =
    useState<Feedback[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [ratingFilter, setRatingFilter] =
    useState("all");

  const [caretakerFilter, setCaretakerFilter] =
    useState("all");

  const [selectedFeedback, setSelectedFeedback] =
    useState<Feedback | null>(null);

  /* ==========================================================
     LOAD FEEDBACK
  ========================================================== */

  const loadFeedback = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await feedbackAPI.listAdmin();

        const feedback =
          Array.isArray(data?.feedback)
            ? data.feedback
            : [];

        setRows(
          feedback as Feedback[]
        );
      } catch (err: unknown) {
        console.error(
          "Failed to load admin feedback:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load feedback."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  /* ==========================================================
     CARETAKER OPTIONS
  ========================================================== */

  const caretakerOptions = useMemo(() => {
    const names = rows
      .map((feedback) =>
        getUserName(
          feedback.caretakerId
        )
      )
      .filter(
        (name) => name !== "Unknown"
      );

    return Array.from(
      new Set(names)
    ).sort();
  }, [rows]);

  /* ==========================================================
     FILTERED FEEDBACK
  ========================================================== */

  const filteredRows = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return rows.filter((feedback) => {
      const clientName =
        getUserName(
          feedback.clientId
        );

      const caretakerName =
        getUserName(
          feedback.caretakerId
        );

      const comment =
        feedback.comment || "";

      const bookingId =
        getBookingId(
          feedback.bookingId
        );

      const matchesSearch =
        !searchValue ||
        clientName
          .toLowerCase()
          .includes(searchValue) ||
        caretakerName
          .toLowerCase()
          .includes(searchValue) ||
        comment
          .toLowerCase()
          .includes(searchValue) ||
        bookingId
          .toLowerCase()
          .includes(searchValue);

      const matchesRating =
        ratingFilter === "all" ||
        feedback.rating ===
          Number(ratingFilter);

      const matchesCaretaker =
        caretakerFilter === "all" ||
        caretakerName ===
          caretakerFilter;

      return (
        matchesSearch &&
        matchesRating &&
        matchesCaretaker
      );
    });
  }, [
    rows,
    search,
    ratingFilter,
    caretakerFilter,
  ]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary = useMemo(() => {
    const total =
      rows.length;

    const totalRating =
      rows.reduce(
        (sum, feedback) =>
          sum +
          Number(
            feedback.rating || 0
          ),
        0
      );

    const averageRating =
      total > 0
        ? totalRating / total
        : 0;

    const fiveStar =
      rows.filter(
        (feedback) =>
          Number(
            feedback.rating
          ) === 5
      ).length;

    const lowRating =
      rows.filter(
        (feedback) =>
          Number(
            feedback.rating
          ) <= 2
      ).length;

    const recommendationCount =
      rows.filter(
        (feedback) =>
          typeof feedback.wouldRecommend ===
          "boolean"
      ).length;

    const recommendations =
      rows.filter(
        (feedback) =>
          feedback.wouldRecommend ===
          true
      ).length;

    const recommendationRate =
      recommendationCount > 0
        ? (recommendations /
            recommendationCount) *
          100
        : null;

    return {
      total,
      averageRating,
      fiveStar,
      lowRating,
      recommendationRate,
    };
  }, [rows]);

  /* ==========================================================
     RATING DISTRIBUTION
  ========================================================== */

  const ratingDistribution =
    useMemo(() => {
      return [5, 4, 3, 2, 1].map(
        (rating) => {
          const count =
            rows.filter(
              (feedback) =>
                Number(
                  feedback.rating
                ) === rating
            ).length;

          const percentage =
            rows.length > 0
              ? (count /
                  rows.length) *
                100
              : 0;

          return {
            rating,
            count,
            percentage,
          };
        }
      );
    }, [rows]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="space-y-7">
        <div>
          <div className="h-9 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-3 h-5 w-[30rem] max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
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

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />

          <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
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
            Feedback Monitoring
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Monitor client satisfaction,
            caretaker performance and service
            quality from paid bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadFeedback(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0052CC] hover:text-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
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
              Total Feedback
            </p>

            <MessageSquareText className="h-5 w-5 text-[#0052CC]" />
          </div>

          <p className="mt-3 text-3xl font-bold text-[#091E42] dark:text-white">
            {summary.total}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            All submitted reviews
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Average Rating
            </p>

            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <p className="text-3xl font-bold text-[#091E42] dark:text-white">
              {summary.averageRating.toFixed(
                1
              )}
            </p>

            <RatingStars
              rating={Math.round(
                summary.averageRating
              )}
              size="sm"
            />
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Out of 5.0
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              5-Star Reviews
            </p>

            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.fiveStar}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Excellent client feedback
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Recommendation Rate
            </p>

            <ThumbsUp className="h-5 w-5 text-blue-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.recommendationRate !==
            null
              ? `${summary.recommendationRate.toFixed(0)}%`
              : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Based on available recommendation data
          </p>
        </div>
      </div>

      {/* ======================================================
          ANALYTICS
      ======================================================= */}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Rating distribution */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-[#0052CC]" />

            <div>
              <h2 className="font-bold text-[#091E42] dark:text-white">
                Rating Distribution
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overall client satisfaction
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {ratingDistribution.map(
              ({
                rating,
                count,
                percentage,
              }) => (
                <div
                  key={rating}
                  className="flex items-center gap-4"
                >
                  <div className="flex w-16 items-center gap-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {rating}
                    </span>

                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-[#0052CC] transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="w-20 text-right">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {count}
                    </span>

                    <span className="ml-1 text-xs text-slate-400">
                      ({percentage.toFixed(
                        0
                      )}%)
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Quality overview */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />

            <div>
              <h2 className="font-bold text-[#091E42] dark:text-white">
                Service Quality Overview
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key quality indicators
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Average Rating
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current client satisfaction score
                </p>
              </div>

              <span
                className={`text-lg font-bold ${getRatingClasses(
                  Math.round(
                    summary.averageRating
                  )
                )}`}
              >
                {summary.averageRating.toFixed(
                  1
                )}
                /5
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  5-Star Share
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Percentage of excellent ratings
                </p>
              </div>

              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {summary.total > 0
                  ? (
                      (summary.fiveStar /
                        summary.total) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Low Ratings
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Ratings requiring attention
                </p>
              </div>

              <span
                className={`text-lg font-bold ${
                  summary.lowRating > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {summary.lowRating}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================
          FILTER BAR
      ======================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
              placeholder="Search client, caretaker, booking or comment..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) =>
              setRatingFilter(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">
              All ratings
            </option>

            <option value="5">
              5 Stars
            </option>

            <option value="4">
              4 Stars
            </option>

            <option value="3">
              3 Stars
            </option>

            <option value="2">
              2 Stars
            </option>

            <option value="1">
              1 Star
            </option>
          </select>

          <select
            value={caretakerFilter}
            onChange={(event) =>
              setCaretakerFilter(
                event.target.value
              )
            }
            className="h-11 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0052CC] lg:w-64 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">
              All Caretakers
            </option>

            {caretakerOptions.map(
              (name) => (
                <option
                  key={name}
                  value={name}
                >
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing{" "}
          {filteredRows.length} of{" "}
          {rows.length} feedback records
        </div>
      </section>

      {/* ======================================================
          FEEDBACK LIST
      ======================================================= */}

      <section className="space-y-4">
        {filteredRows.map(
          (feedback) => {
            const clientName =
              getUserName(
                feedback.clientId
              );

            const caretakerName =
              getUserName(
                feedback.caretakerId
              );

            const bookingId =
              getBookingId(
                feedback.bookingId
              );

            const numericRating =
              Math.max(
                0,
                Math.min(
                  5,
                  Number(
                    feedback.rating || 0
                  )
                )
              );

            return (
              <article
                key={feedback._id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
                  numericRating <= 2
                    ? "border-rose-200 dark:border-rose-900/50"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    {/* Participants */}

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0052CC] dark:bg-blue-950/40 dark:text-blue-300">
                          {getInitials(
                            clientName
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#091E42] dark:text-white">
                            {clientName}
                          </p>

                          {getUserEmail(
                            feedback.clientId
                          ) && (
                            <p className="text-xs text-slate-400">
                              {getUserEmail(
                                feedback.clientId
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-slate-300 dark:text-slate-700">
                        →
                      </span>

                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {caretakerName}
                      </p>
                    </div>

                    {/* Rating */}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <RatingStars
                        rating={
                          numericRating
                        }
                      />

                      <span
                        className={`text-sm font-semibold ${getRatingClasses(
                          numericRating
                        )}`}
                      >
                        {getRatingLabel(
                          numericRating
                        )}
                      </span>

                      {typeof feedback.wouldRecommend ===
                        "boolean" && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            feedback.wouldRecommend
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : "border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />

                          {feedback.wouldRecommend
                            ? "Would Recommend"
                            : "Would Not Recommend"}
                        </span>
                      )}

                      {numericRating <=
                        2 && (
                        <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                          Requires Attention
                        </span>
                      )}
                    </div>

                    {/* Comment */}

                    <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                      {feedback.comment ||
                        "No written comment"}
                    </p>

                    {/* Metadata */}

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                      <span>
                        Submitted{" "}
                        {formatDateTime(
                          feedback.createdAt
                        )}
                      </span>

                      {bookingId && (
                        <span className="font-mono">
                          Booking #
                          {bookingId.slice(
                            -8
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View */}

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFeedback(
                          feedback
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#0052CC] hover:bg-blue-50 hover:text-[#0052CC] dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          }
        )}

        {filteredRows.length ===
          0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <MessageSquareText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              No feedback found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </section>

      {/* ======================================================
          FEEDBACK DETAILS DRAWER
      ======================================================= */}

      {selectedFeedback && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close feedback details"
            onClick={() =>
              setSelectedFeedback(
                null
              )
            }
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* Drawer */}

          <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {/* Drawer header */}

            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-slate-400">
                    Feedback #
                    {String(
                      selectedFeedback._id
                    ).slice(-8)}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#091E42] dark:text-white">
                    Feedback Details
                  </h2>

                  <div className="mt-3 flex items-center gap-3">
                    <RatingStars
                      rating={Math.max(
                        0,
                        Math.min(
                          5,
                          Number(
                            selectedFeedback.rating ||
                              0
                          )
                        )
                      )}
                      size="md"
                    />

                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {
                        selectedFeedback.rating
                      }
                      /5
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedFeedback(
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
                  PARTICIPANTS
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Service Participants
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Client"
                    value={getUserName(
                      selectedFeedback.clientId
                    )}
                  />

                  <InfoRow
                    label="Client Email"
                    value={
                      getUserEmail(
                        selectedFeedback.clientId
                      ) ||
                      "Not available"
                    }
                  />

                  <InfoRow
                    label="Caretaker"
                    value={getUserName(
                      selectedFeedback.caretakerId
                    )}
                  />

                  <InfoRow
                    label="Caretaker Email"
                    value={
                      getUserEmail(
                        selectedFeedback.caretakerId
                      ) ||
                      "Not available"
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  RATING
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Rating
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <RatingStars
                      rating={Math.max(
                        0,
                        Math.min(
                          5,
                          Number(
                            selectedFeedback.rating ||
                              0
                          )
                        )
                      )}
                      size="md"
                    />

                    <span
                      className={`text-lg font-bold ${getRatingClasses(
                        Number(
                          selectedFeedback.rating ||
                            0
                        )
                      )}`}
                    >
                      {
                        selectedFeedback.rating
                      }
                      /5
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {getRatingLabel(
                      Number(
                        selectedFeedback.rating ||
                          0
                      )
                    )}
                  </p>
                </div>
              </section>

              {/* =================================================
                  COMMENT
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Client Comment
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {selectedFeedback.comment ||
                      "No written comment was provided."}
                  </p>
                </div>
              </section>

              {/* =================================================
                  RECOMMENDATION
              ================================================== */}

              {typeof selectedFeedback.wouldRecommend ===
                "boolean" && (
                <section>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Recommendation
                  </h3>

                  <div
                    className={`rounded-2xl border p-5 ${
                      selectedFeedback.wouldRecommend
                        ? "border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                        : "border-rose-100 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ThumbsUp
                        className={`h-5 w-5 ${
                          selectedFeedback.wouldRecommend
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      />

                      <p
                        className={`text-sm font-semibold ${
                          selectedFeedback.wouldRecommend
                            ? "text-emerald-800 dark:text-emerald-300"
                            : "text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {selectedFeedback.wouldRecommend
                          ? "Client would recommend this caretaker"
                          : "Client would not recommend this caretaker"}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  BOOKING
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Booking Reference
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-900">
                  <InfoRow
                    label="Booking ID"
                    value={
                      getBookingId(
                        selectedFeedback.bookingId
                      ) ? (
                        <span className="font-mono text-xs">
                          {
                            getBookingId(
                              selectedFeedback.bookingId
                            )
                          }
                        </span>
                      ) : (
                        "Not available"
                      )
                    }
                  />

                  <InfoRow
                    label="Submitted"
                    value={formatDateTime(
                      selectedFeedback.createdAt
                    )}
                  />

                  <InfoRow
                    label="Last Updated"
                    value={formatDateTime(
                      selectedFeedback.updatedAt
                    )}
                  />
                </div>
              </section>

              {/* =================================================
                  QUALITY ASSESSMENT
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Quality Assessment
                </h3>

                <div
                  className={`rounded-2xl border p-5 ${
                    Number(
                      selectedFeedback.rating
                    ) <= 2
                      ? "border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20"
                      : Number(
                            selectedFeedback.rating
                          ) >= 4
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                        : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {Number(
                      selectedFeedback.rating
                    ) >= 4 ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <MessageSquareText
                        className={`mt-0.5 h-5 w-5 ${
                          Number(
                            selectedFeedback.rating
                          ) <= 2
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      />
                    )}

                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {Number(
                          selectedFeedback.rating
                        ) >= 4
                          ? "Positive service feedback"
                          : Number(
                                selectedFeedback.rating
                              ) <= 2
                            ? "Service quality review recommended"
                            : "Moderate service feedback"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                        {Number(
                          selectedFeedback.rating
                        ) <= 2
                          ? "This feedback may require administrative attention and follow-up."
                          : "This feedback contributes to CareLink+ service quality monitoring."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  CLOSE
              ================================================== */}

              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFeedback(
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