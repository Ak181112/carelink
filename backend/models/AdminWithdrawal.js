const mongoose = require("mongoose");

const adminWithdrawalSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "LKR",
    },

    requestedAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    requestedCurrency: {
      type: String,
      uppercase: true,
      default: "LKR",
    },

    payoutAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    payoutCurrency: {
      type: String,
      uppercase: true,
      default: "USD",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    destinationType: {
      type: String,
      enum: ["platform_default", "bank_account", "card", "manual"],
      default: "platform_default",
    },

    destination: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "requested",
        "processing",
        "pending",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "requested",
      index: true,
    },

    stripePayoutId: {
      type: String,
      default: null,
      index: true,
    },

    stripeBalanceTransactionId: {
      type: String,
      default: null,
    },

    failureCode: {
      type: String,
      default: "",
    },

    failureReason: {
      type: String,
      default: "",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

adminWithdrawalSchema.index({
  status: 1,
  createdAt: -1,
});

adminWithdrawalSchema.index({
  requestedBy: 1,
  createdAt: -1,
});

module.exports = mongoose.model("AdminWithdrawal", adminWithdrawalSchema);
