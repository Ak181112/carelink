const mongoose = require("mongoose");

/* ============================================================
   PAYMENT SCHEMA
============================================================ */

const paymentSchema =
  new mongoose.Schema(
    {
      /* ========================================================
         BOOKING
      ======================================================== */

      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true,
        index: true,
      },

      /* ========================================================
         CLIENT
      ======================================================== */

      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /* ========================================================
         CARETAKER
      ======================================================== */

      caretakerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /* ========================================================
         PAYMENT AMOUNT
      ======================================================== */

      /*
       * This is the complete customer payment amount
       * for the booking.
       *
       * It may include:
       * - caretaker service charge
       * - distance charge
       * - admin service fee
       * - other booking charges
       */
      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        default: "LKR",
      },

      /* ========================================================
         PAYMENT METHOD
      ======================================================== */

      method: {
        type: String,

        enum: [
          "card",
          "cash",
        ],

        default: "card",
      },

      /* ========================================================
         PAYMENT STATUS
      ======================================================== */

      status: {
        type: String,

        enum: [
          "pending",
          "processing",
          "paid",
          "failed",
          "refunded",
        ],

        default: "pending",

        index: true,
      },

      /* ========================================================
         STRIPE
      ======================================================== */

      stripeCheckoutSessionId: {
        type: String,
        default: null,
      },

      stripePaymentIntentId: {
        type: String,
        default: null,
      },

      stripeTransferId: {
        type: String,
        default: null,
      },

      /* ========================================================
         RECEIPT
      ======================================================== */

      receiptNumber: {
        type: String,
        unique: true,
        sparse: true,
      },

      /* ========================================================
         PAYMENT TIMESTAMP
      ======================================================== */

      paidAt: {
        type: Date,
        default: null,
      },

      /* ========================================================
         FAILURE
      ======================================================== */

      failureReason: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

/* ============================================================
   EXISTING / CORE INDEXES
============================================================ */

paymentSchema.index({
  bookingId: 1,
});

paymentSchema.index({
  clientId: 1,
});

paymentSchema.index({
  caretakerId: 1,
});

paymentSchema.index({
  status: 1,
});

/* ============================================================
   ENTERPRISE FINANCIAL ANALYTICS INDEXES
============================================================ */

/*
 * Supports:
 * paid payments by payment date.
 */
paymentSchema.index({
  status: 1,
  paidAt: 1,
});

/*
 * Supports:
 * caretaker monthly revenue analysis.
 */
paymentSchema.index({
  caretakerId: 1,
  status: 1,
  paidAt: 1,
});

/*
 * Supports:
 * client payment history.
 */
paymentSchema.index({
  clientId: 1,
  status: 1,
  createdAt: -1,
});

/* ============================================================
   EXPORT
============================================================ */

module.exports =
  mongoose.model(
    "Payment",
    paymentSchema
  );