import Link from "next/link";
import { MapPin, Star, Clock, DollarSign } from "lucide-react";
import { CaretakerProfile } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");

function getImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo;
  return `${API_BASE}${photo}`;
}

interface Props {
  caretaker: CaretakerProfile & { pricePerHour?: number };
}

export default function CaretakerCard({ caretaker }: Props) {
  const imageUrl = getImageUrl(caretaker.photo);
  const avgRating =
    caretaker.averageRating ??
    (caretaker.reviews.length
      ? caretaker.reviews.reduce((s, r) => s + r.rating, 0) / caretaker.reviews.length
      : 0);
  const location = caretaker.town || caretaker.district || "Kurunegala";
  const price = caretaker.pricePerHour
    ? `LKR ${caretaker.pricePerHour.toLocaleString()}/hr`
    : "LKR 1,500/hr";

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      {/* Photo + Name */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-blue-50">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external backend-served upload, not whitelisted for next/image
            <img
              src={imageUrl}
              alt={caretaker.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-600">
              {caretaker.fullName?.charAt(0) ?? "?"}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-900">{caretaker.fullName}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-blue-500" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mt-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            caretaker.isAvailable
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          <Clock className="h-3 w-3" />
          {caretaker.isAvailable ? "Available Today" : "Unavailable"}
        </span>
      </div>

      {/* Rating + Price */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-slate-700">
            {avgRating > 0 ? avgRating.toFixed(1) : "New"}
          </span>
          {caretaker.reviews.length > 0 && (
            <span className="text-xs text-gray-400">({caretaker.reviews.length})</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
          <DollarSign className="h-4 w-4" />
          <span>{price}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <Link href={`/find-caretakers/${caretaker._id}`} className="mt-5 block">
        <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800">
          View Profile
        </button>
      </Link>
    </div>
  );
}
