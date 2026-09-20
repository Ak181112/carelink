"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { caretakerAPI } from "@/services/api";

type Review = {
  _id?: string;
  clientName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
};

type Caretaker = {
  _id: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;

  fullName: string;
  contactNumber?: string;
  address?: string;
  district?: string;
  town?: string;
  experience?: string;
  qualifications?: string;
  skills?: string[];
  photo?: string;

  applicationStatus?: string;
  isVerified?: boolean;
  isAvailable?: boolean;

  averageRating?: number;
  reviews?: Review[];
};

function RatingStars({
  rating,
  size = 18,
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

export default function CaretakerProfilePage() {
  const params = useParams();
  const id = String(params.id || "");

  const [caretaker, setCaretaker] = useState<Caretaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadCaretaker = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await caretakerAPI.getById(id);
        setCaretaker(response.caretaker || null);
      } catch (err: any) {
        setError(err?.message || "Unable to load caretaker profile.");
      } finally {
        setLoading(false);
      }
    };

    loadCaretaker();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-[#003898]" />
          <p className="text-sm text-slate-500">
            Loading caretaker profile...
          </p>
        </div>
      </div>
    );
  }

  if (!caretaker) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/client/caretaker-recommendation"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#003898]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to recommendations
          </Link>

          <div className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <UserRound className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Caretaker not found
            </h2>

            <p className="mt-2 text-slate-500">
              {error ||
                "This caretaker may no longer be available on CareLink+."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const reviews = caretaker.reviews || [];
  const averageRating = Number(caretaker.averageRating || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* Back */}
        <Link
          href="/client/caretaker-recommendation"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#003898]"
        >
          <ArrowLeft size={18} />
          Back to recommendations
        </Link>

        {/* Profile Header */}
        <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-[#003898] via-[#0753B8] to-[#0B5ED7]" />

          <div className="px-5 pb-7 sm:px-8">
            <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              {/* Identity */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#EEF4FF] shadow-lg">
                  {caretaker.photo ? (
                    <img
                      src={caretaker.photo}
                      alt={caretaker.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-[#003898]">
                      {(caretaker.fullName || "C").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                      {caretaker.fullName}
                    </h1>

                    {caretaker.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Professional hospital visit caretaker
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={16} />
                      {caretaker.town || "Kurunegala"}
                      {caretaker.district
                        ? `, ${caretaker.district}`
                        : ""}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness size={16} />
                      {caretaker.experience || "Experience not provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking */}
              <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                <div
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
                    caretaker.isAvailable
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      caretaker.isAvailable
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  {caretaker.isAvailable ? "Available" : "Currently Busy"}
                </div>

                <Link
                  href={`/client/book-hospital-visit?caretakerId=${id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003898] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#002D73]"
                >
                  Book this caretaker
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Star className="h-5 w-5" fill="currentColor" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Rating
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl font-extrabold text-slate-900">
                    {averageRating.toFixed(1)}
                  </span>

                  <span className="text-xs text-slate-500">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#003898]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Experience
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {caretaker.experience || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Award className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Qualification
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {caretaker.qualifications || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Verification
                </p>

                <p className="mt-1 text-sm font-bold text-emerald-700">
                  {caretaker.isVerified ? "Verified" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* Left */}
          <div className="space-y-6">

            {/* Professional Information */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#003898]">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Professional Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Details available for family members before booking.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Full Name
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {caretaker.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Service Area
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {caretaker.town || "Not provided"}
                    {caretaker.district
                      ? `, ${caretaker.district}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Experience
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {caretaker.experience || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Qualification
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {caretaker.qualifications || "Not provided"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 font-semibold leading-6 text-slate-900">
                    {caretaker.address || "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#003898]">
                  <BadgeCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Skills & Services
                  </h2>

                  <p className="text-sm text-slate-500">
                    Skills and professional capabilities.
                  </p>
                </div>
              </div>

              {caretaker.skills?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {caretaker.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#003898]"
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No additional skills have been listed.
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Client Reviews
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Feedback from completed care services.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
                  <RatingStars rating={averageRating} size={17} />

                  <span className="font-extrabold text-amber-700">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {reviews.map((review, index) => (
                    <div
                      key={review._id || `${review.createdAt}-${index}`}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {review.clientName || "Family member"}
                          </p>

                          {review.createdAt && (
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                review.createdAt,
                              ).toLocaleDateString("en-LK", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>

                        <RatingStars
                          rating={Number(review.rating || 0)}
                          size={15}
                        />
                      </div>

                      <div className="mt-3 flex gap-2 text-sm leading-6 text-slate-600">
                        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                        <p>
                          {review.comment || "No written feedback provided."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                  No reviews have been submitted yet.
                </div>
              )}
            </section>
          </div>

          {/* Right */}
          <aside className="space-y-6">

            {/* Verification */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    CareLink+ Verification
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This profile has passed the CareLink+ caretaker approval
                    process.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Application
                  </span>

                  <span className="text-sm font-bold capitalize text-emerald-700">
                    {caretaker.applicationStatus || "Approved"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Identity verification
                  </span>

                  <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {caretaker.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Availability
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      caretaker.isAvailable
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {caretaker.isAvailable
                      ? "Available"
                      : "Currently Busy"}
                  </span>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Contact Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact information available for the caretaker.
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#003898]">
                    <Phone className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Contact Number
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {caretaker.contactNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Service Location
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {caretaker.town || "Kurunegala"}
                      {caretaker.district
                        ? `, ${caretaker.district}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock3 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Availability
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        caretaker.isAvailable
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {caretaker.isAvailable
                        ? "Available for assignments"
                        : "Currently unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking CTA */}
            <section className="overflow-hidden rounded-2xl bg-[#003898] p-6 text-white shadow-sm">
              <p className="text-sm font-semibold text-blue-100">
                Ready to arrange care?
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                Book this caretaker
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Continue to the hospital visit booking process to select the
                parent, hospital and visit details.
              </p>

              <Link
                href={`/client/book-hospital-visit?caretakerId=${id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#003898] transition hover:bg-blue-50"
              >
                Continue to booking
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}