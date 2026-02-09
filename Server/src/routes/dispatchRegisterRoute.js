const express = require("express");
const router = express.Router();
const {
  getDispatchRegisters,
  getDispatchRegister,
  createDispatchRegister,
  updateDispatchRegister,
  deleteDispatchRegister,
} = require("../controller/dispatchRegisterController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

router
  .route("/")
  .get(
    protect,
    checkPermission("view_dispatch_register"),
    scopeQuery(),
    getDispatchRegisters,
  )
  .post(
    protect,
    checkPermission("create_dispatch_register"),
    createDispatchRegister,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_dispatch_register"),
    scopeQuery(),
    getDispatchRegister,
  )
  .put(
    protect,
    checkPermission("edit_dispatch_register"),
    updateDispatchRegister,
  )
  .delete(
    protect,
    checkPermission("delete_dispatch_register"),
    deleteDispatchRegister,
  );

module.exports = router;
