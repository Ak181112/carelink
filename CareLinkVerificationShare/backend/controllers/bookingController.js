const crypto = require("crypto");
const Booking = require("../models/Booking");
const ParentProfile = require("../models/ParentProfile");
const Hospital = require("../models/Hospital");
const CaretakerProfile = require("../models/CaretakerProfile");
const SystemSetting = require("../models/SystemSetting");
const Payment = require("../models/Payment");
const { computeRoadDistance, checkGoogleRoutes, geocodeAddress, findNearbyHospitals } = require("../services/mapsService");
const { getPricingSettings, calculateTotal } = require("../services/pricingService");
const { notify } = require("../services/notificationService");

const STAGES = [
  ["task_started", "Task Started"],
  ["at_hospital", "At Hospital"],
  ["consultation_completed", "Consultation Completed"],
  ["back_to_home", "Back to Home"],
  ["task_completed", "Task Completed"],
];

const freshStages = () => STAGES.map(([key, label]) => ({ key, label, status: "not_started" }));
const getBooking = (id) => Booking.findById(id)
  .populate("parentId")
  .populate({ path: "caretakerId", select: "name email phone" })
  .populate({ path: "clientId", select: "name email phone" })
  .populate("hospitalId");

async function resolveCaretaker(inputId) {
  if (!inputId) return null;
  // Booking links historically used both caretaker profile IDs and User IDs.
  // Resolve either form to the canonical CaretakerProfile/User pair.
  let profile = null;
  try { profile = await CaretakerProfile.findOne({ _id: inputId, applicationStatus: "approved", isVerified: true }); } catch (_) {}
  if (!profile) {
    profile = await CaretakerProfile.findOne({ userId: inputId, applicationStatus: "approved", isVerified: true });
  }
  return profile;
}

async function calculateQuote(req, res, next) {
  try {
    const { parentId, hospitalId, pickupLocation, caretakerId } = req.body;
    const parent = await ParentProfile.findOne({ _id: parentId, userId: req.user._id });
    const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true });
    const caretaker = await resolveCaretaker(caretakerId);
    if (!parent || !hospital || !caretaker) return res.status(400).json({ success: false, message: "Invalid parent, hospital or caretaker selection" });
    if (!pickupLocation?.lat || !pickupLocation?.lng || !pickupLocation?.address) return res.status(400).json({ success: false, message: "Select a valid pickup location" });

    const route = await computeRoadDistance(
      { lat: Number(pickupLocation.lat), lng: Number(pickupLocation.lng) },
      hospital.location,
      { allowFallback: String(process.env.REQUIRE_GOOGLE_ROUTES_FOR_PRICING ?? "true").toLowerCase() !== "true" }
    );
    const requireGoogleRoutes = String(process.env.REQUIRE_GOOGLE_ROUTES_FOR_PRICING ?? "true").toLowerCase() === "true";
    if (requireGoogleRoutes && route.source !== "google_routes") {
      return res.status(route.googleError?.status || 503).json({
        success: false,
        message: `Google Routes is required for enterprise pricing but is unavailable: ${route.googleError?.message || "No road route was returned."}`,
        code: route.googleError?.code || "GOOGLE_ROUTES_UNAVAILABLE",
        distanceSource: route.source,
      });
    }
    const settings = await getPricingSettings();
    const pricing = calculateTotal({ distanceKm: route.distanceKm, ...settings });

    res.json({ success: true, quote: {
      parent: { id: parent._id, fullName: parent.fullName },
      hospital: { id: hospital._id, name: hospital.name, address: hospital.address },
      caretaker: { id: caretaker.userId, profileId: caretaker._id, name: caretaker.fullName, rating: caretaker.averageRating },
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      ...settings,
      ...pricing,
      currency: "LKR",
      distanceSource: route.source,
    }});
  } catch (error) { next(error); }
}

