"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CaretakerProfileHero from "@/components/caretaker/CaretakerProfileHero";
import SkillsSection from "@/components/caretaker/SkillsSection";
import ReviewsSection from "@/components/caretaker/ReviewsSection";
import { caretakerAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { CaretakerProfile, Review } from "@/types";

export default function CaretakerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const fetchCaretaker = useCallback(() => caretakerAPI.getById(id), [id]);
  const { data, loading, error, mutate } = useApiData(fetchCaretaker);

  // reviews live in local state so submitting one updates the page without a refetch
  const [reviewOverride, setReviewOverride] = useState<{
    reviews: Review[];
    averageRating: number;
  } | null>(null);

  const fetched: CaretakerProfile | null = data?.caretaker ?? null;

  const caretaker: CaretakerProfile | null = fetched
    ? { ...fetched, ...(reviewOverride ?? {}) }
    : null;

  const handleReviewsChange = (reviews: Review[], averageRating: number) => {
    setReviewOverride({ reviews, averageRating });
    // keep the cached response in sync too, in case the page re-renders from it
    mutate((current) =>
      current
        ? { ...current, caretaker: { ...current.caretaker, reviews, averageRating } }
        : current,
    );
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F9FC] min-h-screen">
        {loading ? (
          <div className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-500">
            Loading caretaker profile...
          </div>
        ) : error || !caretaker ? (
          <div className="max-w-7xl mx-auto px-6 py-24 text-center">
            <span className="text-5xl">🔍</span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Caretaker not found</h1>
            <p className="mt-2 text-slate-500">This caretaker may no longer be available.</p>
            <Link
              href="/find-caretakers"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Find Caretakers
            </Link>
          </div>
        ) : (
          <>
            <CaretakerProfileHero caretaker={caretaker} />
            <SkillsSection skills={caretaker.skills || []} />
            <ReviewsSection
              caretakerId={caretaker._id}
              reviews={caretaker.reviews || []}
              onReviewsChange={handleReviewsChange}
            />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
