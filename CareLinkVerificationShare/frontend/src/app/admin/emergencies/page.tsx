"use client";

import { useCallback, useState } from "react";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { Booking } from "@/types";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  formatBookingDate,
  nameOf,
  parentNameOf,
} from "@/lib/bookingUtils";

// The API adds these when an admin closes an emergency off
type EmergencyBooking = Booking & {
  emergencyResolvedAt?: string | null;
  emergencyResolutionNote?: string;
  parentProfileId: Booking["parentProfileId"] & {
    emergencyContact?: { name?: string; phone?: string; relationship?: string };
  };
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "false", label: "Open" },
  { value: "true", label: "Resolved" },
];

export default function AdminEmergenciesPage() {
  const [resolvedFilter, setResolvedFilter] = useState("false");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const fetchEmergencies = useCallback(
    () => adminAPI.getEmergencies((resolvedFilter || undefined) as "true" | "false" | undefined),
    [resolvedFilter],
  );

  const { data, loading, reload } = useApiData(fetchEmergencies);
  const emergencies: EmergencyBooking[] = data?.emergencies ?? [];
  const stats = data?.stats ?? { total: 0, open: 0 };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleResolve = async (booking: EmergencyBooking) => {
    const note = prompt("What was done about this emergency?");
    if (note === null) return;

    if (!note.trim()) {
      showToast("Please record what was done before resolving");
      return;
    }

    setBusyId(booking._id);
    try {
      await adminAPI.resolveEmergency(booking._id, note);
      showToast("Emergency resolved — both parties notified");
      reload();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Could not resolve");
    } finally {
      setBusyId(null);
    }
  };

  const phoneOf = (ref: Booking["parentId"]) =>
    typeof ref === "object" && ref?.phone ? ref.phone : null;

  return (
    <div>
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-[#091E42] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#091E42]">Emergency Monitoring</h1>
        <p className="mt-1 text-[#42526E]">
          Incidents raised by clients or caretakers during a hospital visit.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700">
            Open right now
          </p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {loading ? "—" : stats.open}
          </p>
        </div>
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#42526E]">
            Total reported
          </p>
          <p className="mt-2 text-3xl font-bold text-[#091E42]">
            {loading ? "—" : stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#42526E]">
            Resolved
          </p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {loading ? "—" : stats.total - stats.open}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setResolvedFilter(f.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              resolvedFilter === f.value
                ? "bg-[#0052CC] text-white"
                : "border border-[#DFE1E6] bg-white text-[#42526E] hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#42526E]">Loading emergencies...</div>
      ) : emergencies.length === 0 ? (
        <div className="rounded-2xl border border-[#DFE1E6] bg-white p-16 text-center">
          <span className="text-6xl">✅</span>
          <h3 className="mt-4 text-xl font-bold text-[#091E42]">
            {resolvedFilter === "false" ? "No open emergencies" : "Nothing here"}
          </h3>
          <p className="mt-2 text-[#42526E]">
            Emergencies raised during a visit appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {emergencies.map((b) => {
            const open = !b.emergencyResolvedAt;
            const profile =
              typeof b.parentProfileId === "object" ? b.parentProfileId : null;

            return (
              <div
                key={b._id}
                className={`rounded-2xl border p-6 ${
                  open ? "border-red-300 bg-red-50" : "border-[#DFE1E6] bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-[#091E42]">
                      {open && <span aria-hidden>🚨</span>}
                      {b.hospitalLocation.hospitalName}
                    </h3>
                    <p className="mt-0.5 text-sm text-[#42526E]">
                      {formatBookingDate(b.bookingDate)} at {b.bookingTime} · visit for{" "}
                      {parentNameOf(b.parentProfileId)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        open
                          ? "bg-red-600 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {open ? "OPEN" : "Resolved"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                    >
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                    Reported
                  </p>
                  <p className="mt-1 text-[#091E42]">{b.emergencyMessage}</p>
                </div>

                {/* Who to ring — the whole point of this page during an incident */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { role: "Caretaker", name: nameOf(b.caretakerId), phone: phoneOf(b.caretakerId) },
                    { role: "Client", name: nameOf(b.parentId), phone: phoneOf(b.parentId) },
                    {
                      role: profile?.emergencyContact?.relationship
                        ? `Emergency (${profile.emergencyContact.relationship})`
                        : "Emergency contact",
                      name: profile?.emergencyContact?.name ?? "—",
                      phone: profile?.emergencyContact?.phone ?? profile?.contactNumber ?? null,
                    },
                  ].map((c) => (
                    <div key={c.role} className="rounded-xl bg-white p-3 ring-1 ring-[#DFE1E6]">
                      <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                        {c.role}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#091E42]">{c.name}</p>
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          className="text-sm font-semibold text-[#0052CC] hover:underline"
                        >
                          📞 {c.phone}
                        </a>
                      ) : (
                        <p className="text-sm text-[#6B7280]">No number on file</p>
                      )}
                    </div>
                  ))}
                </div>

                {profile?.medicalConditions && (
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-[#42526E] ring-1 ring-[#DFE1E6]">
                    <span className="font-medium text-[#091E42]">Medical conditions:</span>{" "}
                    {profile.medicalConditions}
                  </p>
                )}

                {open ? (
                  <button
                    onClick={() => handleResolve(b)}
                    disabled={busyId === b._id}
                    className="mt-4 rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60"
                  >
                    Mark as resolved
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    <strong>Resolved</strong>{" "}
                    {b.emergencyResolvedAt &&
                      `on ${new Date(b.emergencyResolvedAt).toLocaleString()}`}
                    {b.emergencyResolutionNote && ` — ${b.emergencyResolutionNote}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
