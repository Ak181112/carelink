const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");

const authRoutes = require("./routes/auth");
const parentRoutes = require("./routes/parent");
const caretakerRoutes = require("./routes/caretaker");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notification");
const contactRoutes = require("./routes/contact");
const bookingRoutes = require("./routes/booking");
const paymentRoutes = require("./routes/payment");
const { handleNotification } = require("./controllers/paymentController");

const app = express();

// -------------------------
// CORS
// -------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// -------------------------
// BODY PARSING
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// PAYHERE NOTIFY (public callback)
// -------------------------
// PayHere posts the payment result server-to-server as form-encoded data with
// no auth header, so it is registered outside the payment router's `protect`
// guard. The handler authenticates it by checking PayHere's MD5 signature.
app.post("/api/payments/notify", handleNotification);

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
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

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