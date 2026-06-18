const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const allowedRoles = ["family_member", "caretaker"];
    const userRole = allowedRoles.includes(role) ? role : "family_member";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = new User({ name, email, password, phone, role: userRole });

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
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: "Please verify your email before logging in" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
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
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email" });
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      res.json({ success: true, message: "Password reset email sent" });
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, login, getMe, forgotPassword, resetPassword };
