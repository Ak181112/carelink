function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY)
    throw new Error("STRIPE_SECRET_KEY is not configured");
  let Stripe;
  try {
    Stripe = require("stripe");
  } catch (_) {
    throw new Error(
      "Stripe dependency is not installed. Run npm install stripe",
    );
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function amountToMinor(amount, currency = "lkr") {
  const zeroDecimal = new Set([
    "bif",
    "clp",
    "djf",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ]);
  return zeroDecimal.has(currency.toLowerCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
}

async function createCheckoutSession({
  payment,
  clientEmail,
  successUrl,
  cancelUrl,
}) {
  const stripe = getStripe();
  const currency = (
    process.env.STRIPE_CURRENCY ||
    payment.currency ||
    "lkr"
  ).toLowerCase();
  const amount = amountToMinor(payment.amount, currency);
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: clientEmail,
    client_reference_id: String(payment.bookingId),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: `CareLink+ hospital visit ${payment.bookingId}`,
          },
        },
      },
    ],
    metadata: {
      bookingId: String(payment.bookingId),
      paymentId: String(payment._id),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

async function createConnectedAccount(user) {
  const stripe = getStripe();
  return stripe.accounts.create({
    type: "express",
    email: user.email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { userId: String(user._id) },
  });
}

async function createAccountLink(accountId, returnUrl, refreshUrl) {
  const stripe = getStripe();
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
}

async function createPayout(accountId, amount, currency) {
  const stripe = getStripe();
  const payload = {
    amount: amountToMinor(amount, currency),
    currency: currency.toLowerCase(),
  };
  return accountId
    ? stripe.payouts.create(payload, { stripeAccount: accountId })
    : stripe.payouts.create(payload);
}

async function getBalance(accountId = null) {
  const stripe = getStripe();
  return accountId
    ? stripe.balance.retrieve({ stripeAccount: accountId })
    : stripe.balance.retrieve();
}
async function getPaymentSettlement(paymentIntentId) {
  const stripe = getStripe();

  if (!paymentIntentId) {
    throw new Error("Stripe PaymentIntent ID is required");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge.balance_transaction"],
  });

  const charge = paymentIntent.latest_charge;

  if (!charge) {
    throw new Error(
      `No Stripe charge was found for PaymentIntent ${paymentIntentId}`,
    );
  }

  const balanceTransaction = charge.balance_transaction;

  if (!balanceTransaction) {
    throw new Error(
      `No Stripe balance transaction was found for charge ${charge.id}`,
    );
  }

  return {
    paymentIntentId: paymentIntent.id,

    chargeId: charge.id,

    balanceTransactionId: balanceTransaction.id,

    paymentAmountMinor: Number(
      paymentIntent.amount_received || paymentIntent.amount || 0,
    ),

    paymentCurrency: String(paymentIntent.currency || "").toLowerCase(),

    settledAmountMinor: Number(balanceTransaction.amount || 0),

    settledCurrency: String(balanceTransaction.currency || "").toLowerCase(),

    feeMinor: Number(balanceTransaction.fee || 0),

    netMinor: Number(balanceTransaction.net || 0),

    exchangeRate:
      balanceTransaction.exchange_rate != null
        ? Number(balanceTransaction.exchange_rate)
        : null,

    balanceStatus: balanceTransaction.status || null,
  };
}

module.exports = {
  getStripe,
  createCheckoutSession,
  createConnectedAccount,
  createAccountLink,
  createPayout,
  getBalance,
  getPaymentSettlement,
  amountToMinor,
};
