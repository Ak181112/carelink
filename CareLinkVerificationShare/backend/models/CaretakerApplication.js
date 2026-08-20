const mongoose = require("mongoose");

const caretakerApplicationSchema = new mongoose.Schema(
  {
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaretakerProfile",
      index: true,
    },

    //documents
    documents: {
      nicDocument: {
        type: String,
        required: true,
      },
      drivingLicense: {
        type: String,
        default: null,
      },
      certificates: {
        type: [String],
        default: [],
      },
      photo: {
        type: String,
        default: null,
      },
    },

    //OCR data
    nicAddressExtracted: {
      type: String,
      default: null,
    },

    nicAddress: {
      type: String,
      default: null,
    },

    // OCR raw text
    ocrText: {
      type: String,
      default: null,
    },

    // NIC Number
    nicNumber: {
      type: String,
      default: null,
    },

    profileAddress: {
      type: String,
      default: null,
    },

    addressMatched: {
      type: Boolean,
      default: false,
    },

    // how much of the profile address was found in the OCR text (0-100)
    addressMatchPercentage: {
      type: Number,
      default: 0,
    },

    ocrStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    // verification status (indexed via schema.index below)
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "manual_review"],
      default: "pending",
    },

    // application status (indexed via schema.index below)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

   // admin review
    adminNote: {
      type: String,
      default: "",
    },

    // set when an admin approves despite a failed OCR address match
    manualOverride: {
      type: Boolean,
      default: false,
    },

    overrideReason: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // timestamps
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// indexes
caretakerApplicationSchema.index({ status: 1, createdAt: -1 });
caretakerApplicationSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model(
  "CaretakerApplication",
  caretakerApplicationSchema,
);
