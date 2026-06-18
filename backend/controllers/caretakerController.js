const path = require("path");
const CaretakerProfile = require("../models/CaretakerProfile");
const CaretakerApplication = require("../models/CaretakerApplication");
const Notification = require("../models/Notification");
const User = require("../models/User");

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOne({ userId: req.user.id });
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateProfile = async (req, res, next) => {
  try {
    const { fullName, contactNumber, nicNumber, address, district, town, experience, qualifications, skills } = req.body;

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
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim())) : [],
      ...(photoPath && { photo: photoPath }),
    };

    let profile = await CaretakerProfile.findOne({ userId: req.user.id });
    if (profile) {
      profile = await CaretakerProfile.findOneAndUpdate({ userId: req.user.id }, profileData, { new: true, runValidators: true });
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

const submitApplication = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(400).json({ success: false, message: "Please complete your profile before applying" });
    }

    const existingApp = await CaretakerApplication.findOne({
      caretakerId: req.user.id,
      status: "pending",
    });
    if (existingApp) {
      return res.status(400).json({ success: false, message: "You already have a pending application" });
    }

    const documents = {};
    if (req.files) {
      if (req.files.nicDocument) documents.nicDocument = `/uploads/documents/${req.files.nicDocument[0].filename}`;
      if (req.files.drivingLicense) documents.drivingLicense = `/uploads/documents/${req.files.drivingLicense[0].filename}`;
      if (req.files.certificates) documents.certificates = req.files.certificates.map((f) => `/uploads/documents/${f.filename}`);
      if (req.files.photo) documents.photo = `/uploads/profiles/${req.files.photo[0].filename}`;
    }

    if (profile.nicDocument && !documents.nicDocument) documents.nicDocument = profile.nicDocument;
    if (profile.drivingLicense && !documents.drivingLicense) documents.drivingLicense = profile.drivingLicense;

    const application = await CaretakerApplication.create({
      caretakerId: req.user.id,
      profileId: profile._id,
      status: "pending",
      documents,
    });

    profile.applicationStatus = "pending";
    await profile.save();

    await Notification.create({
      userId: req.user.id,
      title: "Application Submitted",
      message: "Your caretaker application has been submitted and is under review.",
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

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

const getApplicationStatus = async (req, res, next) => {
  try {
    const application = await CaretakerApplication.findOne({ caretakerId: req.user.id }).sort({ submittedAt: -1 });
    const profile = await CaretakerProfile.findOne({ userId: req.user.id });
    res.json({ success: true, application, applicationStatus: profile?.applicationStatus || "not_applied" });
  } catch (error) {
    next(error);
  }
};

const getAllApprovedCaretakers = async (req, res, next) => {
  try {
    const { town, experience } = req.query;
    const filter = { applicationStatus: "approved", district: "Kurunegala" };
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

const getCaretakerById = async (req, res, next) => {
  try {
    const caretaker = await CaretakerProfile.findById(req.params.id)
      .populate("userId", "name email")
      .select("-nicDocument -drivingLicense -certificates");

    if (!caretaker || caretaker.applicationStatus !== "approved") {
      return res.status(404).json({ success: false, message: "Caretaker not found" });
    }

    res.json({ success: true, caretaker });
  } catch (error) {
    next(error);
  }
};

const uploadDocuments = async (req, res, next) => {
  try {
    const profile = await CaretakerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (req.files) {
      if (req.files.nicDocument) profile.nicDocument = `/uploads/documents/${req.files.nicDocument[0].filename}`;
      if (req.files.drivingLicense) profile.drivingLicense = `/uploads/documents/${req.files.drivingLicense[0].filename}`;
      if (req.files.certificates) {
        const certs = req.files.certificates.map((f) => `/uploads/documents/${f.filename}`);
        profile.certificates = [...(profile.certificates || []), ...certs];
      }
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
