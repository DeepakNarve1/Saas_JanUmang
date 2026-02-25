const express = require("express");
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require("../controller/memberController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    checkModuleAccess("members"),
    checkPermission("view_members"),
    scopeQuery(),
    getMembers,
  )
  .post(
    protect,
    checkModuleAccess("members"),
    checkPermission("create_members"),
    createMember,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("members"),
    checkPermission("view_members"),
    scopeQuery(),
    getMemberById,
  )
  .put(
    protect,
    checkModuleAccess("members"),
    checkPermission("edit_members"),
    updateMember,
  )
  .delete(
    protect,
    checkModuleAccess("members"),
    checkPermission("delete_members"),
    deleteMember,
  );

module.exports = router;
