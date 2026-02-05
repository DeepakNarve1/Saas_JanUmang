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

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_panchayat"), getPanchayats)
  .post(protect, checkPermission("create_panchayat"), createPanchayat);

router
  .route("/:id")
  .get(protect, checkPermission("view_panchayat"), getPanchayatById)
  .put(protect, checkPermission("edit_panchayat"), updatePanchayat)
  .delete(protect, checkPermission("delete_panchayat"), deletePanchayat);

module.exports = router;
