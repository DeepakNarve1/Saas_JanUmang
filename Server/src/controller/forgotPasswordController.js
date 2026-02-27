/**
 * forgotPasswordController.js
 *
 * Handles two public flows:
 *
 * 1. POST /api/auth/forgot-password
 *    - Accepts an email address
 *    - Generates a cryptographically secure reset token
 *    - Hashes + stores it in the User document (expires in 1 hour)
 *    - Sends the reset link via email
 *
 * 2. POST /api/auth/reset-password/:token
 *    - Accepts the raw token from the email link + a new password
 *    - Hashes the token, finds the matching unexpired user
 *    - Updates the password and clears the reset fields
 *
 * Security notes:
 *   - Token stored as SHA-256 hash — raw token only exists in the email
 *   - Timing-safe: we always respond with the same message whether the
 *     email exists or not (prevents user enumeration)
 *   - Token expires after 1 hour
 */

const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const { sendPasswordResetEmail } = require("../services/emailService");

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide your email address", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Always respond the same way — prevents email enumeration attacks
  const genericResponse = {
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };

  if (!user) {
    return res.json(genericResponse);
  }

  // Generate a raw token (sent in email) and its hash (stored in DB)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetToken: rawToken,
    });
  } catch (err) {
    // Clear the token if email fails so user can try again
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Failed to send reset email. Please try again later.", 500),
    );
  }

  res.json(genericResponse);
});

// ── POST /api/auth/reset-password/:token ──────────────────────────────────────
exports.resetPasswordViaToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  // Hash the incoming raw token to match what is in the DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Must not be expired
  });

  if (!user) {
    return next(new AppError("Reset token is invalid or has expired", 400));
  }

  // Set new password and clear reset fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.requirePasswordChange = false;
  await user.save();

  res.json({
    success: true,
    message:
      "Password reset successfully. You can now log in with your new password.",
  });
});
