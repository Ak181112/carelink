const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { uploadProfile } = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

/* ============================================================
   REGISTER
============================================================ */

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage(
        "Password must be at least 6 characters"
      ),

    body("role")
      .optional()
      .isIn(["family_member", "caretaker"])
      .withMessage("Invalid role"),
  ],
  validate,
  register
);

/* ============================================================
   LOGIN
============================================================ */

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  login
);

/* ============================================================
   VERIFY EMAIL
============================================================ */

router.get(
  "/verify-email/:token",
  verifyEmail
);

/* ============================================================
   GET CURRENT USER
============================================================ */

router.get(
  "/me",
  protect,
  getMe
);

/* ============================================================
   UPDATE CURRENT USER PROFILE
   Supports:
   - name
   - email
   - phone
   - profilePhoto
============================================================ */

router.put(
  "/me",
  protect,
  uploadProfile.single("profilePhoto"),
  updateMe
);

/* ============================================================
   FORGOT PASSWORD
============================================================ */

router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required"),
  ],
  validate,
  forgotPassword
);

/* ============================================================
   RESET PASSWORD
============================================================ */

router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage(
        "Password must be at least 6 characters"
      ),
  ],
  validate,
  resetPassword
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;