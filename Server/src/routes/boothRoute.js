const express = require("express");
const {
  getBooths,
  getBoothById,
  createBooth,
  updateBooth,
  deleteBooth,
} = require("../controller/boothController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const router = express.Router();

// Booth — tenant-isolated via scopeQuery({}, false)
router
  .route("/")
  .get(
    protect,
    checkPermission("view_booths"),
    scopeQuery({}, false),
    getBooths,
  )
  .post(
    protect,
    checkPermission("create_booths"),
    scopeQuery({}, false),
    createBooth,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_booths"),
    scopeQuery({}, false),
    getBoothById,
  )
  .put(
    protect,
    checkPermission("edit_booths"),
    scopeQuery({}, false),
    updateBooth,
  )
  .delete(
    protect,
    checkPermission("delete_booths"),
    scopeQuery({}, false),
    deleteBooth,
  );

module.exports = router;
