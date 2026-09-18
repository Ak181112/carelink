const crypto = require("crypto");

const User = require("../models/User");

const generateToken = require("../utils/generateToken");

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");

const {
  uploadLocalFile,
  removeLocalFile,
} = require("../services/cloudinaryService");

/* ============================================================
   REGISTER
============================================================ */

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const allowedRoles = ["family_member", "caretaker"];

    const userRole = allowedRoles.includes(role) ? role : "family_member";

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    let verificationToken;

    if (process.env.NODE_ENV === "development") {
      user.isEmailVerified = true;
    } else {
      verificationToken = user.getEmailVerificationToken();
    }

    await user.save();

    if (verificationToken) {
      try {
        await sendVerificationEmail(email, name, verificationToken);
      } catch (emailErr) {
        console.error("Email send error:", emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   VERIFY EMAIL
============================================================ */

const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   LOGIN
============================================================ */

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePhoto: user.profilePhoto || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   GET CURRENT USER
============================================================ */

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   UPDATE CURRENT USER PROFILE
============================================================ */

const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* --------------------------------------------------------
       Read existing values when fields are not provided
    --------------------------------------------------------- */

    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : user.name;

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : user.email;

    const phone =
      typeof req.body.phone === "string"
        ? req.body.phone.trim()
        : user.phone || "";

    /* --------------------------------------------------------
       Validate name
    --------------------------------------------------------- */

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    /* --------------------------------------------------------
       Validate email
    --------------------------------------------------------- */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    /* --------------------------------------------------------
       Check whether email belongs to another user
    --------------------------------------------------------- */

    if (email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: {
          $ne: user._id,
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered to another account",
        });
      }
    }

    /* --------------------------------------------------------
       Update basic information
    --------------------------------------------------------- */

    user.name = name;
    user.email = email;
    user.phone = phone;

    /* --------------------------------------------------------
       Profile image
    --------------------------------------------------------- */

    if (req.file) {
      try {
        const cloudUrl = await uploadLocalFile(req.file.path, {
          folder: "carelink-plus/profiles",
          resourceType: "image",
        });

        if (cloudUrl) {
          user.profilePhoto = cloudUrl;
        } else {
          user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
        }
      } finally {
        /*
         * Always remove the temporary
         * uploaded file after attempting
         * the Cloudinary upload.
         */
        removeLocalFile(req.file.path);
      }
    }

    /* --------------------------------------------------------
       Save
    --------------------------------------------------------- */

    await user.save();

    /* --------------------------------------------------------
       Return updated user
    --------------------------------------------------------- */

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePhoto: user.profilePhoto || null,
      },
    });
  } catch (error) {
    /*
     * Remove temporary file if the
     * request fails before cleanup.
     */
    if (req.file?.path) {
      try {
        removeLocalFile(req.file.path);
      } catch (cleanupError) {
        console.error(
          "Temporary profile image cleanup error:",
          cleanupError.message,
        );
      }
    }

    next(error);
  }
};

/* ============================================================
   FORGOT PASSWORD
============================================================ */

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email",
      });
    }

    const resetToken = user.getPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);

      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (emailErr) {
      user.passwordResetToken = undefined;

      user.passwordResetExpire = undefined;

      await user.save({
        validateBeforeSave: false,
      });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   RESET PASSWORD
============================================================ */

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = req.body.password;

    user.passwordResetToken = undefined;

    user.passwordResetExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================
   CHANGE PASSWORD
============================================================ */

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    /* --------------------------------------------------------
       VALIDATION
    --------------------------------------------------------- */

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    /* --------------------------------------------------------
       GET AUTHENTICATED USER WITH PASSWORD
    --------------------------------------------------------- */

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* --------------------------------------------------------
       VERIFY CURRENT PASSWORD
    --------------------------------------------------------- */

    const isCurrentPasswordValid = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    /* --------------------------------------------------------
       UPDATE PASSWORD
       User model pre-save hook hashes it automatically.
    --------------------------------------------------------- */

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  register,
  verifyEmail,
  login,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
