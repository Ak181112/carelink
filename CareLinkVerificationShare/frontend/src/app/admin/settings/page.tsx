"use client";

import { useCallback, useState } from "react";
import { adminAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { PlatformSettings } from "@/types";
import { formatLkr } from "@/lib/bookingUtils";

type Draft = Record<keyof PlatformSettings, string | boolean>;

const NUMBER_FIELDS: {
  key: keyof PlatformSettings;
  label: string;
  hint: string;
  unit: string;
}[] = [
  {
    key: "hourlyRate",
    label: "Caretaker hourly rate",
    hint: "Paid to the caretaker for each hour of the visit.",
    unit: "LKR / hour",
  },
  {
    key: "adminServiceFee",
    label: "CareLink+ service fee",
    hint: "Flat fee added to every booking.",
    unit: "LKR",
  },
  {
    key: "ratePerKm",
    label: "Travel rate",
    hint: "Charged on the estimated distance from pickup to hospital.",
    unit: "LKR / km",
  },
  {
    key: "maxBookingHours",
    label: "Maximum visit length",
    hint: "The longest single visit a client may book.",
    unit: "hours",
  },
  {
    key: "minNoticeHours",
    label: "Minimum booking notice",
    hint: "How far ahead a booking must be made so caretakers can plan.",
    unit: "hours",
  },
];

const TOGGLE_FIELDS: {
  key: keyof PlatformSettings;
  label: string;
  hint: string;
}[] = [
  {
    key: "registrationOpen",
    label: "Registration open",
    hint: "Turn off to stop new clients and caretakers signing up.",
  },
  {
    key: "autoApproveMatchedApplications",
    label: "Auto-approve matched applications",
    hint: "Approve caretakers automatically when OCR matches their NIC address. Leave off to review every application by hand.",
  },
];

export default function AdminSettingsPage() {
  const fetchSettings = useCallback(() => adminAPI.getSettings(), []);
  const { data, loading, reload } = useApiData(fetchSettings);

  const settings: PlatformSettings | null = data?.settings ?? null;

  // The draft is seeded when the admin starts editing, so no effect has to keep
  // it in sync with the fetched settings.
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startEditing = () => {
    if (!settings) return;

    setDraft({
      hourlyRate: String(settings.hourlyRate),
      adminServiceFee: String(settings.adminServiceFee),
      ratePerKm: String(settings.ratePerKm),
      maxBookingHours: String(settings.maxBookingHours),
      minNoticeHours: String(settings.minNoticeHours),
      registrationOpen: settings.registrationOpen,
      autoApproveMatchedApplications: settings.autoApproveMatchedApplications,
    } as Draft);

    setError("");
    setSuccess("");
  };

  const set = (key: keyof PlatformSettings, value: string | boolean) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const handleSave = async () => {
    if (!draft) return;

    setError("");
    setSuccess("");

    for (const field of NUMBER_FIELDS) {
      const value = Number(draft[field.key]);

      if (!Number.isFinite(value) || value < 0) {
        setError(`${field.label} must be a positive number.`);
        return;
      }
    }

    if (Number(draft.maxBookingHours) < 1 || Number(draft.maxBookingHours) > 24) {
      setError("Maximum visit length must be between 1 and 24 hours.");
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updateSettings({
        hourlyRate: Number(draft.hourlyRate),
        adminServiceFee: Number(draft.adminServiceFee),
        ratePerKm: Number(draft.ratePerKm),
        maxBookingHours: Number(draft.maxBookingHours),
        minNoticeHours: Number(draft.minNoticeHours),
        registrationOpen: draft.registrationOpen,
        autoApproveMatchedApplications: draft.autoApproveMatchedApplications,
      });

      setSuccess("Settings saved. New bookings are priced with these rates.");
      setDraft(null);
      reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save the settings");
    } finally {
      setSaving(false);
    }
  };

  const editing = draft !== null;

  // Worked example so the admin can see what a change actually costs a client
  const rates = editing
    ? {
        hourlyRate: Number(draft.hourlyRate) || 0,
        adminServiceFee: Number(draft.adminServiceFee) || 0,
        ratePerKm: Number(draft.ratePerKm) || 0,
      }
    : {
        hourlyRate: settings?.hourlyRate ?? 0,
        adminServiceFee: settings?.adminServiceFee ?? 0,
        ratePerKm: settings?.ratePerKm ?? 0,
      };

  const exampleTotal = rates.hourlyRate * 2 + rates.adminServiceFee + rates.ratePerKm * 10;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#091E42]">System Settings</h1>
          <p className="mt-1 text-[#42526E]">
            Pricing and booking rules used across the platform.
          </p>
        </div>

        {!loading &&
          (editing ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setDraft(null); setError(""); }}
                className="rounded-xl border border-[#DFE1E6] px-5 py-2.5 text-sm font-semibold text-[#42526E] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0747A6]"
            >
              ✏️ Edit Settings
            </button>
          ))}
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

      {loading ? (
        <div className="py-16 text-center text-[#42526E]">Loading settings...</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
            <h2 className="mb-1 text-lg font-bold text-[#091E42]">Booking pricing</h2>
            <p className="mb-5 text-sm text-[#6B7280]">
              Every booking is priced on the server using these rates, so a change
              here applies to the next booking made.
            </p>

            <div className="space-y-4">
              {NUMBER_FIELDS.slice(0, 3).map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-3">
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={String(draft[f.key])}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="h-11 w-40 rounded-xl border border-[#DFE1E6] px-4 text-sm tabular-nums outline-none focus:border-[#0052CC]"
                      />
                    ) : (
                      <div className="flex h-11 w-40 items-center rounded-xl border border-[#DFE1E6] bg-[#F8FAFC] px-4 text-sm tabular-nums text-[#091E42]">
                        {settings?.[f.key] as number}
                      </div>
                    )}
                    <span className="text-sm text-[#6B7280]">{f.unit}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">{f.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-[#EEF4FF] p-4 text-sm text-[#42526E]">
              <p className="font-medium text-[#091E42]">Example: a 2-hour visit, 10 km away</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Caretaker charge (2 × {formatLkr(rates.hourlyRate)})</span>
                  <span className="tabular-nums">{formatLkr(rates.hourlyRate * 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span className="tabular-nums">{formatLkr(rates.adminServiceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel (10 km × {formatLkr(rates.ratePerKm)})</span>
                  <span className="tabular-nums">{formatLkr(rates.ratePerKm * 10)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1.5 font-bold text-[#091E42]">
                  <span>Client pays</span>
                  <span className="tabular-nums">{formatLkr(exampleTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-[#091E42]">Booking rules</h2>

            <div className="space-y-4">
              {NUMBER_FIELDS.slice(3).map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-sm font-medium text-[#091E42]">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-3">
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={String(draft[f.key])}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="h-11 w-40 rounded-xl border border-[#DFE1E6] px-4 text-sm tabular-nums outline-none focus:border-[#0052CC]"
                      />
                    ) : (
                      <div className="flex h-11 w-40 items-center rounded-xl border border-[#DFE1E6] bg-[#F8FAFC] px-4 text-sm tabular-nums text-[#091E42]">
                        {settings?.[f.key] as number}
                      </div>
                    )}
                    <span className="text-sm text-[#6B7280]">{f.unit}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">{f.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
            <h2 className="mb-5 text-lg font-bold text-[#091E42]">Platform switches</h2>

            <div className="space-y-1">
              {TOGGLE_FIELDS.map((f) => {
                const value = editing
                  ? Boolean(draft[f.key])
                  : Boolean(settings?.[f.key]);

                return (
                  <div
                    key={f.key}
                    className="flex items-start justify-between gap-4 border-b border-[#F4F5F7] py-3.5 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#091E42]">{f.label}</p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">{f.hint}</p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={value}
                      aria-label={f.label}
                      disabled={!editing}
                      onClick={() => set(f.key, !value)}
                      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                        value ? "bg-[#0052CC]" : "bg-gray-200"
                      } ${editing ? "" : "opacity-60"}`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#DFE1E6] bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-[#091E42]">Coverage</h2>
            <div className="space-y-3 text-sm">
              {[
                ["District", "Kurunegala District only (pilot)"],
                ["Currency", "LKR"],
                ["Platform", "CareLink+"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#42526E]">{label}</span>
                  <span className="font-medium text-[#091E42]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {settings?.updatedAt && (
            <p className="text-center text-xs text-[#6B7280]">
              Last changed {new Date(settings.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
