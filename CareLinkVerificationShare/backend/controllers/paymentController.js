const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const User = require("../models/User");
const AdminWithdrawal = require("../models/AdminWithdrawal");

const {
  createCheckoutSession,
  createConnectedAccount,
  createAccountLink,
  createPayout,
  getBalance,
  getStripe,
} = require("../services/stripeService");
const { notify } = require("../services/notificationService");

async function createCheckout(req, res, next) {
  try {
    const payment = await Payment.findOne({
      _id: req.body.paymentId,
      clientId: req.user._id,
    });
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    const booking = await Booking.findById(payment.bookingId);
    if (
      !booking ||
      booking.status !== "payment_pending" ||
      !booking.clientCompletedAt ||
      !booking.caretakerCompletedAt
    )
      return res
        .status(400)
        .json({ success: false, message: "Payment is not yet available" });
    payment.status = "processing";
    await payment.save();
    const session = await createCheckoutSession({
      payment,
      clientEmail: req.user.email,
      successUrl: `${process.env.CLIENT_URL}/client/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}`,
      cancelUrl: `${process.env.CLIENT_URL}/client/payment-failed?booking_id=${booking._id}`,
    });
    payment.stripeCheckoutSessionId = session.id;
    await payment.save();
    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (e) {
    next(e);
  }
}

async function getPayment(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id).populate("bookingId");
    if (
      !payment ||
      (String(payment.clientId) !== String(req.user._id) &&
        String(payment.caretakerId) !== String(req.user._id) &&
        req.user.role !== "admin")
    )
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    res.json({ success: true, payment });
  } catch (e) {
    next(e);
  }
}

async function connectOnboarding(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.stripeConnectAccountId) {
      const account = await createConnectedAccount(user);
      user.stripeConnectAccountId = account.id;
      await user.save();
    }
    const link = await createAccountLink(
      user.stripeConnectAccountId,
      `${process.env.CLIENT_URL}/caretaker/settings?stripe=complete`,
      `${process.env.CLIENT_URL}/caretaker/settings?stripe=refresh`,
    );
    res.json({
      success: true,
      url: link.url,
      accountId: user.stripeConnectAccountId,
    });
  } catch (e) {
    next(e);
  }
}

async function caretakerPayout(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.stripeConnectAccountId)
      return res.status(400).json({
        success: false,
        message: "Complete Stripe Connect onboarding first",
      });
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid withdrawal amount" });
    const payout = await createPayout(
      user.stripeConnectAccountId,
      amount,
      process.env.STRIPE_CURRENCY || "lkr",
    );
    res.json({ success: true, payout });
  } catch (e) {
    next(e);
  }
}

async function caretakerBalance(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.stripeConnectAccountId)
      return res.json({ success: true, connected: false });
    const balance = await getBalance(user.stripeConnectAccountId);
    res.json({ success: true, connected: true, balance });
  } catch (e) {
    next(e);
  }
}

async function adminBalance(req, res, next) {
  try {
    const balance = await getBalance();
    res.json({ success: true, balance });
  } catch (e) {
    next(e);
  }
}

/* ============================================================
   ADMIN FINANCIAL SUMMARY
============================================================ */

