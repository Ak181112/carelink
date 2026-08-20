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
    match: [/^07\d{8}$/, "Contact number must be a valid 10-digit Sri Lankan number starting with 07"],
  },
  emergencyContact: {
    name: String,
    phone: {
      type: String,
      match: [/^07\d{8}$/, "Emergency contact phone must be a valid 10-digit Sri Lankan number starting with 07"],
    },
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
