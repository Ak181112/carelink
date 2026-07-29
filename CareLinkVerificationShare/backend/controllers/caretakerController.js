const path = require("path");
const CaretakerProfile = require("../models/CaretakerProfile");
const CaretakerApplication = require("../models/CaretakerApplication");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { extractNICAddress } = require("../services/ocrService");

//normalize address words for OCR match
const normalizeAddressWords = (text = "") => {
  const noiseWords = [
    "ag",
    "atl",
    "at",
    "o",
    "bo",
    "sdd",
    "card",
    "national",
    "identity",
    "address",
  ];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .filter((word) => !noiseWords.includes(word));
};

const ADDRESS_MATCH_THRESHOLD = 0.7;

// Returns how much of the profile address was found in the OCR text, so the
// admin can see *how close* a failed match was instead of a bare true/false.
const compareAddresses = (ocrAddress = "", profileAddress = "") => {
  const ocrWords = normalizeAddressWords(ocrAddress);
  const profileWords = normalizeAddressWords(profileAddress);

  if (profileWords.length === 0 || ocrWords.length === 0) {
    return { matched: false, percentage: 0 };
  }

  const matchedWords = profileWords.filter((word) => ocrWords.includes(word));
  const ratio = matchedWords.length / profileWords.length;

  return {
    matched: ratio >= ADDRESS_MATCH_THRESHOLD,
    percentage: Math.round(ratio * 100),
  };
};

// get the profile of me
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOne({
      userId: req.user.id,
    });

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// update availability only (does not touch other profile fields)
const updateAvailability = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { isAvailable: req.body.isAvailable === true || req.body.isAvailable === "true" },
      { new: true },
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Please complete your profile before setting availability",
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// create or update the profile
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      contactNumber,
      nicNumber,
      address,
      district,
      town,
      experience,
      qualifications,
      skills,
    } = req.body;

    let photoPath;
    if (req.file) {
      photoPath = `/uploads/profiles/${req.file.filename}`;
    }

    const profileData = {
      userId: req.user.id,
      fullName,
      contactNumber,
      nicNumber,
      address,
      district: district || "Kurunegala",
      town,
      experience,
      qualifications,
      skills: skills
        ? Array.isArray(skills)
          ? skills
          : skills.split(",").map((s) => s.trim())
        : [],
      ...(photoPath && { photo: photoPath }),
      // findOneAndUpdate skips the pre("save") hook that normally bumps this
      updatedAt: Date.now(),
    };

    let profile = await CaretakerProfile.findOne({ userId: req.user.id });

    if (profile) {
      profile = await CaretakerProfile.findOneAndUpdate(
        { userId: req.user.id },
        profileData,
        { new: true, runValidators: true },
      );
    } else {
      profile = await CaretakerProfile.create(profileData);
    }

    await Notification.create({
      userId: req.user.id,
      title: "Profile Updated",
      message: "Your caretaker profile has been updated successfully.",
      type: "profile_updated",
    });

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// submit the application (OCR + normalizing)
const submitApplication = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile before applying",
      });
    }

    const existingApp = await CaretakerApplication.findOne({
      caretakerId: req.user.id,
      status: "pending",
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application",
      });
    }

    const documents = {};
    let nicImagePath = null;

    if (req.files?.nicDocument) {
      nicImagePath = req.files.nicDocument[0].path;
      documents.nicDocument = `/uploads/documents/${req.files.nicDocument[0].filename}`;
    }

    if (req.files?.drivingLicense) {
      documents.drivingLicense = `/uploads/documents/${req.files.drivingLicense[0].filename}`;
    }

    if (req.files?.certificates) {
      documents.certificates = req.files.certificates.map(
        (file) => `/uploads/documents/${file.filename}`,
      );
    }

    if (!documents.nicDocument) {
      return res.status(400).json({
        success: false,
        message: "NIC document is required",
      });
    }

    let ocrText = "";
    let nicAddress = "";
    let addressMatched = false;
    let addressMatchPercentage = 0;
    let ocrStatus = "pending";
    let verificationStatus = "manual_review";

    if (nicImagePath) {
      try {
        const ocrResult = await extractNICAddress(nicImagePath);

        ocrText = ocrResult.rawText || "";
        nicAddress = ocrResult.address || ocrResult.rawText || "";

        const profileAddress = profile.address || "";
        const comparison = compareAddresses(nicAddress, profileAddress);

        addressMatched = comparison.matched;
        addressMatchPercentage = comparison.percentage;

        ocrStatus = ocrResult.success && nicAddress ? "success" : "failed";
        verificationStatus = addressMatched ? "verified" : "manual_review";
      } catch (err) {
        console.error("OCR error:", err.message);
        ocrStatus = "failed";
      }
    }

    const application = await CaretakerApplication.create({
      caretakerId: req.user.id,
      profileId: profile._id,

      documents,

      nicNumber: profile.nicNumber,
      profileAddress: profile.address,

      nicAddress,
      nicAddressExtracted: nicAddress,
      ocrText,

      addressMatched,
      addressMatchPercentage,
      ocrStatus,
      verificationStatus,

      status: "pending",
      submittedAt: new Date(),
    });

    profile.applicationStatus = "pending";
    profile.lastOcrAddress = nicAddress || null;
    profile.lastAddressMatched = addressMatched;
    await profile.save();

    await Notification.create({
      userId: req.user.id,
      title: "Application Submitted",
      message: "Your caretaker application has been submitted successfully.",
      type: "application_submitted",
    });

    const adminUsers = await User.find({ role: "admin" });

    for (const admin of adminUsers) {
      await Notification.create({
        userId: admin._id,
        title: "New Caretaker Application",
        message: `${req.user.name} has submitted a new caretaker application.`,
        type: "application_submitted",
      });
    }

    res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// get application status
