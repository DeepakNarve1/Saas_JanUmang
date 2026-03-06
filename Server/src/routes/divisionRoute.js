const express = require("express");
const {
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
} = require("../controller/divisionController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { requireGlobalAdmin } = require("../middleware/requireGlobalAdmin");

const router = express.Router();

// Divisions are GLOBAL MASTER DATA — readable by all authenticated users,
// but only Global Admins (superadmin / system_admin) may write to them.
// Do NOT apply scopeQuery() middleware to these routes.
router
  .route("/")
  .get(protect, checkPermission("view_divisions"), getDivisions)
  .post(
    protect,
    requireGlobalAdmin,
    checkPermission("create_divisions"),
    createDivision,
  );

router
  .route("/:id")
  .get(protect, checkPermission("view_divisions"), getDivisionById)
  .put(
    protect,
    requireGlobalAdmin,
    checkPermission("edit_divisions"),
    updateDivision,
  )
  .delete(
    protect,
    requireGlobalAdmin,
    checkPermission("delete_divisions"),
    deleteDivision,
  );

module.exports = router;
