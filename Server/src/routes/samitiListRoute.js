const express = require("express");
const router = express.Router();
const samitiListController = require("../controller/samitiListController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Routes for generic Samiti
router
  .route("/")
  .get(
    protect,
    checkPermission("view_samiti"),
    scopeQuery({}, false),
    samitiListController.getAll,
  )
  .post(protect, checkPermission("create_samiti"), samitiListController.create);

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_samiti"),
    scopeQuery({}, false),
    samitiListController.getById,
  )
  .put(protect, checkPermission("edit_samiti"), samitiListController.update)
  .delete(
    protect,
    checkPermission("delete_samiti"),
    samitiListController.delete,
  );

module.exports = router;
