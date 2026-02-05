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

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(checkPermission("view_visitors"), getVisitors)
  .post(checkPermission("create_visitors"), createVisitor);

router
  .route("/:id")
  .get(checkPermission("view_visitors"), getVisitorById)
  .put(checkPermission("edit_visitors"), updateVisitor)
  .delete(checkPermission("delete_visitors"), deleteVisitor);

module.exports = router;
