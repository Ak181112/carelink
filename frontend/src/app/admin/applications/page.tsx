"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { adminAPI } from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function AdminApplicationsPage() {
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
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.approveApplication(id, note);
      showToast("Application approved successfully");
      setSelected(null);
      setNote("");
      await load();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    if (!note.trim()) { showToast("Please provide a reason for rejection"); return; }
    setActionLoading(id);
    try {
      await adminAPI.rejectApplication(id, note);
      showToast("Application rejected");
      setSelected(null);
      setNote("");
      await load();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed"); }
    finally { setActionLoading(null); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };
    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] || "bg-gray-100"}`}>{status}</span>;
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-[#091E42] text-white px-5 py-3 text-sm shadow-lg">{toast}</div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Caretaker Applications</h1>
        <p className="mt-1 text-[#42526E]">Review and manage caretaker applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${statusFilter === val ? "bg-[#0052CC] text-white" : "bg-white border border-[#DFE1E6] text-[#42526E] hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#DFE1E6] overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-[#42526E]">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">📋</span>
            <p className="mt-3 text-[#42526E]">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#DFE1E6]">
                <tr>
                  {["Caretaker", "Email", "Town", "Status", "Submitted", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#42526E] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {applications.map((app: any) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4 font-medium text-[#091E42]">{app.caretakerId?.name || "N/A"}</td>
                    <td className="px-5 py-4 text-[#42526E]">{app.caretakerId?.email || ""}</td>
                    <td className="px-5 py-4 text-[#42526E]">{app.profileId?.town || "—"}</td>
                    <td className="px-5 py-4">{statusBadge(app.status)}</td>
                    <td className="px-5 py-4 text-xs text-[#42526E]">{new Date(app.submittedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setSelected(app); setNote(""); }}
                        className="rounded-lg bg-[#0052CC] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0747A6]">
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

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#091E42]">Review Application</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#42526E]">Applicant</span><span className="font-medium text-[#091E42]">{selected.caretakerId?.name}</span></div>
                <div className="flex justify-between"><span className="text-[#42526E]">Email</span><span className="font-medium text-[#091E42]">{selected.caretakerId?.email}</span></div>
                <div className="flex justify-between"><span className="text-[#42526E]">Status</span>{statusBadge(selected.status)}</div>
                <div className="flex justify-between"><span className="text-[#42526E]">Submitted</span><span className="text-[#091E42]">{new Date(selected.submittedAt).toLocaleDateString()}</span></div>
                {selected.profileId && (
                  <>
                    <div className="flex justify-between"><span className="text-[#42526E]">Town</span><span className="text-[#091E42]">{selected.profileId.town}</span></div>
                    <div className="flex justify-between"><span className="text-[#42526E]">Experience</span><span className="text-[#091E42]">{selected.profileId.experience}</span></div>
                  </>
                )}
              </div>

              {/* Documents */}
              {selected.documents && (
                <div>
                  <h3 className="font-semibold text-[#091E42] mb-3">Documents</h3>
                  <div className="space-y-2">
                    {selected.documents.nicDocument && (
                      <a href={`${API_URL}${selected.documents.nicDocument}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0052CC] hover:underline">
                        🪪 View NIC Document
                      </a>
                    )}
                    {selected.documents.drivingLicense && (
                      <a href={`${API_URL}${selected.documents.drivingLicense}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0052CC] hover:underline">
                        🚗 View Driving License
                      </a>
                    )}
                    {selected.documents.certificates?.map((cert: string, i: number) => (
                      <a key={i} href={`${API_URL}${cert}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0052CC] hover:underline">
                        📜 Certificate {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#091E42] mb-2">
                  Admin Note {selected.status === "pending" ? "(required for rejection)" : ""}
                </label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  placeholder="Add a note for the applicant..."
                  className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]" />
              </div>

              {selected.status === "pending" && (
                <div className="flex gap-3">
                  <button onClick={() => handleApprove(selected._id)} disabled={actionLoading === selected._id}
                    className="flex-1 h-11 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60">
                    ✅ Approve
                  </button>
                  <button onClick={() => handleReject(selected._id)} disabled={actionLoading === selected._id}
                    className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
                    ❌ Reject
                  </button>
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
