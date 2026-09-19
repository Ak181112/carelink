"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServiceCompletedPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-12">

      <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">

        <div className="flex justify-center">
          <CheckCircle
            size={80}
            className="text-green-600"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#091E42] mt-6">
          Service Completed
        </h1>

        <p className="text-gray-500 mt-3">
          The hospital visit has been completed successfully.
        </p>

        <div className="mt-10 rounded-xl border bg-gray-50 p-6 text-left space-y-4">

          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Booking ID</span>
            <span>BK-0998</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Patient</span>
            <span>Nanda Perera</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Hospital</span>
            <span>Colombo General Hospital</span>
          </div>
          

          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Date</span>
            <span>05 July 2026</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Status</span>

            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              Completed
            </span>
          </div>

        </div>

        <button
          onClick={() => router.push("/caretaker")}
          className="mt-10 w-full bg-[#003898] hover:bg-[#0041A8] text-white py-3 rounded-xl font-semibold transition"
        >
          Back to Dashboard
        </button>

      </div>

    </div>
  );
}