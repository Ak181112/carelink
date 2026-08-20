const mongoose = require("mongoose");

// One row per payment attempt against a booking. Kept separate from the booking
// so a cancelled or refunded attempt still leaves an auditable trail.

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    // the family member who owes the money
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * The reference PayHere echoes back on its notify callback, which is how a
     * callback is matched to a booking. Unique so a replayed notify cannot
     * create a second record.
     */
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "LKR",
    },

    provider: {
      type: String,
      enum: ["payhere", "cash"],
      default: "payhere",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded", "chargedback"],
      default: "pending",
      index: true,
    },

    // ---- values returned by PayHere ----
    payherePaymentId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },

    // raw status_code from the notify callback, kept for support queries
    payhereStatusCode: {
      type: String,
      default: null,
    },

    // card network or wallet used, e.g. VISA / MASTER / EZCASH
    paymentMethod: {
      type: String,
      default: null,
    },

    cardHolderName: {
      type: String,
      default: null,
    },

    // PayHere only ever sends a masked number, e.g. ************1234
    cardMaskedNumber: {
      type: String,
      default: null,
    },

    statusMessage: {
      type: String,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
