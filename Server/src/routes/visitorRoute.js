const express = require("express");
const router = express.Router();
const {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
} = require("../controller/visitorController");
const { checkPermission } = require("../middleware/permissionMiddleware");
const protect = require("../middleware/authMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

// All routes are protected
router.use(protect);
router.use(checkModuleAccess("visitors"));

router
  .route("/")
  .get(checkPermission("view_visitors"), scopeQuery(), getVisitors)
  .post(checkPermission("create_visitors"), createVisitor);

router
  .route("/:id")
  .get(checkPermission("view_visitors"), scopeQuery(), getVisitorById)
  .put(checkPermission("edit_visitors"), updateVisitor)
  .delete(checkPermission("delete_visitors"), deleteVisitor);

module.exports = router;
