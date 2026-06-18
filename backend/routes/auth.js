const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { register, verifyEmail, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["family_member", "caretaker"]).withMessage("Invalid role"),
], validate, register);

router.post("/login", [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
], validate, login);

router.get("/verify-email/:token", verifyEmail);
router.get("/me", protect, getMe);

router.post("/forgot-password", [
  body("email").isEmail().withMessage("Valid email is required"),
], validate, forgotPassword);

router.post("/reset-password/:token", [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
], validate, resetPassword);

module.exports = router;