const getApplicationStatus = async (req, res, next) => {
  try {
    const application = await CaretakerApplication.findOne({
      caretakerId: req.user.id,
    }).sort({ createdAt: -1 });

    const profile = await CaretakerProfile.findOne({
      userId: req.user.id,
    });

    res.json({
      success: true,
      application,
      applicationStatus: profile?.applicationStatus || "not_applied",
    });
  } catch (error) {
    next(error);
  }
};

// get approved caretakers
const getAllApprovedCaretakers = async (req, res, next) => {
  try {
    const { town, experience } = req.query;

    const filter = {
      applicationStatus: "approved",
      district: "Kurunegala",
    };

    if (town) filter.town = { $regex: town, $options: "i" };
    if (experience) filter.experience = { $regex: experience, $options: "i" };

    const caretakers = await CaretakerProfile.find(filter)
      .populate("userId", "name email")
      .select("-nicDocument -drivingLicense -certificates");

    res.json({ success: true, caretakers });
  } catch (error) {
    next(error);
  }
};

// get caretaker by ID
const getCaretakerById = async (req, res, next) => {
  try {
    const caretaker = await CaretakerProfile.findById(req.params.id)
      .populate("userId", "name email")
      .select("-nicDocument -drivingLicense -certificates");

    if (!caretaker || caretaker.applicationStatus !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found",
      });
    }

    res.json({ success: true, caretaker });
  } catch (error) {
    next(error);
  }
};

//upload documents
const uploadDocuments = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (req.files?.nicDocument) {
      profile.nicDocument = `/uploads/documents/${req.files.nicDocument[0].filename}`;
    }

    if (req.files?.drivingLicense) {
      profile.drivingLicense = `/uploads/documents/${req.files.drivingLicense[0].filename}`;
    }

    if (req.files?.certificates) {
      const certs = req.files.certificates.map(
        (f) => `/uploads/documents/${f.filename}`,
      );

      profile.certificates = [...(profile.certificates || []), ...certs];
    }

    await profile.save();

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// add or update a review for an approved caretaker (family members only)
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    const caretaker = await CaretakerProfile.findById(req.params.id);

    if (!caretaker || caretaker.applicationStatus !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found",
      });
    }

    if (String(caretaker.userId) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot review your own profile",
      });
    }

    // One review per client: a second submission edits the first one
    const existingReview = caretaker.reviews.find(
      (review) => String(review.clientId) === String(req.user.id),
    );

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = (comment || "").trim();
      existingReview.clientName = req.user.name;
      existingReview.createdAt = new Date();
    } else {
      caretaker.reviews.push({
        clientId: req.user.id,
        clientName: req.user.name,
        rating: numericRating,
        comment: (comment || "").trim(),
      });
    }

    // averageRating is recalculated by the pre("save") hook
    await caretaker.save();

    await Notification.create({
      userId: caretaker.userId,
      title: existingReview ? "Review Updated" : "New Review Received",
      message: `${req.user.name} rated you ${numericRating} out of 5 stars.`,
      type: "review_received",
    });

    res.status(existingReview ? 200 : 201).json({
      success: true,
      message: existingReview ? "Your review has been updated" : "Thank you for your review",
      reviews: caretaker.reviews,
      averageRating: caretaker.averageRating,
    });
  } catch (error) {
    next(error);
  }
};

// remove the logged-in client's own review
const deleteReview = async (req, res, next) => {
  try {
    const caretaker = await CaretakerProfile.findById(req.params.id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found",
      });
    }

    const review = caretaker.reviews.find(
      (item) => String(item.clientId) === String(req.user.id),
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "You have not reviewed this caretaker",
      });
    }

    caretaker.reviews.pull(review._id);
    await caretaker.save();

    res.json({
      success: true,
      message: "Review deleted",
      reviews: caretaker.reviews,
      averageRating: caretaker.averageRating,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateAvailability,
  createOrUpdateProfile,
  submitApplication,
  getApplicationStatus,
  getAllApprovedCaretakers,
  getCaretakerById,
  uploadDocuments,
  addReview,
  deleteReview,
};