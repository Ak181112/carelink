const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "application_submitted",
        "application_approved",
        "application_rejected",
        "profile_updated",
        "booking_requested",
        "booking_accepted",
        "booking_rejected",
        "booking_cancelled",
        "job_otp",
        "job_started",
        "care_progress",
        "payment_pending",
        "payment_success",
        "general",
      ],
      default: "general",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);