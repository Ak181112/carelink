const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  caretakerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "", trim: true },
  wouldRecommend: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
