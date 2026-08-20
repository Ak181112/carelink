const crypto = require("crypto");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const ParentProfile = require("../models/ParentProfile");
const Notification = require("../models/Notification");
const {
  CURRENCY,
  SANDBOX,
  STATUS,
  isPayHereConfigured,
  isRefundConfigured,
  buildCheckoutFields,
  verifyNotification,
  refundPayment: payhereRefund,
} = require("../services/payhereService");

const clientUrl = () => process.env.CLIENT_URL || "http://localhost:3000";

/**
 * PayHere calls this from its own servers, so it must be a public URL.
 * Locally that means a tunnel (ngrok); PAYHERE_NOTIFY_URL overrides it.
 */
const notifyUrl = () =>
  process.env.PAYHERE_NOTIFY_URL ||
  `${process.env.SERVER_URL || "http://localhost:5000"}/api/payments/notify`;

// A short, unique, human-quotable reference. PayHere caps order_id length.
const buildOrderId = (bookingId) =>
  `CL-${String(bookingId).slice(-8)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

// GET /api/payments/config  (any signed-in user)
// Lets the UI hide card payments entirely when the server has no credentials.
const getPaymentConfig = async (req, res) => {
  res.json({
    success: true,
    provider: "payhere",
    payhereEnabled: isPayHereConfigured(),
    refundsEnabled: isRefundConfigured(),
    sandbox: SANDBOX,
    currency: CURRENCY,
  });
};

// POST /api/payments/checkout/:bookingId  (family_member)
// Returns the signed field set for the browser to POST to PayHere.
const createCheckout = async (req, res, next) => {
  try {
    if (!isPayHereConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Card payments are not enabled on this server. Please pay in cash.",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      parentId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid",
      });
    }

    // there is nothing to charge for until the caretaker has actually turned up
    if (!["in_progress", "completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "You can pay once the hospital visit has started",
      });
    }

    const parentProfile = await ParentProfile.findById(booking.parentProfileId);
    const orderId = buildOrderId(booking._id);

    const { action, fields } = buildCheckoutFields({
      orderId,
      amount: booking.totalCost,
      booking,
      user: req.user,
      parentProfile,
      urls: {
        returnUrl: `${clientUrl()}/client/bookings?payment=success`,
        cancelUrl: `${clientUrl()}/client/bookings?payment=cancelled`,
        notifyUrl: notifyUrl(),
      },
    });

    // Recorded before the redirect so an abandoned checkout is still visible
    await Payment.create({
      bookingId: booking._id,
      payerId: req.user.id,
      orderId,
      amount: booking.totalCost,
      currency: CURRENCY,
      provider: "payhere",
      status: "pending",
    });

    res.json({ success: true, action, fields });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/notify  (public — called by PayHere, authenticated by md5sig)
 *
 * PayHere posts application/x-www-form-urlencoded and expects a 200 back. It
 * retries on failure, so this handler must be safe to run twice.
 */
const handleNotification = async (req, res) => {
  if (!verifyNotification(req.body)) {
    console.error("PayHere notify rejected: signature mismatch", {
      order_id: req.body?.order_id,
    });
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const {
    order_id: orderId,
    payment_id: paymentId,
    status_code: statusCode,
    payhere_amount: amount,
    method,
    status_message: statusMessage,
    card_holder_name: cardHolderName,
    card_no: cardNo,
  } = req.body;

  try {
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      console.error("PayHere notify for an unknown order:", orderId);
      // 200 so PayHere stops retrying something we can never reconcile
      return res.json({ received: true });
    }

    // PayHere retries, so a settled payment must not be reprocessed
    if (["paid", "refunded"].includes(payment.status)) {
      return res.json({ received: true });
    }

    payment.payherePaymentId = paymentId ?? null;
    payment.payhereStatusCode = String(statusCode);
    payment.paymentMethod = method ?? null;
    payment.cardHolderName = cardHolderName ?? null;
    payment.cardMaskedNumber = cardNo ?? null;
    payment.statusMessage = statusMessage || "";

    if (String(statusCode) === STATUS.SUCCESS) {
      payment.status = "paid";
      payment.paidAt = new Date();

      // guard against a tampered amount even though the signature matched
      if (Number(amount) !== Number(payment.amount)) {
        payment.status = "failed";
        payment.statusMessage = `Amount mismatch: expected ${payment.amount}, received ${amount}`;
      }
    } else if (String(statusCode) === STATUS.CANCELED) {
      payment.status = "cancelled";
    } else if (String(statusCode) === STATUS.CHARGEDBACK) {
      payment.status = "chargedback";
    } else if (String(statusCode) === STATUS.PENDING) {
      payment.status = "pending";
    } else {
      payment.status = "failed";
    }

    await payment.save();

    if (payment.status === "paid") {
      const booking = await Booking.findById(payment.bookingId);

      if (booking) {
        booking.paymentStatus = "paid";
        booking.paymentMethod = "card";
        await booking.save();

        await Notification.create({
          userId: booking.parentId,
          title: "Payment Received",
          message: `Your payment of LKR ${payment.amount} for the visit to ${booking.hospitalLocation.hospitalName} was successful.`,
          type: "booking",
        });

        await Notification.create({
          userId: booking.caretakerId,
          title: "Booking Paid",
          message: "The client has paid for your completed hospital visit.",
          type: "booking",
        });
      }
    }

    if (payment.status === "chargedback") {
      await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: "pending" });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("PayHere notify handling failed:", error.message);
    res.status(500).json({ success: false, message: "Notification handling failed" });
  }
};

// GET /api/payments/my  (family_member)
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ payerId: req.user.id })
      .populate({
        path: "bookingId",
        select: "hospitalLocation bookingDate bookingTime totalCost status",
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments  (admin)
const getAllPayments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const payments = await Payment.find(filter)
      .populate("payerId", "name email")
      .populate({
        path: "bookingId",
        select: "hospitalLocation bookingDate bookingTime totalCost status caretakerId",
        populate: { path: "caretakerId", select: "name" },
      })
      .sort({ createdAt: -1 });

    const sumBy = async (status) => {
      const [row] = await Payment.aggregate([
        { $match: { status } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return row?.total ?? 0;
    };

    res.json({
      success: true,
      payments,
      totals: {
        currency: CURRENCY,
        collected: await sumBy("paid"),
        refunded: await sumBy("refunded"),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/:id/refund  (admin)
const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: `Only a paid payment can be refunded (this one is ${payment.status})`,
      });
    }

    if (payment.provider === "payhere") {
      if (!isRefundConfigured()) {
        return res.status(503).json({
          success: false,
          message:
            "PayHere refunds need a Business App. Add PAYHERE_APP_ID and PAYHERE_APP_SECRET, or refund from the PayHere dashboard.",
        });
      }

      if (!payment.payherePaymentId) {
        return res.status(400).json({
          success: false,
          message: "This payment has no PayHere reference to refund against",
        });
      }

      // A refusal from PayHere is an upstream decision, not a crash here, so it
      // surfaces as 502 with their reason rather than a generic 500.
      try {
        await payhereRefund(payment.payherePaymentId, req.body.reason);
      } catch (gatewayError) {
        return res.status(502).json({
          success: false,
          message: `PayHere refused the refund: ${gatewayError.message}`,
        });
      }
    }

    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.statusMessage = (req.body.reason || "").trim();
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: "refunded" });

    await Notification.create({
      userId: payment.payerId,
      title: "Payment Refunded",
      message: "Your payment has been refunded. It may take a few days to appear.",
      type: "booking",
    });

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentConfig,
  createCheckout,
  handleNotification,
  getMyPayments,
  getAllPayments,
  refundPayment,
};
