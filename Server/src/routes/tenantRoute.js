const express = require("express");
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
} = require("../controller/tenantController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

// All routes are protected and restricted to system_admin
router.use(protect);
router.use(checkPermission("manage_tenants"));

router.route("/").get(getTenants).post(createTenant);

router.route("/:id").get(getTenant).put(updateTenant).delete(deleteTenant);

module.exports = router;