async function adminFinancialSummary(req, res, next) {
  try {
    const currency = (process.env.STRIPE_CURRENCY || "lkr").toUpperCase();

    /*
     * Only successfully paid payments are included in
     * the financial summary.
     */
    const paidPayments = await Payment.find({
      status: "paid",
    }).select("bookingId amount currency status paidAt");

    let grossRevenue = 0;
    let caretakerEarnings = 0;
    let adminRevenue = 0;

    for (const payment of paidPayments) {
      const amount = Number(payment.amount || 0);

      if (!Number.isFinite(amount) || amount < 0) {
        continue;
      }

      grossRevenue += amount;

      /*
       * Use the booking's stored pricing values whenever
       * available. This preserves historical accounting even
       * if the platform fee percentage changes later.
       */
      const booking = await Booking.findById(payment.bookingId).select(
        "pricing",
      );

      if (booking?.pricing) {
        const adminFeeAmount = Number(booking.pricing.adminFeeAmount || 0);

        const caretakerAmount = Number((amount - adminFeeAmount).toFixed(2));

        adminRevenue += adminFeeAmount;
        caretakerEarnings += Math.max(caretakerAmount, 0);
      } else {
        /*
         * Fallback for older records where pricing
         * information is unavailable.
         */
        const adminFeePercent = 15;

        const adminFeeAmount = Number(
          (amount * (adminFeePercent / 100)).toFixed(2),
        );

        adminRevenue += adminFeeAmount;

        caretakerEarnings += Math.max(amount - adminFeeAmount, 0);
      }
    }

    grossRevenue = Number(grossRevenue.toFixed(2));

    caretakerEarnings = Number(caretakerEarnings.toFixed(2));

    adminRevenue = Number(adminRevenue.toFixed(2));

    /*
     * Get actual Stripe platform balance for
     * operational visibility.
     */
    let stripeBalance = null;

    try {
      stripeBalance = await getBalance();
    } catch (stripeError) {
      console.error(
        "Unable to retrieve Stripe platform balance:",
        stripeError.message,
      );
    }

    const availableStripeBalance = stripeBalance
      ? Number(
          (stripeBalance.available?.find(
            (item) => item.currency?.toLowerCase() === currency.toLowerCase(),
          )?.amount || 0) / 100,
        )
      : null;

    res.json({
      success: true,

      summary: {
        currency,

        grossRevenue,

        caretakerEarnings,

        adminFeePercent: 15,

        adminRevenue,

        withdrawnAmount: 0,

        availableAdminBalance: adminRevenue,

        stripeBalance: availableStripeBalance,
      },
    });
  } catch (error) {
    next(error);
  }
}
async function confirmCheckoutSession(req, res, next) {
  try {
    const payment = await Payment.findOne({
      stripeCheckoutSessionId: req.params.sessionId,
      clientId: req.user._id,
    });
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment session not found" });
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    );
    if (session.payment_status === "paid" && payment.status !== "paid") {
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.stripePaymentIntentId = session.payment_intent || null;
      payment.receiptNumber = `CL-${Date.now()}-${String(payment._id).slice(-6).toUpperCase()}`;
      await payment.save();
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.status = "paid";
        await booking.save();
      }
    }
    res.json({ success: true, payment, paymentStatus: session.payment_status });
  } catch (e) {
    next(e);
  }
}

async function webhook(req, res, next) {
  try {
    const signature = req.headers["stripe-signature"];
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const payment = await Payment.findOne({
        stripeCheckoutSessionId: session.id,
      });
      if (payment && payment.status !== "paid") {
        payment.status = "paid";
        payment.paidAt = new Date();
        payment.stripePaymentIntentId = session.payment_intent || null;
        payment.receiptNumber = `CL-${Date.now()}-${String(payment._id).slice(-6).toUpperCase()}`;
        await payment.save();
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.status = "paid";
          await booking.save();
          await notify(
            booking.clientId,
            "Payment Successful",
            "Your CareLink+ payment was received. You can now submit feedback.",
            "payment_success",
          );
        }
        await notify(
          payment.caretakerId,
          "Payment Received",
          "A completed CareLink+ service has been paid.",
          "payment_success",
        );
      }
    }
    res.json({ received: true });
  } catch (e) {
    res.status(400).send(`Webhook Error: ${e.message}`);
  }
}

// async function adminPayout(req, res, next) {
//   try {
//     const amount = Number(req.body.amount);
//     if (!amount || amount <= 0)
//       return res
//         .status(400)
//         .json({ success: false, message: "Enter a valid withdrawal amount" });
//     const payout = await createPayout(
//       null,
//       amount,
//       process.env.STRIPE_CURRENCY || "lkr",
//     );
//     res.json({ success: true, payout });
//   } catch (e) {
//     next(e);
//   }
// }

/* ============================================================
   ADMIN WITHDRAWAL
============================================================ */

