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
    checkPermission("view_parties"),
    scopeQuery({}, false),
    partyController.getAll,
  )
  .post(protect, checkPermission("create_parties"), partyController.create);

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_parties"),
    scopeQuery({}, false),
    partyController.getById,
  )
  .put(protect, checkPermission("edit_parties"), partyController.update)
  .delete(protect, checkPermission("delete_parties"), partyController.delete);

module.exports = router;
