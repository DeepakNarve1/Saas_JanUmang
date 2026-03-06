const express = require("express");
const router = express.Router();
const {
  getPhoneDirectories,
  createPhoneDirectory,
  getPhoneDirectoryById,
  updatePhoneDirectory,
  deletePhoneDirectory,
} = require("../controller/phoneDirectoryController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Phone Directory — tenant-isolated: all routes go through scopeQuery()
// scopeQuery({}, false) = tenant isolation only, no geographic sub-scoping
router
  .route("/")
  .get(
    protect,
    checkPermission("view_phone_directory"),
    scopeQuery({}, false),
    getPhoneDirectories,
  )
  .post(
    protect,
    checkPermission("create_phone_directory"),
    createPhoneDirectory,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_phone_directory"),
    scopeQuery({}, false),
    getPhoneDirectoryById,
  )
  .put(
    protect,
    checkPermission("edit_phone_directory"),
    scopeQuery({}, false),
    updatePhoneDirectory,
  )
  .delete(
    protect,
    checkPermission("delete_phone_directory"),
    scopeQuery({}, false),
    deletePhoneDirectory,
  );

module.exports = router;
