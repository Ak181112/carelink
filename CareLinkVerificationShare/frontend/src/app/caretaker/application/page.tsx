"use client";

import { useState, useEffect, useRef } from "react";
import { caretakerAPI } from "@/services/api";
import { CaretakerApplication } from "@/types";

const statusConfig = {
  not_applied: {
    label: "Not Applied",
    color: "bg-gray-100 text-gray-600",
    icon: "⭕",
  },
  pending: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: "✅",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-600",
    icon: "❌",
  },
};

type ExtendedApplication = CaretakerApplication & {
  nicNumber?: string;
  nicAddress?: string;
  profileAddress?: string;
  addressMatched?: boolean;
  ocrText?: string;
  verificationStatus?: string;
  adminNote?: string;
  submittedAt?: string;
  createdAt?: string;
};

export default function CaretakerApplicationPage() {
  const [applicationStatus, setApplicationStatus] = useState("not_applied");
  const [application, setApplication] = useState<ExtendedApplication | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const nicRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);
  const certsRef = useRef<HTMLInputElement>(null);

  const [nicFile, setNicFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<FileList | null>(null);

  const loadApplicationStatus = async () => {
    try {
      const response = await caretakerAPI.getApplicationStatus();

      const currentApplication =
        response.application || response.data?.application || null;

      const currentStatus =
        response.applicationStatus ||
        response.data?.applicationStatus ||
        currentApplication?.verificationStatus ||
        "not_applied";

      setApplicationStatus(currentStatus.toLowerCase());
      setApplication(currentApplication);
    } catch {
      setApplicationStatus("not_applied");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplicationStatus();
  }, []);

  const resetMessages = () => {
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!nicFile) {
      setError("NIC document is required.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("nicDocument", nicFile);

      if (licenseFile) {
        formData.append("drivingLicense", licenseFile);
      }

      if (certFiles) {
        Array.from(certFiles).forEach((file) => {
          formData.append("certificates", file);
        });
      }

      const response = await caretakerAPI.submitApplication(formData);

      const newApplication =
        response.application || response.data?.application || null;

      setApplicationStatus("pending");
      setApplication(newApplication);

      setSuccess(
        "Application submitted successfully. OCR verification is completed and your application is now under admin review.",
      );

      setNicFile(null);
      setLicenseFile(null);
      setCertFiles(null);

      if (nicRef.current) nicRef.current.value = "";
      if (licenseRef.current) licenseRef.current.value = "";
      if (certsRef.current) certsRef.current.value = "";
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#42526E]">
        Loading application details...
      </div>
    );
  }

  const status =
    statusConfig[applicationStatus as keyof typeof statusConfig] ||
    statusConfig.not_applied;

  const canSubmit =
    applicationStatus === "not_applied" || applicationStatus === "rejected";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">
          Caretaker Application
        </h1>
        <p className="mt-1 text-[#42526E]">
          Submit your documents for verification and admin review.
        </p>
      </div>

      <div
        className={`mb-8 rounded-2xl border p-6 ${
          applicationStatus === "approved"
            ? "border-green-200 bg-green-50"
            : applicationStatus === "pending"
              ? "border-yellow-200 bg-yellow-50"
              : applicationStatus === "rejected"
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{status.icon}</span>

          <div>
            <p className="text-sm font-medium text-[#42526E]">
              Current Status
            </p>

            <span
              className={`mt-1 inline-block rounded-full px-4 py-1 text-sm font-bold ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        {application?.adminNote && (
          <div className="mt-4 rounded-xl bg-white/70 p-4 text-sm text-[#42526E]">
            <strong>Admin Note:</strong> {application.adminNote}
          </div>
        )}

        {(application?.submittedAt || application?.createdAt) && (
          <p className="mt-3 text-xs text-[#6B7280]">
            Submitted:{" "}
            {new Date(
              application.submittedAt || application.createdAt || "",
            ).toLocaleDateString()}
          </p>
        )}
      </div>

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {canSubmit && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-[#DFE1E6] bg-white p-6"
        >
          <h2 className="text-xl font-bold text-[#091E42]">
            Submit Application
          </h2>

          <p className="text-sm text-[#42526E]">
            Please upload the required documents. The system will extract the
            address from your NIC using OCR and compare it with your profile
            address before admin approval.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#091E42]">
                NIC Document *
              </label>

              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-[#DFE1E6] p-5 text-center transition hover:border-[#0052CC]"
                onClick={() => nicRef.current?.click()}
              >
                <input
                  ref={nicRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setNicFile(e.target.files?.[0] || null)}
                />

                <span className="text-3xl">🪪</span>

                <p className="mt-2 text-sm text-[#42526E]">
                  {nicFile
                    ? nicFile.name
                    : "Click to upload NIC document"}
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  JPG, PNG or PDF. OCR will extract the NIC address.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#091E42]">
                Driving License (Optional)
              </label>

              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-[#DFE1E6] p-5 text-center transition hover:border-[#0052CC]"
                onClick={() => licenseRef.current?.click()}
              >
                <input
                  ref={licenseRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    setLicenseFile(e.target.files?.[0] || null)
                  }
                />

                <span className="text-3xl">🚗</span>

                <p className="mt-2 text-sm text-[#42526E]">
                  {licenseFile
                    ? licenseFile.name
                    : "Click to upload driving license"}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#091E42]">
                Certificates (Optional)
              </label>

              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-[#DFE1E6] p-5 text-center transition hover:border-[#0052CC]"
                onClick={() => certsRef.current?.click()}
              >
                <input
                  ref={certsRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => setCertFiles(e.target.files)}
                />

                <span className="text-3xl">📜</span>

                <p className="mt-2 text-sm text-[#42526E]">
                  {certFiles && certFiles.length > 0
                    ? `${certFiles.length} file(s) selected`
                    : "Click to upload certificates"}
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  You can upload multiple files.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#EEF4FF] p-4 text-sm text-[#42526E]">
            📋 The system will compare your OCR-extracted NIC address with your
            profile address. Admin will approve only valid matched applications.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl bg-[#0052CC] text-base font-semibold text-white transition hover:bg-[#0747A6] disabled:opacity-60"
          >
            {submitting ? "Submitting & Verifying..." : "Submit Application"}
          </button>
        </form>
      )}

      {applicationStatus === "approved" && (
        <div className="rounded-2xl border border-green-200 bg-white p-8 text-center">
          <span className="text-5xl">🎉</span>

          <h3 className="mt-4 text-xl font-bold text-[#091E42]">
            You are an approved caretaker!
          </h3>

          <p className="mt-2 text-[#42526E]">
            Your NIC address and profile address were verified. Your profile is
            now visible to clients searching for caretakers.
          </p>
        </div>
      )}

      {applicationStatus === "pending" && (
        <div className="rounded-2xl border border-yellow-200 bg-white p-8 text-center">
          <span className="text-5xl">⏳</span>

          <h3 className="mt-4 text-xl font-bold text-[#091E42]">
            Application Under Review
          </h3>

          <p className="mt-2 text-[#42526E]">
            OCR verification has been completed. Admin will review your
            application and confirm whether you can become a verified caretaker.
          </p>
        </div>
      )}
    </div>
  );
}