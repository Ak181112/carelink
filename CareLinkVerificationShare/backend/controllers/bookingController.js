const crypto = require("crypto");
const Booking = require("../models/Booking");
const CaretakerProfile = require("../models/CaretakerProfile");
const ParentProfile = require("../models/ParentProfile");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { getSettings } = require("../models/Settings");
const { quoteBooking } = require("../utils/pricing");

// The caretaker must never see this over the API: reading it off the client at
// pickup is what proves they actually arrived.
const CARETAKER_HIDDEN_FIELDS = "-pickupOtp";

const notify = (userId, title, message, type = "booking") =>
  Notification.create({ userId, title, message, type });

const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

const populateBooking = (query) =>
  query
    .populate("parentId", "name email phone")
    .populate("caretakerId", "name email phone")
    .populate("parentProfileId", "fullName age gender contactNumber medicalConditions");

// True when the logged-in user is the client or the caretaker on this booking
const isParticipant = (booking, user) => {
  const parentId = booking.parentId?._id ?? booking.parentId;
  const caretakerId = booking.caretakerId?._id ?? booking.caretakerId;

  return (
    String(parentId) === String(user.id) || String(caretakerId) === String(user.id)
  );
};

/* ========================= CLIENT ========================= */

// POST /api/bookings  (family_member)
const createBooking = async (req, res, next) => {
  try {
    const {
      caretakerId,
      parentProfileId,
      bookingDate,
      bookingTime,
      estimatedHours,
      pickupLocation,
      hospitalLocation,
      paymentMethod,
      notes,
    } = req.body;

    // the parent profile must belong to the person booking
    const parentProfile = await ParentProfile.findOne({
      _id: parentProfileId,
      userId: req.user.id,
    });

    if (!parentProfile) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const caretakerProfile = await CaretakerProfile.findOne({ userId: caretakerId });

    if (!caretakerProfile || caretakerProfile.applicationStatus !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found or not approved",
      });
    }

    if (!caretakerProfile.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This caretaker is currently unavailable",
      });
    }

    const settings = await getSettings();

    // a booking must be for a future slot, with enough notice for the caretaker
    const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`);

    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date or time",
      });
    }

    const noticeMs = settings.minNoticeHours * 60 * 60 * 1000;

    if (scheduledAt.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Booking date and time must be in the future",
      });
    }

    if (scheduledAt.getTime() - Date.now() < noticeMs) {
      return res.status(400).json({
        success: false,
        message: `Bookings need at least ${settings.minNoticeHours} hour(s) notice`,
      });
    }

    if (Number(estimatedHours) > settings.maxBookingHours) {
      return res.status(400).json({
        success: false,
        message: `A single visit cannot exceed ${settings.maxBookingHours} hours`,
      });
    }

    // don't let one caretaker be double-booked on the same day and time
    const clash = await Booking.findOne({
      caretakerId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      status: { $in: ["pending", "accepted", "in_progress"] },
    });

    if (clash) {
      return res.status(409).json({
        success: false,
        message: "This caretaker already has a booking at that time",
      });
    }

    const hours = Number(estimatedHours);
    const quote = quoteBooking({
      estimatedHours: hours,
      pickupLocation,
      hospitalLocation,
      rates: settings,
    });

    const booking = await Booking.create({
      parentId: req.user.id,
      parentProfileId,
      caretakerId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      estimatedHours: hours,
      pickupLocation,
      hospitalLocation,
      ...quote,
      paymentMethod: paymentMethod === "card" ? "card" : "cash",
      notes: notes || "",
      status: "pending",
      statusHistory: [{ status: "pending", changedAt: new Date() }],
    });

    await notify(
      caretakerId,
      "New Booking Request",
      `${req.user.name} requested a hospital visit for ${parentProfile.fullName} on ${bookingDate} at ${bookingTime}.`
    );

    await notify(
      req.user.id,
      "Booking Requested",
      `Your booking request has been sent. Total: LKR ${quote.totalCost}.`
    );

    res.status(201).json({
      success: true,
      booking: await populateBooking(Booking.findById(booking._id)),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/my  (family_member)
const getMyBookings = async (req, res, next) => {
  try {
    const filter = { parentId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const bookings = await populateBooking(
      Booking.find(filter).sort({ createdAt: -1 })
    );

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/cancel  (family_member)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      parentId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!["pending", "accepted"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `A booking that is ${booking.status} can no longer be cancelled`,
      });
    }

    booking.cancelledReason = (req.body.reason || "").trim();
    booking.setStatus("cancelled", booking.cancelledReason);
    await booking.save();

    await notify(
      booking.caretakerId,
      "Booking Cancelled",
      `A booking scheduled for ${booking.bookingTime} was cancelled by the client.`
    );

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/* ========================= CARETAKER ========================= */

// GET /api/bookings/assigned  (caretaker)
const getAssignedBookings = async (req, res, next) => {
  try {
    const filter = { caretakerId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const bookings = await populateBooking(
      Booking.find(filter).select(CARETAKER_HIDDEN_FIELDS).sort({ createdAt: -1 })
    );

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/accept  (caretaker)
const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      caretakerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This booking is already ${booking.status}`,
      });
    }

    booking.pickupOtp = generateOtp();
    booking.setStatus("accepted");
    await booking.save();

    await notify(
      booking.parentId,
      "Booking Accepted",
      `${req.user.name} accepted your booking. Share the pickup OTP ${booking.pickupOtp} with them on arrival.`
    );

    // the OTP belongs to the client, so strip it from the caretaker's copy
    const safe = booking.toObject();
    delete safe.pickupOtp;

    res.json({ success: true, booking: safe });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/reject  (caretaker)
