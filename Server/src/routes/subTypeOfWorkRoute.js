const express = require("express");
const router = express.Router();
const {
  getSubTypeOfWorks,
  createSubTypeOfWork,
  getSubTypeOfWorkById,
  updateSubTypeOfWork,
  deleteSubTypeOfWork,
} = require("../controller/subTypeOfWorkController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Routes for Sub Type Of Work
router
  .route("/")
  .get(
    protect,
    checkPermission("view_sub_work_types"),
    scopeQuery({}, false),
    getSubTypeOfWorks,
  )
  .post(protect, checkPermission("create_sub_work_types"), createSubTypeOfWork);

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_sub_work_types"),
    scopeQuery({}, false),
    getSubTypeOfWorkById,
  )
  .put(protect, checkPermission("edit_sub_work_types"), updateSubTypeOfWork)
  .delete(
    protect,
    checkPermission("delete_sub_work_types"),
    deleteSubTypeOfWork,
  );

module.exports = router;
