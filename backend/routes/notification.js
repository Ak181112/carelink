const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/auth");

// auth
router.use(protect);

//notification routes
router.get("/", getNotifications);

router.put("/read-all", markAllAsRead);

router.put("/read/:id", markAsRead);

router.delete("/:id", deleteNotification);

module.exports = router;