const express = require("express");
const {
  getAllPermissions,
  getAvailablePermissions,
  createPermission,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  fixRoleIndex,
  debugRoles,
} = require("../controller/rbacController");
const protect = require("../middleware/authMiddleware");
const {
  checkPermission,
  checkAnyPermission,
} = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const router = express.Router();

// Permission routes
// router.get(
//   "/permissions",
//   protect,
//   checkAnyPermission(["view_roles", "create_roles", "edit_roles"]),
//   getAllPermissions,
// );

// Get available permissions (filtered by tenant's enabled modules)
router.get(
  "/permissions/available",
  protect,
  checkAnyPermission(["view_roles", "create_roles", "edit_roles"]),
  getAvailablePermissions,
);

router.post(
  "/permissions",
  protect,
  checkPermission("create_roles"), // Typically admin level, or separate manage_permissions if desired
  createPermission,
);

// Role routes
router.get(
  "/roles",
  protect,
  checkAnyPermission(["view_roles", "view_user_count"]),
  scopeQuery({}, false),
  getAllRoles,
);
router.get(
  "/roles/:id",
  protect,
  checkPermission("view_roles"),
  scopeQuery({}, false),
  getRoleById,
);
router.post(
  "/roles",
  protect,
  checkPermission("create_roles"),
  scopeQuery({}, false),
  createRole,
);
router.put(
  "/roles/:id",
  protect,
  checkPermission("edit_roles"),
  scopeQuery({}, false),
  updateRole,
);
router.delete(
  "/roles/:id",
  protect,
  checkPermission("delete_roles"),
  scopeQuery({}, false),
  deleteRole,
);

// Admin maintenance routes
router.get("/admin/fix-role-index", protect, fixRoleIndex);
router.get("/admin/debug-roles", protect, debugRoles);

module.exports = router;
