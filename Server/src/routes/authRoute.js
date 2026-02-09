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
} = require("../controller/authController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.post("/change-password", protect, changePassword);
router.put("/profile", protect, updateUserProfile);
router.post("/google-login", googleLogin);

// users listing & management with permission checks and tenant scoping
router.get("/me", protect, getCurrentUser);
router.get(
  "/users",
  protect,
  checkPermission("view_users"),
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
router.put("/users/:id", protect, checkPermission("edit_users"), updateUser);
router.delete(
  "/users/:id",
  protect,
  checkPermission("delete_users"),
  deleteUser,
);

// Admin password reset (super admin only)
router.post("/users/:userId/reset-password", protect, resetUserPassword);

module.exports = router;
