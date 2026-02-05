const express = require("express");
const {
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
} = require("../controller/divisionController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_divisions"), getDivisions)
  .post(protect, checkPermission("create_divisions"), createDivision);

router
  .route("/:id")
  .get(protect, checkPermission("view_divisions"), getDivisionById)
  .put(protect, checkPermission("edit_divisions"), updateDivision)
  .delete(protect, checkPermission("delete_divisions"), deleteDivision);

module.exports = router;
