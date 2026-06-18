"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Languages,
  MapPin,
  FileCheck,
  UploadCloud,
  PlusCircle,
  Info,
  ArrowLeft,
} from "lucide-react";

type FormErrors = {
  nicFile?: string;
  policeFile?: string;
};

export default function VerificationPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(2);

  const [nicFile, setNicFile] = useState<File | null>(null);
  const [policeFile, setPoliceFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  const [isDraggingNic, setIsDraggingNic] = useState(false);
  const [isDraggingPolice, setIsDraggingPolice] = useState(false);
  const [isDraggingCert, setIsDraggingCert] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const steps = [
    { id: 1, label: "About you", icon: User },
    { id: 2, label: "Verification", icon: ShieldCheck },
    { id: 3, label: "Skills & languages", icon: Languages },
    { id: 4, label: "Service area & rate", icon: MapPin },
    { id: 5, label: "Review & submit", icon: FileCheck },
  ];

  // ✅ Validation function
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!nicFile) {
      newErrors.nicFile = "NIC is required.";
    }

    if (!policeFile) {
      newErrors.policeFile = "Police Clearance Certificate is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ✅ Continue handler (go to third page)
  const handleContinue = () => {
    if (validateForm()) {
      router.push("/caretakers/thirdpage"); // 🔥 change if your route is different
    }
  };

  // ❌ Back button → first page
  const handleBack = () => {
    router.push("/caretakers/firstpage"); // 🔥 change if needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleContinue();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Progress */}
        <div className="bg-white rounded-xl border p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-slate-700">
              {steps.find((s) => s.id === currentStep)?.label}
            </span>
            <span className="text-xs text-slate-500">
              Step {currentStep} of 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-2.5 rounded-full ${
                  stepNum <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 space-y-6"
          >
            <h2 className="text-xl font-bold">Document Verification</h2>

            {/* NIC */}
            <div>
              <label className="text-xs font-bold uppercase">
                NIC <span className="text-red-500">*</span>
              </label>

              <label className="border-2 border-dashed p-6 block text-center rounded-xl cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setNicFile(e.target.files?.[0] || null)
                  }
                />
                <UploadCloud className="mx-auto text-blue-600" />
                <p>{nicFile ? nicFile.name : "Upload NIC"}</p>
              </label>

              {errors.nicFile && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.nicFile}
                </p>
              )}
            </div>

            {/* Police */}
            <div>
              <label className="text-xs font-bold uppercase">
                Police Clearance <span className="text-red-500">*</span>
              </label>

              <label className="border-2 border-dashed p-6 block text-center rounded-xl cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setPoliceFile(e.target.files?.[0] || null)
                  }
                />
                <UploadCloud className="mx-auto text-blue-600" />
                <p>
                  {policeFile
                    ? policeFile.name
                    : "Upload Police Clearance"}
                </p>
              </label>

              {errors.policeFile && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.policeFile}
                </p>
              )}
            </div>

            {/* Optional cert */}
            <div>
              <label className="text-xs font-bold uppercase">
                Certifications (Optional)
              </label>

              <label className="border-2 border-dashed p-5 block text-center rounded-xl cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setCertFile(e.target.files?.[0] || null)
                  }
                />
                <PlusCircle className="mx-auto text-blue-600" />
                <p>
                  {certFile
                    ? certFile.name
                    : "Upload certificates (optional)"}
                </p>
              </label>
            </div>
          </form>

          {/* Sidebar */}
          <div className="bg-blue-50 border rounded-xl p-5">
            <div className="flex items-center gap-2 font-bold">
              <Info size={16} className="text-blue-600" />
              Tips
            </div>

            <ul className="text-xs mt-3 space-y-2">
              <li>✔ Make sure documents are clear</li>
              <li>✔ Must not be expired</li>
              <li>✔ Police report within 6 months</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleContinue}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue →
          </button>
        </div>
      </main>
    </div>
  );
}