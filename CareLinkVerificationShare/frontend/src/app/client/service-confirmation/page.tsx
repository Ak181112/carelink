"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function ServiceConfirmationPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-2xl w-full">

        <h1 className="text-3xl font-bold text-[#003898]">
          Service Confirmation
        </h1>

        <p className="text-gray-500 mt-2">
          The caretaker has marked the hospital visit as completed.
          Please confirm whether the service was completed successfully.
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-6 space-y-3">

          <div className="flex justify-between">
            <span className="font-medium">Caretaker</span>
            <span>Hashanee Perera</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Parent</span>
            <span>Nanda Perera</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Hospital</span>
            <span>Teaching Hospital Kurunegala</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Status</span>

            <span className="text-orange-600 font-semibold">
              Waiting for Confirmation
            </span>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">

          <button
            onClick={() => setShowConfirm(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            Confirm Service
          </button>

          <button
            onClick={() => setShowIssue(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
          >
            Report an Issue
          </button>

        </div>

      </div>

      {/* Confirm Modal */}

      {showConfirm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-2xl p-8 w-[420px]">

            <CheckCircle
              className="text-green-600 mx-auto"
              size={60}
            />

            <h2 className="text-2xl font-bold text-center mt-4">
              Confirm Service
            </h2>

            <p className="text-center text-gray-500 mt-3">
              Do you confirm that the caretaker completed the service successfully?
            </p>

            <div className="flex gap-3 mt-8">

              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border rounded-xl py-3"
              >
                Cancel
              </button>

              <Link
  href="/client/payment-gateway"
  className="flex-1 bg-green-600 text-white rounded-xl py-3 text-center font-semibold hover:bg-green-700"
>
  Yes, Confirm
</Link>

            </div>

          </div>

        </div>

      )}

      {/* Report Issue Modal */}

      {showIssue && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-2xl p-8 w-[500px]">

            <AlertTriangle
              className="text-red-600 mx-auto"
              size={60}
            />

            <h2 className="text-2xl font-bold text-center mt-4">
              Report an Issue
            </h2>

            <p className="text-center text-gray-500 mt-2">
              Tell us what went wrong.
            </p>

            <select className="w-full border rounded-xl p-3 mt-6">

              <option>Caretaker did not complete the visit</option>

              <option>Caregiver behaviour issue</option>

              <option>Hospital visit incomplete</option>

              <option>Other</option>

            </select>

            <textarea
              rows={4}
              placeholder="Describe the issue..."
              className="w-full border rounded-xl p-3 mt-4"
            />

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setShowIssue(false)}
                className="flex-1 border rounded-xl py-3"
              >
                Cancel
              </button>

              <button
                className="flex-1 bg-red-600 text-white rounded-xl py-3"
              >
                Submit Report
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}