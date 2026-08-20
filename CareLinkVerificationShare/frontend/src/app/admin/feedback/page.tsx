"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { AdminReview, ReviewStats } from "@/types";

const RATING_FILTERS = [
  { value: "", label: "All ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

const stars = (rating: number) =>
  "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));

export default function AdminFeedbackPage() {
  const [ratingFilter, setRatingFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchReviews = useCallback(
    () => adminAPI.getReviews(ratingFilter ? { rating: ratingFilter } : undefined),
    [ratingFilter],
  );

  const { data, loading } = useApiData(fetchReviews);
  const reviews: AdminReview[] = data?.reviews ?? [];
  const stats: ReviewStats = data?.stats ?? {
    total: 0,
    average: 0,
    distribution: {},
    reviewedCaretakers: 0,
  };

  const term = search.toLowerCase();
  const filtered = reviews.filter(
    (r) =>
      !term ||
      r.caretakerName.toLowerCase().includes(term) ||
      r.clientName.toLowerCase().includes(term) ||
      (r.comment ?? "").toLowerCase().includes(term),
  );

  const maxInDistribution = Math.max(
    1,
    ...[1, 2, 3, 4, 5].map((s) => stats.distribution[s] ?? 0),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Client Feedback</h1>
        <p className="mt-1 text-[#42526E]">
          Ratings and comments clients have left for caretakers.
        </p>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Headline number — the rating is one value, so it is a figure, not a chart */}
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
          <p className="text-sm text-[#42526E]">Average rating</p>
          <p className="mt-2 text-5xl font-bold text-[#091E42]">
            {loading ? "—" : stats.average.toFixed(1)}
          </p>
          <p className="mt-1 text-lg text-yellow-500">
            {stars(Math.round(stats.average))}
          </p>
          <p className="mt-3 text-sm text-[#6B7280]">
            {stats.total} review{stats.total === 1 ? "" : "s"} across{" "}
            {stats.reviewedCaretakers} caretaker
            {stats.reviewedCaretakers === 1 ? "" : "s"}
          </p>
        </div>

        {/* Distribution: ordered categories, magnitude comparison -> one hue, value at the tip */}
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-[#091E42]">Rating distribution</h2>

          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] ?? 0;
              const width = (count / maxInDistribution) * 100;

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-sm tabular-nums text-[#42526E]">
                    {star} ★
                  </span>

                  <div className="h-4 flex-1 overflow-hidden rounded-sm bg-[#F4F5F7]">
                    <div
                      className="h-full rounded-r-xs bg-[#0052CC] transition-[width] duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <span className="w-10 shrink-0 text-right text-sm tabular-nums font-medium text-[#091E42]">
                    {loading ? "—" : count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#DFE1E6] bg-white p-5 sm:flex-row">
        <input
          placeholder="Search caretaker, client or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC] sm:w-44"
        >
          {RATING_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#42526E]">Loading feedback...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-16 text-center">
          <span className="text-6xl">💬</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">No feedback yet</h3>
          <p className="mt-2 text-[#42526E]">
            Reviews appear here once clients rate a caretaker after a visit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="rounded-2xl border border-[#DFE1E6] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/find-caretakers/${r.caretakerId}`}
                    className="font-bold text-[#091E42] hover:text-[#0052CC] hover:underline"
                  >
                    {r.caretakerName}
                  </Link>
                  {r.caretakerTown && (
                    <span className="ml-2 text-sm text-[#6B7280]">{r.caretakerTown}</span>
                  )}
                  <p className="mt-0.5 text-sm text-[#42526E]">
                    Reviewed by {r.clientName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg text-yellow-500">{stars(r.rating)}</p>
                  <p className="text-xs text-[#6B7280]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {r.comment && (
                <p className="mt-3 rounded-xl bg-[#F8FAFC] p-3 text-sm text-[#42526E]">
                  &ldquo;{r.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
