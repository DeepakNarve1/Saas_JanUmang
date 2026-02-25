const express = require("express");
const {
  getAssemblyIssues,
  getAssemblyIssueById,
  createAssemblyIssue,
  updateAssemblyIssue,
  deleteAssemblyIssue,
  cleanupDuplicates,
  seedAssemblyIssues,
} = require("../controller/assemblyIssueController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("view_assembly_issues"),
    scopeQuery(),
    getAssemblyIssues,
  )
  .post(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("create_assembly_issues"),
    createAssemblyIssue,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("view_assembly_issues"),
    scopeQuery(),
    getAssemblyIssueById,
  )
  .put(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("edit_assembly_issues"),
    updateAssemblyIssue,
  )
  .delete(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("delete_assembly_issues"),
    deleteAssemblyIssue,
  );

module.exports = router;