async function adminPayout(req, res, next) {
  let withdrawal = null;

  try {
    const amount = Number(req.body.amount);

    const currency = (process.env.STRIPE_CURRENCY || "lkr").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid withdrawal amount",
      });
    }

    /*
     * ----------------------------------------------------------
     * Calculate current CareLink+ admin revenue
     * ----------------------------------------------------------
     */

    const paidPayments = await Payment.find({
      status: "paid",
    }).select("bookingId amount");

    let adminRevenue = 0;

    for (const payment of paidPayments) {
      const booking = await Booking.findById(payment.bookingId).select(
        "pricing",
      );

      if (!booking?.pricing) {
        continue;
      }

      adminRevenue += Number(booking.pricing.adminFeeAmount || 0);
    }

    adminRevenue = Number(adminRevenue.toFixed(2));

    /*
     * ----------------------------------------------------------
     * Calculate already completed/pending withdrawals
     * ----------------------------------------------------------
     *
     * We reserve requested/processing/pending withdrawals so
     * an administrator cannot submit overlapping withdrawals
     * against the same available balance.
     */

    const existingWithdrawals = await AdminWithdrawal.find({
      currency,
      status: {
        $in: ["requested", "processing", "pending", "completed"],
      },
    }).select("amount");

    const withdrawnOrReserved = existingWithdrawals.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0,
    );

    const availableAdminBalance = Number(
      (adminRevenue - withdrawnOrReserved).toFixed(2),
    );

    if (amount > availableAdminBalance) {
      return res.status(400).json({
        success: false,
        message: `Withdrawal amount exceeds the available CareLink+ admin balance of ${currency} ${availableAdminBalance.toFixed(2)}.`,
      });
    }

    /*
     * ----------------------------------------------------------
     * Create ledger record BEFORE contacting Stripe
     * ----------------------------------------------------------
     */

    withdrawal = await AdminWithdrawal.create({
      amount: Number(amount.toFixed(2)),

      currency,

      requestedBy: req.user._id,

      destinationType: "platform_default",

      status: "processing",
    });

    /*
     * ----------------------------------------------------------
     * Attempt Stripe payout
     * ----------------------------------------------------------
     */

    let payout;

    try {
      payout = await createPayout(null, amount, currency.toLowerCase());
    } catch (stripeError) {
      withdrawal.status = "failed";

      withdrawal.failureCode = stripeError.code || "";

      withdrawal.failureReason = stripeError.message || "Stripe payout failed";

      withdrawal.processedAt = new Date();

      await withdrawal.save();

      return res.status(400).json({
        success: false,

        message: stripeError.message || "Unable to create Stripe payout.",

        withdrawal: {
          id: withdrawal._id,

          status: withdrawal.status,

          amount: withdrawal.amount,

          currency: withdrawal.currency,
        },
      });
    }

    /*
     * ----------------------------------------------------------
     * Store Stripe payout result
     * ----------------------------------------------------------
     */

    withdrawal.stripePayoutId = payout.id || null;

    withdrawal.stripeBalanceTransactionId = payout.balance_transaction || null;

    withdrawal.destination = payout.destination || "";

    /*
     * Stripe normally returns a newly-created
     * payout with pending status initially.
     */

    if (payout.status === "paid") {
      withdrawal.status = "completed";

      withdrawal.completedAt = new Date();
    } else if (payout.status === "failed") {
      withdrawal.status = "failed";

      withdrawal.failureReason =
        payout.failure_message || "Stripe payout failed";
    } else {
      withdrawal.status = "pending";
    }

    withdrawal.processedAt = new Date();

    await withdrawal.save();

    return res.json({
      success: true,

      message:
        withdrawal.status === "pending"
          ? "Withdrawal created and is pending with Stripe."
          : "Admin withdrawal created successfully.",

      withdrawal,

      payout,
    });
  } catch (error) {
    /*
     * If a ledger record was created but an unexpected
     * application error occurs, keep the audit record.
     */

    if (withdrawal) {
      withdrawal.status = "failed";

      withdrawal.failureReason = error.message || "Unexpected withdrawal error";

      withdrawal.processedAt = new Date();

      try {
        await withdrawal.save();
      } catch (saveError) {
        console.error("Failed to update withdrawal ledger:", saveError.message);
      }
    }

    next(error);
  }
}

/* ============================================================
   ADMIN WITHDRAWAL HISTORY
============================================================ */

async function adminWithdrawalHistory(req, res, next) {
  try {
    const withdrawals = await AdminWithdrawal.find()
      .sort({
        createdAt: -1,
      })
      .limit(200)
      .populate({
        path: "requestedBy",
        select: "name email",
      });

    res.json({
      success: true,

      count: withdrawals.length,

      withdrawals,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCheckout,
  getPayment,
  confirmCheckoutSession,
  connectOnboarding,
  caretakerPayout,
  caretakerBalance,
  adminBalance,
  adminFinancialSummary,
  adminPayout,
  adminWithdrawalHistory,
  webhook,
};