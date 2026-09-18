const express = require("express");

const { protect, authorize } = require("../middleware/auth");

const c = require("../controllers/paymentController");

const router = express.Router();

router.post("/webhook", c.webhook);

router.use(protect);

router.post(
  "/checkout",
  authorize("family_member"),
  c.createCheckout
);

router.get(
  "/session/:sessionId",
  authorize("family_member"),
  c.confirmCheckoutSession
);

/* ============================================================
   ADMIN PAYMENT MANAGEMENT
============================================================ */

router.get(
  "/admin/summary",
  authorize("admin"),
  c.adminFinancialSummary
);

router.get(
  "/admin/balance",
  authorize("admin"),
  c.adminBalance
);

router.get(
  "/admin/withdrawals",
  authorize("admin"),
  c.adminWithdrawalHistory
);

router.post(
  "/admin/payout",
  authorize("admin"),
  c.adminPayout
);

/* ============================================================
   OTHER PAYMENT ROUTES
============================================================ */

router.get(
  "/:id",
  c.getPayment
);

router.post(
  "/connect/onboarding",
  authorize("caretaker"),
  c.connectOnboarding
);

router.get(
  "/connect/balance",
  authorize("caretaker"),
  c.caretakerBalance
);

router.post(
  "/connect/payout",
  authorize("caretaker"),
  c.caretakerPayout
);

module.exports = router;