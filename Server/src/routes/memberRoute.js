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

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_members"), getMembers)
  .post(protect, checkPermission("create_members"), createMember);

router
  .route("/:id")
  .get(protect, checkPermission("view_members"), getMemberById)
  .put(protect, checkPermission("edit_members"), updateMember)
  .delete(protect, checkPermission("delete_members"), deleteMember);

module.exports = router;
