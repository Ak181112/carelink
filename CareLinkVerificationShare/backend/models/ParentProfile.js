const mongoose = require("mongoose");

const parentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  district: {
    type: String,
    default: "Kurunegala",
  },
  town: {
    type: String,
  },
  contactNumber: {
    type: String,
    required: [true, "Contact number is required"],
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  medicalConditions: {
    type: String,
  },
  specialRequirements: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

parentProfileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("ParentProfile", parentProfileSchema);
