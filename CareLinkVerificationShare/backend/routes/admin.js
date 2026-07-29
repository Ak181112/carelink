const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllApplications,
  approveApplication,
  rejectApplication,
  getAllNotifications,
  getAllContactMessages,
  getAllReviews,
  getEmergencies,
  resolveEmergency,
  getReports,
  changeUserRole,
  getPlatformSettings,
  updatePlatformSettings,
} = require("../controllers/adminController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// admin auth
router.use(protect);
router.use(authorize("admin"));

// dashboard
router.get("/dashboard", getDashboardStats);

// users management
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);

//application status (OCR)
router.get("/applications", getAllApplications);

// approve / reject (OCR + profile sync handled in controller)
router.put("/applications/:id/approve", approveApplication);
router.put("/applications/:id/reject", rejectApplication);

//notifications
router.get("/notifications", getAllNotifications);

//contact messages
router.get("/contact-messages", getAllContactMessages);

// reviews left by clients, flattened across all caretaker profiles
router.get("/reviews", getAllReviews);

// emergency monitoring
router.get("/emergencies", getEmergencies);
router.put("/emergencies/:id/resolve", resolveEmergency);

// reports & analytics
router.get("/reports", getReports);

// platform settings (pricing, booking rules, feature switches)
router.get("/settings", getPlatformSettings);
router.put("/settings", updatePlatformSettings);

module.exports = router;