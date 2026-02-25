const express = require("express");
const router = express.Router();
const {
  getInDocs,
  createInDocs,
  getInDocsById,
  updateInDocs,
  deleteInDocs,
} = require("../controller/inDocsController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

// Routes for In Docs
router
  .route("/")
  .get(
    protect,
    checkModuleAccess("in_docs"),
    checkPermission("view_in_docs"),
    scopeQuery(),
    getInDocs,
  )
  .post(
    protect,
    checkModuleAccess("in_docs"),
    checkPermission("create_in_docs"),
    createInDocs,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("in_docs"),
    checkPermission("view_in_docs"),
    scopeQuery(),
    getInDocsById,
  )
  .put(
    protect,
    checkModuleAccess("in_docs"),
    checkPermission("edit_in_docs"),
    updateInDocs,
  )
  .delete(
    protect,
    checkModuleAccess("in_docs"),
    checkPermission("delete_in_docs"),
    deleteInDocs,
  );

module.exports = router;
