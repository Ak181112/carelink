const mongoose = require("mongoose");

/* ============================================================
   PROGRESS STAGE SCHEMA
============================================================ */

const progressStageSchema =
  new mongoose.Schema(
    {
      key: {
        type: String,
        required: true,
      },

      label: {
        type: String,
        required: true,
      },

      status: {
        type: String,

        enum: [
          "not_started",
          "in_progress",
          "completed",
        ],

        default: "not_started",
      },

      updatedAt: {
        type: Date,
        default: null,
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    {
      _id: false,
    }
  );

/* ============================================================
   BOOKING SCHEMA
============================================================ */

const bookingSchema =
  new mongoose.Schema(
    {
      /* ========================================================
         USERS
      ======================================================== */

      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      caretakerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParentProfile",
        required: true,
        index: true,
      },

      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
        index: true,
      },

      /* ========================================================
         SCHEDULE
      ======================================================== */

      scheduledDate: {
        type: Date,
        required: true,
        index: true,
      },

      startTime: {
        type: String,
        required: true,
      },

      serviceNotes: {
        type: String,
        default: "",
      },

      /* ========================================================
         PICKUP LOCATION
      ======================================================== */

      pickupLocation: {
        address: {
          type: String,
          required: true,
        },

        town: {
          type: String,
          default: "Kurunegala",
        },

        lat: {
          type: Number,
          required: true,
        },

        lng: {
          type: Number,
          required: true,
        },

        placeId: {
          type: String,
          default: null,
        },
      },

      /* ========================================================
         HOSPITAL SNAPSHOT
      ======================================================== */

      hospitalSnapshot: {
        name: String,
        address: String,
        lat: Number,
        lng: Number,
      },

      /* ========================================================
         DISTANCE / ROUTE
      ======================================================== */

      distanceKm: {
        type: Number,
        default: 0,
      },

      durationMinutes: {
        type: Number,
        default: 0,
      },

      /* ========================================================
         PRICING
      ======================================================== */

      pricing: {
        ratePerKm: {
          type: Number,
          default: 0,
        },

        caretakerServiceCharge: {
          type: Number,
          default: 0,
        },

        adminFeePercent: {
          type: Number,
          default: 15,
        },

        adminFeeAmount: {
          type: Number,
          default: 0,
        },

        distanceCharge: {
          type: Number,
          default: 0,
        },

        total: {
          type: Number,
          default: 0,
        },

        currency: {
          type: String,
          default: "LKR",
        },
      },

      /* ========================================================
         BOOKING STATUS
      ======================================================== */

      status: {
        type: String,

        enum: [
          "requested",
          "accepted",
          "rejected",
          "cancelled",
          "in_progress",
          "payment_pending",
          "paid",
          "closed",
        ],

        default: "requested",

        index: true,
      },

      /* ========================================================
         OTP
      ======================================================== */

      otp: {
        codeHash: {
          type: String,
          default: null,
        },

        expiresAt: {
          type: Date,
          default: null,
        },

        verifiedAt: {
          type: Date,
          default: null,
        },
      },

      /* ========================================================
         TASK PROGRESS
      ======================================================== */

      progress: {
        currentStage: {
          type: String,
          default: "task_started",
        },

        stages: {
          type: [progressStageSchema],

          default: () => [
            {
              key: "task_started",
              label: "Task Started",
              status: "not_started",
            },

            {
              key: "at_hospital",
              label: "At Hospital",
              status: "not_started",
            },

            {
              key:
                "consultation_completed",
              label:
                "Consultation Completed",
              status: "not_started",
            },

            {
              key: "back_to_home",
              label: "Back to Home",
              status: "not_started",
            },

            {
              key: "task_completed",
              label:
                "Task Completed",
              status: "not_started",
            },
          ],
        },
      },

      /* ========================================================
         COMPLETION
      ======================================================== */

      caretakerCompletedAt: {
        type: Date,
        default: null,
      },

      clientCompletedAt: {
        type: Date,
        default: null,
      },

      /* ========================================================
         PAYMENT REFERENCE
      ======================================================== */

      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
      },

      /* ========================================================
         CANCELLATION
      ======================================================== */

      cancellationReason: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

/* ============================================================
   EXISTING INDEXES
============================================================ */

bookingSchema.index({
  caretakerId: 1,
  scheduledDate: 1,
  startTime: 1,
  status: 1,
});

bookingSchema.index({
  clientId: 1,
  createdAt: -1,
});

/* ============================================================
   ENTERPRISE ANALYTICS INDEX
============================================================ */

/*
 * Supports dashboard queries that identify
 * completed/closed bookings.
 */
bookingSchema.index({
  status: 1,
  createdAt: -1,
});

/*
 * Supports analytics and reporting by caretaker
 * and booking status.
 */
bookingSchema.index({
  caretakerId: 1,
  status: 1,
  createdAt: -1,
});

/* ============================================================
   EXPORT
============================================================ */

module.exports =
  mongoose.model(
    "Booking",
    bookingSchema
  );