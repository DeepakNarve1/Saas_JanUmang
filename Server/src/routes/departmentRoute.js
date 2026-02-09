const express = require("express");
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controller/departmentController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Routes for Department
router
  .route("/")
  .get(
    protect,
    checkPermission("view_department"),
    scopeQuery(),
    getDepartments,
  )
  .post(protect, checkPermission("create_department"), createDepartment);

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_department"),
    scopeQuery(),
    getDepartmentById,
  )
  .put(protect, checkPermission("edit_department"), updateDepartment)
  .delete(protect, checkPermission("delete_department"), deleteDepartment);

module.exports = router;
