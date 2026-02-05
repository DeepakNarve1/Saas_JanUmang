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
  .get(protect, checkPermission("view_voter"), scopeQuery(), getVoters)
  .post(protect, checkPermission("create_voter"), createVoter);

router
  .route("/:id")
  .get(protect, checkPermission("view_voter"), getVoterById)
  .put(protect, checkPermission("edit_voter"), updateVoter)
  .delete(protect, checkPermission("delete_voter"), deleteVoter);

module.exports = router;
