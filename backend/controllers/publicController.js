const Booking = require("../models/Booking");
const CaretakerProfile = require("../models/CaretakerProfile");
const Feedback = require("../models/Feedback");

/* ============================================================
   PUBLIC STATISTICS
============================================================ */

const getStatistics = async (req, res, next) => {
  try {
    /* --------------------------------------------------------
       VERIFIED CARETAKERS
       Current approved + verified caretaker profiles
    --------------------------------------------------------- */
    const verifiedCaretakers =
      await CaretakerProfile.countDocuments({
        applicationStatus: "approved",
        isVerified: true,
      });

    /* --------------------------------------------------------
       FAMILIES HELPED
       Count unique family members who have completed and
       successfully paid for at least one service.

       A client with multiple completed bookings is counted
       only once.
    --------------------------------------------------------- */
    const familiesHelpedResult =
      await Booking.aggregate([
        {
          $match: {
            status: {
              $in: ["paid", "closed"],
            },
            clientId: {
              $ne: null,
            },
          },
        },
        {
          $group: {
            _id: "$clientId",
          },
        },
        {
          $count: "count",
        },
      ]);

    const familiesHelped =
      familiesHelpedResult[0]?.count || 0;

    /* --------------------------------------------------------
       AVERAGE RATING
       Calculate from actual submitted feedback records.
    --------------------------------------------------------- */
    const ratingResult =
      await Feedback.aggregate([
        {
          $group: {
            _id: null,
            averageRating: {
              $avg: "$rating",
            },
          },
        },
      ]);

    const averageRating = Number(
      (ratingResult[0]?.averageRating || 0).toFixed(1)
    );

    /* --------------------------------------------------------
       RESPONSE
    --------------------------------------------------------- */
    return res.json({
      success: true,
      statistics: {
        familiesHelped,
        verifiedCaretakers,
        averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics,
};