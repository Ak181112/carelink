const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      default: "Emergency assistance requested",
      trim: true,
    },

    priority: {
      type: String,
      enum: [
        "critical",
        "high",
        "normal",
      ],
      default: "critical",
      index: true,
    },

    contactName: {
      type: String,
      default: "",
      trim: true,
    },

    contactPhone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      address: {
        type: String,
        default: "",
        trim: true,
      },

      lat: {
        type: Number,
        default: null,
      },

      lng: {
        type: Number,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "active",
        "resolved",
      ],
      default: "active",
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emergencySchema.index({
  status: 1,
  priority: 1,
  createdAt: -1,
});

emergencySchema.index({
  triggeredBy: 1,
  createdAt: -1,
});

emergencySchema.index({
  bookingId: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "EmergencyAlert",
  emergencySchema
);