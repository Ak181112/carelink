const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const User = require("../models/User");
const CaretakerProfile = require("../models/CaretakerProfile");
const CaretakerApplication = require("../models/CaretakerApplication");
const Notification = require("../models/Notification");

const { sendApplicationStatusEmail } = require("../services/emailService");

/* ============================================================
   DASHBOARD ANALYTICS HELPERS
============================================================ */

/**
 * Returns dashboard role counts for all registered accounts.
 *
 * The existing "Total Users" business metric remains
 * non-admin users for backward compatibility.
 *
 * Role distribution separately includes:
 * - family members
 * - caretakers
 * - administrators
 */
const getRoleDistribution = async () => {
  const result = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const distribution = {
    familyMembers: 0,
    caretakers: 0,
    admins: 0,
  };

  for (const item of result) {
    if (item._id === "family_member") {
      distribution.familyMembers = item.count;
    }

    if (item._id === "caretaker") {
      distribution.caretakers = item.count;
    }

    if (item._id === "admin") {
      distribution.admins = item.count;
    }
  }

  return distribution;
};

/**
 * Returns OCR verification statistics.
 *
 * A caretaker is counted only once.
 *
 * The latest caretaker application is used for each
 * caretaker so multiple historical applications do not
 * inflate the dashboard.
 *
 * verificationStatus:
 *   approved -> OCR passed
 *   rejected -> OCR failed
 *   pending/other/missing -> pending
 */
const getOCRStats = async () => {
  const totalCaretakers = await User.countDocuments({
    role: "caretaker",
  });

  /*
   * Get only the latest application for each caretaker.
   * This prevents old rejected/re-submitted applications
   * from being counted multiple times.
   */
  const latestApplications = await CaretakerApplication.aggregate([
    {
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },
    {
      $group: {
        _id: "$caretakerId",

        addressMatched: {
          $first: "$addressMatched",
        },

        verificationStatus: {
          $first: "$verificationStatus",
        },
      },
    },
  ]);

  let passed = 0;
  let failed = 0;
  let pending = 0;

  for (const application of latestApplications) {
    /*
     * OCR verification passed independently of the
     * application's admin lifecycle status.
     *
     * A caretaker can therefore be:
     * - OCR verified + application pending
     * - OCR verified + application approved
     * - OCR verified + application rejected
     *
     * All three still represent a successful OCR match.
     */
    if (
      application.addressMatched === true ||
      application.verificationStatus === "verified"
    ) {
      passed += 1;
      continue;
    }

    /*
     * OCR/address verification failed or requires
     * manual verification.
     */
    if (
      application.addressMatched === false ||
      application.verificationStatus === "manual_review"
    ) {
      failed += 1;
      continue;
    }

    /*
     * No OCR result / not yet checked.
     */
    pending += 1;
  }

  /*
   * Registered caretakers who have never submitted an
   * application remain pending.
   */
  const classified = passed + failed + pending;

  if (classified < totalCaretakers) {
    pending += totalCaretakers - classified;
  }

  /*
   * Safety guard against unexpected application records.
   */
  const totalClassified = passed + failed + pending;

  if (totalClassified > totalCaretakers) {
    const excess = totalClassified - totalCaretakers;

    if (pending >= excess) {
      pending -= excess;
    } else {
      pending = 0;
    }
  }

  return {
    passed,
    failed,
    pending,
    totalCaretakers,
  };
};

/**
 * Returns revenue from ONLY:
 *
 * Payment.status === "paid"
 * AND
 * Booking.status === "closed"
 *
 * Payment.amount is treated as the gross customer-paid
 * amount for the booking.
 */
