const express = require("express");
const {
  getStates,
  getStateById,
  createState,
  updateState,
  deleteState,
} = require("../controller/stateController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_states"), getStates)
  .post(protect, checkPermission("create_states"), createState);

router
  .route("/:id")
  .get(protect, checkPermission("view_states"), getStateById)
  .put(protect, checkPermission("edit_states"), updateState)
  .delete(protect, checkPermission("delete_states"), deleteState);

module.exports = router;
