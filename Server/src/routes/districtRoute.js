const express = require("express");
const {
  getDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require("../controller/districtController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_districts"), getDistricts)
  .post(protect, checkPermission("create_districts"), createDistrict);

router
  .route("/:id")
  .get(protect, checkPermission("view_districts"), getDistrictById)
  .put(protect, checkPermission("edit_districts"), updateDistrict)
  .delete(protect, checkPermission("delete_districts"), deleteDistrict);

module.exports = router;
