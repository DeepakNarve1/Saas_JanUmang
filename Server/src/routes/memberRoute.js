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

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_members"), scopeQuery(), getMembers)
  .post(protect, checkPermission("create_members"), createMember);

router
  .route("/:id")
  .get(protect, checkPermission("view_members"), scopeQuery(), getMemberById)
  .put(protect, checkPermission("edit_members"), updateMember)
  .delete(protect, checkPermission("delete_members"), deleteMember);

module.exports = router;
