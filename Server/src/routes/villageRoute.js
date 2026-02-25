const express = require("express");
const {
  getVillages,
  getVillageById,
  createVillage,
  updateVillage,
  deleteVillage,
} = require("../controller/villageController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_villages"), getVillages)
  .post(protect, checkPermission("create_villages"), createVillage);

router
  .route("/:id")
  .get(protect, checkPermission("view_villages"), getVillageById)
  .put(protect, checkPermission("edit_villages"), updateVillage)
  .delete(protect, checkPermission("delete_villages"), deleteVillage);

module.exports = router;
