"use client";

import { useState, useEffect, useRef } from "react";
import { caretakerAPI } from "@/services/api";
import { CaretakerApplication } from "@/types";
import {
  BadgeCheck,
  CircleX,
  Clock3,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const statusConfig = {
  not_applied: {
    label: "Not Applied",
    color: "bg-gray-100 text-gray-700",
    icon: <FileText className="h-8 w-8 text-gray-500" />,
  },

  pending: {
    label: "Under Review",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock3 className="h-8 w-8 text-amber-600" />,
  },

  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: <BadgeCheck className="h-8 w-8 text-green-600" />,
  },

  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: <CircleX className="h-8 w-8 text-red-600" />,
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
  const [application, setApplication] =
    useState<ExtendedApplication | null>(null);

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
        "Application submitted successfully. OCR verification is completed and your application is now under admin review."
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
      <div className="rounded-3xl border bg-white p-16 shadow-sm">

        <div className="flex flex-col items-center justify-center text-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#E6EEFF] bg-[#F8FAFF]">

            <Loader2 className="h-10 w-10 animate-spin text-[#003898]" />

          </div>

          <h2 className="mt-6 text-2xl font-bold text-[#091E42]">
            Loading Application
          </h2>

          <p className="mt-2 max-w-md text-gray-500">
            Please wait while we retrieve your caretaker application details.
          </p>

        </div>

      </div>
    );
  }

  const status =
    statusConfig[
      applicationStatus as keyof typeof statusConfig
    ] || statusConfig.not_applied;

  const canSubmit =
    applicationStatus === "not_applied" ||
    applicationStatus === "rejected";

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-bold tracking-tight text-[#091E42]">
            Caretaker Application
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Submit your documents for verification. Once approved by the
            administrator, your profile will become visible to clients looking
            for verified caretakers.
          </p>

        </div>

        <div className="hidden lg:flex h-20 w-20 items-center justify-center rounded-3xl border border-[#E6EEFF] bg-[#F8FAFF]">

          <ShieldCheck className="h-10 w-10 text-[#003898]" />

        </div>

      </div>

            {/* Application Status */}

      <div
        className={`overflow-hidden rounded-3xl border shadow-sm ${
          applicationStatus === "approved"
            ? "border-green-200 bg-gradient-to-r from-green-50 to-white"
            : applicationStatus === "pending"
            ? "border-amber-200 bg-gradient-to-r from-amber-50 to-white"
            : applicationStatus === "rejected"
            ? "border-red-200 bg-gradient-to-r from-red-50 to-white"
            : "border-[#DFE1E6] bg-white"
        }`}
      >
        <div className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-5">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#E6EEFF]">

              {status.icon}

            </div>

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Current Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${status.color}`}
              >
                {status.label}
              </span>

            </div>

          </div>

          {(application?.submittedAt || application?.createdAt) && (

            <div className="text-left lg:text-right">

              <p className="text-sm font-medium text-gray-500">
                Submitted On
              </p>

              <p className="mt-1 font-semibold text-[#091E42]">
                {new Date(
                  application?.submittedAt ||
                    application?.createdAt ||
                    ""
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>

            </div>

          )}

        </div>

        {application?.adminNote && (

          <div className="border-t border-gray-200 bg-white px-8 py-6">

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#091E42]">
              Administrator Note
            </h3>

            <div className="rounded-2xl border border-[#E6EEFF] bg-[#F8FAFF] p-5">

              <p className="text-sm leading-7 text-gray-600">
                {application.adminNote}
              </p>

            </div>

          </div>

        )}

      </div>

      {/* Alerts */}

      {success && (

        <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">

          <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />

          <div>

            <h3 className="font-semibold text-green-700">
              Success
            </h3>

            <p className="mt-1 text-sm leading-6 text-green-700">
              {success}
            </p>

          </div>

        </div>

      )}

      {error && (

        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">

          <CircleX className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

          <div>

            <h3 className="font-semibold text-red-700">
              Submission Failed
            </h3>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {error}
            </p>

          </div>

        </div>

      )}

      {canSubmit && (

        <div className="rounded-3xl border bg-white p-8 shadow-sm">

          <div className="mb-8">

            <h2 className="text-2xl font-bold text-[#091E42]">
              Submit Application
            </h2>

            <p className="mt-2 text-gray-500">
              Upload the required documents below. Our OCR system will extract
              your NIC address and compare it with your registered profile
              address before the administrator reviews your application.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >


                      {/* NIC Document */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-[#091E42]">
                NIC Document <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => nicRef.current?.click()}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#DFE1E6] bg-[#FAFBFF] p-8 transition-all duration-300 hover:border-[#0052CC] hover:bg-[#F5F9FF]"
              >

                <input
                  ref={nicRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    setNicFile(e.target.files?.[0] || null)
                  }
                />

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">

                    <FileText className="h-8 w-8 text-[#003898]" />

                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#091E42]">
                    Upload NIC Document
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">

                    {nicFile
                      ? nicFile.name
                      : "Click here or drag & drop your NIC document"}

                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    JPG, PNG or PDF (OCR will extract your NIC address)
                  </p>

                </div>

              </div>

            </div>

            {/* Driving License */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-[#091E42]">
                Driving License
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <div
                onClick={() => licenseRef.current?.click()}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#DFE1E6] bg-[#FAFBFF] p-8 transition-all duration-300 hover:border-[#0052CC] hover:bg-[#F5F9FF]"
              >

                <input
                  ref={licenseRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    setLicenseFile(
                      e.target.files?.[0] || null
                    )
                  }
                />

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">

                    <BadgeCheck className="h-8 w-8 text-[#003898]" />

                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#091E42]">
                    Upload Driving License
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">

                    {licenseFile
                      ? licenseFile.name
                      : "Click here to upload your driving license"}

                  </p>

                </div>

              </div>

            </div>

            {/* Certificates */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-[#091E42]">
                Certificates
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <div
                onClick={() => certsRef.current?.click()}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#DFE1E6] bg-[#FAFBFF] p-8 transition-all duration-300 hover:border-[#0052CC] hover:bg-[#F5F9FF]"
              >

                <input
                  ref={certsRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    setCertFiles(e.target.files)
                  }
                />

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF]">

                    <FileText className="h-8 w-8 text-[#003898]" />

                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#091E42]">
                    Upload Certificates
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">

                    {certFiles && certFiles.length > 0
                      ? `${certFiles.length} file(s) selected`
                      : "Upload training or professional certificates"}

                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    Multiple files are supported.
                  </p>

                </div>

              </div>

            </div>

            {/* Information */}

            <div className="rounded-2xl border border-[#DCEBFF] bg-[#F7FAFF] p-5">

              <h3 className="font-semibold text-[#091E42]">
                Verification Process
              </h3>

              <p className="mt-2 text-sm leading-7 text-gray-600">

                Your NIC document will be processed using OCR technology to
                extract your registered address. The extracted address will be
                compared with your CareLink+ profile address before an
                administrator reviews and approves your application.

              </p>

            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#003898] text-base font-semibold text-white transition-all duration-300 hover:bg-[#002D73] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}

            </button>

          </form>

        </div>
      )}

              {/* Approved State */}

      {applicationStatus === "approved" && (

        <div className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-green-50 to-white px-8 py-8">

            <div className="flex flex-col items-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100">

                <BadgeCheck className="h-10 w-10 text-green-600" />

              </div>

              <h2 className="mt-6 text-3xl font-bold text-[#091E42]">
                Congratulations!
              </h2>

              <p className="mt-2 text-lg font-medium text-green-700">
                Your application has been approved.
              </p>

            </div>

          </div>

          <div className="border-t border-green-100 px-8 py-8">

            <div className="space-y-4">

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />

                <p className="text-gray-600">
                  Your NIC has been successfully verified.
                </p>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />

                <p className="text-gray-600">
                  Your profile address matches the OCR verification.
                </p>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />

                <p className="text-gray-600">
                  Your caretaker profile is now visible to clients.
                </p>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500" />

                <p className="text-gray-600">
                  You can now start accepting booking requests.
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* Pending State */}

      {applicationStatus === "pending" && (

        <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-amber-50 to-white px-8 py-8">

            <div className="flex flex-col items-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100">

                <Clock3 className="h-10 w-10 text-amber-600" />

              </div>

              <h2 className="mt-6 text-3xl font-bold text-[#091E42]">
                Application Under Review
              </h2>

              <p className="mt-2 text-lg text-amber-700">
                Your documents have been submitted successfully.
              </p>

            </div>

          </div>

          <div className="border-t border-amber-100 px-8 py-8">

            <div className="space-y-4">

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />

                <p className="text-gray-600">
                  OCR verification has been completed.
                </p>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />

                <p className="text-gray-600">
                  Your application is currently being reviewed by an administrator.
                </p>

              </div>

              <div className="flex items-start gap-3">

                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />

                <p className="text-gray-600">
                  You will receive a notification once the review is complete.
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* Rejected State */}

      {applicationStatus === "rejected" && !canSubmit && (

        <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-red-50 to-white px-8 py-8">

            <div className="flex flex-col items-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100">

                <CircleX className="h-10 w-10 text-red-600" />

              </div>

              <h2 className="mt-6 text-3xl font-bold text-[#091E42]">
                Application Rejected
              </h2>

              <p className="mt-2 text-lg text-red-700">
                Your application could not be approved.
              </p>

            </div>

          </div>

          <div className="border-t border-red-100 px-8 py-8">

            <p className="leading-7 text-gray-600">

              Please review the administrator's feedback above, correct any
              issues with your documents or profile information, and submit a
              new application for review.

            </p>

          </div>

        </div>

      )}

    </div>

  );
}