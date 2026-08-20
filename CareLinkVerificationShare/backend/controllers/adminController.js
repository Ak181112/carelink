const User = require("../models/User");
const CaretakerProfile = require("../models/CaretakerProfile");
const CaretakerApplication = require("../models/CaretakerApplication");
const Notification = require("../models/Notification");
const ContactMessage = require("../models/ContactMessage");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Settings = require("../models/Settings");
const { getSettings } = require("../models/Settings");
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

    // pending applications whose NIC address did not match the profile address
    const addressMismatchCount = await CaretakerApplication.countDocuments({
      status: "pending",
      addressMatched: false,
    });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const activeBookings = await Booking.countDocuments({
      status: { $in: ["accepted", "in_progress"] },
    });
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const emergencyBookings = await Booking.countDocuments({ emergencyTriggered: true });

    // revenue is only counted once the money has actually been collected
    const [revenue] = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);

    const recentApplications = await CaretakerApplication.find()
      .populate("caretakerId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .populate("parentId", "name")
      .populate("caretakerId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-pickupOtp");

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCaretakers,
        totalClients,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        addressMismatchCount,
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        emergencyBookings,
        totalRevenue: revenue?.total ?? 0,
      },
      recentApplications,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

//get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, includeAdmins } = req.query;

    // Admins are hidden from the normal user list, but role management needs
    // them so it can show who holds the role and block the last-admin removal.
    const filter = includeAdmins === "true" ? {} : { role: { $ne: "admin" } };

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

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This application has already been ${application.status}`,
      });
    }

    // OCR is never perfect, so a failed address match is not a dead end: an admin
    // may approve after checking the NIC image, but must record why.
    const override = req.body.override === true || req.body.override === "true";
    const overrideReason = (req.body.overrideReason || "").trim();

    if (!application.addressMatched) {
      if (!override) {
        return res.status(400).json({
          success: false,
          message:
            "The NIC address does not match the profile address. Review the NIC document and confirm a manual override to approve.",
        });
      }

      if (!overrideReason) {
        return res.status(400).json({
          success: false,
          message: "A reason is required when manually overriding a failed address match",
        });
      }
    }

    application.status = "approved";
    application.verificationStatus = application.addressMatched ? "verified" : "manual_review";
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user.id;
    application.adminNote = req.body.note || "";
    application.manualOverride = !application.addressMatched;
    application.overrideReason = application.addressMatched ? "" : overrideReason;

    await application.save();

    // Update profile
    await CaretakerProfile.findOneAndUpdate(
      { userId: application.caretakerId._id },
      {
        applicationStatus: "approved",
        isVerified: true,
        updatedAt: Date.now(),
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

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This application has already been ${application.status}`,
      });
    }

    const note = (req.body.note || "").trim();

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "A reason is required when rejecting an application",
      });
    }

    application.status = "rejected";
    application.reviewedAt = Date.now();
    application.reviewedBy = req.user.id;
    application.adminNote = note;

    await application.save();

    // Update profile
    await CaretakerProfile.findOneAndUpdate(
      { userId: application.caretakerId._id },
      {
        applicationStatus: "rejected",
        isVerified: false,
        updatedAt: Date.now(),
      }
    );

    // Notification
    await Notification.create({
      userId: application.caretakerId._id,
      title: "Application Rejected",
      message: `Your application was reviewed. Note: ${note}`,
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

//get all contact messages
const getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/* ========================= REVIEWS ========================= */

// GET /api/admin/reviews
// Reviews live embedded on each caretaker profile, so they are flattened here
// into one feed the admin can scan.
const getAllReviews = async (req, res, next) => {
  try {
    const { rating, search } = req.query;

    const profiles = await CaretakerProfile.find({ "reviews.0": { $exists: true } })
      .select("fullName town photo averageRating reviews")
      .lean();

    let reviews = profiles.flatMap((profile) =>
      (profile.reviews || []).map((review) => ({
        _id: review._id,
        caretakerId: profile._id,
        caretakerName: profile.fullName,
        caretakerTown: profile.town,
        caretakerAverage: profile.averageRating,
        clientName: review.clientName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      }))
    );

    if (rating) {
      reviews = reviews.filter((r) => r.rating === Number(rating));
    }

    if (search) {
      const term = String(search).toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.caretakerName?.toLowerCase().includes(term) ||
          r.clientName?.toLowerCase().includes(term) ||
          r.comment?.toLowerCase().includes(term)
      );
    }

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // distribution is computed over every review, not the filtered view
    const all = profiles.flatMap((p) => p.reviews || []);
    const distribution = [1, 2, 3, 4, 5].reduce((acc, star) => {
      acc[star] = all.filter((r) => r.rating === star).length;
      return acc;
    }, {});

    const average = all.length
      ? Number((all.reduce((sum, r) => sum + r.rating, 0) / all.length).toFixed(2))
      : 0;

    res.json({
      success: true,
      reviews,
      stats: {
        total: all.length,
        average,
        distribution,
        reviewedCaretakers: profiles.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ========================= EMERGENCIES ========================= */

// GET /api/admin/emergencies
const getEmergencies = async (req, res, next) => {
  try {
    const filter = { emergencyTriggered: true };

    if (req.query.resolved === "true") filter.emergencyResolvedAt = { $ne: null };
    if (req.query.resolved === "false") filter.emergencyResolvedAt = null;

    const bookings = await Booking.find(filter)
      .populate("parentId", "name email phone")
      .populate("caretakerId", "name email phone")
      .populate("parentProfileId", "fullName contactNumber medicalConditions emergencyContact")
      .select("-pickupOtp")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      emergencies: bookings,
      stats: {
        total: bookings.length,
        open: bookings.filter((b) => !b.emergencyResolvedAt).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/emergencies/:id/resolve
const resolveEmergency = async (req, res, next) => {
  try {
    const note = (req.body.note || "").trim();

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Please record what was done about this emergency",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking || !booking.emergencyTriggered) {
      return res.status(404).json({ success: false, message: "Emergency not found" });
    }

    if (booking.emergencyResolvedAt) {
      return res.status(400).json({
        success: false,
        message: "This emergency has already been resolved",
      });
    }

    booking.emergencyResolvedAt = new Date();
    booking.emergencyResolvedBy = req.user.id;
    booking.emergencyResolutionNote = note;
    booking.statusHistory.push({
      status: booking.status,
      changedAt: new Date(),
      note: `EMERGENCY RESOLVED: ${note}`,
    });
    await booking.save();

    for (const userId of [booking.parentId, booking.caretakerId]) {
      await Notification.create({
        userId,
        title: "Emergency Resolved",
        message: `CareLink+ has closed the emergency on your booking. ${note}`,
        type: "emergency",
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/* ========================= REPORTS ========================= */

// GET /api/admin/reports?months=6
const getReports = async (req, res, next) => {
  try {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    // start of the month, `months - 1` months back, so the range includes today
    const since = new Date();
    since.setUTCDate(1);
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCMonth(since.getUTCMonth() - (months - 1));

    // an ordered, gap-free list of buckets so a quiet month still shows as zero
    const buckets = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(since);
      d.setUTCMonth(since.getUTCMonth() + i);
      buckets.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    }

    const monthKey = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };

    const [bookingsByMonth, revenueByMonth, signupsByMonth] = await Promise.all([
      Booking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: monthKey,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            cancelled: {
              $sum: {
                $cond: [{ $in: ["$status", ["cancelled", "rejected"]] }, 1, 0],
              },
            },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: "paid", createdAt: { $gte: since } } },
        { $group: { _id: monthKey, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since }, role: { $ne: "admin" } } },
        {
          $group: {
            _id: monthKey,
            caretakers: { $sum: { $cond: [{ $eq: ["$role", "caretaker"] }, 1, 0] } },
            clients: { $sum: { $cond: [{ $eq: ["$role", "family_member"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const byKey = (rows) => Object.fromEntries(rows.map((r) => [r._id, r]));
    const bookingMap = byKey(bookingsByMonth);
    const revenueMap = byKey(revenueByMonth);
    const signupMap = byKey(signupsByMonth);

    const timeline = buckets.map((key) => ({
      month: key,
      bookings: bookingMap[key]?.total ?? 0,
      completed: bookingMap[key]?.completed ?? 0,
      cancelled: bookingMap[key]?.cancelled ?? 0,
      revenue: revenueMap[key]?.total ?? 0,
      payments: revenueMap[key]?.count ?? 0,
      newCaretakers: signupMap[key]?.caretakers ?? 0,
      newClients: signupMap[key]?.clients ?? 0,
    }));

    // status split across all time, for a share-of-total view
    const statusRows = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bookingsByStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.count]));

    // verification funnel: how many applications clear OCR without a human
    const [applicationTotals] = await CaretakerApplication.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          addressMatched: { $sum: { $cond: ["$addressMatched", 1, 0] } },
          manualOverride: { $sum: { $cond: ["$manualOverride", 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          ocrFailed: { $sum: { $cond: [{ $eq: ["$ocrStatus", "failed"] }, 1, 0] } },
        },
      },
    ]);

    const topCaretakers = await Booking.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$caretakerId",
          completedVisits: { $sum: 1 },
          earned: { $sum: "$caretakerCharge" },
        },
      },
      { $sort: { completedVisits: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "caretakerprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$user.name",
          completedVisits: 1,
          earned: 1,
          averageRating: { $ifNull: [{ $first: "$profile.averageRating" }, 0] },
          town: { $first: "$profile.town" },
        },
      },
    ]);

    const popularHospitals = await Booking.aggregate([
      { $group: { _id: "$hospitalLocation.hospitalName", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, hospital: "$_id", bookings: 1 } },
    ]);

    res.json({
      success: true,
      range: { months, since },
      timeline,
      bookingsByStatus,
      applications: applicationTotals ?? {
        total: 0, addressMatched: 0, manualOverride: 0,
        approved: 0, rejected: 0, pending: 0, ocrFailed: 0,
      },
      topCaretakers,
      popularHospitals,
    });
  } catch (error) {
    next(error);
  }
};

/* ========================= ROLES ========================= */

// PUT /api/admin/users/:id/role
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["family_member", "caretaker", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === role) {
      return res.status(400).json({
        success: false,
        message: `This user is already a ${role.replace("_", " ")}`,
      });
    }

    // never leave the platform without an administrator
    if (user.role === "admin") {
      const admins = await User.countDocuments({ role: "admin" });

      if (admins <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot remove the last remaining admin",
        });
      }
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: "Account Role Changed",
      message: `Your CareLink+ account role changed from ${previousRole.replace("_", " ")} to ${role.replace("_", " ")}.`,
      type: "general",
    });

    res.json({
      success: true,
      message: `Role changed to ${role.replace("_", " ")}`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/* ========================= SETTINGS ========================= */

// GET /api/admin/settings
const getPlatformSettings = async (req, res, next) => {
  try {
    res.json({ success: true, settings: await getSettings(), defaults: Settings.DEFAULTS });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/settings
const updatePlatformSettings = async (req, res, next) => {
  try {
    const allowed = [
      "hourlyRate",
      "adminServiceFee",
      "ratePerKm",
      "maxBookingHours",
      "minNoticeHours",
      "registrationOpen",
      "autoApproveMatchedApplications",
    ];

    const update = { updatedBy: req.user.id };

    for (const key of allowed) {
      if (req.body[key] === undefined) continue;

      if (typeof Settings.DEFAULTS[key] === "boolean") {
        update[key] = req.body[key] === true || req.body[key] === "true";
      } else {
        const value = Number(req.body[key]);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: `${key} must be a positive number`,
          });
        }

        update[key] = value;
      }
    }

    const settings = await Settings.findOneAndUpdate({ key: "platform" }, update, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    res.json({ success: true, message: "Settings saved", settings });
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
  getAllContactMessages,
  getAllReviews,
  getEmergencies,
  resolveEmergency,
  getReports,
  changeUserRole,
  getPlatformSettings,
  updatePlatformSettings,
};