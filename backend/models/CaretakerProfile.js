const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  clientName: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const caretakerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  contactNumber: {
    type: String,
    required: [true, "Contact number is required"],
  },
  nicNumber: {
    type: String,
    required: [true, "NIC number is required"],
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
    required: [true, "Town is required"],
  },
  experience: {
    type: String,
    required: [true, "Experience is required"],
  },
  qualifications: {
    type: String,
  },
  skills: [{
    type: String,
  }],
  photo: {
    type: String,
  },
  nicDocument: {
    type: String,
  },
  drivingLicense: {
    type: String,
  },
  certificates: [{
    type: String,
  }],
  applicationStatus: {
    type: String,
    enum: ["not_applied", "pending", "approved", "rejected"],
    default: "not_applied",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
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

caretakerProfileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = (total / this.reviews.length).toFixed(1);
  }
  next();
});

module.exports = mongoose.model("CaretakerProfile", caretakerProfileSchema);
