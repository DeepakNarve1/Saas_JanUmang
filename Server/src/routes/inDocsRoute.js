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

// Routes for In Docs
router
  .route("/")
  .get(protect, checkPermission("view_in_docs"), scopeQuery(), getInDocs)
  .post(protect, checkPermission("create_in_docs"), createInDocs);

router
  .route("/:id")
  .get(protect, checkPermission("view_in_docs"), scopeQuery(), getInDocsById)
  .put(protect, checkPermission("edit_in_docs"), updateInDocs)
  .delete(protect, checkPermission("delete_in_docs"), deleteInDocs);

module.exports = router;
