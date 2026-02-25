const express = require("express");
const {
  getVoters,
  getVoterById,
  createVoter,
  updateVoter,
  deleteVoter,
} = require("../controller/voterController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_voters"), scopeQuery(), getVoters)
  .post(protect, checkPermission("create_voters"), createVoter);

router
  .route("/:id")
  .get(protect, checkPermission("view_voters"), getVoterById)
  .put(protect, checkPermission("edit_voters"), updateVoter)
  .delete(protect, checkPermission("delete_voters"), deleteVoter);

module.exports = router;
