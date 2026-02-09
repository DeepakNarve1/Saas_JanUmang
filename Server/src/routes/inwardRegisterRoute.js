const express = require("express");
const router = express.Router();
const {
  getInwardRegisters,
  getInwardRegister,
  createInwardRegister,
  updateInwardRegister,
  deleteInwardRegister,
} = require("../controller/inwardRegisterController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

router
  .route("/")
  .get(
    protect,
    checkPermission("view_inward_register"),
    scopeQuery(),
    getInwardRegisters,
  )
  .post(
    protect,
    checkPermission("create_inward_register"),
    createInwardRegister,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_inward_register"),
    scopeQuery(),
    getInwardRegister,
  )
  .put(protect, checkPermission("edit_inward_register"), updateInwardRegister)
  .delete(
    protect,
    checkPermission("delete_inward_register"),
    deleteInwardRegister,
  );

module.exports = router;
