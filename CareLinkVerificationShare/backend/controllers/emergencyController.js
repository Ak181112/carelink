const Booking = require("../models/Booking");
const EmergencyAlert = require("../models/EmergencyAlert");
const User = require("../models/User");

const { notify } = require("../services/notificationService");

/* ============================================================
   HELPER: VALID PRIORITIES
============================================================ */

const ALLOWED_PRIORITIES = [
  "critical",
  "high",
  "normal",
];

/* ============================================================
   TRIGGER EMERGENCY ALERT
============================================================ */

async function trigger(req, res, next) {
  try {
    const {
      bookingId,
      message,
      contactName,
      contactPhone,
      location,
      priority,
    } = req.body;

    /* ----------------------------------------------------------
       Validate booking ID
    ---------------------------------------------------------- */

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    /* ----------------------------------------------------------
       Validate priority
    ---------------------------------------------------------- */

    const alertPriority =
      priority || "critical";

    if (
      !ALLOWED_PRIORITIES.includes(
        alertPriority
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency priority",
      });
    }

    /* ----------------------------------------------------------
       Find booking
    ---------------------------------------------------------- */

    const booking =
      await Booking.findById(bookingId)
        .populate("parentId")
        .populate("hospitalId");

    /*
     * Emergency alerts are allowed only for users who are
     * actually associated with the active booking.
     */

    const isBookingParticipant =
      booking &&
      [
        String(booking.clientId),
        String(booking.caretakerId),
      ].includes(
        String(req.user._id)
      );

    const allowedBookingStatuses = [
      "accepted",
      "in_progress",
      "payment_pending",
    ];

    if (
      !booking ||
      !isBookingParticipant ||
      !allowedBookingStatuses.includes(
        booking.status
      )
    ) {
      return res.status(404).json({
        success: false,
        message: "Active booking not found",
      });
    }

    /* ----------------------------------------------------------
       Prevent duplicate active emergency alerts
    ---------------------------------------------------------- */

    const existingAlert =
      await EmergencyAlert.findOne({
        bookingId: booking._id,
        status: "active",
      });

    if (existingAlert) {
      return res.status(409).json({
        success: false,
        message:
          "An active emergency alert already exists for this booking",
        alert: existingAlert,
      });
    }

    /* ----------------------------------------------------------
       Parent / patient information
    ---------------------------------------------------------- */

    const parent =
      booking.parentId || {};

    const emergencyContact =
      parent.emergencyContact || {};

    /* ----------------------------------------------------------
       Location fallback
    ---------------------------------------------------------- */

    const bookingLocation =
      booking.pickupLocation || {};

    const emergencyLocation =
      location &&
      typeof location === "object"
        ? location
        : {};

    const finalLocation = {
      address:
        emergencyLocation.address ||
        bookingLocation.address ||
        "",

      lat:
        typeof emergencyLocation.lat ===
        "number"
          ? emergencyLocation.lat
          : bookingLocation.lat ??
            null,

      lng:
        typeof emergencyLocation.lng ===
        "number"
          ? emergencyLocation.lng
          : bookingLocation.lng ??
            null,
    };

    /* ----------------------------------------------------------
       Contact fallback
    ---------------------------------------------------------- */

    const finalContactName =
      typeof contactName === "string" &&
      contactName.trim()
        ? contactName.trim()
        : emergencyContact.name ||
          parent.fullName ||
          req.user.name ||
          "";

    const finalContactPhone =
      typeof contactPhone === "string" &&
      contactPhone.trim()
        ? contactPhone.trim()
        : emergencyContact.phone ||
          parent.contactNumber ||
          req.user.phone ||
          "";

    /* ----------------------------------------------------------
       Create emergency alert
    ---------------------------------------------------------- */

    const alert =
      await EmergencyAlert.create({
        bookingId:
          booking._id,

        triggeredBy:
          req.user._id,

        message:
          typeof message === "string" &&
          message.trim()
            ? message.trim()
            : "Emergency assistance requested",

        priority:
          alertPriority,

        contactName:
          finalContactName,

        contactPhone:
          finalContactPhone,

        location:
          finalLocation,

        status:
          "active",
      });

    /* ----------------------------------------------------------
       Find administrators
    ---------------------------------------------------------- */

    const admins =
      await User.find({
        role: "admin",
        isActive: true,
      }).select("_id");

    /* ----------------------------------------------------------
       Notify family member
    ---------------------------------------------------------- */

    await notify(
      booking.clientId,
      "Emergency Alert",
      "Emergency assistance has been triggered for your booking.",
      "emergency"
    );

    /* ----------------------------------------------------------
       Notify caretaker
    ---------------------------------------------------------- */

    await notify(
      booking.caretakerId,
      "Emergency Alert",
      "Emergency assistance has been triggered for this booking.",
      "emergency"
    );

    /* ----------------------------------------------------------
       Notify administrators
    ---------------------------------------------------------- */

    const adminMessage =
      `CRITICAL emergency alert for booking ${String(
        booking._id
      ).slice(-8)}. Immediate attention required.`;

    for (const admin of admins) {
      await notify(
        admin._id,
        "Emergency Alert",
        adminMessage,
        "emergency"
      );
    }

    /* ----------------------------------------------------------
       Return populated alert
    ---------------------------------------------------------- */

    const populatedAlert =
      await EmergencyAlert.findById(
        alert._id
      )
        .populate(
          "triggeredBy",
          "name email phone role"
        )
        .populate({
          path: "bookingId",
          populate: [
            {
              path: "clientId",
              select:
                "name email phone role",
            },
            {
              path: "caretakerId",
              select:
                "name email phone role",
            },
            {
              path: "parentId",
            },
            {
              path: "hospitalId",
            },
          ],
        });

    res.status(201).json({
      success: true,
      message:
        "Emergency alert sent successfully",
      alert:
        populatedAlert,
    });
  } catch (error) {
    next(error);
  }
}

