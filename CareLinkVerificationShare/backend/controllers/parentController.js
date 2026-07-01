const ParentProfile = require("../models/ParentProfile");
const Notification = require("../models/Notification");

const getParentProfiles = async (req, res, next) => {
  try {
    const profiles = await ParentProfile.find({ userId: req.user.id });
    res.json({ success: true, profiles });
  } catch (error) {
    next(error);
  }
};

const getParentProfile = async (req, res, next) => {
  try {
    const profile = await ParentProfile.findOne({ _id: req.params.id, userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const createParentProfile = async (req, res, next) => {
  try {
    const { fullName, age, gender, address, district, town, contactNumber, emergencyContact, medicalConditions, specialRequirements } = req.body;

    const profile = await ParentProfile.create({
      userId: req.user.id,
      fullName,
      age,
      gender,
      address,
      district: district || "Kurunegala",
      town,
      contactNumber,
      emergencyContact,
      medicalConditions,
      specialRequirements,
    });

    await Notification.create({
      userId: req.user.id,
      title: "Parent Profile Created",
      message: `Profile for ${fullName} has been created successfully.`,
      type: "profile_updated",
    });

    res.status(201).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const updateParentProfile = async (req, res, next) => {
  try {
    const profile = await ParentProfile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }

    await Notification.create({
      userId: req.user.id,
      title: "Parent Profile Updated",
      message: `Profile for ${profile.fullName} has been updated.`,
      type: "profile_updated",
    });

    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const deleteParentProfile = async (req, res, next) => {
  try {
    const profile = await ParentProfile.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Parent profile not found" });
    }
    res.json({ success: true, message: "Parent profile deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getParentProfiles, getParentProfile, createParentProfile, updateParentProfile, deleteParentProfile };
