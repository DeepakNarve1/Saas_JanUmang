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

// Assembly Issues — tenant-isolated on all verbs.
// scopeQuery({}, false) = tenant scope only, no geographic sub-scoping.
// Assembly issues are tenant-level data, not geographically sub-scoped.
router
  .route("/")
  .get(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("view_assembly_issues"),
    scopeQuery({}, false),
    getAssemblyIssues,
  )
  .post(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("create_assembly_issues"),
    scopeQuery({}, false),
    createAssemblyIssue,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("view_assembly_issues"),
    scopeQuery({}, false),
    getAssemblyIssueById,
  )
  .put(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("edit_assembly_issues"),
    scopeQuery({}, false),
    updateAssemblyIssue,
  )
  .delete(
    protect,
    checkModuleAccess("assembly_issues"),
    checkPermission("delete_assembly_issues"),
    scopeQuery({}, false),
    deleteAssemblyIssue,
  );

module.exports = router;
