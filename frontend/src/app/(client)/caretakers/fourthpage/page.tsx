"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Languages,
  MapPin,
  FileCheck,
  ArrowRight,
  CreditCard,
  Navigation,
  ShieldCheck as VerifiedIcon,
} from "lucide-react";

type Errors = {
  areas?: string;
  rate?: string;
};

export default function ServiceAreaRatePage() {
  const router = useRouter();

  const [currentStep] = useState(4);

  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    "Kurunegala Town",
  ]);

  const [hourlyRate, setHourlyRate] = useState("1500");

  const [errors, setErrors] = useState<Errors>({});

  const steps = [
    { id: 1, label: "About you", icon: User },
    { id: 2, label: "Verification", icon: ShieldCheck },
    { id: 3, label: "Skills & languages", icon: Languages },
    { id: 4, label: "Service area & rate", icon: MapPin },
    { id: 5, label: "Review & submit", icon: FileCheck },
  ];

  const towns = [
    "Kurunegala Town",
    "Kuliyapitiya",
    "Narammala",
    "Wariyapola",
    "Pannala",
  ];

  const toggleArea = (town: string) => {
    setSelectedAreas((prev) =>
      prev.includes(town)
        ? prev.filter((t) => t !== town)
        : [...prev, town]
    );
  };

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: Errors = {};

    if (selectedAreas.length === 0) {
      newErrors.areas = "Select at least one service area.";
    }

    if (!hourlyRate || Number(hourlyRate) <= 0) {
      newErrors.rate = "Enter a valid hourly rate.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CONTINUE → NEXT PAGE
  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (validate()) {
      router.push("/caretakers/fifthpage"); // 🔥 change route if needed
    }
  };

  // ✅ BACK → PREVIOUS PAGE
  const handleBack = () => {
    router.push("/caretakers/thirdpage"); // 🔥 change route if needed
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Progress */}
        <div className="bg-white rounded-xl border p-5 mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {steps.find((s) => s.id === currentStep)?.label}
            </span>
            <span className="text-xs">Step {currentStep} of 5</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-2 rounded-full ${
                  n <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleContinue}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-8"
        >

          {/* SERVICE AREAS */}
          <div>
            <h3 className="font-bold">Service Areas</h3>

            <div className="flex flex-wrap gap-2 mt-3">
              {towns.map((town) => {
                const selected = selectedAreas.includes(town);

                return (
                  <button
                    type="button"
                    key={town}
                    onClick={() => toggleArea(town)}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selected
                        ? "bg-blue-100 border-blue-600 text-blue-700"
                        : "border-slate-300"
                    }`}
                  >
                    {town}
                  </button>
                );
              })}
            </div>

            {errors.areas && (
              <p className="text-red-500 text-xs mt-2">
                {errors.areas}
              </p>
            )}
          </div>

          {/* HOURLY RATE */}
          <div>
            <h3 className="font-bold">Hourly Rate (LKR)</h3>

            <div className="relative max-w-xs mt-2">
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">
                LKR/hr
              </span>
            </div>

            {errors.rate && (
              <p className="text-red-500 text-xs mt-2">
                {errors.rate}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="text-slate-600 font-semibold"
            >
              Back
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* INFO CARDS */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-100 p-4 rounded-xl flex gap-3">
            <VerifiedIcon className="text-blue-600" />
            <div>
              <h4 className="text-xs font-bold">Verified Work</h4>
              <p className="text-xs text-slate-500">
                Safe platform for caregivers
              </p>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl flex gap-3">
            <CreditCard className="text-blue-600" />
            <div>
              <h4 className="text-xs font-bold">Fast Payments</h4>
              <p className="text-xs text-slate-500">
                Weekly bank transfers
              </p>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="mt-6 h-40 bg-slate-200 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Navigation className="mx-auto text-blue-600" />
            <p className="text-xs text-slate-500">
              Service coverage map
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}