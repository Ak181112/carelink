const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    /* ============================================================
       BASIC USER INFORMATION
    ============================================================ */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    /* ============================================================
       ROLE
    ============================================================ */

    role: {
      type: String,
      enum: [
        "family_member",
        "caretaker",
        "admin",
      ],
      default: "family_member",
    },

    /* ============================================================
       CONTACT
    ============================================================ */

    phone: {
      type: String,
      trim: true,
    },

    /* ============================================================
       PROFILE PHOTO
       Used by Client / Caretaker / Admin profile pages.
       Stores Cloudinary URL in production.
    ============================================================ */

    profilePhoto: {
      type: String,
      default: null,
      trim: true,
    },

    /* ============================================================
       EMAIL VERIFICATION
    ============================================================ */

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    /* ============================================================
       PASSWORD RESET
    ============================================================ */

    passwordResetToken: String,
    passwordResetExpire: Date,

    /* ============================================================
       ACCOUNT STATUS
    ============================================================ */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ============================================================
       STRIPE CONNECT
       Used for caretaker payout/withdrawal functionality.
    ============================================================ */

    stripeConnectAccountId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   PASSWORD HASHING
   ================================================================ */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

/* ================================================================
   PASSWORD COMPARISON
   ================================================================ */

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

/* ================================================================
   EMAIL VERIFICATION TOKEN
   ================================================================ */

userSchema.methods.getEmailVerificationToken =
  function () {
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    this.emailVerificationExpire =
      Date.now() +
      24 * 60 * 60 * 1000;

    return token;
  };

/* ================================================================
   PASSWORD RESET TOKEN
   ================================================================ */

userSchema.methods.getPasswordResetToken =
  function () {
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    this.passwordResetExpire =
      Date.now() +
      60 * 60 * 1000;

    return token;
  };

/* ================================================================
   EXPORT MODEL
   ================================================================ */

module.exports = mongoose.model(
  "User",
  userSchema
);