const express = require("express");
const {
  getStates,
  getStateById,
  createState,
  updateState,
  deleteState,
} = require("../controller/stateController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { requireGlobalAdmin } = require("../middleware/requireGlobalAdmin");

const router = express.Router();

// States are GLOBAL MASTER DATA — readable by all authenticated users,
// but only Global Admins (superadmin / system_admin) may write to them.
router
  .route("/")
  .get(protect, checkPermission("view_states"), getStates)
  .post(
    protect,
    requireGlobalAdmin,
    checkPermission("create_states"),
    createState,
  );

router
  .route("/:id")
  .get(protect, checkPermission("view_states"), getStateById)
  .put(protect, requireGlobalAdmin, checkPermission("edit_states"), updateState)
  .delete(
    protect,
    requireGlobalAdmin,
    checkPermission("delete_states"),
    deleteState,
  );

module.exports = router;
