const mongoose = require("mongoose");

// A booking is one hospital-visit trip: the caretaker collects the parent from
// the pickup address, accompanies them to the hospital, and stays for the visit.

const BOOKING_STATUSES = [
  "pending", // waiting for the caretaker to respond
  "accepted", // caretaker agreed, trip not started
  "rejected", // caretaker declined
  "cancelled", // client called it off
  "in_progress", // caretaker verified the pickup OTP and the trip is running
  "completed", // trip finished
];

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const hospitalLocationSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    // the family member who made the booking and pays for it
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // the elderly person being accompanied
    parentProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentProfile",
      required: true,
    },

    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ---- schedule ----
    bookingDate: {
      type: Date,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Booking time must be in HH:MM format"],
    },

    estimatedHours: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    // ---- route ----
    pickupLocation: {
      type: locationSchema,
      required: true,
    },

    hospitalLocation: {
      type: hospitalLocationSchema,
      required: true,
    },

    roadDistanceKm: {
      type: Number,
      default: 0,
    },

    // ---- money (all values are computed server-side) ----
    ratePerKm: {
      type: Number,
      default: 0,
    },

    caretakerCharge: {
      type: Number,
      default: 0,
    },

    adminServiceFee: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    // ---- lifecycle ----
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending",
    },

    rejectedReason: {
      type: String,
      default: "",
    },

    cancelledReason: {
      type: String,
      default: "",
    },

    // Shown to the client only; the caretaker must read it from them at pickup,
    // which is what proves the caretaker actually turned up.
    pickupOtp: {
      type: String,
      default: null,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 0,
    },

    // ---- payment ----
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    // ---- extras ----
    feedbackSubmitted: {
      type: Boolean,
      default: false,
    },

    emergencyTriggered: {
      type: Boolean,
      default: false,
    },

    emergencyMessage: {
      type: String,
      default: "",
    },

    // set when an admin closes the emergency off
    emergencyResolvedAt: {
      type: Date,
      default: null,
    },

    emergencyResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    emergencyResolutionNote: {
      type: String,
      default: "",
    },

    clientNotified: {
      type: Boolean,
      default: false,
    },

    caretakerNotified: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ caretakerId: 1, status: 1 });
bookingSchema.index({ parentId: 1, createdAt: -1 });

// Records every transition so admins can audit what happened to a booking
bookingSchema.methods.setStatus = function (status, note = "") {
  this.status = status;
  this.statusHistory.push({ status, changedAt: new Date(), note });
};

module.exports = mongoose.model("Booking", bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