const getClosedPaidFinancials = async () => {
  const result = await Payment.aggregate([
    {
      $match: {
        status: "paid",
      },
    },

    {
      $lookup: {
        from: "bookings",
        localField: "bookingId",
        foreignField: "_id",
        as: "booking",
      },
    },

    {
      $unwind: "$booking",
    },

    {
      $match: {
        "booking.status": "closed",
      },
    },

    {
      $group: {
        _id: null,

        totalBookings: {
          $sum: 1,
        },

        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return {
    totalBookings: result[0]?.totalBookings || 0,

    totalRevenue: result[0]?.totalRevenue || 0,
  };
};

/**
 * Returns monthly gross revenue for every caretaker
 * for every month in the current calendar year.
 *
 * Zero-revenue months are included as well.
 *
 * This makes the frontend chart capable of showing:
 *
 * Jan ... Dec
 *
 * for every caretaker.
 */
const getMonthlyCaretakerRevenue = async () => {
  const currentYear = new Date().getFullYear();

  const startOfYear = new Date(currentYear, 0, 1);

  const startOfNextYear = new Date(currentYear + 1, 0, 1);

  /*
   * Get every registered caretaker.
   *
   * This deliberately uses User rather than only
   * approved CaretakerProfile records.
   */
  const caretakers = await User.find({
    role: "caretaker",
  })
    .select("_id name")
    .sort({ name: 1 })
    .lean();

  if (caretakers.length === 0) {
    return [];
  }

  /*
   * Aggregate only closed + paid bookings.
   */
  const revenueRows = await Payment.aggregate([
    {
      $match: {
        status: "paid",

        /*
         * Use paidAt when available.
         * createdAt is used as a fallback.
         */
        $or: [
          {
            paidAt: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
          {
            paidAt: null,
            createdAt: {
              $gte: startOfYear,
              $lt: startOfNextYear,
            },
          },
        ],
      },
    },

    {
      $lookup: {
        from: "bookings",
        localField: "bookingId",
        foreignField: "_id",
        as: "booking",
      },
    },

    {
      $unwind: "$booking",
    },

    {
      $match: {
        "booking.status": "closed",
      },
    },

    {
      $project: {
        caretakerId: 1,
        amount: 1,

        revenueDate: {
          $ifNull: ["$paidAt", "$createdAt"],
        },
      },
    },

    {
      $group: {
        _id: {
          caretakerId: "$caretakerId",

          month: {
            $month: "$revenueDate",
          },
        },

        revenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  /*
   * Build quick lookup:
   *
   * caretakerId-month -> revenue
   */
  const revenueMap = new Map();

  for (const row of revenueRows) {
    const key = `${row._id.caretakerId.toString()}-${row._id.month}`;

    revenueMap.set(key, Number(row.revenue || 0));
  }

  const monthlyRevenue = [];

  /*
   * Generate all 12 months for every caretaker.
   */
  for (const caretaker of caretakers) {
    for (let month = 1; month <= 12; month += 1) {
      const key = `${caretaker._id.toString()}-${month}`;

      const revenue = revenueMap.get(key) || 0;

      const monthString = `${currentYear}-${String(month).padStart(2, "0")}`;

      monthlyRevenue.push({
        month: monthString,
        caretakerId: caretaker._id,
        caretakerName: caretaker.name || "Unknown Caretaker",
        revenue,
      });
    }
  }

  return monthlyRevenue;
};

/* ============================================================
   DASHBOARD
============================================================ */

const getDashboardStats = async (req, res, next) => {
  try {
    /* --------------------------------------------------------
       Existing user statistics
    --------------------------------------------------------- */

    const totalUsers = await User.countDocuments({
      role: {
        $ne: "admin",
      },
    });

    const totalCaretakers = await User.countDocuments({
      role: "caretaker",
    });

    const totalClients = await User.countDocuments({
      role: "family_member",
    });

    /* --------------------------------------------------------
       Application statistics
    --------------------------------------------------------- */

    const pendingApplications = await CaretakerApplication.countDocuments({
      status: "pending",
    });

    const approvedApplications = await CaretakerApplication.countDocuments({
      status: "approved",
    });

    const rejectedApplications = await CaretakerApplication.countDocuments({
      status: "rejected",
    });

    /* --------------------------------------------------------
       Existing address mismatch support
    --------------------------------------------------------- */

    const addressMismatchCount = await CaretakerApplication.countDocuments({
      addressMatched: false,
    });

    /* --------------------------------------------------------
       Existing payment counters
    --------------------------------------------------------- */

    const totalPayments = await Payment.countDocuments({
      status: "paid",
    });

    const pendingPayments = await Payment.countDocuments({
      status: "pending",
    });

    /* --------------------------------------------------------
       IMPORTANT:
       Dashboard financial totals use only
       closed booking + paid payment.
    --------------------------------------------------------- */

    const closedPaidFinancials = await getClosedPaidFinancials();

    /* --------------------------------------------------------
       Role distribution
    --------------------------------------------------------- */

    const roleDistribution = await getRoleDistribution();

    /* --------------------------------------------------------
       OCR analytics
    --------------------------------------------------------- */

    const ocrStats = await getOCRStats();

    /* --------------------------------------------------------
       Monthly caretaker revenue
    --------------------------------------------------------- */

    const monthlyCaretakerRevenue = await getMonthlyCaretakerRevenue();

    /* --------------------------------------------------------
       Recent applications
    --------------------------------------------------------- */

    const recentApplications = await CaretakerApplication.find()
      .populate("caretakerId", "name email phone")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    /* --------------------------------------------------------
       Dashboard response
    --------------------------------------------------------- */

    res.json({
      success: true,

      stats: {
        /* Existing metrics */
        totalUsers,
        totalCaretakers,
        totalClients,

        pendingApplications,
        approvedApplications,
        rejectedApplications,

        addressMismatchCount,

        totalPayments,
        pendingPayments,

        /*
         * IMPORTANT:
         * These values now mean closed + paid only.
         */
        totalBookings: closedPaidFinancials.totalBookings,

        completedBookings: closedPaidFinancials.totalBookings,

        closedPaidBookings: closedPaidFinancials.totalBookings,

        totalRevenue: closedPaidFinancials.totalRevenue,

        /*
         * User role analytics
         */
        roleDistribution,

        /*
         * OCR verification analytics
         */
        ocrStats,

        /*
         * Financial analytics
         */
        monthlyCaretakerRevenue,
      },

      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET ALL USERS
   ============================================================ */

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const filter = {
      role: {
        $ne: "admin",
      },
    };

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const users = await User.find(filter).select("-password").sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   TOGGLE USER STATUS
   ============================================================ */

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

/* ============================================================
   DELETE USER
   ============================================================ */

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

/* ============================================================
   GET ALL CARETAKER APPLICATIONS
============================================================ */

const getAllApplications = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const applications = await CaretakerApplication.find(filter)
      .populate("caretakerId", "name email phone")
      .populate("profileId")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   APPROVE APPLICATION
============================================================ */

const approveApplication = async (req, res, next) => {
  try {
    const application = await CaretakerApplication.findById(
      req.params.id,
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

    /* Update caretaker profile */
    await CaretakerProfile.findOneAndUpdate(
      {
        userId: application.caretakerId._id,
      },
      {
        applicationStatus: "approved",
        isVerified: true,
      },
    );

    /* Notification */
    await Notification.create({
      userId: application.caretakerId._id,

      title: "Application Approved",

      message:
        "Your caretaker application has been approved. You can now receive care requests.",

      type: "application_approved",
    });

    /* Email */
    try {
      await sendApplicationStatusEmail(
        application.caretakerId.email,
        application.caretakerId.name,
        "approved",
        application.adminNote,
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

/* ============================================================
   REJECT APPLICATION
============================================================ */

const rejectApplication = async (req, res, next) => {
  try {
    const application = await CaretakerApplication.findById(
      req.params.id,
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

    /* Update caretaker profile */
    await CaretakerProfile.findOneAndUpdate(
      {
        userId: application.caretakerId._id,
      },
      {
        applicationStatus: "rejected",
        isVerified: false,
      },
    );

    /* Notification */
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

    /* Email */
    try {
      await sendApplicationStatusEmail(
        application.caretakerId.email,
        application.caretakerId.name,
        "rejected",
        application.adminNote,
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

/* ============================================================
   GET ALL NOTIFICATIONS
============================================================ */

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate("userId", "name email role")
      .sort({
        createdAt: -1,
      })
      .limit(50);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

//GET BOOKINGS

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({
        createdAt: -1,
      })
      .limit(200)

      /* --------------------------------------------------------
         Client / Family Member
      --------------------------------------------------------- */
      .populate({
        path: "clientId",
        select: "name email phone role profilePhoto isActive",
      })

      /* --------------------------------------------------------
         Caretaker
      --------------------------------------------------------- */
      .populate({
        path: "caretakerId",
        select: "name email phone role profilePhoto isActive",
      })

      /* --------------------------------------------------------
         Parent / Patient
      --------------------------------------------------------- */
      .populate({
        path: "parentId",
      })

      /* --------------------------------------------------------
         Hospital
      --------------------------------------------------------- */
      .populate({
        path: "hospitalId",
      })

      /* --------------------------------------------------------
         Payment
      --------------------------------------------------------- */
      .populate({
        path: "paymentId",
        select:
          "bookingId clientId caretakerId amount currency method status stripeCheckoutSessionId stripePaymentIntentId stripeTransferId receiptNumber paidAt failureReason createdAt updatedAt",
      });

    /* ==========================================================
       NORMALIZE ADMIN BOOKING DATA
       ========================================================== */

    const normalizedBookings = bookings.map((booking) => {
      const item = booking.toObject({
        virtuals: true,
      });

      /* ------------------------------------------------------
           Safe scheduled date
        ------------------------------------------------------- */

      let scheduledDate = item.scheduledDate || null;

      if (scheduledDate && Number.isNaN(new Date(scheduledDate).getTime())) {
        scheduledDate = null;
      }

      /* ------------------------------------------------------
           Safe hospital information
           Use snapshot as fallback for older bookings.
        ------------------------------------------------------- */

      const hospital = item.hospitalId || {};

      const hospitalSnapshot = item.hospitalSnapshot || {};

      const hospitalInfo = {
        id: hospital._id || null,

        name:
          hospital.name || hospitalSnapshot.name || "Hospital not available",

        address: hospital.address || hospitalSnapshot.address || "",

        lat: hospital.location?.lat ?? hospitalSnapshot.lat ?? null,

        lng: hospital.location?.lng ?? hospitalSnapshot.lng ?? null,
      };

      /* ------------------------------------------------------
           Safe parent information
        ------------------------------------------------------- */

      const parent = item.parentId || null;

      const parentInfo = parent
        ? {
            id: parent._id || null,

            fullName: parent.fullName || "Parent not available",

            age: parent.age ?? null,

            gender: parent.gender || null,

            address: parent.address || "",

            district: parent.district || "",

            town: parent.town || "",

            contactNumber: parent.contactNumber || "",

            emergencyContact: parent.emergencyContact || null,

            medicalConditions: parent.medicalConditions || "",

            specialRequirements: parent.specialRequirements || "",
          }
        : null;

      /* ------------------------------------------------------
           Safe client information
        ------------------------------------------------------- */

      const client = item.clientId || null;

      const clientInfo = client
        ? {
            id: client._id || null,

            name: client.name || "Unknown client",

            email: client.email || "",

            phone: client.phone || "",

            role: client.role || "family_member",

            profilePhoto: client.profilePhoto || null,

            isActive: client.isActive ?? true,
          }
        : null;

      /* ------------------------------------------------------
           Safe caretaker information
        ------------------------------------------------------- */

      const caretaker = item.caretakerId || null;

      const caretakerInfo = caretaker
        ? {
            id: caretaker._id || null,

            name: caretaker.name || "Unknown caretaker",

            email: caretaker.email || "",

            phone: caretaker.phone || "",

            role: caretaker.role || "caretaker",

            profilePhoto: caretaker.profilePhoto || null,

            isActive: caretaker.isActive ?? true,
          }
        : null;

      /* ------------------------------------------------------
           Payment
        ------------------------------------------------------- */

      const payment = item.paymentId || null;

      const paymentInfo = payment
        ? {
            id: payment._id || null,

            amount: Number(payment.amount || 0),

            currency: payment.currency || "LKR",

            method: payment.method || null,

            status: payment.status || "pending",

            receiptNumber: payment.receiptNumber || null,

            paidAt: payment.paidAt || null,

            failureReason: payment.failureReason || "",

            stripeCheckoutSessionId: payment.stripeCheckoutSessionId || null,

            stripePaymentIntentId: payment.stripePaymentIntentId || null,

            stripeTransferId: payment.stripeTransferId || null,

            createdAt: payment.createdAt || null,

            updatedAt: payment.updatedAt || null,
          }
        : null;

      /* ------------------------------------------------------
           Route information
        ------------------------------------------------------- */

      const distanceKm = Number.isFinite(Number(item.distanceKm))
        ? Number(item.distanceKm)
        : null;

      const durationMinutes = Number.isFinite(Number(item.durationMinutes))
        ? Number(item.durationMinutes)
        : null;

      /* ------------------------------------------------------
           Pricing information
        ------------------------------------------------------- */

      const pricing = item.pricing || {};

      const pricingInfo = {
        ratePerKm: Number(pricing.ratePerKm || 0),

        caretakerServiceCharge: Number(pricing.caretakerServiceCharge || 0),

        adminFeePercent: Number(pricing.adminFeePercent ?? 15),

        adminFeeAmount: Number(pricing.adminFeeAmount || 0),

        distanceCharge: Number(pricing.distanceCharge || 0),

        total: Number(pricing.total || 0),

        currency: pricing.currency || "LKR",
      };

      /* ------------------------------------------------------
           OTP status
           Never expose OTP hash/code.
        ------------------------------------------------------- */

      const otp = item.otp || {};

      const otpInfo = {
        generated: Boolean(otp.codeHash),

        verified: Boolean(otp.verifiedAt),

        expiresAt: otp.expiresAt || null,

        verifiedAt: otp.verifiedAt || null,
      };

      /* ------------------------------------------------------
           Progress information
        ------------------------------------------------------- */

      const progress = item.progress || {};

      const progressStages = Array.isArray(progress.stages)
        ? progress.stages.map((stage) => ({
            key: stage.key,

            label: stage.label,

            status: stage.status || "not_started",

            updatedAt: stage.updatedAt || null,

            updatedBy: stage.updatedBy || null,
          }))
        : [];

      const progressInfo = {
        currentStage: progress.currentStage || "task_started",

        stages: progressStages,
      };

      /* ------------------------------------------------------
           Completion
        ------------------------------------------------------- */

      const completionInfo = {
        caretakerCompletedAt: item.caretakerCompletedAt || null,

        clientCompletedAt: item.clientCompletedAt || null,

        caretakerCompleted: Boolean(item.caretakerCompletedAt),

        clientCompleted: Boolean(item.clientCompletedAt),
      };

      /* ------------------------------------------------------
           Final normalized booking object
        ------------------------------------------------------- */

      return {
        _id: item._id,

        clientId: clientInfo,

        caretakerId: caretakerInfo,

        parentId: parentInfo,

        hospitalId: {
          _id: hospitalInfo.id,

          name: hospitalInfo.name,

          address: hospitalInfo.address,

          location: {
            lat: hospitalInfo.lat,

            lng: hospitalInfo.lng,
          },
        },

        /* Keep existing snapshot */
        hospitalSnapshot: item.hospitalSnapshot || null,

        /* Schedule */
        scheduledDate,

        startTime: item.startTime || "",

        serviceNotes: item.serviceNotes || "",

        /* Pickup */
        pickupLocation: item.pickupLocation || null,

        /* Route */
        distanceKm,

        durationMinutes,

        /* Pricing */
        pricing: pricingInfo,

        /* Lifecycle */
        status: item.status || "requested",

        /* OTP */
        otp: otpInfo,

        /* Progress */
        progress: progressInfo,

        /* Completion */
        completion: completionInfo,

        /* Backward-compatible fields */
        caretakerCompletedAt: item.caretakerCompletedAt || null,

        clientCompletedAt: item.clientCompletedAt || null,

        /* Payment */
        paymentId: paymentInfo,

        /* Cancellation */
        cancellationReason: item.cancellationReason || "",

        /* Audit timestamps */
        createdAt: item.createdAt || null,

        updatedAt: item.updatedAt || null,
      };
    });

    res.json({
      success: true,
      count: normalizedBookings.length,
      bookings: normalizedBookings,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   UPDATE BOOKING — ADMIN
============================================================ */

const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const {
      status,
      scheduledDate,
      startTime,
      serviceNotes,
      cancellationReason,
    } = req.body;

    /* --------------------------------------------------------
       Allowed booking statuses
    --------------------------------------------------------- */

    const allowedStatuses = [
      "requested",
      "accepted",
      "rejected",
      "cancelled",
      "in_progress",
      "payment_pending",
      "paid",
      "closed",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    /* --------------------------------------------------------
       Validate scheduled date
    --------------------------------------------------------- */

    let normalizedDate;

    if (scheduledDate !== undefined) {
      if (!scheduledDate) {
        return res.status(400).json({
          success: false,
          message: "Scheduled date is required",
        });
      }

      normalizedDate = new Date(scheduledDate);

      if (Number.isNaN(normalizedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid scheduled date",
        });
      }
    }

    /* --------------------------------------------------------
       Validate start time
    --------------------------------------------------------- */

    if (startTime !== undefined && typeof startTime !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid start time",
      });
    }

    /* --------------------------------------------------------
       Status-specific validation
    --------------------------------------------------------- */

    const nextStatus = status !== undefined ? status : booking.status;

    if (
      nextStatus === "cancelled" &&
      cancellationReason !== undefined &&
      typeof cancellationReason !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason must be text",
      });
    }

    /* --------------------------------------------------------
       Apply safe operational fields only
    --------------------------------------------------------- */

    if (status !== undefined) {
      booking.status = status;
    }

    if (normalizedDate) {
      booking.scheduledDate = normalizedDate;
    }

    if (startTime !== undefined) {
      booking.startTime = startTime.trim();
    }

    if (serviceNotes !== undefined) {
      booking.serviceNotes = String(serviceNotes).trim();
    }

    if (cancellationReason !== undefined) {
      booking.cancellationReason = String(cancellationReason).trim();
    }

    /*
     * If admin changes the booking away from cancelled,
     * clear an old cancellation reason.
     */
    if (status && status !== "cancelled") {
      booking.cancellationReason = "";
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "clientId",
        select: "name email phone role profilePhoto isActive",
      })
      .populate({
        path: "caretakerId",
        select: "name email phone role profilePhoto isActive",
      })
      .populate("parentId")
      .populate("hospitalId")
      .populate("paymentId");

    return res.json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   DELETE BOOKING — ADMIN
============================================================ */

const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /*
     * Enterprise protection:
     * Do not physically delete completed,
     * paid, or financially active bookings.
     */
    const protectedStatuses = [
      "paid",
      "closed",
      "in_progress",
      "payment_pending",
    ];

    if (protectedStatuses.includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message:
          "Completed or financially active bookings cannot be deleted. Cancel or archive them instead.",
        code: "BOOKING_DELETE_PROTECTED",
      });
    }

    /*
     * Never delete a booking that already
     * has a payment record.
     */
    if (booking.paymentId) {
      return res.status(409).json({
        success: false,
        message: "Bookings with payment records cannot be deleted.",
        code: "BOOKING_PAYMENT_EXISTS",
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Booking deleted successfully",
      bookingId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET PAYMENTS
============================================================ */

const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .sort({
        createdAt: -1,
      })
      .limit(200)
      .populate("clientId", "name email")
      .populate("caretakerId", "name email")
      .populate("bookingId");

    res.json({
      success: true,
      payments,
    });
  } catch (e) {
    next(e);
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
  getBookings,
  updateBooking,
  deleteBooking,
  getPayments,
};
