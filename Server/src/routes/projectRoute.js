const express = require("express");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  seedProjects,
} = require("../controller/projectController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    checkModuleAccess("projects"),
    checkPermission("view_projects"),
    scopeQuery(),
    getProjects,
  )
  .post(
    protect,
    checkModuleAccess("projects"),
    checkPermission("create_projects"),
    createProject,
  );
router
  .route("/seed")
  .post(
    protect,
    checkModuleAccess("projects"),
    checkPermission("create_projects"),
    seedProjects,
  );
router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("projects"),
    checkPermission("view_projects"),
    scopeQuery(),
    getProjectById,
  )
  .put(
    protect,
    checkModuleAccess("projects"),
    checkPermission("edit_projects"),
    updateProject,
  )
  .delete(
    protect,
    checkModuleAccess("projects"),
    checkPermission("delete_projects"),
    deleteProject,
  );

module.exports = router;
