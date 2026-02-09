const express = require("express");
const router = express.Router();
const partyController = require("../controller/partyController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

// Routes for generic Party
router
  .route("/")
  .get(
    protect,
    checkPermission("view_party"),
    scopeQuery(),
    partyController.getAll,
  )
  .post(protect, checkPermission("create_party"), partyController.create);

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_party"),
    scopeQuery(),
    partyController.getById,
  )
  .put(protect, checkPermission("edit_party"), partyController.update)
  .delete(protect, checkPermission("delete_party"), partyController.delete);

module.exports = router;
