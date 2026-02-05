const express = require("express");
const {
  getAssemblies,
  getAssemblyById,
  createAssembly,
  updateAssembly,
  deleteAssembly,
} = require("../controller/assemblyController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_assemblies"), getAssemblies)
  .post(protect, checkPermission("create_assemblies"), createAssembly);

router
  .route("/:id")
  .get(protect, checkPermission("view_assemblies"), getAssemblyById)
  .put(protect, checkPermission("edit_assemblies"), updateAssembly)
  .delete(protect, checkPermission("delete_assemblies"), deleteAssembly);

module.exports = router;
