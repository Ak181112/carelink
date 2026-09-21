const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");

const authRoutes = require("./routes/auth");
const parentRoutes = require("./routes/parent");
const caretakerRoutes = require("./routes/caretaker");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notification");
const bookingRoutes = require("./routes/booking");
const paymentRoutes = require("./routes/payment");
const feedbackRoutes = require("./routes/feedback");
const contactRoutes = require("./routes/contact");
const settingsRoutes = require("./routes/settings");
const recommendationRoutes = require("./routes/recommendation");
const emergencyRoutes = require("./routes/emergency");
const publicRoutes = require("./routes/public");

const app = express();

// -------------------------
// CORS
// -------------------------
const configuredClientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
const allowedClientOrigins = new Set([
  configuredClientUrl,
  "https://carelinkplus.me",
  "https://www.carelinkplus.me",
  "http://localhost:3000",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedClientOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  })
);

// Stripe webhook must receive the raw body before JSON parsing.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// -------------------------
// BODY PARSING
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// STATIC FILES (UPLOADS)
// -------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// ROUTES
// -------------------------
app.use("/api/auth", authRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/caretaker", caretakerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/public", publicRoutes);

// -------------------------
// HEALTH CHECK
// -------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "CareLink+ API is running",
  });
});

// -------------------------
// 404 HANDLER (IMPORTANT)
// -------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------------
// ERROR HANDLER
// -------------------------
app.use(errorHandler);

module.exports = app;