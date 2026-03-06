const express = require("express");
const {
  getPanchayats,
  getPanchayatById,
  createPanchayat,
  updatePanchayat,
  deletePanchayat,
} = require("../controller/panchayatController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const router = express.Router();

// Panchayat — tenant-isolated via scopeQuery({}, false)
router
  .route("/")
  .get(
    protect,
    checkPermission("view_panchayats"),
    scopeQuery({}, false),
    getPanchayats,
  )
  .post(
    protect,
    checkPermission("create_panchayats"),
    scopeQuery({}, false),
    createPanchayat,
  );

router
  .route("/:id")
  .get(
    protect,
    checkPermission("view_panchayats"),
    scopeQuery({}, false),
    getPanchayatById,
  )
  .put(
    protect,
    checkPermission("edit_panchayats"),
    scopeQuery({}, false),
    updatePanchayat,
  )
  .delete(
    protect,
    checkPermission("delete_panchayats"),
    scopeQuery({}, false),
    deletePanchayat,
  );

module.exports = router;
