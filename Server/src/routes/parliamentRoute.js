const express = require("express");
const {
  getParliaments,
  getParliamentById,
  createParliament,
  updateParliament,
  deleteParliament,
} = require("../controller/parliamentController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_parliaments"), getParliaments)
  .post(protect, checkPermission("create_parliaments"), createParliament);

router
  .route("/:id")
  .get(protect, checkPermission("view_parliaments"), getParliamentById)
  .put(protect, checkPermission("edit_parliaments"), updateParliament)
  .delete(protect, checkPermission("delete_parliaments"), deleteParliament);

module.exports = router;
