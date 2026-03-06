const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  syncAllEvents,
} = require("../controller/eventController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");
const { checkModuleAccess } = require("../middleware/moduleAccessMiddleware");

const router = express.Router();

router.post(
  "/sync",
  protect,
  checkModuleAccess("events"),
  checkPermission("edit_events"),
  syncAllEvents,
);

router
  .route("/")
  .get(
    protect,
    checkModuleAccess("events"),
    checkPermission("view_events"),
    scopeQuery(),
    getEvents,
  )
  .post(
    protect,
    checkModuleAccess("events"),
    checkPermission("create_events"),
    createEvent,
  );

router
  .route("/:id")
  .get(
    protect,
    checkModuleAccess("events"),
    checkPermission("view_events"),
    scopeQuery(),
    getEventById,
  )
  .put(
    protect,
    checkModuleAccess("events"),
    checkPermission("edit_events"),
    updateEvent,
  )
  .delete(
    protect,
    checkModuleAccess("events"),
    checkPermission("delete_events"),
    deleteEvent,
  );

module.exports = router;
