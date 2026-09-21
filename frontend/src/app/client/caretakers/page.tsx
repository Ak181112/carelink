"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { caretakerAPI } from "@/services/api";
import { CaretakerProfile } from "@/types";
import { Star } from "lucide-react";

const KURUNEGALA_TOWNS = [
  "All Towns",
  "Kurunegala",
  "Kuliyapitiya",
  "Nikaweratiya",
  "Maho",
  "Pannala",
  "Ibbagamuwa",
  "Giriulla",
  "Narammala",
  "Alawwa",
  "Polgahawela",
  "Wariyapola",
];

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL =
  process.env.NODE_ENV === "production"
    ? (configuredApiUrl?.replace(/\/api\/?$/, "") ||
      "https://api.carelinkplus.me")
    : configuredApiUrl?.replace(/\/api\/?$/, "") || "http://localhost:5000";

export default function ClientCaretakersPage() {
  const [caretakers, setCaretakers] = useState<CaretakerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [town, setTown] = useState("All Towns");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = town !== "All Towns" ? { town } : undefined;
      const data = await caretakerAPI.getApproved(params);
      setCaretakers(data.caretakers || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [town]);

  const filtered = caretakers.filter(
    (c) =>
      (c.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.skills || []).some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  // const stars = (rating: number) => "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  function RatingStars({
    rating,
    size = 16,
  }: {
    rating: number;
    size?: number;
  }) {
    const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

    return (
      <div
        className="inline-flex items-center gap-0.5"
        aria-label={`${safeRating.toFixed(1)} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const fillPercent = Math.min(
            100,
            Math.max(0, (safeRating - index) * 100),
          );

          return (
            <span
              key={index}
              className="relative inline-block shrink-0"
              style={{ width: size, height: size }}
            >
              {/* Empty star */}
              <Star
                size={size}
                strokeWidth={2}
                className="absolute inset-0 text-slate-300"
                fill="currentColor"
              />

              {/* Filled/partial star */}
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  size={size}
                  strokeWidth={2}
                  className="text-amber-400"
                  fill="currentColor"
                />
              </span>
            </span>
          );
        })}
      </div>
    );
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Find Caretakers</h1>
        <p className="mt-1 text-[#42526E]">
          Browse approved caretakers in Kurunegala district
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#DFE1E6] p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]"
        />
        <select
          value={town}
          onChange={(e) => setTown(e.target.value)}
          className="h-11 rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC] sm:w-48"
        >
          {KURUNEGALA_TOWNS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button
          onClick={load}
          className="h-11 rounded-xl bg-[#0052CC] px-6 text-sm font-semibold text-white hover:bg-[#0747A6] transition"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#42526E]">
          Loading caretakers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DFE1E6] p-16 text-center">
          <span className="text-6xl">🔍</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">
            No caretakers found
          </h3>
          <p className="mt-2 text-[#42526E]">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const userName =
              typeof c.userId === "object"
                ? (c.userId as { name: string }).name
                : "";
            const photoUrl = c.photo ? `${API_URL}${c.photo}` : null;
            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={c.fullName}
                        className="h-16 w-16 rounded-full object-cover border border-[#DFE1E6]"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-[#EEF4FF] flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[#091E42]">
                        {c.fullName || "CareLink+ Caretaker"}
                      </h3>
                      <p className="text-sm text-[#42526E]">
                        {c.town}, Kurunegala
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={Number(c.averageRating ?? 0)}
                        size={16}
                      />

                      <span className="font-semibold text-amber-600">
                        {Number(c.averageRating ?? 0).toFixed(1)}
                      </span>

                      <span className="text-[#42526E]">
                        ({c.reviews?.length || 0} reviews)
                      </span>
                    </div>
                    <p className="text-[#42526E]">
                      🕐 {c.experience} experience
                    </p>
                    {(c.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(c.skills || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-xs font-medium text-[#0052CC]"
                          >
                            {s}
                          </span>
                        ))}
                        {(c.skills || []).length > 3 && (
                          <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-xs font-medium text-[#0052CC]">
                            +{(c.skills || []).length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <Link
                    href={`/find-caretakers/${c._id}`}
                    className="block w-full text-center rounded-xl bg-[#0052CC] py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
