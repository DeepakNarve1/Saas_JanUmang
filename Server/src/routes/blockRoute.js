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
const { scopeQuery } = require("../middleware/scopeMiddleware");

const router = express.Router();

// Block — tenant-isolated: scopeQuery({}, false) = tenant scope only, no geographic sub-scoping
router
  .route("/")
  .get(
    protect,
    checkPermission("view_blocks"),
    scopeQuery({}, false),
    getBlocks,
  )
  .post(
    protect,
    checkPermission("create_blocks"),
    scopeQuery({}, false),
    createBlock,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_blocks"),
    scopeQuery({}, false),
    getBlockById,
  )
  .put(
    protect,
    checkPermission("edit_blocks"),
    scopeQuery({}, false),
    updateBlock,
  )
  .delete(
    protect,
    checkPermission("delete_blocks"),
    scopeQuery({}, false),
    deleteBlock,
  );

module.exports = router;
