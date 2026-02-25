const express = require("express");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const {
  getLogs,
  getActivityReport,
  getFilters,
  getLogById,
} = require("../controller/activityLogController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(checkPermission("view_activity_logs"), scopeQuery({}, false), getLogs);

router
  .route("/report")
  .get(
    checkPermission("view_user_activity_report"),
    scopeQuery({}, false),
    getActivityReport,
  );

router.route("/filters").get(checkPermission("view_activity_logs"), getFilters);

router
  .route("/:id")
  .get(
    checkPermission("view_activity_logs"),
    scopeQuery({}, false),
    getLogById,
  );

module.exports = router;
