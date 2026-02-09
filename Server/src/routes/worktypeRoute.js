const express = require("express");
const router = express.Router();
const {
  getWorktypes,
  createWorktype,
  getWorktypeById,
  updateWorktype,
  deleteWorktype,
} = require("../controller/worktypeController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Routes for Worktype
router
  .route("/")
  .get(protect, checkPermission("view_worktype"), scopeQuery(), getWorktypes)
  .post(protect, checkPermission("create_worktype"), createWorktype);

router
  .route("/:id")
  .get(protect, checkPermission("view_worktype"), scopeQuery(), getWorktypeById)
  .put(protect, checkPermission("edit_worktype"), updateWorktype)
  .delete(protect, checkPermission("delete_worktype"), deleteWorktype);

module.exports = router;