async function createBooking(req, res, next) {
  try {
    const { parentId, hospitalId, caretakerId, scheduledDate, startTime, serviceNotes, pickupLocation } = req.body;
    const parent = await ParentProfile.findOne({ _id: parentId, userId: req.user._id });
    const hospital = await Hospital.findOne({ _id: hospitalId, isActive: true });
    const caretaker = await resolveCaretaker(caretakerId);
    if (!parent || !hospital || !caretaker) return res.status(400).json({ success: false, message: "Invalid booking selection" });

    const canonicalCaretakerId = caretaker.userId;

    const conflict = await Booking.findOne({ caretakerId: canonicalCaretakerId, scheduledDate: new Date(scheduledDate), startTime, status: { $in: ["requested", "accepted", "in_progress", "payment_pending"] } });
    if (conflict) return res.status(409).json({ success: false, message: "Caretaker is already booked for this date and time" });

    const route = await computeRoadDistance(
      { lat: Number(pickupLocation.lat), lng: Number(pickupLocation.lng) },
      hospital.location,
      { allowFallback: String(process.env.REQUIRE_GOOGLE_ROUTES_FOR_PRICING ?? "true").toLowerCase() !== "true" }
    );
    const requireGoogleRoutes = String(process.env.REQUIRE_GOOGLE_ROUTES_FOR_PRICING ?? "true").toLowerCase() === "true";
    if (requireGoogleRoutes && route.source !== "google_routes") {
      return res.status(route.googleError?.status || 503).json({
        success: false,
        message: `Google Routes is required for enterprise pricing but is unavailable: ${route.googleError?.message || "No road route was returned."}`,
        code: route.googleError?.code || "GOOGLE_ROUTES_UNAVAILABLE",
        distanceSource: route.source,
      });
    }
    const settings = await getPricingSettings();
    const price = calculateTotal({ distanceKm: route.distanceKm, ...settings });

    const booking = await Booking.create({
      clientId: req.user._id,
      caretakerId: canonicalCaretakerId,
      parentId,
      hospitalId,
      scheduledDate: new Date(scheduledDate),
      startTime,
      serviceNotes,
      pickupLocation: { ...pickupLocation, lat: Number(pickupLocation.lat), lng: Number(pickupLocation.lng) },
      hospitalSnapshot: { name: hospital.name, address: hospital.address, ...hospital.location },
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes || 0,
      pricing: { ...settings, ...price, currency: "LKR" },
      progress: { currentStage: "task_started", stages: freshStages() },
    });

    const [clientName] = [req.user.name];
    await notify(canonicalCaretakerId, "New Booking Request", `${clientName} requested a hospital visit booking for ${parent.fullName}.`, "booking_requested");
    await notify(req.user._id, "Booking Requested", "Your caretaker booking request was sent successfully.", "booking_requested");

    res.status(201).json({ success: true, booking: await getBooking(booking._id) });
  } catch (error) { next(error); }
}

async function listClientBookings(req, res, next) {
  try { res.json({ success: true, bookings: await Booking.find({ clientId: req.user._id }).sort({ createdAt: -1 }).populate("parentId hospitalId").populate("caretakerId", "name email phone") }); }
  catch (e) { next(e); }
}
async function listCaretakerBookings(req, res, next) {
  try { res.json({ success: true, bookings: await Booking.find({ caretakerId: req.user._id }).sort({ createdAt: -1 }).populate("parentId hospitalId").populate("clientId", "name email phone") }); }
  catch (e) { next(e); }
}
async function getBookingById(req, res, next) {
  try {
    const booking = await getBooking(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const clientUserId = booking.clientId?._id || booking.clientId;
    const caretakerUserId = booking.caretakerId?._id || booking.caretakerId;
    const allowed = [String(clientUserId), String(caretakerUserId)].includes(String(req.user._id));
    if (!allowed && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, booking });
  } catch (e) { next(e); }
}

async function updateBookingStatus(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const status = req.body.status;
    if (req.user.role === "caretaker") {
      if (String(booking.caretakerId) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Access denied" });
      if (!["accepted", "rejected"].includes(status) || booking.status !== "requested") return res.status(400).json({ success: false, message: "Invalid booking transition" });
      booking.status = status;
      await booking.save();
      await notify(booking.clientId, status === "accepted" ? "Booking Accepted" : "Booking Rejected", `Your caretaker has ${status} your booking request.`, `booking_${status}`);
    } else if (req.user.role === "family_member") {
      if (String(booking.clientId) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Access denied" });
      if (status === "cancelled" && ["requested", "accepted"].includes(booking.status)) {
        booking.status = "cancelled";
        booking.cancellationReason = req.body.reason || "Cancelled by client";
        await booking.save();
        await notify(booking.caretakerId, "Booking Cancelled", "A client cancelled the booking request.", "booking_cancelled");
      } else return res.status(400).json({ success: false, message: "Booking cannot be cancelled at this stage" });
    }
    res.json({ success: true, booking: await getBooking(booking._id) });
  } catch (e) { next(e); }
}

async function generateOtp(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || String(booking.caretakerId) !== String(req.user._id)) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "accepted") return res.status(400).json({ success: false, message: "Booking must be accepted before OTP verification" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    booking.otp.codeHash = crypto.createHash("sha256").update(code).digest("hex");
    booking.otp.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await booking.save();
    await notify(booking.clientId, "Job OTP", `Your secure CareLink+ job OTP is ${code}. Share it only when your caretaker has arrived.`, "job_otp");
    res.json({ success: true, expiresAt: booking.otp.expiresAt, demoCode: process.env.NODE_ENV === "development" ? code : undefined });
  } catch (e) { next(e); }
}