const rejectBooking = async (req, res, next) => {
  try {
    const reason = (req.body.reason || "").trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "A reason is required when rejecting a booking",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      caretakerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This booking is already ${booking.status}`,
      });
    }

    booking.rejectedReason = reason;
    booking.setStatus("rejected", reason);
    await booking.save();

    await notify(
      booking.parentId,
      "Booking Declined",
      `${req.user.name} declined your booking. Reason: ${reason}`
    );

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/start  (caretaker, needs the OTP from the client)
const startBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      caretakerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: `Only an accepted booking can be started (this one is ${booking.status})`,
      });
    }

    const otp = String(req.body.otp || "").trim();

    if (!booking.pickupOtp || otp !== booking.pickupOtp) {
      return res.status(400).json({
        success: false,
        message: "Incorrect pickup OTP. Please ask the client to read it again.",
      });
    }

    booking.otpVerified = true;
    booking.startedAt = new Date();
    booking.setStatus("in_progress");
    await booking.save();

    await notify(
      booking.parentId,
      "Hospital Visit Started",
      `${req.user.name} has picked up your parent and the visit is now under way.`
    );

    const safe = booking.toObject();
    delete safe.pickupOtp;

    res.json({ success: true, booking: safe });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/complete  (caretaker)
const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      caretakerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: `Only a booking in progress can be completed (this one is ${booking.status})`,
      });
    }

    const completedAt = new Date();

    booking.completedAt = completedAt;
    booking.durationMinutes = booking.startedAt
      ? Math.max(1, Math.round((completedAt - booking.startedAt) / 60000))
      : 0;
    booking.setStatus("completed");
    await booking.save();

    await notify(
      booking.parentId,
      "Hospital Visit Completed",
      `The visit is complete. Please rate ${req.user.name} and settle the payment of LKR ${booking.totalCost}.`
    );

    const safe = booking.toObject();
    delete safe.pickupOtp;

    res.json({ success: true, booking: safe });
  } catch (error) {
    next(error);
  }
};

/* ========================= SHARED ========================= */

// GET /api/bookings/:id  (either participant, or an admin)
const getBookingById = async (req, res, next) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isParticipant(booking, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = booking.toObject();

    // only the client is allowed to read the pickup OTP
    if (String(booking.parentId?._id ?? booking.parentId) !== String(req.user.id)) {
      delete result.pickupOtp;
    }

    res.json({ success: true, booking: result });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/emergency  (either participant, while the trip runs)
const triggerEmergency = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!isParticipant(booking, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!["accepted", "in_progress"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "An emergency can only be raised on an active booking",
      });
    }

    const message = (req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please describe the emergency",
      });
    }

    booking.emergencyTriggered = true;
    booking.emergencyMessage = message;
    booking.statusHistory.push({
      status: booking.status,
      changedAt: new Date(),
      note: `EMERGENCY: ${message}`,
    });
    await booking.save();

    // tell the other participant and every admin
    const otherParty =
      String(booking.parentId) === String(req.user.id)
        ? booking.caretakerId
        : booking.parentId;

    await notify(otherParty, "Emergency Reported", message, "emergency");

    const admins = await User.find({ role: "admin" }).select("_id");

    for (const admin of admins) {
      await notify(
        admin._id,
        "Emergency On A Booking",
        `${req.user.name} raised an emergency: ${message}`,
        "emergency"
      );
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/* ========================= ADMIN ========================= */

// GET /api/bookings  (admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [{ notes: { $regex: search, $options: "i" } }];

    const bookings = await populateBooking(
      Booking.find(filter).select(CARETAKER_HIDDEN_FIELDS).sort({ createdAt: -1 })
    );

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/payment  (admin)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    if (!["pending", "paid", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be pending, paid or refunded",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    await notify(
      booking.parentId,
      "Payment Updated",
      `The payment for your booking is now marked as ${paymentStatus}.`
    );

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAssignedBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  getBookingById,
  triggerEmergency,
  getAllBookings,
  updatePaymentStatus,
};
