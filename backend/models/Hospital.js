const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  district: { type: String, default: "Kurunegala", index: true },
  town: { type: String, default: "Kurunegala", index: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    placeId: { type: String, default: null },
  },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);
