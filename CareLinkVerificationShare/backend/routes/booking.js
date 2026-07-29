const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAssignedBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  getBookingById,
  triggerEmergency,
  getAllBookings,
  updatePaymentStatus,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const validate = require("../middleware/validate");

router.use(protect);

/* ---------------- client ---------------- */

router.post(
  "/",
  authorize("family_member"),
  [
    body("caretakerId").isMongoId().withMessage("A caretaker must be selected"),
    body("parentProfileId").isMongoId().withMessage("A parent profile must be selected"),
    body("bookingDate").isISO8601().withMessage("A valid booking date is required"),
    body("bookingTime")
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage("Booking time must be in HH:MM format"),
    body("estimatedHours")
      .isInt({ min: 1, max: 12 })
      .withMessage("Estimated hours must be between 1 and 12"),
    body("pickupLocation.address").trim().notEmpty().withMessage("Pickup address is required"),
    body("hospitalLocation.hospitalName").trim().notEmpty().withMessage("Hospital name is required"),
    body("hospitalLocation.address").trim().notEmpty().withMessage("Hospital address is required"),
  ],
  validate,
  createBooking
);

router.get("/my", authorize("family_member"), getMyBookings);
router.put("/:id/cancel", authorize("family_member"), cancelBooking);

/* ---------------- caretaker ---------------- */

router.get("/assigned", authorize("caretaker"), getAssignedBookings);
router.put("/:id/accept", authorize("caretaker"), acceptBooking);
router.put("/:id/reject", authorize("caretaker"), rejectBooking);
router.put("/:id/start", authorize("caretaker"), startBooking);
router.put("/:id/complete", authorize("caretaker"), completeBooking);

/* ---------------- admin ---------------- */

router.get("/", authorize("admin"), getAllBookings);
router.put("/:id/payment", authorize("admin"), updatePaymentStatus);

/* ---------------- shared (participants + admin) ---------------- */

router.put("/:id/emergency", triggerEmergency);
router.get("/:id", getBookingById);

module.exports = router;
