const express = require("express");
const {
  getTenants,
  getTenant,
  getTenantStats,
  getTenantUsers,
  createTenant,
  updateTenant,
  deleteTenant,
  createTenantAdmin,
  deleteTenantAdmin,
  getAvailableModules,
  getAvailablePlans,
  updateTenantModules,
  getTenantModules,
  getMyTenant,
} = require("../controller/tenantController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

// Basic protection
router.use(protect);
router.get("/me", getMyTenant);

// Restricted to those who can manage tenants
router.use(checkPermission("manage_tenants"));

router.route("/").get(getTenants).post(createTenant);
router.get("/stats", getTenantStats);

// Module and Plan Management
router.get("/modules", getAvailableModules);
router.get("/plans", getAvailablePlans);

router.get("/:id/users", getTenantUsers);
router.post("/:id/admins", createTenantAdmin);
router.delete("/:id/admins/:userId", deleteTenantAdmin);

// Tenant Module Management
router.get("/:id/modules", getTenantModules);
router.put("/:id/modules", updateTenantModules);

router.route("/:id").get(getTenant).put(updateTenant).delete(deleteTenant);

module.exports = router;
