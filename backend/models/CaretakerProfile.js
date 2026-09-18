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

const caretakerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    nicNumber: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      default: "Kurunegala",
    },

    town: {
      type: String,
      required: true,
    },

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    experience: {
      type: String,
      required: true,
    },

    qualifications: String,

    skills: {
      type: [String],
      default: [],
    },

    photo: String,
    nicDocument: String,
    drivingLicense: String,
    certificates: {
      type: [String],
      default: [],
    },

    // application status 
    applicationStatus: {
      type: String,
      enum: ["not_applied", "pending", "approved", "rejected"],
      default: "not_applied",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // OCR status
    lastOcrAddress: {
      type: String,
      default: null,
    },

    lastAddressMatched: {
      type: Boolean,
      default: false,
    },

    // reviews
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
  },
  {
    timestamps: false,
  }
);

// Update timestamps + rating
caretakerProfileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = Number((total / this.reviews.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }

  next();
});

module.exports = mongoose.model(
  "CaretakerProfile",
  caretakerProfileSchema
);