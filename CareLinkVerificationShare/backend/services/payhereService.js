const crypto = require("crypto");

/**
 * PayHere integration (https://support.payhere.lk/api-&-mobile-sdk/checkout-api).
 *
 * PayHere has no server SDK: checkout is a signed HTML form POST from the
 * browser, and the result comes back as a server-to-server "notify" POST that
 * we authenticate with an MD5 signature. Only Node built-ins are needed.
 *
 * Like the rest of CareLink+, payments are optional: without credentials the
 * app still runs and bookings are settled in cash.
 */

const SANDBOX = String(process.env.PAYHERE_SANDBOX ?? "true") !== "false";

const CHECKOUT_URL = SANDBOX
  ? "https://sandbox.payhere.lk/pay/checkout"
  : "https://www.payhere.lk/pay/checkout";

const API_BASE = SANDBOX
  ? "https://sandbox.payhere.lk/merchant/v1"
  : "https://www.payhere.lk/merchant/v1";

const CURRENCY = (process.env.PAYHERE_CURRENCY || "LKR").toUpperCase();

// PayHere status_code values on the notify callback
const STATUS = {
  SUCCESS: "2",
  PENDING: "0",
  CANCELED: "-1",
  FAILED: "-2",
  CHARGEDBACK: "-3",
};

const isPayHereConfigured = () =>
  Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET);

// refunds go through a separate PayHere "Business App", not the merchant secret
const isRefundConfigured = () =>
  Boolean(process.env.PAYHERE_APP_ID && process.env.PAYHERE_APP_SECRET);

const md5 = (value) => crypto.createHash("md5").update(value).digest("hex");
const upperMd5 = (value) => md5(value).toUpperCase();

/** PayHere signs the amount exactly as it appears in the form: "8012.00". */
const formatAmount = (amount) =>
  Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

const hashedSecret = () => upperMd5(process.env.PAYHERE_MERCHANT_SECRET);

/**
 * Builds the signed field set the browser posts to PayHere.
 * `orderId` is echoed back on the notify callback, so it is how a payment is
 * matched to a booking.
 */
const buildCheckoutFields = ({ orderId, amount, booking, user, parentProfile, urls }) => {
  if (!isPayHereConfigured()) {
    throw new Error("PayHere is not configured on this server");
  }

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const formattedAmount = formatAmount(amount);

  const hash = upperMd5(merchantId + orderId + formattedAmount + CURRENCY + hashedSecret());

  const [firstName, ...restOfName] = (user.name || "Customer").trim().split(/\s+/);

  return {
    action: CHECKOUT_URL,
    fields: {
      merchant_id: merchantId,
      return_url: urls.returnUrl,
      cancel_url: urls.cancelUrl,
      notify_url: urls.notifyUrl,

      order_id: orderId,
      items: `Hospital visit — ${booking.hospitalLocation.hospitalName}`,
      currency: CURRENCY,
      amount: formattedAmount,

      first_name: firstName || "Customer",
      last_name: restOfName.join(" ") || "-",
      email: user.email,
      phone: user.phone || parentProfile?.contactNumber || "0000000000",
      address: booking.pickupLocation.address,
      // CareLink+ only operates in the Kurunegala district
      city: "Kurunegala",
      country: "Sri Lanka",

      hash,
    },
  };
};

/**
 * Authenticates a notify callback. PayHere signs the fields it sends with the
 * merchant secret, so an unsigned or tampered POST is rejected here.
 */
const verifyNotification = (body = {}) => {
  if (!isPayHereConfigured()) return false;

  const {
    merchant_id: merchantId,
    order_id: orderId,
    payhere_amount: amount,
    payhere_currency: currency,
    status_code: statusCode,
    md5sig: signature,
  } = body;

  if (!merchantId || !orderId || !amount || !currency || !statusCode || !signature) {
    return false;
  }

  if (merchantId !== process.env.PAYHERE_MERCHANT_ID) return false;

  const expected = upperMd5(
    merchantId + orderId + amount + currency + statusCode + hashedSecret()
  );

  // timing-safe compare on equal-length hex strings
  const a = Buffer.from(String(signature).toUpperCase());
  const b = Buffer.from(expected);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** OAuth client-credentials token for the PayHere Business App (refunds only). */
const getApiToken = async () => {
  if (!isRefundConfigured()) {
    throw new Error("PayHere refund credentials (PAYHERE_APP_ID / PAYHERE_APP_SECRET) are not configured");
  }

  const basic = Buffer.from(
    `${process.env.PAYHERE_APP_ID}:${process.env.PAYHERE_APP_SECRET}`
  ).toString("base64");

  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "PayHere authentication failed");
  }

  return data.access_token;
};

const refundPayment = async (paymentId, description) => {
  const token = await getApiToken();

  const res = await fetch(`${API_BASE}/payment/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_id: String(paymentId),
      description: description || "Refunded by CareLink+ admin",
    }),
  });

  const data = await res.json();

  // PayHere replies with status 1 on success, -1 with a msg on failure
  if (!res.ok || data.status !== 1) {
    throw new Error(data.msg || "PayHere refund failed");
  }

  return data;
};

module.exports = {
  SANDBOX,
  CURRENCY,
  CHECKOUT_URL,
  STATUS,
  isPayHereConfigured,
  isRefundConfigured,
  formatAmount,
  buildCheckoutFields,
  verifyNotification,
  refundPayment,
};
