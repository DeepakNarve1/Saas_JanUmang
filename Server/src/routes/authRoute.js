const express = require("express");
const {
  registerUser,
  loginUser,
  googleLogin,
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  updateUserProfile,
  deleteUser,
  logoutUser,
  changePassword,
  resetUserPassword,
  sanitizeUserLevels,
  refreshToken,
  generateMfaSecret,
  verifyMfaSetup,
  verifyMfaLogin,
  disableMfa,
} = require("../controller/authController");
const {
  forgotPassword,
  resetPasswordViaToken,
} = require("../controller/forgotPasswordController");
const {
  sendVerificationEmail,
  verifyEmail,
} = require("../controller/emailVerificationController");
const protect = require("../middleware/authMiddleware");
const {
  checkPermission,
  checkAnyPermission,
} = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  googleLoginLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// ─── Public auth endpoints (rate-limited) ─────────────────────────────────
router.post("/login", loginLimiter, loginUser);
router.post("/google-login", googleLoginLimiter, googleLogin);
router.post("/refresh-token", refreshToken); // no auth required — it reads the HttpOnly cookie

// ─── Forgot Password (public, rate-limited) ────────────────────────────────
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", resetPasswordViaToken);

// ─── Email Verification ────────────────────────────────────────────────────
router.get("/verify-email/:token", verifyEmail); // Public — called from email link
router.post("/send-verification-email", protect, sendVerificationEmail); // Protected

// ─── Authenticated endpoints ───────────────────────────────────────────────
router.post("/register", protect, registerLimiter, registerUser);
router.post("/logout", protect, logoutUser);
router.post("/change-password", protect, changePassword);
router.put("/profile", protect, updateUserProfile);

// ─── MFA Endpoints ─────────────────────────────────────────────────────────
router.post("/mfa/verify-login", loginLimiter, verifyMfaLogin); // Public (requires tempToken)
router.post("/mfa/generate", protect, generateMfaSecret); 
router.post("/mfa/verify-setup", protect, verifyMfaSetup);
router.post("/mfa/disable", protect, disableMfa);

// ─── Current user ──────────────────────────────────────────────────────────
router.get("/me", protect, getCurrentUser);

// ─── User management (permission-gated + tenant-scoped) ───────────────────
router.get(
  "/users",
  protect,
  checkAnyPermission(["view_users", "view_user_count"]),
  scopeQuery(),
  getUsers,
);
router.get(
  "/users/:id",
  protect,
  checkPermission("view_users"),
  scopeQuery(),
  getUserById,
);
router.put(
  "/users/:id",
  protect,
  checkPermission("edit_users"),
  scopeQuery(),
  updateUser,
);
router.delete(
  "/users/:id",
  protect,
  checkPermission("delete_users"),
  scopeQuery(),
  deleteUser,
);

// ─── Admin password reset (rate-limited, admin only) ──────────────────────
router.post(
  "/users/:userId/reset-password",
  protect,
  passwordResetLimiter,
  resetUserPassword,
);

// ─── Platform maintenance (global admin only) ─────────────────────────────
router.get("/admin/sanitize-user-levels", protect, sanitizeUserLevels);

module.exports = router;
