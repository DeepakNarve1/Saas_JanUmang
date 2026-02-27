/**
 * emailVerificationController.js
 *
 * Handles email verification after user signup:
 *
 * 1. POST /api/auth/send-verification-email
 *    - Protected route (requires login)
 *    - Generates a verification token and sends the link via email
 *    - Can be called again to resend if expired
 *
 * 2. GET /api/auth/verify-email/:token
 *    - Public route — accessed from the email link
 *    - Validates token and marks user as email-verified
 *
 * The token is stored as a SHA-256 hash in the DB.
 * The raw token lives only in the email link.
 */

const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const { sendEmailVerification } = require("../services/emailService");

// ── POST /api/auth/send-verification-email ────────────────────────────────────
exports.sendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "+emailVerificationToken +emailVerificationExpires",
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isEmailVerified) {
    return res.json({
      success: true,
      message: "Your email address is already verified.",
    });
  }

  // Rate-limit resends: don't allow a new token if current one hasn't expired yet
  if (
    user.emailVerificationExpires &&
    user.emailVerificationExpires > Date.now()
  ) {
    const minutesLeft = Math.ceil(
      (user.emailVerificationExpires - Date.now()) / 60000,
    );
    return res.status(429).json({
      success: false,
      message: `A verification email was already sent. Please wait ${minutesLeft} minute(s) before requesting another.`,
    });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmailVerification({
      to: user.email,
      name: user.name,
      verificationToken: rawToken,
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Failed to send verification email. Please try again later.",
        500,
      ),
    );
  }

  res.json({
    success: true,
    message: "Verification email sent. Please check your inbox.",
  });
});

// ── GET /api/auth/verify-email/:token ─────────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Verification link is invalid or has expired.", 400),
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Email verified successfully! You now have full access.",
  });
});
