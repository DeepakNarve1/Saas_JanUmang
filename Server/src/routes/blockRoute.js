const express = require("express");
const {
  getBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
} = require("../controller/blockController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_blocks"), getBlocks)
  .post(protect, checkPermission("create_blocks"), createBlock);

router
  .route("/:id")
  .get(protect, checkPermission("view_blocks"), getBlockById)
  .put(protect, checkPermission("edit_blocks"), updateBlock)
  .delete(protect, checkPermission("delete_blocks"), deleteBlock);

module.exports = router;
