const express = require("express");
const {
  getPanchayats,
  getPanchayatById,
  createPanchayat,
  updatePanchayat,
  deletePanchayat,
} = require("../controller/panchayatController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_panchayats"), getPanchayats)
  .post(protect, checkPermission("create_panchayats"), createPanchayat);

router
  .route("/:id")
  .get(protect, checkPermission("view_panchayats"), getPanchayatById)
  .put(protect, checkPermission("edit_panchayats"), updatePanchayat)
  .delete(protect, checkPermission("delete_panchayats"), deletePanchayat);

module.exports = router;
