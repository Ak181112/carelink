const express = require("express");
const router = express.Router();

const {
  getPaymentConfig,
  createCheckout,
  getMyPayments,
  getAllPayments,
  refundPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// NOTE: /api/payments/notify is NOT mounted here. PayHere calls it from its own
// servers with no bearer token, so app.js registers it as a public route above
// this router's `protect` guard. It authenticates itself with an MD5 signature.

router.use(protect);

router.get("/config", getPaymentConfig);

// client
router.post("/checkout/:bookingId", authorize("family_member"), createCheckout);
router.get("/my", authorize("family_member"), getMyPayments);

// admin
router.get("/", authorize("admin"), getAllPayments);
router.post("/:id/refund", authorize("admin"), refundPayment);

module.exports = router;
