const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const CaretakerProfile = require("../models/CaretakerProfile");

async function createFeedback(req, res, next) {
  try {
    const {
      bookingId,
      rating,
      comment,
      wouldRecommend,
    } = req.body;

    /* ==========================================================
       BASIC VALIDATION
    ========================================================== */

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    /* ==========================================================
       VERIFY LEGITIMATE COMPLETED + PAID BOOKING

       Feedback is allowed only when:
       1. Booking exists
       2. Booking belongs to the logged-in client
       3. Booking has been paid
       4. Caretaker completed the service
       5. Client completed the service
    ========================================================== */

    const booking = await Booking.findOne({
      _id: bookingId,
      clientId: req.user._id,
      status: "paid",
      caretakerCompletedAt: { $ne: null },
      clientCompletedAt: { $ne: null },
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback is available only after the completed service has been successfully paid for.",
      });
    }

    /* ==========================================================
       PREVENT DUPLICATE FEEDBACK
    ========================================================== */

    const exists = await Feedback.findOne({
      bookingId: booking._id,
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Feedback already submitted",
      });
    }

    /* ==========================================================
       CREATE FEEDBACK
    ========================================================== */

    const feedback = await Feedback.create({
      bookingId: booking._id,
      clientId: booking.clientId,
      caretakerId: booking.caretakerId,
      rating: numericRating,
      comment:
        typeof comment === "string"
          ? comment.trim()
          : "",
      wouldRecommend:
        typeof wouldRecommend === "boolean"
          ? wouldRecommend
          : true,
    });

    /* ==========================================================
       UPDATE CARETAKER REVIEWS
    ========================================================== */

    const caretaker =
      await CaretakerProfile.findOne({
        userId: booking.caretakerId,
      });

    if (caretaker) {
      caretaker.reviews.push({
        clientId: req.user._id,
        clientName: req.user.name,
        rating: feedback.rating,
        comment: feedback.comment,
      });

      await caretaker.save();
    }

    /* ==========================================================
       CLOSE BOOKING
    ========================================================== */

    booking.status = "closed";

    await booking.save();

    /* ==========================================================
       RESPONSE
    ========================================================== */

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    /*
     * The unique bookingId index in Feedback.js provides
     * an additional database-level duplicate protection.
     */
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Feedback already submitted",
      });
    }

    next(error);
  }
}

async function listFeedback(req, res, next) {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate(
        "clientId",
        "name email"
      )
      .populate(
        "caretakerId",
        "name email"
      )
      .populate("bookingId");

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFeedback,
  listFeedback,
};