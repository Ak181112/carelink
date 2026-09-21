"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { adminAPI } from "@/services/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const resolveDocumentUrl = (value?: string) => {
  if (!value) return "";

  // Cloudinary or any other absolute URL.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Local backend file path.
  return `${API_URL}${value.startsWith("/") ? value : `/${value}`}`;
};
function AdminApplicationsContent() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const s = searchParams.get("status");
    if (s) setStatusFilter(s);
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getApplications(statusFilter || undefined);
      setApplications(data.applications || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleApprove = async (id: string) => {
    if (selected?.addressMatched === false) {
      showToast(
        "Cannot approve. NIC address and profile address do not match.",
      );
      return;
    }

    setActionLoading(id);
    try {
      await adminAPI.approveApplication(id, note);
      showToast("Application approved successfully");
      setSelected(null);
      setNote("");
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!note.trim()) {
      showToast("Please provide a reason for rejection");
      return;
    }

    setActionLoading(id);
    try {
      await adminAPI.rejectApplication(id, note);
      showToast("Application rejected");
      setSelected(null);
      setNote("");
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-600",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          map[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const addressBadge = (matched?: boolean) => {
    if (matched === true) {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Same
        </span>
      );
    }

    if (matched === false) {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
          Not Same
        </span>
      );
    }

    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        Not Checked
      </span>
    );
  };

  return (
    <div>
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-[#091E42] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">
          Caretaker Applications
        </h1>
        <p className="mt-1 text-[#42526E]">
          Review caretaker applications, OCR address matching, and verification
          status.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {[
          ["", "All"],
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              statusFilter === val
                ? "bg-[#0052CC] text-white"
                : "border border-[#DFE1E6] bg-white text-[#42526E] hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DFE1E6] bg-white">
        {loading ? (
          <div className="py-16 text-center text-[#42526E]">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-5xl">📋</span>
            <p className="mt-3 text-[#42526E]">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#DFE1E6] bg-[#F8FAFC]">
                <tr>
                  {[
                    "Caretaker",
                    "Email",
                    "Town",
                    "NIC No",
                    "Address Match",
                    "Status",
                    "Submitted",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#42526E]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DFE1E6]">
                {applications.map((app: any) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4 font-medium text-[#091E42]">
                      {app.caretakerId?.name || app.fullName || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {app.caretakerId?.email || app.email || ""}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {app.profileId?.town || app.town || "—"}
                    </td>

                    <td className="px-5 py-4 text-[#42526E]">
                      {app.nicNumber || "—"}
                    </td>

                    <td className="px-5 py-4">
                      {addressBadge(app.addressMatched)}
                    </td>

                    <td className="px-5 py-4">
                      {statusBadge(app.status || app.verificationStatus)}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#42526E]">
                      {app.submittedAt || app.createdAt
                        ? new Date(
                            app.submittedAt || app.createdAt,
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelected(app);
                          setNote("");
                        }}
                        className="rounded-lg bg-[#0052CC] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0747A6]"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="text-xl font-bold text-[#091E42]">
                Review Application
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#42526E]">Applicant</span>
                  <span className="font-medium text-[#091E42]">
                    {selected.caretakerId?.name || selected.fullName || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#42526E]">Email</span>
                  <span className="font-medium text-[#091E42]">
                    {selected.caretakerId?.email || selected.email || "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#42526E]">Status</span>
                  {statusBadge(selected.status || selected.verificationStatus)}
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#42526E]">NIC Number</span>
                  <span className="text-[#091E42]">
                    {selected.nicNumber || "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#42526E]">Address Match</span>
                  {addressBadge(selected.addressMatched)}
                </div>

                <div>
                  <span className="text-[#42526E]">Profile Address</span>
                  <div className="mt-1 rounded-xl bg-[#F8FAFC] p-3 text-[#091E42]">
                    {selected.profileAddress ||
                      selected.profileId?.address ||
                      "—"}
                  </div>
                </div>

                <div>
                  <span className="text-[#42526E]">OCR NIC Address</span>
                  <div className="mt-1 rounded-xl bg-[#F8FAFC] p-3 text-[#091E42]">
                    {selected.nicAddress || "Not extracted"}
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#42526E]">Submitted</span>
                  <span className="text-[#091E42]">
                    {selected.submittedAt || selected.createdAt
                      ? new Date(
                          selected.submittedAt || selected.createdAt,
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                {selected.profileId && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#42526E]">Town</span>
                      <span className="text-[#091E42]">
                        {selected.profileId.town}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-[#42526E]">Experience</span>
                      <span className="text-[#091E42]">
                        {selected.profileId.experience}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {selected.documents && (
                <div>
                  <h3 className="mb-3 font-semibold text-[#091E42]">
                    Documents
                  </h3>

                  <div className="space-y-2">
                    {selected.documents.nicDocument && (
                      <a
                        href={resolveDocumentUrl(selected.documents.nicDocument)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0052CC] hover:underline"
                      >
                        🪪 View NIC Document
                      </a>
                    )}

                    {selected.documents.drivingLicense && (
                      <a
                        href={resolveDocumentUrl(selected.documents.drivingLicense)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0052CC] hover:underline"
                      >
                        🚗 View Driving License
                      </a>
                    )}

                    {selected.documents.certificates?.map(
                      (cert: string, i: number) => (
                        <a
                          key={i}
                          href={resolveDocumentUrl(cert)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[#0052CC] hover:underline"
                        >
                          📜 Certificate {i + 1}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* {selected.ocrText && (
                <div>
                  <h3 className="mb-2 font-semibold text-[#091E42]">
                    OCR Raw Text
                  </h3>
                  <pre className="max-h-40 overflow-auto rounded-xl bg-[#F8FAFC] p-3 text-xs text-[#42526E]">
                    {selected.ocrText}
                  </pre>
                </div>
              )} */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#091E42]">
                  Admin Note{" "}
                  {(selected.status || selected.verificationStatus) ===
                  "pending"
                    ? "(required for rejection)"
                    : ""}
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the applicant..."
                  className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]"
                />
              </div>

              {(selected.status || selected.verificationStatus) ===
                "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selected._id)}
                    disabled={
                      actionLoading === selected._id ||
                      selected.addressMatched === false
                    }
                    className="h-11 flex-1 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(selected._id)}
                    disabled={actionLoading === selected._id}
                    className="h-11 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selected.addressMatched === false && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  ⚠️ This application cannot be approved because the OCR NIC
                  address and profile address do not match.
                </div>
              )}

              {selected.adminNote && (
                <div className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#42526E]">
                  <strong>Previous note:</strong> {selected.adminNote}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading applications...</p>}>
      <AdminApplicationsContent />
    </Suspense>
  );
}
