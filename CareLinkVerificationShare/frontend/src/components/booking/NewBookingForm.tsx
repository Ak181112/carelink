"use client";

import { useCallback, useState } from "react";
import { bookingAPI, caretakerAPI, parentAPI } from "@/services/api";
import { useApiData } from "@/lib/useApiData";
import { CaretakerProfile, ParentProfile } from "@/types";
import { KURUNEGALA_HOSPITALS, formatLkr, todayIso } from "@/lib/bookingUtils";
import {
  ADMIN_SERVICE_FEE,
  HOURLY_RATE,
  RATE_PER_KM,
  estimateBookingTotal,
  estimateRoadDistanceKm,
} from "@/lib/pricing";

interface Props {
  presetCaretakerId?: string;
  onClose: () => void;
  onCreated: () => void;
}

// Reads the clock, so it lives outside the component: React treats anything
// impure inside a component body as unsafe to call during render.
const isInThePast = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).getTime() <= Date.now();

export default function NewBookingForm({ presetCaretakerId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    caretakerId: presetCaretakerId ?? "",
    parentProfileId: "",
    bookingDate: "",
    bookingTime: "",
    estimatedHours: "2",
    pickupAddress: "",
    hospitalName: KURUNEGALA_HOSPITALS[0].name,
    hospitalAddress: KURUNEGALA_HOSPITALS[0].address,
    paymentMethod: "cash",
    notes: "",
  });

  // filled by the browser's geolocation, which is what makes the travel charge
  // computable without a paid geocoding service
  const [pickupCoords, setPickupCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchParents = useCallback(() => parentAPI.getAll(), []);
  const fetchCaretakers = useCallback(() => caretakerAPI.getApproved(), []);

  const { data: parentData, loading: parentsLoading } = useApiData(fetchParents);
  const { data: caretakerData, loading: caretakersLoading } = useApiData(fetchCaretakers);

  const parents: ParentProfile[] = parentData?.profiles ?? [];
  const caretakers: CaretakerProfile[] = caretakerData?.caretakers ?? [];

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const hospital =
    KURUNEGALA_HOSPITALS.find((h) => h.name === form.hospitalName) ??
    KURUNEGALA_HOSPITALS[0];

  const hours = Number(form.estimatedHours) || 0;
  const distanceKm = estimateRoadDistanceKm(pickupCoords ?? undefined, hospital);
  const travelCharge = Math.round(distanceKm * RATE_PER_KM);
  const estimate = estimateBookingTotal(hours, distanceKm);

  const selectHospital = (name: string) => {
    const next = KURUNEGALA_HOSPITALS.find((h) => h.name === name);
    setForm((f) => ({
      ...f,
      hospitalName: name,
      // keep whatever the user typed if they have edited the address themselves
      hospitalAddress:
        f.hospitalAddress && f.hospitalAddress !== hospital.address
          ? f.hospitalAddress
          : next?.address ?? "",
    }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("This browser cannot share a location.");
      return;
    }

    setLocating(true);
    setLocationNote("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupCoords({
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        });
        setLocating(false);
      },
      (err) => {
        setLocationNote(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. The booking still works — the travel charge is added later."
            : "Could not read your location. The travel charge is added later.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.caretakerId) return setError("Please choose a caretaker.");
    if (!form.parentProfileId) return setError("Please choose who the visit is for.");
    if (!form.bookingDate || !form.bookingTime) return setError("Please choose a date and time.");
    if (!form.pickupAddress.trim()) return setError("Please enter the pickup address.");
    if (!form.hospitalAddress.trim()) return setError("Please enter the hospital address.");

    if (isInThePast(form.bookingDate, form.bookingTime)) {
      return setError("The booking date and time must be in the future.");
    }

    setSaving(true);
    try {
      await bookingAPI.create({
        caretakerId: form.caretakerId,
        parentProfileId: form.parentProfileId,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        estimatedHours: hours,
        pickupLocation: {
          address: form.pickupAddress.trim(),
          ...(pickupCoords ?? {}),
        },
        hospitalLocation: {
          hospitalName: form.hospitalName,
          address: form.hospitalAddress.trim(),
          latitude: hospital.latitude,
          longitude: hospital.longitude,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      });

      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create the booking");
    } finally {
      setSaving(false);
    }
  };

  const field = "h-11 w-full rounded-xl border border-[#DFE1E6] px-4 text-sm outline-none focus:border-[#0052CC]";
  const label = "mb-1.5 block text-sm font-medium text-[#091E42]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-xl font-bold text-[#091E42]">New Hospital Visit Booking</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Caretaker *</label>
              <select
                value={form.caretakerId}
                onChange={(e) => set("caretakerId", e.target.value)}
                className={field}
                disabled={caretakersLoading}
              >
                <option value="">
                  {caretakersLoading ? "Loading..." : "Select a caretaker"}
                </option>
                {caretakers.map((c) => {
                  const userId = typeof c.userId === "object" ? c.userId._id : c.userId;
                  return (
                    <option key={c._id} value={userId} disabled={!c.isAvailable}>
                      {c.fullName} — {c.town}
                      {c.isAvailable ? "" : " (unavailable)"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className={label}>Visit is for *</label>
              <select
                value={form.parentProfileId}
                onChange={(e) => set("parentProfileId", e.target.value)}
                className={field}
                disabled={parentsLoading}
              >
                <option value="">
                  {parentsLoading ? "Loading..." : "Select a parent profile"}
                </option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName}
                  </option>
                ))}
              </select>
              {!parentsLoading && parents.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Add a parent profile first before booking.
                </p>
              )}
            </div>

            <div>
              <label className={label}>Date *</label>
              <input
                type="date"
                min={todayIso()}
                value={form.bookingDate}
                onChange={(e) => set("bookingDate", e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Time *</label>
              <input
                type="time"
                value={form.bookingTime}
                onChange={(e) => set("bookingTime", e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Estimated hours *</label>
              <select
                value={form.estimatedHours}
                onChange={(e) => set("estimatedHours", e.target.value)}
                className={field}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Payment method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
                className={field}
              >
                <option value="cash">Cash on completion</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Pickup address *</label>
            <input
              value={form.pickupAddress}
              onChange={(e) => set("pickupAddress", e.target.value)}
              placeholder="Where should the caretaker collect your parent?"
              className={field}
            />

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="rounded-xl border border-[#DFE1E6] px-4 py-2 text-sm font-medium text-[#091E42] transition hover:border-[#0052CC] hover:bg-[#F4F8FF] disabled:opacity-60"
              >
                {locating ? "Locating..." : "📍 Use my current location"}
              </button>

              {pickupCoords && (
                <span className="text-xs text-green-700">
                  Pinned at {pickupCoords.latitude}, {pickupCoords.longitude}
                  <button
                    type="button"
                    onClick={() => setPickupCoords(null)}
                    className="ml-2 text-[#42526E] underline"
                  >
                    clear
                  </button>
                </span>
              )}
            </div>

            {locationNote && (
              <p className="mt-1.5 text-xs text-orange-700">{locationNote}</p>
            )}
            {!pickupCoords && !locationNote && (
              <p className="mt-1.5 text-xs text-[#6B7280]">
                Sharing your location lets us quote the travel charge up front.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Hospital *</label>
              <select
                value={form.hospitalName}
                onChange={(e) => selectHospital(e.target.value)}
                className={field}
              >
                {KURUNEGALA_HOSPITALS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Hospital address *</label>
              <input
                value={form.hospitalAddress}
                onChange={(e) => set("hospitalAddress", e.target.value)}
                placeholder="Street address of the hospital"
                className={field}
              />
            </div>
          </div>

          <div>
            <label className={label}>Notes for the caretaker</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. wheelchair needed, bring previous reports"
              className="w-full rounded-xl border border-[#DFE1E6] px-4 py-3 text-sm outline-none focus:border-[#0052CC]"
            />
          </div>

          <div className="rounded-xl bg-[#EEF4FF] p-4 text-sm text-[#42526E]">
            <div className="flex justify-between">
              <span>Caretaker charge ({hours}h × {formatLkr(HOURLY_RATE)})</span>
              <span>{formatLkr(hours * HOURLY_RATE)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>CareLink+ service fee</span>
              <span>{formatLkr(ADMIN_SERVICE_FEE)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>
                Travel{distanceKm > 0 ? ` (${distanceKm} km × ${formatLkr(RATE_PER_KM)})` : ""}
              </span>
              <span>
                {distanceKm > 0 ? formatLkr(travelCharge) : "added later"}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-blue-200 pt-2 font-bold text-[#091E42]">
              <span>Estimated total</span>
              <span>{formatLkr(estimate)}</span>
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              {distanceKm > 0
                ? "Distance is estimated from your pinned location to the hospital. CareLink+ confirms the final price."
                : `Pin your pickup location above to see the ${formatLkr(RATE_PER_KM)}/km travel charge now.`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-[#DFE1E6] text-sm font-semibold text-[#42526E] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 flex-1 rounded-xl bg-[#0052CC] text-sm font-semibold text-white hover:bg-[#0747A6] disabled:opacity-60"
            >
              {saving ? "Sending..." : "Send Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
