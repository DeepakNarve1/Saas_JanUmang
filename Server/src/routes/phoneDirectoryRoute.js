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

// Routes for Phone Directory
router
  .route("/")
  .get(protect, checkPermission("view_phone_directory"), getPhoneDirectories)
  .post(
    protect,
    checkPermission("create_phone_directory"),
    createPhoneDirectory
  );

router
  .route("/:id")
  .get(protect, checkPermission("view_phone_directory"), getPhoneDirectoryById)
  .put(protect, checkPermission("edit_phone_directory"), updatePhoneDirectory)
  .delete(
    protect,
    checkPermission("delete_phone_directory"),
    deletePhoneDirectory
  );

module.exports = router;
