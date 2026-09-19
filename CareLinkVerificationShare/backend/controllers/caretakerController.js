const path = require("path");
const { uploadLocalFile, removeLocalFile } = require("../services/cloudinaryService");
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

const isAddressMatched = (ocrAddress = "", profileAddress = "") => {
  const ocrWords = normalizeAddressWords(ocrAddress);
  const profileWords = normalizeAddressWords(profileAddress);

  if (profileWords.length === 0 || ocrWords.length === 0) return false;

  const matchedWords = profileWords.filter((word) => ocrWords.includes(word));
  const matchPercentage = matchedWords.length / profileWords.length;

  return matchPercentage >= 0.7;
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
      const cloudUrl = await uploadLocalFile(req.file.path, { folder: "carelink-plus/profiles" });
      if (cloudUrl) { photoPath = cloudUrl; removeLocalFile(req.file.path); }
      else photoPath = `/uploads/profiles/${req.file.filename}`;
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
    }

    let ocrText = "";
    let nicAddress = "";
    let addressMatched = false;
    let verificationStatus = "manual_review";

    if (nicImagePath) {
      try {
        const ocrResult = await extractNICAddress(nicImagePath);

        ocrText = ocrResult.rawText || "";
        nicAddress = ocrResult.address || ocrResult.rawText || "";

        const profileAddress = profile.address || "";

        addressMatched = isAddressMatched(nicAddress, profileAddress);

        verificationStatus = addressMatched ? "verified" : "manual_review";
      } catch (err) {
        console.error("OCR error:", err.message);
      }
    }

    if (req.files?.nicDocument) {
      const file = req.files.nicDocument[0];
      const cloudUrl = await uploadLocalFile(file.path, { folder: "carelink-plus/documents" });
      documents.nicDocument = cloudUrl || `/uploads/documents/${file.filename}`;
      if (cloudUrl) removeLocalFile(file.path);
    }
    if (req.files?.drivingLicense) {
      const file = req.files.drivingLicense[0];
      const cloudUrl = await uploadLocalFile(file.path, { folder: "carelink-plus/documents" });
      documents.drivingLicense = cloudUrl || `/uploads/documents/${file.filename}`;
      if (cloudUrl) removeLocalFile(file.path);
    }
    if (req.files?.certificates) {
      documents.certificates = [];
      for (const file of req.files.certificates) {
        const cloudUrl = await uploadLocalFile(file.path, { folder: "carelink-plus/documents" });
        documents.certificates.push(cloudUrl || `/uploads/documents/${file.filename}`);
        if (cloudUrl) removeLocalFile(file.path);
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
      verificationStatus,

      status: "pending",
      submittedAt: new Date(),
    });

    profile.applicationStatus = "pending";
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
    const id = req.params.id;
    let caretaker = null;
    try {
      caretaker = await CaretakerProfile.findById(id)
        .populate("userId", "name email phone")
        .select("-nicDocument -drivingLicense -certificates");
    } catch (_) {}

    if (!caretaker) {
      caretaker = await CaretakerProfile.findOne({ userId: id })
        .populate("userId", "name email phone")
        .select("-nicDocument -drivingLicense -certificates");
    }

    if (!caretaker || caretaker.applicationStatus !== "approved" || caretaker.isVerified !== true) {
      return res.status(404).json({ success: false, message: "Caretaker not found" });
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
      const nicCloud = await uploadLocalFile(req.files.nicDocument[0].path, { folder: "carelink-plus/documents" });
      profile.nicDocument = nicCloud || `/uploads/documents/${req.files.nicDocument[0].filename}`;
      if (nicCloud) removeLocalFile(req.files.nicDocument[0].path);
    }

    if (req.files?.drivingLicense) {
      const licenseCloud = await uploadLocalFile(req.files.drivingLicense[0].path, { folder: "carelink-plus/documents" });
      profile.drivingLicense = licenseCloud || `/uploads/documents/${req.files.drivingLicense[0].filename}`;
      if (licenseCloud) removeLocalFile(req.files.drivingLicense[0].path);
    }

    if (req.files?.certificates) {
      const certs = [];
      for (const f of req.files.certificates) {
        const certCloud = await uploadLocalFile(f.path, { folder: "carelink-plus/documents" });
        certs.push(certCloud || `/uploads/documents/${f.filename}`);
        if (certCloud) removeLocalFile(f.path);
      }
      profile.certificates = [...(profile.certificates || []), ...certs];
    }

    await profile.save();

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  createOrUpdateProfile,
  submitApplication,
  getApplicationStatus,
  getAllApprovedCaretakers,
  getCaretakerById,
  uploadDocuments,
};