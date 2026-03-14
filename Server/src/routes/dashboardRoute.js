const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDepartmentSummary,
  getBlockSummary,
  getChartData,
  getMemberDistrictSummary,
  getMpDepartmentSummary,
  getMpBlockSummary,
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

// @route   GET /api/dashboard/member-district-summary
// @desc    Get member district summary with code counts
// @access  Private (requires view_dashboard permission)
router.get(
  "/member-district-summary",
  checkPermission("view_dashboard"),
  getMemberDistrictSummary,
);

// @route   GET /api/dashboard/mp-department-summary
// @desc    Get MP public problems department summary
// @access  Private (requires view_dashboard permission)
router.get(
  "/mp-department-summary",
  checkPermission("view_dashboard"),
  getMpDepartmentSummary,
);

// @route   GET /api/dashboard/mp-block-summary
// @desc    Get MP public problems block (area) summary
// @access  Private (requires view_dashboard permission)
router.get(
  "/mp-block-summary",
  checkPermission("view_dashboard"),
  getMpBlockSummary,
);

module.exports = router;
