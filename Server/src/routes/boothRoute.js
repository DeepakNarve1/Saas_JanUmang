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

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_booths"), getBooths)
  .post(protect, checkPermission("create_booths"), createBooth);

router
  .route("/:id")
  .get(protect, checkPermission("view_booths"), getBoothById)
  .put(protect, checkPermission("edit_booths"), updateBooth)
  .delete(protect, checkPermission("delete_booths"), deleteBooth);

module.exports = router;
