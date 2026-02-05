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

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_projects"), getProjects)
  .post(protect, checkPermission("create_projects"), createProject);
router
  .route("/seed")
  .post(protect, checkPermission("create_projects"), seedProjects);
router
  .route("/:id")
  .get(protect, checkPermission("view_projects"), getProjectById)
  .put(protect, checkPermission("edit_projects"), updateProject)
  .delete(protect, checkPermission("delete_projects"), deleteProject);

module.exports = router;
