const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  seedEvents,
  syncAllEvents,
} = require("../controller/eventController");
const protect = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const { scopeQuery } = require("../middleware/scopeMiddleware");

const router = express.Router();
console.log("Event routes initialized");

router.post(
  "/sync",
  (req, res, next) => {
    console.log("Sync route hit");
    next();
  },
  protect,
  checkPermission("edit_events"),
  syncAllEvents,
);

router
  .route("/")
  .get(protect, checkPermission("view_events"), scopeQuery(), getEvents)
  .post(protect, checkPermission("create_events"), createEvent);

router
  .route("/:id")
  .get(protect, checkPermission("view_events"), scopeQuery(), getEventById)
  .put(protect, checkPermission("edit_events"), updateEvent)
  .delete(protect, checkPermission("delete_events"), deleteEvent);

module.exports = router;