/* ============================================================
   LIST MY EMERGENCY ALERTS
============================================================ */

async function listMine(req, res, next) {
  try {
    const alerts =
      await EmergencyAlert.find({
        triggeredBy: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "bookingId",
          populate: [
            {
              path: "parentId",
            },
            {
              path: "hospitalId",
            },
            {
              path: "caretakerId",
              select:
                "name email phone",
            },
          ],
        });

    res.json({
      success: true,
      alerts,
    });
  } catch (error) {
    next(error);
  }
}

/* ============================================================
   RESOLVE EMERGENCY ALERT
============================================================ */

async function resolve(req, res, next) {
  try {
    /* ----------------------------------------------------------
       Admin authorization
       
       The route already uses authorize("admin"), but keeping
       this check protects this controller if it is reused.
    ---------------------------------------------------------- */

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    /* ----------------------------------------------------------
       Find active alert
    ---------------------------------------------------------- */

    const alert =
      await EmergencyAlert.findById(
        req.params.id
      );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    /* ----------------------------------------------------------
       Already resolved
    ---------------------------------------------------------- */

    if (
      alert.status === "resolved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This emergency alert has already been resolved",
        alert,
      });
    }

    /* ----------------------------------------------------------
       Resolve
    ---------------------------------------------------------- */

    alert.status = "resolved";

    alert.resolvedAt =
      new Date();

    alert.resolvedBy =
      req.user._id;

    await alert.save();

    /* ----------------------------------------------------------
       Notify booking participants
    ---------------------------------------------------------- */

    const booking =
      await Booking.findById(
        alert.bookingId
      );

    if (booking) {
      await notify(
        booking.clientId,
        "Emergency Alert Resolved",
        "Your CareLink+ emergency assistance alert has been resolved by an administrator.",
        "emergency"
      );

      await notify(
        booking.caretakerId,
        "Emergency Alert Resolved",
        "The CareLink+ emergency alert for your booking has been resolved by an administrator.",
        "emergency"
      );
    }

    /* ----------------------------------------------------------
       Return populated alert
    ---------------------------------------------------------- */

    const resolvedAlert =
      await EmergencyAlert.findById(
        alert._id
      )
        .populate(
          "triggeredBy",
          "name email phone role"
        )
        .populate(
          "resolvedBy",
          "name email role"
        )
        .populate({
          path: "bookingId",
          populate: [
            {
              path: "clientId",
              select:
                "name email phone role",
            },
            {
              path: "caretakerId",
              select:
                "name email phone role",
            },
            {
              path: "parentId",
            },
            {
              path: "hospitalId",
            },
          ],
        });

    res.json({
      success: true,
      message:
        "Emergency alert resolved successfully",
      alert:
        resolvedAlert,
    });
  } catch (error) {
    next(error);
  }
}

/* ============================================================
   ADMIN LIST
============================================================ */

async function adminList(req, res, next) {
  try {
    const alerts =
      await EmergencyAlert.find()
        .sort({
          status: 1,
          priority: -1,
          createdAt: -1,
        })
        .populate(
          "triggeredBy",
          "name email phone role"
        )
        .populate(
          "resolvedBy",
          "name email role"
        )
        .populate({
          path: "bookingId",
          populate: [
            {
              path: "clientId",
              select:
                "name email phone role",
            },
            {
              path: "caretakerId",
              select:
                "name email phone role",
            },
            {
              path: "parentId",
            },
            {
              path: "hospitalId",
            },
          ],
        });

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
}

/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  trigger,
  listMine,
  resolve,
  adminList,
};