async function verifyOtp(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || String(booking.caretakerId) !== String(req.user._id)) return res.status(404).json({ success: false, message: "Booking not found" });
    const codeHash = crypto.createHash("sha256").update(String(req.body.code || "")).digest("hex");
    if (!booking.otp.expiresAt || booking.otp.expiresAt < new Date() || codeHash !== booking.otp.codeHash) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    booking.otp.verifiedAt = new Date();
    booking.status = "in_progress";
    booking.progress.currentStage = "task_started";
    booking.progress.stages = booking.progress.stages.map(s => ({ ...s.toObject?.() || s, status: s.key === "task_started" ? "in_progress" : "not_started", updatedAt: s.key === "task_started" ? new Date() : null, updatedBy: s.key === "task_started" ? req.user._id : null }));
    await booking.save();
    await notify(booking.clientId, "Task Started", "Your caretaker verified the OTP and started the hospital visit.", "job_started");
    res.json({ success: true, booking: await getBooking(booking._id) });
  } catch (e) { next(e); }
}

async function updateProgress(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || String(booking.caretakerId) !== String(req.user._id)) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "in_progress") return res.status(400).json({ success: false, message: "The booking is not in progress" });
    const nextStage = req.body.stage;
    const idx = STAGES.findIndex(([key]) => key === nextStage);
    if (idx < 0) return res.status(400).json({ success: false, message: "Invalid progress stage" });
    if (nextStage === "task_started" && !booking.otp.verifiedAt) return res.status(400).json({ success: false, message: "Verify OTP before starting the task" });

    booking.progress.stages = booking.progress.stages.map((stage, i) => {
      const s = stage.toObject?.() || stage;
      if (i < idx) return { ...s, status: "completed", updatedAt: s.updatedAt || new Date(), updatedBy: s.updatedBy || req.user._id };
      if (i === idx) return { ...s, status: "in_progress", updatedAt: new Date(), updatedBy: req.user._id };
      return { ...s, status: "not_started" };
    });
    booking.progress.currentStage = nextStage;
    if (nextStage === "task_completed") {
      booking.progress.stages[booking.progress.stages.length - 1].status = "completed";
      booking.caretakerCompletedAt = new Date();
    }
    await booking.save();
    await notify(booking.clientId, `Care Progress: ${booking.progress.stages.find(s => s.key === nextStage)?.label}`, `Your caretaker updated the hospital visit progress to ${booking.progress.stages.find(s => s.key === nextStage)?.label}.`, "care_progress");
    res.json({ success: true, booking: await getBooking(booking._id) });
  } catch (e) { next(e); }
}

async function clientComplete(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || String(booking.clientId) !== String(req.user._id)) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!booking.caretakerCompletedAt || booking.progress.stages.every(s => s.key !== "task_completed" || s.status !== "completed")) return res.status(400).json({ success: false, message: "Caretaker must complete the task first" });
    booking.clientCompletedAt = new Date();
    booking.status = "payment_pending";
    await booking.save();
    const existingPayment = await Payment.findOne({ bookingId: booking._id });
    const payment = existingPayment || await Payment.create({ bookingId: booking._id, clientId: booking.clientId, caretakerId: booking.caretakerId, amount: booking.pricing.total, currency: "LKR", method: "card", status: "pending" });
    booking.paymentId = payment._id;
    await booking.save();
    await notify(booking.caretakerId, "Client Confirmed Completion", "The client also confirmed task completion. Payment is now pending.", "payment_pending");
    res.json({ success: true, paymentId: payment._id, booking: await getBooking(booking._id) });
  } catch (e) { next(e); }
}

