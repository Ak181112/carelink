"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { recommendationAPI } from "@/services/api";

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
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
            <Star
              size={size}
              className="absolute inset-0 text-slate-300"
              fill="currentColor"
            />

            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star
                size={size}
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

export default function RecommendationPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (p) => {
              const d = await recommendationAPI.get({
                lat: p.coords.latitude,
                lng: p.coords.longitude,
              });
              setRows(d.recommendations || []);
              setLoading(false);
            },
            async () => {
              const d = await recommendationAPI.get();
              setRows(d.recommendations || []);
              setLoading(false);
            },
          );
        } else {
          const d = await recommendationAPI.get();
          setRows(d.recommendations || []);
          setLoading(false);
        }
      } catch (e: any) {
        setMessage(e.message);
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-7">
          <p className="text-sm font-semibold text-[#003898]">
            Smart recommendation
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Recommended caretakers
          </h1>
          <p className="text-slate-500 mt-2">
            Caretakers are ranked using the proposal scoring model: availability
            30%, location 25%, rating 20%, completed services 15%, previous
            interaction 10%.
          </p>
        </div>
        {message && (
          <div className="mb-5 rounded-xl bg-red-50 text-red-700 p-4">
            {message}
          </div>
        )}
        {loading ? (
          <div className="py-20 grid place-items-center">
            <Loader2 className="animate-spin text-[#003898]" size={32} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {rows.map((r, i) => {
              const c = r.caretaker;
              return (
                <div
                  key={c._id}
                  className="rounded-2xl bg-white border shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        #{i + 1} recommendation
                      </p>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                        {c.fullName}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {c.town}, {c.district}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 px-3 py-2 text-center">
                      <p className="text-xs text-[#003898] font-bold">Score</p>
                      <p className="font-extrabold text-[#003898]">
                        {r.recommendationScore}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-5 text-sm">
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={Number(c.averageRating ?? 0)}
                        size={16}
                      />

                      <span className="font-semibold text-amber-600">
                        {Number(c.averageRating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    {r.distanceKm != null && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin size={15} />
                        {r.distanceKm} km
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1 ${c.isAvailable ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {c.isAvailable && <CheckCircle2 size={15} />}{" "}
                      {c.isAvailable ? "Available" : "Busy"}
                    </span>
                  </div>
                  <div className="mt-5 rounded-xl border border-blue-100 bg-[#EEF4FF] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Caretaker service fee
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-[#003898]">
                      LKR{" "}
                      {Number(r.caretakerServiceCharge ?? 0).toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Caretaker service charge only
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={`/client/caretaker-profile/${c._id}`}
                      className="w-full rounded-xl border border-[#003898] text-[#003898] py-3 font-semibold flex items-center justify-center gap-2 hover:bg-[#EEF4FF] transition"
                    >
                      View Profile
                    </Link>

                    <Link
                      href={`/client/book-hospital-visit?caretakerId=${c.userId?._id || c.userId}`}
                      className="w-full rounded-xl bg-[#003898] text-white py-3 font-semibold flex items-center justify-center gap-2 hover:bg-[#002D73] transition"
                    >
                      Book Caretaker <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
