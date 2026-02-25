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
  .get(
    protect,
    checkPermission("view_work_types"),
    scopeQuery({}, false),
    getWorktypes,
  )
  .post(protect, checkPermission("create_work_types"), createWorktype);

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_work_types"),
    scopeQuery({}, false),
    getWorktypeById,
  )
  .put(protect, checkPermission("edit_work_types"), updateWorktype)
  .delete(protect, checkPermission("delete_work_types"), deleteWorktype);

module.exports = router;
