const express = require("express");
const router = express.Router();
const samitiController = require("../controller/samitiController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// Permissions need to be mapped.
// "ganesh-samiti" -> "view_ganesh_samiti"
// Helper function to get permission name from samiti type (req.samitiType is available here? No, router is defined once)
// We need to use permission middleware that knows about the dynamic resource type OR use generic "manage_samiti" permissions?
// The user's menu shows: resource: "ganesh_samiti".
// So let's build dynamic permission checker?
// Or just let the controller handle it? No, middleware is better.

// Since 'protect' and 'checkPermission' are standard, we need to pass the specific permission string.
// But this router is reused. So we can't hardcode the permission string in 'checkPermission("...")'.
// We need a wrapper.

const dynamicPermission = (action) => {
  return (req, res, next) => {
    // req.samitiType is like "ganesh-samiti"
    // resource should be "ganesh_samiti"
    if (!req.samitiType) return next(new Error("Samiti Type not defined"));
    const resource = req.samitiType.replace(/-/g, "_");
    const permission = `${action}_${resource}`;
    return checkPermission(permission)(req, res, next);
  };
};

router
  .route("/")
  .get(protect, dynamicPermission("view"), samitiController.getAll)
  .post(protect, dynamicPermission("create"), samitiController.create);

router
  .route("/:id")
  .get(protect, dynamicPermission("view"), samitiController.getById)
  .put(protect, dynamicPermission("edit"), samitiController.update)
  .delete(protect, dynamicPermission("delete"), samitiController.delete);

module.exports = router;
