const express = require("express");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const {
  getCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
} = require("../controller/callManagementController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router
  .route("/")
  .get(checkPermission("view_call_management"), scopeQuery(), getCalls)
  .post(checkPermission("create_call_management"), createCall);

router
  .route("/:id")
  .get(checkPermission("view_call_management"), scopeQuery(), getCall)
  .put(checkPermission("edit_call_management"), updateCall)
  .delete(checkPermission("delete_call_management"), deleteCall);

module.exports = router;
