"use client";

import { useState, useEffect, useRef } from "react";
import { caretakerAPI } from "@/services/api";
import { CaretakerApplication } from "@/types";

const statusConfig = {
  not_applied: { label: "Not Applied", color: "bg-gray-100 text-gray-600", icon: "⭕" },
  pending: { label: "Under Review", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: "✅" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-600", icon: "❌" },
};

export default function CaretakerApplicationPage() {
  const [applicationStatus, setApplicationStatus] = useState("not_applied");
  const [application, setApplication] = useState<CaretakerApplication | null>(null);
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

  useEffect(() => {
    caretakerAPI.getApplicationStatus()
      .then((d) => {
        setApplicationStatus(d.applicationStatus || "not_applied");
        setApplication(d.application || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicFile) { setError("NIC document is required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("nicDocument", nicFile);
      if (licenseFile) fd.append("drivingLicense", licenseFile);
      if (certFiles) Array.from(certFiles).forEach((f) => fd.append("certificates", f));
      await caretakerAPI.submitApplication(fd);
      setApplicationStatus("pending");
      setSuccess("Application submitted successfully! Our team will review it within 2-3 business days.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-[#42526E]">Loading...</div>;

  const status = statusConfig[applicationStatus as keyof typeof statusConfig] || statusConfig.not_applied;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Caretaker Application</h1>
        <p className="mt-1 text-[#42526E]">Submit your documents for admin review</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl border p-6 mb-8 ${applicationStatus === "approved" ? "bg-green-50 border-green-200" : applicationStatus === "pending" ? "bg-yellow-50 border-yellow-200" : applicationStatus === "rejected" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{status.icon}</span>
          <div>
            <p className="text-sm font-medium text-[#42526E]">Current Status</p>
            <span className={`mt-1 inline-block rounded-full px-4 py-1 text-sm font-bold ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
        {application?.adminNote && (
          <div className="mt-4 rounded-xl bg-white/70 p-4 text-sm text-[#42526E]">
            <strong>Admin Note:</strong> {application.adminNote}
          </div>
        )}
        {application?.submittedAt && (
          <p className="mt-3 text-xs text-[#6B7280]">
            Submitted: {new Date(application.submittedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {success && <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{success}</div>}
      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

      {/* Show form only if not applied or rejected */}
      {(applicationStatus === "not_applied" || applicationStatus === "rejected") && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#DFE1E6] p-6 space-y-6">
          <h2 className="text-xl font-bold text-[#091E42]">Submit Application</h2>
          <p className="text-sm text-[#42526E]">
            Please upload the required documents. Make sure your profile is complete before submitting.
          </p>

          <div className="space-y-4">
            {/* NIC */}
            <div>
              <label className="block text-sm font-medium text-[#091E42] mb-2">NIC Document *</label>
              <div className="rounded-xl border-2 border-dashed border-[#DFE1E6] p-5 text-center hover:border-[#0052CC] cursor-pointer transition"
                onClick={() => nicRef.current?.click()}>
                <input ref={nicRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => setNicFile(e.target.files?.[0] || null)} />
                <span className="text-3xl">🪪</span>
                <p className="mt-2 text-sm text-[#42526E]">{nicFile ? nicFile.name : "Click to upload NIC (front & back)"}</p>
                <p className="text-xs text-[#6B7280] mt-1">JPG, PNG or PDF</p>
              </div>
            </div>

            {/* Driving License */}
            <div>
              <label className="block text-sm font-medium text-[#091E42] mb-2">Driving License (Optional)</label>
              <div className="rounded-xl border-2 border-dashed border-[#DFE1E6] p-5 text-center hover:border-[#0052CC] cursor-pointer transition"
                onClick={() => licenseRef.current?.click()}>
                <input ref={licenseRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} />
                <span className="text-3xl">🚗</span>
                <p className="mt-2 text-sm text-[#42526E]">{licenseFile ? licenseFile.name : "Click to upload driving license"}</p>
              </div>
            </div>

            {/* Certificates */}
            <div>
              <label className="block text-sm font-medium text-[#091E42] mb-2">Certificates (Optional)</label>
              <div className="rounded-xl border-2 border-dashed border-[#DFE1E6] p-5 text-center hover:border-[#0052CC] cursor-pointer transition"
                onClick={() => certsRef.current?.click()}>
                <input ref={certsRef} type="file" accept="image/*,.pdf" multiple className="hidden"
                  onChange={(e) => setCertFiles(e.target.files)} />
                <span className="text-3xl">📜</span>
                <p className="mt-2 text-sm text-[#42526E]">
                  {certFiles && certFiles.length > 0 ? `${certFiles.length} file(s) selected` : "Click to upload certificates"}
                </p>
                <p className="text-xs text-[#6B7280] mt-1">You can upload multiple files</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#EEF4FF] p-4 text-sm text-[#42526E]">
            📋 Our admin team will review your application and documents. You will receive an email notification once reviewed.
          </div>

          <button type="submit" disabled={submitting}
            className="w-full h-12 rounded-2xl bg-[#0052CC] text-base font-semibold text-white hover:bg-[#0747A6] transition disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      )}

      {applicationStatus === "approved" && (
        <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
          <span className="text-5xl">🎉</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">You are an approved caretaker!</h3>
          <p className="mt-2 text-[#42526E]">Your profile is now visible to clients searching for caretakers in Kurunegala district.</p>
        </div>
      )}

      {applicationStatus === "pending" && (
        <div className="bg-white rounded-2xl border border-yellow-200 p-8 text-center">
          <span className="text-5xl">⏳</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">Application Under Review</h3>
          <p className="mt-2 text-[#42526E]">Our admin team is reviewing your application. We&apos;ll notify you via email once reviewed.</p>
        </div>
      )}
    </div>
  );
}
