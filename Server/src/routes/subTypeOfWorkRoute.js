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
    checkPermission("view_sub_type_of_work"),
    scopeQuery(),
    getSubTypeOfWorks,
  )
  .post(
    protect,
    checkPermission("create_sub_type_of_work"),
    createSubTypeOfWork,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_sub_type_of_work"),
    scopeQuery(),
    getSubTypeOfWorkById,
  )
  .put(protect, checkPermission("edit_sub_type_of_work"), updateSubTypeOfWork)
  .delete(
    protect,
    checkPermission("delete_sub_type_of_work"),
    deleteSubTypeOfWork,
  );

module.exports = router;
