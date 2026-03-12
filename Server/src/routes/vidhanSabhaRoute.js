const express = require("express");
const router = express.Router();
const vidhanSabhaController = require("../controller/vidhanSabhaController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Routes for Vidhan Sabha
router
  .route("/")
  .get(
    protect,
    // checkPermission("view_assemblies"), // Allowed for all authenticated users to populate dropdowns
    scopeQuery({}, false),
    vidhanSabhaController.getAll,
  )
  .post(
    protect,
    checkPermission("create_assemblies"),
    vidhanSabhaController.create,
  );

router
  .route("/:id")
  .get(
    protect,
    // checkPermission("view_assemblies"), // Allowed for all authenticated users to populate dropdowns
    scopeQuery({}, false),
    vidhanSabhaController.getById,
  )
  .put(
    protect,
    checkPermission("edit_assemblies"),
    vidhanSabhaController.update,
  )
  .delete(
    protect,
    checkPermission("delete_assemblies"),
    vidhanSabhaController.delete,
  );

module.exports = router;
