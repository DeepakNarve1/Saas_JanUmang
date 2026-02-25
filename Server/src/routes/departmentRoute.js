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
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

// Routes for Department
router
  .route("/")
  .get(
    protect,
    checkModuleAccess("departments"),
    checkPermission("view_departments"),
    scopeQuery({}, false),
    getDepartments,
  )
  .post(
    protect,
    checkModuleAccess("departments"),
    checkPermission("create_departments"),
    createDepartment,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("departments"),
    checkPermission("view_departments"),
    scopeQuery({}, false),
    getDepartmentById,
  )
  .put(
    protect,
    checkModuleAccess("departments"),
    checkPermission("edit_departments"),
    updateDepartment,
  )
  .delete(
    protect,
    checkModuleAccess("departments"),
    checkPermission("delete_departments"),
    deleteDepartment,
  );

module.exports = router;
