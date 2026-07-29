const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { submitMessage } = require("../controllers/contactController");
const validate = require("../middleware/validate");

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validate,
  submitMessage
);

module.exports = router;
