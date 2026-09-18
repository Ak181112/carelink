"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  Hospital,
  CalendarDays,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { bookingAPI, caretakerAPI, parentAPI } from "@/services/api";

function money(v: number) {
  return `LKR ${Number(v || 0).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
}

export default function BookingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [parents, setParents] = useState<any[]>([]);
  const [caretaker, setCaretaker] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [parentId, setParentId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    placeId?: string;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const caretakerId = params.get("caretakerId") || "";

  useEffect(() => {
    Promise.all([
      parentAPI.getAll(),
      caretakerId
        ? caretakerAPI.getById(caretakerId)
        : Promise.resolve({ caretaker: null }),
    ])
      .then(([p, c]) => {
        setParents(p.profiles || p.parents || []);
        setCaretaker(c.caretaker);
        const parentProfiles = p.profiles || p.parents || [];
        if (parentProfiles[0]) setParentId(parentProfiles[0]._id);
      })
      .catch((e) => setMessage(e.message));
  }, [caretakerId]);

  const sortedHospitals = useMemo(() => hospitals, [hospitals]);

  useEffect(() => {
    const selectedParent = parents.find((p) => p._id === parentId);
    if (!selectedParent?.address) return;
    // Parent profiles already contain the residential/pickup address. Use it
    // as the booking starting point while still allowing the client to edit it.
    setAddress(selectedParent.address);
    setLocation(null);
    setHospitalId("");
    setHospitals([]);
    setQuote(null);
  }, [parentId, parents]);

  const detectLocation = () => {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Location services are not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        try {
          const g = await bookingAPI.geocode(`${coords.lat},${coords.lng}`);
          setAddress(g.location.formattedAddress);
        } catch {
          setAddress("Current device location");
        }
        try {
          const h = await bookingAPI.hospitals(coords);
          setHospitals(h.hospitals || []);
          if (h.hospitals?.[0]) setHospitalId(h.hospitals[0]._id);
          if (!h.hospitals?.length)
            setMessage(
              "No hospitals are available in the pilot hospital list yet.",
            );
        } catch (e: any) {
          setHospitals([]);
          setMessage(e.message || "Could not load nearby hospitals.");
        }
      },
      () =>
        setMessage(
          "Please allow location access or enter an address and use the address lookup.",
        ),
    );
  };

  const lookupAddress = async () => {
    if (!address.trim()) return;
    setLocation(null);
    setHospitalId("");
    setHospitals([]);
    setQuote(null);
    setBusy(true);
    setMessage("");
    try {
      const g = await bookingAPI.geocode(address);
      setLocation(g.location);
      setAddress(g.location.formattedAddress);
      const h = await bookingAPI.hospitals(g.location);
      setHospitals(h.hospitals || []);
      if (h.hospitals?.[0]) setHospitalId(h.hospitals[0]._id);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  const loadQuote = async () => {
    if (!parentId || !hospitalId || !caretakerId || !location) {
      setMessage(
        "Select a parent, pickup location, hospital, and caretaker first.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const data = await bookingAPI.quote({
        parentId,
        hospitalId,
        caretakerId,
        pickupLocation: { ...location, address },
      });
      setQuote(data.quote);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    if (!quote || !date || !time) {
      setMessage(
        "Select the visit date and time and calculate the quote first.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const data = await bookingAPI.create({
        parentId,
        hospitalId,
        caretakerId,
        scheduledDate: date,
        startTime: time,
        serviceNotes: notes,
        pickupLocation: { ...location, address },
      });
      router.push(`/client/booking-status?bookingId=${data.booking._id}`);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-7">
          {/* <p className="text-sm font-semibold text-[#003898]">
            CareLink+ Booking
          </p> */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Book a hospital visit
          </h1>
          <p className="text-slate-500 mt-2">
            Choose the patient, pickup location and nearest suitable hospital.
            Your live price is calculated before confirmation.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-white p-5 sm:p-7 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                1. Patient & caretaker
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <div className="space-y-3">
                  <label className="space-y-2 block">
                    <span className="text-sm font-semibold">
                      Parent profile
                    </span>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 bg-white"
                    >
                      <option value="">Select parent</option>
                      {parents.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.fullName} · Age {p.age ?? "-"}
                        </option>
                      ))}
                    </select>
                  </label>
                  {parentId &&
                    (() => {
                      const selectedParent = parents.find(
                        (p) => p._id === parentId,
                      );
                      return selectedParent ? (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm">
                          <p className="font-bold text-slate-900">
                            {selectedParent.fullName}
                          </p>
                          <p className="text-slate-600 mt-1">
                            Age {selectedParent.age ?? "-"} ·{" "}
                            {selectedParent.address}
                          </p>
                          <p className="text-slate-600 mt-1">
                            ☎ {selectedParent.contactNumber}
                          </p>
                          {selectedParent.medicalConditions && (
                            <p className="text-slate-600 mt-1">
                              Medical: {selectedParent.medicalConditions}
                            </p>
                          )}
                        </div>
                      ) : null;
                    })()}
                </div>
                <div className="rounded-xl border bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Selected caretaker
                  </p>
                  <p className="font-bold mt-1">
                    {caretaker?.fullName ||
                      caretaker?.userId?.name ||
                      "Caretaker not found"}
                  </p>
                  <p className="text-sm text-slate-500">
                    ⭐ {Number(caretaker?.averageRating ?? 0).toFixed(1)} ·{" "}
                    {caretaker?.town || caretaker?.district || "Kurunegala"}
                  </p>
                  {caretaker?.isAvailable != null && (
                    <p
                      className={`text-xs mt-2 font-semibold ${caretaker.isAvailable ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {caretaker.isAvailable
                        ? "Available"
                        : "Currently unavailable"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    2. Pickup location
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Like a marketplace delivery address: use your device
                    location or search your address.
                  </p>
                </div>
                <button
                  onClick={detectLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#003898] px-4 py-2.5 text-[#003898] font-semibold hover:bg-blue-50"
                >
                  <Navigation size={17} /> Use my location
                </button>
              </div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-3 mt-5">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / street / town, Kurunegala"
                  className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={lookupAddress}
                  disabled={busy}
                  className="rounded-xl bg-[#003898] text-white px-5 py-3 font-semibold disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : (
                    "Find location"
                  )}
                </button>
              </div>
              {location && (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Location verified</p>
                      <p className="text-emerald-700/80">{address}</p>
                      <p className="text-xs text-emerald-700/70 mt-1">
                        Coordinates: {location.lat.toFixed(5)},{" "}
                        {location.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-5 sm:p-7 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                3. Nearest hospital
              </h2>
              <div className="mt-4 space-y-3">
                {sortedHospitals.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Select/search a pickup location to load nearby hospitals.
                  </p>
                ) : (
                  sortedHospitals.map((h: any) => (
                    <button
                      type="button"
                      key={h._id}
                      onClick={() => setHospitalId(h._id)}
                      className={`w-full text-left rounded-2xl border p-4 transition ${hospitalId === h._id ? "border-[#003898] ring-2 ring-blue-100 bg-blue-50/50" : "hover:border-slate-300"}`}
                    >
                      <div className="flex items-start gap-3">
                        <Hospital className="text-[#003898] mt-0.5" size={20} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="font-bold text-slate-900">{h.name}</p>
                            {h.distanceKm != null && (
                              <span className="text-sm font-semibold text-[#003898]">
                                {h.distanceKm} km
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {h.address}
                          </p>
                          {h.durationMinutes != null && (
                            <p className="text-xs text-slate-400 mt-1">
                              Approx. {h.durationMinutes} min by road
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-1">
                            Distance source:{" "}
                            {h.distanceSource === "google_routes"
                              ? "Google Routes road distance"
                              : "fallback estimate"}
                          </p>
                        </div>
                        {hospitalId === h._id && (
                          <CheckCircle2
                            className="text-emerald-600 shrink-0"
                            size={20}
                          />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 sm:p-7 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                4. Visit schedule
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <label className="space-y-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <CalendarDays size={16} /> Date
                  </span>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Clock size={16} /> Start time
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Optional notes for the caretaker"
                className="w-full mt-4 rounded-xl border px-4 py-3"
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={loadQuote}
                  disabled={busy}
                  className="rounded-xl border border-[#003898] text-[#003898] px-5 py-3 font-semibold hover:bg-blue-50"
                >
                  Calculate live price
                </button>
                <button
                  onClick={create}
                  disabled={!quote || busy}
                  className="rounded-xl bg-[#003898] text-white px-5 py-3 font-semibold disabled:opacity-50"
                >
                  Confirm booking request
                </button>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-5 rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live price summary
            </p>
            {quote ? (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Distance</span>
                  <span className="font-semibold">{quote.distanceKm} km</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Distance charge</span>
                  <span className="font-semibold">
                    {money(quote.distanceCharge)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Caretaker service</span>
                  <span className="font-semibold">
                    {money(quote.caretakerServiceCharge)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Admin fee ({quote.adminFeePercent}%)
                  </span>
                  <span className="font-semibold">
                    {money(quote.adminFeeAmount)}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between gap-4">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-extrabold text-[#003898]">
                    {money(quote.total)}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Road distance source:{" "}
                  {quote.distanceSource === "google_routes"
                    ? "Google Routes API"
                    : "temporary straight-line fallback"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Your total appears here after a valid pickup location and
                hospital are selected.
              </div>
            )}
            {message && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-sm">
                {message}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
