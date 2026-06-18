const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/error");

const authRoutes = require("./routes/auth");
const parentRoutes = require("./routes/parent");
const caretakerRoutes = require("./routes/caretaker");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notification");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/caretaker", caretakerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CareLink+ API is running" });
});

app.use(errorHandler);

module.exports = app;
