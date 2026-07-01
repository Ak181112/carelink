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
router.delete("/users/:id", deleteUser);

//application status (OCR)
router.get("/applications", getAllApplications);

// approve / reject (OCR + profile sync handled in controller)
router.put("/applications/:id/approve", approveApplication);
router.put("/applications/:id/reject", rejectApplication);

//notifications
router.get("/notifications", getAllNotifications);

module.exports = router;