async function hospitals(req, res, next) {
  try {
    const hasCoords = Number.isFinite(Number(req.query.lat)) && Number.isFinite(Number(req.query.lng));
    let rows = [];

    if (hasCoords) {
      const origin = { lat: Number(req.query.lat), lng: Number(req.query.lng) };
      const discovered = await findNearbyHospitals(origin);

      if (discovered.length) {
        const synced = [];
        for (const item of discovered) {
          const filter = item.location.placeId
            ? { "location.placeId": item.location.placeId }
            : { name: item.name, "location.lat": item.location.lat, "location.lng": item.location.lng };
          const update = {
            $set: {
              name: item.name,
              address: item.address || "Sri Lanka",
              district: item.district || "",
              town: item.town || "",
              location: item.location,
              isActive: true,
            },
          };
          const doc = await Hospital.findOneAndUpdate(filter, update, { new: true, upsert: true, setDefaultsOnInsert: true });
          synced.push(doc);
        }
        rows = synced;
      } else {
        // If external search providers are unavailable, use locally approved hospital records.
        // This keeps the system usable while the provider outage is surfaced through distanceSource.
        rows = await Hospital.find({ isActive: true }).sort({ name: 1 });
      }

      let results = await Promise.all(rows.map(async (hospital) => {
        const route = await computeRoadDistance(origin, hospital.location);
        return {
          ...hospital.toObject(),
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          distanceSource: route.source,
        };
      }));
      results.sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER));

      // The first result is the current nearest candidate after road-distance
      // sorting. Keep the list location-driven; never replace it with the
      // globally stored Kurunegala hospital list when discovery succeeded.
      return res.json({
        success: true,
        hospitals: results.slice(0, 12),
        nearestHospitalId: results[0]?._id || null,
        searchSource: discovered.length ? discovered[0].source : "local_database",
      });
    }

    rows = await Hospital.find({ isActive: true }).sort({ name: 1 });
    if (!rows.length) {
      const defaults = [
        { name: "Teaching Hospital Kurunegala", address: "Kurunegala, North Western Province, Sri Lanka", district: "Kurunegala", town: "Kurunegala", location: { lat: 7.479096, lng: 80.35914 }, isActive: true },
        { name: "Kurunegala Hospital", address: "Kurunegala, North Western Province, Sri Lanka", district: "Kurunegala", town: "Kurunegala", location: { lat: 7.478422, lng: 80.359839 }, isActive: true },
        { name: "Teaching Hospital Kuliyapitiya", address: "Kuliyapitiya, Kurunegala District, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.47131, lng: 80.04481 }, isActive: true },
        { name: "Base Hospital Kuliyapitiya", address: "Hettipola Road, Kuliyapitiya, Sri Lanka", district: "Kurunegala", town: "Kuliyapitiya", location: { lat: 7.472043, lng: 80.044601 }, isActive: true },
      ];
      await Hospital.bulkWrite(defaults.map(h => ({ updateOne: { filter: { name: h.name }, update: { $set: h }, upsert: true } })));
      rows = await Hospital.find({ isActive: true }).sort({ name: 1 });
    }

    res.json({
      success: true,
      hospitals: rows.map(h => ({ ...h.toObject(), distanceKm: null, durationMinutes: null, distanceSource: "not_calculated" })),
      searchSource: "local_database",
    });
  } catch (e) { next(e); }
}
async function geocode(req, res, next) {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) return res.status(400).json({ success: false, message: "Address is required" });
    res.json({ success: true, location: await geocodeAddress(`${query}, Sri Lanka`) });
  } catch (e) { next(e); }
}

async function routeTest(req, res, next) {
  try {
    const origin = { lat: Number(req.query.originLat), lng: Number(req.query.originLng) };
    const destination = { lat: Number(req.query.destinationLat), lng: Number(req.query.destinationLng) };
    if (![origin.lat, origin.lng, destination.lat, destination.lng].every(Number.isFinite)) {
      return res.status(400).json({ success: false, message: "originLat, originLng, destinationLat and destinationLng are required numeric values." });
    }

    const result = await checkGoogleRoutes(origin, destination);
    return res.status(result.ok ? 200 : (result.status || 502)).json({ success: result.ok, ...result });
  } catch (e) { next(e); }
}

async function createHospital(req, res, next) {
  try { const row = await Hospital.create(req.body); res.status(201).json({ success: true, hospital: row }); } catch (e) { next(e); }
}

module.exports = { calculateQuote, createBooking, listClientBookings, listCaretakerBookings, getBookingById, updateBookingStatus, generateOtp, verifyOtp, updateProgress, clientComplete, hospitals, routeTest, createHospital, geocode };
