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
} = require("../controller/tenantController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

// All routes are protected and restricted to system_admin
router.use(protect);
router.use(checkPermission("manage_tenants"));

router.route("/").get(getTenants).post(createTenant);
router.get("/stats", getTenantStats);

router.get("/:id/users", getTenantUsers);
router.post("/:id/admins", createTenantAdmin);
router.delete("/:id/admins/:userId", deleteTenantAdmin);
router.route("/:id").get(getTenant).put(updateTenant).delete(deleteTenant);

module.exports = router;
