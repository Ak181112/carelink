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

router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/applications", getAllApplications);
router.put("/applications/:id/approve", approveApplication);
router.put("/applications/:id/reject", rejectApplication);
router.get("/notifications", getAllNotifications);

module.exports = router;
