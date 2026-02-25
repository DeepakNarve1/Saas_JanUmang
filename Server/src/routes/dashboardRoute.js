const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDepartmentSummary,
  getBlockSummary,
  getChartData,
  getMemberBlockSummary,
} = require("../controller/dashboardController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// All routes require authentication
router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Get aggregated dashboard statistics
// @access  Private (requires view_dashboard permission)
router.get("/stats", checkPermission("view_dashboard"), getDashboardStats);

// @route   GET /api/dashboard/department-summary
// @desc    Get department summary with problem counts
// @access  Private (requires view_dashboard permission)
router.get(
  "/department-summary",
  checkPermission("view_dashboard"),
  getDepartmentSummary,
);

// @route   GET /api/dashboard/block-summary
// @desc    Get block summary with problem counts
// @access  Private (requires view_dashboard permission)
router.get(
  "/block-summary",
  checkPermission("view_dashboard"),
  getBlockSummary,
);

// @route   GET /api/dashboard/charts
// @desc    Get chart data for dashboard visualizations
// @access  Private (requires view_dashboard permission)
router.get("/charts", checkPermission("view_dashboard"), getChartData);

// @route   GET /api/dashboard/member-block-summary
// @desc    Get member block summary with code counts
// @access  Private (requires view_dashboard permission)
router.get(
  "/member-block-summary",
  checkPermission("view_dashboard"),
  getMemberBlockSummary,
);

module.exports = router;
