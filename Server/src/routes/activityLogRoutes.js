const express = require("express");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const {
  getLogs,
  getActivityReport,
  getFilters,
  getLogById,
} = require("../controller/activityLogController");

const router = express.Router();

router.use(protect);

router.route("/").get(checkPermission("view_activity_logs"), getLogs);

router
  .route("/report")
  .get(checkPermission("view_user_activity_report"), getActivityReport);

router.route("/filters").get(checkPermission("view_activity_logs"), getFilters);

router.route("/:id").get(checkPermission("view_activity_logs"), getLogById);

module.exports = router;
