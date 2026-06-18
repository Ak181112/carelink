const mongoose = require("mongoose");

const caretakerApplicationSchema = new mongoose.Schema({
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CaretakerProfile",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  documents: {
    nicDocument: String,
    drivingLicense: String,
    certificates: [String],
    photo: String,
  },
  adminNote: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("CaretakerApplication", caretakerApplicationSchema);
