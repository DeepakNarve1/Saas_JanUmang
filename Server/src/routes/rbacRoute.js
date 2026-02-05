const express = require("express");
const {
  getAllPermissions,
  createPermission,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getSidebarAccess,
  upsertSidebarAccess,
} = require("../controller/rbacController");
const protect = require("../middleware/authMiddleware");
const {
  checkPermission,
  checkAnyPermission,
} = require("../middleware/permissionMiddleware");

const router = express.Router();

// Permission routes
router.get(
  "/permissions",
  protect,
  checkAnyPermission(["view_roles", "create_roles", "edit_roles"]),
  getAllPermissions
);
router.post(
  "/permissions",
  protect,
  checkPermission("create_roles"), // Typically admin level, or separate manage_permissions if desired
  createPermission
);

// Role routes
router.get("/roles", protect, checkPermission("view_roles"), getAllRoles);
router.get("/roles/:id", protect, checkPermission("view_roles"), getRoleById);
router.post("/roles", protect, checkPermission("create_roles"), createRole);
router.put("/roles/:id", protect, checkPermission("edit_roles"), updateRole);
router.delete(
  "/roles/:id",
  protect,
  checkPermission("delete_roles"),
  deleteRole
);

// Sidebar RBAC routes
router.get("/sidebar-permissions", protect, getSidebarAccess);
router.put(
  "/sidebar-permissions",
  protect,
  checkPermission("manage_roles"),
  upsertSidebarAccess
);

module.exports = router;
