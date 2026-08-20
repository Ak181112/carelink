const mongoose = require("mongoose");

/**
 * Platform-wide settings, stored as a single document.
 *
 * Rates used to be hard-coded in utils/pricing.js, which meant a price change
 * needed a redeploy. They live here so an admin can adjust them, and
 * `getSettings()` falls back to the same defaults when the document is missing.
 */

const DEFAULTS = {
  hourlyRate: 750,
  adminServiceFee: 500,
  ratePerKm: 120,
  maxBookingHours: 12,
  minNoticeHours: 1,
  registrationOpen: true,
  autoApproveMatchedApplications: false,
};

const settingsSchema = new mongoose.Schema(
  {
    // fixed key so there can only ever be one settings document
    key: {
      type: String,
      default: "platform",
      unique: true,
      immutable: true,
    },

    // ---- pricing (LKR) ----
    hourlyRate: {
      type: Number,
      default: DEFAULTS.hourlyRate,
      min: [0, "Hourly rate cannot be negative"],
    },

    adminServiceFee: {
      type: Number,
      default: DEFAULTS.adminServiceFee,
      min: [0, "Service fee cannot be negative"],
    },

    ratePerKm: {
      type: Number,
      default: DEFAULTS.ratePerKm,
      min: [0, "Rate per km cannot be negative"],
    },

    // ---- booking rules ----
    maxBookingHours: {
      type: Number,
      default: DEFAULTS.maxBookingHours,
      min: 1,
      max: 24,
    },

    // how far ahead a booking must be made
    minNoticeHours: {
      type: Number,
      default: DEFAULTS.minNoticeHours,
      min: 0,
      max: 168,
    },

    // ---- feature switches ----
    registrationOpen: {
      type: Boolean,
      default: DEFAULTS.registrationOpen,
    },

    // approve caretakers automatically when OCR matches their NIC address
    autoApproveMatchedApplications: {
      type: Boolean,
      default: DEFAULTS.autoApproveMatchedApplications,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);

/**
 * Always returns usable settings: the stored document if there is one,
 * otherwise the defaults. Never throws, so a settings outage cannot stop
 * bookings from being priced.
 */
const getSettings = async () => {
  try {
    const stored = await Settings.findOne({ key: "platform" }).lean();
    return { ...DEFAULTS, ...(stored || {}) };
  } catch {
    return { ...DEFAULTS };
  }
};

module.exports = Settings;
module.exports.DEFAULTS = DEFAULTS;
module.exports.getSettings = getSettings;
