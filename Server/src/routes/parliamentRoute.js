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
const { requireGlobalAdmin } = require("../middleware/requireGlobalAdmin");

const router = express.Router();

// Parliaments are GLOBAL MASTER DATA — readable by all authenticated users,
// but only Global Admins (superadmin / system_admin) may write to them.
router
  .route("/")
  .get(protect, checkPermission("view_parliaments"), getParliaments)
  .post(
    protect,
    requireGlobalAdmin,
    checkPermission("create_parliaments"),
    createParliament,
  );

router
  .route("/:id")
  .get(protect, checkPermission("view_parliaments"), getParliamentById)
  .put(
    protect,
    requireGlobalAdmin,
    checkPermission("edit_parliaments"),
    updateParliament,
  )
  .delete(
    protect,
    requireGlobalAdmin,
    checkPermission("delete_parliaments"),
    deleteParliament,
  );

module.exports = router;
