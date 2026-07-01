const User = require("../models/User");
const CaretakerProfile = require("../models/CaretakerProfile");
const CaretakerApplication = require("../models/CaretakerApplication");
const Notification = require("../models/Notification");
const { sendApplicationStatusEmail } = require("../services/emailService");

// dashboard status
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({
      role: { $ne: "admin" },
    });

    const totalCaretakers = await User.countDocuments({
      role: "caretaker",
    });

    const totalClients = await User.countDocuments({
      role: "family_member",
    });

    const pendingApplications = await CaretakerApplication.countDocuments({
      status: "pending",
    });

    const approvedApplications = await CaretakerApplication.countDocuments({
      status: "approved",
    });

    const rejectedApplications = await CaretakerApplication.countDocuments({
      status: "rejected",
    });

    const recentApplications = await CaretakerApplication.find()
      .populate("caretakerId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCaretakers,
        totalClients,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
      },
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

//get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const filter = { role: { $ne: "admin" } };

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

//user status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//delete user
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// get all admin applications
const getAllApplications = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const applications = await CaretakerApplication.find(filter)
      .populate("caretakerId", "name email phone")
      .populate("profileId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};


//approve the application
const approveApplication = async (req, res, next) => {
  try {
    const application = await CaretakerApplication.findById(
      req.params.id
    ).populate("caretakerId", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = "approved";
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user.id;
    application.adminNote = req.body.note || "";

    await application.save();

    // Update profile
    await CaretakerProfile.findOneAndUpdate(
      { userId: application.caretakerId._id },
      {
        applicationStatus: "approved",
        isVerified: true,
      }
    );

    // Notification
    await Notification.create({
      userId: application.caretakerId._id,
      title: "Application Approved",
      message:
        "Your caretaker application has been approved. You can now receive care requests.",
      type: "application_approved",
    });

    // Email
    try {
      await sendApplicationStatusEmail(
        application.caretakerId.email,
        application.caretakerId.name,
        "approved",
        application.adminNote
      );
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Application approved",
      application,
    });
  } catch (error) {
    next(error);
  }
};


//reject application
const rejectApplication = async (req, res, next) => {
  try {
    const application = await CaretakerApplication.findById(
      req.params.id
    ).populate("caretakerId", "name email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = "rejected";
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user.id;
    application.adminNote = req.body.note || "";

    await application.save();

    // Update profile
    await CaretakerProfile.findOneAndUpdate(
      { userId: application.caretakerId._id },
      {
        applicationStatus: "rejected",
        isVerified: false,
      }
    );

    // Notification
    await Notification.create({
      userId: application.caretakerId._id,
      title: "Application Rejected",
      message: `Your application was reviewed. ${
        req.body.note
          ? `Note: ${req.body.note}`
          : "Please update your profile and reapply."
      }`,
      type: "application_rejected",
    });

    // Email 
    try {
      await sendApplicationStatusEmail(
        application.caretakerId.email,
        application.caretakerId.name,
        "rejected",
        application.adminNote
      );
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Application rejected",
      application,
    });
  } catch (error) {
    next(error);
  }
};


//Get the notification this fun
const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllApplications,
  approveApplication,
  rejectApplication,
  getAllNotifications,
};