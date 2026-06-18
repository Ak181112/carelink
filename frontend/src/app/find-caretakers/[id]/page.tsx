"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { caretakerAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { CaretakerProfile } from "@/types";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Phone,
  ChevronLeft,
  Building2,
  CalendarCheck,
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(
  "/api",
  ""
);

function getImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo;
  return `${API_BASE}/uploads/profiles/${photo}`;
}

const DEFAULT_HOSPITALS = [
  "Teaching Hospital Kurunegala",
  "District General Hospital Kurunegala",
  "Asiri Hospital Kurunegala",
];

type FullCaretaker = CaretakerProfile & {
  pricePerHour?: number;
  preferredHospitals?: string[];
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function CaretakerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [caretaker, setCaretaker] = useState<FullCaretaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    caretakerAPI
      .getById(id)
      .then((data) => {
        setCaretaker(data.caretaker ?? data.data ?? data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/client/bookings");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 pb-16">
          <div className="mx-auto max-w-5xl px-6 pt-10 animate-pulse">
            <div className="mb-6 h-5 w-40 rounded bg-slate-200" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                  <div className="flex gap-6">
                    <div className="h-28 w-28 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-7 w-48 rounded bg-slate-200" />
                      <div className="h-4 w-28 rounded bg-slate-200" />
                      <div className="flex gap-2">
                        <div className="h-6 w-24 rounded-full bg-slate-200" />
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm h-48" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !caretaker) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-700">Caretaker not found</p>
            <Link href="/find-caretakers" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
              Back to Find Caretakers
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const imageUrl = getImageUrl(caretaker.photo);
  const avgRating =
    caretaker.averageRating ??
    (caretaker.reviews.length
      ? caretaker.reviews.reduce((s, r) => s + r.rating, 0) / caretaker.reviews.length
      : 0);
  const price = caretaker.pricePerHour
    ? `LKR ${caretaker.pricePerHour.toLocaleString()}/hr`
    : "LKR 1,500/hr";
  const hospitals =
    caretaker.preferredHospitals?.length ? caretaker.preferredHospitals : DEFAULT_HOSPITALS;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto max-w-5xl px-6 pt-10">
          {/* Back link */}
          <Link
            href="/find-caretakers"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Find Caretakers
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left — main content */}
            <div className="space-y-6 lg:col-span-2">

              {/* Profile hero card */}
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* Photo */}
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full bg-blue-50">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={caretaker.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-blue-600">
                        {caretaker.fullName?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">{caretaker.fullName}</h1>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span>{caretaker.town || caretaker.district || "Kurunegala"}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* Availability */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          caretaker.isAvailable
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {caretaker.isAvailable ? "Available Today" : "Not Available"}
                      </span>

                      {/* Rating */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : "No ratings yet"}
                      </span>

                      {/* Price */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <DollarSign className="h-3 w-3" />
                        {price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* About */}
                {caretaker.qualifications && (
                  <div className="mt-6 border-t pt-6">
                    <h2 className="mb-2 text-base font-semibold text-slate-900">About</h2>
                    <p className="leading-relaxed text-gray-600">{caretaker.qualifications}</p>
                  </div>
                )}

                {caretaker.experience && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-400">Experience: </span>
                    <span className="font-medium text-slate-700">{caretaker.experience}</span>
                  </div>
                )}
              </div>

              {/* Preferred hospitals */}
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-semibold text-slate-900">
                    Preferred Hospitals in Kurunegala
                  </h2>
                </div>
                <ul className="space-y-2.5">
                  {hospitals.map((hospital) => (
                    <li key={hospital} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {hospital}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              {caretaker.skills?.length > 0 && (
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-slate-900">Skills & Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {caretaker.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                  Recent Ratings &amp; Reviews
                  {caretaker.reviews.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({caretaker.reviews.length})
                    </span>
                  )}
                </h2>

                {caretaker.reviews.length === 0 ? (
                  <p className="text-sm text-gray-400">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {caretaker.reviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-slate-800">{review.clientName}</span>
                          <StarRow rating={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                        )}
                        <p className="mt-1.5 text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — booking sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-3xl font-bold text-blue-600">{price}</p>
                <p className="mt-0.5 text-sm text-gray-400">per hour</p>

                <div className="mt-6">
                  <h3 className="mb-3 font-semibold text-slate-800">Need Assistance?</h3>
                  <button
                    onClick={handleBooking}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Book Hospital Visit
                  </button>
                  {!isAuthenticated && (
                    <p className="mt-2 text-center text-xs text-gray-400">
                      Login required to book
                    </p>
                  )}
                </div>

                {caretaker.contactNumber && (
                  <div className="mt-6 flex items-center gap-2 border-t pt-5 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span>{caretaker.contactNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
