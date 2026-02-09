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
    checkPermission("view_vidhan_sabha"),
    scopeQuery(),
    vidhanSabhaController.getAll,
  )
  .post(
    protect,
    checkPermission("create_vidhan_sabha"),
    vidhanSabhaController.create,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_vidhan_sabha"),
    scopeQuery(),
    vidhanSabhaController.getById,
  )
  .put(
    protect,
    checkPermission("edit_vidhan_sabha"),
    vidhanSabhaController.update,
  )
  .delete(
    protect,
    checkPermission("delete_vidhan_sabha"),
    vidhanSabhaController.delete,
  );

module.exports = router;
