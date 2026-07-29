"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { CaretakerProfile } from "@/types";
import { formatLkr } from "@/lib/bookingUtils";
import { HOURLY_RATE, ADMIN_SERVICE_FEE } from "@/lib/pricing";

interface Props {
  caretaker: CaretakerProfile;
}

export default function BookingCard({ caretaker }: Props) {
  const { user } = useAuth();

  const caretakerUserId =
    typeof caretaker.userId === "object" ? caretaker.userId._id : caretaker.userId;

  const canBook = user?.role === "family_member";
  const bookable = canBook && caretaker.isAvailable;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 h-fit">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
          caretaker.isAvailable
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${caretaker.isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
        {caretaker.isAvailable ? "Available now" : "Currently unavailable"}
      </span>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Caretaker rate</span>
          <span className="font-medium text-slate-900">{formatLkr(HOURLY_RATE)} / hour</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">CareLink+ service fee</span>
          <span className="font-medium text-slate-900">{formatLkr(ADMIN_SERVICE_FEE)}</span>
        </div>
        <p className="pt-1 text-xs text-gray-400">
          A travel charge is added based on the distance to the hospital.
        </p>
      </div>

      {bookable ? (
        <Link
          href={`/client/bookings?caretaker=${caretakerUserId}`}
          className="mt-8 block w-full rounded-xl bg-blue-600 py-4 text-center text-white font-semibold hover:bg-blue-700 transition"
        >
          Book a Hospital Visit
        </Link>
      ) : canBook ? (
        <button
          disabled
          className="mt-8 block w-full rounded-xl bg-gray-200 py-4 text-center font-semibold text-gray-500"
        >
          Unavailable for booking
        </button>
      ) : user ? (
        <p className="mt-8 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
          Only family member accounts can book a caretaker.
        </p>
      ) : (
        <Link
          href="/login"
          className="mt-8 block w-full rounded-xl bg-blue-600 py-4 text-center text-white font-semibold hover:bg-blue-700 transition"
        >
          Log in to Book
        </Link>
      )}
    </div>
  );
}
