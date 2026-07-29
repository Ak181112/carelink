const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

// Every endpoint that returns the logged-in user must return the same shape,
// otherwise the client's stored user changes fields depending on which call
// last wrote it (login gave `id`, a plain document would give `_id`).
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive,
});

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

    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.error("Email send error:", emailErr.message);
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

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: "Please verify your email before logging in" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact CareLink+ support.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

// Only name and phone are editable here: changing the email would invalidate
// the verified-email state, and the role is set at registration.
const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const genericMessage = "If an account exists for that email, a password reset link has been sent.";

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Email send error:", emailErr.message);
    }

    res.json({ success: true, message: genericMessage });
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

module.exports = { register, verifyEmail, login, getMe, updateMe, forgotPassword, resetPassword };
